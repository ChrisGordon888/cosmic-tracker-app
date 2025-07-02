"use client";

import { useQuery } from "@apollo/client";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/styles/reactCalendar.css";
import { ALL_MOOD_ENTRIES } from "@/graphql/mood";
import { ALL_PRACTICE_QUESTS } from "@/graphql/practiceQuest";
import moonData from "@/data/moonPhases2025.json";
import dayjs from "dayjs";

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

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view !== "month") return null;

        const dateStr = dayjs(date).format("YYYY-MM-DD");
        const moodEntry = moodData?.allMoodEntries?.find((m) => m.date === dateStr);
        const completedQuests = questsData?.allPracticeQuests?.filter(
            (q) => q.date === dateStr && q.completed
        );
        const moonEvent = moonMap[dateStr];

        return (
            <div className="flex flex-col items-center mt-1">
                {moonEvent && (
                    <span className="text-xs hover:scale-110 transition-transform cursor-help" title={moonEvent.phase}>
                        {moonEvent.icon}
                    </span>
                )}
                {moodEntry && (
                    <div
                        className="w-3 h-3 rounded-full mt-0.5"
                        style={{ backgroundColor: getMoodColor(moodEntry.mood) }}
                        title={`Mood: ${moodEntry.mood} - ${moodEntry.note || "No notes"}`}
                    />
                )}
                {completedQuests?.length > 0 && (
                    <div
                        className="w-3 h-3 rounded-full bg-indigo-600 mt-0.5"
                        title={`${completedQuests.length} quest(s) completed`}
                    />
                )}
            </div>
        );
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-start p-6">
            <h1 className="text-3xl font-bold mb-4">📅 Cosmic Calendar</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
                Track your moods, completed quests, and real moon phases — all in one cosmic view ✨
            </p>

            {(moodLoading || questsLoading) && <p>Loading calendar data...</p>}
            {moodError && <p className="text-red-600">Error loading moods: {moodError.message}</p>}
            {questsError && <p className="text-red-600">Error loading quests: {questsError.message}</p>}

            <Calendar
                tileContent={tileContent}
                className="w-full max-w-4xl mx-auto rounded-lg shadow dark:shadow-gray-800 bg-white dark:bg-gray-800 p-4"
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
                        <div className="w-4 h-4 bg-indigo-600 rounded-full" />
                        <span>Completed Quests</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-sm">🌑</span>
                        <span>Moon Phase Event</span>
                    </div>
                </div>
            </div>
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