"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_RITUALS, ADD_RITUAL, UPDATE_RITUAL, DELETE_RITUAL } from "@/graphql/rituals";

export default function RitualsPage() {
  // 📡 Fetch rituals from backend
  const { data, loading, error, refetch } = useQuery(ALL_RITUALS);
  const [addRitual] = useMutation(ADD_RITUAL);
  const [updateRitual] = useMutation(UPDATE_RITUAL);
  const [deleteRitual] = useMutation(DELETE_RITUAL);

  // 📝 Local state for adding new rituals
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // 🚀 Add a new ritual with guard + explicit logs
const handleAdd = async () => {
    const cleanTitle = newTitle.trim();
    const cleanDescription = newDescription?.trim() || "";
  
    if (!cleanTitle) {
      console.error("❗ Ritual title is required before adding!");
      return;
    }
  
    const payload = { title: cleanTitle, description: cleanDescription };
    console.log("🚀 Adding ritual with payload:", payload);
  
    try {
      await addRitual({ variables: payload });
      setNewTitle("");
      setNewDescription("");
      refetch();
    } catch (e) {
      console.error("❌ Failed to add ritual:", e);
    }
  };

  // ✏️ Edit a ritual (simple inline demo)
  const handleEdit = async (ritual) => {
    const updatedTitle = prompt("Edit ritual title:", ritual.title);
    const updatedDescription = prompt("Edit ritual description:", ritual.description);
    if (updatedTitle !== null && updatedDescription !== null) {
      try {
        await updateRitual({ variables: { id: ritual.id, title: updatedTitle, description: updatedDescription } });
        refetch();
      } catch (e) {
        console.error("❌ Failed to update ritual:", e);
      }
    }
  };

  // 🗑️ Delete a ritual
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this ritual?")) {
      try {
        await deleteRitual({ variables: { id } });
        refetch();
      } catch (e) {
        console.error("❌ Failed to delete ritual:", e);
      }
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {/* 📖 Header */}
      <h1 className="text-3xl font-bold mb-4">📖 My Ritual Library</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-300">
        Create, edit, and manage your daily rituals below.
      </p>

      {/* 📡 Ritual List */}
      {loading && <p>Loading rituals...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {data?.allRituals.length === 0 && (
        <p className="text-gray-500">You haven’t added any rituals yet.</p>
      )}
      <ul className="space-y-4">
        {data?.allRituals.map((ritual) => (
          <li key={ritual.id} className="border rounded p-4 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-2">{ritual.title}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{ritual.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(ritual)}
                className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(ritual.id)}
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* ➕ Add New Ritual */}
      <div className="mt-12 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">➕ Add New Ritual</h2>
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
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
        >
          Add Ritual
        </button>
      </div>
    </main>
  );
}