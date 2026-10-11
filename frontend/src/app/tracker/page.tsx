"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import MoonPhaseCard from "@/components/MoonPhaseCard";
import AddPracticeQuestForm from "@/components/AddPracticeQuestForm";
import RitualPracticeSection from "@/components/RitualPracticeSection";
import PracticeShell from "@/components/practice/PracticeShell";
import "@/styles/trackerPage.css";


export default function TrackerPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <PracticeShell className="tracker-page practice-subpage tracker-state-page">

        <section className="tracker-state-card">
          <p className="practice-subpage-kicker">Practice / Today</p>
          <h1>Loading your practice field...</h1>
          <p>Please wait while your ritual data comes online.</p>
        </section>
      </PracticeShell>
    );
  }

  if (!session) {
    return (
      <PracticeShell className="tracker-page practice-subpage tracker-state-page">

        <section className="tracker-state-card">
          <p className="practice-subpage-kicker">Private Practice Layer</p>
          <h1>Sign in to view your tracker.</h1>
          <p>Your quests and ritual practices are part of the private Practice Portal.</p>
          <div className="practice-subpage-actions tracker-state-actions">
            <Link href="/auth?callbackUrl=%2Ftracker">
              Sign in
            </Link>
            <Link href="/practice">Practice Portal</Link>
          </div>
        </section>
      </PracticeShell>
    );
  }

  return (
    <PracticeShell className="tracker-page practice-subpage">


      <section className="practice-subpage-hero tracker-hero">
        <div>
          <p className="practice-subpage-kicker">Practice / Today</p>
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
          <h2>Notice the cycle</h2>
          <p>Check the calculated lunar phase, then choose your own pace.</p>
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
          <h2>Today’s lunar estimate.</h2>
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
    </PracticeShell>
  );
}
