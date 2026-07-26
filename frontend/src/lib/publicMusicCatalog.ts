import type { MusicTrack, TrackRole, TrackStatus, TrackVisibility } from '@/lib/musicRegistry';
import { REALM_STATE_MAP, type RealmId } from '@/lib/realmStateMap';
import { getRealmTheme } from '@/lib/realmTheme';

export interface PublicNexusReleaseTrack {
    id: string;
    ownerId?: string | null;
    releaseWorldId: string;
    title: string;
    slug?: string | null;
    trackNumber?: number | null;
    role?: string | null;
    status?: string | null;
    bpm?: number | null;
    keySignature?: string | null;
    mood?: string | null;
    hook?: string | null;
    notes?: string | null;
    audioUrl?: string | null;
    previewAudioUrl?: string | null;
    platformUrl?: string | null;
    visibility?: string | null;
    playbackStatus?: string | null;
    dropDate?: string | null;
    unlockDate?: string | null;
    isFocusTrack?: boolean | null;
    isSecondFocus?: boolean | null;
    isPublic?: boolean | null;
    realmId?: number | null;
    showInNexus?: boolean | null;
    nexusRole?: string | null;
    isRealmAnchor?: boolean | null;
    isPublicPick?: boolean | null;
    nexusSortOrder?: number | null;
}

export interface RuntimeMusicTrack extends MusicTrack {
    source?: 'registry' | 'creator';
    releaseWorldId?: string;
    releaseTrackId?: string;
    playbackStatus?: string;
    unlockDate?: string | null;
    dropDate?: string | null;
    platformUrl?: string | null;
}

const VALID_REALMS = new Set<number>([303, 202, 101, 55, 44, 0]);

function isRealmId(value?: number | null): value is RealmId {
    return typeof value === 'number' && VALID_REALMS.has(value);
}

function mapRole(value?: string | null): TrackRole {
    switch (value) {
        case 'flagship':
        case 'anchor':
        case 'public':
        case 'featured':
        case 'expansion':
        case 'vault':
        case 'premium':
            return value;
        default:
            return 'public';
    }
}

function mapVisibility(value?: string | null): TrackVisibility {
    if (value === 'premium') return 'premium';
    if (value === 'signup') return 'signup';
    // Public Nexus queries may include both public and listed tracks.
    return 'public';
}

function mapStatus(value?: string | null): TrackStatus {
    switch (value) {
        case 'demo':
            return 'demo';
        case 'mixing':
            return 'needs-mix';
        case 'writing':
            return 'needs-writing';
        case 'idea':
        case 'recording':
            return 'rough-draft';
        case 'mastered':
        case 'released':
            return 'finished';
        default:
            return 'demo';
    }
}

function getPlaybackUrl(track: PublicNexusReleaseTrack) {
    if (track.playbackStatus === 'preview') {
        return track.previewAudioUrl?.trim() || track.audioUrl?.trim() || '';
    }

    return track.audioUrl?.trim() || track.previewAudioUrl?.trim() || '';
}

export function mapReleaseTrackToMusicTrack(
    track: PublicNexusReleaseTrack
): RuntimeMusicTrack | null {
    if (!track.showInNexus || !isRealmId(track.realmId)) return null;

    const realm = REALM_STATE_MAP[track.realmId];
    const theme = getRealmTheme(track.realmId);
    const trackUrl = getPlaybackUrl(track);

    return {
        id: `release-${track.id}`,
        realmId: track.realmId,
        realmName: realm.realmName,
        trackTitle: track.title,
        artist: 'COSMIC',
        trackUrl,
        realmColor: theme.accent,
        role: mapRole(track.nexusRole),
        visibility: mapVisibility(track.visibility),
        status: mapStatus(track.status),
        key: track.keySignature?.trim() || undefined,
        bpm: track.bpm ?? undefined,
        vibe: track.mood?.trim() ? [track.mood.trim()] : undefined,
        notes: track.notes?.trim() || track.hook?.trim() || undefined,
        isFeatured: track.nexusRole === 'featured' || track.nexusRole === 'flagship',
        isFlagship: track.nexusRole === 'flagship',
        isRealmAnchor: Boolean(track.isRealmAnchor || track.nexusRole === 'anchor'),
        isPublicPick: Boolean(track.isPublicPick),
        sortOrder: track.nexusSortOrder ?? 999,
        source: 'creator',
        releaseWorldId: track.releaseWorldId,
        releaseTrackId: track.id,
        playbackStatus: track.playbackStatus ?? undefined,
        unlockDate: track.unlockDate ?? null,
        dropDate: track.dropDate ?? null,
        platformUrl: track.platformUrl ?? null,
    };
}

export function mapReleaseTracksToMusicTracks(
    tracks?: PublicNexusReleaseTrack[] | null
): RuntimeMusicTrack[] {
    return (tracks ?? [])
        .map(mapReleaseTrackToMusicTrack)
        .filter((track): track is RuntimeMusicTrack => Boolean(track));
}

function catalogIdentity(track: MusicTrack) {
    return `${track.realmId}:${track.trackTitle.trim().toLowerCase()}`;
}

export function mergeMusicCatalogs(
    registryTracks: MusicTrack[],
    creatorTracks: RuntimeMusicTrack[]
): RuntimeMusicTrack[] {
    const byIdentity = new Map<string, RuntimeMusicTrack>();

    registryTracks.forEach((track) => {
        byIdentity.set(catalogIdentity(track), {
            ...track,
            source: 'registry',
        });
    });

    // Creator tracks intentionally replace a static entry with the same realm/title.
    creatorTracks.forEach((track) => {
        byIdentity.set(catalogIdentity(track), track);
    });

    return Array.from(byIdentity.values()).sort((a, b) => {
        if (a.realmId !== b.realmId) return a.realmId - b.realmId;

        const aOrder = a.sortOrder ?? 999;
        const bOrder = b.sortOrder ?? 999;
        if (aOrder !== bOrder) return aOrder - bOrder;

        return a.trackTitle.localeCompare(b.trackTitle);
    });
}

export function getRuntimeTracksForRealm(
    catalog: RuntimeMusicTrack[],
    realmId: RealmId
) {
    return catalog
        .filter((track) => track.realmId === realmId)
        .sort((a, b) => {
            const aOrder = a.sortOrder ?? 999;
            const bOrder = b.sortOrder ?? 999;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return a.trackTitle.localeCompare(b.trackTitle);
        });
}
