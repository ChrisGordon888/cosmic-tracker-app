import Image from 'next/image';
import Link from 'next/link';
import {
  getSirensAssetById,
  sirensRelease,
  sirensRolloutDates,
  sirensTracks,
  type SirensAsset,
} from '@/lib/releases/sirensInNeverland';
import '@/styles/sirensRelease.css';

function isDisplayReadyAsset(asset: SirensAsset | null) {
  return Boolean(asset?.src && asset.status !== 'needed');
}

function ReleaseCover() {
  const coverAsset = getSirensAssetById(sirensRelease.coverAssetId);

  if (isDisplayReadyAsset(coverAsset) && coverAsset?.src) {
    return (
      <div className="sirens-release-cover sirens-release-cover-has-image">
        <Image
          src={coverAsset.src}
          alt={coverAsset.alt}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 42vw"
          className="sirens-release-cover-image"
        />
        <div className="sirens-release-cover-sheen" />
        <div className="sirens-release-cover-title">
          <span>{sirensRelease.artist.displayName}</span>
          <strong>SIRENS</strong>
          <em>in Neverland</em>
        </div>
      </div>
    );
  }

  return (
    <div className="sirens-release-cover" aria-label="SIRENS in Neverland cover placeholder">
      <div className="sirens-release-cover-moon" />
      <div className="sirens-release-cover-title">
        <span>{sirensRelease.artist.displayName}</span>
        <strong>SIRENS</strong>
        <em>in Neverland</em>
      </div>
    </div>
  );
}

function TrackAssetBadge({ assetId }: { assetId?: string }) {
  const asset = getSirensAssetById(assetId);

  if (!asset) {
    return <span>Asset not assigned</span>;
  }

  return <span>{asset.status === 'needed' ? 'Visual needed' : `Visual ${asset.status}`}</span>;
}

export default function SirensReleasePage() {
  const leadSingle = sirensTracks.find((track) => track.status === 'focus-single');
  const secondSingle = sirensTracks.find((track) => track.status === 'second-single');
  return (
    <main className="sirens-release-shell">
      <section className="sirens-release-hero">
        <ReleaseCover />

        <div className="sirens-release-copy">
          <p className="sirens-release-kicker">{sirensRelease.releaseType} Release World</p>
          <h1>{sirensRelease.title}</h1>
          <p className="sirens-release-subtitle">{sirensRelease.oneLineSummary}</p>

          <div className="sirens-release-status">
            <span>{sirensRelease.status}</span>
            <span>{sirensRelease.trackCount} tracks</span>
            <span>{sirensRelease.currentFocus} first</span>
            <span>EP drop {sirensRelease.fullDrop}</span>
          </div>

          <div className="sirens-release-actions">
            <Link href="/releases/sirens-in-neverland/board">Open Signal Board</Link>
            <Link href="/nexus">Enter Nexus</Link>
            <a aria-disabled="true">Listen Coming Soon</a>
          </div>
        </div>
      </section>

      <section className="sirens-release-story">
        <p className="sirens-release-kicker">The Story</p>
        <h2>Not just a project. A place.</h2>
        <p>{sirensRelease.story}</p>
      </section>

      <section className="sirens-release-grid">
        <article className="sirens-release-panel">
          <div className="sirens-release-panel-heading">
            <p className="sirens-release-kicker">Tracklist</p>
            <h2>The six signals</h2>
          </div>

          <div className="sirens-tracklist">
            {sirensTracks.map((track) => (
              <div key={track.slug} className="sirens-track-card">
                <span className="sirens-track-number">{track.number}</span>
                <div>
                  <h3>{track.displayTitle}</h3>
                  <p>{track.note}</p>
                  <div className="sirens-track-meta">
                    <span>{track.role}</span>
                    <span>{track.realmName}</span>
                    <TrackAssetBadge assetId={track.coverAssetId} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="sirens-release-panel">
          <div className="sirens-release-panel-heading">
            <p className="sirens-release-kicker">Release Strategy</p>
            <h2>Three-phase world</h2>
          </div>

          <div className="sirens-realm-list">
            {sirensRolloutDates.map((beat) => (
              <div key={`${beat.date}-${beat.title}`} className="sirens-realm-card">
                <span>{beat.date}</span>
                <div>
                  <h3>{beat.title}</h3>
                  <p>{beat.goal}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="sirens-release-bottom">
        <article className="sirens-release-panel">
          <p className="sirens-release-kicker">Single Path</p>
          <h2>Front door, contrast, completion</h2>
          <div className="sirens-rollout-list">
            <div>
              <span>01</span>
              <p>
                <strong>{leadSingle?.displayTitle ?? 'DoOver'}</strong> opens the world as the emotional,
                replayable front door.
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                <strong>{secondSingle?.displayTitle ?? 'running from the plug'}</strong> expands the
                EP with motion, urgency, contrast, and edge.
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                <strong>{sirensRelease.title}</strong> lands as the complete emotional universe on {sirensRelease.fullDrop}.
              </p>
            </div>
          </div>
        </article>

        <article className="sirens-release-panel sirens-release-cta">
          <p className="sirens-release-kicker">Next Portal</p>
          <h2>Enter the board behind the release.</h2>
          <p>
            The Signal Board is the scrapbook layer: moon timing, content hooks,
            visual language, realm connections, and the hidden threads behind the EP.
          </p>
          <Link href="/releases/sirens-in-neverland/board">Open Signal Board</Link>
        </article>
      </section>
    </main>
  );
}
