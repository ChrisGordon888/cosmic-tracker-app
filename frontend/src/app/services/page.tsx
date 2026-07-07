// src/app/services/page.tsx
"use client";

import Link from "next/link";
import "@/styles/servicesPage.css";
import CosmicBackground from "@/components/CosmicBackground";

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
      "A future layer for yoga, mobility, personal training, daily practice design, creative discipline, and accountability systems for people building themselves while building their work.",
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
          <Link href="/creator/projects">Projects</Link>
        </nav>

        <p className="services-kicker">Ways to Build with Cosmic</p>

        <h1>
          Build the world
          <span>around the signal.</span>
        </h1>

        <p className="services-intro">
          For artists, creators, brands, and seekers who want more than content —
          a living system for sound, story, technology, practice, and transformation.
        </p>

        <div className="services-hero-actions">
          <a href="mailto:chris.c.gordon777@gmail.com?subject=Ways%20to%20Build%20with%20Cosmic">
            Start a Build
          </a>
          <Link href="/nexus">Explore the Nexus</Link>
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
            We start with the core signal: what you are making, why it matters, and
            what people should feel. Then we shape the system around it — the site,
            story, visuals, release path, practice rhythm, or creator workflow.
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

      <section className="services-cta">
        <p className="services-kicker">Build Together</p>
        <h2>Have a release, idea, brand, practice, or world you want to bring alive?</h2>
        <p>
          Send the signal. Share what you are building, where you are stuck, and what
          you want people to experience.
        </p>

        <div className="services-cta-actions">
          <a href="mailto:chris.c.gordon777@gmail.com?subject=Ways%20to%20Build%20with%20Cosmic">
            Contact Cosmic
          </a>
          <Link href="/scroll">Read the Scroll</Link>
        </div>
      </section>
    </main>
  );
}