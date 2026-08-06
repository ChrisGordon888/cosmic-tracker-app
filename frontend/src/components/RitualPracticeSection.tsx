"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import { ALL_RITUALS } from "@/graphql/rituals";
import {
    GET_DAILY_QUESTS,
    UPDATE_PRACTICE_QUEST_PROGRESS,
} from "@/graphql/practiceQuest";
import "@/styles/ritualPracticeSection.css";

type Ritual = {
    id: string;
    title: string;
    description?: string | null;
};

type PracticeQuest = {
    id: string;
    name: string;
    description?: string | null;
    repetitions: number;
    completedReps: number;
    completed: boolean;
    ritualId?: string | null;
};

export default function RitualPracticeSection() {
    const { data: session } = useSession();
    const today = dayjs().format("YYYY-MM-DD");

    const {
        data: ritualsData,
        loading: ritualsLoading,
        error: ritualsError,
    } = useQuery(ALL_RITUALS, {
        skip: !session,
    });

    const {
        data: questsData,
        loading: questsLoading,
        error: questsError,
        refetch: refetchQuests,
    } = useQuery(GET_DAILY_QUESTS, {
        variables: { date: today },
        skip: !session,
    });

    const [updateProgress] = useMutation(UPDATE_PRACTICE_QUEST_PROGRESS);

    const handleUpdateProgress = async (
        quest: PracticeQuest,
        completedReps: number,
    ) => {
        if (quest.completed && completedReps < quest.repetitions) {
            const confirmed = confirm(
                "This practice is complete. Reducing progress will mark it incomplete. Continue?",
            );

            if (!confirmed) return;
        }

        try {
            await updateProgress({
                variables: {
                    id: quest.id,
                    completedReps,
                },
            });

            await refetchQuests();
        } catch (error) {
            console.error("Error updating ritual practice:", error);
        }
    };

    const rituals = (ritualsData?.allRituals ?? []) as Ritual[];
    const quests = (questsData?.getDailyQuests ?? []) as PracticeQuest[];

    const ritualGroups = rituals
        .map((ritual) => ({
            ritual,
            practices: quests.filter((quest) => quest.ritualId === ritual.id),
        }))
        .filter((group) => group.practices.length > 0);

    const unlinkedPractices = quests.filter((quest) => !quest.ritualId);
    const totalPractices = quests.length;
    const completedPractices = quests.filter(
        (quest) => quest.completedReps >= quest.repetitions,
    ).length;

    return (
        <section className="ritual-practice-card" aria-labelledby="ritual-practice-title">
            <div className="ritual-practice-header">
                <div>
                    <p className="ritual-practice-eyebrow">Active anchors</p>
                    <h2 id="ritual-practice-title">Ritual Practice</h2>
                </div>

                <div
                    className="ritual-practice-summary"
                    aria-label={`${completedPractices} of ${totalPractices} practices complete`}
                >
                    <strong>{completedPractices}</strong>
                    <span>of {totalPractices} complete</span>
                </div>
            </div>

            {(ritualsLoading || questsLoading) && (
                <p className="ritual-practice-status">Loading today&apos;s practices...</p>
            )}

            {ritualsError && (
                <p className="ritual-practice-status is-error" role="alert">
                    Unable to load rituals: {ritualsError.message}
                </p>
            )}

            {questsError && (
                <p className="ritual-practice-status is-error" role="alert">
                    Unable to load practices: {questsError.message}
                </p>
            )}

            {!questsLoading && totalPractices === 0 && (
                <div className="ritual-practice-empty">
                    <strong>No active practices today.</strong>
                    <p>Add a practice above and optionally connect it to a ritual.</p>
                </div>
            )}

            <div className="ritual-practice-groups">
                {ritualGroups.map(({ ritual, practices }) => (
                    <section key={ritual.id} className="ritual-practice-group">
                        <div className="ritual-practice-group-heading">
                            <div>
                                <p>Linked ritual</p>
                                <h3>{ritual.title}</h3>
                            </div>
                            <span>{practices.length}</span>
                        </div>

                        {ritual.description && (
                            <p className="ritual-practice-group-description">
                                {ritual.description}
                            </p>
                        )}

                        <div className="ritual-practice-list">
                            {practices.map((quest) => (
                                <PracticeItem
                                    key={quest.id}
                                    quest={quest}
                                    onUpdate={handleUpdateProgress}
                                />
                            ))}
                        </div>
                    </section>
                ))}

                {unlinkedPractices.length > 0 && (
                    <section className="ritual-practice-group">
                        <div className="ritual-practice-group-heading">
                            <div>
                                <p>Independent</p>
                                <h3>Daily Practices</h3>
                            </div>
                            <span>{unlinkedPractices.length}</span>
                        </div>

                        <div className="ritual-practice-list">
                            {unlinkedPractices.map((quest) => (
                                <PracticeItem
                                    key={quest.id}
                                    quest={quest}
                                    onUpdate={handleUpdateProgress}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </section>
    );
}

type PracticeItemProps = {
    quest: PracticeQuest;
    onUpdate: (quest: PracticeQuest, completedReps: number) => Promise<void>;
};

function PracticeItem({ quest, onUpdate }: PracticeItemProps) {
    const isComplete = quest.completedReps >= quest.repetitions;
    const progressPercent = Math.min(
        100,
        Math.round((quest.completedReps / Math.max(quest.repetitions, 1)) * 100),
    );

    return (
        <article className={`ritual-practice-item ${isComplete ? "is-complete" : ""}`}>
            <div className="ritual-practice-item-copy">
                <h4>{quest.name}</h4>
                {quest.description && <p>{quest.description}</p>}
            </div>

            <div className="ritual-practice-progress-row">
                <div className="ritual-practice-progress-copy">
                    <span>Progress</span>
                    <strong className="ritual-practice-progress">
                        {quest.completedReps} / {quest.repetitions}
                    </strong>
                </div>

                <div className="ritual-practice-controls">
                    <button
                        type="button"
                        onClick={() =>
                            onUpdate(quest, Math.max(0, quest.completedReps - 1))
                        }
                        disabled={quest.completedReps <= 0}
                        aria-label={`Decrease ${quest.name}`}
                    >
                        −
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onUpdate(
                                quest,
                                Math.min(quest.repetitions, quest.completedReps + 1),
                            )
                        }
                        disabled={quest.completedReps >= quest.repetitions}
                        aria-label={`Increase ${quest.name}`}
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="ritual-practice-track" aria-hidden="true">
                <span style={{ width: `${progressPercent}%` }} />
            </div>

            <p className={`ritual-practice-completion ${isComplete ? "is-complete" : ""}`}>
                {isComplete
                    ? "Complete"
                    : quest.completedReps > 0
                        ? "In progress"
                        : "Ready"}
            </p>
        </article>
    );
}
