'use client';

import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import RealmGuidanceCard from '@/components/realm/RealmGuidanceCard';
import RealmSoundstage from '@/components/realm/RealmSoundstage';
import RealmEntryGuidanceBanner from '@/components/realm/RealmEntryGuidanceBanner';
import TrialPuzzle from '@/components/realm/TrialPuzzle';
import '@/styles/realmShared.css';
import '@/styles/realm0.css';
import { useQuery, useMutation } from '@apollo/client';
import {
    GET_ME,
    COMPLETE_TRIAL_STEP,
    START_TRIAL,
    VISIT_LOCATION,
} from '@/graphql/realms';
import { REALM_0_PUZZLES } from '@/lib/realmPuzzles';

const REALM_ID = 0;

export default function Realm0() {
    const { data: session, status } = useSession();
    const [showProgression, setShowProgression] = useState(false);

    const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME, {
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
    });

    const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
    const [startTrial] = useMutation(START_TRIAL);
    const [visitLocation] = useMutation(VISIT_LOCATION);

    const locationsSectionRef = useRef<HTMLDivElement>(null);

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

    const trial1 = getTrial('trial-remembrance');
    const trial2 = getTrial('trial-unity');
    const trial3 = getTrial('trial-return-to-source');

    const handleStartTrial = async (trialId: string, trialName: string) => {
        try {
            await startTrial({ variables: { realmId: REALM_ID, trialId, trialName } });
            await refetch();
        } catch (e: any) {
            console.error(e);
            alert('Error starting trial: ' + (e.message ?? 'Unknown error'));
        }
    };

    const claimTrialStep = async (trialId: string, trialName: string) => {
        try {
            if (!getTrial(trialId)) {
                await startTrial({ variables: { realmId: REALM_ID, trialId, trialName } });
            }

            const result = await completeTrialStep({
                variables: { realmId: REALM_ID, trialId },
            });

            alert(result.data.completeTrialStep.message);
            await refetch();
        } catch (e: any) {
            console.error(e);
            alert('Error: ' + (e.message ?? 'Something went wrong'));
        }
    };

    const handleLocationVisit = async (locationId: string, locationName: string) => {
        try {
            const result = await visitLocation({
                variables: { realmId: REALM_ID, locationId, locationName },
            });

            alert(result.data.visitLocation.message);
            await refetch();
        } catch (e: any) {
            console.error(e);
            alert('Error: ' + (e.message ?? 'Something went wrong'));
        }
    };

    if (status === 'loading' || userLoading) {
        return (
            <div className="min-h-screen grid place-items-center p-6 nexus-shell">
                <div className="glass-card nexus-panel max-w-md text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full border border-white/15 grid place-items-center text-[#DCBA5C]">
                        ∞
                    </div>

                    <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                        Entering Realm
                    </p>

                    <h1 className="text-3xl font-display mb-3">InterSiddhi</h1>

                    <p className="text-secondary">
                        Syncing source path, music state, and realm integration.
                    </p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen grid place-items-center p-6 nexus-shell">
                <div className="glass-card nexus-panel max-w-md text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full border border-white/15 grid place-items-center text-[#DCBA5C]">
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

    const voidTempleUnlocked = !!trial1;
    const observatoryUnlocked = !!trial2;

    return (
        <>
            <RealmBackground
                videoSrc="/inter-siddhi_CityScape1.mp4"
                realmName="InterSiddhi"
                overlayOpacity={0.35}
            />

            <div className="min-h-screen pb-32 realm-0-shell">
                <div className="container mx-auto px-4 py-8 max-w-6xl realm-0-container">
                    <header className="text-center mb-10 fade-in realm-0-hero">
                        <div className="realm-0-symbol-mark mb-4">∞</div>

                        <h1 className="text-5xl md:text-6xl font-display mb-2 realm-0-title">
                            INTERSIDDHI
                        </h1>

                        <p className="text-xl text-secondary mb-2">[ REALM 0 • THE SOURCE ]</p>
                        <p className="text-lg text-muted">
                            Source &amp; Balance • Where All Paths Converge
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
                        realmId={0}
                        realmName="InterSiddhi"
                        realmColor="#E5E7EB"
                    />

                    <RealmGuidanceCard realmId={0} />

                    <RealmSoundstage
                        realmId={0}
                        realmName="InterSiddhi"
                        realmIcon="∞"
                        realmColor="#E5E7EB"
                        intro="InterSiddhi is the realm of return, balance, source-awareness, and completion. Let the soundtrack tell you whether this realm matches the state of integration you need right now."
                        supportText="Start with the music first. If this realm feels true, open the optional Source Path to explore remembrance, unity, and return."
                        progress={realmProgress}
                        isUnlocked={true}
                        isCurrentRealm={true}
                        compactOnMobile
                    />

                    <div className="glass-card realm-0-overview p-6 mb-8 fade-in">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-display mb-3">Realm Overview</h2>

                                <p className="text-secondary mb-4">
                                    InterSiddhi is the still point beneath the Multiverse — the source beneath
                                    movement. It is where striving softens, separation dissolves, and the journey
                                    returns to remembrance, unity, and origin.
                                </p>

                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-secondary">Source Path Progress</span>
                                        <span className="text-stats">{realmProgress}%</span>
                                    </div>

                                    <div className="stat-bar">
                                        <div
                                            className="stat-bar-fill realm-0-bar"
                                            style={{ width: `${realmProgress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="text-sm text-muted">
                                    {completedTrialsCount} of 3 optional source path trials complete
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-[260px]">
                                <div className="glass-card p-4 text-center">
                                    <div className="text-2xl font-display text-glow realm-0-glow">
                                        {completedTrialsCount} / 3
                                    </div>
                                    <div className="text-xs text-muted">Source Path Trials</div>
                                </div>

                                <div className="glass-card p-4 text-center">
                                    <div className="text-2xl font-display text-glow">
                                        {completedTrialsCount >= 3 ? 'Mastered' : 'In Progress'}
                                    </div>
                                    <div className="text-xs text-muted">Status</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-4 mb-8 fade-in realm-0-progression-toggle">
                        <button
                            onClick={() => setShowProgression((prev) => !prev)}
                            className="w-full flex items-center justify-between text-left"
                        >
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-1">
                                    Optional Source Path
                                </p>

                                <h2 className="text-xl font-display">
                                    Explore remembrance, unity, and return
                                </h2>

                                <p className="text-sm text-muted mt-1">
                                    The music is the entry point. Open the Source Path when you want to move
                                    deeper into the final layer of the world.
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
                                    SOURCE PATH
                                </h2>

                                <div className="space-y-6">
                                    <div className="quest-card fade-in" style={{ animationDelay: '0.2s' }}>
                                        <div className="flex items-start gap-4">
                                            <div className="text-4xl">∞</div>

                                            <div className="flex-1">
                                                <h3 className="text-xl font-display mb-2">
                                                    Trial of Remembrance
                                                </h3>

                                                <p className="text-sm text-secondary mb-3">
                                                    Before striving, remember. Before transcending, return to what you already are.
                                                </p>

                                                <div className="mb-4">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Progress</span>
                                                        <span>{trial1?.stepsCompleted ?? 0} / 3 Steps</span>
                                                    </div>

                                                    <div className="stat-bar">
                                                        <div
                                                            className="stat-bar-fill realm-0-bar"
                                                            style={{ width: `${((trial1?.stepsCompleted ?? 0) / 3) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {trial1?.isComplete ? (
                                                    <div className="text-green-400 font-bold">✓ Complete</div>
                                                ) : !trial1 ? (
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => handleStartTrial('trial-remembrance', 'Trial of Remembrance')}
                                                    >
                                                        Begin Realm Path →
                                                    </button>
                                                ) : trial1.stepsCompleted === 0 && !hasVisited('void-temple') ? (
                                                    <>
                                                        <p className="text-sm text-muted italic mb-3">
                                                            Visit <strong>The Void Temple</strong> below to unlock Step 1.
                                                        </p>

                                                        <button
                                                            className="btn-secondary"
                                                            onClick={() =>
                                                                locationsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                                                            }
                                                        >
                                                            Go to Locations ↓
                                                        </button>
                                                    </>
                                                ) : trial1.stepsCompleted === 0 ? (
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => claimTrialStep('trial-remembrance', 'Trial of Remembrance')}
                                                    >
                                                        Claim Step
                                                    </button>
                                                ) : REALM_0_PUZZLES['trial-remembrance']?.steps[trial1.stepsCompleted - 1] ? (
                                                    <TrialPuzzle
                                                        key={`trial-remembrance-${trial1.stepsCompleted}`}
                                                        puzzle={REALM_0_PUZZLES['trial-remembrance'].steps[trial1.stepsCompleted - 1]}
                                                        onSolved={() => claimTrialStep('trial-remembrance', 'Trial of Remembrance')}
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
                                            <div className="text-4xl">◯</div>

                                            <div className="flex-1">
                                                <h3 className="text-xl font-display mb-2">
                                                    Trial of Unity
                                                </h3>

                                                {!trial1?.isComplete ? (
                                                    <p className="text-sm text-muted italic">
                                                        Locked — complete Trial of Remembrance to unlock
                                                    </p>
                                                ) : (
                                                    <>
                                                        <p className="text-sm text-secondary mb-3">
                                                            Dissolve separation. Recognize the many within the one.
                                                        </p>

                                                        <div className="mb-4">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span>Progress</span>
                                                                <span>{trial2?.stepsCompleted ?? 0} / 3 Steps</span>
                                                            </div>

                                                            <div className="stat-bar">
                                                                <div
                                                                    className="stat-bar-fill realm-0-bar"
                                                                    style={{ width: `${((trial2?.stepsCompleted ?? 0) / 3) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {trial2?.isComplete ? (
                                                            <div className="text-green-400 font-bold">✓ Complete</div>
                                                        ) : !trial2 ? (
                                                            <button
                                                                className="btn-primary"
                                                                onClick={() => handleStartTrial('trial-unity', 'Trial of Unity')}
                                                            >
                                                                Begin Trial of Unity →
                                                            </button>
                                                        ) : trial2.stepsCompleted === 0 && !hasVisited('eternal-observatory') ? (
                                                            <>
                                                                <p className="text-sm text-muted italic mb-3">
                                                                    Visit <strong>The Eternal Observatory</strong> below to unlock Step 1.
                                                                </p>

                                                                <button
                                                                    className="btn-secondary"
                                                                    onClick={() =>
                                                                        locationsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                                                                    }
                                                                >
                                                                    Go to Locations ↓
                                                                </button>
                                                            </>
                                                        ) : trial2.stepsCompleted === 0 ? (
                                                            <button
                                                                className="btn-primary"
                                                                onClick={() => claimTrialStep('trial-unity', 'Trial of Unity')}
                                                            >
                                                                Claim Step
                                                            </button>
                                                        ) : REALM_0_PUZZLES['trial-unity']?.steps[trial2.stepsCompleted - 1] ? (
                                                            <TrialPuzzle
                                                                key={`trial-unity-${trial2.stepsCompleted}`}
                                                                puzzle={REALM_0_PUZZLES['trial-unity'].steps[trial2.stepsCompleted - 1]}
                                                                onSolved={() => claimTrialStep('trial-unity', 'Trial of Unity')}
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
                                            <div className="text-4xl">✦</div>

                                            <div className="flex-1">
                                                <h3 className="text-xl font-display mb-2">
                                                    Trial of Return to Source
                                                </h3>

                                                {!trial2?.isComplete ? (
                                                    <p className="text-sm text-muted italic">
                                                        Locked — complete Trial of Unity to unlock
                                                    </p>
                                                ) : (
                                                    <>
                                                        <p className="text-sm text-secondary mb-3">
                                                            The final movement is not forward. Return to what you have always been.
                                                        </p>

                                                        <div className="mb-4">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span>Progress</span>
                                                                <span>{trial3?.stepsCompleted ?? 0} / 3 Steps</span>
                                                            </div>

                                                            <div className="stat-bar">
                                                                <div
                                                                    className="stat-bar-fill realm-0-bar"
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
                                                                    handleStartTrial('trial-return-to-source', 'Trial of Return to Source')
                                                                }
                                                            >
                                                                Begin Trial of Return to Source →
                                                            </button>
                                                        ) : REALM_0_PUZZLES['trial-return-to-source']?.steps[trial3.stepsCompleted] ? (
                                                            <TrialPuzzle
                                                                key={`trial-return-to-source-${trial3.stepsCompleted}`}
                                                                puzzle={REALM_0_PUZZLES['trial-return-to-source'].steps[trial3.stepsCompleted]}
                                                                onSolved={() =>
                                                                    claimTrialStep('trial-return-to-source', 'Trial of Return to Source')
                                                                }
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
                                        className={`realm-portal fade-in ${voidTempleUnlocked ? 'unlocked' : 'opacity-50'}`}
                                        style={{ animationDelay: '0.5s' }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-4xl">◌</div>

                                            <div className="flex-1">
                                                <h3 className="text-lg font-display mb-2">
                                                    The Void Temple
                                                </h3>

                                                <p className="text-sm text-secondary mb-1">
                                                    Where form and formlessness meet in still balance.
                                                </p>

                                                {!voidTempleUnlocked ? (
                                                    <p className="text-xs text-muted italic mb-3">
                                                        Begin Trial of Remembrance to unlock this location.
                                                    </p>
                                                ) : !hasVisited('void-temple') ? (
                                                    <p className="text-xs text-glow mb-3">
                                                        Required for Trial of Remembrance — Step 1
                                                    </p>
                                                ) : null}

                                                <button
                                                    className="btn-secondary w-full"
                                                    onClick={() => handleLocationVisit('void-temple', 'The Void Temple')}
                                                    disabled={!voidTempleUnlocked || hasVisited('void-temple')}
                                                >
                                                    {hasVisited('void-temple')
                                                        ? 'Explored'
                                                        : !voidTempleUnlocked
                                                            ? 'Locked'
                                                            : 'Explore →'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`realm-portal fade-in ${observatoryUnlocked ? 'unlocked' : 'opacity-50'}`}
                                        style={{ animationDelay: '0.6s' }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-4xl">◎</div>

                                            <div className="flex-1">
                                                <h3 className="text-lg font-display mb-2">
                                                    The Eternal Observatory
                                                </h3>

                                                <p className="text-sm text-secondary mb-1">
                                                    Witness timelines, patterns, and possibilities from stillness.
                                                </p>

                                                {!observatoryUnlocked ? (
                                                    <p className="text-xs text-muted italic mb-3">
                                                        Complete Trial of Remembrance to unlock this location.
                                                    </p>
                                                ) : !hasVisited('eternal-observatory') ? (
                                                    <p className="text-xs text-glow mb-3">
                                                        Required for Trial of Unity — Step 1
                                                    </p>
                                                ) : null}

                                                <button
                                                    className="btn-secondary w-full"
                                                    onClick={() =>
                                                        handleLocationVisit('eternal-observatory', 'The Eternal Observatory')
                                                    }
                                                    disabled={!observatoryUnlocked || hasVisited('eternal-observatory')}
                                                >
                                                    {hasVisited('eternal-observatory')
                                                        ? 'Explored'
                                                        : !observatoryUnlocked
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
                        <div className="glass-card p-8 mb-8 text-center fade-in realm-0-complete-card">
                            <h3 className="text-2xl font-display mb-4 realm-0-glow">
                                INTERSIDDHI INTEGRATED
                            </h3>

                            <p className="text-secondary mb-4 max-w-2xl mx-auto">
                                The path returns to stillness. The realms remain open — not as obstacles,
                                but as worlds you can revisit through sound, memory, and meaning.
                            </p>

                            <Link href="/nexus">
                                <button className="btn-primary">Return to the Nexus →</button>
                            </Link>
                        </div>
                    )}

                    <div
                        className="flex flex-col sm:flex-row justify-between items-center gap-4 fade-in"
                        style={{ animationDelay: '0.9s' }}
                    >
                        <Link href="/nexus">
                            <button className="btn-secondary">← Back to Nexus</button>
                        </Link>

                        <div className="text-sm text-glow">∞ The Final Realm</div>
                    </div>
                </div>
            </div>
        </>
    );
}