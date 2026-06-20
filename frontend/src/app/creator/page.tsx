import Link from 'next/link';
import {
  sirensMinimumViableRollout,
  sirensRelease,
  sirensRolloutDates,
  sirensTracks,
} from '@/lib/releases/sirensInNeverland';
import '@/styles/creator.css';

const quickLinks = [
  { label: 'Release', href: '/releases/sirens-in-neverland' },
  { label: 'Board', href: '/releases/sirens-in-neverland/board' },
  { label: 'Nexus', href: '/nexus' },
];

const nextActions = [
  'Lock final DoOver audio',
  'Lock DoOver cover',
  'Choose 3 strongest clips',
];

const assetGaps = [
  'EP cover',
  'DoOver cover',
  'running from the plug cover',
  'Hero hook clip',
  'Lyric scrapbook clip',
  'Performance clip',
];

function getPhaseLabel(index: number) {
  if (index === 0) return 'Reveal';
  if (index === 1) return 'Single 01';
  if (index === 2) return 'Single 02';
  return 'EP Drop';
}

export default function CreatorDashboardPage() {
  const focusTrack = sirensTracks.find((track) => track.status === 'focus-single');
  const secondSingle = sirensTracks.find((track) => track.status === 'second-single');
  const epDrop = sirensRolloutDates[sirensRolloutDates.length - 1];

  return (
    <main className="creator-console-shell">
      <aside className="creator-console-rail" aria-label="Creator console navigation">
        <div className="creator-console-mark">C</div>
        <div className="creator-console-rail-lines">
          <span />
          <span />
          <span />
        </div>
        <p>Creator OS</p>
      </aside>

      <section className="creator-console">
        <header className="creator-console-header">
          <div>
            <p className="creator-console-kicker">Private release command</p>
            <h1>Creator Dashboard</h1>
            <p>
              A minimal control room for what matters next: DoOver, the SIRENS rollout,
              the hidden pages, and the assets that make the world feel real.
            </p>
          </div>

          <div className="creator-console-status">
            <span>Active world</span>
            <strong>{sirensRelease.title}</strong>
            <em>{sirensRelease.status}</em>
          </div>
        </header>

        <section className="creator-console-topline">
          <article>
            <span>Now</span>
            <strong>{focusTrack?.displayTitle ?? 'DoOver'}</strong>
            <p>Lead single / emotional front door</p>
          </article>

          <article>
            <span>Next</span>
            <strong>{secondSingle?.displayTitle ?? 'running from the plug'}</strong>
            <p>Second single / energy expansion</p>
          </article>

          <article>
            <span>Target</span>
            <strong>{epDrop?.date ?? 'July 29'}</strong>
            <p>Full EP world opens</p>
          </article>
        </section>

        <section className="creator-console-grid">
          <article className="creator-console-panel creator-console-today">
            <div className="creator-console-panel-head">
              <p className="creator-console-kicker">Today</p>
              <h2>Next actions</h2>
            </div>

            <div className="creator-console-action-list">
              {nextActions.map((action) => (
                <div key={action}>
                  <span />
                  <p>{action}</p>
                </div>
              ))}
            </div>

            <div className="creator-console-focus">
              <p>Main hook anchor</p>
              <strong>{sirensRelease.mainHookLines[0]}</strong>
            </div>
          </article>

          <article className="creator-console-panel">
            <div className="creator-console-panel-head">
              <p className="creator-console-kicker">Rollout</p>
              <h2>Phase map</h2>
            </div>

            <div className="creator-console-phases">
              {sirensRolloutDates.map((phase, index) => (
                <div key={`${phase.date}-${phase.title}`}>
                  <span>{phase.date}</span>
                  <div>
                    <strong>{getPhaseLabel(index)}</strong>
                    <p>{phase.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="creator-console-panel">
            <div className="creator-console-panel-head">
              <p className="creator-console-kicker">Portals</p>
              <h2>Hidden pages</h2>
            </div>

            <div className="creator-console-links">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                  <span>↗</span>
                </Link>
              ))}
            </div>

            <p className="creator-console-note">
              Keep these hidden until the pages have real images, final copy, and a complete visual pass.
            </p>
          </article>
        </section>

        <section className="creator-console-grid creator-console-grid-bottom">
          <article className="creator-console-panel creator-console-wide">
            <div className="creator-console-panel-head">
              <p className="creator-console-kicker">Track world</p>
              <h2>Six-track EP</h2>
            </div>

            <div className="creator-console-track-strip">
              {sirensTracks.map((track) => (
                <div key={track.slug}>
                  <span>{track.number}</span>
                  <strong>{track.displayTitle}</strong>
                  <p>{track.realmName}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="creator-console-panel">
            <div className="creator-console-panel-head">
              <p className="creator-console-kicker">Missing</p>
              <h2>Asset gaps</h2>
            </div>

            <div className="creator-console-pill-list">
              {assetGaps.map((asset) => (
                <span key={asset}>{asset}</span>
              ))}
            </div>
          </article>
        </section>

        <section className="creator-console-footer">
          <p>
            Minimum viable rollout:
            {' '}
            {sirensMinimumViableRollout.join(' · ')}
          </p>
        </section>
      </section>
    </main>
  );
}
