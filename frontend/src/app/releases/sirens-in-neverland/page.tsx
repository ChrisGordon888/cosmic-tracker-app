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

function isReadyAsset(asset: SirensAsset | null) {
  return Boolean(asset?.src && asset.status !== 'needed');
}

function ReleaseArtwork() {
  const coverAsset = getSirensAssetById(sirensRelease.coverAssetId);

  if (isReadyAsset(coverAsset) && coverAsset?.src) {
    return (
      <figure className="sirens-artwork sirens-artwork-image">
        <Image
          src={coverAsset.src}
          alt={coverAsset.alt}
          fill
          priority
          sizes="(max-width: 920px) 82vw, 360px"
          className="sirens-artwork-img"
        />
        <figcaption>
          <span>{sirensRelease.artist.displayName}</span>
          <strong>{sirensRelease.title}</strong>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="sirens-artwork sirens-artwork-placeholder" aria-label="SIRENS in Neverland cover placeholder">
      <div className="sirens-artwork-orbit" />
      <div className="sirens-artwork-title">
        <span>{sirensRelease.artist.displayName}</span>
        <strong>SIRENS</strong>
        <em>in Neverland</em>
      </div>
      <figcaption>
        <span>Cover asset</span>
        <strong>awaiting final artwork</strong>
      </figcaption>
    </figure>
  );
}

export default function SirensReleasePage() {
  const leadSingle = sirensTracks.find((track) => track.status === 'focus-single');
  const secondSingle = sirensTracks.find((track) => track.status === 'second-single');
  const heroHook = sirensRelease.mainHookLines[0];

  return (
    <main className="sirens-page">
      <section className="sirens-hero">
        <div className="sirens-hero-grid">
          <div className="sirens-hero-copy">
            <p className="sirens-label">{sirensRelease.releaseType} / Release World</p>
            <h1>
              <span>SIRENS</span>
              <em>in Neverland</em>
            </h1>
            <p className="sirens-hero-summary">{sirensRelease.oneLineSummary}</p>

            <div className="sirens-hero-actions">
              <a aria-disabled="true">Listen soon</a>
              <Link href="/releases/sirens-in-neverland/board">Open signal board</Link>
            </div>
          </div>

          <div className="sirens-hero-art">
            <ReleaseArtwork />
          </div>
        </div>

        <div className="sirens-meta-strip" aria-label="Release metadata">
          <div>
            <span>Artist</span>
            <strong>{sirensRelease.artist.displayName}</strong>
          </div>
          <div>
            <span>Lead single</span>
            <strong>{sirensRelease.currentFocus}</strong>
          </div>
          <div>
            <span>Second signal</span>
            <strong>{sirensRelease.secondFocus ?? 'running from the plug'}</strong>
          </div>
          <div>
            <span>World opens</span>
            <strong>{sirensRelease.fullDrop ?? 'July 29'}</strong>
          </div>
        </div>
      </section>

      <section className="sirens-hook-band" aria-label="Main hook">
        <p>{heroHook}</p>
      </section>

      <section className="sirens-story-section">
        <div className="sirens-section-heading">
          <p className="sirens-label">The world</p>
          <h2>Not just a project. A place.</h2>
        </div>
        <p>{sirensRelease.story}</p>
      </section>

      <section className="sirens-single-path">
        <div className="sirens-section-heading">
          <p className="sirens-label">Release path</p>
          <h2>Front door, fracture, full myth.</h2>
        </div>

        <div className="sirens-path-list">
          <article>
            <span>01</span>
            <div>
              <h3>{leadSingle?.displayTitle ?? 'DoOver'}</h3>
              <p>
                The emotional front door: direct, repeatable, hypnotic, and built around the need
                to replay a moment before it disappears.
              </p>
            </div>
          </article>

          <article>
            <span>02</span>
            <div>
              <h3>{secondSingle?.displayTitle ?? 'running from the plug'}</h3>
              <p>
                The contrast signal: movement, urgency, nighttime pressure, and the rupture that
                proves the world is bigger than softness.
              </p>
            </div>
          </article>

          <article>
            <span>03</span>
            <div>
              <h3>{sirensRelease.title}</h3>
              <p>
                The completed emotional universe: fantasy, warning signs, desire, memory,
                and the beautiful danger of wanting one more chance.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="sirens-track-section">
        <div className="sirens-section-heading">
          <p className="sirens-label">Track sequence</p>
          <h2>Six signals from the waterline.</h2>
        </div>

        <div className="sirens-track-list">
          {sirensTracks.map((track) => (
            <article key={track.slug}>
              <span>{track.number}</span>
              <div>
                <h3>{track.displayTitle}</h3>
                <p>{track.role}</p>
              </div>
              <em>{track.realmName}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="sirens-rollout-section">
        <div className="sirens-section-heading">
          <p className="sirens-label">Moon rhythm</p>
          <h2>Rollout cadence.</h2>
        </div>

        <div className="sirens-rollout-list">
          {sirensRolloutDates.map((beat) => (
            <article key={`${beat.date}-${beat.title}`}>
              <span>{beat.date}</span>
              <div>
                <h3>{beat.title}</h3>
                <p>{beat.publicAction}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sirens-portal">
        <div>
          <p className="sirens-label">Behind the release</p>
          <h2>Enter the board where the world is still forming.</h2>
          <p>
            The release page is the polished portal. The Signal Board is the messy mythology:
            notes, asset fragments, moon timing, realm links, and content direction.
          </p>
        </div>
        <Link href="/releases/sirens-in-neverland/board">Open signal board</Link>
      </section>
    </main>
  );
}
