'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import '@/styles/realmShared.css';
import {
    REALM_DISPLAY_ORDER,
    REALM_STATE_MAP,
    type ExperienceMode,
    type RealmId,
} from '@/lib/realmStateMap';
import { REALM_ALIGNMENT_QUESTIONS } from '@/lib/realmAlignmentQuestions';
import { REALM_RESULT_CONTENT } from '@/lib/realmResultContent';
import { MUSIC_REGISTRY } from '@/lib/musicRegistry';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';

type SelectedAnswers = Record<string, number>;

function getRecommendedRealm(selectedAnswers: SelectedAnswers): RealmId | null {
    const scores: Record<RealmId, number> = {
        303: 0,
        202: 0,
        101: 0,
        55: 0,
        44: 0,
        0: 0,
    };

    REALM_ALIGNMENT_QUESTIONS.forEach((question) => {
        const selectedOptionIndex = selectedAnswers[question.id];
        if (selectedOptionIndex === undefined) return;

        const selectedOption = question.options[selectedOptionIndex];
        if (!selectedOption) return;

        Object.entries(selectedOption.realmWeights).forEach(([realmId, weight]) => {
            const numericRealmId = Number(realmId) as RealmId;
            scores[numericRealmId] += weight ?? 0;
        });
    });

    let bestRealm: RealmId | null = null;
    let bestScore = -1;

    for (const realmId of REALM_DISPLAY_ORDER) {
        const score = scores[realmId];
        if (score > bestScore) {
            bestScore = score;
            bestRealm = realmId;
        }
    }

    return bestRealm;
}

