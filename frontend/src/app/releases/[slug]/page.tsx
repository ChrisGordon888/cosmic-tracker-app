'use client';

import Link from 'next/link';
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
      updatedAt
      lastOpenedAt
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
  updatedAt?: string | null;
  lastOpenedAt?: string | null;
};

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

function ReleaseArtwork({ world }: { world: ReleaseWorld }) {
  const titleParts = getTitleParts(world.title);

  return (
    <figure className="release-world-artwork" aria-label={`${world.title} artwork placeholder`}>
      <div className="release-world-artwork-orbit release-world-artwork-orbit-a" />
      <div className="release-world-artwork-orbit release-world-artwork-orbit-b" />
      <div className="release-world-artwork-glow" />

      <div className="release-world-artwork-title">
        <span>{formatLabel(world.releaseType)}</span>
        <strong>{titleParts.primary}</strong>
        <em>{titleParts.secondary}</em>
      </div>

      <figcaption>
        <span>{world.status}</span>
        <strong>{world.visibility}</strong>
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