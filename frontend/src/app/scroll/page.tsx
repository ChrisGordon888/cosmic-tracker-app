// src/app/scroll/page.tsx
"use client";

import Link from "next/link";
import "@/styles/scrollPage.css";

const MIRRORS = [
    {
        number: "I",
        title: "The Mirror of the World",
        subtitle: "The Mirror of Matter",
        tone: "Pressure / value / survival",
        body:
            "This is what the eyes meet first: motion, pressure, ambition, conflict, exchange, and consequence. The world reflects what is happening around you — but not the whole of who you are.",
        reflection: "Where am I reacting to the world instead of listening through it?",
        realms: [
            {
                id: "303",
                name: "Fractured Frontier",
                mark: "∴",
                href: "/realms/303",
                line: "Pressure becomes motion.",
            },
            {
                id: "44",
                name: "Astral Bazaar",
                mark: "◇",
                href: "/realms/44",
                line: "Worth, focus, and exchange.",
            },
        ],
    },
    {
        number: "II",
        title: "The Silver Mirror",
        subtitle: "The Mirror of Identity",
        tone: "Memory / image / longing",
        body:
            "This is the mirror you hold to yourself, shaped by memory, status, story, desire, and survival. The past calls. The image seduces. The question becomes: who are you without the echo?",
        reflection: "What version of me am I still performing?",
        realms: [
            {
                id: "101",
                name: "Moonlit Roads",
                mark: "☾",
                href: "/realms/101",
                line: "Memory, softness, and return.",
            },
            {
                id: "55",
                name: "Skybound City",
                mark: "△",
                href: "/realms/55",
                line: "Ambition with direction.",
            },
        ],
    },
    {
        number: "III",
        title: "The Obsidian Mirror",
        subtitle: "The Mirror of Source",
        tone: "Desire / silence / signal",
        body:
            "No bright reflection. No easy answer. Only absorption. The Veil pulls you inward; InterSiddhi returns you to center. To look into the obsidian is to let the false signal dissolve.",
        reflection: "What remains when the noise goes quiet?",
        realms: [
            {
                id: "202",
                name: "The Veil",
                mark: "◐",
                href: "/realms/202",
                line: "Desire, mystery, and signal.",
            },
            {
                id: "0",
                name: "InterSiddhi",
                mark: "∞",
                href: "/realms/0",
                line: "Center, source, and return.",
            },
        ],
    },
];

const ALL_REALMS = MIRRORS.flatMap((mirror) => mirror.realms);

export default function CosmicScroll() {
    return (
        <main className="scroll-page">
            <div className="scroll-obsidian-background" aria-hidden="true">
                <div className="scroll-obsidian-orb scroll-obsidian-orb-a" />
                <div className="scroll-obsidian-orb scroll-obsidian-orb-b" />
                <div className="scroll-obsidian-mirror" />
                <div className="scroll-obsidian-grid" />
            </div>

            <section className="scroll-hero">
                <nav className="scroll-nav" aria-label="Scroll navigation">
                    <Link href="/practice">Practice Portal</Link>
                    <Link href="/nexus">Nexus</Link>
                    <Link href="/services">Services</Link>
                </nav>

                <p className="scroll-kicker">Traveler Scroll</p>

                <h1>
                    Reflections of
                    <span>the Traveler</span>
                </h1>

                <p className="scroll-subtitle">The Three Mirrors of Becoming</p>

                <p className="scroll-intro">
                    Before there were realms, there were reflections. Before the map, there was the
                    moment you noticed yourself watching, reacting, surviving, searching. Then
                    something cracked open. Something called. The journey did not begin with an
                    answer. It began with a mirror.
                </p>
            </section>

            <section className="scroll-mirror-list" aria-label="The Three Mirrors">
                {MIRRORS.map((mirror) => (
                    <article key={mirror.number} className="scroll-mirror-card">
                        <div className="scroll-mirror-number">
                            <span>Mirror</span>
                            <strong>{mirror.number}</strong>
                        </div>

                        <div className="scroll-mirror-copy">
                            <p className="scroll-kicker">{mirror.tone}</p>
                            <h2>{mirror.title}</h2>
                            <h3>{mirror.subtitle}</h3>
                            <p>{mirror.body}</p>

                            <div className="scroll-question">
                                <span>Reflection</span>
                                <strong>{mirror.reflection}</strong>
                            </div>

                            <div className="scroll-connected-realms">
                                <span>Connected Realms</span>

                                <div>
                                    {mirror.realms.map((realm) => (
                                        <Link key={realm.id} href={realm.href}>
                                            <em>{realm.id}</em>
                                            <strong>{realm.mark}</strong>
                                            <span>
                                                {realm.name}
                                                <small>{realm.line}</small>
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </section>

            <section className="scroll-all-realms">
                <div>
                    <p className="scroll-kicker">Realm Gates</p>
                    <h2>Choose the mirror that is speaking. Then enter the realm that answers.</h2>
                </div>

                <div className="scroll-realm-gate-grid">
                    {ALL_REALMS.map((realm) => (
                        <Link key={realm.id} href={realm.href} className="scroll-realm-gate">
                            <span>{realm.id}</span>
                            <strong>{realm.mark}</strong>
                            <em>{realm.name}</em>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="scroll-closing">
                <p className="scroll-kicker">Return With Signal</p>
                <h2>The scroll is not separate from the practice.</h2>
                <p>
                    Read the reflection, choose the mirror, then move. Return to your Practice Portal,
                    enter the Nexus, or step into the realm that is calling.
                </p>

                <div className="scroll-actions">
                    <Link href="/practice">Return to Practice</Link>
                    <Link href="/nexus">Enter the Nexus</Link>
                    <Link href="/services">Work With Cosmic</Link>
                </div>
            </section>
        </main>
    );
}