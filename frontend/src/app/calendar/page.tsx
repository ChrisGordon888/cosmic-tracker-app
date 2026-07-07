"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/styles/reactCalendar.css";
import "@/styles/calendarPage.css";
import { ALL_MOOD_ENTRIES } from "@/graphql/mood";
import { ALL_PRACTICE_QUESTS } from "@/graphql/practiceQuest";
import moonData from "@/data/moonPhases2025.json";
import dayjs from "dayjs";
import CosmicBackground from "@/components/CosmicBackground";

type MoodEntry = {
  date: string;
  mood: number;
  note?: string | null;
};

type PracticeQuest = {
  date: string;
  completed: boolean;
};

export default function CalendarPage() {
  const { data: moodData, loading: moodLoading, error: moodError } = useQuery(ALL_MOOD_ENTRIES);
  const { data: questsData, loading: questsLoading, error: questsError } = useQuery(ALL_PRACTICE_QUESTS);

  const moonMap: Record<string, { phase: string; icon: string }> = {};

  moonData.forEach((entry) => {
    const dateStr = dayjs(entry.date).format("YYYY-MM-DD");
    moonMap[dateStr] = {
      phase: entry.phase,
      icon: getPhaseIcon(entry.phase),
    };
  });

  const allMoodEntries = (moodData?.allMoodEntries ?? []) as MoodEntry[];
  const allPracticeQuests = (questsData?.allPracticeQuests ?? []) as PracticeQuest[];
  const completedQuestCount = allPracticeQuests.filter((quest) => quest.completed).length;
  const moonEventCount = Object.keys(moonMap).length;

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dateStr = dayjs(date).format("YYYY-MM-DD");
    const moodEntry = allMoodEntries.find((entry) => entry.date === dateStr);
    const completedQuests = allPracticeQuests.filter(
      (quest) => quest.date === dateStr && quest.completed,
    );
    const moonEvent = moonMap[dateStr];

    return (
      <div className="calendar-tile-signals">
        {moonEvent && (
          <span className="calendar-tile-moon" title={moonEvent.phase}>
            {moonEvent.icon}
          </span>
        )}
        {moodEntry && (
          <span
            className="calendar-tile-dot"
            style={{ backgroundColor: getMoodColor(moodEntry.mood) }}
            title={`Mood: ${moodEntry.mood} - ${moodEntry.note || "No notes"}`}
          />
        )}
        {completedQuests.length > 0 && (
          <span
            className="calendar-tile-dot calendar-tile-quest-dot"
            title={`${completedQuests.length} quest(s) completed`}
          />
        )}
      </div>
    );
  };

  return (
    <main className="calendar-page practice-subpage">
      <CosmicBackground />

      <section className="practice-subpage-hero">
        <div>
          <p className="practice-subpage-kicker">Practice Calendar</p>
          <h1>See the pattern behind the practice.</h1>
          <p>
            Mood, completed quests, and moon phase events in one timeline — a wider view of the rhythm you are building.
          </p>
        </div>
        <div className="practice-subpage-actions">
          <Link href="/practice">Practice Portal</Link>
          <Link href="/tracker">Tracker</Link>
          <Link href="/rituals">Rituals</Link>
        </div>
      </section>

      <section className="calendar-orbit-stats" aria-label="Calendar stats">
        <article>
          <span>Mood Entries</span>
          <strong>{moodLoading ? "..." : allMoodEntries.length}</strong>
        </article>
        <article>
          <span>Completed Quests</span>
          <strong>{questsLoading ? "..." : completedQuestCount}</strong>
        </article>
        <article>
          <span>Moon Events</span>
          <strong>{moonEventCount}</strong>
        </article>
      </section>

      {(moodError || questsError) && (
        <section className="practice-subpage-error">
          {moodError && <p>Error loading moods: {moodError.message}</p>}
          {questsError && <p>Error loading quests: {questsError.message}</p>}
        </section>
      )}

      <section className="calendar-shell">
        {(moodLoading || questsLoading) && <p className="calendar-loading">Loading calendar data...</p>}

        <Calendar tileContent={tileContent} className="cosmic-calendar" />
      </section>

      <section className="calendar-legend">
        <div>
          <p className="practice-subpage-kicker">Legend</p>
          <h2>Signals on the calendar.</h2>
        </div>
        <div className="calendar-legend-grid">
          <span><i className="legend-dot legend-low" /> Low mood</span>
          <span><i className="legend-dot legend-mid" /> Mid mood</span>
          <span><i className="legend-dot legend-high" /> High mood</span>
          <span><i className="legend-dot legend-quest" /> Completed quest</span>
          <span><b>🌑</b> Moon phase event</span>
        </div>
      </section>
    </main>
  );
}

function getMoodColor(mood: number) {
  if (mood <= 3) return "#ef4444";
  if (mood <= 7) return "#facc15";
  return "#22c55e";
}

function getPhaseIcon(phase: string) {
  switch (phase) {
    case "New Moon":
      return "🌑";
    case "First Quarter":
      return "🌓";
    case "Full Moon":
      return "🌕";
    case "Third Quarter":
      return "🌗";
    default:
      return "🌘";
  }
}
