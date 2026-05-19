'use client';

import { useRef, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import RealmGuidanceCard from '@/components/realm/RealmGuidanceCard';
import RealmSoundstage from '@/components/realm/RealmSoundstage';
import RealmEntryGuidanceBanner from '@/components/realm/RealmEntryGuidanceBanner';
import TrialPuzzle from '@/components/realm/TrialPuzzle';
import '@/styles/realmShared.css';
import '@/styles/realm44.css';
import { useQuery, useMutation } from '@apollo/client';
import {
    GET_ME,
    COMPLETE_TRIAL_STEP,
    START_TRIAL,
    VISIT_LOCATION,
    UNLOCK_REALM,
} from '@/graphql/realms';
import { REALM_44_PUZZLES } from '@/lib/realmPuzzles';

const REALM_ID = 44;
const NEXT_REALM_ID = 0;
const REALM_COLOR = '#10B981';
const PREVIOUS_REALM_ID = 55;

export default function Realm44() {
    const { data: session, status } = useSession();
    const [showProgression, setShowProgression] = useState(false);

    const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME, {
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
    });

    const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
    const [startTrial] = useMutation(START_TRIAL);
    const [visitLocation] = useMutation(VISIT_LOCATION);
    const [unlockNextRealm] = useMutation(UNLOCK_REALM);

    const hasUnlockedRef = useRef(false);
    const locationsSectionRef = useRef<HTMLDivElement>(null);
    const [isBusy, setIsBusy] = useState(false);

    const user = userData?.me;
    const userLevel = user?.level ?? 1;
    const userXP = user?.xp ?? 0;
    const xpToNext = user?.xpToNextLevel ?? 100;
    const safeXpToNext = Math.max(xpToNext, 1);
    const xpPercent = Math.min((userXP / safeXpToNext) * 100, 100);

    const realmTrials =
        user?.completedTrials?.filter((t: any) => Number(t.realmId) === REALM_ID) ?? [];

    const completedTrialsCount = realmTrials.filter(
        (t: any) => t.isComplete || (t.stepsCompleted ?? 0) >= 3
    ).length;

    const realmProgress = Math.floor((completedTrialsCount / 3) * 100);

    const getTrial = (trialId: string) =>
        realmTrials.find((t: any) => t.trialId === trialId);

    const realmLocs =
        user?.visitedLocations?.filter((l: any) => Number(l.realmId) === REALM_ID) ?? [];

    const hasVisited = (locationId: string) =>
        realmLocs.some((l: any) => l.locationId === locationId);

    const trial1 = getTrial('trial-barter-of-truth');
    const trial2 = getTrial('trial-discernment');
    const trial3 = getTrial('trial-sacred-exchange');

    const isInterSiddhiUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);

    useEffect(() => {
        if (completedTrialsCount >= 3 && !hasUnlockedRef.current && user) {
            const alreadyUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);

            if (!alreadyUnlocked) {
                hasUnlockedRef.current = true;
                unlockNextRealm({ variables: { realmId: NEXT_REALM_ID } })
                    .then(() => {
                        refetch();
                    })
                    .catch((err) => {
                        console.error('Unlock error:', err);
                        hasUnlockedRef.current = false;
                    });
            } else {
                hasUnlockedRef.current = true;
            }
        }
    }, [completedTrialsCount, user, unlockNextRealm, refetch]);

    const handleStartTrial = async (trialId: string, trialName: string) => {
        if (isBusy) return;

        try {
            setIsBusy(true);
            await startTrial({ variables: { realmId: REALM_ID, trialId, trialName } });
            await refetch();
        } catch (e: any) {
            console.error(e);
            alert('Error starting trial: ' + (e.message ?? 'Unknown error'));
        } finally {
            setIsBusy(false);
        }
    };

    const advanceTrialStep = async (trialId: string) => {
        if (isBusy) return;

        try {
            setIsBusy(true);
            const result = await completeTrialStep({
                variables: { realmId: REALM_ID, trialId },
            });
            alert(result.data.completeTrialStep.message);
            await refetch();
        } catch (e: any) {
            console.error(e);
            alert('Error: ' + (e.message ?? 'Something went wrong'));
        } finally {
            setIsBusy(false);
        }
    };

    const handleLocationVisit = async (locationId: string, locationName: string) => {
        if (isBusy) return;

        try {
            setIsBusy(true);

            const result = await visitLocation({
                variables: { realmId: REALM_ID, locationId, locationName },
            });

            const visitMessage = result.data.visitLocation.message;

            if (
                locationId === 'merchant-quarter' &&
                trial1 &&
                !trial1.isComplete &&
                trial1.stepsCompleted === 0
            ) {
                const stepResult = await completeTrialStep({
                    variables: { realmId: REALM_ID, trialId: 'trial-barter-of-truth' },
                });

                alert(`${visitMessage}\n${stepResult.data.completeTrialStep.message}`);
                await refetch();
                return;
            }

            if (
                locationId === 'gamblers-den' &&
                trial2 &&
                !trial2.isComplete &&
                trial2.stepsCompleted === 0
            ) {
                const stepResult = await completeTrialStep({
                    variables: { realmId: REALM_ID, trialId: 'trial-discernment' },
                });

                alert(`${visitMessage}\n${stepResult.data.completeTrialStep.message}`);
                await refetch();
                return;
            }

            alert(visitMessage);
            await refetch();
        } catch (e: any) {
            console.error(e);
            alert('Error: ' + (e.message ?? 'Something went wrong'));
        } finally {
            setIsBusy(false);
        }
    };

    if (status === 'loading' || userLoading) {
        return (
            <div className="min-h-screen grid place-items-center p-6 nexus-shell">
                <div className="glass-card nexus-panel max-w-md text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full border border-white/15 grid place-items-center"
                        style={{ color: REALM_COLOR }}>
                        ◇
                    </div>

                    <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                        Entering Realm
                    </p>

                    <h1 className="text-3xl font-display mb-3">Astral Bazaar</h1>

                    <p className="text-secondary">
                        Syncing realm progress, music state, and exchange path.
                    </p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen grid place-items-center p-6 nexus-shell">
                <div className="glass-card nexus-panel max-w-md text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full border border-white/15 grid place-items-center"
                        style={{ color: REALM_COLOR }}>
                        ✦
                    </div>

                    <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                        Realm Locked
                    </p>

                    <h1 className="text-3xl font-display mb-3">Sign in to enter</h1>

                    <p className="text-secondary mb-6">
                        Save realm progress, XP, listening history, and trial completion.
                    </p>

                    <Link href="/auth" className="btn-primary">
                        Open Cosmic Access
                    </Link>
                </div>
            </div>
        );
    }

    const merchantQuarterUnlocked = !!trial1;
    const gamblersDenUnlocked = !!trial2;

    const trial1Puzzle =
        trial1 && !trial1.isComplete && trial1.stepsCompleted >= 1
            ? REALM_44_PUZZLES['trial-barter-of-truth']?.steps[trial1.stepsCompleted - 1]
            : null;

    const trial2Puzzle =
        trial2 && !trial2.isComplete && trial2.stepsCompleted >= 1
            ? REALM_44_PUZZLES['trial-discernment']?.steps[trial2.stepsCompleted - 1]
            : null;

    const trial3Puzzle =
        trial3 && !trial3.isComplete
            ? REALM_44_PUZZLES['trial-sacred-exchange']?.steps[trial3.stepsCompleted]
            : null;

    return (
        <>
            <RealmBackground
                videoSrc="/astral-bazaar_CityScape1.mp4"
                realmName="Astral Bazaar"
                overlayOpacity={0.45}
            />

            <div className="min-h-screen pb-32 realm-44-shell">
                <div className="container mx-auto px-4 py-8 max-w-6xl realm-44-container">
                    <header className="text-center mb-10 fade-in realm-44-hero">
                        <div className="realm-44-symbol-mark mb-4">◇</div>

                        <h1 className="text-5xl md:text-6xl font-display mb-2 realm-44-title">
                            ASTRAL BAZAAR
                        </h1>

                        <p className="text-xl text-secondary mb-2">[ REALM 44 ]</p>
                        <p className="text-lg text-muted">
                            Value &amp; Exchange • Where Everything Has Its Price
                        </p>

                        <div className="mt-6 flex justify-center items-center gap-4">
                            <div className="level-badge">LVL {userLevel}</div>

                            <div className="flex-1 max-w-xs">
                                <div className="stat-bar">
                                    <div className="stat-bar-fill" style={{ width: `${xpPercent}%` }} />
                                </div>

                                <p className="text-sm text-secondary mt-1">
                                    {userXP} / {safeXpToNext} XP
                                </p>
                            </div>
                        </div>
                    </header>

                    <RealmEntryGuidanceBanner
                        realmId={44}
                        realmName="Astral Bazaar"
                        realmColor={REALM_COLOR}
                    />

                    <RealmGuidanceCard realmId={44} />

                    <RealmSoundstage
                        realmId={44}
                        realmName="Astral Bazaar"
                        realmIcon="◇"
                        realmColor={REALM_COLOR}
                        intro="Astral Bazaar is where discernment, value, temptation, reciprocity, and wise exchange come into focus. Let the soundtrack tell you whether this realm matches what you need to evaluate right now."
                        supportText="Start with the music first. If this realm feels true, then go deeper into its trials, locations, and symbols."
                        progress={realmProgress}
                        isUnlocked={true}
                        isCurrentRealm={true}
                        compactOnMobile
                    />

                    <div
                        className="glass-card realm-44-overview p-6 mb-8 fade-in"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-display mb-3">Realm Overview</h2>

                                <p className="text-secondary mb-4">
                                    The Astral Bazaar is the realm of value, boundaries, discernment,
                                    and exchange. It is where glitter is tested, motives are revealed,
                                    and what is truly worth your energy becomes clear.
                                </p>

                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-secondary">Realm Path Progress</span>
                                        <span className="text-stats">{realmProgress}%</span>
                                    </div>

                                    <div className="stat-bar">
                                        <div
                                            className="stat-bar-fill realm-44-bar"
                                            style={{ width: `${realmProgress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="text-sm text-muted">
                                    {completedTrialsCount} of 3 optional realm trials complete
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-[260px]">
                                <div className="glass-card p-4 text-center">
                                    <div className="text-2xl font-display text-glow realm-44-glow">
                                        {completedTrialsCount} / 3
                                    </div>
                                    <div className="text-xs text-muted">Realm Path Trials</div>
                                </div>

                                <div className="glass-card p-4 text-center">
                                    <div className="text-2xl font-display text-glow">
                                        {isInterSiddhiUnlocked ? 'Unlocked' : 'Locked'}
                                    </div>
                                    <div className="text-xs text-muted">Next Realm</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="glass-card p-4 mb-8 fade-in realm-44-progression-toggle"
                        style={{ animationDelay: '0.15s' }}
                    >
                        <button
                            onClick={() => setShowProgression((prev) => !prev)}
                            className="w-full flex items-center justify-between text-left"
                        >
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-1">
                                    Optional Realm Path
                                </p>

                                <h2 className="text-xl font-display">
                                    Explore value, discernment, and exchange
                                </h2>

                                <p className="text-sm text-muted mt-1">
                                    The music is the entry point. Open the realm path when you want to move
                                    deeper into boundaries, temptation, reciprocity, and worth.
                                </p>
                            </div>

                            <div className="text-2xl text-white/70 shrink-0 ml-4">
                                {showProgression ? '▾' : '▸'}
                            </div>
                        </button>
                    </div>

                    {showProgression && (
                        <>
                            <div className="mb-8 fade-in">
                                <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
                                    <span className="text-glow">✦</span>
                                    REALM PATH
                                </h2>

                                <div className="space-y-6">
                                    <div className="quest-card fade-in" style={{ animationDelay: '0.2s' }}>
                                        <div className="flex items-start gap-4">
                                            <div className="text-4xl">◇</div>

                                            <div className="flex-1">
                                                <h3 className="text-xl font-display mb-2">
                                                    Trial of the Barter of Truth
                                                </h3>

                                                <p className="text-sm text-secondary mb-3">
                                                    Learn what truth costs. Know what should never be traded away.
                                                </p>

                                                <div className="mb-4">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Progress</span>
                                                        <span>{trial1?.stepsCompleted ?? 0} / 3 Steps</span>
                                                    </div>

                                                    <div className="stat-bar">
                                                        <div
                                                            className="stat-bar-fill realm-44-bar"
                                                            style={{ width: `${((trial1?.stepsCompleted ?? 0) / 3) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {trial1?.isComplete ? (
                                                    <div className="text-green-400 font-bold">✓ Complete</div>
                                                ) : !trial1 ? (
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() =>
                                                            handleStartTrial(
                                                                'trial-barter-of-truth',
                                                                'Trial of the Barter of Truth'
                                                            )
                                                        }
                                                        disabled={isBusy}
                                                    >
                                                        Begin Realm Path →
                                                    </button>
                                                ) : trial1.stepsCompleted === 0 && !hasVisited('merchant-quarter') ? (
                                                    <>
                                                        <p className="text-sm text-muted italic mb-3">
                                                            Visit <strong>The Merchant Quarter</strong> below to unlock Step 1.
                                                        </p>

                                                        <button
                                                            className="btn-secondary"
                                                            onClick={() =>
                                                                locationsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                                                            }
                                                            disabled={isBusy}
                                                        >
                                                            Go to Locations ↓
                                                        </button>
                                                    </>
                                                ) : trial1Puzzle ? (
                                                    <TrialPuzzle
                                                        key={`trial-barter-of-truth-${trial1.stepsCompleted}`}
                                                        puzzle={trial1Puzzle}
                                                        onSolved={() => advanceTrialStep('trial-barter-of-truth')}
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`quest-card fade-in ${!trial1?.isComplete ? 'opacity-50' : ''}`}
                                        style={{ animationDelay: '0.3s' }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-4xl">◈</div>

                                            <div className="flex-1">
                                                <h3 className="text-xl font-display mb-2">
                                                    Trial of Discernment
                                                </h3>

                                                {!trial1?.isComplete ? (
                                                    <p className="text-sm text-muted italic">
                                                        Locked — complete Trial of the Barter of Truth to unlock
                                                    </p>
                                                ) : (
                                                    <>
                                                        <p className="text-sm text-secondary mb-3">
                                                            Glitter and gold look the same to the untrained eye. Learn to see the difference.
                                                        </p>

                                                        <div className="mb-4">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span>Progress</span>
                                                                <span>{trial2?.stepsCompleted ?? 0} / 3 Steps</span>
                                                            </div>

                                                            <div className="stat-bar">
                                                                <div
                                                                    className="stat-bar-fill realm-44-bar"
                                                                    style={{ width: `${((trial2?.stepsCompleted ?? 0) / 3) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {trial2?.isComplete ? (
                                                            <div className="text-green-400 font-bold">✓ Complete</div>
                                                        ) : !trial2 ? (
                                                            <button
                                                                className="btn-primary"
                                                                onClick={() =>
                                                                    handleStartTrial('trial-discernment', 'Trial of Discernment')
                                                                }
                                                                disabled={isBusy}
                                                            >
                                                                Begin Trial of Discernment →
                                                            </button>
                                                        ) : trial2.stepsCompleted === 0 && !hasVisited('gamblers-den') ? (
                                                            <>
                                                                <p className="text-sm text-muted italic mb-3">
                                                                    Visit <strong>The Gambler&apos;s Den</strong> below to unlock Step 1.
                                                                </p>

                                                                <button
                                                                    className="btn-secondary"
                                                                    onClick={() =>
                                                                        locationsSectionRef.current?.scrollIntoView({
                                                                            behavior: 'smooth',
                                                                        })
                                                                    }
                                                                    disabled={isBusy}
                                                                >
                                                                    Go to Locations ↓
                                                                </button>
                                                            </>
                                                        ) : trial2Puzzle ? (
                                                            <TrialPuzzle
                                                                key={`trial-discernment-${trial2.stepsCompleted}`}
                                                                puzzle={trial2Puzzle}
                                                                onSolved={() => advanceTrialStep('trial-discernment')}
                                                            />
                                                        ) : null}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`quest-card fade-in ${!trial2?.isComplete ? 'opacity-50' : ''}`}
                                        style={{ animationDelay: '0.4s' }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-4xl">∞</div>

                                            <div className="flex-1">
                                                <h3 className="text-xl font-display mb-2">
                                                    Trial of Sacred Exchange
                                                </h3>

                                                {!trial2?.isComplete ? (
                                                    <p className="text-sm text-muted italic">
                                                        Locked — complete Trial of Discernment to unlock
                                                    </p>
                                                ) : (
                                                    <>
                                                        <p className="text-sm text-secondary mb-3">
                                                            A sacred exchange leaves both sides more whole. Master the art of giving and receiving in integrity.
                                                        </p>

                                                        <div className="mb-4">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span>Progress</span>
                                                                <span>{trial3?.stepsCompleted ?? 0} / 3 Steps</span>
                                                            </div>

                                                            <div className="stat-bar">
                                                                <div
                                                                    className="stat-bar-fill realm-44-bar"
                                                                    style={{ width: `${((trial3?.stepsCompleted ?? 0) / 3) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {trial3?.isComplete ? (
                                                            <div className="text-green-400 font-bold">✓ Complete</div>
                                                        ) : !trial3 ? (
                                                            <button
                                                                className="btn-primary"
                                                                onClick={() =>
                                                                    handleStartTrial(
                                                                        'trial-sacred-exchange',
                                                                        'Trial of Sacred Exchange'
                                                                    )
                                                                }
                                                                disabled={isBusy}
                                                            >
                                                                Begin Trial of Sacred Exchange →
                                                            </button>
                                                        ) : trial3Puzzle ? (
                                                            <TrialPuzzle
                                                                key={`trial-sacred-exchange-${trial3.stepsCompleted}`}
                                                                puzzle={trial3Puzzle}
                                                                onSolved={() => advanceTrialStep('trial-sacred-exchange')}
                                                            />
                                                        ) : null}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div ref={locationsSectionRef} id="locations-section" className="mb-8 fade-in">
                                <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
                                    <span className="text-glow">⌖</span>
                                    LOCATIONS
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        className={`realm-portal fade-in ${merchantQuarterUnlocked ? 'unlocked' : 'opacity-50'
                                            }`}
                                        style={{ animationDelay: '0.5s' }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-4xl">▦</div>

                                            <div className="flex-1">
                                                <h3 className="text-lg font-display mb-2">
                                                    The Merchant Quarter
                                                </h3>

                                                <p className="text-sm text-secondary mb-1">
                                                    Endless stalls selling memories, skills, and impossible artefacts.
                                                </p>

                                                {!merchantQuarterUnlocked ? (
                                                    <p className="text-xs text-muted italic mb-3">
                                                        Begin Trial of the Barter of Truth to unlock this location.
                                                    </p>
                                                ) : !hasVisited('merchant-quarter') ? (
                                                    <p className="text-xs text-glow mb-3">
                                                        Required for Trial of the Barter of Truth — Step 1
                                                    </p>
                                                ) : null}

                                                <button
                                                    className="btn-secondary w-full"
                                                    onClick={() =>
                                                        handleLocationVisit('merchant-quarter', 'The Merchant Quarter')
                                                    }
                                                    disabled={
                                                        !merchantQuarterUnlocked || hasVisited('merchant-quarter') || isBusy
                                                    }
                                                >
                                                    {hasVisited('merchant-quarter')
                                                        ? 'Explored'
                                                        : !merchantQuarterUnlocked
                                                            ? 'Locked'
                                                            : 'Explore →'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`realm-portal fade-in ${gamblersDenUnlocked ? 'unlocked' : 'opacity-50'
                                            }`}
                                        style={{ animationDelay: '0.6s' }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-4xl">◈</div>

                                            <div className="flex-1">
                                                <h3 className="text-lg font-display mb-2">
                                                    The Gambler&apos;s Den
                                                </h3>

                                                <p className="text-sm text-secondary mb-1">
                                                    Where fortunes shift with every choice and discernment decides the cost.
                                                </p>

                                                {!gamblersDenUnlocked ? (
                                                    <p className="text-xs text-muted italic mb-3">
                                                        Begin Trial of Discernment to unlock this location.
                                                    </p>
                                                ) : !hasVisited('gamblers-den') ? (
                                                    <p className="text-xs text-glow mb-3">
                                                        Required for Trial of Discernment — Step 1
                                                    </p>
                                                ) : null}

                                                <button
                                                    className="btn-secondary w-full"
                                                    onClick={() => handleLocationVisit('gamblers-den', "The Gambler's Den")}
                                                    disabled={!gamblersDenUnlocked || hasVisited('gamblers-den') || isBusy}
                                                >
                                                    {hasVisited('gamblers-den')
                                                        ? 'Explored'
                                                        : !gamblersDenUnlocked
                                                            ? 'Locked'
                                                            : 'Explore →'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {completedTrialsCount >= 3 && (
                        <div className="glass-card p-8 mb-8 text-center fade-in realm-44-complete-card">
                            <h3 className="text-2xl font-display mb-4" style={{ color: REALM_COLOR }}>
                                ASTRAL BAZAAR MASTERED
                            </h3>

                            <p className="text-secondary mb-6 max-w-2xl mx-auto">
                                You have mastered discernment and the art of exchange. The final realm awaits —
                                InterSiddhi, where all paths converge at the source.
                            </p>

                            <Link href="/realms/0">
                                <button
                                    className="btn-primary"
                                    style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}
                                >
                                    Enter InterSiddhi →
                                </button>
                            </Link>
                        </div>
                    )}

                    <div
                        className="flex flex-col sm:flex-row justify-between items-center gap-4 fade-in"
                        style={{ animationDelay: '0.8s' }}
                    >
                        <Link href={`/realms/${PREVIOUS_REALM_ID}`}>
                            <button className="btn-secondary">← Skybound City</button>
                        </Link>

                        <Link href="/nexus">
                            <button className="btn-secondary">Back to Nexus</button>
                        </Link>

                        {isInterSiddhiUnlocked ? (
                            <Link href={`/realms/${NEXT_REALM_ID}`}>
                                <button className="btn-primary">InterSiddhi →</button>
                            </Link>
                        ) : (
                            <div className="text-sm text-muted text-center">
                                Next Realm: ∞ InterSiddhi Locked
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}