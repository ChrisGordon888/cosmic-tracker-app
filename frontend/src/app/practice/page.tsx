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
