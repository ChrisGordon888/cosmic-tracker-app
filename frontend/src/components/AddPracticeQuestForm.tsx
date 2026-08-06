"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import { ADD_PRACTICE_QUEST, GET_DAILY_QUESTS } from "@/graphql/practiceQuest";
import { ALL_RITUALS } from "@/graphql/rituals";
import "@/styles/addPracticeQuestForm.css";

type Ritual = {
    id: string;
    title: string;
};

export default function AddPracticeQuestForm() {
    const { data: session } = useSession();
    const today = dayjs().format("YYYY-MM-DD");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [repetitions, setRepetitions] = useState(1);
    const [ritualId, setRitualId] = useState("");
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    const { data: ritualsData, loading: ritualsLoading } = useQuery(ALL_RITUALS, {
        skip: !session,
    });

    const [addPracticeQuest] = useMutation(ADD_PRACTICE_QUEST, {
        refetchQueries: [
            {
                query: GET_DAILY_QUESTS,
                variables: { date: today },
            },
        ],
        awaitRefetchQueries: true,
    });

    const handleSubmit = async () => {
        const cleanName = name.trim();
        const cleanDescription = description.trim();

        if (!cleanName || repetitions < 1) {
            setStatus("error");
            return;
        }

        setStatus("saving");

        try {
            await addPracticeQuest({
                variables: {
                    name: cleanName,
                    description: cleanDescription || null,
                    repetitions,
                    date: today,
                    ritualId: ritualId || null,
                },
            });

            setName("");
            setDescription("");
            setRepetitions(1);
            setRitualId("");
            setStatus("saved");
            window.setTimeout(() => setStatus("idle"), 2200);
        } catch (error) {
            console.error("Error adding practice:", error);
            setStatus("error");
        }
    };

    const rituals = (ritualsData?.allRituals ?? []) as Ritual[];

    return (
        <section className="add-practice-quest-card" aria-labelledby="add-practice-title">
            <div className="add-practice-header">
                <div>
                    <p className="add-practice-eyebrow">Today&apos;s movement</p>
                    <h2 id="add-practice-title">Add a Practice</h2>
                </div>
                <span>{dayjs(today).format("MMM D")}</span>
            </div>

            <p className="add-practice-intro">
                Turn the intention into one concrete action you can complete today.
            </p>

            <label className="add-practice-field">
                <span>Name</span>
                <input
                    type="text"
                    placeholder="Example: Practice Gayatri mantra"
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        if (status !== "idle") setStatus("idle");
                    }}
                />
            </label>

            <label className="add-practice-field">
                <span>Description</span>
                <textarea
                    placeholder="Add context, timing, or the purpose behind this practice."
                    rows={3}
                    value={description}
                    onChange={(event) => {
                        setDescription(event.target.value);
                        if (status !== "idle") setStatus("idle");
                    }}
                />
            </label>

            <div className="add-practice-grid">
                <label className="add-practice-field">
                    <span>Repetitions</span>
                    <input
                        type="number"
                        min={1}
                        value={repetitions}
                        onChange={(event) => {
                            setRepetitions(Math.max(1, Number(event.target.value) || 1));
                            if (status !== "idle") setStatus("idle");
                        }}
                    />
                </label>

                <label className="add-practice-field">
                    <span>Linked Ritual</span>
                    <select
                        value={ritualId}
                        disabled={ritualsLoading}
                        onChange={(event) => {
                            setRitualId(event.target.value);
                            if (status !== "idle") setStatus("idle");
                        }}
                    >
                        <option value="">
                            {ritualsLoading ? "Loading rituals..." : "No linked ritual"}
                        </option>
                        {rituals.map((ritual) => (
                            <option key={ritual.id} value={ritual.id}>
                                {ritual.title}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="add-practice-footer">
                <p
                    className={`add-practice-status ${status === "error" ? "is-error" : status === "saved" ? "is-success" : ""
                        }`}
                    role={status === "error" ? "alert" : undefined}
                >
                    {status === "saving" && "Adding practice..."}
                    {status === "saved" && "Practice added."}
                    {status === "error" && "Add a name and valid repetition count."}
                </p>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={status === "saving" || !session}
                >
                    {status === "saving" ? "Adding" : "Add Practice"}
                </button>
            </div>
        </section>
    );
}
