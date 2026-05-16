"use client";

import { useQuery, useMutation } from "@apollo/client";
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
    description: string;
};

type PracticeQuest = {
    id: string;
    name: string;
    description?: string | null;
    repetitions: number;
    completedReps: number;
    completed: boolean;
    date: string;
    ritualId?: string | null;
};

export default function RitualPracticeSection() {
    const today = dayjs().format("YYYY-MM-DD");

    const {
        data: ritualsData,
        loading: ritualsLoading,
        error: ritualsError,
    } = useQuery(ALL_RITUALS);

    const {
        data: questsData,
        loading: questsLoading,
        error: questsError,
        refetch: refetchQuests,
    } = useQuery(GET_DAILY_QUESTS, {
        variables: { date: today },
    });

    const [updateQuestProgress] = useMutation(UPDATE_PRACTICE_QUEST_PROGRESS);

    const handleUpdateQuest = async (id: string, newReps: number) => {
        try {
            await updateQuestProgress({
                variables: { id, completedReps: newReps },
            });
            refetchQuests();
        } catch (e) {
            console.error("❌ Error updating quest progress:", e);
        }
    };

    if (ritualsLoading || questsLoading) {
        return <p>Loading rituals & quests...</p>;
    }

    if (ritualsError) {
        return (
            <p className="text-red-600">
                Error loading rituals: {ritualsError.message}
            </p>
        );
    }

    if (questsError) {
        return (
            <p className="text-red-600">
                Error loading quests: {questsError.message}
            </p>
        );
    }

    const rituals: Ritual[] = ritualsData?.allRituals ?? [];
    const quests: PracticeQuest[] = questsData?.getDailyQuests ?? [];

    return (
        <section className="ritual-practice-card">
            <h2>📿 Ritual Practices</h2>

            {rituals.length === 0 ? (
                <p className="text-gray-500">
                    You haven’t added any rituals yet. Create one on the Rituals page!
                </p>
            ) : (
                rituals.map((ritual: Ritual) => {
                    const ritualQuests = quests.filter(
                        (quest: PracticeQuest) => quest.ritualId === ritual.id
                    );

                    return (
                        <div key={ritual.id} className="ritual-practice-item">
                            <h3>{ritual.title}</h3>
                            <p>{ritual.description}</p>

                            {ritualQuests.length === 0 ? (
                                <p className="text-gray-500 italic">
                                    No practice quests linked for today.
                                </p>
                            ) : (
                                ritualQuests.map((quest: PracticeQuest) => (
                                    <div
                                        key={quest.id}
                                        className="ritual-practice-subitem"
                                    >
                                        <div>
                                            <p className="font-bold">{quest.name}</p>
                                            <p className="text-sm text-gray-400">
                                                {quest.description}
                                            </p>
                                        </div>

                                        <div className="ritual-practice-controls">
                                            <button
                                                onClick={() =>
                                                    handleUpdateQuest(
                                                        quest.id,
                                                        Math.max(0, quest.completedReps - 1)
                                                    )
                                                }
                                                disabled={quest.completedReps <= 0}
                                            >
                                                -
                                            </button>

                                            <span className="ritual-practice-progress">
                                                {quest.completedReps}/{quest.repetitions}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    handleUpdateQuest(
                                                        quest.id,
                                                        quest.completedReps + 1
                                                    )
                                                }
                                                disabled={
                                                    quest.completedReps >= quest.repetitions
                                                }
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