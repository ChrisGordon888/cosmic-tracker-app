"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import "@/styles/practicePage.css";
import CosmicClock from "@/components/CosmicClock";
import MoonPhaseCard from "@/components/MoonPhaseCard";
import SacredYesSection from "@/components/SacredYesSection";
import MoodSection from "@/components/MoodSection";
import PracticeQuestsSection from "@/components/PracticeQuestsSection";
import CosmicBackground from "@/components/CosmicBackground";

const PRACTICE_ROOMS = [
  {
    title: "Practice Calendar",
    eyebrow: "Moon / Mood / Quests",
    description:
      "Review your moods, completed quests, and moon phase patterns across time.",
    href: "/calendar",
    cta: "Open Calendar",
  },
  {
    title: "Ritual Library",
    eyebrow: "Daily Anchors",
    description:
      "Create, edit, and manage the rituals that keep your signal consistent.",
    href: "/rituals",
    cta: "Open Rituals",
  },
  {
    title: "Discipline Tracker",
    eyebrow: "Practice / Quests",
    description:
      "Track today’s ritual practices and add quests that strengthen your rhythm.",
    href: "/tracker",
    cta: "Open Tracker",
  },
  {
    title: "Cosmic Scroll",
    eyebrow: "Reflection / Lore",
    description:
      "Read traveler reflections and mythic writing connected to the realm system.",
    href: "/scroll",
    cta: "Read Scroll",
  },
];

const PRACTICE_PILLARS = [
  {
    label: "Body",
    title: "Training + Yoga",
    body: "Mobility, breath, strength, and physical devotion — the future home for coaching, movement, and performance services.",
  },
  {
    label: "Signal",
    title: "Mood + Sacred Yes",
    body: "Check the inner weather, name the honest yes, and keep the day aligned with what actually matters.",
  },
  {
    label: "Rhythm",
    title: "Quests + Accountability",
    body: "Daily practices, creative tasks, streaks, community circles, and future accountability layers.",
  },
];

export default function PracticePortal() {
  const { data: session, status } = useSession();
  const isAuthenticated = Boolean(session?.user);

  if (status === "loading") {
    return (
      <main className="practice-page practice-state-page">
        <CosmicBackground />
        <section className="practice-state-card">
          <p className="practice-kicker">Practice Portal</p>
          <h1>Opening your daily field...</h1>
          <p>Checking your session before loading the ritual layer.</p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="practice-page practice-state-page">
        <CosmicBackground />
        <section className="practice-state-card">
          <p className="practice-kicker">Private Practice Layer</p>
          <h1>Sign in to enter your practice portal.</h1>
          <p>
            This space holds mood, moon, sacred yes, quests, and the future accountability layer.
            The public music universe is still open through the Nexus.
          </p>
          <div className="practice-actions">
            <button type="button" onClick={() => signIn("github", { callbackUrl: "/practice" })}>
              Sign in with GitHub
            </button>
            <Link href="/nexus">Enter the Nexus</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="practice-page">
      <CosmicBackground />

      <section className="practice-hero">
        <div className="practice-hero-copy">
          <p className="practice-kicker">Practice Portal</p>
          <h1>Daily rhythm for body, signal, and creative alignment.</h1>
          <p>
            A private layer for checking the moon, naming the mood, choosing the sacred yes,
            and keeping your practice connected to the larger Cosmic world.
          </p>
        </div>

        <div className="practice-hero-panel">
          <span>Now online</span>
          <CosmicClock className="practice-clock" />
          <div className="practice-hero-links">
            <Link href="/nexus">Nexus</Link>
            <Link href="/creator/projects">Projects</Link>
            <Link href="/creator">Creator OS</Link>
          </div>
        </div>
      </section>

      <section className="practice-room-section" aria-labelledby="practice-room-heading">
        <div className="practice-section-heading">
          <p className="practice-kicker">Practice Rooms</p>
          <h2 id="practice-room-heading">Choose the layer you need today.</h2>
          <p>
            Calendar, rituals, tracker, and scroll are now connected as rooms inside the Practice pillar.
          </p>
        </div>

        <div className="practice-room-grid" aria-label="Practice rooms">
          {PRACTICE_ROOMS.map((room) => (
            <Link key={room.href} href={room.href} className="practice-room-card">
              <span>{room.eyebrow}</span>
              <h3>{room.title}</h3>
              <p>{room.description}</p>
              <strong>{room.cta}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="practice-pillar-grid" aria-label="Practice pillars">
        {PRACTICE_PILLARS.map((pillar) => (
          <article key={pillar.title} className="practice-pillar-card">
            <span>{pillar.label}</span>
            <h2>{pillar.title}</h2>
            <p>{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="practice-dashboard-grid">
        <div className="practice-module practice-module-wide">
          <div className="practice-module-heading">
            <p className="practice-kicker">Moon</p>
            <h2>Read the atmosphere.</h2>
          </div>
          <MoonPhaseCard />
        </div>

        <div className="practice-module">
          <div className="practice-module-heading">
            <p className="practice-kicker">Sacred Yes</p>
            <h2>Choose the honest signal.</h2>
          </div>
          <SacredYesSection />
        </div>

        <div className="practice-module">
          <div className="practice-module-heading">
            <p className="practice-kicker">Mood</p>
            <h2>Name the inner weather.</h2>
          </div>
          <MoodSection />
        </div>

        <div className="practice-module practice-module-wide">
          <div className="practice-module-heading">
            <p className="practice-kicker">Practice Quests</p>
            <h2>Keep the day in motion.</h2>
          </div>
          <PracticeQuestsSection />
        </div>
      </section>

      <section className="practice-coming-soon">
        <div>
          <p className="practice-kicker">Future Service Layer</p>
          <h2>Training, yoga, accountability, and creative practice can live here.</h2>
          <p>
            This is the seed for personal training, yoga flows, artist development, daily rituals,
            community challenges, and practice-based offerings under the Cosmic umbrella.
          </p>
        </div>
        <Link href="/nexus">Return to the Nexus</Link>
      </section>
    </main>
  );
}
