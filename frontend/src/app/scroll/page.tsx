// src/app/scroll/page.tsx
"use client";

import Link from "next/link";
import "@/styles/scrollPage.css";

const MIRRORS = [
    {
        number: "I",
        title: "The World / Reality Mirror",
        subtitle: "Circumstance before story",
        tone: "Circumstance / relationship / consequence",
        body:
            "Start with what is happening: circumstances, relationships, environment, exchanges and consequences. Notice observable behavior, recurring patterns and friction. Then separate what you observed from the story you immediately told about it. The world offers evidence, not a complete verdict on you.",
        reflection: "What is happening — and what story am I telling about it?",
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
        tone: "Identity / memory / aspiration",
        body:
            "The Silver Mirror concerns self-image: memory, persona, roles and the person you aspire to become. Who you think you are, feedback from others, your observable patterns and your inner experience offer different views. None is the whole person. Hold them together without turning one reflection into a fixed identity.",
        reflection: "What version of yourself are you still carrying?",
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
        title: "The Obsidian / Black Mirror",
        subtitle: "Depth, ambiguity and possibility",
        tone: "Attention / imagination / projection",
        body:
            "Silver returns the image. Obsidian seems to absorb the light around it and draw the eye inward. A reflection still lives in its polished darkness — alongside imagination, projection and possibility. What takes shape when you linger?",
        reflection: "What are you looking into — and what are you bringing to it?",
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
                    The Three
                    <span>Mirrors</span>
                </h1>

                <p className="scroll-subtitle">A COSMIC map for reflection</p>

                <p className="scroll-intro">
                    Look at the world. Look at the image you carry. Look into what could be.

                    Each mirror offers a mode of reflection; the six Realms offer territories to explore.
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

                            {mirror.number === "III" && <>
                                <p>A sleeping screen reflects. Awake, it offers art, people, news and constructed worlds. It can widen your vision, or quietly direct it. What deserves your attention?</p>
                                <details className="scroll-context"><summary>Historical note</summary><p>The British Museum holds a polished obsidian mirror attributed to Aztec culture. <a href="https://www.britishmuseum.org/collection/object/E_Am1825-1210-16" target="_blank" rel="noreferrer">View the collection record ↗</a></p><p>The Three Mirrors and the screen connection are COSMIC’s contemporary interpretation.</p></details>
                            </>}
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

            <section className="scroll-all-realms scroll-lenses">
                <details><summary>Ways of seeing · optional lenses</summary>
                    <p>Different maps make different things visible. COSMIC draws on these as reflective lenses; none defines the whole person.</p>
                    <div className="scroll-lens-grid">
                        <article><h3>Parts + Self</h3><p>An IFS-adjacent question: which part or role is speaking? One part is not the whole person. Reflection, not therapy.</p></article>
                        <article><h3>Pattern / design</h3><p>Human Design offers a symbolic map of energy and decisions: a lens for questions, not a scientific identity.</p></article>
                        <article><h3>Number / symbol</h3><p>Numerology explores number, pattern and cycle as symbols, not evidence of destiny.</p></article>
                        <article><h3>Witness / tradition</h3><p>Contemplative and philosophical lenses invite a witnessing perspective: awareness beyond one passing state.</p></article>
                    </div>
                    <p>What remains when I stop reducing myself to one image?</p>
                </details>
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
                <h2>Three mirrors. Six possible directions.</h2>
                <p>
                    After observing circumstance, self-image and possibility, orient toward a Realm that resonates with your present state. These are lenses, not diagnoses or fixed identities. Archetypes, parts reflection and contemplative ideas can invite questions; they do not define you.
                </p>

                <div className="scroll-actions">
                    <Link href="/find-your-realm">Find Your Realm →</Link>
                    <Link href="/nexus#realm-soundtracks">Explore all Realms</Link>
                </div>
            </section>
        </main>
    );
}