"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import MoonPhaseCard from "@/components/MoonPhaseCard";
import AddPracticeQuestForm from "@/components/AddPracticeQuestForm";
import RitualPracticeSection from "@/components/RitualPracticeSection";
import CosmicBackground from "@/components/CosmicBackground";
import "@/styles/trackerPage.css";

export default function TrackerPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="tracker-page practice-subpage tracker-state-page">
        <CosmicBackground />
        <section className="tracker-state-card">
          <p className="practice-subpage-kicker">Discipline Tracker</p>
          <h1>Loading your practice field...</h1>
          <p>Please wait while your ritual data comes online.</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="tracker-page practice-subpage tracker-state-page">
        <CosmicBackground />
        <section className="tracker-state-card">
          <p className="practice-subpage-kicker">Private Practice Layer</p>
          <h1>Sign in to view your tracker.</h1>
          <p>Your quests and ritual practices are part of the private Practice Portal.</p>
          <div className="practice-subpage-actions tracker-state-actions">
            <button type="button" onClick={() => signIn("github", { callbackUrl: "/tracker" })}>
              Sign in
            </button>
            <Link href="/practice">Practice Portal</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="tracker-page practice-subpage">
      <CosmicBackground />

      <section className="practice-subpage-hero tracker-hero">
        <div>
          <p className="practice-subpage-kicker">Discipline Tracker</p>
          <h1>Turn intention into daily motion.</h1>
          <p>
            Add quests, practice your rituals, and keep the day connected to your body, signal, and creative discipline.
          </p>
        </div>
        <div className="practice-subpage-actions">
          <Link href="/practice">Practice Portal</Link>
          <Link href="/calendar">Calendar</Link>
          <Link href="/rituals">Rituals</Link>
        </div>
      </section>

      <section className="tracker-flow-grid">
        <article>
          <span>01</span>
          <h2>Read the atmosphere</h2>
          <p>Start with the moon and notice the quality of the day.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Add the quest</h2>
          <p>Name the practical action that keeps your signal moving.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Practice the ritual</h2>
          <p>Return to the anchors that build trust with yourself.</p>
        </article>
      </section>

      <section className="tracker-module tracker-module-moon">
        <div className="tracker-section-heading">
          <p className="practice-subpage-kicker">Moon</p>
          <h2>Begin with the field.</h2>
        </div>
        <MoonPhaseCard />
      </section>

      <section className="tracker-module">
        <div className="tracker-section-heading">
          <p className="practice-subpage-kicker">Quest</p>
          <h2>Add today’s movement.</h2>
        </div>
        <AddPracticeQuestForm />
      </section>

      <section className="tracker-module">
        <div className="tracker-section-heading">
          <p className="practice-subpage-kicker">Ritual Practice</p>
          <h2>Complete the anchors.</h2>
        </div>
        <RitualPracticeSection />
      </section>

      <section className="tracker-note-card">
        <p>
          Strengthen your discipline by aligning daily quests with your core rituals. The tracker is the action layer of the Practice Portal.
        </p>
      </section>
    </main>
  );
}
