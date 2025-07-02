"use client";

import { useQuery, useMutation } from "@apollo/client";
import dayjs from "dayjs";
import { ALL_RITUALS } from "@/graphql/rituals";
import { GET_DAILY_QUESTS, UPDATE_PRACTICE_QUEST_PROGRESS } from "@/graphql/practiceQuest";

export default function RitualPracticeSection() {
    const today = dayjs().format("YYYY-MM-DD");

    // 📡 Fetch rituals and today's quests with date variable
    const { data: ritualsData, loading: ritualsLoading, error: ritualsError } = useQuery(ALL_RITUALS);
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

    if (ritualsLoading || questsLoading) return <p>Loading rituals & quests...</p>;
    if (ritualsError) return <p className="text-red-600">Error loading rituals: {ritualsError.message}</p>;
    if (questsError) return <p className="text-red-600">Error loading quests: {questsError.message}</p>;

    return (
        <section className="mb-8 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 max-w-xl w-full text-left">
            <h2 className="text-2xl font-bold mb-4">📿 Ritual Practices</h2>

            {ritualsData?.allRituals.length === 0 ? (
                <p className="text-gray-500">You haven’t added any rituals yet. Create one on the Rituals page!</p>
            ) : (
                ritualsData.allRituals.map((ritual) => {
                    const ritualQuests = questsData?.getDailyQuests?.filter(
                        (quest) => quest.ritualId === ritual.id
                    ) || [];

                    return (
                        <div key={ritual.id} className="border rounded p-4 mb-6 bg-gray-50 dark:bg-gray-900">
                            <h3 className="text-xl font-semibold mb-2">{ritual.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">{ritual.description}</p>

                            {ritualQuests.length === 0 ? (
                                <p className="text-gray-500 italic">No practice quests linked for today.</p>
                            ) : (
                                ritualQuests.map((quest) => (
                                    <div key={quest.id} className="border-t pt-2 mt-2 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold">{quest.name}</p>
                                            <p className="text-sm text-gray-500">{quest.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                                                onClick={() => handleUpdateQuest(quest.id, Math.max(0, quest.completedReps - 1))}
                                                disabled={quest.completedReps <= 0}
                                            >
                                                -
                                            </button>
                                            <span className="font-bold">{quest.completedReps}/{quest.repetitions}</span>
                                            <button
                                                className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                                                onClick={() => handleUpdateQuest(quest.id, quest.completedReps + 1)}
                                                disabled={quest.completedReps >= quest.repetitions}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    );
                })
            )}
        </section>
    );
}