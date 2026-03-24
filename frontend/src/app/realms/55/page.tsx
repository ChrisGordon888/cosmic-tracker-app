'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';

import RealmBackground from '@/components/realm/RealmBackground';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';
import TrialPuzzle from '@/components/realm/TrialPuzzle';
import { REALM_55_PUZZLES } from '@/lib/realmPuzzles';

import '@/styles/realmShared.css';
import '@/styles/realm55.css';

import {
    GET_ME,
    COMPLETE_TRIAL_STEP,
    START_TRIAL,
    VISIT_LOCATION,
    UNLOCK_REALM,
} from '@/graphql/realms';

const REALM_ID = 55;
const NEXT_REALM_ID = 44;
const TOTAL_TRIALS = 3;
const STEPS_PER_TRIAL = 2;

type TrialRecord = {
    realmId: number;
    trialId: string;
    stepsCompleted: number;
    isComplete: boolean;
};

type LocationRecord = {
    realmId: number;
    locationId: string;
};

type TrialCardProps = {
    icon: string;
    title: string;
    description: string;
    started: boolean;
    unlocked: boolean;
    complete: boolean;
    stepsCompleted: number;
    startLabel: string;
    locationStepLabel?: string;
    locationStepHelp?: string;
    canShowLocationPrompt?: boolean;
    onStart: () => Promise<void>;
    puzzleNode?: React.ReactNode;
    lockedMessage?: string;
};

