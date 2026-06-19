'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { getRealmTheme } from '@/lib/realmTheme';

interface OrbitTrack {
    id: string;
    trackUrl?: string;
    trackTitle: string;
    artist: string;
    realmName: string;
    realmColor: string;
    realmId: number;
    role?: string;
    visibility?: string;
    isRealmAnchor?: boolean;
    isPublicPick?: boolean;
    vibe?: string[];
    sortOrder?: number;
}

interface RealmOrbitCardProps {
    realmId?: string | number;
    realmName: string;
    realmIcon: string;
    realmColor: string;
    tracks: OrbitTrack[];
    currentTrackId?: string | null;
    isPlaying?: boolean;
    onPlayTrack: (track: OrbitTrack) => void;

    progress?: number;
    isUnlocked?: boolean;
    realmRoute?: string;
    isCurrentRealm?: boolean;
    isRecommended?: boolean;
    compactOnMobile?: boolean;
    carouselMode?: boolean;
    pathLabel?: string;

    isTrackLocked?: (track: OrbitTrack) => boolean;
    getTrackLockLabel?: (track: OrbitTrack) => string | null;

    /**
     * Optional override for the player queue.
     * Use this when a card should start a broader flow, such as Nexus-wide playback,
     * instead of staying limited to the current realm.
     */
    flowTracks?: OrbitTrack[];
    flowSource?: 'track' | 'nexus' | 'realm' | 'collection' | 'release' | 'vault' | 'catalog';
    flowLabel?: string;
}

function getResponsiveOrbitSize() {
    if (typeof window === 'undefined') return 360;

    const width = window.innerWidth;

    if (width < 380) return 240;
    if (width < 480) return 260;
    if (width < 768) return 300;

    return 360;
}

function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleRadians: number
) {
    return {
        x: centerX + radius * Math.cos(angleRadians),
        y: centerY + radius * Math.sin(angleRadians),
    };
}

function getRealmStateTags(realmName: string): string[] {
    const normalized = realmName.toLowerCase();

    if (normalized.includes('fractured')) return ['chaos', 'pressure', 'activation'];
    if (normalized.includes('veil')) return ['desire', 'mystery', 'hidden truth'];
    if (normalized.includes('moonlit')) return ['reflection', 'grief', 'integration'];
    if (normalized.includes('skybound')) return ['power', 'discipline', 'manifestation'];
    if (normalized.includes('bazaar')) return ['value', 'discernment', 'exchange'];
    if (normalized.includes('intersiddhi')) return ['alignment', 'blessing', 'source'];

    return ['realm', 'sound', 'navigation'];
}

