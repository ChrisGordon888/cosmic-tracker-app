'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { getTodayMoonPhase, getRealmMoonAlignment } from '@/lib/moonPhases';
import RealmBackground from '@/components/realm/RealmBackground';
import { GET_ME, LOG_DAILY_LOGIN } from '@/graphql/realms';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import {
    CURRENT_FEATURED_RELEASE,
    FLAGSHIP_TRACKS,
    MUSIC_REGISTRY,
    PUBLIC_THREE_PIECE_COLLECTIONS,
    PUBLIC_TRACKS,
    REALM_NAMES,
    VAULT_TRACKS,
    getCurrentReleaseTracks,
    getTrackById,
} from '@/lib/musicRegistry';
import { REALM_STATE_MAP, type ExperienceMode, type RealmId } from '@/lib/realmStateMap';
import { REALM_RESULT_CONTENT } from '@/lib/realmResultContent';
import RealmOrbitCard from '@/components/music/RealmOrbitCard';
import '@/styles/realmShared.css';
import '@/styles/nexus.css';

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
        description: 'Where pressure becomes motion.',
        unlockRequirement: undefined,
    },
    {
        id: '202',
        name: 'THE VEIL',
        number: '202',
        icon: '◐',
        description: 'A nocturnal world of desire, temptation, and inner signal.',
        unlockRequirement: 'Complete Trials in Fractured Frontier',
    },
    {
        id: '101',
        name: 'MOONLIT ROADS',
        number: '101',
        icon: '☾',
        description: 'For memory, softness, and finding your way back.',
        unlockRequirement: 'Complete Trials in The Veil',
    },
    {
        id: '55',
        name: 'SKYBOUND CITY',
        number: '55',
        icon: '△',
        description: 'Ambition, command, and the discipline to rise.',
        unlockRequirement: 'Complete Trials in Moonlit Roads',
    },
    {
        id: '44',
        name: 'ASTRAL BAZAAR',
        number: '44',
        icon: '◇',
        description: 'Focus, worth, and the cost of what you choose.',
        unlockRequirement: 'Complete Trials in Skybound City',
    },
    {
        id: '0',
        name: 'INTERSIDDHI',
        number: '0',
        icon: '∞',
        description: 'Return to center. Move from the highest signal.',
        unlockRequirement: 'Complete Trials in Astral Bazaar',
    },
];

const RELEASE_UNLOCKS: Record<string, string> = {
    'sin-do-over': '2026-06-29T00:00:00',
    'sin-running-from-the-plug': '2026-07-14T00:00:00',
    '101-hold-my-hand': '2026-07-29T00:00:00',
    '303-in-the-deep': '2026-07-29T00:00:00',
    '202-her-fantasy': '2026-07-29T00:00:00',
    '202-siren': '2026-07-29T00:00:00',
};

const CURATED_PLAYLIST_ART_OVERRIDES: Record<string, string> = {
    'realm-303-break-the-code': '/break-the-code.png',
    'realm-202-dont-follow-the-siren': '/veil-signal.png',
    'realm-101-hold-on-while-you-drift': '/hold-on-while-you-drift.png',
    'realm-55-glory-and-command': '/glory-and-command.png',
    'realm-44-price-of-focus': '/price-of-focus.png',
    'realm-0-same-self-higher-form': '/same-self-higher-form.png',
    'cosmic-featured-signal': '/featured-signal.png',
    'april-may-vault': '/april-may-vault.png',
};

function getModeLabel(mode: ExperienceMode) {
    if (mode === 'stay') return 'Stay with this state';
    if (mode === 'move-through') return 'Move through this state';
    return 'Shift toward another state';
}

function formatUnlockDate(dateString?: string | null) {
    if (!dateString) return null;

    try {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString));
    } catch {
        return null;
    }
}

function getCollectionTypeLabel(totalCount: number, openCount: number) {
    if (totalCount <= 1) return 'Signal';
    if (openCount < totalCount) return 'Curated EP';
    return 'Curated EP';
}

function getCollectionStatusCopy(totalCount: number, openCount: number) {
    if (totalCount <= 1) {
        return openCount > 0 ? 'Available now' : 'Coming soon';
    }

    return openCount < totalCount ? 'Rolling out' : 'Complete collection';
}

function getCollectionMetaCopy(totalCount: number) {
    if (totalCount <= 1) return 'Featured track';
    if (totalCount === 2) return 'Two-track capsule';
    if (totalCount === 3) return 'Three-track EP';
    return `${totalCount}-song collection`;
}

