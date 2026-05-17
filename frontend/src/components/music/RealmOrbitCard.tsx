'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface OrbitTrack {
    id: string;
    trackTitle: string;
    artist: string;
    realmName: string;
    realmColor: string;
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

export default function RealmOrbitCard({
    realmName,
    realmIcon,
    realmColor,
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
}: RealmOrbitCardProps) {
    const visibleTracks = useMemo(() => tracks.slice(0, 8), [tracks]);

    const [cardSize, setCardSize] = useState(360);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(
        visibleTracks[0]?.id ?? null
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
        if (currentTrackId && visibleTracks.some((track) => track.id === currentTrackId)) {
            setSelectedTrackId(currentTrackId);
            return;
        }

        if (visibleTracks.length > 0 && !selectedTrackId) {
            setSelectedTrackId(visibleTracks[0].id);
        }
    }, [currentTrackId, visibleTracks, selectedTrackId]);

    const centerX = cardSize / 2;
    const centerY = isMobile ? cardSize * 0.45 : cardSize / 2;
    const centerSize = Math.round(cardSize * 0.255);
    const nodeSize = Math.round(cardSize * 0.145);
    const orbitRadius = Math.round(cardSize * 0.355);
    const innerRingSize = Math.round(cardSize * 0.61);
    const outerRingSize = Math.round(cardSize * 0.78);

    const orbitNodes = useMemo(() => {
        const trackCount = Math.max(visibleTracks.length, 1);

        return visibleTracks.map((track, index) => {
            const angle = (2 * Math.PI * index) / trackCount - Math.PI / 2;
            const point = polarToCartesian(centerX, centerY, orbitRadius, angle);

            return {
                ...track,
                x: point.x,
                y: point.y,
                driftDelay: `${index * 0.6}s`,
            };
        });
    }, [visibleTracks, centerX, centerY, orbitRadius]);

    const selectedTrack =
        visibleTracks.find((track) => track.id === selectedTrackId) ?? visibleTracks[0] ?? null;

    const selectedIsCurrent = selectedTrack?.id === currentTrackId;
    const selectedIsAnchor = selectedTrack?.id === visibleTracks[0]?.id;
    const realmTags = getRealmStateTags(realmName);
    const clampedProgress = Math.max(0, Math.min(progress, 100));

    const handleTrackClick = (track: OrbitTrack) => {
        setSelectedTrackId(track.id);
        onPlayTrack(track);
    };

    const handleSelectOnly = (track: OrbitTrack) => {
        setSelectedTrackId(track.id);
    };

    if (compactOnMobile && isMobile) {
        const miniSize = 108;
        const miniCenter = miniSize / 2;
        const miniRadius = 38;
        const miniTracks = visibleTracks.slice(0, 5);

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
                className="realm-orbit-card nexus-compact-orbit rounded-3xl border p-4 relative overflow-hidden"
                style={{
                    borderColor: `${realmColor}44`,
                    background: `linear-gradient(145deg, ${realmColor}12, rgba(255,255,255,0.035), rgba(8,10,18,0.72))`,
                    boxShadow: `0 8px 28px ${realmColor}14`,
                }}
            >
                <div
                    className="absolute inset-0 pointer-events-none opacity-35"
                    style={{
                        background: `radial-gradient(circle at center, ${realmColor}18, transparent 56%)`,
                    }}
                />

                <div className="relative flex flex-col items-center text-center">
                    <div
                        className="relative mb-3"
                        style={{ width: `${miniSize}px`, height: `${miniSize}px` }}
                    >
                        <div
                            className="absolute rounded-full"
                            style={{
                                width: '82px',
                                height: '82px',
                                left: `${miniCenter - 41}px`,
                                top: `${miniCenter - 41}px`,
                                border: `1px dashed ${realmColor}44`,
                                boxShadow: `0 0 14px ${realmColor}18`,
                            }}
                        />

                        <div
                            className="absolute rounded-full"
                            style={{
                                width: '54px',
                                height: '54px',
                                left: `${miniCenter - 27}px`,
                                top: `${miniCenter - 27}px`,
                                background: `radial-gradient(circle at 35% 35%, ${realmColor}88, ${realmColor}33)`,
                                border: `1px solid ${realmColor}66`,
                                boxShadow: `0 0 18px ${realmColor}28`,
                            }}
                        />

                        <button
                            onClick={() => selectedTrack && handleTrackClick(selectedTrack)}
                            className="absolute rounded-full flex items-center justify-center text-xl"
                            style={{
                                width: '42px',
                                height: '42px',
                                left: `${miniCenter - 21}px`,
                                top: `${miniCenter - 21}px`,
                                background: `radial-gradient(circle at 35% 35%, ${realmColor}, ${realmColor}88)`,
                                border: `1px solid ${realmColor}99`,
                                boxShadow: `0 0 18px ${realmColor}44`,
                            }}
                            aria-label={selectedTrack ? `Play ${selectedTrack.trackTitle}` : `Play ${realmName}`}
                        >
                            {selectedIsCurrent && isPlaying ? '⏸' : realmIcon}
                        </button>

                        {miniNodes.map((track) => {
                            const isCurrent = currentTrackId === track.id;
                            const isSelected = selectedTrackId === track.id;

                            return (
                                <button
                                    key={track.id}
                                    onClick={() => handleTrackClick(track)}
                                    className="absolute rounded-full flex items-center justify-center text-[10px]"
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        left: `${track.x}px`,
                                        top: `${track.y}px`,
                                        transform: 'translate(-50%, -50%)',
                                        background: isCurrent
                                            ? `radial-gradient(circle, ${realmColor}, ${realmColor}aa)`
                                            : isSelected
                                                ? `radial-gradient(circle, ${realmColor}aa, ${realmColor}44)`
                                                : `radial-gradient(circle, ${realmColor}66, ${realmColor}22)`,
                                        border: `1px solid ${isCurrent || isSelected ? `${realmColor}aa` : `${realmColor}44`}`,
                                        boxShadow: isCurrent ? `0 0 14px ${realmColor}66` : `0 0 8px ${realmColor}22`,
                                    }}
                                    title={track.trackTitle}
                                    aria-label={`Play ${track.trackTitle}`}
                                >
                                    {isCurrent && isPlaying ? 'Ⅱ' : '♪'}
                                </button>
                            );
                        })}
                    </div>

                    <div className="w-full min-w-0">
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">
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
                            className="font-display text-xl truncate mb-1"
                            style={{ color: realmColor }}
                        >
                            {realmName}
                        </h3>

                        {selectedTrack ? (
                            <>
                                <p className="text-sm text-white/90 truncate">
                                    {selectedTrack.trackTitle}
                                </p>
                                <p className="text-xs text-white/55 truncate mb-3">
                                    {selectedTrack.artist} • {selectedTrack.realmName}
                                </p>
                            </>
                        ) : (
                            <p className="text-xs text-white/55 mb-3">No track selected yet.</p>
                        )}

                        <div className="mb-4">
                            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/50 mb-1.5">
                                <span>Progress</span>
                                <span>{clampedProgress}%</span>
                            </div>

                            <div className="h-2 rounded-full overflow-hidden bg-white/10 border border-white/10">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${clampedProgress}%`,
                                        background: `linear-gradient(90deg, ${realmColor}88, ${realmColor})`,
                                        boxShadow: `0 0 12px ${realmColor}33`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => selectedTrack && handleTrackClick(selectedTrack)}
                                className="btn-secondary"
                            >
                                {selectedIsCurrent && isPlaying
                                    ? 'Pause'
                                    : selectedIsCurrent
                                        ? 'Resume'
                                        : 'Play'}
                            </button>

                            {realmRoute && isUnlocked && (
                                <Link href={realmRoute}>
                                    <button className="btn-primary">Enter →</button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {visibleTracks.length > 1 && (
                        <div className="relative mt-4 flex gap-2 overflow-x-auto pb-1 w-full">
                            {visibleTracks.map((track) => {
                                const isSelected = selectedTrackId === track.id;
                                const isCurrent = currentTrackId === track.id;

                                return (
                                    <button
                                        key={track.id}
                                        onClick={() => {
                                            setSelectedTrackId(track.id);
                                            onPlayTrack(track);
                                        }}
                                        className="shrink-0 px-3 py-2 rounded-full text-xs border transition-all"
                                        style={{
                                            borderColor: isSelected || isCurrent ? `${realmColor}88` : `${realmColor}22`,
                                            background: isSelected || isCurrent ? `${realmColor}22` : 'rgba(255,255,255,0.04)',
                                            color: isSelected || isCurrent ? realmColor : 'rgba(255,255,255,0.68)',
                                        }}
                                    >
                                        {isCurrent && isPlaying ? '⏸ ' : '♪ '}
                                        {track.trackTitle}
                                    </button>
                                );
                            })}
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
                borderColor: `${realmColor}55`,
                background: 'rgba(255,255,255,0.03)',
                boxShadow: `0 8px 30px ${realmColor}18`,
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
            box-shadow: 0 0 24px ${realmColor}88;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
            box-shadow: 0 0 34px ${realmColor}cc;
          }
        }

        @keyframes corePulse {
          0%, 100% {
            box-shadow:
              0 0 30px ${realmColor}66,
              0 0 60px ${realmColor}18;
          }
          50% {
            box-shadow:
              0 0 42px ${realmColor}99,
              0 0 72px ${realmColor}22;
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
                    background: `radial-gradient(circle at center, ${realmColor}20 0%, transparent 62%)`,
                }}
            />

            <div className="relative min-w-0">
                <div className="mb-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-1">
                        Realm Music Portal
                    </p>
                    <h3 className="text-2xl font-display" style={{ color: realmColor }}>
                        {realmName}
                    </h3>
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
                            border: `1.5px dashed ${realmColor}48`,
                            boxShadow: `0 0 16px ${realmColor}20`,
                        }}
                    >
                        <div
                            className="absolute rounded-full"
                            style={{
                                width: '18px',
                                height: '18px',
                                top: '-9px',
                                left: 'calc(50% - 9px)',
                                background: `radial-gradient(circle, ${realmColor}dd, ${realmColor}22)`,
                                boxShadow: `0 0 18px ${realmColor}aa`,
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
                            border: `1px dashed ${realmColor}30`,
                            boxShadow: `0 0 12px ${realmColor}14`,
                        }}
                    >
                        <div
                            className="absolute rounded-full"
                            style={{
                                width: '14px',
                                height: '14px',
                                top: '-7px',
                                left: 'calc(50% - 7px)',
                                background: `radial-gradient(circle, ${realmColor}aa, ${realmColor}18)`,
                                boxShadow: `0 0 14px ${realmColor}66`,
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

                            return (
                                <line
                                    key={`line-${track.id}`}
                                    x1={centerX}
                                    y1={centerY}
                                    x2={track.x}
                                    y2={track.y}
                                    stroke={
                                        isCurrent
                                            ? `${realmColor}ee`
                                            : isSelected
                                                ? `${realmColor}99`
                                                : `${realmColor}4d`
                                    }
                                    strokeWidth={isCurrent ? 2.6 : isSelected ? 1.9 : 1.2}
                                    strokeLinecap="round"
                                    opacity={isCurrent ? 1 : isSelected ? 0.82 : 0.58}
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
                            background: `radial-gradient(circle at 35% 35%, ${realmColor}, ${realmColor}bb 52%, ${realmColor}55 100%)`,
                            boxShadow: `0 0 30px ${realmColor}66`,
                            border: `1px solid ${realmColor}99`,
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

                        return (
                            <button
                                key={track.id}
                                onClick={() => handleTrackClick(track)}
                                onMouseEnter={() => handleSelectOnly(track)}
                                className={`absolute rounded-full flex items-center justify-center transition-all hover:scale-110 ${isCurrent ? 'orbit-node-active' : 'orbit-node-idle'
                                    }`}
                                style={{
                                    width: `${nodeSize}px`,
                                    height: `${nodeSize}px`,
                                    left: `${track.x}px`,
                                    top: `${track.y}px`,
                                    background: isCurrent
                                        ? `radial-gradient(circle, ${realmColor}, ${realmColor}dd)`
                                        : isSelected
                                            ? `radial-gradient(circle, ${realmColor}99, ${realmColor}44)`
                                            : `radial-gradient(circle, ${realmColor}74, ${realmColor}30)`,
                                    border: `1px solid ${isCurrent
                                        ? `${realmColor}ee`
                                        : isSelected
                                            ? `${realmColor}aa`
                                            : `${realmColor}55`
                                        }`,
                                    boxShadow: isCurrent
                                        ? `0 0 24px ${realmColor}88`
                                        : isSelected
                                            ? `0 0 18px ${realmColor}55`
                                            : `0 0 12px ${realmColor}22`,
                                    animationDelay: isCurrent ? '0s' : track.driftDelay,
                                }}
                                title={track.trackTitle}
                                aria-label={`Play ${track.trackTitle}`}
                            >
                                <span className="text-base">
                                    {isCurrentAndPlaying ? 'Ⅱ' : isCurrent ? '▶' : '♪'}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div
                    className="mt-3 md:mt-5 rounded-2xl border p-4 min-w-0"
                    style={{
                        borderColor: `${realmColor}33`,
                        background: `${realmColor}10`,
                        boxShadow: selectedIsCurrent ? `0 0 18px ${realmColor}18` : 'none',
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
                                                    background: `${realmColor}22`,
                                                    border: `1px solid ${realmColor}55`,
                                                    color: realmColor,
                                                }}
                                            >
                                                Anchor
                                            </span>
                                        )}
                                    </div>

                                    <p
                                        className="font-display text-xl truncate"
                                        style={{ color: selectedIsCurrent ? realmColor : 'white' }}
                                    >
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
                                                    background: `${realmColor}18`,
                                                    border: `1px solid ${realmColor}33`,
                                                    color: realmColor,
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-xs text-white/60">
                                        {selectedIsCurrent && isPlaying
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
                                    >
                                        {selectedIsCurrent && isPlaying
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
                                    borderColor: `${realmColor}26`,
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
                                                    background: `linear-gradient(90deg, ${realmColor}88, ${realmColor}, rgba(255,220,120,0.88))`,
                                                    boxShadow: `0 0 12px ${realmColor}44`,
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