function TrialCard({
    icon,
    title,
    description,
    started,
    unlocked,
    complete,
    stepsCompleted,
    startLabel,
    locationStepLabel,
    locationStepHelp,
    canShowLocationPrompt = false,
    onStart,
    puzzleNode,
    lockedMessage,
}: TrialCardProps) {
    return (
        <div className={`quest-card fade-in ${!unlocked ? 'opacity-50' : ''}`}>
            <div className="flex items-start gap-4">
                <div className="text-4xl">{icon}</div>

                <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">{title}</h3>

                    {!unlocked ? (
                        <p className="text-sm text-muted italic">{lockedMessage}</p>
                    ) : (
                        <>
                            <p className="text-sm text-secondary mb-3">{description}</p>

                            <div className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Progress</span>
                                    <span>
                                        {stepsCompleted} / {STEPS_PER_TRIAL} Steps
                                    </span>
                                </div>

                                <div className="stat-bar">
                                    <div
                                        className="stat-bar-fill realm-55-bar"
                                        style={{
                                            width: `${(stepsCompleted / STEPS_PER_TRIAL) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {complete ? (
                                <div className="text-green-400 font-bold">✓ COMPLETE</div>
                            ) : !started ? (
                                <>
                                    <button className="btn-primary mt-2" onClick={onStart}>
                                        {startLabel}
                                    </button>
                                    <p className="text-xs text-muted mt-2">
                                        🔒 Start the trial to begin progression.
                                    </p>
                                </>
                            ) : canShowLocationPrompt ? (
                                <>
                                    <button
                                        className="btn-primary mt-2"
                                        onClick={() =>
                                            document
                                                .getElementById('locations-section')
                                                ?.scrollIntoView({ behavior: 'smooth' })
                                        }
                                    >
                                        {locationStepLabel}
                                    </button>
                                    <p className="text-xs text-muted mt-2">{locationStepHelp}</p>
                                </>
                            ) : (
                                puzzleNode
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Realm55() {
    const { data: session, status } = useSession();

    const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME);
    const [startTrial] = useMutation(START_TRIAL);
    const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
    const [visitLocation] = useMutation(VISIT_LOCATION);
    const [unlockNextRealm] = useMutation(UNLOCK_REALM);

    const hasUnlockedRef = useRef(false);
    const [busyKey, setBusyKey] = useState<string | null>(null);

    const user = userData?.me;
    const userLevel = user?.level ?? 1;
    const userXP = user?.xp ?? 0;
    const xpToNext = user?.xpToNextLevel ?? 100;
    const safeXpToNext = Math.max(xpToNext, 1);
    const xpPercent = Math.min((userXP / safeXpToNext) * 100, 100);

    const realmTrials: TrialRecord[] =
        user?.completedTrials?.filter((t: TrialRecord) => t.realmId === REALM_ID) ?? [];

    const realmLocations: LocationRecord[] =
        user?.visitedLocations?.filter((l: LocationRecord) => l.realmId === REALM_ID) ?? [];

    const getTrial = (trialId: string) =>
        realmTrials.find((t) => t.trialId === trialId);

    const hasVisited = (locationId: string) =>
        realmLocations.some((l) => l.locationId === locationId);

    const trialAscent = getTrial('trial-ascent');
    const trialCommand = getTrial('trial-command');
    const trialSummit = getTrial('trial-summit-will');

    const ascentStarted = !!trialAscent;
    const commandStarted = !!trialCommand;
    const summitStarted = !!trialSummit;

    const ascentSteps = trialAscent?.stepsCompleted ?? 0;
    const commandSteps = trialCommand?.stepsCompleted ?? 0;
    const summitSteps = trialSummit?.stepsCompleted ?? 0;

    const ascentComplete = !!trialAscent?.isComplete;
    const commandComplete = !!trialCommand?.isComplete;
    const summitComplete = !!trialSummit?.isComplete;

    const completedTrialsCount = realmTrials.filter((t) => t.isComplete).length;
    const realmProgress = Math.floor((completedTrialsCount / TOTAL_TRIALS) * 100);

    const isAstralBazaarUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);

    const ascentPuzzles = REALM_55_PUZZLES['trial-ascent']?.steps ?? [];
    const commandPuzzles = REALM_55_PUZZLES['trial-command']?.steps ?? [];
    const summitPuzzles = REALM_55_PUZZLES['trial-summit-will']?.steps ?? [];

    const activeAscentPuzzle = useMemo(() => {
        if (!ascentStarted || ascentComplete) return null;
        if (ascentSteps === 1) return ascentPuzzles[0] ?? null;
        return null;
    }, [ascentStarted, ascentComplete, ascentPuzzles, ascentSteps]);

    const activeCommandPuzzle = useMemo(() => {
        if (!commandStarted || commandComplete) return null;
        if (commandSteps === 1) return commandPuzzles[0] ?? null;
        return null;
    }, [commandStarted, commandComplete, commandPuzzles, commandSteps]);

    const activeSummitPuzzle = useMemo(() => {
        if (!summitStarted || summitComplete) return null;
        return summitPuzzles[summitSteps] ?? null;
    }, [summitStarted, summitComplete, summitPuzzles, summitSteps]);

    useEffect(() => {
        if (!user) return;
        if (completedTrialsCount < TOTAL_TRIALS) return;
        if (hasUnlockedRef.current) return;

        const alreadyUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);

        if (alreadyUnlocked) {
            hasUnlockedRef.current = true;
            return;
        }

        hasUnlockedRef.current = true;

        unlockNextRealm({ variables: { realmId: NEXT_REALM_ID } })
            .then(() => refetch())
            .catch((err) => {
                console.error('Unlock error:', err);
                hasUnlockedRef.current = false;
            });
    }, [completedTrialsCount, refetch, unlockNextRealm, user]);

    const ensureTrialStarted = async (trialId: string, trialName: string) => {
        const actionKey = `start:${trialId}`;
        if (busyKey === actionKey) return;

        try {
            setBusyKey(actionKey);
            await startTrial({
                variables: { realmId: REALM_ID, trialId, trialName },
            });
            await refetch();
        } catch (error: any) {
            console.error('Start trial error:', error);
            alert('Error: ' + (error.message ?? 'Unable to start trial'));
        } finally {
            setBusyKey(null);
        }
    };

    const advanceTrialStep = async (trialId: string, prefixMessage?: string) => {
        const actionKey = `step:${trialId}`;
        if (busyKey === actionKey) return;

        try {
            setBusyKey(actionKey);

            const result = await completeTrialStep({
                variables: { realmId: REALM_ID, trialId },
            });

            const trialMessage = result?.data?.completeTrialStep?.message ?? 'Step completed.';

            if (prefixMessage) {
                alert(`${prefixMessage}\n${trialMessage}`);
            } else {
                alert(trialMessage);
            }

            await refetch();
        } catch (error: any) {
            console.error('Complete step error:', error);
            alert('Error: ' + (error.message ?? 'Unable to complete step'));
        } finally {
            setBusyKey(null);
        }
    };

    const handleLocationVisit = async (locationId: string, locationName: string) => {
        const actionKey = `visit:${locationId}`;
        if (busyKey === actionKey) return;

        try {
            setBusyKey(actionKey);

            const result = await visitLocation({
                variables: { realmId: REALM_ID, locationId, locationName },
            });

            const visitMessage = result?.data?.visitLocation?.message ?? 'Location visited.';

            if (locationId === 'tower-of-ascension' && ascentStarted && ascentSteps === 0) {
                await advanceTrialStep('trial-ascent', visitMessage);
                return;
            }

            if (locationId === 'arena-of-kings' && commandStarted && commandSteps === 0) {
                await advanceTrialStep('trial-command', visitMessage);
                return;
            }

            alert(visitMessage);
            await refetch();
        } catch (error: any) {
            console.error('Location error:', error);
            alert('Error: ' + (error.message ?? 'Something went wrong'));
        } finally {
            setBusyKey(null);
        }
    };

    if (status === 'loading' || userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="neon-glow text-4xl mb-4">⛰️</div>
                    <p className="text-xl">Ascending to Skybound City...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="glass-card p-12 max-w-md text-center">
                    <h1 className="text-4xl font-display neon-glow mb-4">🔒 ACCESS DENIED</h1>
                    <p className="text-lg text-secondary mb-8">
                        You must be logged in to enter this realm.
                    </p>
                    <Link href="/auth" className="btn-primary">
                        SIGN IN
                    </Link>
                </div>
            </div>
        );
    }

    const canExploreTower = ascentStarted && !ascentComplete && ascentSteps === 0;
    const canExploreArena = commandStarted && !commandComplete && commandSteps === 0;

    return (
        <>
            <RealmBackground
                videoSrc="/skybound-city_CityScape1.mp4"
                realmName="Skybound City"
                overlayOpacity={0.4}
            />

            <div className="min-h-screen pb-32">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <header className="text-center mb-12 fade-in">
                        <div className="text-6xl mb-4 neon-glow">⛰️</div>
                        <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-55-title">
                            SKYBOUND CITY
                        </h1>
                        <p className="text-xl text-secondary mb-2">[ REALM 55 ]</p>
                        <p className="text-lg text-muted">
                            Power & Manifestation • Where Will Becomes Reality
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

                    <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-3xl font-display mb-4">⚡ THE CITADEL OF WILL ⚡</h2>
                        <p className="text-lg text-secondary mb-4">
                            Skybound City floats above the clouds, a gleaming metropolis where
                            thought becomes form and intention shapes reality.
                        </p>
                        <p className="text-secondary mb-6">
                            This is a realm of earned ascent, disciplined command, and the will
                            required to hold what has been manifested at the summit.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="glass-card p-4 text-center">
                                <div className="text-2xl font-display text-glow realm-55-glow">
                                    {realmProgress}%
                                </div>
                                <div className="text-xs text-muted">Progress</div>
                            </div>

                            <div className="glass-card p-4 text-center">
                                <div className="text-2xl font-display text-glow">
                                    {completedTrialsCount} / {TOTAL_TRIALS}
                                </div>
                                <div className="text-xs text-muted">Trials Complete</div>
                            </div>

                            <div className="glass-card p-4 text-center">
                                <div className="text-2xl font-display text-glow">
                                    {realmLocations.length}
                                </div>
                                <div className="text-xs text-muted">Locations Visited</div>
                            </div>

                            <div className="glass-card p-4 text-center">
                                <div className="text-2xl font-display text-glow">
                                    {isAstralBazaarUnlocked ? 'Unlocked' : 'Locked'}
                                </div>
                                <div className="text-xs text-muted">Next Realm</div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
                            <span className="text-glow">🎯</span> REALM TRIALS{' '}
                            <span className="text-glow">🎯</span>
                        </h2>

                        <div className="space-y-4">
                            <TrialCard
                                icon="🏔️"
                                title="Trial of Ascent"
                                description="Rise through resistance. Begin the climb, enter the tower, and prove your elevation is earned."
                                started={ascentStarted}
                                unlocked={true}
                                complete={ascentComplete}
                                stepsCompleted={ascentSteps}
                                startLabel="BEGIN TRIAL OF ASCENT →"
                                locationStepLabel="STEP 1: ENTER THE TOWER OF ASCENSION →"
                                locationStepHelp="🔒 Visit The Tower of Ascension to complete the first step."
                                canShowLocationPrompt={ascentStarted && ascentSteps === 0}
                                onStart={() => ensureTrialStarted('trial-ascent', 'Trial of Ascent')}
                                puzzleNode={
                                    activeAscentPuzzle ? (
                                        <>
                                            <TrialPuzzle
                                                puzzle={activeAscentPuzzle}
                                                onSolved={async () => {
                                                    await advanceTrialStep('trial-ascent');
                                                }}
                                            />
                                            <p className="text-xs text-muted mt-2">
                                                🔒 Solve the ascent puzzle to complete the climb.
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-xs text-muted mt-2">
                                            Waiting for the next ascent step...
                                        </p>
                                    )
                                }
                            />

                            <TrialCard
                                icon="⚡"
                                title="Trial of Command"
                                description="Direct force with clarity. Enter the arena and demonstrate command without chaos."
                                started={commandStarted}
                                unlocked={ascentComplete}
                                complete={commandComplete}
                                stepsCompleted={commandSteps}
                                startLabel="BEGIN TRIAL OF COMMAND →"
                                locationStepLabel="STEP 1: ENTER THE ARENA OF KINGS →"
                                locationStepHelp="🔒 Visit The Arena of Kings to complete the first step."
                                canShowLocationPrompt={commandStarted && commandSteps === 0}
                                onStart={() => ensureTrialStarted('trial-command', 'Trial of Command')}
                                lockedMessage="🔒 Complete Trial of Ascent to unlock"
                                puzzleNode={
                                    activeCommandPuzzle ? (
                                        <>
                                            <TrialPuzzle
                                                puzzle={activeCommandPuzzle}
                                                onSolved={async () => {
                                                    await advanceTrialStep('trial-command');
                                                }}
                                            />
                                            <p className="text-xs text-muted mt-2">
                                                🔒 Solve the command puzzle to complete the trial.
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-xs text-muted mt-2">
                                            Waiting for the next command step...
                                        </p>
                                    )
                                }
                            />

                            <TrialCard
                                icon="👑"
                                title="Trial of Summit Will"
                                description="Reach the summit and remain centered. Only disciplined will can hold altitude without falling into illusion."
                                started={summitStarted}
                                unlocked={commandComplete}
                                complete={summitComplete}
                                stepsCompleted={summitSteps}
                                startLabel="BEGIN TRIAL OF SUMMIT WILL →"
                                onStart={() =>
                                    ensureTrialStarted('trial-summit-will', 'Trial of Summit Will')
                                }
                                lockedMessage="🔒 Complete Trial of Command to unlock"
                                puzzleNode={
                                    activeSummitPuzzle ? (
                                        <>
                                            <TrialPuzzle
                                                puzzle={activeSummitPuzzle}
                                                onSolved={async () => {
                                                    await advanceTrialStep('trial-summit-will');
                                                }}
                                            />
                                            <p className="text-xs text-muted mt-2">
                                                🔒 Continue proving steady will at the summit.
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-xs text-muted mt-2">
                                            Waiting for the next summit step...
                                        </p>
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div id="locations-section" className="mb-8">
                        <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
                            <span className="text-glow">📍</span> LOCATIONS{' '}
                            <span className="text-glow">📍</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                className={`realm-portal ${canExploreTower || hasVisited('tower-of-ascension') ? 'unlocked' : 'locked'
                                    } fade-in`}
                                style={{ animationDelay: '0.5s' }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">🏛️</div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-display mb-2">The Tower of Ascension</h3>
                                        <p className="text-sm text-secondary mb-3">
                                            A vertical gauntlet above the clouds where every level tests resolve.
                                        </p>
                                        <button
                                            className="btn-secondary w-full"
                                            onClick={() =>
                                                handleLocationVisit('tower-of-ascension', 'The Tower of Ascension')
                                            }
                                            disabled={
                                                busyKey === 'visit:tower-of-ascension' ||
                                                !canExploreTower ||
                                                hasVisited('tower-of-ascension')
                                            }
                                        >
                                            {hasVisited('tower-of-ascension')
                                                ? '✅ EXPLORED'
                                                : canExploreTower
                                                    ? 'EXPLORE →'
                                                    : 'LOCKED UNTIL TRIAL 1 STARTS'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`realm-portal ${canExploreArena || hasVisited('arena-of-kings') ? 'unlocked' : 'locked'
                                    } fade-in`}
                                style={{ animationDelay: '0.6s' }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">⚔️</div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-display mb-2">The Arena of Kings</h3>
                                        <p className="text-sm text-secondary mb-3">
                                            A proving ground where force is meaningless without control.
                                        </p>
                                        <button
                                            className="btn-secondary w-full"
                                            onClick={() => handleLocationVisit('arena-of-kings', 'The Arena of Kings')}
                                            disabled={
                                                busyKey === 'visit:arena-of-kings' ||
                                                !canExploreArena ||
                                                hasVisited('arena-of-kings')
                                            }
                                        >
                                            {hasVisited('arena-of-kings')
                                                ? '✅ EXPLORED'
                                                : canExploreArena
                                                    ? 'EXPLORE →'
                                                    : 'LOCKED UNTIL TRIAL 2 STARTS'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.7s' }}>
                        <h2 className="text-2xl font-display mb-4">🎵 REALM SOUNDTRACK</h2>
                        <p className="text-secondary mb-4">
                            Skybound City thunders with triumphant, elevated energy that mirrors
                            ascent, command, and sovereign will.
                        </p>
                        <RealmMusicPlayer
                            trackUrl="/music/realms/55/mula.mp3"
                            trackTitle="Mula"
                            artist="Cosmic 888"
                            realmName="Skybound City"
                            realmColor="#FFD700"
                            realmId={55}
                        />
                    </div>

                    <div
                        className="flex justify-between items-center fade-in"
                        style={{ animationDelay: '0.8s' }}
                    >
                        <Link href="/nexus">
                            <button className="btn-secondary">← BACK TO NEXUS</button>
                        </Link>

                        {isAstralBazaarUnlocked ? (
                            <Link href="/realms/44">
                                <button className="btn-primary">ENTER ASTRAL BAZAAR →</button>
                            </Link>
                        ) : (
                            <div className="text-sm text-muted">
                                Next Realm: 🛍️ Astral Bazaar (Locked)
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}