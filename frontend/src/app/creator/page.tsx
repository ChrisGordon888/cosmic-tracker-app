'use client';

import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { signIn, useSession } from 'next-auth/react';
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

function countByStatus(projects: ReleaseWorld[], status: string) {
  return projects.filter((project) => project.status === status).length;
}

function countByVisibility(projects: ReleaseWorld[], visibility: string) {
  return projects.filter((project) => project.visibility === visibility).length;
}

function getPhaseLabel(index: number) {
  if (index === 0) return 'Active';
  if (index === 1) return 'Recent';
  if (index === 2) return 'Next';
  return 'Archive';
}

function getProjectSummary(project?: ReleaseWorld | null) {
  return (
    project?.oneLineSummary?.trim() ||
    project?.story?.trim() ||
    'Build the release world: page, board, rollout, hooks, notes, visuals, and public portal.'
  );
}

export default function CreatorDashboardPage() {
  const { status } = useSession();

  const { data, loading, error, refetch } = useQuery(CREATOR_HOME_QUERY, {
    skip: status !== 'authenticated',
    fetchPolicy: 'cache-and-network',
  });

  const profiles: CreativeProfile[] = data?.myCreativeProfiles ?? [];
  const projects: ReleaseWorld[] = data?.myReleaseWorlds ?? [];

  const activeProfile = profiles[0] ?? null;
  const activeProject = projects[0] ?? null;
  const recentProjects = projects.slice(0, 4);

  const commandLinks = activeProject
    ? [
        {
          label: 'Release',
          href: `/releases/${activeProject.slug}`,
          meta: 'Public',
        },
        {
          label: 'Board',
          href: `/releases/${activeProject.slug}/board`,
          meta: 'Creative',
        },
        {
          label: 'Projects',
          href: '/creator/projects',
          meta: 'Library',
        },
        {
          label: 'Nexus',
          href: '/nexus',
          meta: 'Hub',
        },
      ]
    : [
        {
          label: 'Projects',
          href: '/creator/projects',
          meta: 'Library',
        },
        {
          label: 'Nexus',
          href: '/nexus',
          meta: 'Hub',
        },
      ];

  if (status === 'loading') {
    return (
      <main className="creator-console-shell">
        <aside className="creator-console-rail" aria-label="Creator console rail">
          <div className="creator-console-mark">C</div>
          <p>Creator OS</p>
        </aside>

        <section className="creator-console">
          <header className="creator-console-header">
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

            <button type="button" className="creator-console-status" onClick={() => signIn('github')}>
              <span>Auth</span>
              <strong>Sign in with GitHub</strong>
              <em>Required for Mongo-backed creator data</em>
            </button>
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
        <header className="creator-console-header">
          <div>
            <p className="creator-console-kicker">Creator Command Center</p>
            <h1>{activeProject?.title ?? 'Creator OS'}</h1>
            <p>
              {activeProject
                ? getProjectSummary(activeProject)
                : 'Create your first release world, then use the board and release page to build the project outward.'}
            </p>
          </div>

          <div className="creator-console-status">
            <span>{activeProject ? activeProject.status : 'ready'}</span>
            <strong>
              {activeProject
                ? `${activeProject.currentFocus || 'Focus TBD'} → ${
                    activeProject.secondFocus || 'Second signal TBD'
                  }`
                : activeProfile?.artistName || 'No active project'}
            </strong>
            <em>
              {activeProject
                ? `${formatLabel(activeProject.releaseType)} · ${formatDate(activeProject.fullDropDate)}`
                : 'Start in Project Library'}
            </em>
          </div>
        </header>

        <section className="creator-console-topline" aria-label="Creator stats">
          <article>
            <span>Projects</span>
            <strong>{projects.length}</strong>
            <p>Release worlds in Mongo.</p>
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
        </section>

        <section className="creator-console-grid">
          <article className="creator-console-panel">
            <p className="creator-console-kicker">Next Move</p>
            <h2>{activeProject ? 'Continue the active world' : 'Create the first world'}</h2>

            <div className="creator-console-action-list">
              {activeProject ? (
                <>
                  <div>
                    <span />
                    <p>Open the Signal Board and add the next hook, visual idea, or rollout note.</p>
                  </div>
                  <div>
                    <span />
                    <p>Review the generated Release Page and tighten the public story.</p>
                  </div>
                  <div>
                    <span />
                    <p>Use Project Library to create another EP, single, album, or campaign.</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span />
                    <p>Create a ReleaseWorld from the Project Library.</p>
                  </div>
                  <div>
                    <span />
                    <p>Open its board and save the first creative notes.</p>
                  </div>
                  <div>
                    <span />
                    <p>Publish or keep private when the portal is ready.</p>
                  </div>
                </>
              )}
            </div>

            <div className="creator-console-focus">
              <p>Creator profile</p>
              <strong>
                {activeProfile
                  ? `${activeProfile.artistName} · ${activeProfile.isPublic ? 'Public' : 'Private'}`
                  : 'No CreativeProfile found yet.'}
              </strong>
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
                recentProjects.map((project) => (
                  <div key={project.id}>
                    <span>{project.status}</span>
                    <p>{project.title}</p>
                  </div>
                ))
              ) : (
                <div>
                  <span>empty</span>
                  <p>No projects yet. Create one in Project Library.</p>
                </div>
              )}
            </div>
          </article>

          <article className="creator-console-panel">
            <p className="creator-console-kicker">Portals</p>
            <h2>Open views</h2>

            <div className="creator-console-links">
              {commandLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span>{link.label}</span>
                  <em>{link.meta}</em>
                </Link>
              ))}
            </div>

            <p className="creator-console-note">
              Project Library creates worlds. Release pages present worlds. Signal Boards build worlds.
            </p>
          </article>
        </section>

        <section className="creator-console-grid creator-console-grid-balanced">
          <article className="creator-console-panel creator-console-wide">
            <p className="creator-console-kicker">Recent Worlds</p>
            <h2>Continue building</h2>

            <div className="creator-next-assets">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="creator-next-asset-card">
                    <span>{formatLabel(project.releaseType)}</span>
                    <strong>{project.title}</strong>
                    <p>{project.oneLineSummary || project.story || 'No summary yet.'}</p>
                    <code>/{project.slug}</code>
                    <div className="creator-console-links">
                      <Link href={`/releases/${project.slug}`}>Page</Link>
                      <Link href={`/releases/${project.slug}/board`}>Board</Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="creator-next-asset-card">
                  <span>start</span>
                  <strong>Create a project</strong>
                  <p>Your next EP, single, album, campaign, or client world starts here.</p>
                  <code>/creator/projects</code>
                </div>
              )}
            </div>
          </article>

          <article className="creator-console-panel">
            <p className="creator-console-kicker">Flow</p>
            <h2>Creator loop</h2>

            <div className="creator-console-phases">
              {[
                {
                  title: 'Create',
                  body: 'Start a ReleaseWorld in Project Library.',
                },
                {
                  title: 'Build',
                  body: 'Shape hooks, notes, visuals, and rollout in the board.',
                },
                {
                  title: 'Present',
                  body: 'Use the release page as the public-facing portal.',
                },
                {
                  title: 'Expand',
                  body: 'Repeat for the next EP, single, album, or campaign.',
                },
              ].map((beat, index) => (
                <div key={beat.title}>
                  <span>{getPhaseLabel(index)}</span>
                  <div>
                    <strong>{beat.title}</strong>
                    <p>{beat.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="creator-console-grid creator-console-grid-bottom">
          <article className="creator-console-panel creator-console-wide">
            <p className="creator-console-kicker">Release Worlds</p>
            <h2>Project path</h2>

            <div className="creator-console-track-strip">
              {projects.length > 0 ? (
                projects.slice(0, 6).map((project, index) => (
                  <div key={project.id}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{project.title}</strong>
                    <p>
                      {formatLabel(project.status)} · {formatLabel(project.visibility)}
                    </p>
                  </div>
                ))
              ) : (
                <div>
                  <span>00</span>
                  <strong>No release worlds yet</strong>
                  <p>Create one in Project Library.</p>
                </div>
              )}
            </div>
          </article>

          <article className="creator-console-panel">
            <p className="creator-console-kicker">Minimum viable</p>
            <h2>Do not overbuild</h2>

            <div className="creator-console-pill-list">
              {[
                'Create project',
                'Open board',
                'Save 3 notes',
                'Review page',
                'Repeat',
              ].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        </section>

        <footer className="creator-console-footer">
          <p>
            Workflow: create release world → shape the signal board → polish the release page →
            return to Creator OS for the next move.
          </p>
        </footer>
      </section>
    </main>
  );
}