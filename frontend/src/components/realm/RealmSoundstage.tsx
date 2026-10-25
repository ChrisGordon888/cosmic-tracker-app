'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import RealmResonance from '@/components/music/RealmResonance';
import { GET_PUBLIC_NEXUS_TRACKS } from '@/graphql/realms';
import {
    getRuntimeTracksForRealm,
    mapReleaseTracksToMusicTracks,
    mergeMusicCatalogs,
    type PublicNexusReleaseTrack,
} from '@/lib/publicMusicCatalog';
import type { RealmId } from '@/lib/realmStateMap';
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



export default function RealmSoundstage({
    realmId,
    realmName,
    realmIcon,
    realmColor,
    intro,
    supportText,
}: RealmSoundstageProps) {
    const { isAuthenticated } = usePlatformAccess();
    const isSignedInForMusic = isAuthenticated;
    const { data: publicNexusTrackData, loading, error } = useQuery(GET_PUBLIC_NEXUS_TRACKS, {
        variables: { realmId },
        fetchPolicy: 'network-only',
    });

    const realmTracks = useMemo(() => {
        const creatorTracks = mapReleaseTracksToMusicTracks(
            publicNexusTrackData?.getPublicNexusTracks as
                | PublicNexusReleaseTrack[]
                | undefined
        );
        const runtimeCatalog = mergeMusicCatalogs([], creatorTracks, publicNexusTrackData?.unavailableRegistryTrackIds);

        return getRuntimeTracksForRealm(runtimeCatalog, realmId)
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

    if (realmTracks.length === 0) {
        return (
            <div className="realm-soundstage-shell mb-8">
                <h2 className="text-2xl font-display mb-3">🎵 Realm Soundstage</h2>
                <p className="text-secondary">{loading ? 'Listening for current signals…' : error ? 'Music could not be loaded. Try again shortly.' : 'Realm quiet. No official soundtrack selections here yet; this territory is still open. Explore its Worlds below, or follow the personal Realm path.'}</p>
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

    return (
        <div className="realm-soundstage-shell mb-8">
            <div className="mb-5">
                {intro && <p className="text-secondary mb-3 max-w-3xl">{intro}</p>}
                {supportText && <p className="text-sm text-muted max-w-3xl">{supportText}</p>}
            </div>

            <RealmResonance tracks={realmTracks} color={realmColor} realmName={realmName} realmIcon={realmIcon} isTrackLocked={isTrackLocked} />
        </div>
    );
}
