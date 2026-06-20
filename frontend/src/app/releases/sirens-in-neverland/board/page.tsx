import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  getSirensAssetById,
  sirensBoardPins,
  sirensDoOverClips,
  sirensMinimumViableRollout,
  sirensRelease,
  sirensRolloutDates,
  sirensSecondSingleClips,
  type SirensAsset,
} from '@/lib/releases/sirensInNeverland';
import '@/styles/signalBoard.css';

type BoardPin = (typeof sirensBoardPins)[number];

function isDisplayReadyAsset(asset: SirensAsset | null) {
  return Boolean(asset?.src && asset.status !== 'needed');
}

function BoardPinVisual({ pin }: { pin: BoardPin }) {
  const asset = getSirensAssetById(pin.assetId);

  if (!isDisplayReadyAsset(asset) || !asset?.src) {
    if (!pin.assetId) return null;

    return (
      <div className="signal-board-pin-asset signal-board-pin-asset-needed">
        <span>{asset?.status ?? 'needed'}</span>
      </div>
    );
  }

  return (
    <div className="signal-board-pin-asset">
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        sizes="220px"
        className="signal-board-pin-image"
      />
    </div>
  );
}

function BoardPinCard({ pin }: { pin: BoardPin }) {
  const style = {
    '--pin-x': `${pin.x}%`,
    '--pin-y': `${pin.y}%`,
    '--pin-rotate': `${pin.rotate ?? 0}deg`,
  } as CSSProperties;

  const content = (
    <>
      <div className="signal-board-pin-cap" />
      <BoardPinVisual pin={pin} />
      <p className="signal-board-pin-eyebrow">{pin.eyebrow}</p>
      <h2>{pin.title}</h2>
      <p>{pin.body}</p>
      {pin.meta && <span>{pin.meta}</span>}
    </>
  );

  if (pin.href) {
    return (
      <Link href={pin.href} className={`signal-board-pin signal-board-pin-${pin.kind}`} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <article className={`signal-board-pin signal-board-pin-${pin.kind}`} style={style}>
      {content}
    </article>
  );
}

export default function SirensSignalBoardPage() {
  return (
    <main className="signal-board-shell">
      <section className="signal-board-hero">
        <p className="signal-board-kicker">Cosmic Release Board</p>
        <h1>SIRENS Signal Board</h1>
        <p>
          A living signal wall for {sirensRelease.title} — the six-track EP world,
          DoOver rollout, moon timing, content clips, assets, and realm portals mapped inside the Cosmic Nexus.
        </p>

        <div className="signal-board-actions">
          <Link href="/releases/sirens-in-neverland">Release Page</Link>
          <Link href="/creator">Creator Console</Link>
          <Link href="/nexus">Enter Nexus</Link>
        </div>
      </section>

      <section className="signal-board-frame" aria-label="SIRENS in Neverland signal board">
        <div className="signal-board-texture" />
        <div className="signal-board-thread signal-board-thread-a" />
        <div className="signal-board-thread signal-board-thread-b" />
        <div className="signal-board-thread signal-board-thread-c" />
        <div className="signal-board-thread signal-board-thread-d" />
        <div className="signal-board-thread signal-board-thread-e" />

        {sirensBoardPins.map((pin) => (
          <BoardPinCard key={pin.id} pin={pin} />
        ))}
      </section>

      <section className="signal-board-mobile-list" aria-label="Signal board pins">
        {sirensBoardPins.map((pin) => (
          <BoardPinCard key={`mobile-${pin.id}`} pin={{ ...pin, x: 0, y: 0, rotate: 0 }} />
        ))}
      </section>

      <section className="signal-board-bottom-grid">
        <article className="signal-board-panel">
          <p className="signal-board-panel-kicker">Moon Rhythm</p>
          <h2>Release by natural phase</h2>
          <div className="signal-board-phase-list">
            {sirensRolloutDates.map((step) => (
              <div key={`${step.date}-${step.title}`} className="signal-board-phase">
                <span>{step.date}</span>
                <div>
                  <h3>{step.label}: {step.title}</h3>
                  <p>{step.publicAction}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="signal-board-panel">
          <p className="signal-board-panel-kicker">DoOver Clips</p>
          <h2>Lead single content stack</h2>
          <div className="signal-board-chip-list">
            {sirensDoOverClips.map((clip) => (
              <span key={clip.id}>{clip.title}</span>
            ))}
          </div>

          <div className="signal-board-note">
            <h3>Main hook anchor</h3>
            <p>{sirensRelease.mainHookLines[0]}</p>
          </div>
        </article>
      </section>

      <section className="signal-board-bottom-grid">
        <article className="signal-board-panel">
          <p className="signal-board-panel-kicker">Second Single</p>
          <h2>running from the plug</h2>
          <div className="signal-board-chip-list">
            {sirensSecondSingleClips.map((clip) => (
              <span key={clip.id}>{clip.title}</span>
            ))}
          </div>

          <div className="signal-board-note">
            <h3>Purpose</h3>
            <p>
              The second single expands EP1 with more movement, urgency, edge,
              and contrast before the full world opens.
            </p>
          </div>
        </article>

        <article className="signal-board-panel">
          <p className="signal-board-panel-kicker">Minimum Viable Rollout</p>
          <h2>Do not overbuild</h2>
          <div className="signal-board-chip-list">
            {sirensMinimumViableRollout.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="signal-board-note">
            <h3>Future platform seed</h3>
            <p>
              This is the first proof of concept for creator worlds: a board becomes
              the messy creative origin, then the release page becomes the polished public portal.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