export default function FindYourRealmPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
    const [experienceMode, setExperienceMode] = useState<ExperienceMode>('move-through');
    const [showResult, setShowResult] = useState(false);

    const { playOrToggleTrack, currentTrack, isPlaying } = useMusicPlayer();

    const currentQuestion = REALM_ALIGNMENT_QUESTIONS[currentQuestionIndex];
    const totalQuestions = REALM_ALIGNMENT_QUESTIONS.length;

    const recommendedRealmId = useMemo(
        () => getRecommendedRealm(selectedAnswers),
        [selectedAnswers]
    );

    const recommendedRealm = recommendedRealmId
        ? REALM_STATE_MAP[recommendedRealmId]
        : null;

    const realmResult = recommendedRealmId
        ? REALM_RESULT_CONTENT[recommendedRealmId]
        : null;

    const modeContent =
        realmResult?.modeVariants[experienceMode] ?? null;

    const suggestedTrack = useMemo(() => {
        if (!recommendedRealmId || !modeContent) return null;

        return (
            MUSIC_REGISTRY.find(
                (track) =>
                    track.realmId === recommendedRealmId &&
                    track.trackTitle === modeContent.recommendedTrack
            ) ?? null
        );
    }, [recommendedRealmId, modeContent]);

    const allQuestionsAnswered =
        Object.keys(selectedAnswers).length === REALM_ALIGNMENT_QUESTIONS.length;

    const saveRealmAlignment = (
        realmId: RealmId,
        mode: ExperienceMode,
        recommendedTrack: string,
        reflectionPrompt: string
    ) => {
        try {
            window.localStorage.setItem(
                'cosmic:lastRealmAlignment',
                JSON.stringify({
                    realmId,
                    mode,
                    recommendedTrack,
                    reflectionPrompt,
                    savedAt: new Date().toISOString(),
                })
            );
        } catch (error) {
            console.warn('Failed to save realm alignment:', error);
        }
    };

    const handleSelectOption = (optionIndex: number) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: optionIndex,
        }));
    };

    const handleNext = () => {
        if (selectedAnswers[currentQuestion.id] === undefined) return;

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            return;
        }

        if (recommendedRealmId) {
            const suggestedMode = REALM_RESULT_CONTENT[recommendedRealmId].defaultMode;
            const suggestedContent =
                REALM_RESULT_CONTENT[recommendedRealmId].modeVariants[suggestedMode];

            setExperienceMode(suggestedMode);
            saveRealmAlignment(
                recommendedRealmId,
                suggestedMode,
                suggestedContent.recommendedTrack,
                suggestedContent.reflectionPrompt
            );
        }

        setShowResult(true);
    };

    const handleBack = () => {
        if (showResult) {
            setShowResult(false);
            return;
        }

        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleReset = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setExperienceMode('move-through');
        setShowResult(false);
    };

    const handleModeSelect = (mode: ExperienceMode) => {
        setExperienceMode(mode);

        if (recommendedRealmId) {
            const nextModeContent = REALM_RESULT_CONTENT[recommendedRealmId].modeVariants[mode];

            saveRealmAlignment(
                recommendedRealmId,
                mode,
                nextModeContent.recommendedTrack,
                nextModeContent.reflectionPrompt
            );
        }
    };


    return (
        <>
            <RealmBackground
                videoSrc="/nexus-cockpit.mp4"
                realmName="Find Your Realm"
                overlayOpacity={0.35}
            />

            <div className="min-h-screen pb-32">
                <div className="container mx-auto px-4 py-8 max-w-5xl">
                    <header className="text-center mb-10 fade-in">
                        <h1 className="text-5xl md:text-6xl font-display neon-glow mb-4">
                            ✨ FIND YOUR REALM ✨
                        </h1>
                        <p className="text-xl text-secondary max-w-3xl mx-auto">
                            Cosmic Multiverse helps you navigate inner states through symbolic realms,
                            immersive sound, and guided discovery.
                        </p>
                        <p className="text-sm text-muted mt-4 max-w-2xl mx-auto">
                            Answer a few questions about what you are moving through right now,
                            and the multiverse will suggest a realm to enter.
                        </p>
                    </header>

                    {!showResult ? (
                        <div className="glass-card p-8 fade-in">
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>
                                        Question {currentQuestionIndex + 1} of {totalQuestions}
                                    </span>
                                    <span>
                                        {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
                                    </span>
                                </div>

                                <div className="stat-bar">
                                    <div
                                        className="stat-bar-fill"
                                        style={{
                                            width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <h2 className="text-2xl font-display mb-6">{currentQuestion.prompt}</h2>

                            <div className="space-y-4">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = selectedAnswers[currentQuestion.id] === index;

                                    return (
                                        <button
                                            key={option.label}
                                            onClick={() => handleSelectOption(index)}
                                            className={`w-full text-left rounded-2xl border p-5 transition-all ${isSelected
                                                ? 'border-white/60 bg-white/10 shadow-lg'
                                                : 'border-white/10 bg-white/5 hover:bg-white/8'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 text-lg">{isSelected ? '◉' : '○'}</div>
                                                <div>
                                                    <p className="font-display text-lg">{option.label}</p>
                                                    {option.description && (
                                                        <p className="text-sm text-secondary mt-1">
                                                            {option.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between items-center mt-8">
                                <button
                                    onClick={handleBack}
                                    className="btn-secondary"
                                    disabled={currentQuestionIndex === 0}
                                >
                                    ← Back
                                </button>

                                <button
                                    onClick={handleNext}
                                    className="btn-primary"
                                    disabled={selectedAnswers[currentQuestion.id] === undefined}
                                >
                                    {currentQuestionIndex === totalQuestions - 1 ? 'Reveal My Realm →' : 'Next →'}
                                </button>
                            </div>
                        </div>
                    ) : recommendedRealm && realmResult && modeContent ? (
                        <div className="glass-card p-8 fade-in">
                            <div className="text-center mb-8">
                                <div className="text-6xl mb-4">{recommendedRealm.icon}</div>
                                <p className="text-sm text-secondary mb-2">
                                    Recommended Realm • [{recommendedRealm.realmNumber}]
                                </p>
                                <h2
                                    className="text-4xl md:text-5xl font-display mb-4"
                                    style={{ color: recommendedRealm.color }}
                                >
                                    {recommendedRealm.realmName}
                                </h2>
                                <p className="text-lg text-secondary max-w-2xl mx-auto">
                                    {realmResult.resultStatement}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="quest-card">
                                    <h3 className="text-xl font-display mb-3">Why this realm fits</h3>
                                    <p className="text-secondary">{realmResult.whyRealmFits}</p>
                                </div>

                                <div className="quest-card">
                                    <h3 className="text-xl font-display mb-3">Why enter it</h3>
                                    <p className="text-secondary">{recommendedRealm.whyEnterIt}</p>
                                </div>
                            </div>

                            <div className="quest-card mb-8">
                                <h3 className="text-xl font-display mb-3">What this realm helps with</h3>
                                <div className="flex flex-wrap gap-2">
                                    {recommendedRealm.helpsWith.map((item) => (
                                        <span
                                            key={item}
                                            className="px-3 py-1 rounded-full text-sm"
                                            style={{
                                                background: `${recommendedRealm.color}22`,
                                                border: `1px solid ${recommendedRealm.color}55`,
                                                color: recommendedRealm.color,
                                            }}
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div
                                    className="glass-card p-6"
                                    style={{
                                        border: `1px solid ${recommendedRealm.color}33`,
                                        background: `${recommendedRealm.color}10`,
                                    }}
                                >
                                    <p className="text-sm text-secondary uppercase tracking-[0.18em] mb-2">
                                        Recommended Track
                                    </p>
                                    <h3
                                        className="text-2xl font-display mb-3"
                                        style={{ color: recommendedRealm.color }}
                                    >
                                        {modeContent.recommendedTrack}
                                    </h3>
                                    <p className="text-secondary text-sm">{modeContent.whyMusicFits}</p>
                                </div>

                                <div className="quest-card">
                                    <p className="text-sm text-secondary uppercase tracking-[0.18em] mb-2">
                                        Reflection Prompt
                                    </p>
                                    <p className="text-lg text-secondary italic">
                                        “{modeContent.reflectionPrompt}”
                                    </p>
                                </div>
                            </div>

                            <div className="glass-card p-6 mb-8">
                                <h3 className="text-2xl font-display mb-4">How do you want to use this realm?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        {
                                            value: 'stay' as ExperienceMode,
                                            title: 'Stay with this state',
                                            description: 'Be met where you are.',
                                        },
                                        {
                                            value: 'move-through' as ExperienceMode,
                                            title: 'Move through this state',
                                            description: 'Process and navigate it.',
                                        },
                                        {
                                            value: 'shift' as ExperienceMode,
                                            title: 'Shift toward another state',
                                            description: 'Begin moving elsewhere.',
                                        },
                                    ].map((mode) => {
                                        const isSelected = experienceMode === mode.value;
                                        const isSuggested = realmResult.defaultMode === mode.value;

                                        return (
                                            <button
                                                key={mode.value}
                                                onClick={() => handleModeSelect(mode.value)}
                                                className={`text-left rounded-2xl border p-5 transition-all relative ${isSelected
                                                    ? 'border-white/60 bg-white/10 shadow-lg'
                                                    : 'border-white/10 bg-white/5 hover:bg-white/8'
                                                    }`}
                                            >
                                                {isSuggested && (
                                                    <span
                                                        className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full"
                                                        style={{
                                                            background: `${recommendedRealm.color}22`,
                                                            border: `1px solid ${recommendedRealm.color}55`,
                                                            color: recommendedRealm.color,
                                                        }}
                                                    >
                                                        Suggested
                                                    </span>
                                                )}

                                                <p className="font-display text-lg mb-2">{mode.title}</p>
                                                <p className="text-sm text-secondary">{mode.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div
                                    className="mt-5 rounded-2xl p-4"
                                    style={{
                                        background: `${recommendedRealm.color}14`,
                                        border: `1px solid ${recommendedRealm.color}33`,
                                    }}
                                >
                                    <p className="text-sm text-secondary">{modeContent.modeDescription}</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <div className="flex gap-3 flex-wrap">
                                    <button onClick={handleBack} className="btn-secondary">
                                        ← Back to Questions
                                    </button>
                                    <button onClick={handleReset} className="btn-secondary">
                                        Retake Quiz
                                    </button>
                                </div>

                                <div className="flex gap-3 flex-wrap">
                                    <Link href="/nexus">
                                        <button className="btn-secondary">Back to Nexus</button>
                                    </Link>

                                    {suggestedTrack && (
                                        <button
                                            onClick={() => playOrToggleTrack(suggestedTrack)}
                                            className="btn-secondary"
                                        >
                                            {currentTrack?.id === suggestedTrack.id
                                                ? isPlaying
                                                    ? 'Pause Suggested Track'
                                                    : 'Resume Suggested Track'
                                                : '▶ Play Suggested Track'}
                                        </button>
                                    )}

                                    <Link href={recommendedRealm.route}>
                                        <button className="btn-primary">
                                            Enter {recommendedRealm.realmName} →
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {allQuestionsAnswered && (
                                <p className="text-xs text-muted mt-6 text-center">
                                    This recommendation has been saved to your Nexus as Today’s Realm Guidance.
                                    You can always choose a different realm if another one feels more true today.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="glass-card p-8 text-center fade-in">
                            <h2 className="text-2xl font-display mb-4">No realm detected yet</h2>
                            <p className="text-secondary mb-6">
                                Something interrupted the alignment flow. Reset and try again.
                            </p>
                            <button onClick={handleReset} className="btn-primary">
                                Restart Alignment
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}