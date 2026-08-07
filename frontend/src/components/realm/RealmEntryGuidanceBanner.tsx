'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { REALM_RESULT_CONTENT } from '@/lib/realmResultContent';
import { MUSIC_REGISTRY } from '@/lib/musicRegistry';
import { GET_PUBLIC_NEXUS_TRACKS } from '@/graphql/realms';
import { GET_MY_NEXUS_TRACKS } from '@/graphql/musicAccess';
import {
  mapReleaseTracksToMusicTracks,
  mergeMusicCatalogs,
  getRuntimeTracksForRealm,
  type PublicNexusReleaseTrack,
} from '@/lib/publicMusicCatalog';
import { getMusicAvailability } from '@/lib/musicAvailability';
import { useCreatorView } from '@/context/CreatorViewProvider';
import { usePlatformAccess } from '@/context/PlatformAccessProvider';
import {
  getStoredRealmGuidance,
  type StoredRealmGuidance,
} from '@/lib/getStoredRealmGuidance';
import type { RealmId } from '@/lib/realmStateMap';

interface RealmEntryGuidanceBannerProps {
  realmId: RealmId;
  realmName: string;
  realmColor: string;
}

const RELEASE_UNLOCKS: Record<string, string> = {
  'sin-do-over': '2026-06-29T00:00:00',
  'sin-running-from-the-plug': '2026-07-14T00:00:00',
  '101-hold-my-hand': '2026-07-29T00:00:00',
  '303-in-the-deep': '2026-07-29T00:00:00',
  '202-her-fantasy': '2026-07-29T00:00:00',
  '202-siren': '2026-07-29T00:00:00',
};

function getModeLabel(mode: 'stay' | 'move-through' | 'shift') {
  if (mode === 'stay') return 'Stay with this state';
  if (mode === 'move-through') return 'Move through this state';
  return 'Shift toward another state';
}

export default function RealmEntryGuidanceBanner({
  realmId,
  realmName,
  realmColor,
}: RealmEntryGuidanceBannerProps) {
  const [storedGuidance, setStoredGuidance] = useState<StoredRealmGuidance | null>(null);
  const { playOrToggleTrack, currentTrack, isPlaying } = useMusicPlayer();
  const { isCreatorView: selectedCreatorView } = useCreatorView();
  const { isAuthenticated, canAccessCreatorOS } = usePlatformAccess();
  const isCreatorView = canAccessCreatorOS && selectedCreatorView;
  const isSignedInForMusic = isCreatorView && isAuthenticated;

  const { data: publicNexusTrackData } = useQuery(GET_PUBLIC_NEXUS_TRACKS, {
    variables: { realmId },
    skip: isCreatorView,
    fetchPolicy: 'cache-and-network',
  });

  const { data: creatorNexusTrackData } = useQuery(GET_MY_NEXUS_TRACKS, {
    skip: !isCreatorView,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const guidance = getStoredRealmGuidance();
    if (guidance?.realmId === realmId) setStoredGuidance(guidance);
  }, [realmId]);

  const modeContent = useMemo(() => {
    if (!storedGuidance) return null;
    return REALM_RESULT_CONTENT[realmId]?.modeVariants[storedGuidance.mode] ?? null;
  }, [storedGuidance, realmId]);

  const recommendedTrackTitle =
    storedGuidance?.recommendedTrack ?? modeContent?.recommendedTrack ?? null;

  const realmTracks = useMemo(() => {
    const releaseTracks = mapReleaseTracksToMusicTracks(
      (isCreatorView
        ? creatorNexusTrackData?.myReleaseTracks
        : publicNexusTrackData?.getPublicNexusTracks) as PublicNexusReleaseTrack[] | undefined
    );

    return getRuntimeTracksForRealm(mergeMusicCatalogs(MUSIC_REGISTRY, releaseTracks), realmId)
      .map((track) => {
        const availability = getMusicAvailability(track, {
          isCreatorView,
          isSignedIn: isSignedInForMusic,
          fallbackUnlockDate: RELEASE_UNLOCKS[track.id] ?? null,
        });
        return {
          ...track,
          trackUrl: availability.resolvedAudioUrl ?? track.trackUrl,
          availability,
        };
      })
      .filter((track) => track.availability.isVisible);
  }, [creatorNexusTrackData, publicNexusTrackData, realmId, isCreatorView, isSignedInForMusic]);

  const suggestedTrack = useMemo(() => {
    if (!recommendedTrackTitle) return null;
    const normalizedRecommended = recommendedTrackTitle.trim().toLowerCase();
    return realmTracks.find(
      (track) => track.trackTitle.trim().toLowerCase() === normalizedRecommended
    ) ?? null;
  }, [recommendedTrackTitle, realmTracks]);

  const playableRealmQueue = useMemo(
    () => realmTracks.filter((track) => track.availability.isPlayable && Boolean(track.trackUrl)),
    [realmTracks]
  );

  if (!storedGuidance || !modeContent) return null;

  const isSuggestedTrackSelected = currentTrack?.id === suggestedTrack?.id;
  const suggestedTrackPlayable = Boolean(
    suggestedTrack?.availability.isPlayable && suggestedTrack.trackUrl
  );

  const playSuggestedTrack = () => {
    if (!suggestedTrack || !suggestedTrackPlayable) return;
    void playOrToggleTrack(suggestedTrack, playableRealmQueue, {
      source: 'realm',
      label: `${realmName} guidance`,
    });
  };

  return (
    <div
      className="glass-card realm-entry-guidance-card p-4 md:p-5 mb-6 fade-in"
      style={{
        border: `1px solid ${realmColor}33`,
        background: `linear-gradient(145deg, ${realmColor}12, rgba(255,255,255,0.03))`,
        boxShadow: `0 0 20px ${realmColor}12`,
      }}
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.18em] text-white/60">
              Today&apos;s Guidance
            </p>
            <span
              className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.14em]"
              style={{
                background: `${realmColor}20`,
                border: `1px solid ${realmColor}44`,
                color: realmColor,
              }}
            >
              {getModeLabel(storedGuidance.mode)}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-display mb-3 leading-tight" style={{ color: realmColor }}>
            Use {realmName} this way today
          </h3>
          <p className="text-sm md:text-base text-secondary mb-3 leading-relaxed">
            {modeContent.modeDescription}
          </p>
          <p className="text-xs md:text-sm text-muted italic mb-4 leading-relaxed">
            “{modeContent.reflectionPrompt}”
          </p>

          <div className="text-xs md:text-sm text-muted">
            Recommended track:{' '}
            {suggestedTrack ? (
              <button
                type="button"
                onClick={playSuggestedTrack}
                disabled={!suggestedTrackPlayable}
                className="font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-55"
                style={{ color: realmColor }}
              >
                {recommendedTrackTitle}
              </button>
            ) : (
              <span className="text-secondary">{recommendedTrackTitle}</span>
            )}
          </div>
        </div>

        {suggestedTrack && (
          <div className="shrink-0 w-full lg:w-auto">
            <button
              className="btn-secondary w-full lg:w-auto"
              onClick={playSuggestedTrack}
              disabled={!suggestedTrackPlayable}
            >
              {!suggestedTrackPlayable
                ? suggestedTrack.availability.label || 'Not yet available'
                : isSuggestedTrackSelected
                  ? isPlaying
                    ? 'Pause Suggested'
                    : 'Resume Suggested'
                  : '▶ Play Suggested'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
