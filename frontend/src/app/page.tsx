// src/app/page.tsx
"use client";

import "@/styles/landingPage.css";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

const REALMS = [
  { id: "303", mark: "∴", name: "Fractured Frontier", state: "Pressure into motion" },
  { id: "202", mark: "◐", name: "The Veil", state: "Desire, mystery, signal" },
  { id: "101", mark: "☾", name: "Moonlit Roads", state: "Memory and return" },
  { id: "55", mark: "△", name: "Skybound City", state: "Ambition with direction" },
  { id: "44", mark: "◇", name: "Astral Bazaar", state: "Worth, focus, exchange" },
  { id: "0", mark: "∞", name: "InterSiddhi", state: "Center and source" },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user;

  return (
    <main className="landing-page landing-gateway-page min-h-screen relative overflow-hidden isolate">
      <div className="fixed inset-0 z-0 w-full h-full overflow-hidden" aria-hidden="true">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/cosmic-landing-intro.mp4" type="video/mp4" />
        </video>
        <div className="landing-video-overlay" />
        <div className="landing-gateway-orb landing-gateway-orb-a" />
        <div className="landing-gateway-orb landing-gateway-orb-b" />
      </div>

      <section className="landing-shell landing-gateway-shell relative z-10">
        <div className="landing-hero-card landing-gateway-hero-card">
          <div className="landing-system-badge landing-gateway-badge">
            <span className="landing-system-dot" />
            <span>Cosmic Nexus</span>
          </div>

          <p className="landing-gateway-eyebrow">Music worlds / Release portals / Realms</p>

          <h1 className="landing-title landing-gateway-title">
            COSMIC
            <span>NEXUS</span>
          </h1>

          <p className="landing-subtitle landing-gateway-subtitle">
            Step into the front door of the multiverse.
          </p>

          <p className="landing-description landing-gateway-description">
            Explore featured releases, realm soundtracks, and artist-built worlds where sound,
            story, visuals, and signal move through one living portal.
          </p>

          <div className="landing-actions landing-actions-stacked landing-gateway-actions">
            <Link href="/nexus" className="landing-button-primary">
              Enter the Nexus
            </Link>

            <Link href="/releases/sirens-in-neverland" className="landing-button-secondary-subtle">
              Featured Release
            </Link>

            {isAuthenticated ? (
              <div className="landing-gateway-creator-actions" aria-label="Creator shortcuts">
                <Link href="/creator">Creator OS</Link>
                <Link href="/creator/projects">Project Library</Link>
                <Link href="/daily">Daily Flow</Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn("github", { callbackUrl: "/nexus" })}
                className="landing-button-secondary-subtle"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Checking session..." : "Sign in to save progress"}
              </button>
            )}
          </div>

          <div className="landing-system-line landing-gateway-system-line">
            <span>Nexus</span>
            <span>Release Portals</span>
            <span>Realm Soundtracks</span>
          </div>

          <div className="landing-realm-grid landing-gateway-realm-grid" aria-label="Cosmic realms">
            {REALMS.map((realm) => (
              <Link
                key={realm.id}
                href={`/realms/${realm.id}`}
                className="landing-realm-glyph landing-gateway-realm-glyph"
                title={`${realm.name} — ${realm.state}`}
              >
                <span className="landing-realm-number">{realm.id}</span>
                <span className="landing-realm-icon">{realm.mark}</span>
                <span className="landing-realm-name">{realm.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="landing-future-card landing-gateway-release-card">
          <div className="landing-future-icon">✦</div>
          <div>
            <p className="landing-future-label">Featured Portal</p>
            <h2>SIRENS IN NEVERLAND</h2>
            <p>
              A listener-facing release world connected to the Nexus — tracks, cover art, story,
              and selected fragments from the signal board.
            </p>
            <Link href="/releases/sirens-in-neverland">Open the release</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
