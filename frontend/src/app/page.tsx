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
        <main className="landing-page landing-gateway-page landing-gateway-v3-page min-h-screen relative overflow-hidden isolate">
            <div className="fixed inset-0 z-0 w-full h-full overflow-hidden" aria-hidden="true">
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                    <source src="/cosmic-landing-intro.mp4" type="video/mp4" />
                </video>
                <div className="landing-video-overlay landing-gateway-v3-overlay" />
                <div className="landing-gateway-orb landing-gateway-orb-a" />
                <div className="landing-gateway-orb landing-gateway-orb-b" />
                <div className="landing-gateway-v3-starfield" />
            </div>

            <section className="landing-shell landing-gateway-shell landing-gateway-v3-shell relative z-10">
                <div className="landing-hero-card landing-gateway-hero-card landing-gateway-v3-hero-card">
                    <div className="landing-system-badge landing-gateway-badge landing-gateway-v3-badge">
                        <span className="landing-system-dot" />
                        <span>Cosmic Nexus</span>
                    </div>

                    <p className="landing-gateway-eyebrow landing-gateway-v3-eyebrow">
                        Music worlds / Realm soundtracks / Living signal
                    </p>

                    <h1 className="landing-title landing-gateway-title landing-gateway-v3-title">
                        COSMIC
                        <span>NEXUS</span>
                    </h1>

                    <p className="landing-subtitle landing-gateway-subtitle landing-gateway-v3-subtitle">
                        Enter the front door of the multiverse.
                    </p>

                    <p className="landing-description landing-gateway-description landing-gateway-v3-description">
                        A cinematic music universe of realms, soundtracks, and artist-built worlds — made to
                        explore, feel, and follow from one signal to the next.
                    </p>

                    <div className="landing-actions landing-actions-stacked landing-gateway-actions landing-gateway-v3-actions">
                        <Link href="/nexus" className="landing-button-primary landing-gateway-v3-primary">
                            Enter the Nexus
                        </Link>

                        {isAuthenticated ? (
                            <div
                                className="landing-gateway-creator-actions landing-gateway-v3-creator-actions"
                                aria-label="Creator shortcuts"
                            >
                                <Link href="/creator">Creator OS</Link>
                                <Link href="/creator/projects">Project Library</Link>
                                <Link href="/practice">Practice</Link>
                                <Link href="/services">Services</Link>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => signIn("github", { callbackUrl: "/nexus" })}
                                className="landing-button-secondary-subtle landing-gateway-v3-secondary"
                                disabled={status === "loading"}
                            >
                                {status === "loading" ? "Checking session..." : "Sign in to save progress"}
                            </button>
                        )}
                    </div>

                    <div className="landing-system-line landing-gateway-system-line landing-gateway-v3-system-line">
                        <span>Enter</span>
                        <span>Explore</span>
                        <span>Return</span>
                    </div>

                    <div
                        className="landing-realm-grid landing-gateway-realm-grid landing-gateway-v3-realm-grid"
                        aria-label="Cosmic realms"
                    >
                        {REALMS.map((realm) => (
                            <Link
                                key={realm.id}
                                href={`/realms/${realm.id}`}
                                className="landing-realm-glyph landing-gateway-realm-glyph landing-gateway-v3-realm-glyph"
                                title={`${realm.name} — ${realm.state}`}
                            >
                                <span className="landing-realm-number">{realm.id}</span>
                                <span className="landing-realm-icon">{realm.mark}</span>
                                <span className="landing-realm-name">{realm.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <p className="landing-gateway-v3-footnote">
                    Six realms. One Nexus. Follow the sound inward.
                </p>
            </section>
        </main>
    );
}