"use client";

import { useQuery } from "@apollo/client";
import Calendar from "react-calendar"; // 📅 npm install react-calendar
import "react-calendar/dist/Calendar.css";
import { ALL_MOOD_ENTRIES } from "@/graphql/mood";
import { getMoonPhaseForDate } from "@/utils/moonPhases";
import dayjs from "dayjs";

export default function CalendarPage() {
  const { data: moodData, loading: moodLoading, error: moodError } = useQuery(ALL_MOOD_ENTRIES);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dateStr = dayjs(date).format("YYYY-MM-DD");
    const moodEntry = moodData?.allMoodEntries?.find((m) => m.date === dateStr);
    const moonPhase = getMoonPhaseForDate(date);

    return (
      <div className="flex flex-col items-center mt-1">
        {/* 🌓 Moon phase icon */}
        {moonPhase && (
          <span className="text-xs" title={moonPhase.phase}>
            {moonPhase.icon}
          </span>
        )}
        {/* 🪷 Mood marker */}
        {moodEntry && (
          <div
            className="w-2 h-2 rounded-full mt-0.5"
            style={{ backgroundColor: getMoodColor(moodEntry.mood) }}
            title={`Mood: ${moodEntry.mood}`}
          />
        )}
      </div>
    );
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">📅 Cosmic Calendar</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        See your moods, rituals, and moon phases at a glance ✨
      </p>

      {moodLoading && <p>Loading calendar data...</p>}
      {moodError && <p className="text-red-600">Error: {moodError.message}</p>}

      <Calendar
  tileContent={tileContent}
  className="w-full rounded-lg shadow dark:shadow-gray-800 bg-white dark:bg-gray-800 p-4"
/>

      <div className="mt-6 text-left">
        <h2 className="text-xl font-semibold mb-2">🌈 Legend</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500 rounded-full" />
            <span>Low Mood</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded-full" />
            <span>High Mood</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm">🌑</span>
            <span>Moon Phase</span>
          </div>
        </div>
      </div>
    </main>
  );
}

// 🔥 Simple utility for coloring mood dots
function getMoodColor(mood: number) {
  if (mood <= 3) return "#ef4444"; // red
  if (mood <= 7) return "#facc15"; // yellow
  return "#22c55e"; // green
}