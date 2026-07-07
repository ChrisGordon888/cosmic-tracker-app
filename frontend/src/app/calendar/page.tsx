"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/styles/reactCalendar.css";
import "@/styles/calendarPage.css";
import { ALL_MOOD_ENTRIES } from "@/graphql/mood";
import { ALL_PRACTICE_QUESTS } from "@/graphql/practiceQuest";
import moonData from "@/data/moonPhases2026.json";
import dayjs from "dayjs";
import CosmicBackground from "@/components/CosmicBackground";

type MoodEntry = {
  id?: string;
  date: string;
  mood: number;
  note?: string | null;
};

type PracticeQuest = {
  id?: string;
  date: string;
  completed: boolean;
  title?: string | null;
};

type MoonEvent = {
  date: string;
  phase: string;
  icon: string;
};

type CalendarValue = Date | [Date | null, Date | null] | null;

const IMPORTANT_DATES = [
  {
    date: "2026-06-29",
    title: "Do Over unlock",
    type: "release",
  },
  {
    date: "2026-07-14",
    title: "Running From The Plug unlock",
    type: "release",
  },
  {
    date: "2026-07-29",
    title: "SIRENS portal wave",
    type: "release",
  },
];

function normalizeDate(value?: string | null) {
  if (!value) return "";
  return dayjs(value).format("YYYY-MM-DD");
}

function getMoodColor(mood: number) {
  if (mood <= 3) return "#f87171";
  if (mood <= 7) return "#facc15";
  return "#4ade80";
}

