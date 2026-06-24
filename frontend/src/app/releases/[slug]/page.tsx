'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import '@/styles/releaseWorld.css';

const GET_RELEASE_WORLD_BY_SLUG = gql`
  query GetReleaseWorldBySlug($slug: String!) {
    getMyReleaseWorldBySlug(slug: $slug) {
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
  }
`;

const GET_RELEASE_PAGE_CREATOR_DATA = gql`
  query GetReleasePageCreatorData($releaseWorldId: ID!) {
    getReleaseTracks(releaseWorldId: $releaseWorldId) {
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
      isFocusTrack
      isSecondFocus
      isPublic
      updatedAt
    }

    getPublicBoardArtifacts(releaseWorldId: $releaseWorldId) {
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
    eyebrow: 'Featured signals',
    title: 'Hooks, quotes, and phrases.',
    body: 'Fragments marked public from the Signal Board — the lines, hooks, and emotional anchors that define the world.',
  },
  {
    key: 'track',
    eyebrow: 'Track notes',
    title: 'Signals attached to songs.',
    body: 'Song-level notes, emotional tags, and creative signals that connect board ideas to the track path.',
  },
  {
    key: 'visual',
    eyebrow: 'Visual language',
    title: 'Images, palettes, and symbols.',
    body: 'Cover direction, clips, colors, motifs, and the visual world forming around the release.',
  },
  {
    key: 'rollout',
    eyebrow: 'Rollout path',
    title: 'Campaign beats and movement.',
    body: 'Teasers, story moments, launch ideas, and follow-up signals from the studio wall.',
  },
  {
    key: 'story',
    eyebrow: 'World notes',
    title: 'Mythology and meaning.',
    body: 'Public-facing world-building notes pulled from the private board.',
  },
  {
    key: 'asset',
    eyebrow: 'Assets',
    title: 'Public files and references.',
    body: 'Published board assets, references, links, and supporting material.',
  },
];

function formatLabel(value?: string | null) {
  if (!value) return 'Unknown';

  return value
    .split('-')
    .join(' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return 'TBD';

  const numericValue = Number(value);
  const date = Number.isFinite(numericValue)
    ? new Date(numericValue)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return 'TBD';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
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

function getReleasePath(world: ReleaseWorld) {
  const steps = [];

  if (world.currentFocus?.trim()) {
    steps.push({
      number: '01',
      title: world.currentFocus.trim(),
      label: 'Front door',
      body:
        'The first signal. Use this as the main entry point: the hook, image, feeling, or single that invites people into the world.',
    });
  }

  if (world.secondFocus?.trim()) {
    steps.push({
      number: '02',
      title: world.secondFocus.trim(),
      label: 'Contrast signal',
      body:
        'The second doorway. This gives the world motion, contrast, pressure, or another emotional angle.',
    });
  }

  steps.push({
    number: String(steps.length + 1).padStart(2, '0'),
    title: world.title,
    label: 'Full world',
    body:
      world.story?.trim() ||
      'The completed release world: sound, symbols, visuals, rollout, story, and the emotional container around the project.',
  });

  return steps;
}

function getTrackMeta(track: ReleaseTrack) {
  const parts = [formatLabel(track.role), formatLabel(track.status)];

  if (track.bpm) parts.push(`${track.bpm} BPM`);
  if (track.keySignature?.trim()) parts.push(track.keySignature.trim());
  if (track.isFocusTrack) parts.push('Focus');
  if (track.isSecondFocus) parts.push('Second');

  return parts.filter(Boolean).join(' / ');
}

function getSectionArtifacts(
  artifacts: PublicBoardArtifact[],
  sectionKey: ArtifactSectionKey,
) {
  return artifacts
    .filter((artifact) => (artifact.pageSection ?? 'story') === sectionKey)
    .sort((a, b) => (a.pageOrder ?? 1) - (b.pageOrder ?? 1));
}

function ReleaseArtwork({ world }: { world: ReleaseWorld }) {
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
          <strong>{formatLabel(world.visibility)}</strong>
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
        <strong>{formatLabel(world.visibility)}</strong>
      </figcaption>
    </figure>
  );
}

export default function DynamicReleasePage() {
  const params = useParams<{ slug?: string | string[] }>();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] ?? '' : rawSlug ?? '';

  const { data, loading, error } = useQuery(GET_RELEASE_WORLD_BY_SLUG, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: 'cache-and-network',
  });

  const world = data?.getMyReleaseWorldBySlug as ReleaseWorld | null | undefined;

  const {
    data: creatorData,
    loading: creatorLoading,
    error: creatorError,
  } = useQuery(GET_RELEASE_PAGE_CREATOR_DATA, {
    variables: { releaseWorldId: world?.id ?? '' },
    skip: !world?.id,
    fetchPolicy: 'cache-and-network',
  });

  const releaseTracks = useMemo(
    () => (creatorData?.getReleaseTracks ?? []) as ReleaseTrack[],
    [creatorData],
  );

  const publicArtifacts = useMemo(
    () => (creatorData?.getPublicBoardArtifacts ?? []) as PublicBoardArtifact[],
    [creatorData],
  );

  if (loading) {
    return (
      <main className="release-world-page">
        <section className="release-world-state">
          <p className="release-world-label">Loading Release World</p>
          <h1>Opening portal...</h1>
          <p>Finding the project by slug and preparing the release page.</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="release-world-page">
        <section className="release-world-state release-world-error">
          <p className="release-world-label">GraphQL Error</p>
          <h1>Could not open this release.</h1>
          <p>{error.message}</p>
          <Link href="/creator/projects">Back to Project Library</Link>
        </section>
      </main>
    );
  }

  if (!world) {
    return (
      <main className="release-world-page">
        <section className="release-world-state">
          <p className="release-world-label">Release Not Found</p>
          <h1>No world found for /{slug}</h1>
          <p>This release may not exist yet, or it may belong to another account.</p>
          <Link href="/creator/projects">Back to Project Library</Link>
        </section>
      </main>
    );
  }

  const titleParts = getTitleParts(world.title);
  const releasePath = getReleasePath(world);
  const heroHook =
    world.oneLineSummary?.trim() ||
    world.story?.trim() ||
    'A release world is forming: sound, story, visuals, and signal all moving toward one portal.';

  return (
    <main className="release-world-page">
      <section className="release-world-hero">
        <div className="release-world-hero-grid">
          <div className="release-world-hero-copy">
            <p className="release-world-label">
              {formatLabel(world.releaseType)} / Release World
            </p>

            <h1>
              <span>{titleParts.primary}</span>
              <em>{titleParts.secondary}</em>
            </h1>

            <p className="release-world-hero-summary">{heroHook}</p>

            <div className="release-world-hero-actions">
              <a aria-disabled="true">Listen soon</a>
              <Link href={`/releases/${world.slug}/board`}>Open signal board</Link>
              <Link href="/creator/projects">Project library</Link>
            </div>
          </div>

          <div className="release-world-hero-art">
            <ReleaseArtwork world={world} />
          </div>
        </div>

        <div className="release-world-meta-strip" aria-label="Release metadata">
          <div>
            <span>Project</span>
            <strong>{world.title}</strong>
          </div>
          <div>
            <span>Lead signal</span>
            <strong>{world.currentFocus || 'TBD'}</strong>
          </div>
          <div>
            <span>Second signal</span>
            <strong>{world.secondFocus || 'TBD'}</strong>
          </div>
          <div>
            <span>World opens</span>
            <strong>{formatDate(world.fullDropDate)}</strong>
          </div>
        </div>
      </section>

      <section className="release-world-hook-band" aria-label="Main release summary">
        <p>{heroHook}</p>
      </section>

      <section className="release-world-story-section">
        <div className="release-world-section-heading">
          <p className="release-world-label">The world</p>
          <h2>Not just a project. A place.</h2>
        </div>
        <p>
          {world.story?.trim() ||
            'This release page is the polished portal. The Signal Board behind it holds the messy mythology: notes, hooks, visuals, rollout ideas, symbols, and creative direction.'}
        </p>
      </section>

      {releaseTracks.length > 0 && (
        <section className="release-world-track-section">
          <div className="release-world-section-heading release-world-section-heading-split">
            <div>
              <p className="release-world-label">Track Path</p>
              <h2>The songs inside the world.</h2>
            </div>
            <p>
              {creatorLoading
                ? 'Loading track path...'
                : `${releaseTracks.length} track${releaseTracks.length === 1 ? '' : 's'} mapped from the Creator OS.`}
            </p>
          </div>

          {creatorError && (
            <p className="release-world-inline-error">{creatorError.message}</p>
          )}

          <div className="release-world-track-grid">
            {releaseTracks.map((track) => (
              <article key={track.id} className="release-world-track-card">
                <div className="release-world-track-card-top">
                  <span>{String(track.trackNumber).padStart(2, '0')}</span>
                  <em>{track.isPublic ? 'Public' : 'Private'}</em>
                </div>
                <p>{getTrackMeta(track)}</p>
                <h3>{track.title}</h3>

                {(track.mood || track.hook || track.notes) && (
                  <div className="release-world-track-card-body">
                    {track.mood && <strong>{track.mood}</strong>}
                    {track.hook && <p>{track.hook}</p>}
                    {track.notes && <small>{track.notes}</small>}
                  </div>
                )}

                {track.audioUrl?.trim() ? (
                  <a href={track.audioUrl} target="_blank" rel="noreferrer">
                    Listen source
                  </a>
                ) : (
                  <span className="release-world-track-pending">Audio pending</span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {publicArtifacts.length > 0 && (
        <section className="release-world-board-section">
          <div className="release-world-section-heading release-world-section-heading-split">
            <div>
              <p className="release-world-label">Board to Portal</p>
              <h2>Published signals from the studio wall.</h2>
            </div>
            <p>
              {publicArtifacts.length} published artifact
              {publicArtifacts.length === 1 ? '' : 's'} selected from the Signal Board.
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
                          <Link href={artifact.href}>Open linked signal</Link>
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

      <section className="release-world-path-section">
        <div className="release-world-section-heading">
          <p className="release-world-label">Release path</p>
          <h2>Signal, contrast, full world.</h2>
        </div>

        <div className="release-world-path-list">
          {releasePath.map((step) => (
            <article key={`${step.number}-${step.title}`}>
              <span>{step.number}</span>
              <div>
                <p>{step.label}</p>
                <h3>{step.title}</h3>
                <strong>{step.body}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="release-world-signal-section">
        <div className="release-world-section-heading">
          <p className="release-world-label">Project signals</p>
          <h2>What this world needs next.</h2>
        </div>

        <div className="release-world-signal-grid">
          <article>
            <span>01</span>
            <h3>Core hook</h3>
            <p>Define the phrase, melody, or concept that people remember first.</p>
          </article>

          <article>
            <span>02</span>
            <h3>Visual identity</h3>
            <p>Collect cover direction, colors, typography, clips, and symbolic references.</p>
          </article>

          <article>
            <span>03</span>
            <h3>Rollout rhythm</h3>
            <p>Map the teaser, first signal, contrast push, full release, and follow-up content.</p>
          </article>
        </div>
      </section>

      <section className="release-world-rollout-section">
        <div className="release-world-section-heading">
          <p className="release-world-label">Rollout cadence</p>
          <h2>Build the path outward.</h2>
        </div>

        <div className="release-world-rollout-list">
          <article>
            <span>Seed</span>
            <div>
              <h3>Establish the world</h3>
              <p>Lock the project title, first hook, visual tone, and board direction.</p>
            </div>
          </article>

          <article>
            <span>Open</span>
            <div>
              <h3>Release the first signal</h3>
              <p>Push the lead idea, first cover direction, or first public-facing clip.</p>
            </div>
          </article>

          <article>
            <span>Release</span>
            <div>
              <h3>Turn the project into a portal</h3>
              <p>Connect the page, board, assets, tracks, and story into one world.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="release-world-portal">
        <div>
          <p className="release-world-label">Behind the release</p>
          <h2>Enter the board where the world is still forming.</h2>
          <p>
            The release page is the polished portal. The Signal Board is the working canvas:
            hooks, notes, asset fragments, rollout ideas, and world-building direction.
          </p>
        </div>
        <Link href={`/releases/${world.slug}/board`}>Open signal board</Link>
      </section>
    </main>
  );
}