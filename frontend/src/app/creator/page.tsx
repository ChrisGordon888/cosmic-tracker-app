'use client';

import Link from 'next/link';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';
import '@/styles/creator.css';

const CREATOR_HOME_QUERY = gql`
  query CreatorHome {
    myCreativeProfiles {
      id
      artistName
      slug
      displayName
      tagline
      bio
      isPublic
      isFeatured
      featuredReleaseWorldId
    }

    myReleaseWorlds {
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

const SET_FEATURED_RELEASE_WORLD = gql`
  mutation SetFeaturedReleaseWorld($releaseWorldId: ID!) {
    setFeaturedReleaseWorld(releaseWorldId: $releaseWorldId) {
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

type CreativeProfile = {
  id: string;
  artistName: string;
  slug: string;
  displayName?: string | null;
  tagline?: string | null;
  bio?: string | null;
  isPublic: boolean;
  isFeatured: boolean;
  featuredReleaseWorldId?: string | null;
};

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

function formatLabel(value?: string | null) {
  if (!value) return 'Unknown';

  return value
    .split('-')
    .join(' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return 'TBD';

  const calendarDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (calendarDate) {
    const [, year, month, day] = calendarDate;
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

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

function formatRelativeSignal(value?: string | null) {
  if (!value) return 'Not opened yet';

  const numericValue = Number(value);
  const date = Number.isFinite(numericValue)
    ? new Date(numericValue)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return 'Recently updated';

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;

  return formatDate(value);
}

function getTimestamp(value?: string | null) {
  if (!value) return 0;

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) return numericValue;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function countByStatus(projects: ReleaseWorld[], status: string) {
  return projects.filter((project) => project.status === status).length;
}

function countByVisibility(projects: ReleaseWorld[], visibility: string) {
  return projects.filter((project) => project.visibility === visibility).length;
}

function getProjectSummary(project?: ReleaseWorld | null) {
  return (
    project?.oneLineSummary?.trim() ||
    project?.story?.trim() ||
    'Build the release world: page, board, rollout, hooks, notes, visuals, and public portal.'
  );
}

function getProjectSignal(project?: ReleaseWorld | null) {
  if (!project) return 'No featured release selected yet.';

  const currentFocus = project.currentFocus?.trim() || 'Focus TBD';
  const secondFocus = project.secondFocus?.trim() || 'Second signal TBD';

  return `${currentFocus} → ${secondFocus}`;
}

function getFeaturedProject(
  projects: ReleaseWorld[],
  activeProfile?: CreativeProfile | null,
) {
  const profileFeaturedId = activeProfile?.featuredReleaseWorldId;

  return (
    projects.find((project) => profileFeaturedId && project.id === profileFeaturedId) ??
    projects.find((project) => project.isFeatured) ??
    projects[0] ??
    null
  );
}

function getReleaseHealth(project?: ReleaseWorld | null) {
  if (!project) {
    return [
      { label: 'World', value: 'Missing' },
      { label: 'Board', value: 'Start' },
      { label: 'Portal', value: 'Draft' },
    ];
  }

  return [
    { label: 'World', value: formatLabel(project.status) },
    { label: 'Portal', value: formatLabel(project.visibility) },
    { label: 'Drop', value: formatDate(project.fullDropDate) },
  ];
}

function ProjectCover({ project }: { project?: ReleaseWorld | null }) {
  const coverUrl = project?.coverArtUrl?.trim();

  return (
    <div className="creator-release-cover" aria-hidden={!coverUrl}>
      {coverUrl ? (
        <img src={coverUrl} alt={`${project?.title ?? 'Release'} cover`} />
      ) : (
        <div>
          <span>{project?.releaseType ? formatLabel(project.releaseType) : 'World'}</span>
          <strong>{project?.title ?? 'Cosmic'}</strong>
        </div>
      )}
    </div>
  );
}

export default function CreatorDashboardPage() {
  const { status } = useSession();

  const { data, loading, error, refetch } = useQuery(CREATOR_HOME_QUERY, {
    skip: status !== 'authenticated',
    fetchPolicy: 'cache-and-network',
  });

  const [setFeaturedReleaseWorld, { loading: isSettingFeatured }] = useMutation(
    SET_FEATURED_RELEASE_WORLD,
  );

  const profiles: CreativeProfile[] = data?.myCreativeProfiles ?? [];
  const projects: ReleaseWorld[] = data?.myReleaseWorlds ?? [];

  const activeProfile = profiles[0] ?? null;
  const featuredProject = getFeaturedProject(projects, activeProfile);
  const activeProject = featuredProject ?? projects[0] ?? null;
  const recentProjects = [...projects]
    .sort((a, b) => {
      const aTime = getTimestamp(a.lastOpenedAt || a.updatedAt);
      const bTime = getTimestamp(b.lastOpenedAt || b.updatedAt);
      return bTime - aTime;
    })
    .slice(0, 6);

  const commandLinks = activeProject
    ? [
        {
          label: 'Release Portal',
          href: `/releases/${activeProject.slug}`,
          meta: 'Public page',
          priority: 'secondary',
        },
        {
          label: 'Signal Board',
          href: `/releases/${activeProject.slug}/board`,
          meta: 'Studio wall',
          priority: 'primary',
        },
        {
          label: 'Creator Library',
          href: '/creator/library',
          meta: 'All tracks',
          priority: 'secondary',
        },
        {
          label: 'All Projects',
          href: '/creator/projects',
          meta: 'Release worlds',
          priority: 'secondary',
        },
        {
          label: 'Nexus',
          href: '/nexus',
          meta: 'Universe hub',
          priority: 'secondary',
        },
      ]
    : [
        {
          label: 'Creator Library',
          href: '/creator/library',
          meta: 'All tracks',
          priority: 'secondary',
        },
        {
          label: 'All Projects',
          href: '/creator/projects',
          meta: 'Create project',
          priority: 'secondary',
        },
        {
          label: 'Nexus',
          href: '/nexus',
          meta: 'Universe hub',
          priority: 'secondary',
        },
      ];

  async function handleSetFeatured(project: ReleaseWorld) {
    if (!project.id) return;

    try {
      await setFeaturedReleaseWorld({
        variables: {
          releaseWorldId: project.id,
        },
      });

      await refetch();
    } catch (featuredError) {
      console.error('Could not set featured release world:', featuredError);
    }
  }

  if (status === 'loading') {
    return (
      <main className="creator-console-shell">
        <aside className="creator-console-rail" aria-label="Creator console rail">
          <div className="creator-console-mark">C</div>
          <p>Creator OS</p>
        </aside>

        <section className="creator-console">
          <header className="creator-console-header creator-console-header-centered">
            <div>
              <p className="creator-console-kicker">Loading Session</p>
              <h1>Creator OS</h1>
              <p>Checking your creator access...</p>
            </div>
          </header>
        </section>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <main className="creator-console-shell">
        <aside className="creator-console-rail" aria-label="Creator console rail">
          <div className="creator-console-mark">C</div>
          <p>Creator OS</p>
        </aside>

        <section className="creator-console">
          <header className="creator-console-header">
            <div>
              <p className="creator-console-kicker">Sign In Required</p>
              <h1>Creator OS</h1>
              <p>
                Sign in to view your creator profile, release worlds, project boards,
                and command center.
              </p>
            </div>

            <Link href="/auth?callbackUrl=/creator" className="creator-console-status">
              <span>Auth</span>
              <strong>Sign in to Cosmic</strong>
              <em>Continue with Google or GitHub</em>
            </Link>
          </header>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="creator-console-shell">
        <aside className="creator-console-rail" aria-label="Creator console rail">
          <div className="creator-console-mark">C</div>
          <p>Creator OS</p>
        </aside>

        <section className="creator-console">
          <header className="creator-console-header">
            <div>
              <p className="creator-console-kicker">GraphQL Error</p>
              <h1>Could not load Creator OS.</h1>
              <p>{error.message}</p>
            </div>

            <button type="button" className="creator-console-status" onClick={() => refetch()}>
              <span>Action</span>
              <strong>Try again</strong>
              <em>Reload creator data</em>
            </button>
          </header>
        </section>
      </main>
    );
  }

  return (
    <main className="creator-console-shell">
      <aside className="creator-console-rail" aria-label="Creator console rail">
        <div className="creator-console-mark">C</div>
        <div className="creator-console-rail-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p>Creator OS</p>
      </aside>

      <section className="creator-console">
        <header className="creator-hero">
          <div className="creator-hero-copy">
            <p className="creator-console-kicker">Creator Command Center</p>
            <h1>{activeProject?.title ?? 'Creator OS'}</h1>
            <p>
              {activeProject
                ? getProjectSummary(activeProject)
                : 'Create your first release world, then use the board and release page to build the project outward.'}
            </p>

            <div className="creator-hero-actions">
              {commandLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={link.priority === 'primary' ? 'is-primary' : undefined}
                >
                  <span>{link.label}</span>
                  <em>{link.meta}</em>
                </Link>
              ))}
            </div>
          </div>

          <aside className="creator-feature-card">
            <div className="creator-feature-topline">
              <span>{activeProject?.isFeatured ? 'Featured Release' : 'Active Release'}</span>
              <em>{activeProject ? formatRelativeSignal(activeProject.lastOpenedAt) : 'Ready'}</em>
            </div>

            {activeProject ? (
              <Link
                href={`/releases/${activeProject.slug}/board`}
                className="creator-feature-cover-link"
                aria-label={`Open ${activeProject.title} Signal Board`}
              >
                <ProjectCover project={activeProject} />
              </Link>
            ) : (
              <ProjectCover project={activeProject} />
            )}

            <div className="creator-feature-copy">
              {activeProject ? (
                <Link href={`/releases/${activeProject.slug}`} className="creator-feature-title-link">
                  {activeProject.title}
                </Link>
              ) : (
                <strong>{activeProfile?.artistName ?? 'No active project'}</strong>
              )}
              <p>{getProjectSignal(activeProject)}</p>
            </div>

            <div className="creator-feature-metrics">
              {getReleaseHealth(activeProject).map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </aside>
        </header>

        <section className="creator-console-topline" aria-label="Creator stats">
          <article>
            <span>Release Worlds</span>
            <strong>{projects.length}</strong>
            <p>Projects stored in Mongo.</p>
          </article>

          <article>
            <span>Active</span>
            <strong>{countByStatus(projects, 'active')}</strong>
            <p>Currently moving.</p>
          </article>

          <article>
            <span>Public</span>
            <strong>{countByVisibility(projects, 'public')}</strong>
            <p>{countByVisibility(projects, 'private')} private projects.</p>
          </article>

          <article>
            <span>Featured</span>
            <strong>{activeProject ? '1' : '0'}</strong>
            <p>{activeProject?.title ?? 'Select a release world.'}</p>
          </article>
        </section>

        <section className="creator-console-grid creator-console-grid-main">
          <article className="creator-console-panel creator-console-panel-featured">
            <div className="creator-panel-title-row">
              <div>
                <p className="creator-console-kicker">Featured Release</p>
                <h2>Broadcast to Nexus</h2>
              </div>
              <Link href="/nexus">View Nexus</Link>
            </div>

            <p className="creator-console-note">
              Your featured release is the primary project listeners encounter in the Nexus.
              Change it whenever another world becomes the lead signal.
            </p>

            <div className="creator-feature-flow">
              <div>
                <span>01</span>
                <strong>Build</strong>
                <p>Shape the project inside its Signal Board.</p>
              </div>
              <div>
                <span>02</span>
                <strong>Feature</strong>
                <p>Choose the release leading the current chapter.</p>
              </div>
              <div>
                <span>03</span>
                <strong>Broadcast</strong>
                <p>Its portal, artwork, and focus tracks move into the Nexus.</p>
              </div>
            </div>
          </article>

          <article className="creator-console-panel">
            <p className="creator-console-kicker">Project Monitor</p>
            <h2>Creative status</h2>

            <div className="creator-asset-status-grid">
              {['draft', 'active', 'released', 'archived'].map((projectStatus) => (
                <div key={projectStatus}>
                  <span>{projectStatus}</span>
                  <strong>{countByStatus(projects, projectStatus)}</strong>
                </div>
              ))}
            </div>

            <div className="creator-asset-mini-list">
              {recentProjects.length > 0 ? (
                recentProjects.slice(0, 4).map((project) => (
                  <div key={project.id}>
                    <span>{project.status}</span>
                    <p>{project.title}</p>
                  </div>
                ))
              ) : (
                <div>
                  <span>empty</span>
                  <p>No projects yet. Create one in All Projects.</p>
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="creator-console-grid creator-console-grid-balanced">
          <article className="creator-console-panel creator-console-wide">
            <div className="creator-panel-title-row">
              <div>
                <p className="creator-console-kicker">All Projects Preview</p>
                <h2>Release worlds</h2>
              </div>
              <Link href="/creator/projects">View All Projects</Link>
            </div>

            <div className="creator-project-library-grid">
              {projects.length > 0 ? (
                projects.slice(0, 6).map((project) => (
                  <article
                    key={project.id}
                    className={`creator-project-card ${project.id === activeProject?.id ? 'is-featured' : ''}`}
                  >
                    <ProjectCover project={project} />

                    <div className="creator-project-card-body">
                      <div className="creator-project-card-meta">
                        <span>{formatLabel(project.releaseType)}</span>
                        <em>{formatLabel(project.status)}</em>
                      </div>

                      <strong>{project.title}</strong>
                      <p>{getProjectSummary(project)}</p>
                      <code>/{project.slug}</code>

                      <div className="creator-project-card-actions">
                        <Link href={`/releases/${project.slug}`}>Portal</Link>
                        <Link href={`/releases/${project.slug}/board`}>Signal Board</Link>
                        <button
                          type="button"
                          disabled={isSettingFeatured || project.id === activeProject?.id}
                          onClick={() => handleSetFeatured(project)}
                        >
                          {project.id === activeProject?.id ? 'Featured' : 'Set Featured'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <article className="creator-project-card creator-project-card-empty">
                  <div className="creator-project-card-body">
                    <span>start</span>
                    <strong>Create a project</strong>
                    <p>Your next EP, single, album, campaign, or client world starts here.</p>
                    <Link href="/creator/projects">Open All Projects</Link>
                  </div>
                </article>
              )}
            </div>
          </article>

          <article className="creator-console-panel">
            <p className="creator-console-kicker">Creator Profile</p>
            <h2>{activeProfile?.artistName ?? 'Profile needed'}</h2>

            <div className="creator-profile-card">
              <span>{activeProfile?.isPublic ? 'Public profile' : 'Private profile'}</span>
              <strong>{activeProfile?.displayName || activeProfile?.artistName || 'Cosmic'}</strong>
              <p>
                {activeProfile?.tagline ||
                  activeProfile?.bio ||
                  'This profile anchors the release worlds, featured project, and future Nexus identity.'}
              </p>
            </div>

            <div className="creator-console-pill-list">
              {[
                'Creator mode',
                'Release worlds',
                'Signal boards',
                'Nexus feature',
                'Public portals',
              ].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        </section>

        <section className="creator-console-grid creator-console-grid-bottom">
          <article className="creator-console-panel creator-console-wide">
            <p className="creator-console-kicker">Recent Activity</p>
            <h2>Recently opened</h2>

            <div className="creator-console-track-strip">
              {recentProjects.map((project, index) => (
                <div key={project.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{project.title}</strong>
                  <p>
                    {formatRelativeSignal(project.lastOpenedAt || project.updatedAt)} · {formatLabel(project.status)}
                  </p>
                </div>
              ))}

              {projects.length === 0 && (
                <div>
                  <span>00</span>
                  <strong>No release worlds yet</strong>
                  <p>Create one in All Projects.</p>
                </div>
              )}
            </div>
          </article>

          <article className="creator-console-panel">
            <p className="creator-console-kicker">Core Workflow</p>
            <h2>The Creator Loop</h2>

            <div className="creator-console-phases">
              {[
                {
                  title: 'Create',
                  body: 'Start a release world in All Projects.',
                },
                {
                  title: 'Build',
                  body: 'Shape hooks, notes, visuals, assets, and rollout in the board.',
                },
                {
                  title: 'Present',
                  body: 'Use the release page as the public-facing portal.',
                },
                {
                  title: 'Feature',
                  body: 'Set the lead project so Nexus knows where to point.',
                },
              ].map((beat, index) => (
                <div key={beat.title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{beat.title}</strong>
                    <p>{beat.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

      </section>
    </main>
  );
}