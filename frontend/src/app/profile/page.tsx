"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_SACRED_YES, DELETE_SACRED_YES } from "@/graphql/sacredYes";
import { ALL_MOOD_ENTRIES, DELETE_MOOD_ENTRY } from "@/graphql/mood";
import { ALL_PRACTICE_QUESTS, DELETE_PRACTICE_QUEST } from "@/graphql/practiceQuest";
import "@/styles/profilePage.css";
import CosmicBackground from "@/components/CosmicBackground"; // ✅ moving cosmic background


export default function ProfilePage() {
    const { data: session, status } = useSession();

    const { data: sacredYesData, loading: sacredLoading, error: sacredError, refetch: refetchSacred } = useQuery(
        ALL_SACRED_YES, { skip: !session }
    );
    const [deleteSacredYes, { loading: deletingSacred }] = useMutation(DELETE_SACRED_YES);

    const { data: moodData, loading: moodLoading, error: moodError, refetch: refetchMood } = useQuery(
        ALL_MOOD_ENTRIES, { skip: !session }
    );
    const [deleteMoodEntry, { loading: deletingMood }] = useMutation(DELETE_MOOD_ENTRY);

    const { data: questsData, loading: questsLoading, error: questsError, refetch: refetchQuests } = useQuery(
        ALL_PRACTICE_QUESTS, { skip: !session }
    );
    const [deletePracticeQuest, { loading: deletingQuest }] = useMutation(DELETE_PRACTICE_QUEST);

    if (status === "loading") {
        return (
            <main className="profile-page flex flex-col items-center justify-center min-h-screen p-8 text-center">
                <h1>⏳ Loading your profile...</h1>
            </main>
        );
    }

    if (!session) {
        return (
            <main className="profile-page flex flex-col items-center justify-center min-h-screen p-8 text-center">
                <h1>🔒 Please Sign In</h1>
                <p>You need to be logged in to view your profile.</p>
            </main>
        );
    }

    return (
        <main className="profile-page min-h-screen flex flex-col items-center justify-start p-6 relative overflow-hidden">
            <CosmicBackground /> {/* 🔮 background at the back */}
            
            <h1>⚙️ Profile & Cosmic History</h1>
            <p>Welcome, <span className="highlight">{session.user?.email}</span>! Review or manage your entries below:</p>

            {/* 🌟 Sacred Yes History */}
            <section className="mb-12">
                <h2>🌟 Sacred Yes History</h2>
                {sacredLoading && <p>Loading Sacred Yes entries...</p>}
                {sacredError && <p className="error-text">Error: {sacredError.message}</p>}
                {sacredYesData?.allSacredYes.length === 0 && (
                    <p>No Sacred Yes entries yet.</p>
                )}
                <ul className="space-y-4">
                    {sacredYesData?.allSacredYes.map((entry) => (
                        <li key={entry.id} className="sacred-entry flex justify-between items-center">
                            <span><strong>{entry.date}:</strong> {entry.text}</span>
                            <button
                                className="delete-icon-btn"
                                onClick={async () => {
                                    await deleteSacredYes({ variables: { id: entry.id } });
                                    refetchSacred();
                                }}
                                disabled={deletingSacred}
                                title="Delete entry"
                            >
                                🗑️
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            {/* 🪷 Mood History */}
            <section className="mb-12">
                <h2 className="mood-header">🪷 Mood History</h2>
                {moodLoading && <p>Loading mood entries...</p>}
                {moodError && <p className="text-red-600">Error: {moodError.message}</p>}
                {moodData?.allMoodEntries.length === 0 && (
                    <p className="text-gray-500">No mood entries yet.</p>
                )}
                <ul className="space-y-4">
                    {moodData?.allMoodEntries.map((entry) => (
                        <li key={entry.id} className="mood-entry flex justify-between items-center">
                            <span>
                                <strong>{entry.date}:</strong> Mood {entry.mood} — {entry.note || "No notes"}
                            </span>
                            <button
                                className="delete-icon-btn"
                                onClick={async () => {
                                    await deleteMoodEntry({ variables: { id: entry.id } });
                                    refetchMood();
                                }}
                                disabled={deletingMood}
                                title="Delete entry"
                            >
                                🗑️
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            {/* 🧘 Practice Quest History */}
            <section>
                <h2>🧘 Practice Quest History</h2>
                {questsLoading && <p>Loading quests...</p>}
                {questsError && <p className="error-text">Error: {questsError.message}</p>}
                {questsData?.allPracticeQuests.filter((q) => q.completedReps >= q.repetitions).length === 0 && (
                    <p>No completed quests yet.</p>
                )}
                <ul className="space-y-4">
                    {questsData?.allPracticeQuests
                        .filter((quest) => quest.completedReps >= quest.repetitions)
                        .map((quest) => (
                            <li key={quest.id} className="quest-entry flex justify-between items-center">
                                <span>
                                    <strong>{quest.date}:</strong> {quest.name} ({quest.completedReps}/{quest.repetitions})
                                    <span className="completed-text"> ✅ Completed</span>
                                </span>
                                <button
                                    className="delete-icon-btn"
                                    onClick={async () => {
                                        await deletePracticeQuest({ variables: { id: quest.id } });
                                        refetchQuests();
                                    }}
                                    disabled={deletingQuest}
                                    title="Delete entry"
                                >
                                    🗑️
                                </button>
                            </li>
                        ))}
                </ul>
            </section>
        </main>
    );
}