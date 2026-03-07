'use client';

import { useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import '@/styles/realmShared.css';
import '@/styles/realm44.css';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, COMPLETE_TRIAL_STEP, START_TRIAL, VISIT_LOCATION, UNLOCK_REALM } from '@/graphql/realms';

/**
 * 🛍️ REALM 44: ASTRAL BAZAAR
 * Theme: Hustle & Wisdom
 * Unlocks: Realm 0 (InterSiddhi) on full trial completion
 */

const REALM_ID = 44;
const NEXT_REALM_ID = 0;

export default function Realm44() {
    const { data: session, status } = useSession();

    const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME);
    const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
    const [startTrial] = useMutation(START_TRIAL);
    const [visitLocation] = useMutation(VISIT_LOCATION);
    const [unlockNextRealm] = useMutation(UNLOCK_REALM);
    const hasUnlockedRef = useRef(false);

    const user = userData?.me;
    const userLevel = user?.level ?? 1;
    const userXP = user?.xp ?? 0;
    const xpToNext = user?.xpToNextLevel ?? 100;
    const safeXpToNext = Math.max(xpToNext, 1);
    const xpPercent = Math.min((userXP / safeXpToNext) * 100, 100);

    const realmTrials = user?.completedTrials?.filter((t: any) => t.realmId === REALM_ID) ?? [];
    const completedTrialsCount = realmTrials.filter((t: any) => t.isComplete).length;
    const realmProgress = Math.floor((completedTrialsCount / 3) * 100);

    const getTrial = (trialId: string) => realmTrials.find((t: any) => t.trialId === trialId);

    const realmLocations = user?.visitedLocations?.filter((l: any) => l.realmId === REALM_ID) ?? [];
    const hasVisited = (locationId: string) => realmLocations.some((l: any) => l.locationId === locationId);

    // ⚠️ NEXT_REALM_ID = 0 — includes(0) is safe since unlockedRealms is [Int!]!
    useEffect(() => {
        if (completedTrialsCount >= 3 && !hasUnlockedRef.current && user) {
            const alreadyUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);
            if (!alreadyUnlocked) {
                hasUnlockedRef.current = true;
                unlockNextRealm({ variables: { realmId: NEXT_REALM_ID } })
                    .then(() => {
                        alert(`🔓 REALM UNLOCKED! InterSiddhi (Realm 0) — The Final Realm is now accessible!`);
                        refetch();
                    })
                    .catch((err) => console.error('Unlock error:', err));
            } else {
                hasUnlockedRef.current = true;
            }
        }
    }, [completedTrialsCount, user]);

    const handleTrialClick = async (trialId: string, trialName: string) => {
        try {
            await startTrial({ variables: { realmId: REALM_ID, trialId, trialName } });
            const result = await completeTrialStep({ variables: { realmId: REALM_ID, trialId } });
            alert(result.data.completeTrialStep.message);
            refetch();
        } catch (error: any) {
            console.error('Trial error:', error);
            alert('Error: ' + (error.message ?? 'Something went wrong'));
        }
    };

    const handleLocationVisit = async (locationId: string, locationName: string) => {
        try {
            const result = await visitLocation({ variables: { realmId: REALM_ID, locationId, locationName } });
            alert(result.data.visitLocation.message);
            refetch();
        } catch (error: any) {
            console.error('Location error:', error);
            alert('Error: ' + (error.message ?? 'Something went wrong'));
        }
    };

    if (status === 'loading' || userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="neon-glow text-4xl mb-4">🛍️</div>
                    <p className="text-xl">Entering The Astral Bazaar...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="glass-card p-12 max-w-md text-center">
                    <h1 className="text-4xl font-display neon-glow mb-4">🔒 ACCESS DENIED</h1>
                    <p className="text-lg text-secondary mb-8">You must be logged in to enter this realm.</p>
                    <Link href="/auth" className="btn-primary">SIGN IN</Link>
                </div>
            </div>
        );
    }

    const trial1 = getTrial('trial-merchants-path');
    const trial2 = getTrial('trial-temporal-sight');
    const trial3 = getTrial('trial-infinite-exchange');

    return (
        <>
            <RealmBackground videoSrc="/astral-bazaar_CityScape1.mp4" realmName="Astral Bazaar" overlayOpacity={0.45} />

            <div className="min-h-screen pb-32">
                <div className="container mx-auto px-4 py-8 max-w-6xl">

                    <header className="text-center mb-12 fade-in">
                        <div className="text-6xl mb-4 neon-glow">🛍️</div>
                        <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-44-title">ASTRAL BAZAAR</h1>
                        <p className="text-xl text-secondary mb-2">[ REALM 44 ]</p>
                        <p className="text-lg text-muted">Hustle & Wisdom • Where Everything Has Its Price</p>
                        <div className="mt-6 flex justify-center items-center gap-4">
                            <div className="level-badge">LVL {userLevel}</div>
                            <div className="flex-1 max-w-xs">
                                <div className="stat-bar">
                                    <div className="stat-bar-fill" style={{ width: `${xpPercent}%` }} />
                                </div>
                                <p className="text-sm text-secondary mt-1">{userXP} / {safeXpToNext} XP</p>
                            </div>
                        </div>
                    </header>

                    <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-3xl font-display mb-4">💰 THE COSMIC MARKETPLACE 💰</h2>
                        <p className="text-lg text-secondary mb-4">
                            The Astral Bazaar is an infinite market that exists outside of linear time, where souls trade knowledge, memories, and power. This is the domain of merchants, tricksters, and those who understand that everything can be negotiated.
                        </p>
                        <p className="text-secondary mb-6">
                            Here, you'll develop Time Manipulation: the ability to bend temporal flow, to see cause and effect across timelines, and to master the art of strategic exchange.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="glass-card p-4 text-center">
                                <div className="text-2xl font-display text-glow realm-44-glow">{realmProgress}%</div>
                                <div className="text-xs text-muted">Progress</div>
                            </div>
                            <div className="glass-card p-4 text-center">
                                <div className="text-2xl font-display text-glow">{completedTrialsCount} / 3</div>
                                <div className="text-xs text-muted">Trials Complete</div>
                            </div>
                            <div className="glass-card p-4 text-center">
                                <div className="text-2xl font-display text-glow">0</div>
                                <div className="text-xs text-muted">Siddhis Unlocked</div>
                            </div>
                            <div className="glass-card p-4 text-center">
                                <div className="text-2xl font-display text-glow">
                                    {completedTrialsCount >= 3 ? '🔓 Unlocked' : 'Locked'}
                                </div>
                                <div className="text-xs text-muted">Next Realm</div>
                            </div>
                        </div>
                    </div>

                    {/* Trials */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
                            <span className="text-glow">🎯</span> REALM TRIALS <span className="text-glow">🎯</span>
                        </h2>
                        <div className="space-y-4">

                            <div className="quest-card fade-in" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">⏳</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-display mb-2">Trial of the Merchant's Path</h3>
                                        <p className="text-sm text-secondary mb-3">Learn to trade wisely. Everything has value—know what you're willing to pay.</p>
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Progress</span><span>{trial1?.stepsCompleted ?? 0} / 3 Steps</span>
                                            </div>
                                            <div className="stat-bar">
                                                <div className="stat-bar-fill realm-44-bar" style={{ width: `${((trial1?.stepsCompleted ?? 0) / 3) * 100}%` }} />
                                            </div>
                                        </div>
                                        {trial1?.isComplete ? (
                                            <div className="text-green-400 font-bold">✓ COMPLETE</div>
                                        ) : (
                                            <button className="btn-primary" onClick={() => handleTrialClick('trial-merchants-path', "Trial of the Merchant's Path")}>
                                                {trial1 ? 'CONTINUE TRIAL →' : 'BEGIN TRIAL →'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`quest-card fade-in ${!trial1?.isComplete ? 'opacity-50' : ''}`} style={{ animationDelay: '0.3s' }}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">🔮</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-display mb-2">Trial of Temporal Sight</h3>
                                        {trial1?.isComplete ? (
                                            <>
                                                <p className="text-sm text-secondary mb-3">See across timelines. Understand the full cost of every choice.</p>
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Progress</span><span>{trial2?.stepsCompleted ?? 0} / 3 Steps</span>
                                                    </div>
                                                    <div className="stat-bar">
                                                        <div className="stat-bar-fill realm-44-bar" style={{ width: `${((trial2?.stepsCompleted ?? 0) / 3) * 100}%` }} />
                                                    </div>
                                                </div>
                                                {trial2?.isComplete ? (
                                                    <div className="text-green-400 font-bold">✓ COMPLETE</div>
                                                ) : (
                                                    <button className="btn-primary" onClick={() => handleTrialClick('trial-temporal-sight', 'Trial of Temporal Sight')}>
                                                        {trial2 ? 'CONTINUE TRIAL →' : 'BEGIN TRIAL →'}
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted italic">🔒 Complete Trial of the Merchant's Path to unlock</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`quest-card fade-in ${!trial2?.isComplete ? 'opacity-50' : ''}`} style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">♾️</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-display mb-2">Trial of the Infinite Exchange</h3>
                                        {trial2?.isComplete ? (
                                            <>
                                                <p className="text-sm text-secondary mb-3">Master the infinite cycle of giving and receiving. Become the flow.</p>
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Progress</span><span>{trial3?.stepsCompleted ?? 0} / 3 Steps</span>
                                                    </div>
                                                    <div className="stat-bar">
                                                        <div className="stat-bar-fill realm-44-bar" style={{ width: `${((trial3?.stepsCompleted ?? 0) / 3) * 100}%` }} />
                                                    </div>
                                                </div>
                                                {trial3?.isComplete ? (
                                                    <div className="text-green-400 font-bold">✓ COMPLETE</div>
                                                ) : (
                                                    <button className="btn-primary" onClick={() => handleTrialClick('trial-infinite-exchange', 'Trial of the Infinite Exchange')}>
                                                        {trial3 ? 'CONTINUE TRIAL →' : 'BEGIN TRIAL →'}
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted italic">🔒 Complete Trial of Temporal Sight to unlock</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Locations */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
                            <span className="text-glow">📍</span> LOCATIONS <span className="text-glow">📍</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="realm-portal unlocked fade-in" style={{ animationDelay: '0.5s' }}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">🏪</div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-display mb-2">The Merchant Quarter</h3>
                                        <p className="text-sm text-secondary mb-3">Endless stalls selling memories, skills, and impossible artifacts.</p>
                                        <button className="btn-secondary w-full" onClick={() => handleLocationVisit('merchant-quarter', 'The Merchant Quarter')} disabled={hasVisited('merchant-quarter')}>
                                            {hasVisited('merchant-quarter') ? '✅ EXPLORED' : 'EXPLORE →'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="realm-portal unlocked fade-in" style={{ animationDelay: '0.6s' }}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">🎲</div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-display mb-2">The Gambler's Den</h3>
                                        <p className="text-sm text-secondary mb-3">Where fortunes shift with every roll and fate bends to the bold.</p>
                                        <button className="btn-secondary w-full" onClick={() => handleLocationVisit('gamblers-den', "The Gambler's Den")} disabled={hasVisited('gamblers-den')}>
                                            {hasVisited('gamblers-den') ? '✅ EXPLORED' : 'EXPLORE →'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Music */}
                    <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.7s' }}>
                        <h2 className="text-2xl font-display mb-4">🎵 REALM SOUNDTRACK</h2>
                        <p className="text-secondary mb-4">The Astral Bazaar hums with mystic rhythms of ancient wisdom and cosmic commerce.</p>
                        <RealmMusicPlayer trackUrl="/music/realms/44/dogWatch.mp3" trackTitle="Dog Watch" artist="Cosmic 888" realmName="Astral Bazaar" realmColor="#9B59B6" realmId={44} />
                    </div>

                    <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.8s' }}>
                        <Link href="/nexus"><button className="btn-secondary">← BACK TO NEXUS</button></Link>
                        <div className="text-sm text-muted">
                            Next Realm: 🌌 InterSiddhi {completedTrialsCount >= 3 ? '(🔓 Unlocked!)' : '(Locked)'}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}