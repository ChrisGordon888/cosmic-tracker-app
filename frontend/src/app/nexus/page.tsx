'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { getTodayMoonPhase, getRealmMoonAlignment } from '@/lib/moonPhases';
import RealmBackground from '@/components/realm/RealmBackground';
import { GET_ME, LOG_DAILY_LOGIN } from '@/graphql/realms';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { MUSIC_REGISTRY } from '@/lib/musicRegistry';
import '@/styles/realmShared.css';
import '@/styles/nexus.css';

/**
 * 🌌 THE COSMIC NEXUS - HUB
 * Central dashboard where all travelers begin their journey
 * Inspired by: Solo Leveling system UI, Kingdom Hearts world map
 */

interface RealmPortalData {
    id: string;
    name: string;
    number: string;
    icon: string;
    status: 'unlocked' | 'locked' | 'current';
    progress: number;
    description: string;
    unlockRequirement?: string;
}

const REALM_META = [
    {
        id: '303',
        name: 'FRACTURED FRONTIER',
        number: '303',
        icon: '🌪️',
        description: 'Realm of Chaos & Creation',
        unlockRequirement: undefined,
    },
    {
        id: '202',
        name: 'THE VEIL',
        number: '202',
        icon: '🕯️',
        description: 'Realm of Dreams & Longing',
        unlockRequirement: 'Complete Trials in Fractured Frontier',
    },
    {
        id: '101',
        name: 'MOONLIT ROADS',
        number: '101',
        icon: '🌙',
        description: 'Realm of Reflection & Shadows',
        unlockRequirement: 'Complete Trials in The Veil',
    },
    {
        id: '55',
        name: 'SKYBOUND CITY',
        number: '55',
        icon: '⛰️',
        description: 'Realm of Power & Manifestation',
        unlockRequirement: 'Complete Trials in Moonlit Roads',
    },
    {
        id: '44',
        name: 'ASTRAL BAZAAR',
        number: '44',
        icon: '🛍️',
        description: 'Realm of Hustle & Wisdom',
        unlockRequirement: 'Complete Trials in Skybound City',
    },
    {
        id: '0',
        name: 'INTERSIDDHI',
        number: '0',
        icon: '🌌',
        description: 'Realm of Source & Transcendence',
        unlockRequirement: 'Complete Trials in Astral Bazaar',
    },
];

