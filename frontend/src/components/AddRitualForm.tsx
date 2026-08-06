"use client";

import { useState } from "react";
import "@/styles/addRitualForm.css";

type AddRitualFormProps = {
    onAdd?: (title: string, description: string) => void;
};

export default function AddRitualForm({ onAdd }: AddRitualFormProps) {
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [status, setStatus] = useState<"idle" | "error" | "submitted">("idle");

    const handleSubmit = () => {
        const cleanTitle = newTitle.trim();
        const cleanDescription = newDescription.trim();

        if (!cleanTitle) {
            setStatus("error");
            return;
        }

        onAdd?.(cleanTitle, cleanDescription);

        setNewTitle("");
        setNewDescription("");
        setStatus("submitted");
        window.setTimeout(() => setStatus("idle"), 1800);
    };

    return (
        <section className="add-ritual-form" aria-labelledby="add-ritual-title">
            <div className="add-ritual-heading">
                <div>
                    <p className="add-ritual-eyebrow">Create anchor</p>
                    <h2 id="add-ritual-title">Add a Ritual</h2>
                </div>
                <span>Reusable</span>
            </div>

            <p className="add-ritual-intro">
                Build a repeatable practice you can connect to future daily actions.
            </p>

            <label>
                <span>Title</span>
                <input
                    type="text"
                    placeholder="Example: Studio opening ritual"
                    value={newTitle}
                    onChange={(event) => {
                        setNewTitle(event.target.value);
                        if (status !== "idle") setStatus("idle");
                    }}
                />
            </label>

            <label>
                <span>Description</span>
                <textarea
                    placeholder="Describe when, why, and how you want to use this ritual."
                    rows={4}
                    value={newDescription}
                    onChange={(event) => {
                        setNewDescription(event.target.value);
                        if (status !== "idle") setStatus("idle");
                    }}
                />
            </label>

            <div className="add-ritual-footer">
                <p
                    className={`add-ritual-status ${status === "error" ? "is-error" : status === "submitted" ? "is-success" : ""
                        }`}
                    role={status === "error" ? "alert" : undefined}
                >
                    {status === "error" && "Add a title before saving."}
                    {status === "submitted" && "Ritual submitted."}
                </p>

                <button type="button" onClick={handleSubmit}>
                    Add Ritual
                </button>
            </div>
        </section>
    );
}
