'use client';

import Link from 'next/link';
import ReleaseShareButton from '@/components/public/ReleaseShareButton';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { useCreatorView } from '@/context/CreatorViewProvider';
import { usePlatformAccess } from '@/context/PlatformAccessProvider';
import { getMusicAvailability } from '@/lib/musicAvailability';
import WorldSurface from '@/components/world/WorldSurface';
import '@/styles/releaseWorld.css';

const RELEASE_WORLD_FIELDS = gql`
  fragment ReleaseWorldFields on ReleaseWorld {
    id
    title
    slug
    releaseType
    status
    visibility
    isFeatured
    oneLineSummary
    story
    currentFocus
    secondFocus
    fullDropDate
    coverArtUrl
    coverAssetId
    updatedAt
    lastOpenedAt
  }
`;

const RELEASE_TRACK_FIELDS = gql`
  fragment ReleaseTrackFields on ReleaseTrack {
    id
    ownerId
    artistName
    releaseSlug
    title
    slug
    trackNumber
    role
    status
    bpm
    keySignature
    mood
    hook
    notes
    audioUrl
    previewAudioUrl
    platformUrl
    artworkUrl
    releaseCoverArtUrl
    visibility
    accessTier
    playbackStatus
    dropDate
    unlockDate
    isFocusTrack
    isSecondFocus
    isPublic
    updatedAt
  }
`;

const PUBLIC_BOARD_ARTIFACT_FIELDS = gql`
  fragment PublicBoardArtifactFields on BoardArtifact {
    id
    kind
    eyebrow
    title
    body
    meta
    href
    connectedTrackSlug
    isPublic
    pageSection
    pageOrder
    createdAt
    updatedAt
  }
`;

const GET_MY_RELEASE_WORLD_BY_SLUG = gql`
  ${RELEASE_WORLD_FIELDS}
  query GetMyReleaseWorldBySlug($slug: String!) {
    getMyReleaseWorldBySlug(slug: $slug) {
      ...ReleaseWorldFields
    }
  }
`;

const GET_PUBLIC_RELEASE_WORLD_BY_SLUG = gql`
  ${RELEASE_WORLD_FIELDS}
  query GetPublicReleaseWorldBySlug($slug: String!) {
    getPublicReleaseWorldBySlug(slug: $slug) {
      ...ReleaseWorldFields
    }
  }
`;

const GET_RELEASE_PAGE_CREATOR_DATA = gql`
  ${RELEASE_TRACK_FIELDS}
  ${PUBLIC_BOARD_ARTIFACT_FIELDS}
  query GetReleasePageCreatorData($releaseWorldId: ID!) {
    getReleaseTracks(releaseWorldId: $releaseWorldId) {
      ...ReleaseTrackFields
    }

    getPublicBoardArtifacts(releaseWorldId: $releaseWorldId) {
      ...PublicBoardArtifactFields
    }
  }
`;

const GET_RELEASE_PAGE_PUBLIC_DATA = gql`
  ${RELEASE_TRACK_FIELDS}
  ${PUBLIC_BOARD_ARTIFACT_FIELDS}
  query GetReleasePagePublicData($releaseWorldId: ID!) {
    getPublicReleaseTracks(releaseWorldId: $releaseWorldId) {
      ...ReleaseTrackFields
    }

    getPublicBoardArtifacts(releaseWorldId: $releaseWorldId) {
      ...PublicBoardArtifactFields
    }
  }
`;

type ReleaseWorld = {
    id: string;
    title: string;
    slug: string;
    releaseType: string;
    status: string;
    visibility: string;
    isFeatured: boolean;
    oneLineSummary?: string | null;
    story?: string | null;
    currentFocus?: string | null;
    secondFocus?: string | null;
    fullDropDate?: string | null;
    coverArtUrl?: string | null;
    coverAssetId?: string | null;
    updatedAt?: string | null;
    lastOpenedAt?: string | null;
};

