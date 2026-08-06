"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import {
    GET_MOOD_ENTRY,
    ADD_MOOD_ENTRY,
    UPDATE_MOOD_ENTRY,
} from "@/graphql/mood";
import "@/styles/moodSection.css";

const MOOD_LABELS: Record<number, string> = {
    1: "Heavy",
    2: "Low",
    3: "Tender",
    4: "Quiet",
    5: "Neutral",
    6: "Steady",
    7: "Open",
    8: "Clear",
    9: "Strong",
    10: "Radiant",
};

export default function MoodSection() {
    const { data: session } = useSession();
    const today = dayjs().format("YYYY-MM-DD");

    const { data, loading, error, refetch } = useQuery(GET_MOOD_ENTRY, {
        variables: { date: today },
        skip: !session,
    });

    const [value, setValue] = useState(5);
    const [note, setNote] = useState("");
    const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [add] = useMutation(ADD_MOOD_ENTRY);
    const [update] = useMutation(UPDATE_MOOD_ENTRY);

    useEffect(() => {
        if (data?.getMoodEntry) {
            setValue(data.getMoodEntry.mood);
            setNote(data.getMoodEntry.note || "");
        } else {
            setValue(5);
            setNote("");
        }
    }, [data]);

    const handleSave = async () => {
        setSaveState("saving");

        try {
            const existing = data?.getMoodEntry;

            if (existing?.id) {
                await update({ variables: { id: existing.id, mood: value, note: note.trim() } });
            } else {
                await add({
                    variables: {
                        mood: value,
                        note: note.trim(),
                        date: today,
                    },
                });
            }

            await refetch();
            setSaveState("saved");
            window.setTimeout(() => setSaveState("idle"), 2200);
        } catch (e) {
            console.error("Error saving Mood Entry:", e);
            setSaveState("error");
        }
    };

    const hasSavedEntry = Boolean(data?.getMoodEntry);

    return (
        <section className="mood-card" aria-labelledby="mood-title">
            <div className="mood-header">
                <div>
                    <p className="mood-eyebrow">Current state</p>
                    <h2 id="mood-title">Today&apos;s Mood</h2>
                </div>
                <span className="mood-value">{value}</span>
            </div>

            <div className="mood-scale-copy">
                <strong>{MOOD_LABELS[value]}</strong>
                <span>{value} of 10</span>
            </div>

            {loading && <p className="inner-status">Loading your mood...</p>}
            {error && (
                <p className="inner-status is-error" role="alert">
                    Unable to load mood: {error.message}
                </p>
            )}

            <label className="mood-range-field">
                <span className="sr-only">Mood score from 1 to 10</span>
                <input
                    type="range"
                    min={1}
                    max={10}
                    value={value}
                    aria-valuemin={1}
                    aria-valuemax={10}
                    aria-valuenow={value}
                    aria-valuetext={MOOD_LABELS[value]}
                    onChange={(event) => {
                        setValue(Number(event.target.value));
                        if (saveState !== "idle") setSaveState("idle");
                    }}
                />
                <div className="mood-range-labels" aria-hidden="true">
                    <span>1</span>
                    <span>10</span>
                </div>
            </label>

            <label className="mood-note-field">
                <span>Reflection</span>
                <textarea
                    name="moodNote"
                    placeholder="What is shaping your inner weather?"
                    rows={3}
                    value={note}
                    onChange={(event) => {
                        setNote(event.target.value);
                        if (saveState !== "idle") setSaveState("idle");
                    }}
                />
            </label>

            <div className="mood-footer">
                <p className={`inner-status ${saveState === "error" ? "is-error" : saveState === "saved" ? "is-success" : ""}`}>
                    {saveState === "saving" && "Saving..."}
                    {saveState === "saved" && "Mood saved."}
                    {saveState === "error" && "Mood could not be saved."}
                </p>

                <button type="button" onClick={handleSave} disabled={loading || saveState === "saving"}>
                    {saveState === "saving"
                        ? "Saving"
                        : hasSavedEntry
                            ? "Update Mood"
                            : "Save Mood"}
                </button>
            </div>
        </section>
    );
}
