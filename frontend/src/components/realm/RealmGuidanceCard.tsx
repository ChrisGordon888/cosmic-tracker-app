'use client';

import { useMemo } from 'react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { MUSIC_REGISTRY } from '@/lib/musicRegistry';
import { REALM_GUIDANCE_CONTENT } from '@/lib/realmGuidanceContent';
import { REALM_STATE_MAP, type RealmId } from '@/lib/realmStateMap';

interface RealmGuidanceCardProps {
  realmId: RealmId;
}

function getModeLabel(mode: 'stay' | 'move-through' | 'shift') {
  if (mode === 'stay') return 'Stay with this state';
  if (mode === 'move-through') return 'Move through this state';
  return 'Shift toward another state';
}

export default function RealmGuidanceCard({ realmId }: RealmGuidanceCardProps) {
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  const realm = REALM_STATE_MAP[realmId];
  const guidance = REALM_GUIDANCE_CONTENT[realmId];

  const suggestedTrack = useMemo(() => {
    return (
      MUSIC_REGISTRY.find(
        (track) =>
          track.realmId === realmId &&
          track.trackTitle === guidance.recommendedTrack
      ) ?? null
    );
  }, [realmId, guidance.recommendedTrack]);

  return (
    <div
      className="glass-card p-6 mb-8"
      style={{
        border: `1px solid ${realm.color}33`,
        boxShadow: `0 8px 30px ${realm.color}12`,
      }}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{
              background: `linear-gradient(135deg, ${realm.color}22, ${realm.color}55)`,
              border: `1px solid ${realm.color}55`,
            }}
          >
            {realm.icon}
          </div>

          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-2">
              Realm Guidance
            </p>

            <h2
              className="text-2xl md:text-3xl font-display mb-3"
              style={{ color: realm.color }}
            >
              Why enter {realm.realmName}?
            </h2>

            <p className="text-secondary mb-4">{guidance.whenToEnter}</p>
            <p className="text-secondary mb-5">{guidance.whyThisRealmHelps}</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {guidance.helpsWith.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    background: `${realm.color}18`,
                    border: `1px solid ${realm.color}44`,
                    color: realm.color,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="quest-card">
                <p className="text-xs uppercase tracking-[0.16em] text-white/60 mb-2">
                  Suggested Mode
                </p>
                <p className="font-display text-lg">
                  {getModeLabel(guidance.suggestedMode)}
                </p>
              </div>

              <div className="quest-card">
                <p className="text-xs uppercase tracking-[0.16em] text-white/60 mb-2">
                  Reflection Prompt
                </p>
                <p className="text-sm italic text-secondary">
                  “{guidance.reflectionPrompt}”
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[260px] flex flex-col gap-3">
          <div
            className="rounded-2xl p-4"
            style={{
              background: `${realm.color}12`,
              border: `1px solid ${realm.color}33`,
            }}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-white/60 mb-2">
              Recommended Track
            </p>
            <p
              className="font-display text-xl mb-2"
              style={{ color: realm.color }}
            >
              {guidance.recommendedTrack}
            </p>
            {suggestedTrack && (
              <button
                className="btn-secondary w-full"
                onClick={() => playTrack(suggestedTrack)}
              >
                {currentTrack?.id === suggestedTrack.id && isPlaying
                  ? 'Playing Suggested Track'
                  : '▶ Play Suggested Track'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}