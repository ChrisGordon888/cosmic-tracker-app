"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_MOOD_ENTRY, ADD_MOOD_ENTRY, UPDATE_MOOD_ENTRY } from "@/graphql/mood";
import dayjs from "dayjs";

export default function MoodSection() {
  const { data: session } = useSession();
  const today = dayjs().format("YYYY-MM-DD");

  const { data, loading, error, refetch } = useQuery(
    GET_MOOD_ENTRY,
    { variables: { date: today }, skip: !session }
  );
  const [value, setValue] = useState(5);
  const [note, setNote] = useState("");
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
    try {
      const existing = data?.getMoodEntry;
      if (existing?.id) {
        await update({ variables: { id: existing.id, mood: value, note } });
      } else {
        await add({ variables: { mood: value, note, date: today } });
      }
      refetch();
    } catch (e) {
      console.error("❌ Error saving Mood Entry:", e);
    }
  };

  return (
    <section className="mb-8 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 max-w-xl w-full text-left">
      <h2 className="text-xl font-semibold mb-2">🪷 Today's Mood</h2>
      {loading && <p>Loading your mood entry...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      <div className="flex items-center gap-4 mb-2">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          className="flex-grow accent-indigo-600"
        />
        <span className="font-bold text-lg">{value}</span>
      </div>
      <textarea
        name="moodNote"
        className="w-full p-2 rounded border border-indigo-200 dark:border-indigo-700 mb-2 bg-white dark:bg-gray-800"
        placeholder="Optional mood notes..."
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button
        onClick={handleSave}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition"
      >
        {data?.getMoodEntry ? "Update Mood" : "Save Mood"}
      </button>
    </section>
  );
}