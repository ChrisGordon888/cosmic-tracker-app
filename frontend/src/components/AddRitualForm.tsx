"use client";

import { useState } from "react";
import "@/styles/addRitualForm.css";

export default function AddRitualForm({ onAdd }) {
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleSubmit = () => {
    onAdd(newTitle, newDescription);
    setNewTitle("");
    setNewDescription("");
  };

  return (
    <div className="add-ritual-form">
      <input
        type="text"
        placeholder="Title"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        rows={3}
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
      />
      <button onClick={handleSubmit}>
        Add Ritual
      </button>
    </div>
  );
}