'use client';

import { useRef } from 'react';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import '@/styles/realmShared.css';
import '@/styles/realm202.css';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, COMPLETE_TRIAL_STEP, START_TRIAL, VISIT_LOCATION, UNLOCK_REALM } from '@/graphql/realms';

/**
 * 🕯️ REALM 202: THE VEIL
 * Theme: Dreams & Longing
 * Unlocks: Realm 101 (Moonlit Roads) on full trial completion
 */

const REALM_ID = 202;
const NEXT_REALM_ID = 101;

export default function Realm202() {
    const { data: session, status } = useSession();

    const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME);
    const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
    const [startTrial] = useMutation(START_TRIAL);
    const [visitLocation] = useMutation(VISIT_LOCATION);
    const [unlockNextRealm] = useMutation(UNLOCK_REALM);
    const hasUnlockedRef = useRef(false);

    // ── User data ──────────────────────────────────────────
    const user = userData?.me;
    const userLevel = user?.level ?? 1;
    const userXP = user?.xp ?? 0;
    const xpToNext = user?.xpToNextLevel ?? 100;
    const safeXpToNext = Math.max(xpToNext, 1);
    const xpPercent = Math.min((userXP / safeXpToNext) * 100, 100);

    // ── Realm-specific progress ────────────────────────────
    const realmTrials = user?.completedTrials?.filter((t: any) => t.realmId === REALM_ID) ?? [];
    const completedTrialsCount = realmTrials.filter((t: any) => t.isComplete).length;
    const realmProgress = Math.floor((completedTrialsCount / 3) * 100);

    const getTrial = (trialId: string) =>
        realmTrials.find((t: any) => t.trialId === trialId);

    const realmLocations = user?.visitedLocations?.filter((l: any) => l.realmId === REALM_ID) ?? [];
    const hasVisited = (locationId: string) =>
        realmLocations.some((l: any) => l.locationId === locationId);

    // ── Realm unlock effect ────────────────────────────────
    useEffect(() => {
        if (completedTrialsCount >= 3 && !hasUnlockedRef.current && user) {
            const alreadyUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);
            if (!alreadyUnlocked) {
                hasUnlockedRef.current = true;
                unlockNextRealm({ variables: { realmId: NEXT_REALM_ID } })
                    .then(() => {
                        alert(`🔓 REALM UNLOCKED! Moonlit Roads (Realm 101) is now accessible!`);
                        refetch();
                    })
                    .catch((err) => console.error('Unlock error:', err));
            } else {
                hasUnlockedRef.current = true;
            }
        }
    }, [completedTrialsCount, user]);

    // ── Trial handler ──────────────────────────────────────
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

    // ── Location handler ───────────────────────────────────
    const handleLocationVisit = async (locationId: string, locationName: string) => {
        try {
            const result = await visitLocation({
                variables: { realmId: REALM_ID, locationId, locationName },
            });
            alert(result.data.visitLocation.message);
            refetch();
        } catch (error: any) {
            console.error('Location error:', error);
            alert('Error: ' + (error.message ?? 'Something went wrong'));
        }
    };

    // ── Loading / Auth gates ───────────────────────────────
    if (status === 'loading' || userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="neon-glow text-4xl mb-4">🕯️</div>
                    <p className="text-xl">Passing Through The Veil...</p>
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

    const trial1 = getTrial('trial-dreamwalking');
    const trial2 = getTrial('trial-clairvoyance');
    const trial3 = getTrial('trial-longings-end');

    return (
        <>
            <RealmBackground videoSrc="/the-veil_CityScape1.mp4" realmName="The Veil" overlayOpacity={0.45} />

            <div className="min-h-screen pb-32">
                <div className="container mx-auto px-4 py-8 max-w-6xl">

                    {/* Header */}
                    <header className="text-center mb-12 fade-in">
                        <div className="text-6xl mb-4 neon-glow">🕯️</div>
                        <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-202-title">
                            THE VEIL
                        </h1>
                        <p className="text-xl text-secondary mb-2">[ REALM 202 ]</p>
                        <p className="text-lg text-muted">Dreams & Longing • Between Sleep and Waking</p>

                        {/* Level & XP */}
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

                    {/* Description */}
                    <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-3xl font-display mb-4">🌙 THE REALM OF DREAMS 🌙</h2>
                        <p className="text-lg text-secondary mb-4">
                            The Veil is a liminal space between waking and sleeping, where dreams take form and memories become tangible. This is the realm of artists, dreamers, and those who seek what cannot be touched in the waking world.
                        </p>
                        <p className="text-secondary mb-6">
                            Here, you'll develop Clairvoyance: the ability to see beyond the material, to perceive hidden truths, and to navigate the subtle realms of intuition and psychic awareness.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="glass-card p-4 text-center">
                                <div className="text-2xl font-display text-glow realm-202-glow">{realmProgress}%</div>
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

                            {/* Trial 1 */}
                            <div className="quest-card fade-in" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">🌫️</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-display mb-2">Trial of Dreamwalking</h3>
                                        <p className="text-sm text-secondary mb-3">Navigate the dreamscape. Remember what others have forgotten.</p>
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Progress</span>
                                                <span>{trial1?.stepsCompleted ?? 0} / 3 Steps</span>
                                            </div>
                                            <div className="stat-bar">
                                                <div className="stat-bar-fill realm-202-bar" style={{ width: `${((trial1?.stepsCompleted ?? 0) / 3) * 100}%` }} />
                                            </div>
                                        </div>
                                        {trial1?.isComplete ? (
                                            <div className="text-green-400 font-bold">✓ COMPLETE</div>
                                        ) : (
                                            <button className="btn-primary" onClick={() => handleTrialClick('trial-dreamwalking', 'Trial of Dreamwalking')}>
                                                {trial1 ? 'CONTINUE TRIAL →' : 'BEGIN TRIAL →'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Trial 2 */}
                            <div className={`quest-card fade-in ${!trial1?.isComplete ? 'opacity-50' : ''}`} style={{ animationDelay: '0.3s' }}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">👁️</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-display mb-2">Trial of Clairvoyance</h3>
                                        {trial1?.isComplete ? (
                                            <>
                                                <p className="text-sm text-secondary mb-3">Pierce the veil. See what lies beyond ordinary perception.</p>
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Progress</span>
                                                        <span>{trial2?.stepsCompleted ?? 0} / 3 Steps</span>
                                                    </div>
                                                    <div className="stat-bar">
                                                        <div className="stat-bar-fill realm-202-bar" style={{ width: `${((trial2?.stepsCompleted ?? 0) / 3) * 100}%` }} />
                                                    </div>
                                                </div>
                                                {trial2?.isComplete ? (
                                                    <div className="text-green-400 font-bold">✓ COMPLETE</div>
                                                ) : (
                                                    <button className="btn-primary" onClick={() => handleTrialClick('trial-clairvoyance', 'Trial of Clairvoyance')}>
                                                        {trial2 ? 'CONTINUE TRIAL →' : 'BEGIN TRIAL →'}
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted italic">🔒 Complete Trial of Dreamwalking to unlock</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Trial 3 */}
                            <div className={`quest-card fade-in ${!trial2?.isComplete ? 'opacity-50' : ''}`} style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">✨</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-display mb-2">Trial of Longing's End</h3>
                                        {trial2?.isComplete ? (
                                            <>
                                                <p className="text-sm text-secondary mb-3">Release what you long for. Find peace in the infinite now.</p>
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Progress</span>
                                                        <span>{trial3?.stepsCompleted ?? 0} / 3 Steps</span>
                                                    </div>
                                                    <div className="stat-bar">
                                                        <div className="stat-bar-fill realm-202-bar" style={{ width: `${((trial3?.stepsCompleted ?? 0) / 3) * 100}%` }} />
                                                    </div>
                                                </div>
                                                {trial3?.isComplete ? (
                                                    <div className="text-green-400 font-bold">✓ COMPLETE</div>
                                                ) : (
                                                    <button className="btn-primary" onClick={() => handleTrialClick('trial-longings-end', "Trial of Longing's End")}>
                                                        {trial3 ? 'CONTINUE TRIAL →' : 'BEGIN TRIAL →'}
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted italic">🔒 Complete Trial of Clairvoyance to unlock</p>
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
                                    <div className="text-4xl">🌌</div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-display mb-2">The Mist Gardens</h3>
                                        <p className="text-sm text-secondary mb-3">Ethereal gardens where memories bloom as flowers.</p>
                                        <button
                                            className="btn-secondary w-full"
                                            onClick={() => handleLocationVisit('mist-gardens', 'The Mist Gardens')}
                                            disabled={hasVisited('mist-gardens')}
                                        >
                                            {hasVisited('mist-gardens') ? '✅ EXPLORED' : 'EXPLORE →'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="realm-portal unlocked fade-in" style={{ animationDelay: '0.6s' }}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">🕯️</div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-display mb-2">The Lantern Archive</h3>
                                        <p className="text-sm text-secondary mb-3">A library of dreams, where lost wishes are kept in glass.</p>
                                        <button
                                            className="btn-secondary w-full"
                                            onClick={() => handleLocationVisit('lantern-archive', 'The Lantern Archive')}
                                            disabled={hasVisited('lantern-archive')}
                                        >
                                            {hasVisited('lantern-archive') ? '✅ EXPLORED' : 'EXPLORE →'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Music */}
                    <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.7s' }}>
                        <h2 className="text-2xl font-display mb-4">🎵 REALM SOUNDTRACK</h2>
                        <p className="text-secondary mb-4">The Veil pulses with dreamy, ethereal beats that drift between worlds.</p>
                        <RealmMusicPlayer
                            trackUrl="/music/realms/202/mysteriousWay.mp3"
                            trackTitle="Mysterious Way"
                            artist="Cosmic 888"
                            realmName="The Veil"
                            realmColor="#9D84B7"
                            realmId={202}
                        />
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.8s' }}>
                        <Link href="/nexus"><button className="btn-secondary">← BACK TO NEXUS</button></Link>
                        <div className="text-sm text-muted">
                            Next Realm: 🌙 Moonlit Roads {completedTrialsCount >= 3 ? '(🔓 Unlocked!)' : '(Locked)'}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}