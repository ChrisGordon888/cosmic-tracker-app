"use client";

import { useState } from "react";

export default function AddRitualForm({ onAdd }) {
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleSubmit = () => {
    onAdd(newTitle, newDescription);
    setNewTitle("");
    setNewDescription("");
  };

  return (
    <>
      <input
        type="text"
        placeholder="Title"
        className="w-full p-2 rounded border mb-2"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        className="w-full p-2 rounded border mb-2"
        rows={3}
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
      >
        Add Ritual
      </button>
    </>
  );
}