type ReleaseTrack = {
    artistName?: string | null;
    ownerId?: string | null;
    id: string;
    title: string;
    slug: string;
    trackNumber: number;
    role: string;
    status: string;
    bpm?: number | null;
    keySignature?: string | null;
    mood?: string | null;
    hook?: string | null;
    notes?: string | null;
    audioUrl?: string | null;
    previewAudioUrl?: string | null;
    platformUrl?: string | null;
    artworkUrl?: string | null;
    releaseCoverArtUrl?: string | null;
    visibility?: string | null;
    accessTier?: string | null;
    playbackStatus?: string | null;
    dropDate?: string | null;
    unlockDate?: string | null;
    isFocusTrack: boolean;
    isSecondFocus: boolean;
    isPublic: boolean;
    updatedAt?: string | null;
};

type PublicBoardArtifact = {
    id: string;
    kind: string;
    eyebrow?: string | null;
    title: string;
    body?: string | null;
    meta?: string | null;
    href?: string | null;
    connectedTrackSlug?: string | null;
    isPublic: boolean;
    pageSection?: string | null;
    pageOrder?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

type ArtifactSectionKey = 'story' | 'track' | 'visual' | 'rollout' | 'quote' | 'asset';

const artifactSections: Array<{
    key: ArtifactSectionKey;
    eyebrow: string;
    title: string;
    body: string;
}> = [
        {
            key: 'quote',
            eyebrow: 'Words',
            title: 'Lines that stay with you.',
            body: 'Selected phrases, hooks, and emotional anchors from inside the world.',
        },
        {
            key: 'track',
            eyebrow: 'Song notes',
            title: 'What each song carries.',
            body: 'Small context pieces that deepen the listening path without turning the page into a workspace.',
        },
        {
            key: 'visual',
            eyebrow: 'Visual world',
            title: 'Images, colors, and symbols.',
            body: 'Cover direction, references, motifs, and atmosphere surrounding the release.',
        },
        {
            key: 'rollout',
            eyebrow: 'Afterglow',
            title: 'Moments around the release.',
            body: 'Public-facing context, memories, teasers, and fragments from the wider world.',
        },
        {
            key: 'story',
            eyebrow: 'Mythology',
            title: 'The meaning underneath.',
            body: 'Story fragments and world notes chosen for the listener-facing portal.',
        },
        {
            key: 'asset',
            eyebrow: 'Artifacts',
            title: 'Objects from the world.',
            body: 'Selected files, references, links, and supporting pieces for the release.',
        },
    ];

function formatLabel(value?: string | null) {
    if (!value) return 'Unknown';

    return value
        .split('-')
        .join(' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getCalendarDateParts(value?: string | null) {
    if (!value) return null;

    const cleanValue = String(value).trim();
    const datePrefixMatch = cleanValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (datePrefixMatch) {
        const [, year, month, day] = datePrefixMatch;
        return {
            year: Number(year),
            month: Number(month),
            day: Number(day),
        };
    }

    const numericValue = Number(cleanValue);
    const parsedDate = Number.isFinite(numericValue)
        ? new Date(numericValue)
        : new Date(cleanValue);

    if (Number.isNaN(parsedDate.getTime())) return null;

    return {
        year: parsedDate.getUTCFullYear(),
        month: parsedDate.getUTCMonth() + 1,
        day: parsedDate.getUTCDate(),
    };
}

function formatDate(value?: string | null) {
    const dateParts = getCalendarDateParts(value);

    if (!dateParts) return 'TBD';

    const localCalendarDate = new Date(dateParts.year, dateParts.month - 1, dateParts.day);

    if (Number.isNaN(localCalendarDate.getTime())) return 'TBD';

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(localCalendarDate);
}

function getTrackAvailability(
    track: ReleaseTrack,
    isCreatorView: boolean,
    isSignedIn = false,
) {
    const availability = getMusicAvailability(track, {
        isCreatorView,
        isSignedIn,
    });

    const className =
        availability.state === 'creator-review'
            ? 'release-world-track-action-review'
            : availability.state === 'full'
                ? 'release-world-track-action-play'
                : availability.state === 'preview'
                    ? 'release-world-track-action-preview'
                    : availability.state === 'coming-soon' || availability.state === 'unavailable'
                        ? 'release-world-track-action-pending'
                        : 'release-world-track-action-locked';

    return {
        label:
            availability.state === 'full'
                ? 'Listen'
                : availability.label,
        href: availability.resolvedAudioUrl ?? '',
        isPlayable: availability.isPlayable,
        isVisible: availability.isVisible,
        className,
    };
}

function getTrackFanLine(track: ReleaseTrack, world: ReleaseWorld) {
    const availability = track.playbackStatus || 'locked';
    const unlockDate = track.unlockDate ? formatDate(track.unlockDate) : null;
    const dropDate = formatDate(track.dropDate || world.fullDropDate);

    if (availability === 'playable') return 'Available now';
    if (availability === 'preview') return 'Preview available';
    if (availability === 'coming-soon' && unlockDate && unlockDate !== 'TBD') {
        return `Opens ${unlockDate}`;
    }

    if (dropDate !== 'TBD') return `Opens ${dropDate}`;
    return 'Release timing forming';
}

function getUniqueTrackArtworkUrl(track: ReleaseTrack) {
    return track.artworkUrl?.trim() || null;
}

function getPlayerArtworkUrl(track: ReleaseTrack, world: ReleaseWorld) {
    return (
        getUniqueTrackArtworkUrl(track) ||
        track.releaseCoverArtUrl?.trim() ||
        world.coverArtUrl?.trim() ||
        null
    );
}

function getSectionArtifacts(
    artifacts: PublicBoardArtifact[],
    sectionKey: ArtifactSectionKey,
) {
    return artifacts
        .filter((artifact) => (artifact.pageSection ?? 'story') === sectionKey)
        .sort((a, b) => (a.pageOrder ?? 1) - (b.pageOrder ?? 1));
}

export default function DynamicReleasePage() {
    const params = useParams<{ slug?: string | string[] }>();
    const { status } = useSession();
    const { playOrToggleTrack, currentTrack, isPlaying } = useMusicPlayer();
    const { isCreatorView: selectedCreatorView } = useCreatorView();
    const { isAuthenticated, canAccessCreatorOS } = usePlatformAccess();
    const wantsCreatorView = canAccessCreatorOS && selectedCreatorView;
    const isSignedInForMusic = isAuthenticated;

    const rawSlug = params?.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] ?? '' : rawSlug ?? '';

    const {
        data: creatorWorldData,
        loading: creatorWorldLoading,
        error: creatorWorldError,
    } = useQuery(GET_MY_RELEASE_WORLD_BY_SLUG, {
        variables: { slug },
        skip: !slug || !wantsCreatorView,
        fetchPolicy: 'cache-and-network',
    });

    // Creator preview applies only when the owned-world query resolves this slug.
    // A creator visiting another artist remains an ordinary public listener.
    const isCreatorView = wantsCreatorView && Boolean(creatorWorldData?.getMyReleaseWorldBySlug);

    const {
        data: publicWorldData,
        loading: publicWorldLoading,
        error: publicWorldError,
    } = useQuery(GET_PUBLIC_RELEASE_WORLD_BY_SLUG, {
        variables: { slug },
        skip: !slug || isCreatorView,
        fetchPolicy: 'cache-and-network',
    });

    const world =
        (isCreatorView
            ? creatorWorldData?.getMyReleaseWorldBySlug
            : publicWorldData?.getPublicReleaseWorldBySlug) as ReleaseWorld | null | undefined;

    const worldLoading = (wantsCreatorView && creatorWorldLoading) || publicWorldLoading;
    const worldError = isCreatorView ? creatorWorldError : publicWorldError;

    const {
        data: creatorPageData,
        loading: creatorPageLoading,
        error: creatorPageError,
    } = useQuery(GET_RELEASE_PAGE_CREATOR_DATA, {
        variables: { releaseWorldId: world?.id ?? '' },
        skip: !world?.id || !isCreatorView,
        fetchPolicy: 'cache-and-network',
    });

    const {
        data: publicPageData,
        loading: publicPageLoading,
        error: publicPageError,
    } = useQuery(GET_RELEASE_PAGE_PUBLIC_DATA, {
        variables: { releaseWorldId: world?.id ?? '' },
        skip: !world?.id || isCreatorView,
        fetchPolicy: 'cache-and-network',
    });

    const pageData = isCreatorView ? creatorPageData : publicPageData;
    const pageLoading = isCreatorView ? creatorPageLoading : publicPageLoading;
    const pageError = isCreatorView ? creatorPageError : publicPageError;

    const releaseTracks = useMemo(() => {
        const tracks = (isCreatorView
            ? pageData?.getReleaseTracks ?? []
            : pageData?.getPublicReleaseTracks ?? []) as ReleaseTrack[];

        return tracks.filter((track) =>
            getTrackAvailability(track, isCreatorView, isSignedInForMusic).isVisible,
        );
    }, [isCreatorView, isSignedInForMusic, pageData]);

    const publicArtifacts = useMemo(
        () => (pageData?.getPublicBoardArtifacts ?? []) as PublicBoardArtifact[],
        [pageData],
    );

    if (status === 'loading' || worldLoading) {
        return (
            <main className="release-world-page">
                <section className="release-world-state">
                    <p className="release-world-label">Opening the World</p>
                    <h1>The door is opening...</h1>
                    <p>Gathering the sound, story, and fragments for this release.</p>
                </section>
            </main>
        );
    }

    if (worldError) {
        return (
            <main className="release-world-page">
                <section className="release-world-state release-world-error">
                    <p className="release-world-label">Release Portal</p>
                    <h1>This doorway is not opening right now.</h1>
                    <p>{worldError.message}</p>
                    <Link href="/nexus">Return to Nexus</Link>
                </section>
            </main>
        );
    }

    if (!world) {
        return (
            <main className="release-world-page">
                <section className="release-world-state">
                    <p className="release-world-label">Release Not Found</p>
                    <h1>This doorway is not open yet</h1>
                    <p>
                        This world may not be public yet, or the doorway may have moved.
                    </p>
                    <Link href="/nexus">Return to Nexus</Link>
                </section>
            </main>
        );
    }

    const heroHook =
        world.oneLineSummary?.trim() ||
        world.story?.trim() ||
        'Step inside the sound, story, and atmosphere of this release.';

    const toPlayerTrack = (track: ReleaseTrack) => {
        const availability = getTrackAvailability(track, isCreatorView, isSignedInForMusic);

        return {
            id: `release-${track.id}`,
            trackTitle: track.title,
            artist: track.artistName || 'Independent creator',
            ownerId: track.ownerId,
            releaseSlug: world.slug,
            realmId: 0,
            realmName: 'INTERSIDDHI',
            realmColor: '#DCBA5C',
            visibility: track.visibility ?? (track.isPublic ? 'public' : 'private'),
            accessTier: track.accessTier ?? 'public',
            trackUrl: availability.href,
            audioUrl: track.audioUrl ?? null,
            fullAudioUrl: track.audioUrl ?? null,
            previewAudioUrl: track.previewAudioUrl ?? null,
            playbackStatus: track.playbackStatus ?? null,
            unlockDate: track.unlockDate ?? null,
            dropDate: track.dropDate ?? null,
            isPublic: track.isPublic,
            artworkUrl: getPlayerArtworkUrl(track, world) ?? undefined,
        };
    };

    const playReleaseTrack = (track: ReleaseTrack) => {
        const availability = getTrackAvailability(track, isCreatorView, isSignedInForMusic);

        if (!availability.isPlayable || !availability.href) return;

        const flowTracks = releaseTracks
            .filter((releaseTrack) => {
                const releaseTrackAvailability = getTrackAvailability(releaseTrack, isCreatorView, isSignedInForMusic);
                return releaseTrackAvailability.isPlayable && Boolean(releaseTrackAvailability.href);
            })
            .map(toPlayerTrack);

        void playOrToggleTrack(toPlayerTrack(track), flowTracks, {
            source: 'release',
            label: `${world.title} release`,
        });
    };

    return (
        <main className="release-world-page">
            <WorldSurface
                key={world.id}
                title={world.title}
                summary={heroHook}
                coverArtUrl={world.coverArtUrl}
                label={`${formatLabel(world.releaseType)} / Release World`}
                tracks={releaseTracks.map((track) => {
                    const availability = getTrackAvailability(track, isCreatorView, isSignedInForMusic);
                    return {
                        id: track.id, slug: track.slug, title: track.title,
                        artworkUrl: getPlayerArtworkUrl(track, world), hook: track.hook, mood: track.mood,
                        playable: availability.isPlayable && Boolean(availability.href), actionLabel: availability.label,
                    };
                })}
                fragments={publicArtifacts}
                playingTrackId={releaseTracks.find((track) => `release-${track.id}` === currentTrack?.id)?.id ?? null}
                isPlaying={isPlaying}
                onPlay={(id) => {
                    const track = releaseTracks.find((candidate) => candidate.id === id);
                    if (track) playReleaseTrack(track);
                }}
                navigation={<>
                    <Link href="/nexus">Explore Nexus</Link>
                    {world.visibility === 'public' && <ReleaseShareButton title={world.title} description={world.oneLineSummary?.trim() || undefined} slug={world.slug} />}
                    {isCreatorView && <>
                        <Link href={`/releases/${world.slug}/board`}>Open Workshop</Link>
                        <Link href={`/creator/releases/${world.slug}/publish`}>Prepare Release →</Link>
                        <Link href="/creator/projects">All Projects</Link>
                    </>}
                </>}
            />

            {world.story?.trim() && <section className="release-world-story-section">
                <div className="release-world-section-heading">
                    <p className="release-world-label">Inside the Release</p>
                    <h2>The story behind the sound.</h2>
                </div>
                <p>{world.story}</p>
                {world.fullDropDate && <p>Release date · {formatDate(world.fullDropDate)}</p>}
            </section>}

            <section className="release-world-track-section">
                <div className="release-world-section-heading release-world-section-heading-split">
                    <div>
                        <p className="release-world-label">Songs</p>
                        <h2>Follow the songs.</h2>
                    </div>
                    <p>
                        {pageLoading
                            ? 'Opening the tracklist...'
                            : `${releaseTracks.length} song${releaseTracks.length === 1 ? '' : 's'} inside this world.`}
                    </p>
                </div>

                {pageError && <p className="release-world-inline-error">{pageError.message}</p>}

                {releaseTracks.length > 0 ? (
                    <div className="release-world-track-grid">
                        {releaseTracks.map((track) => {
                            const action = getTrackAvailability(track, isCreatorView, isSignedInForMusic);

                            const uniqueTrackArtworkUrl = getUniqueTrackArtworkUrl(track);

                            return (
                                <article
                                    key={track.id}
                                    className={`release-world-track-card${uniqueTrackArtworkUrl ? ' release-world-track-card-has-artwork' : ''}`}
                                >
                                    <div className="release-world-track-card-top">
                                        <span>{String(track.trackNumber).padStart(2, '0')}</span>
                                        <div className="release-world-track-card-status">
                                            {(track.isFocusTrack || track.isSecondFocus) && (
                                                <strong>
                                                    {track.isFocusTrack ? 'First Signal' : 'Second Signal'}
                                                </strong>
                                            )}
                                            <em>{action.label}</em>
                                        </div>
                                    </div>

                                    {uniqueTrackArtworkUrl && (
                                        <div className="release-world-track-artwork">
                                            <img
                                                src={uniqueTrackArtworkUrl}
                                                alt={`${track.title} artwork`}
                                                className="release-world-track-artwork-image"
                                            />
                                        </div>
                                    )}

                                    <h3>{track.title}</h3>
                                    <p>{getTrackFanLine(track, world)}</p>

                                    {(track.mood || track.hook) && (
                                        <div className="release-world-track-card-body">
                                            {track.mood && <strong>{track.mood}</strong>}
                                            {track.hook && <p>{track.hook}</p>}
                                        </div>
                                    )}

                                    <div className="release-world-track-actions">
                                        {action.isPlayable && action.href ? (
                                            <button
                                                type="button"
                                                className={`release-world-track-button ${action.className}`}
                                                onClick={() => playReleaseTrack(track)}
                                            >
                                                {currentTrack?.id === `release-${track.id}` && isPlaying ? 'Pause' : action.label}
                                            </button>
                                        ) : (
                                            <span className={`release-world-track-pending ${action.className}`}>
                                                {action.label}
                                            </span>
                                        )}

                                        {track.platformUrl && (
                                            <a
                                                href={track.platformUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="release-world-track-platform-link"
                                            >
                                                Open platform ↗
                                            </a>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <p className="release-world-inline-empty">The tracklist is still coming into focus.</p>
                )}
            </section>

            {publicArtifacts.length > 0 && (
                <section className="release-world-board-section">
                    <div className="release-world-section-heading release-world-section-heading-split">
                        <div>
                            <p className="release-world-label">Fragments</p>
                            <h2>Pieces left inside the world.</h2>
                        </div>
                        <p>
                            {publicArtifacts.length} fragment
                            {publicArtifacts.length === 1 ? '' : 's'} from the release world.
                        </p>
                    </div>

                    <div className="release-world-board-section-list">
                        {artifactSections.map((section) => {
                            const artifacts = getSectionArtifacts(publicArtifacts, section.key);

                            if (artifacts.length === 0) return null;

                            return (
                                <section key={section.key} className="release-world-board-group">
                                    <div className="release-world-board-group-heading">
                                        <p className="release-world-label">{section.eyebrow}</p>
                                        <h3>{section.title}</h3>
                                        <span>{section.body}</span>
                                    </div>

                                    <div className="release-world-board-grid">
                                        {artifacts.map((artifact) => (
                                            <article key={artifact.id} className="release-world-board-card">
                                                <div className="release-world-board-card-top">
                                                    <span>{artifact.eyebrow || formatLabel(artifact.kind)}</span>
                                                    <em>{String(artifact.pageOrder ?? 1).padStart(2, '0')}</em>
                                                </div>
                                                <h4>{artifact.title}</h4>
                                                {artifact.body && <p>{artifact.body}</p>}
                                                <div className="release-world-board-card-meta">
                                                    {artifact.meta && <strong>{artifact.meta}</strong>}
                                                    {artifact.connectedTrackSlug && (
                                                        <span>{artifact.connectedTrackSlug}</span>
                                                    )}
                                                </div>
                                                {artifact.href && (
                                                    <Link href={artifact.href}>Enter fragment</Link>
                                                )}
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </section>
            )}

            <section className="release-world-afterglow-section">
                <div className="release-world-afterglow-inner">
                    <p className="release-world-label">The Door Remains Open</p>
                    <h2>Return whenever the signal calls.</h2>
                    <p>
                        This page holds one release. The Nexus holds the wider map — the realms, signals, and songs still unfolding.
                    </p>
                    <Link href="/nexus">Return to the Nexus</Link>
                </div>
            </section>

            {isCreatorView && (
                <section className="release-world-portal">
                    <div>
                        <p className="release-world-label">Creator tools</p>
                        <h2>Keep shaping what the listener will feel.</h2>
                        <p>
                            The public page is the doorway. Your Workshop is the private place to develop the music, artwork, and story. Its Studio Board is an optional canvas for deeper exploration.
                        </p>
                    </div>
                    <Link href={`/releases/${world.slug}/board`}>Open Workshop</Link>
                </section>
            )}
        </main>
    );
}