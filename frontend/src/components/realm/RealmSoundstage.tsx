'use client';

import RealmOrbitCard from '@/components/music/RealmOrbitCard';
import { MUSIC_REGISTRY } from '@/lib/musicRegistry';
import type { RealmId } from '@/lib/realmStateMap';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';

interface RealmSoundstageProps {
  realmId: RealmId;
  realmName: string;
  realmIcon: string;
  realmColor: string;
  intro?: string;
  supportText?: string;

  progress?: number;
  isUnlocked?: boolean;
  realmRoute?: string;
  isCurrentRealm?: boolean;
  isRecommended?: boolean;
}

export default function RealmSoundstage({
  realmId,
  realmName,
  realmIcon,
  realmColor,
  intro,
  supportText,
  progress = 0,
  isUnlocked = true,
  realmRoute,
  isCurrentRealm = false,
  isRecommended = false,
}: RealmSoundstageProps) {
  const { playOrToggleTrack, currentTrack, isPlaying } = useMusicPlayer();

  const realmTracks = MUSIC_REGISTRY.filter((track) => track.realmId === realmId);

  if (realmTracks.length === 0) {
    return (
      <div className="glass-card p-6 mb-8">
        <h2 className="text-2xl font-display mb-3">🎵 Realm Soundstage</h2>
        <p className="text-secondary">No tracks loaded for this realm yet.</p>
      </div>
    );
  }

  const featuredTrack = realmTracks[0];
  const isFeaturedSelected = currentTrack?.id === featuredTrack.id;

  return (
    <div className="glass-card p-6 mb-8">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-2">
          Realm Soundstage
        </p>
        <h2 className="text-3xl font-display mb-3" style={{ color: realmColor }}>
          {realmName}
        </h2>

        {intro && <p className="text-secondary mb-3 max-w-3xl">{intro}</p>}
        {supportText && <p className="text-sm text-muted max-w-3xl">{supportText}</p>}
      </div>

      <RealmOrbitCard
        realmId={realmId}
        realmName={realmName}
        realmIcon={realmIcon}
        realmColor={realmColor}
        tracks={realmTracks}
        currentTrackId={currentTrack?.id ?? null}
        isPlaying={isPlaying}
        onPlayTrack={playOrToggleTrack}
        progress={progress}
        isUnlocked={isUnlocked}
        realmRoute={realmRoute}
        isCurrentRealm={isCurrentRealm}
        isRecommended={isRecommended}
      />

      <div
        className="mt-5 rounded-2xl border p-5"
        style={{
          borderColor: `${realmColor}33`,
          background: `linear-gradient(135deg, ${realmColor}10, rgba(255,255,255,0.02))`,
          boxShadow: `0 0 18px ${realmColor}10`,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-2">
              Featured Entry
            </p>

            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{
                  background: `radial-gradient(circle, ${realmColor}66, ${realmColor}22)`,
                  border: `1px solid ${realmColor}55`,
                  boxShadow: `0 0 12px ${realmColor}22`,
                }}
              >
                ✦
              </div>

              <div className="min-w-0">
                <p
                  className="font-display text-lg truncate"
                  style={{ color: realmColor }}
                >
                  {featuredTrack.trackTitle}
                </p>
                <p className="text-sm text-secondary truncate">
                  {featuredTrack.artist}
                </p>
              </div>
            </div>

            <p className="text-sm text-secondary max-w-2xl">
              Start here for the clearest first entry into{' '}
              <span style={{ color: realmColor }}>{realmName}</span>.
              {' '}This is the anchor track for the realm’s emotional atmosphere.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              className="btn-secondary"
              onClick={() => playOrToggleTrack(featuredTrack)}
            >
              {isFeaturedSelected
                ? isPlaying
                  ? 'Pause Track'
                  : 'Resume Track'
                : '▶ Play Track'}
            </button>
          </div>
        </div>
      </div>

      <div className="quest-card mt-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-2">
          Listening Intention
        </p>
        <p className="text-sm text-secondary">
          Let the music tell you whether this realm matches your current inner state before going deeper.
        </p>
      </div>
    </div>
  );
}