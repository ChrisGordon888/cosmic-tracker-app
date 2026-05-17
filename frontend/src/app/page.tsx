// src/app/page.tsx
"use client";

import "@/styles/landingPage.css";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

const REALMS = [
  {
    id: "303",
    icon: "🌪️",
    name: "Fractured Frontier",
  },
  {
    id: "202",
    icon: "🕯️",
    name: "The Veil",
  },
  {
    id: "101",
    icon: "🌙",
    name: "Moonlit Roads",
  },
  {
    id: "55",
    icon: "⛰️",
    name: "Skybound City",
  },
  {
    id: "44",
    icon: "🛍️",
    name: "Astral Bazaar",
  },
  {
    id: "0",
    icon: "🌌",
    name: "InterSiddhi",
  },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  return (
    <main className="landing-page min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/cosmic-landing-intro.mp4" type="video/mp4" />
        </video>

        <div className="landing-video-overlay" />
      </div>

      <section className="landing-shell">
        <div className="landing-hero-card">
          <p className="landing-kicker">Music-Based Realm System</p>

          <h1 className="landing-title">
            COSMIC
            <span>MULTIVERSE</span>
          </h1>

          <p className="landing-subtitle">
            Six interconnected realms. Your music. Your journey.
          </p>

          <p className="landing-description">
            Explore sonic landscapes, enter emotional worlds, unlock realm paths,
            and move through a music-first experience built around transformation.
          </p>

          <div className="landing-actions">
            {isAuthenticated ? (
              <Link href="/nexus" className="landing-button-primary">
                Enter the Nexus
              </Link>
            ) : (
              <button
                onClick={() => signIn("github")}
                className="landing-button-primary"
              >
                Sign in to enter
              </button>
            )}
          </div>

          <div className="landing-realm-grid" aria-label="Cosmic realms">
            {REALMS.map((realm) => (
              <div key={realm.id} className="landing-realm-glyph" title={realm.name}>
                <span className="landing-realm-number">{realm.id}</span>
                <span className="landing-realm-icon">{realm.icon}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-future-card">
          <div className="landing-future-icon">📿</div>

          <div>
            <p className="landing-future-label">Future Layer</p>
            <h2>Ritual Layer</h2>
            <p>
              Daily rituals, sacred tracking, and lunar alignment are planned as
              future modules. Core realm journey is live now.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}