export default function CosmicNexusHub() {
    const { data: session, status } = useSession();
    const [moonPhase, setMoonPhase] = useState<any>(null);
    const [realmAlignment, setRealmAlignment] = useState<any>(null);

    const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

    const [expandedRealms, setExpandedRealms] = useState<Record<number, boolean>>({
        303: true,
    });

    const { data: userData, loading: userLoading } = useQuery(GET_ME, {
        skip: !session,
    });

    const [logDailyLogin] = useMutation(LOG_DAILY_LOGIN);

    useEffect(() => {
        if (session) {
            logDailyLogin().catch((err) =>
                console.warn('Daily login mutation skipped:', err.message)
            );
        }
    }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const phase = getTodayMoonPhase();
        const alignment = getRealmMoonAlignment(phase.phase);
        setMoonPhase(phase);
        setRealmAlignment(alignment);
    }, []);

    const user = userData?.me;
    const userLevel = user?.level ?? 1;
    const userXP = user?.xp ?? 0;
    const xpToNext = user?.xpToNextLevel ?? 100;
    const safeXpToNext = Math.max(xpToNext, 1);
    const xpPercent = Math.min((userXP / safeXpToNext) * 100, 100);
    const currentStreak = user?.streaks?.currentStreak ?? 0;
    const unlockedRealms: number[] = user?.unlockedRealms ?? [303];

    const totalCompletedTrials =
        user?.completedTrials?.filter((t: any) => t.isComplete).length ?? 0;

    const currentRealmName = (() => {
        const meta = REALM_META.find((r) => parseInt(r.id) === user?.currentRealm);
        return meta?.name ?? 'None';
    })();

    const getRealmProgress = (realmId: number): number => {
        const trials =
            user?.completedTrials?.filter((t: any) => t.realmId === realmId) ?? [];
        const completed = trials.filter((t: any) => t.isComplete).length;
        return Math.floor((completed / 3) * 100);
    };

    const isRealmUnlocked = (realmId: number): boolean =>
        unlockedRealms.includes(realmId);

    const realms: RealmPortalData[] = REALM_META.map((meta) => {
        const realmId = parseInt(meta.id);
        return {
            ...meta,
            status: isRealmUnlocked(realmId) ? 'unlocked' : 'locked',
            progress: getRealmProgress(realmId),
        };
    });

    const unlockedTracks = MUSIC_REGISTRY.filter((track) =>
        unlockedRealms.includes(track.realmId)
    );

    const groupedTracks = realms
        .filter((realm) => realm.status === 'unlocked')
        .map((realm) => {
            const realmId = parseInt(realm.id);
            return {
                ...realm,
                tracks: unlockedTracks.filter((track) => track.realmId === realmId),
            };
        })
        .filter((realmGroup) => realmGroup.tracks.length > 0);

    const toggleRealmExpanded = (realmId: number) => {
        setExpandedRealms((prev) => ({
            ...prev,
            [realmId]: !prev[realmId],
        }));
    };

    if (status === 'loading' || userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="neon-glow text-4xl mb-4">🌌</div>
                    <p className="text-xl">Loading The Nexus...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="glass-card p-12 max-w-md text-center">
                    <h1 className="text-4xl font-display neon-glow mb-4">
                        🌌 THE COSMIC NEXUS 🌌
                    </h1>
                    <p className="text-lg text-secondary mb-8">
                        You must sign in to enter the multiverse.
                    </p>
                    <button
                        onClick={() => signIn('github')}
                        className="btn-primary"
                    >
                        ENTER THE NEXUS
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <RealmBackground
                videoSrc="/nexus-cockpit.mp4"
                realmName="The Cosmic Nexus"
                overlayOpacity={0.3}
            />

            <div className="min-h-screen pb-32">
                <div className="container mx-auto px-4 py-8 max-w-6xl">

                    <header className="text-center mb-12 fade-in">
                        <h1 className="text-5xl md:text-6xl font-display neon-glow mb-4">
                            🌌 THE COSMIC NEXUS 🌌
                        </h1>
                        <p className="text-xl text-secondary">
                            Central Hub • Your Journey Begins Here
                        </p>
                    </header>

                    <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="level-badge">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs opacity-70">LVL</span>
                                    <span>{userLevel}</span>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-display mb-2">
                                    TRAVELER: {session.user?.name || 'Unknown'}
                                </h2>
                                <p className="text-secondary mb-4">
                                    Title: <span className="text-glow">Cosmic Initiate</span>
                                </p>

                                <div className="mb-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Experience</span>
                                        <span className="text-stats">{userXP} / {safeXpToNext} XP</span>
                                    </div>
                                    <div className="stat-bar">
                                        <div
                                            className="stat-bar-fill"
                                            style={{ width: `${xpPercent}%` }}
                                        />
                                    </div>
                                </div>

                                <p className="text-sm text-muted">
                                    Current Realm:{' '}
                                    <span className="text-primary">{currentRealmName}</span> •
                                    Consciousness Level:{' '}
                                    <span className="text-glow">Awakening</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="glass-card p-4">
                                    <div className="text-2xl font-display text-glow">
                                        {currentStreak}
                                    </div>
                                    <div className="text-xs text-muted">Streak</div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-2xl font-display text-glow">
                                        {totalCompletedTrials}
                                    </div>
                                    <div className="text-xs text-muted">Siddhis</div>
                                </div>
                            </div>
                        </div>
                    </div>

                        {moonPhase && (
                            <div className="glass-card p-6 mb-6 fade-in" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-center gap-6">
                                    <div className="text-6xl">{moonPhase.icon}</div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-display mb-2">
                                            {moonPhase.phase}
                                        </h3>
                                        <p className="text-secondary mb-2">{moonPhase.energy}</p>
                                        <p className="text-sm text-muted">{moonPhase.ritualFocus}</p>
                                    </div>
                                    {realmAlignment && (
                                        <div className="text-right">
                                            <p className="text-sm text-secondary mb-1">Aligned Realm</p>
                                            <p className="text-lg font-display text-glow">
                                                {realmAlignment.primaryRealm}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <Link
                            href="/find-your-realm"
                            className="block mb-8 fade-in"
                            style={{ animationDelay: '0.25s' }}
                        >
                            <div
                                className="glass-card p-8 cursor-pointer transition-all hover:scale-[1.01] hover:border-color-electric-blue"
                                style={{
                                    boxShadow: '0 10px 40px rgba(120, 180, 255, 0.12)',
                                }}
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="text-6xl shrink-0">✨</div>

                                    <div className="flex-1">
                                        <p className="text-sm text-secondary uppercase tracking-[0.18em] mb-2">
                                            Guided Entry
                                        </p>

                                        <h3 className="text-3xl font-display mb-3 text-glow">
                                            Find Your Realm
                                        </h3>

                                        <p className="text-secondary mb-4 max-w-2xl">
                                            Enter the realm that matches your current inner state.
                                            Use music, symbols, and guided discovery to move through chaos,
                                            desire, reflection, power, value, or alignment with more intention.
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-5">
                                            {['chaos', 'desire', 'reflection', 'power', 'value', 'alignment'].map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="inline-flex items-center gap-2 text-sm font-medium text-glow">
                                            Start Realm Alignment
                                            <span>→</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <div className="mb-8">
                            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
                                <span className="text-glow">⚡</span>
                                REALM PORTALS
                                <span className="text-glow">⚡</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {realms.map((realm, index) => (
                                    <div
                                        key={realm.id}
                                        className={`realm-portal ${realm.status} fade-in`}
                                        style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-5xl">{realm.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-stats text-glow">
                                                        [{realm.number}]
                                                    </span>
                                                    <h3 className="text-xl font-display">{realm.name}</h3>
                                                </div>
                                                <p className="text-sm text-secondary mb-3">
                                                    {realm.description}
                                                </p>

                                                {realm.status === 'unlocked' ? (
                                                    <>
                                                        <div className="mb-3">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span>Progress</span>
                                                                <span>{realm.progress}%</span>
                                                            </div>
                                                            <div className="stat-bar">
                                                                <div
                                                                    className="stat-bar-fill"
                                                                    style={{ width: `${realm.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <Link href={`/realms/${realm.id}`}>
                                                            <button className="btn-primary w-full">
                                                                ENTER REALM →
                                                            </button>
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <div className="text-sm text-muted italic">
                                                        🔒 {realm.unlockRequirement}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Realm Soundtracks */}
                        <div className="glass-card p-6 mb-8 fade-in" style={{ animationDelay: '0.95s' }}>
                            <h2 className="text-2xl font-display mb-4">🎵 UNLOCKED SOUNDTRACKS</h2>
                            <p className="text-secondary mb-4">
                                Browse each realm’s sonic archive. Expand a realm to explore its unlocked tracks.
                            </p>

                            {groupedTracks.length > 0 ? (
                                <div className="space-y-4">
                                    {groupedTracks.map((realmGroup) => {
                                        const realmId = parseInt(realmGroup.id);
                                        const isExpanded = !!expandedRealms[realmId];
                                        const realmTracks = realmGroup.tracks;
                                        const accentColor = realmTracks[0]?.realmColor || '#7FDBFF';

                                        return (
                                            <div
                                                key={realmGroup.id}
                                                className="rounded-2xl border overflow-hidden"
                                                style={{
                                                    borderColor: `${accentColor}55`,
                                                    background: 'rgba(255,255,255,0.03)',
                                                    boxShadow: `0 6px 24px ${accentColor}15`,
                                                }}
                                            >
                                                <button
                                                    onClick={() => toggleRealmExpanded(realmId)}
                                                    className="w-full text-left px-5 py-4 flex items-center justify-between transition-all hover:bg-white/5"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div
                                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                                            style={{
                                                                background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}66)`,
                                                            }}
                                                        >
                                                            {realmGroup.icon}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p
                                                                className="font-display text-lg truncate"
                                                                style={{ color: accentColor }}
                                                            >
                                                                {realmGroup.name}
                                                            </p>
                                                            <p className="text-sm text-secondary truncate">
                                                                {realmTracks.length} unlocked track{realmTracks.length !== 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-xl text-white/70">
                                                        {isExpanded ? '▾' : '▸'}
                                                    </div>
                                                </button>

                                                {isExpanded && (
                                                    <div className="px-5 pb-5">
                                                        <div className="space-y-3">
                                                            {realmTracks.map((track) => {
                                                                const isCurrent = currentTrack?.id === track.id;

                                                                return (
                                                                    <div
                                                                        key={track.id}
                                                                        className="quest-card"
                                                                        style={{
                                                                            borderColor: isCurrent ? `${track.realmColor}66` : undefined,
                                                                            boxShadow: isCurrent
                                                                                ? `0 0 18px ${track.realmColor}22`
                                                                                : undefined,
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-4">
                                                                            <div
                                                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                                                                                style={{
                                                                                    background: `linear-gradient(135deg, ${track.realmColor}33, ${track.realmColor}66)`,
                                                                                }}
                                                                            >
                                                                                🎵
                                                                            </div>

                                                                            <div className="flex-1 min-w-0">
                                                                                <p
                                                                                    className="font-display truncate"
                                                                                    style={{ color: track.realmColor }}
                                                                                >
                                                                                    {track.trackTitle}
                                                                                </p>
                                                                                <p className="text-sm text-secondary truncate">
                                                                                    {track.artist} • {track.realmName}
                                                                                </p>
                                                                            </div>

                                                                            <button
                                                                                className="btn-secondary"
                                                                                onClick={() => playTrack(track)}
                                                                            >
                                                                                {isCurrent && isPlaying ? 'Playing' : 'Play'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="quest-card opacity-70">
                                    <p className="text-sm text-muted text-center">
                                        No realm tracks unlocked yet. Enter a realm and begin your journey.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="glass-card p-6 mb-8 fade-in" style={{ animationDelay: '0.9s' }}>
                            <h2 className="text-2xl font-display mb-4">
                                📿 RITUAL LAYER
                            </h2>
                            <p className="text-secondary mb-4">
                                Sacred tracking, daily quests, and moon-aligned ritual systems are planned as the next layer of the platform.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="quest-card opacity-70">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">🌙</span>
                                        <span className="text-sm">Moon Calendar</span>
                                    </div>
                                    <p className="text-xs text-muted">Lunar cycle alignment and ritual timing</p>
                                </div>

                                <div className="quest-card opacity-70">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">✍️</span>
                                        <span className="text-sm">Sacred Journal</span>
                                    </div>
                                    <p className="text-xs text-muted">Intentions, mood, and reflection tracking</p>
                                </div>

                                <div className="quest-card opacity-70">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">🧘</span>
                                        <span className="text-sm">Daily Quests</span>
                                    </div>
                                    <p className="text-xs text-muted">Ritual consistency, streaks, and future progression</p>
                                </div>
                            </div>

                            <p className="text-xs text-glow mt-4">
                                — COMING SOON —
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-in" style={{ animationDelay: '1s' }}>
                            <Link href="/profile">
                                <div className="glass-card p-6 text-center cursor-pointer hover:border-color-electric-blue transition-all">
                                    <div className="text-4xl mb-2">👤</div>
                                    <h3 className="font-display">PROFILE</h3>
                                    <p className="text-sm text-muted">View Stats & Progress</p>
                                </div>
                            </Link>

                            <Link href="/leaderboard">
                                <div className="glass-card p-6 text-center cursor-pointer hover:border-color-electric-blue transition-all">
                                    <div className="text-4xl mb-2">🏆</div>
                                    <h3 className="font-display">LEADERBOARD</h3>
                                    <p className="text-sm text-muted">Global Rankings</p>
                                </div>
                            </Link>

                            {/* <Link href="/mysteries">
                            <div className="glass-card p-6 text-center cursor-pointer hover:border-color-electric-blue transition-all">
                                <div className="text-4xl mb-2">🧩</div>
                                <h3 className="font-display">MYSTERIES</h3>
                                <p className="text-sm text-muted">Solve Puzzles & Unlock Secrets</p>
                            </div>
                        </Link> */}
                            <div className="glass-card p-6 text-center opacity-70 cursor-not-allowed">
                                <div className="text-4xl mb-2">🌙</div>
                                <h3 className="font-display">MOON CALENDAR</h3>
                                <p className="text-sm text-muted">Lunar Cycle Alignment</p>
                                <p className="text-xs text-glow mt-1">— COMING SOON —</p>
                            </div>
                        </div>

                        <div className="glass-card p-8 mt-8 text-center fade-in" style={{ animationDelay: '1.1s' }}>
                            <h3 className="text-2xl font-display mb-4 neon-glow">
                                WELCOME TO THE COSMIC MULTIVERSE
                            </h3>
                            <p className="text-secondary mb-4 max-w-2xl mx-auto">
                                You stand at the threshold of six interconnected realms, each representing
                                a different aspect of consciousness and reality. Your journey is unique—where
                                you begin depends on who you are right now.
                            </p>
                            <p className="text-sm text-muted mb-6">
                                Choose a realm above to begin your ascension, or let the moon guide your path.
                            </p>
                            <p className="text-sm text-glow">
                                🔒 Realm Alignment Questionnaire — Coming Soon
                            </p>
                        </div>

                    </div>
                </div>
            </>
            );
}