function getMoodLabel(mood: number) {
  if (mood <= 3) return "Low signal";
  if (mood <= 7) return "Building signal";
  return "Clear signal";
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

function getSelectedDate(value: CalendarValue) {
  if (value instanceof Date) return value;
  if (Array.isArray(value) && value[0] instanceof Date) return value[0];
  return new Date();
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<CalendarValue>(new Date());

  const { data: moodData, loading: moodLoading, error: moodError } = useQuery(ALL_MOOD_ENTRIES);
  const { data: questsData, loading: questsLoading, error: questsError } = useQuery(ALL_PRACTICE_QUESTS);

  const moodEntries: MoodEntry[] = moodData?.allMoodEntries ?? [];
  const practiceQuests: PracticeQuest[] = questsData?.allPracticeQuests ?? [];

  const moonMap = useMemo(() => {
    const map: Record<string, MoonEvent> = {};

    moonData.forEach((entry) => {
      const dateStr = normalizeDate(entry.date);
      map[dateStr] = {
        date: dateStr,
        phase: entry.phase,
        icon: getPhaseIcon(entry.phase),
      };
    });

    return map;
  }, []);

  const importantDateMap = useMemo(() => {
    const map: Record<string, typeof IMPORTANT_DATES> = {};

    IMPORTANT_DATES.forEach((event) => {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    });

    return map;
  }, []);

  const selectedDateKey = normalizeDate(getSelectedDate(selectedDate).toISOString());
  const selectedMoon = moonMap[selectedDateKey];
  const selectedMood = moodEntries.find((entry) => normalizeDate(entry.date) === selectedDateKey);
  const selectedCompletedQuests = practiceQuests.filter(
    (quest) => normalizeDate(quest.date) === selectedDateKey && quest.completed,
  );
  const selectedEvents = importantDateMap[selectedDateKey] ?? [];

  const visibleMoonEvents = useMemo(() => {
    const currentMonth = dayjs(getSelectedDate(selectedDate));

    return Object.values(moonMap)
      .filter((event) => dayjs(event.date).isSame(currentMonth, "month"))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [moonMap, selectedDate]);

  const calendarStats = [
    {
      label: "Moon markers",
      value: visibleMoonEvents.length,
      detail: "visible this month",
    },
    {
      label: "Mood entries",
      value: moodEntries.length,
      detail: "logged total",
    },
    {
      label: "Completed quests",
      value: practiceQuests.filter((quest) => quest.completed).length,
      detail: "practice wins",
    },
  ];

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dateStr = dayjs(date).format("YYYY-MM-DD");
    const moodEntry = moodEntries.find((entry) => normalizeDate(entry.date) === dateStr);
    const completedQuests = practiceQuests.filter(
      (quest) => normalizeDate(quest.date) === dateStr && quest.completed,
    );
    const moonEvent = moonMap[dateStr];
    const importantEvents = importantDateMap[dateStr] ?? [];

    if (!moonEvent && !moodEntry && completedQuests.length === 0 && importantEvents.length === 0) {
      return null;
    }

    return (
      <div className="calendar-day-markers">
        {moonEvent && (
          <span className="calendar-marker calendar-marker-moon" title={moonEvent.phase}>
            {moonEvent.icon}
          </span>
        )}
        {moodEntry && (
          <span
            className="calendar-marker calendar-marker-mood"
            style={{ backgroundColor: getMoodColor(moodEntry.mood) }}
            title={`Mood ${moodEntry.mood}: ${moodEntry.note || "No note"}`}
          />
        )}
        {completedQuests.length > 0 && (
          <span
            className="calendar-marker calendar-marker-quest"
            title={`${completedQuests.length} quest${completedQuests.length === 1 ? "" : "s"} completed`}
          />
        )}
        {importantEvents.length > 0 && (
          <span
            className="calendar-marker calendar-marker-important"
            title={importantEvents.map((event) => event.title).join(" / ")}
          />
        )}
      </div>
    );
  };

  return (
    <main className="calendar-page calendar-practice-page">
      <CosmicBackground />

      <section className="calendar-hero">
        <div>
          <p className="calendar-kicker">Practice Calendar</p>
          <h1>Moon, mood, quests, and important signals.</h1>
          <p>
            This room shows the rhythm of your practice across time: lunar markers, mood entries,
            completed quests, and release/practice dates that matter.
          </p>
        </div>

        <div className="calendar-hero-actions">
          <Link href="/practice">Practice Portal</Link>
          <Link href="/tracker">Tracker</Link>
          <Link href="/rituals">Rituals</Link>
        </div>
      </section>

      <section className="calendar-stats-grid" aria-label="Calendar stats">
        {calendarStats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="calendar-shell">
        <div className="calendar-panel">
          <div className="calendar-panel-heading">
            <div>
              <p className="calendar-kicker">Pattern View</p>
              <h2>Tap a date to read the signal.</h2>
            </div>
            <p>
              Moon icons, mood dots, quest dots, and gold important-date markers should now be
              visible against the darker calendar glass.
            </p>
          </div>

          {(moodLoading || questsLoading) && <p className="calendar-inline-note">Loading calendar data...</p>}
          {moodError && <p className="calendar-inline-error">Error loading moods: {moodError.message}</p>}
          {questsError && <p className="calendar-inline-error">Error loading quests: {questsError.message}</p>}

          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            tileContent={tileContent}
            className="practice-calendar"
          />
        </div>

        <aside className="calendar-day-panel">
          <p className="calendar-kicker">Selected Date</p>
          <h2>{dayjs(selectedDateKey).format("MMMM D, YYYY")}</h2>

          <div className="calendar-day-detail-list">
            <article>
              <span>Moon</span>
              <strong>{selectedMoon ? `${selectedMoon.icon} ${selectedMoon.phase}` : "No major phase marker"}</strong>
            </article>

            <article>
              <span>Mood</span>
              <strong>
                {selectedMood
                  ? `${selectedMood.mood}/10 — ${getMoodLabel(selectedMood.mood)}`
                  : "No mood logged"}
              </strong>
              {selectedMood?.note && <p>{selectedMood.note}</p>}
            </article>

            <article>
              <span>Quests</span>
              <strong>
                {selectedCompletedQuests.length > 0
                  ? `${selectedCompletedQuests.length} completed`
                  : "No completed quests"}
              </strong>
              {selectedCompletedQuests.length > 0 && (
                <ul>
                  {selectedCompletedQuests.slice(0, 4).map((quest, index) => (
                    <li key={quest.id ?? `${quest.date}-${index}`}>{quest.title || "Practice quest"}</li>
                  ))}
                </ul>
              )}
            </article>

            <article>
              <span>Important</span>
              <strong>
                {selectedEvents.length > 0
                  ? `${selectedEvents.length} important signal${selectedEvents.length === 1 ? "" : "s"}`
                  : "No important date"}
              </strong>
              {selectedEvents.length > 0 && (
                <ul>
                  {selectedEvents.map((event) => (
                    <li key={`${event.date}-${event.title}`}>{event.title}</li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        </aside>
      </section>

      <section className="calendar-lower-grid">
        <div className="calendar-legend-card">
          <p className="calendar-kicker">Legend</p>
          <div className="calendar-legend-list">
            <span><em className="calendar-legend-moon">🌕</em> Moon phase</span>
            <span><em className="calendar-legend-low" /> Low mood</span>
            <span><em className="calendar-legend-mid" /> Building mood</span>
            <span><em className="calendar-legend-high" /> Clear mood</span>
            <span><em className="calendar-legend-quest" /> Completed quest</span>
            <span><em className="calendar-legend-important" /> Important date</span>
          </div>
        </div>

        <div className="calendar-moon-card">
          <p className="calendar-kicker">This Month</p>
          <h2>Moon markers</h2>
          {visibleMoonEvents.length > 0 ? (
            <div className="calendar-moon-list">
              {visibleMoonEvents.map((event) => (
                <span key={event.date}>
                  <strong>{event.icon}</strong>
                  {dayjs(event.date).format("MMM D")}: {event.phase}
                </span>
              ))}
            </div>
          ) : (
            <p>No moon markers found for this month. The moon data file may need the current year added.</p>
          )}
        </div>
      </section>
    </main>
  );
}
