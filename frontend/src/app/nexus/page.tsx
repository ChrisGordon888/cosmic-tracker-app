'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { getTodayMoonPhase, getRealmMoonAlignment } from '@/lib/moonPhases';
import RealmBackground from '@/components/realm/RealmBackground';
import { GET_ME, LOG_DAILY_LOGIN } from '@/graphql/realms';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { MUSIC_REGISTRY } from '@/lib/musicRegistry';
import { REALM_STATE_MAP, type ExperienceMode, type RealmId } from '@/lib/realmStateMap';
import { REALM_RESULT_CONTENT } from '@/lib/realmResultContent';
import { FEATURED_CONTENT } from '@/lib/featuredContent';
import { REALM_PLAYLIST_LINKS } from '@/lib/realmPlaylistLinks';
import RealmOrbitCard from '@/components/music/RealmOrbitCard';
import '@/styles/realmShared.css';
import '@/styles/nexus.css';

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

interface StoredRealmGuidance {
    realmId: RealmId;
    mode: ExperienceMode;
    recommendedTrack: string;
    reflectionPrompt: string;
    savedAt?: string;
}

const REALM_META = [
    {
        id: '303',
        name: 'FRACTURED FRONTIER',
        number: '303',
        icon: '∴',
        description: 'Chaos into form',
        unlockRequirement: undefined,
    },
    {
        id: '202',
        name: 'THE VEIL',
        number: '202',
        icon: '◐',
        description: 'Desire and mystery',
        unlockRequirement: 'Complete Trials in Fractured Frontier',
    },
    {
        id: '101',
        name: 'MOONLIT ROADS',
        number: '101',
        icon: '☾',
        description: 'Reflection and return',
        unlockRequirement: 'Complete Trials in The Veil',
    },
    {
        id: '55',
        name: 'SKYBOUND CITY',
        number: '55',
        icon: '△',
        description: 'Power with direction',
        unlockRequirement: 'Complete Trials in Moonlit Roads',
    },
    {
        id: '44',
        name: 'ASTRAL BAZAAR',
        number: '44',
        icon: '◇',
        description: 'Value and exchange',
        unlockRequirement: 'Complete Trials in Astral Bazaar',
    },
    {
        id: '0',
        name: 'INTERSIDDHI',
        number: '0',
        icon: '∞',
        description: 'Alignment and source',
        unlockRequirement: 'Complete Trials in Astral Bazaar',
    },
];

function getModeLabel(mode: ExperienceMode) {
    if (mode === 'stay') return 'Stay with this state';
    if (mode === 'move-through') return 'Move through this state';
    return 'Shift toward another state';
}

