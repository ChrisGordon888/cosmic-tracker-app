// src/app/services/page.tsx
"use client";

import Link from "next/link";
import "@/styles/servicesPage.css";
import CosmicBackground from "@/components/CosmicBackground";

const FREE_SIGNALS = [
  {
    title: "Nexus",
    eyebrow: "Free Portal",
    body: "Explore the public music universe, realm soundtracks, release portals, and open signals.",
    href: "/nexus",
    cta: "Enter Nexus",
  },
  {
    title: "Find Your Realm",
    eyebrow: "Free Tool",
    body: "Discover the realm that matches your current creative, emotional, or energetic signal.",
    href: "/find-your-realm",
    cta: "Find Realm",
  },
  {
    title: "Traveler Scroll",
    eyebrow: "Free Reflection",
    body: "Read the mirrors, explore the mythology, and connect the practice layer to the realm system.",
    href: "/scroll",
    cta: "Read Scroll",
  },
];

const FEATURED_OFFERS = [
  {
    tier: "Entry",
    title: "Creative Direction Session",
    price: "Starting at $88",
    body:
      "A focused session to clarify your next release, brand, offer, creative block, or digital direction.",
    includes: ["Creative audit", "Signal clarity", "Next-step roadmap"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Creative%20Direction%20Session",
    cta: "Book Session",
  },
  {
    tier: "Artist",
    title: "Artist World Audit",
    price: "Starting at $188",
    body:
      "A deeper review of your music, visuals, story, rollout, listener journey, and creative identity.",
    includes: ["Music feedback", "World notes", "Rollout suggestions"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Artist%20World%20Audit",
    cta: "Request Audit",
    featured: true,
  },
  {
    tier: "Build",
    title: "Release Portal Build",
    price: "Custom build",
    body:
      "A custom release page or landing experience for a single, EP, album, launch, or creative campaign.",
    includes: ["Release page", "Fan pathway", "World copy"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Release%20Portal%20Build",
    cta: "Start Portal",
  },
  {
    tier: "System",
    title: "Creator System Build",
    price: "Custom quote",
    body:
      "A website, dashboard, creative OS, fan portal, or workflow tool built around your creative process.",
    includes: ["Web app", "Dashboard", "Workflow design"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Creator%20System%20Build",
    cta: "Build System",
  },
  {
    tier: "Practice",
    title: "Practice + Performance Coaching",
    price: "Limited openings",
    body:
      "Yoga, mobility, training, rhythm, discipline, and accountability for creators building themselves and their work.",
    includes: ["Movement", "Accountability", "Practice rhythm"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Practice%20and%20Performance%20Coaching",
    cta: "Ask Availability",
  },
  {
    tier: "Exclusive",
    title: "Private Build Partnership",
    price: "Application only",
    body:
      "A deeper collaboration across world-building, creative technology, release strategy, and long-form direction.",
    includes: ["Strategy", "Creative tech", "World-building"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Private%20Build%20Partnership",
    cta: "Apply to Build",
    featured: true,
  },
];

const SERVICE_PATHS = [
  {
    eyebrow: "Creative Worlds",
    title: "Artist worlds, release portals, and mythic brand systems.",
    body:
      "Build immersive release experiences, story systems, realm concepts, visual language, and fan-facing worlds that make the music feel bigger than a drop.",
    items: ["Release worlds", "Artist identity", "Story systems", "Rollout direction"],
  },
  {
    eyebrow: "Creative Technology",
    title: "Websites, dashboards, and interactive tools for creators.",
    body:
      "Design and build modern digital experiences: landing pages, fan portals, creator dashboards, portfolio systems, and custom tools that support real creative workflow.",
    items: ["Web apps", "Creator dashboards", "Fan portals", "Interactive experiences"],
  },
  {
    eyebrow: "Music + Artist Development",
    title: "Direction for sound, concept, catalog, and release strategy.",
    body:
      "Support artists and creators with concept development, track feedback, world-building, sequencing, and the deeper strategy behind a body of work.",
    items: ["Song feedback", "Project direction", "Release planning", "World-building"],
  },
  {
    eyebrow: "Practice + Performance",
    title: "Rhythm, discipline, movement, and creative accountability.",
    body:
      "Yoga, mobility, training, daily practice design, creative discipline, and accountability systems for people building themselves while building their work.",
    items: ["Yoga", "Training", "Accountability", "Creative practice"],
  },
];

const BUILD_MODES = [
  {
    label: "For Artists",
    text: "Build a release world, clarify the project, and give fans a deeper place to enter.",
  },
  {
    label: "For Creators",
    text: "Turn your ideas, content, or workflow into a more intentional digital system.",
  },
  {
    label: "For Brands",
    text: "Create a world, campaign, landing experience, or interactive identity system.",
  },
  {
    label: "For Seekers",
    text: "Build rhythm through practice, movement, accountability, and creative discipline.",
  },
];

export default function ServicesPage() {
  return (
    <main className="services-page">
      <CosmicBackground />

      <section className="services-hero">
        <nav className="services-nav" aria-label="Services navigation">
          <Link href="/nexus">Nexus</Link>
          <Link href="/practice">Practice</Link>
          <Link href="/scroll">Scroll</Link>
          <Link href="/creator/projects">Projects</Link>
        </nav>

        <div className="services-market-badge">
          <span />
          <strong>Services</strong>
        </div>

        <p className="services-kicker">Free signal / Paid builds / Exclusive collaboration</p>

        <h1>
          Ways to build
          <span>with Cosmic.</span>
        </h1>

        <p className="services-intro">
          Explore the free universe — or step into a direct build path for artist
          world-building, release portals, creative technology, practice coaching,
          and deeper collaboration.
        </p>

        <div className="services-hero-actions">
          <a href="mailto:chris.c.gordon777@gmail.com?subject=Ways%20to%20Build%20with%20Cosmic">
            Send the Signal
          </a>
          <a href="#offers">Browse Offers</a>
        </div>
      </section>

      <section className="services-free-section" aria-labelledby="free-signal-heading">
        <div className="services-section-heading">
          <p className="services-kicker">Free Signal</p>
          <h2 id="free-signal-heading">Enter the universe before you buy anything.</h2>
          <p>
            The free layer gives people a way to experience the world, the music, the
            mythology, and the tools. Paid offers are for those who want direct help
            building their own release, brand, system, or rhythm.
          </p>
        </div>

        <div className="services-free-grid">
          {FREE_SIGNALS.map((signal) => (
            <Link key={signal.href} href={signal.href} className="services-free-card">
              <span>{signal.eyebrow}</span>
              <h3>{signal.title}</h3>
              <p>{signal.body}</p>
              <strong>{signal.cta}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section id="offers" className="services-offers-section" aria-labelledby="offers-heading">
        <div className="services-section-heading">
          <p className="services-kicker">Featured Offers</p>
          <h2 id="offers-heading">Choose the depth of the build.</h2>
          <p>
            Start with a session, request a creative audit, or build something custom.
            Each offer is designed to turn scattered energy into a clearer creative system.
          </p>
        </div>

        <div className="services-offer-grid">
          {FEATURED_OFFERS.map((offer) => (
            <article
              key={offer.title}
              className={`services-offer-card ${offer.featured ? "is-featured" : ""}`}
            >
              <div className="services-offer-topline">
                <span>{offer.tier}</span>
                {offer.featured && <em>Featured</em>}
              </div>

              <h3>{offer.title}</h3>
              <p className="services-price">{offer.price}</p>
              <p className="services-offer-body">{offer.body}</p>

              <ul>
                {offer.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <a href={offer.href}>{offer.cta}</a>
            </article>
          ))}
        </div>
      </section>

      <section className="services-mode-grid" aria-label="Who this is for">
        {BUILD_MODES.map((mode) => (
          <article key={mode.label} className="services-mode-card">
            <span>{mode.label}</span>
            <p>{mode.text}</p>
          </article>
        ))}
      </section>

      <section className="services-path-grid" aria-label="Ways to build">
        {SERVICE_PATHS.map((path) => (
          <article key={path.eyebrow} className="services-path-card">
            <p className="services-kicker">{path.eyebrow}</p>
            <h2>{path.title}</h2>
            <p>{path.body}</p>

            <div className="services-chip-list">
              {path.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="services-process">
        <div>
          <p className="services-kicker">The Build Flow</p>
          <h2>Signal → System → World</h2>
          <p>
            We start with the core signal: what you are making, why it matters,
            and what people should feel. Then we shape the system around it —
            the page, story, visuals, release path, practice rhythm, or creator workflow.
          </p>
        </div>

        <div className="services-process-steps">
          <article>
            <span>01</span>
            <h3>Clarify the Signal</h3>
            <p>Define the idea, audience, feeling, offer, release, or transformation.</p>
          </article>

          <article>
            <span>02</span>
            <h3>Shape the System</h3>
            <p>Turn the signal into structure: pages, tools, rituals, worlds, or strategy.</p>
          </article>

          <article>
            <span>03</span>
            <h3>Open the Portal</h3>
            <p>Launch the experience and give people a clear way to enter, follow, or build.</p>
          </article>
        </div>
      </section>

      <section className="services-exclusive">
        <div className="services-exclusive-sigil">✦</div>

        <div>
          <p className="services-kicker">Exclusive Layer</p>
          <h2>Some builds are not packages.</h2>
          <p>
            For deeper collaborations, Cosmic can support world-building, creative tech,
            release strategy, practice systems, and brand direction across a longer arc.
            If the signal is real, we can shape the container around it.
          </p>
        </div>

        <a href="mailto:chris.c.gordon777@gmail.com?subject=Exclusive%20Cosmic%20Build">
          Propose a Build
        </a>
      </section>

      <section className="services-cta">
        <p className="services-kicker">Build Together</p>
        <h2>The free universe is open. The deeper builds are intentional.</h2>
        <p>
          Send the signal. Share what you are building, where you are stuck, and what
          you want people to experience.
        </p>

        <div className="services-cta-actions">
          <a href="mailto:chris.c.gordon777@gmail.com?subject=Ways%20to%20Build%20with%20Cosmic">
            Contact Cosmic
          </a>
          <Link href="/nexus">Return to Nexus</Link>
        </div>
      </section>
    </main>
  );
}