"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import { GET_MOON_PHASE } from "@/graphql/moon";
import { GET_SACRED_YES, ADD_SACRED_YES, UPDATE_SACRED_YES } from "@/graphql/sacredYes";
import dayjs from "dayjs";
import { GET_MOOD_ENTRY, ADD_MOOD_ENTRY, UPDATE_MOOD_ENTRY } from "@/graphql/mood";
import { GET_DAILY_QUESTS, UPDATE_PRACTICE_QUEST_PROGRESS } from "@/graphql/practiceQuest";

export default function Home() {
  const today = dayjs().format("YYYY-MM-DD");

  // Moon Phase Query
  const { data: moonData, loading: moonLoading, error: moonError } = useQuery(GET_MOON_PHASE);

  // Sacred Yes Query
  const { data: sacredData, loading: sacredLoading, error: sacredError, refetch } = useQuery(
    GET_SACRED_YES,
    { variables: { date: today } }
  );

  const [sacredYesText, setSacredYesText] = useState("");
  const [addSacredYes] = useMutation(ADD_SACRED_YES);
  const [updateSacredYes] = useMutation(UPDATE_SACRED_YES);

  useEffect(() => {
    if (sacredData?.getSacredYes) setSacredYesText(sacredData.getSacredYes.text);
  }, [sacredData]);

  const handleSaveSacredYes = async () => {
    try {
      if (sacredData?.getSacredYes) {
        await updateSacredYes({ variables: { id: sacredData.getSacredYes.id, text: sacredYesText } });
      } else {
        await addSacredYes({ variables: { text: sacredYesText, date: today } });
      }
      refetch();
    } catch (e) {
      console.error("❌ Error saving Sacred Yes:", e);
    }
  };

  // Mood Query
  const { data: moodData, loading: moodLoading, error: moodError, refetch: refetchMood } = useQuery(
    GET_MOOD_ENTRY,
    { variables: { date: today } }
  );
  const [moodValue, setMoodValue] = useState(5);
  const [moodNote, setMoodNote] = useState("");
  const [addMoodEntry] = useMutation(ADD_MOOD_ENTRY);
  const [updateMoodEntry] = useMutation(UPDATE_MOOD_ENTRY);

  useEffect(() => {
    if (moodData?.getMoodEntry) {
      setMoodValue(moodData.getMoodEntry.mood);
      setMoodNote(moodData.getMoodEntry.note || "");
    }
  }, [moodData]);

  const handleSaveMood = async () => {
    try {
      if (moodData?.getMoodEntry) {
        await updateMoodEntry({
          variables: { id: moodData.getMoodEntry.id, mood: moodValue, note: moodNote },
        });
      } else {
        await addMoodEntry({
          variables: { mood: moodValue, note: moodNote, date: today },
        });
      }
      refetchMood();
    } catch (e) {
      console.error("❌ Error saving Mood Entry:", e);
    }
  };

  // Practice Quests Query
  const { data: questsData, loading: questsLoading, error: questsError, refetch: refetchQuests } = useQuery(
    GET_DAILY_QUESTS,
    { variables: { date: today } }
  );
  const [updateQuestProgress] = useMutation(UPDATE_PRACTICE_QUEST_PROGRESS);

  const handleUpdateQuest = async (id: string, newReps: number) => {
    try {
      await updateQuestProgress({ variables: { id, completedReps: newReps } });
      refetchQuests();
    } catch (e) {
      console.error("❌ Error updating quest progress:", e);
    }
  };

  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">🌌 Welcome to Cosmic Tracker</h1>

      {/* Dynamic Moon Phase */}
      <div className="mb-8 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 max-w-xl w-full">
        {moonLoading && <p>Loading today's moon phase...</p>}
        {moonError && <p className="text-red-600">Error: {moonError.message}</p>}
        {moonData && (
          <>
            <h2 className="text-xl font-semibold mb-1">Today's Moon Phase:</h2>
            <p className="text-lg">{moonData.todayMoonPhase}</p>
          </>
        )}
      </div>

      {/* Sacred Yes Section */}
      <section className="mb-8 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 max-w-xl w-full text-left">
        <h2 className="text-xl font-semibold mb-2">🌟 Today's Sacred Yes</h2>
        {sacredLoading && <p>Loading your sacred intention...</p>}
        {sacredError && <p className="text-red-600">Error: {sacredError.message}</p>}
        <textarea
          className="w-full p-2 rounded border border-indigo-200 dark:border-indigo-700 mb-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          placeholder="What do you say yes to today?"
          rows={3}
          value={sacredYesText}
          onChange={(e) => setSacredYesText(e.target.value)}
        />
        <button
          onClick={handleSaveSacredYes}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition"
        >
          {sacredData?.getSacredYes ? "Update Sacred Yes" : "Save Sacred Yes"}
        </button>
      </section>

      {/* Mood Tracking Section */}
      <section className="mb-8 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 max-w-xl w-full text-left">
        <h2 className="text-xl font-semibold mb-2">🪷 Today's Mood</h2>
        {moodLoading && <p>Loading your mood entry...</p>}
        {moodError && <p className="text-red-600">Error: {moodError.message}</p>}
        <div className="flex items-center gap-4 mb-2">
          <input
            type="range"
            min={1}
            max={10}
            value={moodValue}
            onChange={(e) => setMoodValue(parseInt(e.target.value))}
            className="flex-grow accent-indigo-600"
          />
          <span className="font-bold text-lg">{moodValue}</span>
        </div>
        <textarea
          className="w-full p-2 rounded border border-indigo-200 dark:border-indigo-700 mb-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          placeholder="Optional mood notes..."
          rows={2}
          value={moodNote}
          onChange={(e) => setMoodNote(e.target.value)}
        />
        <button
          onClick={handleSaveMood}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition"
        >
          {moodData?.getMoodEntry ? "Update Mood" : "Save Mood"}
        </button>
      </section>

      {/* Practice Quests Section */}
      <section className="mb-8 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 max-w-xl w-full text-left">
        <h2 className="text-xl font-semibold mb-2">🧘 Today's Spiritual Quests</h2>
        {questsLoading && <p>Loading your cosmic quests...</p>}
        {questsError && <p className="text-red-600">Error: {questsError.message}</p>}
        {questsData?.getDailyQuests.length === 0 && (
          <p className="text-gray-500">No quests today. Time to set some intentions! 🌙</p>
        )}
        {questsData?.getDailyQuests.map((quest) => (
          <div key={quest.id} className="border rounded p-4 mb-4">
            <h3 className="text-lg font-bold">{quest.name}</h3>
            {quest.description && (
              <p className="text-sm text-gray-500 mb-2">{quest.description}</p>
            )}
            <div className="flex items-center gap-4 mb-2">
              <button
                className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                onClick={() => handleUpdateQuest(quest.id, Math.max(0, quest.completedReps - 1))}
                disabled={quest.completedReps <= 0}
              >
                -
              </button>
              <span className="font-bold text-lg">{quest.completedReps} / {quest.repetitions}</span>
              <button
                className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                onClick={() => handleUpdateQuest(quest.id, quest.completedReps + 1)}
                disabled={quest.completed}
              >
                +
              </button>
            </div>
            {quest.completed && (
              <p className="text-green-600 font-semibold">✅ Completed! Cosmic mastery unlocked.</p>
            )}
          </div>
        ))}
      </section>

      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-8">
        Align with your rituals, your rhythm, and the moon. Choose a path to begin:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <Link href="/auth">
          <div className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-lg transition cursor-pointer">
            🔐 Login / Sign Up
          </div>
        </Link>
        <Link href="/home">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white px-6 py-4 rounded-lg transition cursor-pointer">
            🏠 Home Dashboard
          </div>
        </Link>
        {/* Keep your other links here */}
      </div>
    </main>
  );
}