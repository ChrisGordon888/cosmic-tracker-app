'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
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
    visibility
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
  visibility?: string | null;
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

function getTitleParts(title?: string | null) {
  const cleanTitle = title?.trim() || 'Untitled Release';

  if (cleanTitle.toLowerCase().includes(' in ')) {
    const [first, ...rest] = cleanTitle.split(/\s+in\s+/i);
    return {
      primary: first,
      secondary: `in ${rest.join(' in ')}`,
    };
  }

  const words = cleanTitle.split(' ');

  if (words.length >= 3) {
    return {
      primary: words.slice(0, -1).join(' '),
      secondary: words.slice(-1).join(' '),
    };
  }

  return {
    primary: cleanTitle,
    secondary: 'Release World',
  };
}

function getTrackAvailability(track: ReleaseTrack, isCreatorView: boolean) {
  const playbackStatus = track.playbackStatus || 'locked';
  const hasFullAudio = Boolean(track.audioUrl?.trim());
  const hasPreviewAudio = Boolean(track.previewAudioUrl?.trim());

  if (isCreatorView && (hasFullAudio || hasPreviewAudio)) {
    return {
      label: 'Review',
      href: track.audioUrl?.trim() || track.previewAudioUrl?.trim() || '',
      isPlayable: true,
      className: 'release-world-track-action-review',
    };
  }

  if (playbackStatus === 'playable' && hasFullAudio) {
    return {
      label: 'Listen',
      href: track.audioUrl?.trim() || '',
      isPlayable: true,
      className: 'release-world-track-action-play',
    };
  }

  if (playbackStatus === 'preview' && hasPreviewAudio) {
    return {
      label: 'Preview',
      href: track.previewAudioUrl?.trim() || '',
      isPlayable: true,
      className: 'release-world-track-action-preview',
    };
  }

  if (playbackStatus === 'preview') {
    return {
      label: 'Preview soon',
      href: '',
      isPlayable: false,
      className: 'release-world-track-action-pending',
    };
  }

  if (playbackStatus === 'coming-soon') {
    return {
      label: 'Coming soon',
      href: '',
      isPlayable: false,
      className: 'release-world-track-action-pending',
    };
  }

  return {
    label: 'Locked',
    href: '',
    isPlayable: false,
    className: 'release-world-track-action-locked',
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

function getSectionArtifacts(
  artifacts: PublicBoardArtifact[],
  sectionKey: ArtifactSectionKey,
) {
  return artifacts
    .filter((artifact) => (artifact.pageSection ?? 'story') === sectionKey)
    .sort((a, b) => (a.pageOrder ?? 1) - (b.pageOrder ?? 1));
}

function ReleaseArtwork({ world, isCreatorView }: { world: ReleaseWorld; isCreatorView: boolean }) {
  const titleParts = getTitleParts(world.title);
  const coverArtUrl = world.coverArtUrl?.trim();

  if (coverArtUrl) {
    return (
      <figure
        className="release-world-artwork release-world-artwork-has-cover"
        aria-label={`${world.title} cover artwork`}
      >
        <div className="release-world-artwork-orbit release-world-artwork-orbit-a" />
        <div className="release-world-artwork-orbit release-world-artwork-orbit-b" />
        <div className="release-world-artwork-glow" />

        <img
          src={coverArtUrl}
          alt={`${world.title} cover artwork`}
          className="release-world-cover-image"
        />

        <div className="release-world-cover-sheen" />

        <figcaption>
          <span>{formatLabel(world.status)}</span>
          <strong>{isCreatorView ? formatLabel(world.visibility) : 'Release Portal'}</strong>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="release-world-artwork" aria-label={`${world.title} artwork placeholder`}>
      <div className="release-world-artwork-orbit release-world-artwork-orbit-a" />
      <div className="release-world-artwork-orbit release-world-artwork-b" />
      <div className="release-world-artwork-glow" />

      <div className="release-world-artwork-title">
        <span>{formatLabel(world.releaseType)}</span>
        <strong>{titleParts.primary}</strong>
        <em>{titleParts.secondary}</em>
      </div>

      <figcaption>
        <span>{formatLabel(world.status)}</span>
        <strong>{isCreatorView ? formatLabel(world.visibility) : 'Release Portal'}</strong>
      </figcaption>
    </figure>
  );
}

export default function DynamicReleasePage() {
  const params = useParams<{ slug?: string | string[] }>();
  const { status } = useSession();
  const { playOrToggleTrack, currentTrack, isPlaying } = useMusicPlayer();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] ?? '' : rawSlug ?? '';
  const isCreatorView = status === 'authenticated';

  const {
    data: creatorWorldData,
    loading: creatorWorldLoading,
    error: creatorWorldError,
  } = useQuery(GET_MY_RELEASE_WORLD_BY_SLUG, {
    variables: { slug },
    skip: !slug || !isCreatorView,
    fetchPolicy: 'cache-and-network',
  });

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

  const worldLoading = isCreatorView ? creatorWorldLoading : publicWorldLoading;
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

  const releaseTracks = useMemo(
    () =>
      (isCreatorView
        ? pageData?.getReleaseTracks ?? []
        : pageData?.getPublicReleaseTracks ?? []) as ReleaseTrack[],
    [isCreatorView, pageData],
  );

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

  const titleParts = getTitleParts(world.title);
  const heroHook =
    world.oneLineSummary?.trim() ||
    world.story?.trim() ||
    'Step inside the sound, story, and atmosphere of this release.';

  const firstPlayableTrack = releaseTracks.find((track) => {
    const availability = getTrackAvailability(track, isCreatorView);
    return availability.isPlayable && availability.href;
  });

  const firstPlayableAction = firstPlayableTrack
    ? getTrackAvailability(firstPlayableTrack, isCreatorView)
    : null;

  const toPlayerTrack = (track: ReleaseTrack) => {
    const availability = getTrackAvailability(track, isCreatorView);

    return {
      id: `release-${track.id}`,
      trackTitle: track.title,
      artist: 'Cosmic',
      realmId: 0,
      realmName: 'INTERSIDDHI',
      realmColor: '#DCBA5C',
      visibility: track.visibility === 'public' || track.isPublic ? 'public' : 'premium',
      trackUrl: availability.href,
      artworkUrl: world.coverArtUrl ?? undefined,
    };
  };

  const playReleaseTrack = (track: ReleaseTrack) => {
    const availability = getTrackAvailability(track, isCreatorView);

    if (!availability.isPlayable || !availability.href) return;

    const flowTracks = releaseTracks
      .filter((releaseTrack) => {
        const releaseTrackAvailability = getTrackAvailability(releaseTrack, isCreatorView);
        return releaseTrackAvailability.isPlayable && Boolean(releaseTrackAvailability.href);
      })
      .map(toPlayerTrack);

    void playOrToggleTrack(toPlayerTrack(track), flowTracks, {
      source: 'release-page',
      label: world.title,
    });
  };

  return (
    <main className="release-world-page">
      <section className="release-world-hero">
        <div className="release-world-hero-grid">
          <div className="release-world-hero-copy">
            <p className="release-world-label">
              {formatLabel(world.releaseType)} / Listener Portal
            </p>

            <h1>
              <span>{titleParts.primary}</span>
              <em>{titleParts.secondary}</em>
            </h1>

            <p className="release-world-hero-summary">{heroHook}</p>

            <div className="release-world-hero-actions">
              {firstPlayableTrack && firstPlayableAction?.href ? (
                <button
                  type="button"
                  className="release-world-hero-play-button"
                  onClick={() => playReleaseTrack(firstPlayableTrack)}
                >
                  {currentTrack?.id === `release-${firstPlayableTrack.id}` && isPlaying
                    ? 'Pause'
                    : firstPlayableAction.label}
                </button>
              ) : (
                <span className="release-world-hero-play-button release-world-hero-play-button-disabled">
                  Listen soon
                </span>
              )}

              <Link href="/nexus">Return to Nexus</Link>

              {isCreatorView && (
                <>
                  <Link href={`/releases/${world.slug}/board`}>Open Signal Board</Link>
                  <Link href="/creator/projects">Project Library</Link>
                </>
              )}
            </div>
          </div>

          <div className="release-world-hero-art">
            <ReleaseArtwork world={world} isCreatorView={isCreatorView} />
          </div>
        </div>

        <div className="release-world-meta-strip" aria-label="Release metadata">
          <div>
            <span>Release</span>
            <strong>{world.title}</strong>
          </div>
          <div>
            <span>First Signal</span>
            <strong>{world.currentFocus || 'TBD'}</strong>
          </div>
          <div>
            <span>Second Signal</span>
            <strong>{world.secondFocus || 'TBD'}</strong>
          </div>
          <div>
            <span>Opens</span>
            <strong>{formatDate(world.fullDropDate)}</strong>
          </div>
        </div>
      </section>

      <section className="release-world-hook-band" aria-label="Main release summary">
        <p>{heroHook}</p>
      </section>

      <section className="release-world-story-section">
        <div className="release-world-section-heading">
          <p className="release-world-label">Inside the Release</p>
          <h2>Enter the feeling.</h2>
        </div>
        <p>
          {world.story?.trim() ||
            'A world of sound, desire, memory, and return. Listen closely — every song opens another room.'}
        </p>
      </section>

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
              const action = getTrackAvailability(track, isCreatorView);

              return (
                <article key={track.id} className="release-world-track-card">
                  <div className="release-world-track-card-top">
                    <span>{String(track.trackNumber).padStart(2, '0')}</span>
                    <em>{action.label}</em>
                  </div>

                  <h3>{track.title}</h3>
                  <p>{getTrackFanLine(track, world)}</p>

                  {(track.mood || track.hook) && (
                    <div className="release-world-track-card-body">
                      {track.mood && <strong>{track.mood}</strong>}
                      {track.hook && <p>{track.hook}</p>}
                    </div>
                  )}

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
              The public page is the doorway. The Signal Board remains the private studio wall where the story, sound, visuals, and fragments keep evolving.
            </p>
          </div>
          <Link href={`/releases/${world.slug}/board`}>Open Signal Board</Link>
        </section>
      )}
    </main>
  );
}