'use client';

import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import type { MusicTrack } from '@/context/MusicPlayerProvider';
import RealmOrbitCard from './RealmOrbitCard';

/** Presentation adapter only: server-selected sampler order is authoritative. */
export default function NexusRealmSampler({ realmId, realmName, realmIcon, color, tracks, progress = 0 }: {
    realmId: string; realmName: string; realmIcon: string; color: string; tracks: MusicTrack[]; progress?: number;
}) {
    const player = useMusicPlayer();
    return <RealmOrbitCard
        realmId={realmId} realmName={realmName} realmIcon={realmIcon} realmColor={color}
        tracks={tracks} preserveOrder carouselMode isUnlocked
        currentTrackId={player.currentTrack?.id} isPlaying={player.isPlaying}
        progress={progress} realmRoute={`/realms/${realmId}`}
        pathLabel={`${tracks.length} curated ${tracks.length === 1 ? 'signal' : 'signals'} · Nexus sampler`}
        flowTracks={tracks} flowSource="nexus" flowLabel={`${realmName} sampler`}
        isTrackLocked={track => !track.trackUrl}
        onPlayTrack={() => { /* Missing audio cannot start a fallback source. */ }}
    />;
}
