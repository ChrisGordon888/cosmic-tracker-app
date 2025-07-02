import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_DAILY_QUESTS, UPDATE_PRACTICE_QUEST_PROGRESS, DELETE_PRACTICE_QUEST } from "@/graphql/practiceQuest";
import { ALL_RITUALS } from "@/graphql/rituals";
import dayjs from "dayjs";
import "@/styles/practiceQuests.css";

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
  const [deleteQuest] = useMutation(DELETE_PRACTICE_QUEST, { onCompleted: () => refetchQuests() });

  const handleUpdateQuest = async (quest, newReps) => {
    if (quest.completed && newReps < quest.repetitions) {
      const confirmed = confirm(
        `⚠️ This quest is marked complete. Reducing reps below ${quest.repetitions} will reset your reward. Continue?`
      );
      if (!confirmed) return;
    }
    try {
      const { data } = await updateProgress({ variables: { id: quest.id, completedReps: newReps } });
      if (data?.updatePracticeQuestProgress) refetchQuests();
    } catch (e) {
      console.error("❌ Error updating quest progress:", e);
    }
  };

  const handleDeleteQuest = async (questId) => {
    if (!confirm("🗑️ Are you sure you want to delete this quest?")) return;
    try {
      await deleteQuest({ variables: { id: questId } });
      refetchQuests();
    } catch (e) {
      console.error("❌ Failed to delete quest:", e);
    }
  };

  return (
    <section className="practice-quests-card">
      <h2 className="practice-quests-title">🧘 Today's Spiritual Quests</h2>

      {(questsLoading || ritualsLoading) && <p>Loading your quests and rituals...</p>}
      {questsError && <p className="text-red-600">Error: {questsError.message}</p>}
      {ritualsError && <p className="text-red-600">Error: {ritualsError.message}</p>}

      {questsData?.getDailyQuests?.length === 0 && (
        <p className="practice-quests-empty">No quests today. Time to set some intentions! 🌙</p>
      )}

      {questsData?.getDailyQuests?.map((quest) => {
        const ritual = ritualsData?.allRituals?.find((r) => r.id === quest.ritualId);

        return (
          <div key={quest.id} className="practice-quests-item">
            <button
              className="delete-btn"
              onClick={() => handleDeleteQuest(quest.id)}
            >
              🗑️
            </button>

            <h3 className="practice-quests-item-title">{quest.name}</h3>

            {ritual && (
              <p className="practice-quests-ritual">
                🔮 Linked Ritual: <span className="font-semibold">{ritual.title}</span>
              </p>
            )}

            {quest.description && <p className="practice-quests-description">{quest.description}</p>}

            <div className="practice-quests-controls">
              <button
                className="minus-btn"
                onClick={() => handleUpdateQuest(quest, Math.max(0, quest.completedReps - 1))}
                disabled={quest.completedReps <= 0}
              >
                -
              </button>
              <span className="practice-quests-progress">{quest.completedReps} / {quest.repetitions}</span>
              <button
                className="plus-btn"
                onClick={() => handleUpdateQuest(quest, quest.completedReps + 1)}
                disabled={quest.completedReps >= quest.repetitions}
              >
                +
              </button>
            </div>

            {quest.completedReps >= quest.repetitions ? (
              <p className="practice-quests-complete">✅ Completed! Cosmic mastery unlocked.</p>
            ) : (
              quest.completedReps > 0 && (
                <p className="practice-quests-progress-note">⚡ Keep going! You're making progress.</p>
              )
            )}
          </div>
        );
      })}
    </section>
  );
}