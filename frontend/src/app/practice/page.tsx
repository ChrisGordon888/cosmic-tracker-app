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
import "@/styles/innerOSBackgroundReveal.css";

const PRACTICE_ROOMS = [
    {
        number: "01",
        title: "Today",
        eyebrow: "Practice / Quests",
        description:
            "Open the detailed daily workspace, add practices, and complete the rituals connected to today.",
        href: "/tracker",
        cta: "Open Today",
    },
    {
        number: "02",
        title: "Rituals",
        eyebrow: "Reusable Anchors",
        description:
            "Create and manage the repeatable anchors that support your body, focus, and creative rhythm.",
        href: "/rituals",
        cta: "Open Rituals",
    },
    {
        number: "03",
        title: "History",
        eyebrow: "Moon / Mood / Practice",
        description:
            "Review your moods, completed practices, important dates, and moon patterns across time.",
        href: "/calendar",
        cta: "Open Calendar",
    },
    {
        number: "04",
        title: "Reflection",
        eyebrow: "Scroll / Lore",
        description:
            "Read traveler reflections and reconnect daily practice to the larger Cosmic world.",
        href: "/scroll",
        cta: "Read Scroll",
    },
];

const DAILY_LOOP = [
    {
        number: "01",
        label: "Choose",
        title: "Sacred Yes",
        body: "Name the commitment that deserves your energy today.",
    },
    {
        number: "02",
        label: "Read",
        title: "Inner State",
        body: "Notice your mood and the atmosphere you are moving through.",
    },
    {
        number: "03",
        label: "Practice",
        title: "Daily Motion",
        body: "Translate the commitment into concrete, repeatable action.",
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
                    <p className="practice-kicker">Inner OS</p>
                    <h1>Opening today’s practice...</h1>
                    <p>Checking your session before loading the private daily layer.</p>
                </section>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="practice-page practice-state-page">
                <CosmicBackground />
                <section className="practice-state-card">
                    <p className="practice-kicker">Private Inner OS</p>
                    <h1>Sign in to enter your practice.</h1>
                    <p>
                        This private space holds your Sacred Yes, mood, moon, practices, rituals,
                        and history. The public music universe remains open through the Nexus.
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
                    <p className="practice-kicker">Inner OS / Practice</p>
                    <h1>Return to what matters. Move it forward.</h1>
                    <p>
                        A private daily layer for choosing the honest yes, reading your inner state,
                        and turning intention into repeatable motion.
                    </p>
                </div>

                <div className="practice-hero-panel">
                    <span>Today’s field</span>
                    <CosmicClock className="practice-clock" />
                    <div className="practice-hero-links">
                        <Link href="/tracker">Today</Link>
                        <Link href="/rituals">Rituals</Link>
                        <Link href="/calendar">History</Link>
                        <Link href="/creator">Creator OS</Link>
                    </div>
                </div>
            </section>

            <section className="practice-room-section" aria-labelledby="practice-room-heading">
                <div className="practice-section-heading practice-section-heading-row">
                    <div>
                        <p className="practice-kicker">Inner OS Rooms</p>
                        <h2 id="practice-room-heading">Choose the layer you need.</h2>
                    </div>
                    <p>Today, rituals, history, and reflection operate as connected rooms—not separate trackers.</p>
                </div>

                <p className="practice-mobile-hint">Swipe rooms →</p>

                <div className="practice-room-grid" aria-label="Inner OS rooms">
                    {PRACTICE_ROOMS.map((room) => (
                        <Link key={room.href} href={room.href} className="practice-room-card">
                            <div className="practice-room-topline">
                                <span>{room.number}</span>
                                <em>{room.eyebrow}</em>
                            </div>
                            <h3>{room.title}</h3>
                            <p>{room.description}</p>
                            <strong>{room.cta}</strong>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="practice-loop-section" aria-labelledby="practice-loop-heading">
                <div className="practice-section-heading">
                    <p className="practice-kicker">Daily Loop</p>
                    <h2 id="practice-loop-heading">Choose. Read. Practice.</h2>
                </div>

                <div className="practice-pillar-grid" aria-label="Daily practice loop">
                    {DAILY_LOOP.map((step) => (
                        <article key={step.title} className="practice-pillar-card">
                            <div className="practice-room-topline">
                                <span>{step.number}</span>
                                <em>{step.label}</em>
                            </div>
                            <h2>{step.title}</h2>
                            <p>{step.body}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="practice-dashboard-grid" aria-label="Today’s Inner OS">
                <div className="practice-module practice-module-sacred">
                    <div className="practice-module-heading">
                        <p className="practice-kicker">Sacred Yes</p>
                        <h2>Choose the honest commitment.</h2>
                        <p>What deserves a clear yes from you today?</p>
                    </div>
                    <SacredYesSection />
                </div>

                <div className="practice-module practice-module-mood">
                    <div className="practice-module-heading">
                        <p className="practice-kicker">State</p>
                        <h2>Name the inner weather.</h2>
                        <p>Notice your current signal without making it the whole story.</p>
                    </div>
                    <MoodSection />
                </div>

                <div className="practice-module practice-module-moon">
                    <div className="practice-module-heading">
                        <p className="practice-kicker">Atmosphere</p>
                        <h2>Read the larger rhythm.</h2>
                    </div>
                    <MoonPhaseCard />
                </div>

                <div className="practice-module practice-module-practice">
                    <div className="practice-module-heading">
                        <p className="practice-kicker">Practice</p>
                        <h2>Keep the commitment in motion.</h2>
                        <p>Complete the concrete actions connected to today’s rhythm.</p>
                    </div>
                    <PracticeQuestsSection />
                </div>
            </section>

            <section className="practice-coming-soon">
                <div>
                    <p className="practice-kicker">Connected Work</p>
                    <h2>Bring the inner rhythm into the outer build.</h2>
                    <p>
                        Move from private practice into creative direction, music workflow,
                        artist development, and the larger Creator OS.
                    </p>
                </div>
                <div className="practice-actions">
                    <Link href="/creator">Open Creator OS</Link>
                    <Link href="/services">Explore Services</Link>
                </div>
            </section>
        </main>
    );
}
