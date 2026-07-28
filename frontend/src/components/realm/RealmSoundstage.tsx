'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import RealmOrbitCard from '@/components/music/RealmOrbitCard';
import { MUSIC_REGISTRY } from '@/lib/musicRegistry';
import { GET_PUBLIC_NEXUS_TRACKS } from '@/graphql/realms';
import { GET_MY_NEXUS_TRACKS } from '@/graphql/musicAccess';
import {
    getRuntimeTracksForRealm,
    mapReleaseTracksToMusicTracks,
    mergeMusicCatalogs,
    type PublicNexusReleaseTrack,
    type RuntimeMusicTrack,
} from '@/lib/publicMusicCatalog';
import type { RealmId } from '@/lib/realmStateMap';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { useCreatorView } from '@/context/CreatorViewProvider';
import { usePlatformAccess } from '@/context/PlatformAccessProvider';
import { getMusicAvailability } from '@/lib/musicAvailability';

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

    /**
     * Uses the compact mini-orbit card on mobile while keeping
     * the full signature orbit card on desktop.
     */
    compactOnMobile?: boolean;
}

const RELEASE_UNLOCKS: Record<string, string> = {
    'sin-do-over': '2026-06-29T00:00:00',
    'sin-running-from-the-plug': '2026-07-14T00:00:00',
    '101-hold-my-hand': '2026-07-29T00:00:00',
    '303-in-the-deep': '2026-07-29T00:00:00',
    '202-her-fantasy': '2026-07-29T00:00:00',
    '202-siren': '2026-07-29T00:00:00',
};

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
    compactOnMobile = false,
}: RealmSoundstageProps) {
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

    const realmTracks = useMemo(() => {
        const creatorTracks = mapReleaseTracksToMusicTracks(
            (isCreatorView
                ? creatorNexusTrackData?.myReleaseTracks
                : publicNexusTrackData?.getPublicNexusTracks) as
                | PublicNexusReleaseTrack[]
                | undefined
        );
        const runtimeCatalog = mergeMusicCatalogs(MUSIC_REGISTRY, creatorTracks);

        return getRuntimeTracksForRealm(runtimeCatalog, realmId)
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

    if (realmTracks.length === 0) {
        return (
            <div className="glass-card p-4 md:p-6 mb-8">
                <h2 className="text-2xl font-display mb-3">🎵 Realm Soundstage</h2>
                <p className="text-secondary">No tracks loaded for this realm yet.</p>
            </div>
        );
    }

    const getTrackAvailability = (track: { id: string }) => {
        return (
            realmTracks.find((realmTrack) => realmTrack.id === track.id)
                ?.availability ?? null
        );
    };

    const isTrackLocked = (track: { id: string }) => {
        const availability = getTrackAvailability(track);

        return !availability?.isPlayable;
    };

    const getTrackLockLabel = (track: { id: string }) => {
        const availability = getTrackAvailability(track);

        if (!availability || availability.isPlayable) return null;

        return availability.label;
    };

    const featuredTrack =
        realmTracks.find((track) => !isTrackLocked(track) && track.isRealmAnchor) ??
        realmTracks.find((track) => !isTrackLocked(track) && track.isPublicPick) ??
        realmTracks.find((track) => !isTrackLocked(track)) ??
        realmTracks[0];

    const featuredTrackLocked = isTrackLocked(featuredTrack);
    const featuredTrackLockLabel = getTrackLockLabel(featuredTrack);
    const isFeaturedSelected = currentTrack?.id === featuredTrack.id;

    const handlePlayOrbitTrack = (track: { id: string }) => {
        const fullTrack = realmTracks.find((musicTrack) => musicTrack.id === track.id);

        if (!fullTrack) {
            console.warn('Track not found in runtime realm catalog:', track.id);
            return;
        }

        if (isTrackLocked(fullTrack)) {
            return;
        }

        void playOrToggleTrack(fullTrack);
    };

    const handlePlayFeaturedTrack = () => {
        if (featuredTrackLocked) return;

        void playOrToggleTrack(featuredTrack);
    };

    return (
        <div className="glass-card p-4 md:p-6 mb-8">
            <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-2">
                    Realm Soundstage
                </p>

                <h2
                    className="text-2xl md:text-3xl font-display mb-3"
                    style={{ color: realmColor }}
                >
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
                onPlayTrack={handlePlayOrbitTrack}
                progress={progress}
                isUnlocked={isUnlocked}
                realmRoute={realmRoute}
                isCurrentRealm={isCurrentRealm}
                isRecommended={isRecommended}
                compactOnMobile={compactOnMobile}
                isTrackLocked={isTrackLocked}
                getTrackLockLabel={getTrackLockLabel}
            />

            <div
                className="mt-5 rounded-2xl border p-4 md:p-5"
                style={{
                    borderColor: `${realmColor}33`,
                    background: `linear-gradient(135deg, ${realmColor}10, rgba(255,255,255,0.02))`,
                    boxShadow: `0 0 18px ${realmColor}10`,
                }}
            >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                                Featured Entry
                            </p>

                            {featuredTrackLocked && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] bg-white/5 border border-white/10 text-white/55">
                                    {featuredTrackLockLabel ?? 'Locked'}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                                style={{
                                    background: `radial-gradient(circle, ${realmColor}66, ${realmColor}22)`,
                                    border: `1px solid ${realmColor}55`,
                                    boxShadow: `0 0 12px ${realmColor}22`,
                                    opacity: featuredTrackLocked ? 0.52 : 1,
                                }}
                            >
                                {featuredTrackLocked ? '🔒' : '✦'}
                            </div>

                            <div className="min-w-0">
                                <p
                                    className="font-display text-lg truncate"
                                    style={{
                                        color: featuredTrackLocked
                                            ? 'rgba(255,255,255,0.55)'
                                            : realmColor,
                                    }}
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
                            <span style={{ color: realmColor }}>{realmName}</span>. The full
                            realm soundtrack can still be explored through the tracklist.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <button
                            className="btn-secondary"
                            onClick={handlePlayFeaturedTrack}
                            disabled={featuredTrackLocked}
                            style={{
                                opacity: featuredTrackLocked ? 0.55 : 1,
                                cursor: featuredTrackLocked ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {featuredTrackLocked
                                ? featuredTrackLockLabel ?? 'Locked'
                                : isFeaturedSelected
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
                    Let the music tell you whether this realm matches your current inner state
                    before going deeper.
                </p>
            </div>
        </div>
    );
}