function formatRealmDisplayName(realmName: string) {
    return realmName
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getCompactPathLabel(pathLabel?: string) {
    if (!pathLabel) return null;

    return pathLabel
        .replace('soundtrack tracks', 'tracks')
        .replace('soundtrack track', 'track')
        .replace('Join to save', 'Join');
}

export default function RealmOrbitCard({
    realmId,
    realmName,
    realmIcon,
    realmColor: fallbackRealmColor,
    tracks,
    currentTrackId,
    isPlaying = false,
    onPlayTrack,
    progress = 0,
    isUnlocked = true,
    realmRoute,
    isCurrentRealm = false,
    isRecommended = false,
    compactOnMobile = false,
    carouselMode = false,
    pathLabel,
    isTrackLocked,
    getTrackLockLabel,
    flowTracks,
    flowSource = 'realm',
    flowLabel,
}: RealmOrbitCardProps) {
    const { playOrToggleTrack } = useMusicPlayer();

    const sortedTracks = useMemo(() => {
        return [...tracks].sort((a, b) => {
            const aOrder = a.sortOrder ?? 999;
            const bOrder = b.sortOrder ?? 999;

            if (aOrder !== bOrder) return aOrder - bOrder;

            return a.trackTitle.localeCompare(b.trackTitle);
        });
    }, [tracks]);

    const trackIsLocked = useCallback(
        (track?: OrbitTrack | null) => {
            if (!track) return false;
            return isTrackLocked?.(track) ?? false;
        },
        [isTrackLocked]
    );

    const getLockLabel = useCallback(
        (track?: OrbitTrack | null) => {
            if (!track) return null;
            return getTrackLockLabel?.(track) ?? null;
        },
        [getTrackLockLabel]
    );

    const playableTracks = useMemo(() => {
        return sortedTracks.filter((track) => !trackIsLocked(track));
    }, [sortedTracks, trackIsLocked]);

    const orbitTracks = useMemo(() => {
        return playableTracks.slice(0, 8);
    }, [playableTracks]);

    const [cardSize, setCardSize] = useState(360);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(
        playableTracks[0]?.id ?? sortedTracks[0]?.id ?? null
    );


    useEffect(() => {
        const updateSize = () => {
            setCardSize(getResponsiveOrbitSize());
            setIsMobile(window.innerWidth <= 768);
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, []);

    useEffect(() => {
        if (currentTrackId && sortedTracks.some((track) => track.id === currentTrackId)) {
            setSelectedTrackId(currentTrackId);
            return;
        }

        if (sortedTracks.length > 0 && !selectedTrackId) {
            setSelectedTrackId(playableTracks[0]?.id ?? sortedTracks[0].id);
        }
    }, [currentTrackId, sortedTracks, playableTracks, selectedTrackId]);

    const centerX = cardSize / 2;
    const centerY = isMobile ? cardSize * 0.45 : cardSize / 2;
    const centerSize = Math.round(cardSize * 0.255);
    const nodeSize = Math.round(cardSize * 0.145);
    const orbitRadius = Math.round(cardSize * 0.355);
    const innerRingSize = Math.round(cardSize * 0.61);
    const outerRingSize = Math.round(cardSize * 0.78);

    const orbitNodes = useMemo(() => {
        const trackCount = Math.max(orbitTracks.length, 1);

        return orbitTracks.map((track, index) => {
            const angle = (2 * Math.PI * index) / trackCount - Math.PI / 2;
            const point = polarToCartesian(centerX, centerY, orbitRadius, angle);

            return {
                ...track,
                x: point.x,
                y: point.y,
                driftDelay: `${index * 0.6}s`,
            };
        });
    }, [orbitTracks, centerX, centerY, orbitRadius]);

    const selectedTrack =
        sortedTracks.find((track) => track.id === selectedTrackId) ?? sortedTracks[0] ?? null;

    const selectedTrackLocked = trackIsLocked(selectedTrack);
    const selectedTrackLockLabel = getLockLabel(selectedTrack);
    const selectedIsCurrent = selectedTrack?.id === currentTrackId;

    const anchorTrack = sortedTracks.find(
        (track) => track.isRealmAnchor || track.role === 'anchor'
    );

    const selectedIsAnchor = Boolean(
        selectedTrack?.isRealmAnchor || selectedTrack?.role === 'anchor'
    );

    const realmTags = getRealmStateTags(realmName);
    const realmDisplayName = formatRealmDisplayName(realmName);
    const compactPathLabel = getCompactPathLabel(pathLabel);
    const clampedProgress = Math.max(0, Math.min(progress, 100));

    const themeRealmId = selectedTrack?.realmId ?? Number(realmId);
    const realmTheme = getRealmTheme(themeRealmId);
    const realmColor = realmTheme.accent || fallbackRealmColor;
    const realmSoft = realmTheme.soft;
    const realmBorder = realmTheme.border;
    const realmGlow = realmTheme.glow;

    const realmPlayableFlowQueue = useMemo(() => {
        return playableTracks.filter(
            (track): track is OrbitTrack & { trackUrl: string } => Boolean(track.trackUrl)
        );
    }, [playableTracks]);

    const activeFlowQueue = useMemo(() => {
        const sourceTracks =
            flowTracks && flowTracks.length > 0 ? flowTracks : realmPlayableFlowQueue;

        return sourceTracks.filter(
            (track): track is OrbitTrack & { trackUrl: string } =>
                Boolean(track.trackUrl) && !trackIsLocked(track)
        );
    }, [flowTracks, realmPlayableFlowQueue, trackIsLocked]);

    const activeFlowOptions = useMemo(
        () => ({
            source: flowSource,
            label:
                flowLabel ||
                (flowSource === 'nexus' ? 'Nexus flow' : `${realmDisplayName} flow`),
        }),
        [flowLabel, flowSource, realmDisplayName]
    );

    const playTrackInActiveFlow = async (track: OrbitTrack) => {
        if (trackIsLocked(track)) return;

        if (!track.trackUrl) {
            onPlayTrack(track);
            return;
        }

        const queue =
            activeFlowQueue.length > 0
                ? activeFlowQueue
                : [track as OrbitTrack & { trackUrl: string }];

        await playOrToggleTrack(
            track as OrbitTrack & { trackUrl: string },
            queue,
            activeFlowOptions
        );
    };

    const handleTrackClick = (track: OrbitTrack) => {
        setSelectedTrackId(track.id);

        if (trackIsLocked(track)) {
            return;
        }

        void playTrackInActiveFlow(track);
    };

    const handleSelectOnly = (track: OrbitTrack) => {
        setSelectedTrackId(track.id);
    };

    const renderTrackPill = (track: OrbitTrack) => {
        const isSelected = selectedTrackId === track.id;
        const isCurrent = currentTrackId === track.id;
        const locked = trackIsLocked(track);
        const lockLabel = getLockLabel(track);

        return (
            <button
                key={track.id}
                onClick={() => handleTrackClick(track)}
                className="shrink-0 px-2.5 py-1.5 rounded-full text-[11px] border transition-all whitespace-nowrap"
                style={{
                    borderColor:
                        isSelected || isCurrent
                            ? realmColor
                            : locked
                                ? 'rgba(255,255,255,0.10)'
                                : realmSoft,
                    background:
                        isSelected || isCurrent
                            ? realmSoft
                            : locked
                                ? 'rgba(255,255,255,0.025)'
                                : 'rgba(255,255,255,0.04)',
                    color:
                        locked
                            ? 'rgba(255,255,255,0.45)'
                            : isSelected || isCurrent
                                ? realmColor
                                : 'rgba(255,255,255,0.72)',
                    opacity: locked ? 0.72 : 1,
                    cursor: locked ? 'not-allowed' : 'pointer',
                }}
                title={locked && lockLabel ? lockLabel : track.trackTitle}
            >
                {locked
                    ? `🔒 ${track.trackTitle}${lockLabel ? ` • ${lockLabel}` : ''}`
                    : `${isCurrent && isPlaying ? '⏸' : '♪'} ${track.trackTitle}`}
            </button>
        );
    };

    if (carouselMode || (compactOnMobile && isMobile)) {
        const miniSize = 96;
        const miniCenter = miniSize / 2;
        const miniRadius = carouselMode ? 32 : 34;
        const miniTracks = orbitTracks.slice(0, 5);

        const miniNodes = miniTracks.map((track, index) => {
            const angle = (2 * Math.PI * index) / Math.max(miniTracks.length, 1) - Math.PI / 2;

            return {
                ...track,
                x: miniCenter + miniRadius * Math.cos(angle),
                y: miniCenter + miniRadius * Math.sin(angle),
            };
        });

        return (
            <div
                className="realm-orbit-card nexus-compact-orbit rounded-[28px] border p-4 relative overflow-hidden h-full"
                style={{
                    borderColor: realmBorder,
                    background: `radial-gradient(circle at top left, ${realmSoft}, transparent 46%), linear-gradient(145deg, rgba(255,255,255,0.035), rgba(8,10,18,0.82))`,
                    boxShadow: `0 10px 28px ${realmGlow}, inset 0 1px 0 rgba(255,255,255,0.055)`,
                    minHeight: carouselMode ? '388px' : undefined,
                }}
            >
                <div
                    className="absolute inset-0 pointer-events-none opacity-28"
                    style={{
                        background: `radial-gradient(circle at 40% 30%, ${realmGlow}, transparent 58%)`,
                    }}
                />

                <div className="relative flex flex-col h-full min-w-0">
                    <div
                        className="grid items-center gap-4 min-w-0"
                        style={{
                            gridTemplateColumns: `${miniSize + 2}px minmax(0, 1fr)`,
                        }}
                    >
                        <div className="flex items-center justify-center self-center">
                            <div
                                className="relative shrink-0"
                                style={{ width: `${miniSize}px`, height: `${miniSize}px` }}
                            >
                                <div
                                    className="absolute rounded-full"
                                    style={{
                                        width: `${miniSize - 14}px`,
                                        height: `${miniSize - 14}px`,
                                        left: `${miniCenter - (miniSize - 14) / 2}px`,
                                        top: `${miniCenter - (miniSize - 14) / 2}px`,
                                        border: `1px solid ${realmBorder}`,
                                        boxShadow: `0 0 14px ${realmGlow}`,
                                        opacity: 0.55,
                                    }}
                                />

                                <div
                                    className="absolute rounded-full"
                                    style={{
                                        width: `${miniSize - 32}px`,
                                        height: `${miniSize - 32}px`,
                                        left: `${miniCenter - (miniSize - 32) / 2}px`,
                                        top: `${miniCenter - (miniSize - 32) / 2}px`,
                                        border: `1px dashed ${realmBorder}`,
                                        boxShadow: `0 0 10px ${realmGlow}`,
                                        opacity: 0.72,
                                    }}
                                />

                                <svg
                                    className="absolute inset-0 pointer-events-none"
                                    width={miniSize}
                                    height={miniSize}
                                    viewBox={`0 0 ${miniSize} ${miniSize}`}
                                    aria-hidden="true"
                                >
                                    {miniNodes.map((track) => {
                                        const isCurrent = currentTrackId === track.id;
                                        const isSelected = selectedTrackId === track.id;
                                        const locked = trackIsLocked(track);

                                        return (
                                            <line
                                                key={`mini-line-${track.id}`}
                                                x1={miniCenter}
                                                y1={miniCenter}
                                                x2={track.x}
                                                y2={track.y}
                                                stroke={
                                                    locked
                                                        ? 'rgba(255,255,255,0.16)'
                                                        : isCurrent || isSelected
                                                            ? realmColor
                                                            : realmBorder
                                                }
                                                strokeWidth={isCurrent ? 1.6 : isSelected ? 1.35 : 1}
                                                strokeLinecap="round"
                                                opacity={locked ? 0.22 : isCurrent ? 0.72 : isSelected ? 0.58 : 0.34}
                                            />
                                        );
                                    })}
                                </svg>

                                <div
                                    className="absolute rounded-full"
                                    style={{
                                        width: `${Math.round(miniSize * 0.5)}px`,
                                        height: `${Math.round(miniSize * 0.5)}px`,
                                        left: `${miniCenter - Math.round(miniSize * 0.25)}px`,
                                        top: `${miniCenter - Math.round(miniSize * 0.25)}px`,
                                        background: `radial-gradient(circle at 35% 35%, ${realmColor}, ${realmSoft})`,
                                        border: `1px solid ${realmBorder}`,
                                        boxShadow: `0 0 14px ${realmGlow}`,
                                    }}
                                />

                                <button
                                    onClick={() => selectedTrack && handleTrackClick(selectedTrack)}
                                    className="absolute rounded-full flex items-center justify-center text-lg"
                                    style={{
                                        width: `${Math.round(miniSize * 0.36)}px`,
                                        height: `${Math.round(miniSize * 0.36)}px`,
                                        left: `${miniCenter - Math.round(miniSize * 0.18)}px`,
                                        top: `${miniCenter - Math.round(miniSize * 0.18)}px`,
                                        background: selectedTrackLocked
                                            ? 'rgba(255,255,255,0.08)'
                                            : `radial-gradient(circle at 35% 35%, ${realmColor}, ${realmSoft})`,
                                        border: selectedTrackLocked
                                            ? '1px solid rgba(255,255,255,0.16)'
                                            : `1px solid ${realmBorder}`,
                                        boxShadow: selectedTrackLocked
                                            ? 'none'
                                            : `0 0 16px ${realmGlow}`,
                                        cursor: selectedTrackLocked ? 'not-allowed' : 'pointer',
                                    }}
                                    aria-label={selectedTrack ? `Play ${selectedTrack.trackTitle}` : `Play ${realmName}`}
                                >
                                    {selectedTrackLocked
                                        ? '🔒'
                                        : selectedIsCurrent && isPlaying
                                            ? '⏸'
                                            : realmIcon}
                                </button>

                                {miniNodes.map((track) => {
                                    const isCurrent = currentTrackId === track.id;
                                    const isSelected = selectedTrackId === track.id;
                                    const locked = trackIsLocked(track);

                                    return (
                                        <button
                                            key={track.id}
                                            onClick={() => handleTrackClick(track)}
                                            className="absolute rounded-full flex items-center justify-center text-[10px]"
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                left: `${track.x}px`,
                                                top: `${track.y}px`,
                                                transform: 'translate(-50%, -50%)',
                                                background: locked
                                                    ? 'rgba(255,255,255,0.07)'
                                                    : isCurrent
                                                        ? `radial-gradient(circle, ${realmColor}, ${realmSoft})`
                                                        : isSelected
                                                            ? `radial-gradient(circle, ${realmColor}, ${realmSoft})`
                                                            : `radial-gradient(circle, ${realmColor}, ${realmSoft})`,
                                                border: `1px solid ${locked
                                                    ? 'rgba(255,255,255,0.14)'
                                                    : isCurrent || isSelected
                                                        ? realmColor
                                                        : realmBorder
                                                    }`,
                                                boxShadow: locked
                                                    ? 'none'
                                                    : isCurrent
                                                        ? `0 0 12px ${realmGlow}`
                                                        : `0 0 6px ${realmGlow}`,
                                                opacity: locked ? 0.62 : 1,
                                                cursor: locked ? 'not-allowed' : 'pointer',
                                            }}
                                            title={track.trackTitle}
                                            aria-label={locked ? `${track.trackTitle} locked` : `Play ${track.trackTitle}`}
                                        >
                                            {locked ? '🔒' : isCurrent && isPlaying ? 'Ⅱ' : '♪'}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="min-w-0 self-center">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <p className="text-[9px] uppercase tracking-[0.18em] text-white/45">
                                    Realm Soundtrack
                                </p>

                                {isCurrentRealm && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[0.12em] bg-white/5 border border-white/10 text-white/70">
                                        Current
                                    </span>
                                )}

                                {isRecommended && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[0.12em] bg-yellow-300/10 border border-yellow-300/20 text-yellow-200/90">
                                        Suggested
                                    </span>
                                )}
                            </div>

                            <h3
                                className="font-display leading-tight mb-2 uppercase"
                                style={{
                                    color: 'rgba(245,247,252,0.94)',
                                    fontSize: carouselMode ? '1.12rem' : '1.2rem',
                                    letterSpacing: '0.08em',
                                    textShadow: realmTheme.textShadow,
                                }}
                            >
                                {realmDisplayName}
                            </h3>

                            {selectedTrack ? (
                                <>
                                    <p className="text-[9px] uppercase tracking-[0.16em] text-white/38 mb-1">
                                        Now playing
                                    </p>

                                    <p
                                        className="text-[1.02rem] truncate font-medium"
                                        style={{
                                            color: selectedTrackLocked
                                                ? 'rgba(255,255,255,0.52)'
                                                : realmColor,
                                            textShadow: selectedTrackLocked
                                                ? 'none'
                                                : realmTheme.textShadow,
                                        }}
                                    >
                                        {selectedTrackLocked ? '🔒 ' : ''}
                                        {selectedTrack.trackTitle}
                                    </p>
                                    <p className="text-xs text-white/55 truncate">
                                        {selectedTrack.artist}
                                    </p>
                                    {selectedTrackLocked && selectedTrackLockLabel && (
                                        <p className="text-[11px] text-white/42 truncate mt-1">
                                            {selectedTrackLockLabel}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-xs text-white/55">
                                    No track selected yet.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/50 mb-1.5">
                            <span>Progress</span>
                            <span>{clampedProgress}%</span>
                        </div>

                        <div className="h-2 rounded-full overflow-hidden bg-white/10 border border-white/10">
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${clampedProgress}%`,
                                    background: `linear-gradient(90deg, ${realmSoft}, ${realmColor})`,
                                    boxShadow: `0 0 10px ${realmGlow}`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <button
                            onClick={() => selectedTrack && handleTrackClick(selectedTrack)}
                            className="btn-secondary text-sm"
                            disabled={selectedTrackLocked}
                            style={{
                                minHeight: '50px',
                                padding: '0.72rem 0.95rem',
                                borderRadius: '999px',
                                opacity: selectedTrackLocked ? 0.55 : 1,
                                cursor: selectedTrackLocked ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {selectedTrackLocked
                                ? selectedTrackLockLabel ?? 'Locked'
                                : selectedIsCurrent && isPlaying
                                    ? 'Pause'
                                    : selectedIsCurrent
                                        ? 'Resume'
                                        : 'Play'}
                        </button>

                        {realmRoute && isUnlocked ? (
                            <Link href={realmRoute} className="block">
                                <button
                                    className="btn-primary text-sm w-full"
                                    style={{
                                        minHeight: '50px',
                                        padding: '0.72rem 0.95rem',
                                        borderRadius: '999px',
                                    }}
                                >
                                    Enter →
                                </button>
                            </Link>
                        ) : (
                            <div />
                        )}
                    </div>

                    {sortedTracks.length > 1 && (
                        <div className="relative mt-4 flex gap-2 overflow-x-auto pb-1 w-full">
                            {sortedTracks.map(renderTrackPill)}
                        </div>
                    )}

                    {compactPathLabel && (
                        <div className="mt-auto pt-4">
                            <div
                                className="rounded-2xl border px-3 py-2.5 flex items-center justify-between gap-3"
                                style={{
                                    borderColor: realmSoft,
                                    background: 'rgba(255,255,255,0.026)',
                                }}
                            >
                                <span className="text-[10px] uppercase tracking-[0.16em] text-white/42 whitespace-nowrap">
                                    Soundtrack Path
                                </span>
                                <span
                                    className="text-[10px] font-medium text-right whitespace-nowrap"
                                    style={{
                                        color:
                                            compactPathLabel.toLowerCase().includes('locked') ||
                                                compactPathLabel.toLowerCase().includes('join') ||
                                                compactPathLabel.toLowerCase().includes('sign in')
                                                ? 'rgba(255,255,255,0.58)'
                                                : realmColor,
                                    }}
                                >
                                    {compactPathLabel}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className="realm-orbit-card rounded-3xl border p-4 md:p-6 relative overflow-hidden"
            style={{
                borderColor: realmBorder,
                background: `radial-gradient(circle at top left, ${realmSoft}, transparent 44%), rgba(255,255,255,0.03)`,
                boxShadow: `0 8px 30px ${realmGlow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
        >
            <style jsx>{`
                @keyframes orbitSpinSlow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes orbitSpinReverse {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }

                @keyframes nodeFloat {
                    0%, 100% { transform: translate(-50%, -50%); }
                    50% { transform: translate(-50%, calc(-50% - 4px)); }
                }

                @keyframes nodePulse {
                    0%, 100% {
                        transform: translate(-50%, -50%) scale(1);
                        box-shadow: 0 0 24px ${realmGlow};
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.08);
                        box-shadow: 0 0 34px ${realmGlow};
                    }
                }

                @keyframes corePulse {
                    0%, 100% {
                        box-shadow:
                            0 0 30px ${realmGlow},
                            0 0 60px ${realmGlow};
                    }
                    50% {
                        box-shadow:
                            0 0 42px ${realmGlow},
                            0 0 72px ${realmGlow};
                    }
                }

                .orbit-ring-slow {
                    animation: orbitSpinSlow 36s linear infinite;
                    transform-origin: center center;
                }

                .orbit-ring-reverse {
                    animation: orbitSpinReverse 52s linear infinite;
                    transform-origin: center center;
                }

                .orbit-node-idle {
                    animation: nodeFloat 4.8s ease-in-out infinite;
                }

                .orbit-node-active {
                    animation: nodePulse 2.2s ease-in-out infinite;
                }

                .realm-core-pulse {
                    animation: corePulse 4s ease-in-out infinite;
                }

                @media (max-width: 480px) {
                    .orbit-node-idle,
                    .orbit-node-active,
                    .realm-core-pulse,
                    .orbit-ring-slow,
                    .orbit-ring-reverse {
                        animation-duration: 0s;
                        animation-name: none;
                    }
                }
            `}</style>

            <div
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                    background: `radial-gradient(circle at center, ${realmGlow} 0%, transparent 62%)`,
                }}
            />

            <div className="relative min-w-0">
                <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                            Realm Music Portal
                        </p>

                        {anchorTrack && (
                            <span
                                className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em]"
                                style={{
                                    background: realmSoft,
                                    border: `1px solid ${realmBorder}`,
                                    color: realmColor,
                                }}
                            >
                                Realm Anchor: {anchorTrack.trackTitle}
                            </span>
                        )}
                    </div>

                    <h3 className="text-2xl font-display" style={{ color: realmColor }}>
                        {realmDisplayName}
                    </h3>

                    <p className="text-xs text-white/55 mt-1">
                        {orbitTracks.length} playable in orbit • {sortedTracks.length} total track
                        {sortedTracks.length === 1 ? '' : 's'}
                    </p>
                </div>

                <div
                    className="realm-orbit-stage relative mx-auto mb-0"
                    style={{
                        width: `${cardSize}px`,
                        height: isMobile ? `${Math.round(cardSize * 0.9)}px` : `${cardSize}px`,
                        maxWidth: '100%',
                    }}
                >
                    <div
                        className="absolute orbit-ring-slow rounded-full"
                        style={{
                            width: `${innerRingSize}px`,
                            height: `${innerRingSize}px`,
                            left: `${centerX - innerRingSize / 2}px`,
                            top: `${centerY - innerRingSize / 2}px`,
                            border: `1.5px dashed ${realmBorder}`,
                            boxShadow: `0 0 16px ${realmGlow}`,
                        }}
                    >
                        <div
                            className="absolute rounded-full"
                            style={{
                                width: '18px',
                                height: '18px',
                                top: '-9px',
                                left: 'calc(50% - 9px)',
                                background: `radial-gradient(circle, ${realmColor}, ${realmSoft})`,
                                boxShadow: `0 0 18px ${realmGlow}`,
                            }}
                        />
                    </div>

                    <div
                        className="absolute orbit-ring-reverse rounded-full"
                        style={{
                            width: `${outerRingSize}px`,
                            height: `${outerRingSize}px`,
                            left: `${centerX - outerRingSize / 2}px`,
                            top: `${centerY - outerRingSize / 2}px`,
                            border: `1px dashed ${realmBorder}`,
                            boxShadow: `0 0 12px ${realmGlow}`,
                        }}
                    >
                        <div
                            className="absolute rounded-full"
                            style={{
                                width: '14px',
                                height: '14px',
                                top: '-7px',
                                left: 'calc(50% - 7px)',
                                background: `radial-gradient(circle, ${realmColor}, ${realmSoft})`,
                                boxShadow: `0 0 14px ${realmGlow}`,
                            }}
                        />
                    </div>

                    <svg
                        className="absolute inset-0 pointer-events-none"
                        width={cardSize}
                        height={cardSize}
                        viewBox={`0 0 ${cardSize} ${cardSize}`}
                    >
                        {orbitNodes.map((track) => {
                            const isCurrent = currentTrackId === track.id;
                            const isSelected = selectedTrackId === track.id;
                            const locked = trackIsLocked(track);

                            return (
                                <line
                                    key={`line-${track.id}`}
                                    x1={centerX}
                                    y1={centerY}
                                    x2={track.x}
                                    y2={track.y}
                                    stroke={
                                        locked
                                            ? 'rgba(255,255,255,0.18)'
                                            : isCurrent
                                                ? realmColor
                                                : isSelected
                                                    ? realmBorder
                                                    : realmBorder
                                    }
                                    strokeWidth={isCurrent ? 2.6 : isSelected ? 1.9 : 1.2}
                                    strokeLinecap="round"
                                    opacity={locked ? 0.42 : isCurrent ? 1 : isSelected ? 0.82 : 0.58}
                                />
                            );
                        })}
                    </svg>

                    <div
                        className="absolute realm-core-pulse rounded-full flex flex-col items-center justify-center text-center px-2"
                        style={{
                            width: `${centerSize}px`,
                            height: `${centerSize}px`,
                            left: `${centerX - centerSize / 2}px`,
                            top: `${centerY - centerSize / 2}px`,
                            background: `radial-gradient(circle at 35% 35%, ${realmColor}, ${realmSoft} 100%)`,
                            boxShadow: `0 0 30px ${realmGlow}`,
                            border: `1px solid ${realmBorder}`,
                        }}
                    >
                        <div className="text-2xl mb-1">{realmIcon}</div>
                        <div className="text-[10px] font-medium leading-tight text-black/80 px-1">
                            {realmName}
                        </div>
                    </div>

                    {orbitNodes.map((track) => {
                        const isCurrent = currentTrackId === track.id;
                        const isCurrentAndPlaying = isCurrent && isPlaying;
                        const isSelected = selectedTrackId === track.id;
                        const locked = trackIsLocked(track);

                        return (
                            <button
                                key={track.id}
                                onClick={() => handleTrackClick(track)}
                                onMouseEnter={() => handleSelectOnly(track)}
                                className={`absolute rounded-full flex items-center justify-center transition-all hover:scale-110 ${isCurrent && !locked ? 'orbit-node-active' : 'orbit-node-idle'
                                    }`}
                                style={{
                                    width: `${nodeSize}px`,
                                    height: `${nodeSize}px`,
                                    left: `${track.x}px`,
                                    top: `${track.y}px`,
                                    background: locked
                                        ? 'rgba(255,255,255,0.07)'
                                        : isCurrent
                                            ? `radial-gradient(circle, ${realmColor}, ${realmSoft})`
                                            : isSelected
                                                ? `radial-gradient(circle, ${realmColor}, ${realmSoft})`
                                                : `radial-gradient(circle, ${realmColor}, ${realmSoft})`,
                                    border: `1px solid ${locked
                                            ? 'rgba(255,255,255,0.14)'
                                            : isCurrent
                                                ? realmColor
                                                : isSelected
                                                    ? realmColor
                                                    : realmBorder
                                        }`,
                                    boxShadow: locked
                                        ? 'none'
                                        : isCurrent
                                            ? `0 0 24px ${realmGlow}`
                                            : isSelected
                                                ? `0 0 18px ${realmGlow}`
                                                : `0 0 12px ${realmGlow}`,
                                    animationDelay: isCurrent ? '0s' : track.driftDelay,
                                    opacity: locked ? 0.62 : 1,
                                    cursor: locked ? 'not-allowed' : 'pointer',
                                }}
                                title={locked ? getLockLabel(track) ?? `${track.trackTitle} locked` : track.trackTitle}
                                aria-label={locked ? `${track.trackTitle} locked` : `Play ${track.trackTitle}`}
                            >
                                <span className="text-base">
                                    {locked ? '🔒' : isCurrentAndPlaying ? 'Ⅱ' : isCurrent ? '▶' : '♪'}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div
                    className="mt-3 md:mt-5 rounded-2xl border p-4 min-w-0"
                    style={{
                        borderColor: realmBorder,
                        background: realmSoft,
                        boxShadow: selectedIsCurrent ? `0 0 18px ${realmGlow}` : 'none',
                    }}
                >
                    {selectedTrack ? (
                        <div className="flex flex-col gap-4 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 min-w-0">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                                            Selected Track
                                        </p>

                                        {selectedIsAnchor && (
                                            <span
                                                className="px-2 py-1 rounded-full text-[10px] uppercase tracking-[0.14em]"
                                                style={{
                                                    background: realmSoft,
                                                    border: `1px solid ${realmBorder}`,
                                                    color: realmColor,
                                                }}
                                            >
                                                Realm Anchor
                                            </span>
                                        )}

                                        {selectedTrackLocked && (
                                            <span className="px-2 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] bg-white/5 border border-white/10 text-white/55">
                                                {selectedTrackLockLabel ?? 'Locked'}
                                            </span>
                                        )}
                                    </div>

                                    <p
                                        className="font-display text-xl truncate"
                                        style={{
                                            color: selectedTrackLocked
                                                ? 'rgba(255,255,255,0.55)'
                                                : selectedIsCurrent
                                                    ? realmColor
                                                    : 'white',
                                        }}
                                    >
                                        {selectedTrackLocked ? '🔒 ' : ''}
                                        {selectedTrack.trackTitle}
                                    </p>

                                    <p className="text-sm text-secondary truncate mb-3">
                                        {selectedTrack.artist} • {selectedTrack.realmName}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {realmTags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2.5 py-1 rounded-full text-[11px]"
                                                style={{
                                                    background: realmSoft,
                                                    border: `1px solid ${realmBorder}`,
                                                    color: realmColor,
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-xs text-white/60">
                                        {selectedTrackLocked
                                            ? selectedTrackLockLabel ?? 'This track is locked for now.'
                                            : selectedIsCurrent && isPlaying
                                                ? 'Now resonating in this realm.'
                                                : selectedIsCurrent
                                                    ? 'Paused in orbit. Resume whenever you are ready.'
                                                    : 'Selected in orbit. Play this track to enter through its energy.'}
                                    </p>
                                </div>

                                <div className="shrink-0 w-full md:w-auto">
                                    <button
                                        onClick={() => handleTrackClick(selectedTrack)}
                                        className="btn-secondary w-full md:w-auto"
                                        disabled={selectedTrackLocked}
                                        style={{
                                            opacity: selectedTrackLocked ? 0.55 : 1,
                                            cursor: selectedTrackLocked ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {selectedTrackLocked
                                            ? selectedTrackLockLabel ?? 'Locked'
                                            : selectedIsCurrent && isPlaying
                                                ? 'Pause'
                                                : selectedIsCurrent
                                                    ? 'Resume'
                                                    : 'Play Selected'}
                                    </button>
                                </div>
                            </div>

                            <div
                                className="rounded-2xl border px-4 py-4"
                                style={{
                                    borderColor: realmBorder,
                                    background: 'rgba(255,255,255,0.03)',
                                }}
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {isCurrentRealm && (
                                            <span
                                                className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.14em]"
                                                style={{
                                                    background: 'rgba(255,255,255,0.08)',
                                                    border: '1px solid rgba(255,255,255,0.18)',
                                                    color: 'rgba(245,248,252,0.92)',
                                                }}
                                            >
                                                Current Realm
                                            </span>
                                        )}

                                        {isRecommended && (
                                            <span
                                                className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.14em]"
                                                style={{
                                                    background: 'rgba(255,220,120,0.12)',
                                                    border: '1px solid rgba(255,220,120,0.28)',
                                                    color: 'rgba(255,220,120,0.95)',
                                                }}
                                            >
                                                Recommended
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-white/60 mb-2">
                                            <span>Realm Progress</span>
                                            <span>{clampedProgress}%</span>
                                        </div>

                                        <div
                                            className="w-full h-2 rounded-full overflow-hidden"
                                            style={{
                                                background: 'rgba(255,255,255,0.06)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${clampedProgress}%`,
                                                    height: '100%',
                                                    borderRadius: '9999px',
                                                    background: `linear-gradient(90deg, ${realmSoft}, ${realmColor}, rgba(255,220,120,0.72))`,
                                                    boxShadow: `0 0 12px ${realmGlow}`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {realmRoute && isUnlocked && (
                                        <div className="flex justify-end">
                                            <Link href={realmRoute} className="w-full md:w-auto">
                                                <button className="btn-primary w-full md:w-auto">
                                                    Enter Realm →
                                                </button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {sortedTracks.length > 1 && (
                                <div
                                    className="rounded-2xl border px-4 py-4"
                                    style={{
                                        borderColor: realmSoft,
                                        background: 'rgba(255,255,255,0.025)',
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                                            Full Realm Tracklist
                                        </p>

                                        <p className="text-[11px] text-white/45">
                                            {sortedTracks.length} tracks
                                        </p>
                                    </div>

                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {sortedTracks.map(renderTrackPill)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-secondary">
                            No track selected for this realm yet.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}