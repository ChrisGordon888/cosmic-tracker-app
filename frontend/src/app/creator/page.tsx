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
  { label: 'Release', href: '/releases/sirens-in-neverland', meta: 'Public' },
  { label: 'Board', href: '/releases/sirens-in-neverland/board', meta: 'Creative' },
  { label: 'Nexus', href: '/nexus', meta: 'Hub' },
];

const statusOrder: SirensAsset['status'][] = ['needed', 'draft', 'selected', 'locked'];

function countAssetsByStatus(status: SirensAsset['status']) {
  return sirensAssets.filter((asset) => asset.status === status).length;
}

function getFileNameFromAsset(asset: SirensAsset) {
  if (!asset.src) return 'filename-needed';
  return asset.src.split('/').pop() ?? asset.src;
}

function getNextAssetsToFinish() {
  return sirensAssets
    .filter((asset) => asset.status === 'needed' || asset.status === 'draft')
    .slice(0, 4);
}

function getPhaseLabel(index: number) {
  if (index === 0) return 'Seed';
  if (index === 1) return 'Open';
  if (index === 2) return 'Charge';
  return 'Release';
}

export default function CreatorDashboardPage() {
  const focusTrack = sirensTracks.find((track) => track.status === 'focus-single');
  const secondSingle = sirensTracks.find((track) => track.status === 'second-single');
  const nextAssets = getNextAssetsToFinish();

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
            <p className="creator-console-kicker">Active Release World</p>
            <h1>{sirensRelease.title}</h1>
            <p>
              Private control view for the rollout. Keep it clean, useful, and fast:
              what is live, what is missing, and what needs to be finished next.
            </p>
          </div>

          <div className="creator-console-status">
            <span>{sirensRelease.status}</span>
            <strong>{sirensRelease.currentFocus} → {sirensRelease.secondFocus ?? 'Second single'}</strong>
            <em>EP drop {sirensRelease.fullDrop ?? 'TBD'}</em>
          </div>
        </header>

        <section className="creator-console-topline" aria-label="Release stats">
          <article>
            <span>Tracks</span>
            <strong>{sirensRelease.trackCount}</strong>
            <p>Six-track EP world.</p>
          </article>

          <article>
            <span>Focus</span>
            <strong>{focusTrack?.displayTitle ?? sirensRelease.currentFocus}</strong>
            <p>Lead single / front door.</p>
          </article>

          <article>
            <span>Assets</span>
            <strong>{countAssetsByStatus('locked')} locked</strong>
            <p>{countAssetsByStatus('needed')} still needed.</p>
          </article>
        </section>

        <section className="creator-console-grid">
          <article className="creator-console-panel">
            <p className="creator-console-kicker">Next Move</p>
            <h2>Finish the front door</h2>
            <div className="creator-console-action-list">
              <div><span /><p>Lock final {focusTrack?.displayTitle ?? 'DoOver'} audio.</p></div>
              <div><span /><p>Choose the strongest single cover direction.</p></div>
              <div><span /><p>Export the hero hook clip and lyric scrapbook clip.</p></div>
            </div>
            <div className="creator-console-focus">
              <p>Contrast signal</p>
              <strong>{secondSingle?.displayTitle ?? 'running from the plug'} brings motion, danger, and edge.</strong>
            </div>
          </article>

          <article className="creator-console-panel">
            <p className="creator-console-kicker">Asset Monitor</p>
            <h2>Creative status</h2>
            <div className="creator-asset-status-grid">
              {statusOrder.map((status) => (
                <div key={status}>
                  <span>{status}</span>
                  <strong>{countAssetsByStatus(status)}</strong>
                </div>
              ))}
            </div>

            <div className="creator-asset-mini-list">
              {sirensAssets.slice(0, 4).map((asset) => (
                <div key={asset.id}>
                  <span>{asset.status}</span>
                  <p>{asset.title}</p>
                </div>
              ))}
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
              Keep these hidden until the public-facing pages feel polished.
            </p>
          </article>
        </section>

        <section className="creator-console-grid creator-console-grid-balanced">
          <article className="creator-console-panel creator-console-wide">
            <p className="creator-console-kicker">Asset Intake</p>
            <h2>Next files to gather</h2>
            <code className="creator-console-path">public/images/releases/sirens-in-neverland/</code>

            <div className="creator-next-assets">
              {nextAssets.map((asset) => (
                <div key={asset.id} className="creator-next-asset-card">
                  <span>{asset.status}</span>
                  <strong>{asset.title}</strong>
                  <p>{asset.description}</p>
                  <code>{getFileNameFromAsset(asset)}</code>
                </div>
              ))}
            </div>
          </article>

          <article className="creator-console-panel">
            <p className="creator-console-kicker">Moon Path</p>
            <h2>Rollout cadence</h2>
            <div className="creator-console-phases">
              {sirensRolloutDates.map((beat, index) => (
                <div key={`${beat.date}-${beat.title}`}>
                  <span>{beat.date}</span>
                  <div>
                    <strong>{getPhaseLabel(index)}</strong>
                    <p>{beat.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="creator-console-grid creator-console-grid-bottom">
          <article className="creator-console-panel creator-console-wide">
            <p className="creator-console-kicker">Track Path</p>
            <h2>Six signals</h2>
            <div className="creator-console-track-strip">
              {sirensTracks.map((track) => (
                <div key={track.slug}>
                  <span>{track.number}</span>
                  <strong>{track.displayTitle}</strong>
                  <p>{track.role}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="creator-console-panel">
            <p className="creator-console-kicker">Minimum viable</p>
            <h2>Do not overbuild</h2>
            <div className="creator-console-pill-list">
              {sirensMinimumViableRollout.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        </section>

        <footer className="creator-console-footer">
          <p>
            Workflow: add rough asset → mark draft → choose best version → mark selected → final export becomes locked.
          </p>
        </footer>
      </section>
    </main>
  );
}
