'use client';

import { useEffect, useMemo, useState } from 'react';

interface OrbitTrack {
  id: string;
  trackTitle: string;
  artist: string;
  realmName: string;
  realmColor: string;
}

interface RealmOrbitCardProps {
  realmName: string;
  realmIcon: string;
  realmColor: string;
  tracks: OrbitTrack[];
  currentTrackId?: string | null;
  isPlaying?: boolean;
  onPlayTrack: (track: OrbitTrack) => void;
}

const CARD_SIZE = 360;
const CENTER_X = CARD_SIZE / 2;
const CENTER_Y = CARD_SIZE / 2;
const CENTER_SIZE = 92;
const NODE_SIZE = 52;
const ORBIT_RADIUS = 128;

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

  if (normalized.includes('fractured')) {
    return ['chaos', 'pressure', 'activation'];
  }
  if (normalized.includes('veil')) {
    return ['desire', 'mystery', 'hidden truth'];
  }
  if (normalized.includes('moonlit')) {
    return ['reflection', 'grief', 'integration'];
  }
  if (normalized.includes('skybound')) {
    return ['power', 'discipline', 'manifestation'];
  }
  if (normalized.includes('bazaar')) {
    return ['value', 'discernment', 'exchange'];
  }
  if (normalized.includes('intersiddhi')) {
    return ['alignment', 'blessing', 'source'];
  }

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
}: RealmOrbitCardProps) {
  const visibleTracks = useMemo(() => tracks.slice(0, 8), [tracks]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(
    visibleTracks[0]?.id ?? null
  );

  useEffect(() => {
    if (currentTrackId && visibleTracks.some((track) => track.id === currentTrackId)) {
      setSelectedTrackId(currentTrackId);
      return;
    }

    if (visibleTracks.length > 0 && !selectedTrackId) {
      setSelectedTrackId(visibleTracks[0].id);
    }
  }, [currentTrackId, visibleTracks, selectedTrackId]);

  const orbitNodes = useMemo(() => {
    const trackCount = Math.max(visibleTracks.length, 1);

    return visibleTracks.map((track, index) => {
      const angle = (2 * Math.PI * index) / trackCount - Math.PI / 2;
      const point = polarToCartesian(CENTER_X, CENTER_Y, ORBIT_RADIUS, angle);

      return {
        ...track,
        x: point.x,
        y: point.y,
        driftDelay: `${index * 0.6}s`,
      };
    });
  }, [visibleTracks]);

  const selectedTrack =
    visibleTracks.find((track) => track.id === selectedTrackId) ?? visibleTracks[0] ?? null;

  const selectedIsCurrent = selectedTrack?.id === currentTrackId;
  const selectedIsAnchor = selectedTrack?.id === visibleTracks[0]?.id;
  const realmTags = getRealmStateTags(realmName);

  const handleTrackClick = (track: OrbitTrack) => {
    setSelectedTrackId(track.id);
    onPlayTrack(track);
  };

  const handleSelectOnly = (track: OrbitTrack) => {
    setSelectedTrackId(track.id);
  };

  return (
    <div
      className="rounded-3xl border p-6 relative overflow-hidden"
      style={{
        borderColor: `${realmColor}55`,
        background: 'rgba(255,255,255,0.03)',
        boxShadow: `0 8px 30px ${realmColor}18`,
      }}
    >
      <style jsx>{`
        @keyframes orbitSpinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbitSpinReverse {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes nodeFloat {
          0%, 100% {
            transform: translate(-50%, -50%);
          }
          50% {
            transform: translate(-50%, calc(-50% - 4px));
          }
        }

        @keyframes nodePulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 22px ${realmColor}77;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
            box-shadow: 0 0 30px ${realmColor}aa;
          }
        }

        @keyframes corePulse {
          0%, 100% {
            box-shadow: 0 0 28px ${realmColor}55;
          }
          50% {
            box-shadow: 0 0 38px ${realmColor}88;
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
      `}</style>

      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(circle at center, ${realmColor}18 0%, transparent 62%)`,
        }}
      />

      <div className="relative">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-1">
            Realm Sound System
          </p>
          <h3 className="text-2xl font-display" style={{ color: realmColor }}>
            {realmName}
          </h3>
        </div>

        <div
          className="relative mx-auto"
          style={{
            width: `${CARD_SIZE}px`,
            height: `${CARD_SIZE}px`,
            maxWidth: '100%',
          }}
        >
          <div
            className="absolute orbit-ring-slow rounded-full"
            style={{
              width: '220px',
              height: '220px',
              left: `${CENTER_X - 110}px`,
              top: `${CENTER_Y - 110}px`,
              border: `1.5px dashed ${realmColor}40`,
              boxShadow: `0 0 12px ${realmColor}18`,
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: '18px',
                height: '18px',
                top: '-9px',
                left: 'calc(50% - 9px)',
                background: `radial-gradient(circle, ${realmColor}cc, ${realmColor}22)`,
                boxShadow: `0 0 16px ${realmColor}88`,
              }}
            />
          </div>

          <div
            className="absolute orbit-ring-reverse rounded-full"
            style={{
              width: '280px',
              height: '280px',
              left: `${CENTER_X - 140}px`,
              top: `${CENTER_Y - 140}px`,
              border: `1px dashed ${realmColor}28`,
              boxShadow: `0 0 10px ${realmColor}12`,
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: '14px',
                height: '14px',
                top: '-7px',
                left: 'calc(50% - 7px)',
                background: `radial-gradient(circle, ${realmColor}99, ${realmColor}18)`,
                boxShadow: `0 0 12px ${realmColor}55`,
              }}
            />
          </div>

          <svg
            className="absolute inset-0 pointer-events-none"
            width={CARD_SIZE}
            height={CARD_SIZE}
            viewBox={`0 0 ${CARD_SIZE} ${CARD_SIZE}`}
          >
            {orbitNodes.map((track) => {
              const isCurrent = currentTrackId === track.id;
              const isSelected = selectedTrackId === track.id;

              return (
                <line
                  key={`line-${track.id}`}
                  x1={CENTER_X}
                  y1={CENTER_Y}
                  x2={track.x}
                  y2={track.y}
                  stroke={
                    isCurrent
                      ? `${realmColor}cc`
                      : isSelected
                      ? `${realmColor}88`
                      : `${realmColor}45`
                  }
                  strokeWidth={isCurrent ? 2.4 : isSelected ? 1.8 : 1.2}
                  strokeLinecap="round"
                  opacity={isCurrent ? 0.95 : isSelected ? 0.8 : 0.55}
                />
              );
            })}
          </svg>

          <div
            className="absolute realm-core-pulse rounded-full flex flex-col items-center justify-center text-center px-2"
            style={{
              width: `${CENTER_SIZE}px`,
              height: `${CENTER_SIZE}px`,
              left: `${CENTER_X - CENTER_SIZE / 2}px`,
              top: `${CENTER_Y - CENTER_SIZE / 2}px`,
              background: `radial-gradient(circle at 35% 35%, ${realmColor}, ${realmColor}bb 52%, ${realmColor}55 100%)`,
              boxShadow: `0 0 28px ${realmColor}55`,
              border: `1px solid ${realmColor}88`,
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
                className={`absolute rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                  isCurrent ? 'orbit-node-active' : 'orbit-node-idle'
                }`}
                style={{
                  width: `${NODE_SIZE}px`,
                  height: `${NODE_SIZE}px`,
                  left: `${track.x}px`,
                  top: `${track.y}px`,
                  background: isCurrent
                    ? `radial-gradient(circle, ${realmColor}, ${realmColor}cc)`
                    : isSelected
                    ? `radial-gradient(circle, ${realmColor}88, ${realmColor}40)`
                    : `radial-gradient(circle, ${realmColor}70, ${realmColor}30)`,
                  border: `1px solid ${
                    isCurrent
                      ? `${realmColor}dd`
                      : isSelected
                      ? `${realmColor}99`
                      : `${realmColor}55`
                  }`,
                  boxShadow: isCurrent
                    ? `0 0 22px ${realmColor}77`
                    : isSelected
                    ? `0 0 16px ${realmColor}44`
                    : `0 0 12px ${realmColor}22`,
                  animationDelay: isCurrent ? '0s' : track.driftDelay,
                }}
                title={track.trackTitle}
                aria-label={`Play ${track.trackTitle}`}
              >
                <span className="text-base">
                  {isCurrentAndPlaying ? '⏸' : isCurrent ? '▶' : '🎵'}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="mt-5 rounded-2xl border p-4"
          style={{
            borderColor: `${realmColor}33`,
            background: `${realmColor}10`,
            boxShadow: selectedIsCurrent ? `0 0 18px ${realmColor}18` : 'none',
          }}
        >
          {selectedTrack ? (
            <div className="flex flex-col md:flex-row md:items-center gap-4">
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
                      Anchor Track
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

              <div className="shrink-0">
                <button
                  onClick={() => handleTrackClick(selectedTrack)}
                  className="btn-secondary"
                >
                  {selectedIsCurrent && isPlaying
                    ? 'Pause'
                    : selectedIsCurrent
                    ? 'Resume'
                    : 'Play Selected'}
                </button>
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