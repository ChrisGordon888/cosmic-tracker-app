'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { REALM_RESULT_CONTENT } from '@/lib/realmResultContent';
import { MUSIC_REGISTRY } from '@/lib/musicRegistry';
import { GET_PUBLIC_NEXUS_TRACKS } from '@/graphql/realms';
import {
  mapReleaseTracksToMusicTracks,
  findRealmRecommendation,
  mergeMusicCatalogs,
  getRuntimeTracksForRealm,
  type PublicNexusReleaseTrack,
} from '@/lib/publicMusicCatalog';
import { getMusicAvailability } from '@/lib/musicAvailability';
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
  const { isAuthenticated } = usePlatformAccess();
  const isSignedInForMusic = isAuthenticated;

  const { data: publicNexusTrackData } = useQuery(GET_PUBLIC_NEXUS_TRACKS, {
    variables: { realmId },
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
      publicNexusTrackData?.getPublicNexusTracks as PublicNexusReleaseTrack[] | undefined
    );

    return getRuntimeTracksForRealm(mergeMusicCatalogs(MUSIC_REGISTRY, releaseTracks), realmId)
      .map((track) => {
        const availability = getMusicAvailability(track, {
          isCreatorView: false,
          isSignedIn: isSignedInForMusic,
        });
        return {
          ...track,
          trackUrl: availability.resolvedAudioUrl ?? track.trackUrl,
          availability,
        };
      })
      .filter((track) => track.availability.isVisible);
  }, [publicNexusTrackData, realmId, isSignedInForMusic]);

  const suggestedTrack = useMemo(() => {
    if (!recommendedTrackTitle) return null;
    const match = findRealmRecommendation(realmTracks, MUSIC_REGISTRY, realmId, recommendedTrackTitle);
    return realmTracks.find(track => track.id === match?.id) ?? null;
  }, [recommendedTrackTitle, realmTracks, realmId]);

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
