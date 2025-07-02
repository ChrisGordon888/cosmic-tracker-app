"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_MOOD_ENTRY, ADD_MOOD_ENTRY, UPDATE_MOOD_ENTRY } from "@/graphql/mood";
import dayjs from "dayjs";
import "@/styles/moodSection.css";


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
    <section className="mood-card">
    <h2>🪷 Today's Mood</h2>
    {loading && <p>Loading your mood entry...</p>}
    {error && <p className="text-red-600">Error: {error.message}</p>}
    <div className="flex items-center gap-4 mb-2">
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
      />
      <span className="font-bold text-lg">{value}</span>
    </div>
    <textarea
      name="moodNote"
      placeholder="Optional mood notes..."
      rows={2}
      value={note}
      onChange={(e) => setNote(e.target.value)}
    />
    <button onClick={handleSave}>
      {data?.getMoodEntry ? "Update Mood" : "Save Mood"}
    </button>
  </section>
  );
}