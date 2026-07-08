// src/app/services/page.tsx
"use client";

import Link from "next/link";
import "@/styles/servicesPage.css";
import CosmicBackground from "@/components/CosmicBackground";

type Offer = {
  tier: string;
  title: string;
  price: string;
  body: string;
  bestFor: string;
  youSend: string;
  youReceive: string;
  outcome: string;
  includes: string[];
  href: string;
  cta: string;
  featured?: boolean;
};

const START_HERE_OFFERS: Offer[] = [
  {
    tier: "Call",
    title: "Cosmic Clarity Call",
    price: "30 min — $55",
    body:
      "A focused call for quick creative, emotional, workflow, or next-step clarity.",
    bestFor: "Quick direction, creative stuckness, or choosing the next move.",
    youSend: "Your question, current challenge, or what you are trying to decide.",
    youReceive: "A focused call with notes, perspective, and direct next steps.",
    outcome: "You leave with a clearer direction and one simple action path.",
    includes: ["Quick diagnosis", "Next-step clarity", "Action notes"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Cosmic%20Clarity%20Call",
    cta: "Book Call",
  },
  {
    tier: "Session",
    title: "Creative Direction Session",
    price: "60 min — $111",
    body:
      "A deeper session for shaping a project, release, brand direction, story, creative identity, or personal creative path.",
    bestFor: "Artists, creators, and seekers who need deeper creative direction.",
    youSend: "Music, visuals, links, notes, questions, or a short project summary.",
    youReceive: "Live direction, creative feedback, and a practical next-step roadmap.",
    outcome: "Your idea becomes more organized, grounded, and ready to move.",
    includes: ["Project direction", "Creative feedback", "Next-step roadmap"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Creative%20Direction%20Session",
    cta: "Book Session",
    featured: true,
  },
  {
    tier: "Lesson",
    title: "Music / DAW Workflow Lesson",
    price: "60 min — $88",
    body:
      "Beginner-friendly help with Ableton, Pro Tools, recording workflow, basic music theory, chords, melodies, arrangement, and vocal session setup.",
    bestFor: "Beginners or returning creatives who want practical music help.",
    youSend: "Your DAW questions, current setup, song idea, or what you want to learn.",
    youReceive: "A live lesson, screen-share guidance, and practice steps.",
    outcome: "You understand your tools better and can keep creating with less friction.",
    includes: ["DAW workflow", "Music basics", "Recording setup"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Music%20DAW%20Workflow%20Lesson",
    cta: "Book Lesson",
  },
];

const AUDIT_OFFERS: Offer[] = [
  {
    tier: "Artist",
    title: "Artist World Audit",
    price: "$222",
    body:
      "For artists with music, visuals, ideas, content, or a release page who want a clearer world, story, rollout, and listener pathway.",
    bestFor: "Independent artists building identity, story, and release direction.",
    youSend: "Songs, visuals, socials, website/release page, notes, and goals.",
    youReceive: "A written audit with world notes, positioning, and rollout suggestions.",
    outcome: "You understand what your artist world is saying and how to strengthen it.",
    includes: ["Music/project review", "World + story notes", "Rollout suggestions"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Artist%20World%20Audit",
    cta: "Buy Audit",
    featured: true,
  },
  {
    tier: "Project",
    title: "Song / Project Development Pack",
    price: "3 sessions — $333",
    body:
      "Three focused sessions to develop a song, EP idea, rollout concept, lyrics, hooks, melodies, arrangement, or project direction.",
    bestFor: "Artists who want hands-on support moving one project forward.",
    youSend: "Demos, lyrics, references, project notes, and what feels unfinished.",
    youReceive: "Three development sessions with feedback, direction, and assignments.",
    outcome: "Your song or project gets clearer, stronger, and closer to release.",
    includes: ["Song feedback", "Development calls", "Project direction"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Song%20Project%20Development%20Pack",
    cta: "Develop Project",
    featured: true,
  },
  {
    tier: "Studio",
    title: "Studio / Workflow Audit",
    price: "$444",
    body:
      "A deeper review of your recording setup, DAW sessions, templates, file organization, vocal workflow, and creative productivity system.",
    bestFor: "Artists/producers with messy sessions, setup confusion, or workflow drag.",
    youSend: "Setup photos, DAW screenshots, session notes, template questions, and workflow pain points.",
    youReceive: "A written workflow map, setup notes, template suggestions, and a walkthrough.",
    outcome: "Your creative machine becomes cleaner, faster, and easier to return to.",
    includes: ["Setup review", "Workflow map", "Template suggestions"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Studio%20Workflow%20Audit",
    cta: "Request Audit",
  },
];

const BUILD_WITH_COSMIC: Offer[] = [
  {
    tier: "Release",
    title: "Release Portal Accelerator",
    price: "Starting at $777",
    body:
      "A done-with-you build for artists who want help shaping, customizing, and launching a release portal with story, visuals, track direction, and fan pathway.",
    bestFor: "Artists with a single, EP, album, or campaign they want to launch better.",
    youSend: "Music, cover art, photos, links, story notes, rollout goals, and references.",
    youReceive: "Guided portal setup, world copy, release direction, and launch support.",
    outcome: "Your release has a stronger home, clearer story, and better fan pathway.",
    includes: ["Portal setup", "World copy", "Launch direction"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Release%20Portal%20Accelerator",
    cta: "Request Portal",
    featured: true,
  },
  {
    tier: "Sprint",
    title: "Cosmic Artist Sprint",
    price: "4 weeks — starting at $888",
    body:
      "A focused artist development sprint with weekly calls, music feedback, workflow setup, identity work, practice rhythm, and rollout direction.",
    bestFor: "Artists who want support across music, identity, workflow, and discipline.",
    youSend: "Your music, goals, creative blocks, current systems, and weekly progress.",
    youReceive: "Weekly coaching, feedback, assignments, and a personalized artist roadmap.",
    outcome: "You build momentum, clarity, and a stronger creative system over one month.",
    includes: ["Weekly coaching", "Music + workflow feedback", "Artist roadmap"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Cosmic%20Artist%20Sprint",
    cta: "Apply for Sprint",
    featured: true,
  },
  {
    tier: "System",
    title: "Creator System Custom Build",
    price: "Starting at $1,500",
    body:
      "A custom website, portfolio, dashboard, fan portal, creative OS, or digital workflow system built around your actual creative process.",
    bestFor: "Creators, artists, and small brands who need something custom.",
    youSend: "Project goals, references, content, features, pages, and workflow needs.",
    youReceive: "A scoped custom build with design, structure, implementation, and launch support.",
    outcome: "You get a digital system built around your real work, not a generic template.",
    includes: ["Custom build", "Workflow design", "Launch support"],
    href: "mailto:chris.c.gordon777@gmail.com?subject=Creator%20System%20Custom%20Build",
    cta: "Request Quote",
  },
];

const FREE_UNIVERSE = [
  {
    title: "Nexus",
    eyebrow: "Explore",
    body: "Enter the public music universe, realm soundtracks, release portals, and open signals.",
    href: "/nexus",
    cta: "Enter Nexus",
  },
  {
    title: "Find Your Realm",
    eyebrow: "Discover",
    body: "Find the realm that matches your current creative, emotional, or energetic signal.",
    href: "/find-your-realm",
    cta: "Find Realm",
  },
  {
    title: "Traveler Scroll",
    eyebrow: "Reflect",
    body: "Read the mirrors and connect the mythology to the realm system.",
    href: "/scroll",
    cta: "Read Scroll",
  },
];

const SKILL_AREAS = [
  "Artist identity",
  "Release strategy",
  "Song feedback",
  "Ableton / Pro Tools workflow",
  "Vocal recording",
  "Creative systems",
  "Basic theory",
  "Yoga + practice rhythm",
  "Custom web builds",
  "World-building",
];

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <article className={`services-offer-card ${offer.featured ? "is-featured" : ""}`}>
      <div className="services-offer-topline">
        <span>{offer.tier}</span>
        {offer.featured && <em>Featured</em>}
      </div>

      <h3>{offer.title}</h3>
      <p className="services-price">{offer.price}</p>
      <p className="services-offer-body">{offer.body}</p>

      <div className="services-offer-detail">
        <span>Best For</span>
        <p>{offer.bestFor}</p>
      </div>

      <div className="services-offer-detail">
        <span>You Send</span>
        <p>{offer.youSend}</p>
      </div>

      <div className="services-offer-detail">
        <span>You Receive</span>
        <p>{offer.youReceive}</p>
      </div>

      <div className="services-offer-detail services-outcome">
        <span>Outcome</span>
        <p>{offer.outcome}</p>
      </div>

      <ul>
        {offer.includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <a href={offer.href}>{offer.cta}</a>
    </article>
  );
}

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

        <p className="services-kicker">Calls / Audits / Lessons / Custom Builds</p>

        <h1>
          Work with
          <span>Cosmic.</span>
        </h1>

        <p className="services-intro">
          Book a focused session, buy an audit, or build deeper with Cosmic through
          artist development, music workflow, release portals, creative systems, and
          practice-based coaching.
        </p>

        <div className="services-hero-actions">
          <a href="#start-here">View Offers</a>
          <a href="mailto:chris.c.gordon777@gmail.com?subject=Services%20Question">
            Ask a Question
          </a>
        </div>
      </section>

      <section className="services-note">
        <p className="services-kicker">How this works</p>
        <h2>The free universe is open. Paid services are for direct support.</h2>
        <p>
          Anyone can explore the Nexus, realms, scroll, and creative tools. Services are
          for people who want direct feedback, guided setup, customization, coaching,
          accountability, or a deeper build with Cosmic.
        </p>
      </section>

      <section id="start-here" className="services-offers-section" aria-labelledby="start-here-heading">
        <div className="services-section-heading">
          <p className="services-kicker">Start Here</p>
          <h2 id="start-here-heading">Book a focused call, session, or lesson.</h2>
          <p>
            The easiest way to work together. These offers are for clarity, direction,
            music workflow, beginner theory, creative confidence, and next-step support.
          </p>
        </div>

        <div className="services-offer-grid">
          {START_HERE_OFFERS.map((offer) => (
            <OfferCard key={offer.title} offer={offer} />
          ))}
        </div>
      </section>

      <section className="services-offers-section" aria-labelledby="audits-heading">
        <div className="services-section-heading">
          <p className="services-kicker">Audits + Reviews</p>
          <h2 id="audits-heading">Get your project, world, or workflow reviewed.</h2>
          <p>
            For artists and creators who already have music, ideas, pages, sessions, or
            systems in motion — and want a clearer roadmap for what to improve next.
          </p>
        </div>

        <div className="services-offer-grid">
          {AUDIT_OFFERS.map((offer) => (
            <OfferCard key={offer.title} offer={offer} />
          ))}
        </div>
      </section>

      <section className="services-offers-section" aria-labelledby="build-heading">
        <div className="services-section-heading">
          <p className="services-kicker">Build with Cosmic</p>
          <h2 id="build-heading">Go deeper than the free tools.</h2>
          <p>
            The free system gives creators a place to begin. These offers are for artists,
            creators, and brands who want guided setup, custom direction, implementation,
            or a longer transformation arc.
          </p>
        </div>

        <div className="services-offer-grid">
          {BUILD_WITH_COSMIC.map((offer) => (
            <OfferCard key={offer.title} offer={offer} />
          ))}
        </div>
      </section>

      <section className="services-skills">
        <div>
          <p className="services-kicker">What I can help with</p>
          <h2>Music, systems, story, workflow, and practice.</h2>
          <p>
            These services sit at the intersection of artist development, emotional clarity,
            creative technology, music workflow, and personal rhythm.
          </p>
        </div>

        <div className="services-skill-cloud" aria-label="Service skill areas">
          {SKILL_AREAS.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>

      <section className="services-free-section" aria-labelledby="free-universe-heading">
        <div className="services-section-heading">
          <p className="services-kicker">Free Universe</p>
          <h2 id="free-universe-heading">Explore before you book anything.</h2>
          <p>
            Start with the free Cosmic ecosystem. Listen, explore, reflect, find your
            realm, and feel the world before choosing a paid service.
          </p>
        </div>

        <div className="services-free-grid">
          {FREE_UNIVERSE.map((signal) => (
            <Link key={signal.href} href={signal.href} className="services-free-card">
              <span>{signal.eyebrow}</span>
              <h3>{signal.title}</h3>
              <p>{signal.body}</p>
              <strong>{signal.cta}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="services-process">
        <div>
          <p className="services-kicker">The build flow</p>
          <h2>Clarity → Direction → Action</h2>
          <p>
            Every offer is designed to move you from scattered ideas into a clearer next
            step: a stronger song, a better workflow, a sharper release, a cleaner page,
            or a more grounded creative rhythm.
          </p>
        </div>

        <div className="services-process-steps">
          <article>
            <span>01</span>
            <h3>Choose the offer</h3>
            <p>Pick a call, lesson, audit, project pack, or custom build.</p>
          </article>

          <article>
            <span>02</span>
            <h3>Share your context</h3>
            <p>Send your music, page, workflow, questions, goals, or current challenge.</p>
          </article>

          <article>
            <span>03</span>
            <h3>Build the next step</h3>
            <p>Leave with direction, notes, a roadmap, a cleaner system, or a custom build path.</p>
          </article>
        </div>
      </section>

      <section className="services-payment">
        <div>
          <p className="services-kicker">Payment options</p>
          <h2>Simple payment links can be added as each offer goes live.</h2>
          <p>
            For now, each button opens an inquiry email. As the offers become active, the
            buttons can point to PayPal, Cash App, Stripe Payment Links, Calendly, or
            invoices depending on the offer.
          </p>
        </div>

        <div className="services-payment-list">
          <span>Calls → book/pay link</span>
          <span>Audits → payment link</span>
          <span>Custom builds → quote + deposit</span>
          <span>Sprints → application first</span>
        </div>
      </section>

      <section className="services-cta">
        <p className="services-kicker">Ready to work?</p>
        <h2>Choose the offer that matches your stage.</h2>
        <p>
          Not sure what fits? Send a short message with what you are building, where you
          are stuck, and what kind of support you are looking for.
        </p>

        <div className="services-cta-actions">
          <a href="mailto:chris.c.gordon777@gmail.com?subject=Services%20Question">
            Ask What Fits
          </a>
          <Link href="/nexus">Return to Nexus</Link>
        </div>
      </section>
    </main>
  );
}