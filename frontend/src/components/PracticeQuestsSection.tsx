"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_DAILY_QUESTS, UPDATE_PRACTICE_QUEST_PROGRESS, DELETE_PRACTICE_QUEST } from "@/graphql/practiceQuest";
import { ALL_RITUALS } from "@/graphql/rituals";
import dayjs from "dayjs";

export default function PracticeQuestsSection() {
    const { data: session } = useSession();
    const today = dayjs().format("YYYY-MM-DD");

    const { data: questsData, loading: questsLoading, error: questsError, refetch: refetchQuests } = useQuery(
        GET_DAILY_QUESTS,
        { variables: { date: today }, skip: !session }
    );

    const { data: ritualsData, loading: ritualsLoading, error: ritualsError } = useQuery(
        ALL_RITUALS,
        { skip: !session }
    );

    const [updateProgress] = useMutation(UPDATE_PRACTICE_QUEST_PROGRESS);
    const [deleteQuest] = useMutation(DELETE_PRACTICE_QUEST, {
        onCompleted: () => refetchQuests(),
    });

    const handleUpdateQuest = async (quest, newReps) => {
        if (quest.completed && newReps < quest.repetitions) {
            const confirmed = confirm(
                `⚠️ This quest is marked complete. Reducing reps below ${quest.repetitions} will reset your reward. Continue?`
            );
            if (!confirmed) return;
        }

        try {
            const { data } = await updateProgress({ variables: { id: quest.id, completedReps: newReps } });

            // optional but recommended: update Apollo cache instantly with returned quest
            if (data?.updatePracticeQuestProgress) {
                // you could update cache manually here if desired, but refetch is simpler:
                refetchQuests();
            }
        } catch (e) {
            console.error("❌ Error updating quest progress:", e);
        }
    };

    const handleDeleteQuest = async (questId) => {
        const confirmed = confirm("🗑️ Are you sure you want to delete this quest?");
        if (!confirmed) return;

        try {
            await deleteQuest({ variables: { id: questId } });
            refetchQuests(); // force refresh quests after deletion
        } catch (e) {
            console.error("❌ Failed to delete quest:", e);
        }
    };

    return (
        <section className="mb-8 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 max-w-xl w-full text-left">
            <h2 className="text-xl font-semibold mb-2">🧘 Today's Spiritual Quests</h2>

            {(questsLoading || ritualsLoading) && <p>Loading your quests and rituals...</p>}
            {questsError && <p className="text-red-600">Error: {questsError.message}</p>}
            {ritualsError && <p className="text-red-600">Error: {ritualsError.message}</p>}

            {questsData?.getDailyQuests?.length === 0 && (
                <p className="text-gray-500">No quests today. Time to set some intentions! 🌙</p>
            )}

            {questsData?.getDailyQuests?.map((quest) => {
                const ritual = ritualsData?.allRituals?.find((r) => r.id === quest.ritualId);

                return (
                    <div key={quest.id} className="border rounded p-4 mb-4 transition-transform hover:scale-[1.02]">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold">{quest.name}</h3>
                            <button
                                onClick={() => handleDeleteQuest(quest.id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                🗑️ Delete
                            </button>
                        </div>

                        {ritual && (
                            <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                                🔮 Linked Ritual: <span className="font-semibold">{ritual.title}</span>
                            </p>
                        )}

                        {quest.description && (
                            <p className="text-sm text-gray-500 mb-2">{quest.description}</p>
                        )}

                        <div className="flex items-center gap-4 mb-2">
                            <button
                                className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                                onClick={() => handleUpdateQuest(quest, Math.max(0, quest.completedReps - 1))}
                                disabled={quest.completedReps <= 0}
                            >
                                -
                            </button>
                            <span className="font-bold text-lg">{quest.completedReps} / {quest.repetitions}</span>
                            <button
                                className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                                onClick={() => handleUpdateQuest(quest, quest.completedReps + 1)}
                                disabled={quest.completedReps >= quest.repetitions}
                            >
                                +
                            </button>
                        </div>

                        {quest.completedReps >= quest.repetitions ? (
                            <p className="text-green-600 font-semibold animate-pulse">✅ Completed! Cosmic mastery unlocked.</p>
                        ) : (
                            quest.completedReps > 0 && (
                                <p className="text-yellow-500 font-semibold">⚡ Keep going! You're making progress.</p>
                            )
                        )}
                    </div>
                );
            })}
        </section>
    );
}