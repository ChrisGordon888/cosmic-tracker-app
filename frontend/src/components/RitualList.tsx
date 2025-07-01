"use client";

export default function RitualList({ rituals, loading, error, onEdit, onDelete }) {
  if (loading) return <p>Loading rituals...</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;
  if (!rituals || rituals.length === 0) {
    return <p className="text-gray-500">You haven’t added any rituals yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {rituals.map((ritual) => (
        <li key={ritual.id} className="border rounded p-4 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">{ritual.title}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{ritual.description}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(ritual)}
              className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(ritual.id)}
              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}