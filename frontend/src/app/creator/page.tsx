import Link from 'next/link';
import {
  sirensAssets,
  sirensMinimumViableRollout,
  sirensRelease,
  sirensRolloutDates,
  sirensTracks,
  type SirensAsset,
} from '@/lib/releases/sirensInNeverland';
import '@/styles/creator.css';

const commandLinks = [
  {
    label: 'Release',
    href: '/releases/sirens-in-neverland',
    meta: 'Public portal',
  },
  {
    label: 'Board',
    href: '/releases/sirens-in-neverland/board',
    meta: 'Creative wall',
  },
  {
    label: 'Nexus',
    href: '/nexus',
    meta: 'Main hub',
  },
];

const studioStats = [
  {
    label: 'Tracks',
    value: String(sirensRelease.trackCount),
  },
  {
    label: 'Focus',
    value: sirensRelease.currentFocus,
  },
  {
    label: 'Second',
    value: sirensRelease.secondFocus ?? 'TBD',
  },
  {
    label: 'Drop',
    value: sirensRelease.fullDrop ?? 'TBD',
  },
];

const statusOrder: SirensAsset['status'][] = ['needed', 'draft', 'selected', 'locked'];

function getPhaseTone(index: number) {
  if (index === 0) return 'Seed';
  if (index === 1) return 'Open';
  if (index === 2) return 'Charge';
  return 'Release';
}

function countAssetsByStatus(status: SirensAsset['status']) {
  return sirensAssets.filter((asset) => asset.status === status).length;
}

export default function CreatorDashboardPage() {
  const focusTrack = sirensTracks.find((track) => track.status === 'focus-single');
  const secondSingle = sirensTracks.find((track) => track.status === 'second-single');

  return (
    <main className="creator-command-shell">
      <section className="creator-command-card">
        <aside className="creator-sidebar">
          <p className="creator-kicker">Creator Console</p>
          <h1>COSMIC</h1>
          <p className="creator-sidebar-copy">
            Minimal command view for the SIRENS rollout. Keep the plan clear,
            the next move obvious, and the public pages hidden until polished.
          </p>

          <div className="creator-command-links">
            {commandLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span>{link.label}</span>
                <em>{link.meta}</em>
              </Link>
            ))}
          </div>
        </aside>

        <section className="creator-main">
          <div className="creator-topbar">
            <div>
              <p className="creator-kicker">Active world</p>
              <h2>{sirensRelease.title}</h2>
            </div>
            <span>{sirensRelease.status}</span>
          </div>

          <div className="creator-stat-strip">
            {studioStats.map((stat) => (
              <div key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          <section className="creator-focus-grid">
            <article className="creator-next-card">
              <p className="creator-kicker">Next move</p>
              <h3>Lock {focusTrack?.displayTitle ?? 'DoOver'} first.</h3>
              <p>
                Final audio, single cover, hero hook clip, lyric scrapbook clip,
                artist-presence clip, captions, and link assets.
              </p>
            </article>

            <article className="creator-signal-card">
              <p className="creator-kicker">Contrast signal</p>
              <h3>{secondSingle?.displayTitle ?? 'running from the plug'}</h3>
              <p>
                Use the second single to bring motion, urgency, danger, and edge
                before the full EP opens.
              </p>
            </article>
          </section>

          <section className="creator-asset-monitor">
            <div className="creator-asset-monitor-head">
              <div>
                <p className="creator-kicker">Asset Monitor</p>
                <h3>Make the world real</h3>
              </div>
              <span>{sirensAssets.length} assets</span>
            </div>

            <div className="creator-asset-status-grid">
              {statusOrder.map((status) => (
                <div key={status}>
                  <span>{status}</span>
                  <strong>{countAssetsByStatus(status)}</strong>
                </div>
              ))}
            </div>

            <div className="creator-asset-mini-list">
              {sirensAssets.slice(0, 5).map((asset) => (
                <div key={asset.id}>
                  <span>{asset.status}</span>
                  <p>{asset.title}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="creator-mini-timeline">
            {sirensRolloutDates.map((beat, index) => (
              <div key={`${beat.date}-${beat.title}`}>
                <span>{beat.date}</span>
                <strong>{getPhaseTone(index)}</strong>
                <p>{beat.title}</p>
              </div>
            ))}
          </section>

          <section className="creator-bottom-grid">
            <article>
              <p className="creator-kicker">Six-track path</p>
              <div className="creator-track-pills">
                {sirensTracks.map((track) => (
                  <span key={track.slug}>{track.displayTitle}</span>
                ))}
              </div>
            </article>

            <article>
              <p className="creator-kicker">Minimum viable rollout</p>
              <div className="creator-check-pills">
                {sirensMinimumViableRollout.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          </section>
        </section>
      </section>
    </main>
  );
}
