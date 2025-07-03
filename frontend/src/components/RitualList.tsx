"use client";

import "@/styles/ritualList.css";


export default function RitualList({ rituals, loading, error, onEdit, onDelete }) {
  if (loading) return <p>Loading rituals...</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;
  if (!rituals || rituals.length === 0) {
    return <p className="text-gray-500">You haven’t added any rituals yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {rituals.map((ritual) => (
        <li key={ritual.id} className="rituals-list-item">
          <h2>{ritual.title}</h2>
          <p>{ritual.description}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(ritual)}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(ritual.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}