function ExternalLinkButton({ label, url }: { label: string; url: string }) {
    if (!url) {
        return (
            <span className="nexus-external-link is-disabled">
                {label}
                <span>soon</span>
            </span>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="nexus-external-link"
        >
            {label}
            <span>↗</span>
        </a>
    );
}

export default function CosmicNexusHub() {
    const { data: session, status } = useSession();
    const [moonPhase, setMoonPhase] = useState<any>(null);
    const [realmAlignment, setRealmAlignment] = useState<any>(null);
    const [storedGuidance, setStoredGuidance] = useState<StoredRealmGuidance | null>(null);

    const { playOrToggleTrack, currentTrack, isPlaying } = useMusicPlayer();

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

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem('cosmic:lastRealmAlignment');
            if (!raw) return;

            const parsed = JSON.parse(raw) as StoredRealmGuidance;

            if (parsed?.realmId !== undefined) {
                setStoredGuidance(parsed);
            }
        } catch (error) {
            console.warn('Failed to load stored realm guidance:', error);
        }
    }, []);

    const isSignedIn = !!session;
    const user = userData?.me;

    const userLevel = user?.level ?? 1;
    const userXP = user?.xp ?? 0;
    const xpToNext = user?.xpToNextLevel ?? 100;
    const safeXpToNext = Math.max(xpToNext, 1);
    const xpPercent = Math.min((userXP / safeXpToNext) * 100, 100);
    const currentStreak = user?.streaks?.currentStreak ?? 0;
    const unlockedRealms: number[] = user?.unlockedRealms ?? [303];

    const currentRealmName = (() => {
        if (!isSignedIn) return 'Listener Mode';

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

    /**
     * Important V1.1 shift:
     * All music is available for discovery.
     * Realm progression/trials remain the deeper signed-in layer.
     */
    const groupedTracks = REALM_META.map((realm) => {
        const realmId = parseInt(realm.id);

        return {
            ...realm,
            status: isRealmUnlocked(realmId) ? 'unlocked' : 'locked',
            progress: getRealmProgress(realmId),
            tracks: MUSIC_REGISTRY.filter((track) => track.realmId === realmId),
        };
    }).filter((realmGroup) => realmGroup.tracks.length > 0);

    const guidanceRealmId = storedGuidance?.realmId ?? null;
    const guidanceRealm = guidanceRealmId !== null ? REALM_STATE_MAP[guidanceRealmId] : null;

    const guidanceRealmContent =
        guidanceRealmId !== null ? REALM_RESULT_CONTENT[guidanceRealmId] : null;

    const guidanceMode =
        storedGuidance?.mode ?? guidanceRealmContent?.defaultMode ?? null;

    const guidanceModeContent =
        guidanceRealmContent && guidanceMode
            ? guidanceRealmContent.modeVariants[guidanceMode]
            : null;

    const guidanceTrack = useMemo(() => {
        if (guidanceRealmId === null || !guidanceModeContent) return null;

        return (
            MUSIC_REGISTRY.find(
                (track) =>
                    track.realmId === guidanceRealmId &&
                    track.trackTitle === guidanceModeContent.recommendedTrack
            ) ?? null
        );
    }, [guidanceRealmId, guidanceModeContent]);

    const handlePlayOrbitTrack = (track: { id: string }) => {
        const fullTrack = MUSIC_REGISTRY.find((musicTrack) => musicTrack.id === track.id);

        if (!fullTrack) {
            console.warn('Track not found in music registry:', track.id);
            return;
        }

        void playOrToggleTrack(fullTrack);
    };

    if (status === 'loading' || (session && userLoading)) {
        return (
            <div className="min-h-screen grid place-items-center p-6 nexus-shell">
                <div className="glass-card nexus-panel max-w-md text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full border border-white/15 grid place-items-center text-[#DCBA5C]">
                        ✦
                    </div>

                    <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                        Loading System
                    </p>

                    <h1 className="text-3xl font-display mb-3">
                        Opening the Nexus
                    </h1>

                    <p className="text-secondary">
                        Syncing traveler data, realm progress, and music state.
                    </p>
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

            <div className="min-h-screen pb-32 nexus-shell">
                <div className="container mx-auto px-4 py-6 max-w-5xl nexus-container">
                    <header className="text-center mb-8 fade-in nexus-hero">
                        <h1 className="text-5xl md:text-6xl font-display mb-3">
                            COSMIC NEXUS
                        </h1>

                        <p className="text-lg text-secondary">
                            A public listening portal with a deeper progression path
                        </p>

                        <p className="text-sm text-muted mt-3 max-w-2xl mx-auto">
                            Listen freely. Sign in when you want to save XP, complete realm paths,
                            unlock progression, and build your traveler profile.
                        </p>
                    </header>

                    {isSignedIn ? (
                        <div className="glass-card nexus-panel nexus-identity-card p-5 mb-4 fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="flex flex-col md:flex-row items-center gap-5">
                                <div className="level-badge">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs opacity-70">LVL</span>
                                        <span>{userLevel}</span>
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-xl font-display mb-2">
                                        TRAVELER: {session.user?.name || 'Unknown'}
                                    </h2>

                                    <div className="mb-2">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Experience</span>
                                            <span className="text-stats">
                                                {userXP} / {safeXpToNext} XP
                                            </span>
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
                                        <span className="text-primary">{currentRealmName}</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="glass-card p-3">
                                        <div className="text-xl font-display text-glow">
                                            {currentStreak}
                                        </div>
                                        <div className="text-xs text-muted">Streak</div>
                                    </div>

                                    <div className="glass-card p-3">
                                        <div className="text-xl font-display text-glow">
                                            {user?.completedTrials?.filter((t: any) => t.isComplete).length ?? 0}
                                        </div>
                                        <div className="text-xs text-muted">Siddhis</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card nexus-panel nexus-listener-card p-5 mb-4 fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="flex flex-col md:flex-row md:items-center gap-5">
                                <div className="nexus-symbol-icon shrink-0">♪</div>

                                <div className="flex-1 text-center md:text-left">
                                    <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2">
                                        Public Listener Mode
                                    </p>

                                    <h2 className="text-2xl font-display mb-2">
                                        Explore the sound first
                                    </h2>

                                    <p className="text-sm text-secondary">
                                        The Nexus is open for listening. Create an account when you want
                                        to save progress, earn XP, complete trials, and unlock the deeper realm path.
                                    </p>
                                </div>

                                <button onClick={() => signIn('github')} className="btn-primary shrink-0">
                                    Sign in for Progress
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="glass-card nexus-panel nexus-top-strip p-3 mb-4 fade-in" style={{ animationDelay: '0.15s' }}>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm">
                            <div className="flex items-center gap-3">
                                {moonPhase && (
                                    <>
                                        <span className="text-2xl">{moonPhase.icon}</span>
                                        <span className="text-secondary">{moonPhase.phase}</span>
                                    </>
                                )}
                            </div>

                            <div className="text-muted">
                                {realmAlignment && (
                                    <>
                                        Aligned Realm:{' '}
                                        <span className="text-glow font-medium">
                                            {realmAlignment.primaryRealm}
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="md:ml-auto">
                                <Link href="/find-your-realm" className="text-glow hover:opacity-80 transition-opacity">
                                    Find Your Realm →
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card nexus-panel nexus-featured-card p-5 mb-4 fade-in" style={{ animationDelay: '0.18s' }}>
                        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                            <div
                                className="nexus-featured-mark"
                                style={{
                                    borderColor: `${REALM_STATE_MAP[FEATURED_CONTENT.realmId as RealmId]?.color ?? '#DCBA5C'}55`,
                                    color: REALM_STATE_MAP[FEATURED_CONTENT.realmId as RealmId]?.color ?? '#DCBA5C',
                                }}
                            >
                                {FEATURED_CONTENT.realmMark}
                            </div>

                            <div className="flex-1 text-center lg:text-left">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2">
                                    {FEATURED_CONTENT.eyebrow}
                                </p>

                                <h2 className="text-2xl md:text-3xl font-display mb-2">
                                    {FEATURED_CONTENT.title}
                                </h2>

                                <p className="text-sm text-secondary max-w-2xl">
                                    {FEATURED_CONTENT.description}
                                </p>

                                <p className="text-xs text-muted mt-3">
                                    Featured Realm:{' '}
                                    <span className="text-secondary">
                                        {FEATURED_CONTENT.realmMark} {FEATURED_CONTENT.realmName}
                                    </span>
                                </p>
                            </div>

                            <div className="nexus-featured-links">
                                {FEATURED_CONTENT.links.map((link) => (
                                    <ExternalLinkButton
                                        key={link.label}
                                        label={link.label}
                                        url={link.url}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
                        <Link
                            href="/find-your-realm"
                            className="block fade-in"
                            style={{ animationDelay: '0.2s' }}
                        >
                            <div
                                className="glass-card nexus-panel nexus-guided-entry p-5 h-full cursor-pointer transition-all hover:scale-[1.01]"
                                style={{ boxShadow: '0 8px 28px rgba(120, 180, 255, 0.10)' }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="nexus-symbol-icon shrink-0">✦</div>

                                    <div className="flex-1">
                                        <p className="text-xs text-secondary uppercase tracking-[0.18em] mb-2">
                                            Guided Entry
                                        </p>

                                        <h3 className="text-2xl font-display mb-2 text-glow">
                                            Find Your Realm
                                        </h3>

                                        <p className="text-secondary text-sm mb-3">
                                            Match your current inner state to the right realm and soundtrack.
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {['chaos', 'desire', 'reflection', 'power', 'value', 'alignment'].map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 border border-white/10"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <div className="glass-card nexus-panel nexus-todays-realm p-5 fade-in" style={{ animationDelay: '0.25s' }}>
                            {guidanceRealm && guidanceRealmContent && guidanceModeContent ? (
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${guidanceRealm.color}22, ${guidanceRealm.color}55)`,
                                            border: `1px solid ${guidanceRealm.color}55`,
                                        }}
                                    >
                                        {guidanceRealm.icon}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-secondary uppercase tracking-[0.18em] mb-2">
                                            Today&apos;s Realm
                                        </p>

                                        <h3
                                            className="text-2xl font-display mb-2 truncate"
                                            style={{ color: guidanceRealm.color }}
                                        >
                                            {guidanceRealm.realmName}
                                        </h3>

                                        <p className="text-sm text-secondary mb-2 line-clamp-3">
                                            {guidanceRealmContent.whyRealmFits}
                                        </p>

                                        <p className="text-xs text-muted mb-3 italic line-clamp-2">
                                            “{guidanceModeContent.reflectionPrompt}”
                                        </p>

                                        <div className="text-xs text-muted mb-3">
                                            Track:{' '}
                                            <span className="text-secondary">
                                                {guidanceModeContent.recommendedTrack}
                                            </span>
                                            {guidanceMode && (
                                                <>
                                                    {' '}• Mode:{' '}
                                                    <span className="text-secondary">
                                                        {getModeLabel(guidanceMode)}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {guidanceTrack && (
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => playOrToggleTrack(guidanceTrack)}
                                                >
                                                    {currentTrack?.id === guidanceTrack.id
                                                        ? isPlaying
                                                            ? 'Pause'
                                                            : 'Resume'
                                                        : '▶ Play'}
                                                </button>
                                            )}

                                            <Link href={isSignedIn ? guidanceRealm.route : '/auth'}>
                                                <button className="btn-primary">
                                                    {isSignedIn ? 'Enter →' : 'Save Progress →'}
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs text-secondary uppercase tracking-[0.18em] mb-2">
                                        Today&apos;s Realm
                                    </p>

                                    <h3 className="text-2xl font-display mb-2 text-glow">
                                        No guidance saved yet
                                    </h3>

                                    <p className="text-sm text-secondary mb-3">
                                        Take realm alignment to get a suggested soundtrack, prompt, and realm.
                                    </p>

                                    <Link href="/find-your-realm">
                                        <button className="btn-primary">Find My Realm →</button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card nexus-panel nexus-playlist-layer p-5 mb-5 fade-in" style={{ animationDelay: '0.28s' }}>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2">
                                    Free Listening Layer
                                </p>

                                <h2 className="text-2xl md:text-3xl font-display">
                                    Realm Playlist Links
                                </h2>

                                <p className="text-sm text-secondary mt-1">
                                    Explore COSMIC lanes across YouTube, SoundCloud, Deezer, and future platforms.
                                </p>
                            </div>

                            {!isSignedIn && (
                                <button onClick={() => signIn('github')} className="btn-secondary">
                                    Sign in to save XP
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {REALM_PLAYLIST_LINKS.map((realm) => (
                                <div
                                    key={realm.realmId}
                                    className="nexus-playlist-card"
                                    style={{
                                        borderColor: `${realm.color}33`,
                                        boxShadow: `0 12px 28px ${realm.color}08`,
                                    }}
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div
                                            className="nexus-playlist-mark"
                                            style={{
                                                color: realm.color,
                                                borderColor: `${realm.color}55`,
                                                background: `${realm.color}12`,
                                            }}
                                        >
                                            {realm.mark}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted uppercase tracking-[0.16em]">
                                                Realm {realm.realmId}
                                            </p>

                                            <h3 className="font-display text-lg truncate">
                                                {realm.name}
                                            </h3>

                                            <p className="text-xs text-secondary mt-1">
                                                {realm.tagline}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-xs text-muted mb-4 leading-relaxed">
                                        {realm.listenerCue}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {realm.links.map((link) => (
                                            <ExternalLinkButton
                                                key={`${realm.realmId}-${link.label}`}
                                                label={link.label}
                                                url={link.url}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card nexus-panel nexus-soundtracks p-6 mb-5 fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <h2 className="text-3xl font-display">
                                    <span className="nexus-section-mark">♪</span> SOUNDTRACKS
                                </h2>

                                <p className="text-secondary text-sm mt-1">
                                    Music is open. Realm mastery is earned through the deeper signed-in path.
                                </p>
                            </div>
                        </div>

                        {groupedTracks.length > 0 ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {groupedTracks.map((realmGroup) => {
                                    const realmId = parseInt(realmGroup.id);
                                    const pathUnlocked = isRealmUnlocked(realmId);

                                    return (
                                        <div key={realmGroup.id} className="space-y-3">
                                            <RealmOrbitCard
                                                realmId={realmGroup.id}
                                                realmName={realmGroup.name}
                                                realmIcon={realmGroup.icon}
                                                realmColor={realmGroup.tracks[0]?.realmColor || '#7FDBFF'}
                                                tracks={realmGroup.tracks}
                                                currentTrackId={currentTrack?.id ?? null}
                                                isPlaying={isPlaying}
                                                onPlayTrack={handlePlayOrbitTrack}
                                                progress={realmGroup.progress}
                                                isUnlocked={true}
                                                realmRoute={isSignedIn ? `/realms/${realmGroup.id}` : '/auth'}
                                                isCurrentRealm={isSignedIn && realmId === user?.currentRealm}
                                                isRecommended={guidanceRealmId !== null && realmId === guidanceRealmId}
                                                compactOnMobile
                                            />

                                            <div className="nexus-path-note">
                                                <span>Soundtrack Available</span>
                                                <span>
                                                    {isSignedIn
                                                        ? pathUnlocked
                                                            ? 'Realm Path Open'
                                                            : 'Realm Path Locked'
                                                        : 'Sign in to save progression'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="quest-card opacity-70">
                                <p className="text-sm text-muted text-center">
                                    No realm tracks available yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}