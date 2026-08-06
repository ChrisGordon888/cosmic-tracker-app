"use client";

import { getTodayMoonPhase } from "@/utils/moonPhases";
import "@/styles/moonPhaseCard.css";

const PHASE_GUIDANCE: Record<string, { title: string; guidance: string }> = {
  "New Moon": {
    title: "New Moon",
    guidance: "Choose the seed. Begin with clarity rather than force.",
  },
  "First Quarter": {
    title: "First Quarter",
    guidance: "Build momentum. Meet resistance with deliberate action.",
  },
  "Full Moon": {
    title: "Full Moon",
    guidance: "Notice what is illuminated, complete, or asking to be expressed.",
  },
  "Third Quarter": {
    title: "Third Quarter",
    guidance: "Review, release, and make room for the next cycle.",
  },
};

export default function MoonPhaseCard() {
  const todayMoon = getTodayMoonPhase();

  if (!todayMoon) {
    return (
      <section className="moon-phase-card" aria-live="polite">
        <p className="inner-status is-error">
          Today&apos;s moon phase could not be loaded.
        </p>
      </section>
    );
  }

  const phaseCopy = PHASE_GUIDANCE[todayMoon.phase] ?? {
    title: todayMoon.phase,
    guidance: "Notice the transition and work with the quality of the day.",
  };

  return (
    <section className="moon-phase-card" aria-labelledby="moon-phase-title">
      <div className="moon-phase-header">
        <div>
          <p className="moon-phase-eyebrow">Lunar atmosphere</p>
          <h2 id="moon-phase-title">{phaseCopy.title}</h2>
        </div>
        <span className="moon-icon" aria-hidden="true">
          {todayMoon.icon}
        </span>
      </div>

      <p className="moon-phase-guidance">{phaseCopy.guidance}</p>

      <div className="moon-phase-meta">
        <span>Date</span>
        <strong>{todayMoon.readableDate}</strong>
      </div>
    </section>
  );
}
