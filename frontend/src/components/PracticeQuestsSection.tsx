"use client";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_DAILY_QUESTS, UPDATE_PRACTICE_QUEST_PROGRESS } from "@/graphql/practiceQuest";
import dayjs from "dayjs";

export default function PracticeQuestsSection() {
  const { data: session } = useSession();
  const today = dayjs().format("YYYY-MM-DD");

  const { data, loading, error, refetch } = useQuery(
    GET_DAILY_QUESTS,
    { variables: { date: today }, skip: !session }
  );
  const [updateProgress] = useMutation(UPDATE_PRACTICE_QUEST_PROGRESS);

  const handleUpdateQuest = async (id: string, newReps: number) => {
    try {
      await updateProgress({ variables: { id, completedReps: newReps } });
      refetch();
    } catch (e) {
      console.error("❌ Error updating quest progress:", e);
    }
  };

  return (
    <section className="mb-8 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 max-w-xl w-full text-left">
      <h2 className="text-xl font-semibold mb-2">🧘 Today's Spiritual Quests</h2>
      {loading && <p>Loading your cosmic quests...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {data?.getDailyQuests?.length === 0 && (
        <p className="text-gray-500">No quests today. Time to set some intentions! 🌙</p>
      )}
      {data?.getDailyQuests?.map((quest) => (
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
  );
}