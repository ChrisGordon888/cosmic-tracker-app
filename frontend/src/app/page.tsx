import type { CSSProperties } from 'react';

import PublicAtmosphere from '@/components/public/PublicAtmosphere';
import Link from 'next/link';

import '@/styles/landingPage.css';

const COSMIC_CASCADE = [
  { letter: 'C', word: 'CREATE' },
  { letter: 'O', word: 'OBSERVE' },
  { letter: 'S', word: 'SENSE' },
  { letter: 'M', word: 'MOVE' },
  { letter: 'I', word: 'INTEGRATE' },
  { letter: 'C', word: 'CONNECT' },
];

const REALMS = [
  {
    sigil: '∴',
    name: 'Fractured Frontier',
    note: 'Pressure into motion',
  },
  {
    sigil: '◐',
    name: 'The Veil',
    note: 'Desire, mystery, signal',
  },
  {
    sigil: '☾',
    name: 'Moonlit Roads',
    note: 'Memory and return',
  },
  {
    sigil: '△',
    name: 'Skybound City',
    note: 'Ambition with direction',
  },
  {
    sigil: '◇',
    name: 'Astral Bazaar',
    note: 'Worth, focus, exchange',
  },
  {
    sigil: '∞',
    name: 'InterSiddhi',
    note: 'Center and source',
  },
];

export default function LandingPage() {
  return (
    <main className="landing-page public-surface">
      <PublicAtmosphere
        source="/cosmic/home/cosmic-sanctuary-ambient-loop-6s.mp4"
        poster="/cosmic/home/finalHomeCOSMIC.png"
        tone="home"
      />

      {/* ======================================================
          HERO
          ====================================================== */}
      <header className="landing-intro public-width">
        <p className="public-label">
          Christopher Gordon · artist / songwriter
        </p>

        <div className="landing-wordmark-stage">
          <h1
            className="landing-wordmark"
            aria-label="COSMIC"
          >
            {COSMIC_CASCADE.map((item, columnIndex) => (
              <span
                key={`${item.letter}-${item.word}`}
                className="landing-wordmark-column"
              >
                <span
                  className="landing-letter"
                  aria-hidden="true"
                >
                  {item.letter}
                </span>

                <span
                  className="landing-cascade-column"
                  aria-hidden="true"
                >
                  {item.word.split('').map((character, characterIndex) => (
                    <span
                      key={`${item.word}-${characterIndex}`}
                      className="landing-cascade-character"
                      style={
                        {
                          '--cascade-column-index': columnIndex,
                          '--cascade-character-index': characterIndex,
                        } as CSSProperties
                      }
                    >
                      {character}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </h1>
        </div>

        <p className="landing-cover-line">
          Music, release worlds, and creative tools for artists and producers.
        </p>
      </header>

      {/* ======================================================
          PRIMARY ENTRANCES
          ====================================================== */}
      <nav
        className="landing-doors public-width"
        aria-label="Find your way into COSMIC"
      >
        <Link
          href="/nexus"
          className="landing-door landing-door-listen"
        >
          <span className="public-label">
            Listen / discover
          </span>

          <strong>
            Nexus <span aria-hidden="true">↗</span>
          </strong>

          <p>
            Listen to COSMIC. Explore the songs and their worlds.
          </p>
        </Link>

        <Link
          href="/find-your-realm"
          className="landing-door landing-door-realm"
        >
          <span className="public-label">
            Not sure where to begin?
          </span>

          <strong>
            Find Your Realm <span aria-hidden="true">↗</span>
          </strong>

          <p>
            Find music that meets you where you are.
          </p>
        </Link>

        <Link
          href="/creator"
          className="landing-door landing-door-quiet"
        >
          <strong>
            Creator <span aria-hidden="true">↗</span>
          </strong>

          <p>
            Build and develop your work.
          </p>
        </Link>

        <Link
          href="/services"
          className="landing-door landing-door-quiet"
        >
          <strong>
            Services <span aria-hidden="true">↗</span>
          </strong>

          <p>
            Work with Christopher. Music, production and creative development.
          </p>
        </Link>
      </nav>

      {/* ======================================================
          REAL ARTIST PROOF
          ====================================================== */}
      <section
        id="artist-proof"
        className="landing-proof public-width"
        aria-labelledby="sirens-title"
      >
        <Link
          href="/releases/sirens-in-neverland"
          className="landing-artwork"
          aria-label="Enter SIRENS in Neverland"
        >
          <img
            src="/sirensInNeverland.jpg"
            alt="SIRENS in Neverland — original release artwork"
            width="220"
            height="220"
            loading="lazy"
          />
        </Link>

        <div className="landing-proof-copy">
          <p className="public-label">
            Current release world
          </p>

          <h2 id="sirens-title">
            SIRENS in Neverland
          </h2>

          <p>
            Six songs inside one world. An oceanic scrapbook of longing,
            repetition, fantasy and fate.
          </p>

          <Link
            href="/releases/sirens-in-neverland"
            className="public-link"
          >
            Enter SIRENS →
          </Link>
        </div>
      </section>

      {/* ======================================================
          REALM MAP

          The six Realms establish the architecture.

          They do NOT all pretend to be six different links while
          sending users to the same quiz.

          Nexus = explore intentionally.
          Find Your Realm = help me choose.
          ====================================================== */}
      <section
        className="landing-realm-map public-width"
        aria-labelledby="landing-realms-title"
      >
        <div className="landing-section-heading">
          <p className="public-label">
            The COSMIC map
          </p>

          <h2 id="landing-realms-title">
            Six realms. One universe.
          </h2>

          <p>
            Distinct territories for mood, sound, story and creative direction.
          </p>
        </div>

        <div
          className="landing-realms"
          role="list"
          aria-label="The six realms of COSMIC"
        >
          {REALMS.map((realm) => (
            <article
              key={realm.name}
              className="landing-realm"
              role="listitem"
              aria-label={`${realm.name} — ${realm.note}`}
            >
              <span
                className="landing-realm-sigil"
                aria-hidden="true"
              >
                {realm.sigil}
              </span>

              <div className="landing-realm-copy">
                <strong>
                  {realm.name}
                </strong>

                <small>
                  {realm.note}
                </small>
              </div>
            </article>
          ))}
        </div>

        <div className="landing-realm-actions">
          <Link
            href="/nexus"
            className="public-link"
          >
            Explore the Realms in Nexus →
          </Link>

          <Link
            href="/find-your-realm"
            className="public-link"
          >
            Find Your Realm →
          </Link>
        </div>
      </section>

      {/* ======================================================
          SECONDARY / QUIET PATHS
          ====================================================== */}
      <section
        className="landing-explore public-width"
        aria-label="Other ways into COSMIC"
      >
        <p className="public-label">
          Other ways in
        </p>

        <nav aria-label="More to explore">
          <Link href="/practice">
            <strong>
              Practice ↗
            </strong>

            <span>
              Make room for a creative rhythm.
            </span>
          </Link>

          <Link href="/scroll">
            <strong>
              Scroll ↗
            </strong>

            <span>
              Follow a thought. Find a reflection.
            </span>
          </Link>
        </nav>
      </section>
    </main>
  );
}