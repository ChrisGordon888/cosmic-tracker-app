"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_SACRED_YES, DELETE_SACRED_YES } from "@/graphql/sacredYes";
import { ALL_MOOD_ENTRIES, DELETE_MOOD_ENTRY } from "@/graphql/mood";
import { ALL_PRACTICE_QUESTS, DELETE_PRACTICE_QUEST } from "@/graphql/practiceQuest";

export default function ProfilePage() {
    const { data: session, status } = useSession();

    // Sacred Yes fetch + delete
    const { data: sacredYesData, loading: sacredLoading, error: sacredError, refetch: refetchSacred } = useQuery(
        ALL_SACRED_YES,
        { skip: !session }
    );
    const [deleteSacredYes, { loading: deletingSacred }] = useMutation(DELETE_SACRED_YES);

    // Mood fetch + delete
    const { data: moodData, loading: moodLoading, error: moodError, refetch: refetchMood } = useQuery(
        ALL_MOOD_ENTRIES,
        { skip: !session }
    );
    const [deleteMoodEntry, { loading: deletingMood }] = useMutation(DELETE_MOOD_ENTRY);

    // Practice Quests fetch + delete
    const { data: questsData, loading: questsLoading, error: questsError, refetch: refetchQuests } = useQuery(
        ALL_PRACTICE_QUESTS,
        { skip: !session }
    );
    const [deletePracticeQuest, { loading: deletingQuest }] = useMutation(DELETE_PRACTICE_QUEST);

    // Handle loading state of session
    if (status === "loading") {
        return (
            <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">⏳ Loading your profile...</h1>
            </main>
        );
    }

    // Block profile if user not logged in
    if (!session) {
        return (
            <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">🔒 Please Sign In</h1>
                <p className="text-gray-500 max-w-md">You need to be logged in to view your profile.</p>
            </main>
        );
    }

    return (
        <main className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">⚙️ Profile & Cosmic History</h1>
            <p className="mb-8 text-gray-600 dark:text-gray-300">
                Welcome, <span className="font-semibold">{session.user?.email}</span>! Review or manage your entries below:
            </p>

            {/* 🌟 Sacred Yes History with Delete */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-2">🌟 Sacred Yes History</h2>
                {sacredLoading && <p>Loading Sacred Yes entries...</p>}
                {sacredError && <p className="text-red-600">Error: {sacredError.message}</p>}
                {sacredYesData?.allSacredYes.length === 0 && (
                    <p className="text-gray-500">No Sacred Yes entries yet.</p>
                )}
                <ul className="space-y-2">
                    {sacredYesData?.allSacredYes.map((entry) => (
                        <li key={entry.id} className="border rounded p-2 flex justify-between items-center">
                            <span>
                                <strong>{entry.date}:</strong> {entry.text}
                            </span>
                            <button
                                className="text-red-500 hover:text-red-700 ml-4 disabled:opacity-50"
                                onClick={async () => {
                                    await deleteSacredYes({ variables: { id: entry.id } });
                                    refetchSacred();
                                }}
                                disabled={deletingSacred}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            {/* 🪷 Mood History with Delete */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-2">🪷 Mood History</h2>
                {moodLoading && <p>Loading mood entries...</p>}
                {moodError && <p className="text-red-600">Error: {moodError.message}</p>}
                {moodData?.allMoodEntries.length === 0 && (
                    <p className="text-gray-500">No mood entries yet.</p>
                )}
                <ul className="space-y-2">
                    {moodData?.allMoodEntries.map((entry) => (
                        <li key={entry.id} className="border rounded p-2 flex justify-between items-center">
                            <span>
                                <strong>{entry.date}:</strong> Mood {entry.mood} — {entry.note || "No notes"}
                            </span>
                            <button
                                className="text-red-500 hover:text-red-700 ml-4 disabled:opacity-50"
                                onClick={async () => {
                                    await deleteMoodEntry({ variables: { id: entry.id } });
                                    refetchMood();
                                }}
                                disabled={deletingMood}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            {/* 🧘 Practice Quest History (show truly completed only) */}
            <section>
                <h2 className="text-2xl font-semibold mb-2">🧘 Practice Quest History</h2>
                {questsLoading && <p>Loading quests...</p>}
                {questsError && <p className="text-red-600">Error: {questsError.message}</p>}
                {questsData?.allPracticeQuests.filter((q) => q.completedReps >= q.repetitions).length === 0 && (
                    <p className="text-gray-500">No completed quests yet.</p>
                )}
                <ul className="space-y-2">
                    {questsData?.allPracticeQuests
                        .filter((quest) => quest.completedReps >= quest.repetitions) // ✅ definitive check
                        .map((quest) => (
                            <li key={quest.id} className="border rounded p-2 flex justify-between items-center">
                                <span>
                                    <strong>{quest.date}:</strong> {quest.name} ({quest.completedReps}/{quest.repetitions})
                                    <span className="ml-2 text-green-600 font-bold">✅ Completed</span>
                                </span>
                                <button
                                    className="text-red-500 hover:text-red-700 ml-4 disabled:opacity-50"
                                    onClick={async () => {
                                        await deletePracticeQuest({ variables: { id: quest.id } });
                                        refetchQuests();
                                    }}
                                    disabled={deletingQuest}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                </ul>
            </section>
        </main>
    );
}