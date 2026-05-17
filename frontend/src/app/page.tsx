// src/app/page.tsx
"use client";

import "@/styles/landingPage.css";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

const REALMS = [
    {
        id: "303",
        mark: "∴",
        name: "Fractured Frontier",
        state: "Chaos into form",
    },
    {
        id: "202",
        mark: "◐",
        name: "The Veil",
        state: "Desire and mystery",
    },
    {
        id: "101",
        mark: "☾",
        name: "Moonlit Roads",
        state: "Reflection and return",
    },
    {
        id: "55",
        mark: "△",
        name: "Skybound City",
        state: "Power with direction",
    },
    {
        id: "44",
        mark: "◇",
        name: "Astral Bazaar",
        state: "Value and exchange",
    },
    {
        id: "0",
        mark: "∞",
        name: "InterSiddhi",
        state: "Alignment and source",
    },
];

export default function LandingPage() {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    return (
        <main className="landing-page min-h-screen relative overflow-hidden isolate">
            {/* Background Layer */}
            <div className="fixed inset-0 z-0 w-full h-full overflow-hidden">
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

            {/* Foreground Content */}
            <section className="landing-shell relative z-10">
                <div className="landing-hero-card">
                    <div className="landing-system-badge">
                        <span className="landing-system-dot" />
                        <span>Music-Based Realm System</span>
                    </div>

                    <h1 className="landing-title">
                        COSMIC
                        <span>MULTIVERSE</span>
                    </h1>

                    <p className="landing-subtitle">
                        Six interconnected realms. Your music. Your journey.
                    </p>

                    <p className="landing-description">
                        Enter a cinematic sound world where each realm carries its own
                        emotional state, soundtrack, and path of progression.
                    </p>

                    <div className="landing-actions">
                        {isAuthenticated ? (
                            <Link href="/nexus" className="landing-button-primary">
                                Enter the Nexus
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => signIn("github")}
                                className="landing-button-primary"
                            >
                                Sign in to enter
                            </button>
                        )}
                    </div>

                    <div className="landing-system-line">
                        <span>V1 Live</span>
                        <span>Music Hub</span>
                        <span>Realm Progression</span>
                    </div>

                    <div className="landing-realm-grid" aria-label="Cosmic realms">
                        {REALMS.map((realm) => (
                            <div
                                key={realm.id}
                                className="landing-realm-glyph"
                                title={`${realm.name} — ${realm.state}`}
                            >
                                <span className="landing-realm-number">{realm.id}</span>
                                <span className="landing-realm-icon">{realm.mark}</span>
                                <span className="landing-realm-name">{realm.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="landing-future-card">
                    <div className="landing-future-icon">✦</div>

                    <div>
                        <p className="landing-future-label">Future Layer</p>
                        <h2>Ritual Layer</h2>
                        <p>
                            Daily rituals, sacred tracking, and lunar alignment are planned as
                            future modules. The core realm journey is live now.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}