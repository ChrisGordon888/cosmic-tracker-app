"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import {
    GET_DAILY_QUESTS,
    UPDATE_PRACTICE_QUEST_PROGRESS,
    DELETE_PRACTICE_QUEST,
} from "@/graphql/practiceQuest";
import { ALL_RITUALS } from "@/graphql/rituals";
import "@/styles/practiceQuests.css";

type PracticeQuest = {
    id: string;
    name: string;
    description?: string | null;
    repetitions: number;
    completedReps: number;
    completed: boolean;
    date: string;
    ritualId?: string | null;
    ritual?: {
        id: string;
        title: string;
        description?: string | null;
    } | null;
};

type Ritual = {
    id: string;
    title: string;
    description?: string | null;
};

export default function PracticeQuestsSection() {
    const { data: session } = useSession();
    const today = dayjs().format("YYYY-MM-DD");

    const {
        data: questsData,
        loading: questsLoading,
        error: questsError,
        refetch: refetchQuests,
    } = useQuery(GET_DAILY_QUESTS, {
        variables: { date: today },
        skip: !session,
    });

    const {
        data: ritualsData,
        loading: ritualsLoading,
        error: ritualsError,
    } = useQuery(ALL_RITUALS, {
        skip: !session,
    });

    const [updateProgress] = useMutation(UPDATE_PRACTICE_QUEST_PROGRESS);
    const [deleteQuest] = useMutation(DELETE_PRACTICE_QUEST, {
        onCompleted: () => refetchQuests(),
    });

    const handleUpdateQuest = async (quest: PracticeQuest, newReps: number) => {
        if (quest.completed && newReps < quest.repetitions) {
            const confirmed = confirm(
                `This practice is complete. Reducing progress below ${quest.repetitions} will mark it incomplete. Continue?`,
            );
            if (!confirmed) return;
        }

        try {
            const { data } = await updateProgress({
                variables: {
                    id: quest.id,
                    completedReps: newReps,
                },
            });

            if (data?.updatePracticeQuestProgress) {
                await refetchQuests();
            }
        } catch (e) {
            console.error("Error updating practice progress:", e);
        }
    };

    const handleDeleteQuest = async (questId: string) => {
        if (!confirm("Delete this practice? This cannot be undone.")) return;

        try {
            await deleteQuest({ variables: { id: questId } });
            await refetchQuests();
        } catch (e) {
            console.error("Failed to delete practice:", e);
        }
    };

    const quests = (questsData?.getDailyQuests ?? []) as PracticeQuest[];
    const rituals = (ritualsData?.allRituals ?? []) as Ritual[];
    const completedCount = quests.filter(
        (quest) => quest.completedReps >= quest.repetitions,
    ).length;

    return (
        <section className="practice-quests-card" aria-labelledby="practice-quests-title">
            <div className="practice-quests-header">
                <div>
                    <p className="practice-quests-eyebrow">Today&apos;s motion</p>
                    <h2 id="practice-quests-title">Daily Practices</h2>
                </div>

                <div className="practice-quests-summary" aria-label={`${completedCount} of ${quests.length} complete`}>
                    <strong>{completedCount}</strong>
                    <span>of {quests.length} complete</span>
                </div>
            </div>

            {(questsLoading || ritualsLoading) && (
                <p className="inner-status">Loading practices and rituals...</p>
            )}

            {questsError && (
                <p className="inner-status is-error" role="alert">
                    Unable to load practices: {questsError.message}
                </p>
            )}

            {ritualsError && (
                <p className="inner-status is-error" role="alert">
                    Unable to load rituals: {ritualsError.message}
                </p>
            )}

            {!questsLoading && quests.length === 0 && (
                <div className="practice-quests-empty">
                    <strong>No practices scheduled today.</strong>
                    <p>Add one from the Today workspace when you are ready to move the commitment forward.</p>
                </div>
            )}

            <div className="practice-quests-list">
                {quests.map((quest) => {
                    const ritual =
                        quest.ritual ??
                        rituals.find((ritualItem) => ritualItem.id === quest.ritualId);

                    const isComplete = quest.completedReps >= quest.repetitions;
                    const progressPercent = Math.min(
                        100,
                        Math.round((quest.completedReps / Math.max(quest.repetitions, 1)) * 100),
                    );

                    return (
                        <article
                            key={quest.id}
                            className={`practice-quests-item ${isComplete ? "is-complete" : ""}`}
                        >
                            <div className="practice-quests-item-header">
                                <div>
                                    <p className="practice-quests-item-kicker">
                                        {ritual ? "Linked ritual" : "Independent practice"}
                                    </p>
                                    <h3 className="practice-quests-item-title">{quest.name}</h3>
                                </div>

                                <button
                                    type="button"
                                    className="delete-btn"
                                    onClick={() => handleDeleteQuest(quest.id)}
                                    aria-label={`Delete ${quest.name}`}
                                    title="Delete practice"
                                >
                                    Delete
                                </button>
                            </div>

                            {ritual && (
                                <p className="practice-quests-ritual">
                                    <span>Ritual</span>
                                    <strong>{ritual.title}</strong>
                                </p>
                            )}

                            {quest.description && (
                                <p className="practice-quests-description">{quest.description}</p>
                            )}

                            <div className="practice-quests-progress-row">
                                <div>
                                    <span>Progress</span>
                                    <strong>
                                        {quest.completedReps} / {quest.repetitions}
                                    </strong>
                                </div>

                                <div className="practice-quests-controls">
                                    <button
                                        type="button"
                                        className="minus-btn"
                                        onClick={() =>
                                            handleUpdateQuest(
                                                quest,
                                                Math.max(0, quest.completedReps - 1),
                                            )
                                        }
                                        disabled={quest.completedReps <= 0}
                                        aria-label={`Decrease progress for ${quest.name}`}
                                    >
                                        −
                                    </button>

                                    <button
                                        type="button"
                                        className="plus-btn"
                                        onClick={() =>
                                            handleUpdateQuest(
                                                quest,
                                                Math.min(quest.repetitions, quest.completedReps + 1),
                                            )
                                        }
                                        disabled={quest.completedReps >= quest.repetitions}
                                        aria-label={`Increase progress for ${quest.name}`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="practice-quests-progress-track" aria-hidden="true">
                                <span style={{ width: `${progressPercent}%` }} />
                            </div>

                            <p className={`practice-quests-status ${isComplete ? "is-complete" : ""}`}>
                                {isComplete
                                    ? "Complete"
                                    : quest.completedReps > 0
                                        ? "In progress"
                                        : "Ready"}
                            </p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
