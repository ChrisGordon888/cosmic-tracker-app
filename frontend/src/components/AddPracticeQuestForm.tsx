"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_RITUALS } from "@/graphql/rituals";
import { ADD_PRACTICE_QUEST, GET_DAILY_QUESTS } from "@/graphql/practiceQuest";
import dayjs from "dayjs";
import "@/styles/addPracticeQuestForm.css";


export default function AddPracticeQuestForm() {
    const { data: session } = useSession();
    const today = dayjs().format("YYYY-MM-DD");

    const { data: ritualsData, loading: ritualsLoading, error: ritualsError } = useQuery(
        ALL_RITUALS,
        { skip: !session }
    );

    const [addQuest, { loading: adding }] = useMutation(ADD_PRACTICE_QUEST, {
        refetchQueries: [{ query: GET_DAILY_QUESTS, variables: { date: today } }],
    });

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [repetitions, setRepetitions] = useState(1);
    const [ritualId, setRitualId] = useState("");
    const [message, setMessage] = useState("");

    const handleAdd = async () => {
        const cleanName = name.trim();
        if (!cleanName) {
            setMessage("❗ Quest name is required before adding!");
            return;
        }
        if (repetitions < 1) {
            const confirmed = confirm(
                "⚠️ Repetitions must be at least 1. Do you want to set it to 1?"
            );
            if (confirmed) {
                setRepetitions(1);
                return;
            } else {
                return;
            }
        }

        try {
            await addQuest({
                variables: {
                    name: cleanName,
                    description,
                    repetitions: Number(repetitions),
                    date: today,
                    ritualId: ritualId !== "" ? ritualId : null,
                },
            });
            setMessage("🎉 Quest added successfully!");
            setName("");
            setDescription("");
            setRepetitions(1);
            setRitualId("");
        } catch (e) {
            console.error("❌ Failed to add quest:", e);
            const duplicate = e?.message?.includes("duplicate key");
            setMessage(
                duplicate
                    ? "⚠️ A quest with this name already exists today!"
                    : "❌ Failed to add quest. Check console for details."
            );
        } finally {
            setTimeout(() => setMessage(""), 4000); // Clear after 4s
        }
    };

    return (
        <section className="add-practice-quest-card">
            <h2>➕ Add Practice Quest</h2>

            {ritualsLoading && <p>Loading rituals...</p>}
            {ritualsError && <p className="text-red-600">Error: {ritualsError.message}</p>}
            {message && (
                <p
                    className={`text-sm font-semibold mb-2 animate-pulse ${message.startsWith("🎉")
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                >
                    {message}
                </p>
            )}

            <input
                type="text"
                placeholder="Quest Name"
                className="w-full p-2 rounded border mb-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <textarea
                placeholder="Description (optional)"
                className="w-full p-2 rounded border mb-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <input
                type="number"
                min={1}
                placeholder="Repetitions"
                className="w-full p-2 rounded border mb-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                value={repetitions}
                onChange={(e) => setRepetitions(Number(e.target.value))}
            />

            <select
                className="w-full p-2 rounded border mb-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                value={ritualId}
                onChange={(e) => setRitualId(e.target.value)}
            >
                <option value="">No Ritual Linked (recommended to link one!)</option>
                {ritualsData?.allRituals?.map((ritual) => (
                    <option key={ritual.id} value={ritual.id}>
                        🔮 {ritual.title}
                    </option>
                ))}
            </select>

            <button
                onClick={handleAdd}
                disabled={adding}
                className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition ${adding ? "opacity-50 cursor-not-allowed" : ""
                    }`}
            >
                {adding ? "Adding..." : "Add Quest"}
            </button>
        </section>
    );
}