export default function CosmicNexusHub() {
    const { data: session, status } = useSession();
    const [moonPhase, setMoonPhase] = useState<any>(null);
    const [realmAlignment, setRealmAlignment] = useState<any>(null);
    const [storedGuidance, setStoredGuidance] = useState<StoredRealmGuidance | null>(null);

    const [showJourneys, setShowJourneys] = useState(false);
    const [showVault, setShowVault] = useState(false);
    const [showArchive, setShowArchive] = useState(false);
    const [showReleaseDetails, setShowReleaseDetails] = useState(false);

    const soundtrackCarouselRef = useRef<HTMLDivElement | null>(null);

    const curatedCarouselRef = useRef<HTMLDivElement | null>(null);

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
    const completedSiddhis = user?.completedTrials?.filter((t: any) => t.isComplete).length ?? 0;

    const currentRealmName = (() => {
        if (!isSignedIn) return 'Listener Mode';

        const meta = REALM_META.find((r) => parseInt(r.id) === user?.currentRealm);
        return meta?.name ?? 'None';
    })();

    const currentRelease = CURRENT_FEATURED_RELEASE;
    const currentReleaseTracks = useMemo(() => getCurrentReleaseTracks(), []);
    const currentReleasePrimaryTrack = useMemo(() => {
        if (!currentRelease?.primaryTrackId) return null;
        return getTrackById(currentRelease.primaryTrackId) ?? null;
    }, [currentRelease]);

    const isTrackLocked = (track: any) => {
        if (!track) return false;
        if (track.visibility === 'premium') return true;

        const unlockDate = RELEASE_UNLOCKS[track.id];
        if (!unlockDate) return false;

        return new Date() < new Date(unlockDate);
    };

    const getTrackUnlockLabel = (track: any) => {
        if (!track) return null;
        if (track.visibility === 'premium') return 'Premium';

        return formatUnlockDate(RELEASE_UNLOCKS[track.id]);
    };

    const getTrackLockLabel = (track: any) => {
        if (!track) return null;
        if (track.visibility === 'premium') return 'Premium';

        const unlockLabel = getTrackUnlockLabel(track);
        return unlockLabel ? `Opens ${unlockLabel}` : null;
    };

    const tryPlayTrack = (track: any) => {
        if (!track) return;
        if (isTrackLocked(track)) return;
        void playOrToggleTrack(track);
    };

    const getRealmProgress = (realmId: number): number => {
        const trials =
            user?.completedTrials?.filter((t: any) => t.realmId === realmId) ?? [];
        const completed = trials.filter((t: any) => t.isComplete).length;
        return Math.floor((completed / 3) * 100);
    };

    const isRealmUnlocked = (realmId: number): boolean => unlockedRealms.includes(realmId);

    const nexusPublicTracks = useMemo(() => {
        return [...PUBLIC_TRACKS].sort((a, b) => {
            const aOrder = a.sortOrder ?? 999;
            const bOrder = b.sortOrder ?? 999;

            if (aOrder !== bOrder) return aOrder - bOrder;

            return a.trackTitle.localeCompare(b.trackTitle);
        });
    }, []);

    const groupedTracks = REALM_META.map((realm) => {
        const realmId = parseInt(realm.id);

        return {
            ...realm,
            status: isRealmUnlocked(realmId) ? 'unlocked' : 'locked',
            progress: getRealmProgress(realmId),
            tracks: nexusPublicTracks.filter((track) => track.realmId === realmId),
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

        tryPlayTrack(fullTrack);
    };

    const flagshipTrack = FLAGSHIP_TRACKS[0] ?? null;
    const publicThreePieceCollections = PUBLIC_THREE_PIECE_COLLECTIONS;
    const vaultTrackCount = VAULT_TRACKS.length;

    const guidanceTrackLocked = guidanceTrack ? isTrackLocked(guidanceTrack) : false;
    const currentReleasePrimaryLocked = currentReleasePrimaryTrack
        ? isTrackLocked(currentReleasePrimaryTrack)
        : false;

    const currentTimeline = currentRelease?.timeline ?? [];
    const lockedReleaseCount = currentReleaseTracks.filter((track) => isTrackLocked(track)).length;
    const availableReleaseCount = currentReleaseTracks.length - lockedReleaseCount;
    const primaryUnlockLabel = currentReleasePrimaryTrack
        ? getTrackUnlockLabel(currentReleasePrimaryTrack)
        : null;
    const releaseArtworkUrl = currentRelease?.coverArtUrl ?? null;
    const featuredSignalArtwork =
        CURATED_PLAYLIST_ART_OVERRIDES['cosmic-featured-signal'] ??
        releaseArtworkUrl ??
        null;
    const vaultArtwork = CURATED_PLAYLIST_ART_OVERRIDES['april-may-vault'] ?? null;

    const getCuratedCollectionArtwork = (collection: any) => {
        return (
            CURATED_PLAYLIST_ART_OVERRIDES[collection.id] ??
            collection.artworkUrl ??
            (collection.releaseProjectId === currentRelease?.id ? releaseArtworkUrl : null)
        );
    };

    const panelStyle = {
        borderRadius: '28px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.026))',
        boxShadow: '0 18px 50px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.05)',
    };

    const sectionStyle = {
        borderRadius: '30px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.022))',
        boxShadow: '0 18px 56px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)',
    };

    if (status === 'loading' || (session && userLoading)) {
        return (
            <div className="min-h-screen grid place-items-center p-6 nexus-shell">
                <div
                    className="glass-card nexus-panel max-w-md text-center"
                    style={{
                        padding: '2rem',
                        borderRadius: '28px',
                        background:
                            'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))',
                        boxShadow:
                            '0 20px 60px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                >
                    <div
                        className="mx-auto mb-4 w-12 h-12 rounded-full border border-white/15 grid place-items-center text-[#DCBA5C]"
                        style={{
                            background:
                                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 55%, rgba(255,255,255,0.02) 100%)',
                            boxShadow: '0 8px 28px rgba(0,0,0,0.24)',
                        }}
                    >
                        ✦
                    </div>

                    <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                        Loading
                    </p>

                    <h1 className="text-3xl font-display mb-3">Opening the Nexus</h1>

                    <p className="text-secondary">Preparing your path.</p>
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
                <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl nexus-container">
                    <header
                        className="text-center mb-7 md:mb-8 fade-in nexus-hero"
                        style={{
                            paddingTop: '0.5rem',
                        }}
                    >
                        <p
                            className="text-xs uppercase tracking-[0.24em] text-muted mb-3"
                            style={{ letterSpacing: '0.24em' }}
                        >
                            Current Release
                        </p>

                        <h1
                            className="text-5xl md:text-6xl font-display mb-3"
                            style={{
                                letterSpacing: '-0.03em',
                                textShadow: '0 10px 36px rgba(0,0,0,0.28)',
                            }}
                        >
                            COSMIC NEXUS
                        </h1>

                        <p className="text-lg text-secondary max-w-3xl mx-auto">
                            Start with the active release, then move through the realm soundtracks, curated EPs, and find archive vaults as the worlds expand.
                        </p>
                    </header>

                    {currentRelease && currentReleasePrimaryTrack && (
                        <section
                            id="current-release"
                            className="glass-card nexus-panel p-5 md:p-7 mb-5 fade-in"
                            style={{
                                ...sectionStyle,
                                borderRadius: '34px',
                            }}
                        >
                            <div
                                className="mx-auto text-center"
                                style={{
                                    maxWidth: '760px',
                                }}
                            >
                                {releaseArtworkUrl ? (
                                    <div className="mb-5 flex justify-center">
                                        <img
                                            src={releaseArtworkUrl}
                                            alt={currentRelease.title}
                                            style={{
                                                width: 'min(260px, 72vw)',
                                                aspectRatio: '1 / 1',
                                                objectFit: 'cover',
                                                borderRadius: '26px',
                                                border: '1px solid rgba(255,255,255,0.12)',
                                                boxShadow: '0 24px 60px rgba(0,0,0,0.32)',
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="mb-5 flex justify-center">
                                        <div
                                            style={{
                                                width: '220px',
                                                aspectRatio: '1 / 1',
                                                borderRadius: '26px',
                                                display: 'grid',
                                                placeItems: 'center',
                                                fontSize: '1.7rem',
                                                color: '#f2f5ff',
                                                border: '1px solid rgba(255,255,255,0.12)',
                                                background:
                                                    'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 58%), linear-gradient(145deg, rgba(20,24,36,0.94), rgba(10,12,22,0.95))',
                                                boxShadow:
                                                    '0 24px 54px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)',
                                            }}
                                        >
                                            ✦
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                    <span
                                        className="px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.14em] bg-[#7c5cff22] border border-[#7c5cff44] text-[#cdb7ff]"
                                        style={{ backdropFilter: 'blur(10px)' }}
                                    >
                                        {currentRelease.title}
                                    </span>

                                    <span
                                        className="px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.14em] bg-white/5 border border-white/10 text-secondary"
                                        style={{ backdropFilter: 'blur(10px)' }}
                                    >
                                        {availableReleaseCount} available • {lockedReleaseCount} coming soon
                                    </span>
                                </div>

                                <h2
                                    className="text-4xl md:text-5xl font-display mb-2 text-glow"
                                    style={{
                                        letterSpacing: '-0.03em',
                                        lineHeight: 1.02,
                                    }}
                                >
                                    {currentRelease.title}
                                </h2>

                                <p className="text-base md:text-lg text-white/90 mb-2">
                                    {currentReleasePrimaryTrack.trackTitle}
                                </p>

                                <p className="text-secondary text-sm md:text-base max-w-2xl mx-auto mb-5 leading-relaxed">
                                    {currentReleasePrimaryLocked
                                        ? `The lead track opens ${primaryUnlockLabel}.`
                                        : 'Now playing in the Nexus.'}
                                </p>

                                <div className="flex flex-wrap justify-center gap-2.5 mb-5">
                                    <button
                                        className="btn-primary"
                                        onClick={() => tryPlayTrack(currentReleasePrimaryTrack)}
                                        disabled={currentReleasePrimaryLocked}
                                        style={{
                                            borderRadius: '999px',
                                            boxShadow: '0 14px 28px rgba(0,0,0,0.2)',
                                            opacity: currentReleasePrimaryLocked ? 0.55 : 1,
                                            cursor: currentReleasePrimaryLocked ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {currentReleasePrimaryLocked
                                            ? `Opens ${primaryUnlockLabel}`
                                            : currentTrack?.id === currentReleasePrimaryTrack.id && isPlaying
                                                ? 'Pause Track'
                                                : `▶ Play ${currentReleasePrimaryTrack.trackTitle}`}
                                    </button>

                                    <button
                                        className="btn-secondary"
                                        onClick={() => setShowReleaseDetails((prev) => !prev)}
                                        style={{
                                            borderRadius: '999px',
                                            backdropFilter: 'blur(10px)',
                                        }}
                                    >
                                        {showReleaseDetails ? 'Close Details' : 'Open Release'}
                                    </button>
                                </div>

                                <div className="flex flex-wrap justify-center gap-2">
                                    {currentTimeline.map((step) => (
                                        <div
                                            key={`${step.label}-${step.dateLabel}`}
                                            className="px-3 py-2 rounded-2xl border text-[11px] uppercase tracking-[0.12em]"
                                            style={{
                                                borderColor:
                                                    step.status === 'now'
                                                        ? 'rgba(139,92,246,0.42)'
                                                        : step.status === 'next'
                                                            ? 'rgba(56,189,248,0.35)'
                                                            : 'rgba(255,255,255,0.12)',
                                                background:
                                                    step.status === 'now'
                                                        ? 'rgba(139,92,246,0.12)'
                                                        : step.status === 'next'
                                                            ? 'rgba(56,189,248,0.10)'
                                                            : 'rgba(255,255,255,0.04)',
                                                color: 'rgba(255,255,255,0.88)',
                                            }}
                                        >
                                            <span className="block text-white/95">{step.label}</span>
                                            <span className="text-white/65">{step.dateLabel}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {showReleaseDetails && (
                                <div
                                    className="mt-6 pt-5"
                                    style={{
                                        borderTop: '1px solid rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <div className="mx-auto" style={{ maxWidth: '920px' }}>
                                        <div className="flex items-end justify-between gap-3 mb-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.18em] text-muted mb-1">
                                                    Tracklist
                                                </p>
                                                <h3 className="text-2xl font-display">SIRENS in Neverland</h3>
                                            </div>

                                            <span className="text-xs text-muted">
                                                {currentReleaseTracks.length} tracks
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            {currentReleaseTracks.map((track, index) => {
                                                const locked = isTrackLocked(track);
                                                const unlockLabel = getTrackUnlockLabel(track);

                                                return (
                                                    <div
                                                        key={track.id}
                                                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                                                        style={{
                                                            borderColor: `${track.realmColor}28`,
                                                            background:
                                                                'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                                                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                                                        }}
                                                    >
                                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                                                                        {String(index + 1).padStart(2, '0')}
                                                                    </span>
                                                                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                                                                        {REALM_NAMES[track.realmId]}
                                                                    </span>
                                                                    <span
                                                                        className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em]"
                                                                        style={{
                                                                            background: locked
                                                                                ? 'rgba(255,255,255,0.06)'
                                                                                : `${track.realmColor}18`,
                                                                            border: locked
                                                                                ? '1px solid rgba(255,255,255,0.12)'
                                                                                : `1px solid ${track.realmColor}38`,
                                                                            color: locked ? 'rgba(255,255,255,0.72)' : track.realmColor,
                                                                        }}
                                                                    >
                                                                        {locked ? 'soon' : 'open'}
                                                                    </span>
                                                                </div>

                                                                <h4 className="text-lg font-display leading-tight">
                                                                    {track.trackTitle}
                                                                </h4>
                                                                <p className="text-sm text-secondary">
                                                                    {locked ? `Opens ${unlockLabel}` : 'Available now'}
                                                                </p>
                                                            </div>

                                                            <button
                                                                className="btn-secondary shrink-0"
                                                                onClick={() => tryPlayTrack(track)}
                                                                disabled={locked}
                                                                style={{
                                                                    borderRadius: '999px',
                                                                    opacity: locked ? 0.55 : 1,
                                                                    cursor: locked ? 'not-allowed' : 'pointer',
                                                                    minWidth: '150px',
                                                                }}
                                                            >
                                                                {locked ? `Opens ${unlockLabel}` : `▶ Play`}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
                        {isSignedIn ? (
                            <div
                                className="glass-card nexus-panel p-5 fade-in"
                                style={{
                                    ...panelStyle,
                                    animationDelay: '0.12s',
                                }}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="level-badge">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs opacity-70">LVL</span>
                                            <span>{userLevel}</span>
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs uppercase tracking-[0.18em] text-muted mb-1">
                                            Traveler
                                        </p>
                                        <h2 className="text-xl font-display truncate">
                                            {session.user?.name || 'Unknown'}
                                        </h2>
                                        <p className="text-sm text-muted">
                                            Current Realm: <span className="text-primary">{currentRealmName}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Experience</span>
                                        <span className="text-stats">
                                            {userXP} / {safeXpToNext} XP
                                        </span>
                                    </div>

                                    <div className="stat-bar">
                                        <div className="stat-bar-fill" style={{ width: `${xpPercent}%` }} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="glass-card p-3">
                                        <div className="text-xl font-display text-glow">{currentStreak}</div>
                                        <div className="text-xs text-muted">Streak</div>
                                    </div>

                                    <div className="glass-card p-3">
                                        <div className="text-xl font-display text-glow">{completedSiddhis}</div>
                                        <div className="text-xs text-muted">Siddhis</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="glass-card nexus-panel p-5 fade-in xl:col-span-1"
                                style={{
                                    ...panelStyle,
                                    animationDelay: '0.12s',
                                }}
                            >
                                <p className="text-xs uppercase tracking-[0.18em] text-muted mb-2">
                                    Listener Mode
                                </p>
                                <h2 className="text-2xl font-display mb-2">Begin with the music</h2>
                                <p className="text-sm text-secondary mb-4 leading-relaxed">
                                    Sign in to save your path, unlock progression, and return to your realm.
                                </p>
                                <button
                                    onClick={() => signIn('github')}
                                    className="btn-primary w-full"
                                    style={{ borderRadius: '999px' }}
                                >
                                    Sign In to Begin
                                </button>
                            </div>
                        )}

                        <div
                            className="glass-card nexus-panel p-5 fade-in"
                            style={{
                                ...panelStyle,
                                animationDelay: '0.14s',
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="nexus-signal-mark shrink-0">⌁</div>
                                <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted mb-2">
                                        Guided Entry
                                    </p>
                                    <h3 className="text-2xl font-display mb-2 text-glow">Find Your Realm</h3>
                                    <p className="text-secondary text-sm mb-3 leading-relaxed">
                                        Answer from where you are. The Nexus will guide you toward the realm that fits your current energy.
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {['chaos', 'desire', 'reflection', 'power', 'value', 'alignment'].map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 border border-white/10"
                                                style={{ backdropFilter: 'blur(10px)' }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <Link
                                        href="/find-your-realm"
                                        className="btn-secondary inline-flex"
                                        style={{ borderRadius: '999px' }}
                                    >
                                        Find Your Realm
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div
                            className="glass-card nexus-panel p-5 fade-in"
                            style={{
                                ...panelStyle,
                                animationDelay: '0.16s',
                            }}
                        >
                            <p className="text-xs uppercase tracking-[0.18em] text-muted mb-2">
                                Moon Alignment
                            </p>

                            <div className="flex items-center gap-3 mb-3">
                                {moonPhase && <div className="nexus-moon-mark shrink-0">{moonPhase.icon}</div>}
                                <div className="min-w-0">
                                    <p className="text-lg font-display">
                                        {moonPhase?.phase ?? 'Moon Loading'}
                                    </p>
                                    <p className="text-sm text-secondary">
                                        {realmAlignment ? (
                                            <>
                                                Aligned Realm:{' '}
                                                <span className="text-glow font-medium">
                                                    {realmAlignment.primaryRealm}
                                                </span>
                                            </>
                                        ) : (
                                            'Reading alignment'
                                        )}
                                    </p>
                                </div>
                            </div>

                            {guidanceRealm && guidanceRealmContent && guidanceModeContent ? (
                                <>
                                    <p className="text-sm text-secondary mb-2 line-clamp-2 leading-relaxed">
                                        {guidanceRealmContent.whyRealmFits}
                                    </p>
                                    <p className="text-xs text-muted italic mb-3 line-clamp-2">
                                        “{guidanceModeContent.reflectionPrompt}”
                                    </p>
                                    <div className="text-xs text-muted mb-3">
                                        Track:{' '}
                                        <span className="text-secondary">
                                            {guidanceModeContent.recommendedTrack}
                                        </span>
                                        {guidanceMode && (
                                            <>
                                                {' '}
                                                • Mode:{' '}
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
                                                onClick={() => tryPlayTrack(guidanceTrack)}
                                                disabled={guidanceTrackLocked}
                                                style={{
                                                    borderRadius: '999px',
                                                    opacity: guidanceTrackLocked ? 0.55 : 1,
                                                    cursor: guidanceTrackLocked ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                {guidanceTrackLocked
                                                    ? `Opens ${getTrackUnlockLabel(guidanceTrack)}`
                                                    : currentTrack?.id === guidanceTrack.id && isPlaying
                                                        ? 'Pause Track'
                                                        : '▶ Play Track'}
                                            </button>
                                        )}
                                        <Link
                                            href={isSignedIn ? guidanceRealm.route : '/auth'}
                                            className="btn-primary inline-flex"
                                            style={{ borderRadius: '999px' }}
                                        >
                                            {isSignedIn ? 'Enter Realm' : 'Save Progress'}
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <Link
                                    href="/find-your-realm"
                                    className="btn-primary inline-flex mt-1"
                                    style={{ borderRadius: '999px' }}
                                >
                                    Find My Realm
                                </Link>
                            )}
                        </div>
                    </div>

                    <section
                        id="realm-soundtracks"
                        className="glass-card nexus-panel nexus-soundtracks p-6 mb-5 fade-in"
                        style={{
                            ...sectionStyle,
                            animationDelay: '0.24s',
                        }}
                    >
                        <style jsx>{`
        .realm-carousel {
    scrollbar-width: none;
    -ms-overflow-style: none;
    align-items: stretch;
}

.realm-carousel::-webkit-scrollbar {
    display: none;
}

.realm-carousel-item {
    flex: 0 0 86%;
    scroll-snap-align: start;
    min-width: 0;
    max-width: 86%;
    display: flex;
}

.realm-carousel-item > :global(*) {
    width: 100%;
    min-width: 0;
}

        @media (min-width: 768px) {
    .realm-carousel-item {
        flex-basis: calc((100% - 16px) / 2);
        max-width: calc((100% - 16px) / 2);
    }
}

@media (min-width: 1024px) {
    .realm-carousel-item {
        flex-basis: calc((100% - 32px) / 3);
        max-width: calc((100% - 32px) / 3);
    }
}
    `}</style>

                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <h2 className="text-3xl font-display">
                                    <span className="nexus-section-mark">♪</span> REALM SOUNDTRACKS
                                </h2>
                                <p className="text-secondary text-sm mt-1 leading-relaxed max-w-2xl">
                                    Browse each realm in a single horizontal flow. Playable tracks populate the orbit, while locked releases remain visible in the full tracklist.
                                </p>
                            </div>

                            <div className="hidden md:flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    aria-label="Scroll soundtrack carousel left"
                                    className="rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition-all"
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                    onClick={() =>
                                        soundtrackCarouselRef.current?.scrollBy({
                                            left: -340,
                                            behavior: 'smooth',
                                        })
                                    }
                                >
                                    ←
                                </button>

                                <button
                                    type="button"
                                    aria-label="Scroll soundtrack carousel right"
                                    className="rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition-all"
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                    onClick={() =>
                                        soundtrackCarouselRef.current?.scrollBy({
                                            left: 340,
                                            behavior: 'smooth',
                                        })
                                    }
                                >
                                    →
                                </button>
                            </div>
                        </div>

                        {groupedTracks.length > 0 ? (
                            <div
                                ref={soundtrackCarouselRef}
                                className="realm-carousel flex gap-4 overflow-x-auto pb-2 pr-2"
                                style={{
                                    scrollSnapType: 'x mandatory',
                                    WebkitOverflowScrolling: 'touch',
                                }}
                            >
                                {groupedTracks.map((realmGroup) => {
                                    const realmId = parseInt(realmGroup.id);
                                    const pathUnlocked = isRealmUnlocked(realmId);

                                    return (
                                        <div
                                            key={realmGroup.id}
                                            className="realm-carousel-item"
                                        >
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
                                                carouselMode
                                                isTrackLocked={isTrackLocked}
                                                getTrackLockLabel={getTrackLockLabel}
                                                pathLabel={
                                                    isSignedIn
                                                        ? pathUnlocked
                                                            ? 'Realm Open'
                                                            : 'Realm Locked'
                                                        : 'Sign in to save your path'
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="quest-card opacity-70">
                                <p className="text-sm text-muted text-center">
                                    New realm tracks will appear here as the world opens.
                                </p>
                            </div>
                        )}
                    </section>



                    <section className="mb-5 fade-in" style={{ animationDelay: '0.28s' }}>
                        <button
                            className="glass-card nexus-panel w-full p-4 flex items-center justify-between text-left"
                            onClick={() => setShowJourneys((prev) => !prev)}
                            style={{
                                ...sectionStyle,
                                borderRadius: '26px',
                            }}
                        >
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted mb-1">
                                    Curated Listening
                                </p>
                                <h2 className="text-2xl font-display">
                                    <span className="nexus-section-mark">⌁</span> CURATED EPS
                                </h2>
                            </div>
                            <span className="text-xl text-secondary">{showJourneys ? '−' : '+'}</span>
                        </button>

                        {showJourneys && publicThreePieceCollections.length > 0 && (
                            <div
                                className="glass-card nexus-panel p-5 mt-3"
                                style={{
                                    ...sectionStyle,
                                    borderRadius: '28px',
                                }}
                            >
                                <style jsx>{`
            .curated-shelf {
    scrollbar-width: none;
    -ms-overflow-style: none;
    align-items: stretch;
}

.curated-shelf::-webkit-scrollbar {
    display: none;
}

.curated-shelf-item {
    flex: 0 0 84%;
    scroll-snap-align: start;
    min-width: 0;
    max-width: 84%;
    display: flex;
}

.curated-shelf-item > :global(*) {
    width: 100%;
    min-width: 0;
}

           @media (min-width: 768px) {
    .curated-shelf-item {
        flex-basis: 320px;
        max-width: 320px;
    }
}

@media (min-width: 1280px) {
    .curated-shelf-item {
        flex-basis: 340px;
        max-width: 340px;
    }
}
        `}</style>

                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <p className="text-secondary text-sm leading-relaxed max-w-2xl">
                                            Focused listening arcs built around artwork, mood, and sequence.
                                        </p>
                                    </div>

                                    <div className="hidden md:flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            aria-label="Scroll curated EPs left"
                                            className="rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition-all"
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                backdropFilter: 'blur(10px)',
                                            }}
                                            onClick={() =>
                                                curatedCarouselRef.current?.scrollBy({
                                                    left: -320,
                                                    behavior: 'smooth',
                                                })
                                            }
                                        >
                                            ←
                                        </button>

                                        <button
                                            type="button"
                                            aria-label="Scroll curated EPs right"
                                            className="rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition-all"
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                backdropFilter: 'blur(10px)',
                                            }}
                                            onClick={() =>
                                                curatedCarouselRef.current?.scrollBy({
                                                    left: 320,
                                                    behavior: 'smooth',
                                                })
                                            }
                                        >
                                            →
                                        </button>
                                    </div>
                                </div>

                                <div
                                    ref={curatedCarouselRef}
                                    className="curated-shelf flex gap-4 overflow-x-auto pb-1 pr-2"
                                    style={{
                                        scrollSnapType: 'x mandatory',
                                        WebkitOverflowScrolling: 'touch',
                                    }}
                                >
                                    {publicThreePieceCollections.map((collection) => {
                                        const allCollectionTracks = collection.trackIds
                                            .map((trackId) => getTrackById(trackId))
                                            .filter(Boolean);

                                        const openCollectionTracks = allCollectionTracks.filter(
                                            (track) => !isTrackLocked(track)
                                        );

                                        const firstTrack = openCollectionTracks[0] ?? allCollectionTracks[0] ?? null;
                                        const leadTrack = openCollectionTracks[0] ?? null;
                                        const openCount = openCollectionTracks.length;
                                        const totalCount = allCollectionTracks.length;
                                        const collectionArtwork = getCuratedCollectionArtwork(collection);
                                        const collectionTypeLabel = getCollectionTypeLabel(totalCount, openCount);
                                        const collectionStatusCopy = getCollectionStatusCopy(totalCount, openCount);
                                        const collectionMetaCopy = getCollectionMetaCopy(totalCount);

                                        if (!firstTrack) return null;

                                        return (
                                            <div key={collection.id} className="curated-shelf-item">
                                                <div
                                                    className="rounded-[24px] border border-white/10 bg-white/[0.03] overflow-hidden h-full flex flex-col min-w-0"
                                                    style={{
                                                        borderColor: `${firstTrack.realmColor}26`,
                                                        background:
                                                            'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.018))',
                                                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            position: 'relative',
                                                            aspectRatio: '1 / 0.76',
                                                            background: collectionArtwork
                                                                ? `linear-gradient(180deg, rgba(8,10,18,0.06), rgba(8,10,18,0.52)), url(${collectionArtwork}) center/cover`
                                                                : `radial-gradient(circle at top left, ${firstTrack.realmColor}24, rgba(255,255,255,0.03) 42%, rgba(9,11,20,0.82) 100%)`,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                inset: 0,
                                                                background:
                                                                    'linear-gradient(180deg, rgba(6,8,14,0.02) 0%, rgba(6,8,14,0.12) 42%, rgba(6,8,14,0.82) 100%)',
                                                            }}
                                                        />

                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                top: 12,
                                                                left: 12,
                                                                right: 12,
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                gap: 10,
                                                            }}
                                                        >
                                                            <span
                                                                className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.16em]"
                                                                style={{
                                                                    background: 'rgba(8,10,18,0.42)',
                                                                    border: '1px solid rgba(255,255,255,0.12)',
                                                                    backdropFilter: 'blur(10px)',
                                                                    color: 'rgba(255,255,255,0.92)',
                                                                }}
                                                            >
                                                                {collection.realmId ? `Realm ${collection.realmId}` : collectionTypeLabel}
                                                            </span>

                                                            <span
                                                                className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.16em]"
                                                                style={{
                                                                    background:
                                                                        openCount < totalCount
                                                                            ? 'rgba(255,255,255,0.08)'
                                                                            : `${firstTrack.realmColor}22`,
                                                                    border:
                                                                        openCount < totalCount
                                                                            ? '1px solid rgba(255,255,255,0.12)'
                                                                            : `1px solid ${firstTrack.realmColor}44`,
                                                                    backdropFilter: 'blur(10px)',
                                                                    color:
                                                                        openCount < totalCount
                                                                            ? 'rgba(255,255,255,0.82)'
                                                                            : firstTrack.realmColor,
                                                                }}
                                                            >
                                                                {collectionTypeLabel}
                                                            </span>
                                                        </div>

                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                left: 16,
                                                                right: 16,
                                                                bottom: 16,
                                                            }}
                                                        >
                                                            <p className="text-[10px] uppercase tracking-[0.18em] text-white/70 mb-2">
                                                                {collectionMetaCopy}
                                                            </p>

                                                            <h3
                                                                className="font-display mb-1.5"
                                                                style={{
                                                                    fontSize: '1.2rem',
                                                                    lineHeight: 1.05,
                                                                    textShadow: '0 10px 28px rgba(0,0,0,0.32)',
                                                                }}
                                                            >
                                                                {collection.title}
                                                            </h3>

                                                            <p className="text-sm text-white/78 line-clamp-2 leading-relaxed">
                                                                {collection.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="p-3.5 flex flex-col flex-1 min-w-0">
                                                        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 min-w-0 max-w-full">
                                                            {allCollectionTracks.length > 0 ? (
                                                                allCollectionTracks.map((track) => {
                                                                    const locked = isTrackLocked(track);
                                                                    const lockLabel = getTrackLockLabel(track);
                                                                    const isCurrentTrack = currentTrack?.id === track!.id;

                                                                    return (
                                                                        <button
                                                                            key={track!.id}
                                                                            onClick={() => tryPlayTrack(track!)}
                                                                            disabled={locked}
                                                                            className="shrink-0 px-2.5 py-1.5 rounded-full text-[11px] border transition-all whitespace-nowrap"
                                                                            style={{
                                                                                borderColor: isCurrentTrack
                                                                                    ? `${track!.realmColor}88`
                                                                                    : locked
                                                                                        ? 'rgba(255,255,255,0.10)'
                                                                                        : `${track!.realmColor}22`,
                                                                                background: isCurrentTrack
                                                                                    ? `${track!.realmColor}22`
                                                                                    : locked
                                                                                        ? 'rgba(255,255,255,0.025)'
                                                                                        : 'rgba(255,255,255,0.04)',
                                                                                color: locked
                                                                                    ? 'rgba(255,255,255,0.45)'
                                                                                    : isCurrentTrack
                                                                                        ? track!.realmColor
                                                                                        : 'rgba(255,255,255,0.74)',
                                                                                opacity: locked ? 0.72 : 1,
                                                                                cursor: locked ? 'not-allowed' : 'pointer',
                                                                            }}
                                                                            title={locked && lockLabel ? lockLabel : track!.trackTitle}
                                                                        >
                                                                            {locked
                                                                                ? `🔒 ${track!.trackTitle}${lockLabel ? ` • ${lockLabel}` : ''}`
                                                                                : `${isCurrentTrack && isPlaying ? '⏸' : '♪'} ${track!.trackTitle}`}
                                                                        </button>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-secondary whitespace-nowrap">
                                                                    Collection coming soon
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between gap-3 mb-2">
                                                            <p className="text-[11px] text-muted uppercase tracking-[0.14em]">
                                                                {collectionStatusCopy}
                                                            </p>
                                                            <p className="text-[11px] text-muted">
                                                                {openCount}/{totalCount} open
                                                            </p>
                                                        </div>

                                                        <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-3">
                                                            {collection.story}
                                                        </p>

                                                        {leadTrack && (
                                                            <button
                                                                className="btn-secondary w-full mt-auto"
                                                                onClick={() => tryPlayTrack(leadTrack)}
                                                                style={{
                                                                    borderRadius: '999px',
                                                                }}
                                                            >
                                                                {currentTrack?.id === leadTrack.id && isPlaying
                                                                    ? 'Pause Preview'
                                                                    : `▶ Play Preview`}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 fade-in" style={{ animationDelay: '0.32s' }}>
                        <div>
                            <button
                                className="glass-card nexus-panel w-full p-4 flex items-center justify-between text-left mb-3"
                                onClick={() => setShowVault((prev) => !prev)}
                                style={{
                                    ...sectionStyle,
                                    borderRadius: '26px',
                                }}
                            >
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-muted mb-1">
                                        Archive
                                    </p>
                                    <h3 className="text-lg font-display">April–May Vault</h3>
                                </div>
                                <span className="text-xl text-secondary">{showVault ? '−' : '+'}</span>
                            </button>

                            {showVault && (
                                <div
                                    className="glass-card nexus-panel overflow-hidden"
                                    style={{
                                        ...sectionStyle,
                                        borderRadius: '24px',
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'relative',
                                            minHeight: '220px',
                                            background: vaultArtwork
                                                ? `linear-gradient(180deg, rgba(8,10,18,0.04), rgba(8,10,18,0.56)), url(${vaultArtwork}) center/cover`
                                                : 'linear-gradient(135deg, rgba(30,34,48,0.95), rgba(8,10,18,0.98))',
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background:
                                                    'linear-gradient(180deg, rgba(6,8,14,0.10) 0%, rgba(6,8,14,0.20) 30%, rgba(6,8,14,0.82) 100%)',
                                            }}
                                        />

                                        <div className="relative p-5 md:p-6 flex flex-col justify-end min-h-[220px]">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.16em] bg-white/10 border border-white/12 text-white/90">
                                                    Archive
                                                </span>
                                                <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.16em] bg-white/6 border border-white/10 text-white/72">
                                                    {vaultTrackCount} vault tracks
                                                </span>
                                            </div>

                                            <h4 className="text-2xl md:text-3xl font-display mb-2 text-white">
                                                April–May Vault
                                            </h4>
                                            <p className="text-sm md:text-base text-white/78 max-w-xl leading-relaxed">
                                                A private archive from the April–May era — preserved as part of the Nexus timeline, separate from the main release path.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-sm text-secondary leading-relaxed">
                                            {vaultTrackCount} tracks live in this vault, held as a deeper cut of the journey rather than part of the main release sequence.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                className="glass-card nexus-panel w-full p-4 flex items-center justify-between text-left mb-3"
                                onClick={() => setShowArchive((prev) => !prev)}
                                style={{
                                    ...sectionStyle,
                                    borderRadius: '26px',
                                }}
                            >
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-muted mb-1">
                                        Featured Signal
                                    </p>
                                    <h3 className="text-lg font-display">
                                        {flagshipTrack?.trackTitle ?? 'Featured Signal'}
                                    </h3>
                                </div>
                                <span className="text-xl text-secondary">{showArchive ? '−' : '+'}</span>
                            </button>

                            {showArchive && (
                                <div
                                    className="glass-card nexus-panel overflow-hidden"
                                    style={{
                                        ...sectionStyle,
                                        borderRadius: '24px',
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'relative',
                                            minHeight: '220px',
                                            background: featuredSignalArtwork
                                                ? `linear-gradient(180deg, rgba(8,10,18,0.04), rgba(8,10,18,0.56)), url(${featuredSignalArtwork}) center/cover`
                                                : 'linear-gradient(135deg, rgba(18,20,34,0.96), rgba(8,10,18,0.98))',
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background:
                                                    'linear-gradient(180deg, rgba(6,8,14,0.10) 0%, rgba(6,8,14,0.18) 30%, rgba(6,8,14,0.84) 100%)',
                                            }}
                                        />

                                        <div className="relative p-5 md:p-6 flex flex-col justify-end min-h-[220px]">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.16em] bg-white/10 border border-white/12 text-white/90">
                                                    Featured signal
                                                </span>
                                                <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.16em] bg-white/6 border border-white/10 text-white/72">
                                                    Direct entry
                                                </span>
                                            </div>

                                            <h4 className="text-2xl md:text-3xl font-display mb-2 text-white">
                                                {flagshipTrack?.trackTitle ?? 'Featured Signal'}
                                            </h4>
                                            <p className="text-sm md:text-base text-white/78 max-w-xl leading-relaxed">
                                                A direct entry point into the Cosmic world — one track, one image, one clear doorway into the sound.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-sm text-secondary mb-3 leading-relaxed">
                                            This track stands on its own within the Nexus: a first door for new listeners and a quick return point for travelers.
                                        </p>

                                        {flagshipTrack && (
                                            <button
                                                className="btn-secondary"
                                                onClick={() => tryPlayTrack(flagshipTrack)}
                                                disabled={isTrackLocked(flagshipTrack)}
                                                style={{
                                                    borderRadius: '999px',
                                                    opacity: isTrackLocked(flagshipTrack) ? 0.55 : 1,
                                                    cursor: isTrackLocked(flagshipTrack) ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                {isTrackLocked(flagshipTrack)
                                                    ? `Opens ${getTrackUnlockLabel(flagshipTrack)}`
                                                    : currentTrack?.id === flagshipTrack.id && isPlaying
                                                        ? 'Pause Track'
                                                        : '▶ Play Track'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
