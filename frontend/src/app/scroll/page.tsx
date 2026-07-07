"use client";

import Link from "next/link";
import "@/styles/scrollPage.css";

const MIRRORS = [
  {
    number: "I",
    title: "The Mirror of the World",
    subtitle: "The Mirror of Matter",
    realms: "303 / 44",
    body:
      "This is what the eyes see first: pressure, movement, ambition, money, tension, desire, performance. The battlefield of 303. The marketplace of 44. It reflects what is happening around you — but not the whole of who you are.",
    question: "Where am I reacting to the world instead of listening through it?",
  },
  {
    number: "II",
    title: "The Silver Mirror",
    subtitle: "The Mirror of Identity",
    realms: "101 / 55",
    body:
      "This is the mirror you hold to yourself, shaped by memory, story, longing, status, and survival. In 101, the past calls you back. In 55, the image asks to be mastered. The question becomes: who are you without the echo?",
    question: "What version of me am I still performing?",
  },
  {
    number: "III",
    title: "The Obsidian Mirror",
    subtitle: "The Mirror of Source",
    realms: "202 / 0",
    body:
      "No bright reflection. No easy answer. Only absorption. This is the black screen, the void, the portal. The Veil pulls you inward; InterSiddhi returns you to center. To look into it is to forget the false signal — and remember the living one.",
    question: "What remains when the noise goes quiet?",
  },
];

export default function CosmicScroll() {
  return (
    <main className="scroll-page">
      <div className="scroll-background" aria-hidden="true">
        <div className="scroll-orb scroll-orb-a" />
        <div className="scroll-orb scroll-orb-b" />
        <div className="scroll-grid" />
      </div>

      <section className="scroll-hero">
        <div className="scroll-nav">
          <Link href="/practice">Practice Portal</Link>
          <Link href="/nexus">Nexus</Link>
        </div>

        <p className="scroll-kicker">Traveler Scroll</p>

        <h1>
          Reflections of
          <span>the Traveler</span>
        </h1>

        <p className="scroll-subtitle">The Three Mirrors of Becoming</p>

        <p className="scroll-intro">
          Before there were realms, there were reflections. Before the map, there was the
          moment you noticed yourself watching, reacting, surviving, searching. Then
          something cracked open. Something called. The journey did not begin with an answer.
          It began with a mirror.
        </p>
      </section>

      <section className="scroll-mirror-list" aria-label="The Three Mirrors">
        {MIRRORS.map((mirror) => (
          <article key={mirror.number} className="scroll-mirror-card">
            <div className="scroll-mirror-number">
              <span>Mirror</span>
              <strong>{mirror.number}</strong>
            </div>

            <div className="scroll-mirror-copy">
              <p className="scroll-kicker">{mirror.realms}</p>
              <h2>{mirror.title}</h2>
              <h3>{mirror.subtitle}</h3>
              <p>{mirror.body}</p>

              <div className="scroll-question">
                <span>Reflection</span>
                <strong>{mirror.question}</strong>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="scroll-closing">
        <p className="scroll-kicker">Begin Again</p>
        <h2>Choose your mirror. Choose your realm. Return with signal.</h2>
        <p>
          The scroll is not separate from the practice. Read it, then move: enter the
          Nexus, return to your Practice Portal, or step into the realm that is calling.
        </p>

        <div className="scroll-actions">
          <Link href="/nexus">Enter the Nexus</Link>
          <Link href="/practice">Return to Practice</Link>
          <Link href="/realms/303">Enter 303</Link>
        </div>
      </section>
    </main>
  );
}