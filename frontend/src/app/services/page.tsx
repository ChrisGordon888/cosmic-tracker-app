// src/app/services/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import "@/styles/servicesPage.css";
import CosmicBackground from "@/components/CosmicBackground";

type OfferStatus = "Available Now" | "Limited Openings" | "Application Only" | "Custom Quote" | "Coming Soon";
type ActionType = "book" | "buy" | "request" | "apply" | "quote";

type Offer = {
  slug: string;
  tier: string;
  title: string;
  price: string;
  format: string;
  status: OfferStatus;
  actionType: ActionType;
  actionLabel: string;
  actionHref: string;
  body: string;
  bestFor: string;
  youSend: string;
  youReceive: string;
  outcome: string;
  includes: string[];
  featured?: boolean;
  visual?: string;
};

type ToolkitItem = {
  category: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  status: "Coming Soon" | "Recommended" | "Affiliate Ready";
};

const START_HERE_OFFERS: Offer[] = [
  {
    slug: "cosmic-clarity-call",
    tier: "Call",
    title: "Cosmic Clarity Call",
    price: "30 min — $55",
    format: "1 live call",
    status: "Available Now",
    actionType: "book",
    actionLabel: "Book Call",
    actionHref: "/services/inquire?offer=cosmic-clarity-call&intent=book",
    body:
      "A focused call for quick creative, emotional, workflow, or next-step clarity.",
    bestFor: "Quick direction, creative stuckness, or choosing the next move.",
    youSend: "Your question, current challenge, or what you are trying to decide.",
    youReceive: "A focused call with notes, perspective, and direct next steps.",
    outcome: "You leave with a clearer direction and one simple action path.",
    includes: ["Quick diagnosis", "Next-step clarity", "Action notes"],
    visual: "signal-orb",
  },
  {
    slug: "creative-direction-session",
    tier: "Session",
    title: "Creative Direction Session",
    price: "60 min — $111",
    format: "1 live session",
    status: "Available Now",
    actionType: "book",
    actionLabel: "Book Session",
    actionHref: "/services/inquire?offer=creative-direction-session&intent=book",
    body:
      "A deeper session for shaping a project, release, brand direction, story, creative identity, or personal creative path.",
    bestFor: "Artists, creators, and seekers who need deeper creative direction.",
    youSend: "Music, visuals, links, notes, questions, or a short project summary.",
    youReceive: "Live direction, creative feedback, and a practical next-step roadmap.",
    outcome: "Your idea becomes more organized, grounded, and ready to move.",
    includes: ["Project direction", "Creative feedback", "Next-step roadmap"],
    featured: true,
    visual: "prism",
  },
  {
    slug: "music-daw-workflow-lesson",
    tier: "Lesson",
    title: "Music / DAW Workflow Lesson",
    price: "60 min — $88",
    format: "1 live lesson",
    status: "Available Now",
    actionType: "book",
    actionLabel: "Book Lesson",
    actionHref: "/services/inquire?offer=music-daw-workflow-lesson&intent=book",
    body:
      "Beginner-friendly help with Ableton, Pro Tools, recording workflow, basic music theory, chords, melodies, arrangement, and vocal session setup.",
    bestFor: "Beginners or returning creatives who want practical music help.",
    youSend: "Your DAW questions, current setup, song idea, or what you want to learn.",
    youReceive: "A live lesson, screen-share guidance, and practice steps.",
    outcome: "You understand your tools better and can keep creating with less friction.",
    includes: ["DAW workflow", "Music basics", "Recording setup"],
    visual: "waveform",
  },
];

const AUDIT_OFFERS: Offer[] = [
  {
    slug: "artist-world-audit",
    tier: "Artist",
    title: "Artist World Audit",
    price: "$222",
    format: "Written audit + optional walkthrough",
    status: "Available Now",
    actionType: "buy",
    actionLabel: "Buy Audit",
    actionHref: "/services/inquire?offer=artist-world-audit&intent=buy",
    body:
      "For artists with music, visuals, ideas, content, or a release page who want a clearer world, story, rollout, and listener pathway.",
    bestFor: "Independent artists building identity, story, and release direction.",
    youSend: "Songs, visuals, socials, website/release page, notes, and goals.",
    youReceive: "A written audit with world notes, positioning, and rollout suggestions.",
    outcome: "You understand what your artist world is saying and how to strengthen it.",
    includes: ["Music/project review", "World + story notes", "Rollout suggestions"],
    featured: true,
    visual: "mirror",
  },
  {
    slug: "song-project-development-pack",
    tier: "Project",
    title: "Song / Project Development Pack",
    price: "3 sessions — $333",
    format: "3 live development sessions",
    status: "Available Now",
    actionType: "book",
    actionLabel: "Start Pack",
    actionHref: "/services/inquire?offer=song-project-development-pack&intent=book",
    body:
      "Three focused sessions to develop a song, EP idea, rollout concept, lyrics, hooks, melodies, arrangement, or project direction.",
    bestFor: "Artists who want hands-on support moving one song or project forward.",
    youSend: "Demos, lyrics, references, project notes, and what feels unfinished.",
    youReceive: "Three development sessions with feedback, direction, and assignments.",
    outcome: "Your song or project gets clearer, stronger, and closer to release.",
    includes: ["Song feedback", "Development calls", "Project direction"],
    featured: true,
    visual: "notebook",
  },
  {
    slug: "studio-systems-reset",
    tier: "Studio",
    title: "Studio Systems Reset",
    price: "$444",
    format: "Audit + workflow map + walkthrough",
    status: "Limited Openings",
    actionType: "request",
    actionLabel: "Request Reset",
    actionHref: "/services/inquire?offer=studio-systems-reset&intent=request",
    body:
      "A deeper reset for your recording setup, DAW sessions, templates, file organization, vocal workflow, and creative productivity system.",
    bestFor: "Artists/producers with messy sessions, setup confusion, or workflow drag.",
    youSend:
      "Setup photos, DAW screenshots, session notes, template questions, gear/software list, and workflow pain points.",
    youReceive:
      "A written systems map, setup notes, template suggestions, priority fixes, and a walkthrough call.",
    outcome:
      "Your creative machine becomes cleaner, faster, and easier to return to across all future songs.",
    includes: ["Setup review", "Workflow map", "Template suggestions"],
    visual: "console",
  },
];

const BUILD_WITH_COSMIC: Offer[] = [
  {
    slug: "release-portal-accelerator",
    tier: "Release",
    title: "Release Portal Accelerator",
    price: "Starting at $777",
    format: "Done-with-you release build",
    status: "Limited Openings",
    actionType: "request",
    actionLabel: "Request Portal",
    actionHref: "/services/inquire?offer=release-portal-accelerator&intent=request",
    body:
      "A guided build for artists who want help shaping, customizing, and launching a release portal with story, visuals, track direction, and fan pathway.",
    bestFor: "Artists with a single, EP, album, or campaign they want to launch better.",
    youSend: "Music, cover art, photos, links, story notes, rollout goals, and references.",
    youReceive: "Guided portal setup, world copy, release direction, and launch support.",
    outcome: "Your release has a stronger home, clearer story, and better fan pathway.",
    includes: ["Portal setup", "World copy", "Launch direction"],
    featured: true,
    visual: "portal",
  },
  {
    slug: "cosmic-artist-sprint",
    tier: "Sprint",
    title: "Cosmic Artist Sprint",
    price: "4 weeks — starting at $888",
    format: "Weekly coaching sprint",
    status: "Application Only",
    actionType: "apply",
    actionLabel: "Apply for Sprint",
    actionHref: "/services/inquire?offer=cosmic-artist-sprint&intent=apply",
    body:
      "A focused artist development sprint with weekly calls, music feedback, workflow setup, identity work, practice rhythm, and rollout direction.",
    bestFor: "Artists who want support across music, identity, workflow, and discipline.",
    youSend: "Your music, goals, creative blocks, current systems, and weekly progress.",
    youReceive: "Weekly coaching, feedback, assignments, and a personalized artist roadmap.",
    outcome: "You build momentum, clarity, and a stronger creative system over one month.",
    includes: ["Weekly coaching", "Music + workflow feedback", "Artist roadmap"],
    featured: true,
    visual: "path",
  },
  {
    slug: "creator-system-custom-build",
    tier: "System",
    title: "Creator System Custom Build",
    price: "Starting at $1,500",
    format: "Scoped custom project",
    status: "Custom Quote",
    actionType: "quote",
    actionLabel: "Request Quote",
    actionHref: "/services/inquire?offer=creator-system-custom-build&intent=quote",
    body:
      "A custom website, portfolio, dashboard, fan portal, creative OS, or digital workflow system built around your actual creative process.",
    bestFor: "Creators, artists, and small brands who need something custom.",
    youSend: "Project goals, references, content, features, pages, and workflow needs.",
    youReceive: "A scoped custom build with design, structure, implementation, and launch support.",
    outcome: "You get a digital system built around your real work, not a generic template.",
    includes: ["Custom build", "Workflow design", "Launch support"],
    visual: "blueprint",
  },
];

const TOOLKIT_ITEMS: ToolkitItem[] = [
  {
    category: "Studio",
    title: "Beginner Vocal Recording Chain",
    description:
      "A simple home-studio path for cleaner vocals: mic, interface, headphones, gain staging, and room basics.",
    href: "#toolkit-coming-soon",
    cta: "Coming Soon",
    status: "Coming Soon",
  },
  {
    category: "Music",
    title: "Ableton / Pro Tools Starter Stack",
    description:
      "DAW workflow tools, templates, and learning resources for artists getting organized inside their sessions.",
    href: "#toolkit-coming-soon",
    cta: "Coming Soon",
    status: "Coming Soon",
  },
  {
    category: "Creator Systems",
    title: "Release Planning Toolkit",
    description:
      "Checklists, prompts, and planning resources for moving from song idea to rollout, page, and content path.",
    href: "#toolkit-coming-soon",
    cta: "Coming Soon",
    status: "Coming Soon",
  },
  {
    category: "Practice",
    title: "Creative Rhythm Starter Kit",
    description:
      "Practice, movement, journaling, and accountability resources for building consistency without burning out.",
    href: "#toolkit-coming-soon",
    cta: "Coming Soon",
    status: "Coming Soon",
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
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <article className={`services-offer-card ${offer.featured ? "is-featured" : ""}`}>
      <div className={`services-offer-visual services-visual-${offer.visual || "signal-orb"}`} aria-hidden="true">
        <span />
        <i />
      </div>

      <div className="services-offer-topline">
        <span>{offer.tier}</span>
        {offer.featured && <em>Featured</em>}
      </div>

      <div className="services-offer-meta">
        <span className="services-status">{offer.status}</span>
        <span className="services-action-type">{offer.actionType}</span>
      </div>

      <h3>{offer.title}</h3>
      <p className="services-price">{offer.price}</p>
      <p className="services-format">{offer.format}</p>
      <p className="services-offer-body">{offer.body}</p>

      <ul className="services-offer-includes">
        {offer.includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <button
        type="button"
        className="services-detail-toggle"
        aria-expanded={detailsOpen}
        onClick={() => setDetailsOpen((current) => !current)}
      >
        <span>{detailsOpen ? "Hide details" : "View details"}</span>
        <strong aria-hidden="true">{detailsOpen ? "−" : "+"}</strong>
      </button>

      {detailsOpen && (
        <div className="services-offer-expanded">
          <div className="services-offer-detail"><span>Best for</span><p>{offer.bestFor}</p></div>
          <div className="services-offer-detail"><span>You send</span><p>{offer.youSend}</p></div>
          <div className="services-offer-detail"><span>You receive</span><p>{offer.youReceive}</p></div>
          <div className="services-offer-detail services-outcome"><span>Outcome</span><p>{offer.outcome}</p></div>
        </div>
      )}

      <Link className="services-offer-action" href={offer.actionHref}>{offer.actionLabel}</Link>
    </article>
  );
}

type LayerId = "services" | "process" | "details";

function LayerHeader({ number, title, summary, isOpen, controls, onClick }: {
  number: string;
  title: string;
  summary: string;
  isOpen: boolean;
  controls: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="services-layer-trigger" aria-expanded={isOpen} aria-controls={controls} onClick={onClick}>
      <span className="services-layer-number">{number}</span>
      <span className="services-layer-copy"><strong>{title}</strong><small>{summary}</small></span>
      <span className="services-layer-icon" aria-hidden="true">{isOpen ? "−" : "+"}</span>
    </button>
  );
}

export default function ServicesPage() {
  const [openLayer, setOpenLayer] = useState<LayerId | null>("services");
  const toggleLayer = (layer: LayerId) => setOpenLayer((current) => current === layer ? null : layer);

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
        <p className="services-kicker">Services</p>
        <h1>Build the next<span>version of your work.</span></h1>
        <p className="services-intro">Creative direction, music development, release worlds, workflow systems, and custom digital builds for artists and creators.</p>
        <div className="services-hero-actions">
          <a href="#services-layer">Explore services</a>
          <Link href="/services/inquire?intent=question">Ask what fits</Link>
        </div>
      </section>

      <section className="services-layer-stack" aria-label="Services information">
        <article id="services-layer" className={`services-layer ${openLayer === "services" ? "is-open" : ""}`}>
          <LayerHeader number="01" title="Services" summary="Calls, audits, development, and custom builds." isOpen={openLayer === "services"} controls="services-layer-content" onClick={() => toggleLayer("services")} />
          {openLayer === "services" && (
            <div id="services-layer-content" className="services-layer-content">
              <div className="services-rail-group">
                <div className="services-rail-heading"><div><p className="services-kicker">Start here</p><h2>Focused support without a long commitment.</h2></div><span>Swipe or scroll →</span></div>
                <div className="services-horizontal-rail" aria-label="Start here offers">{START_HERE_OFFERS.map((offer) => <OfferCard key={offer.slug} offer={offer} />)}</div>
              </div>
              <div className="services-rail-group">
                <div className="services-rail-heading"><div><p className="services-kicker">Audits + development</p><h2>Strengthen the project already in motion.</h2></div><span>Swipe or scroll →</span></div>
                <div className="services-horizontal-rail" aria-label="Audit and development offers">{AUDIT_OFFERS.map((offer) => <OfferCard key={offer.slug} offer={offer} />)}</div>
              </div>
              <div className="services-rail-group">
                <div className="services-rail-heading"><div><p className="services-kicker">Build with Cosmic</p><h2>Create the world, system, or release pathway.</h2></div><span>Swipe or scroll →</span></div>
                <div className="services-horizontal-rail" aria-label="Build with Cosmic offers">{BUILD_WITH_COSMIC.map((offer) => <OfferCard key={offer.slug} offer={offer} />)}</div>
              </div>
            </div>
          )}
        </article>

        <article className={`services-layer ${openLayer === "process" ? "is-open" : ""}`}>
          <LayerHeader number="02" title="How it works" summary="Choose, share context, build, and leave with a clear result." isOpen={openLayer === "process"} controls="process-layer-content" onClick={() => toggleLayer("process")} />
          {openLayer === "process" && (
            <div id="process-layer-content" className="services-layer-content">
              <div className="services-process-rail" aria-label="Service process">
                <article><span>01</span><h3>Choose</h3><p>Pick the offer closest to the kind of support you need.</p></article>
                <article><span>02</span><h3>Share</h3><p>Send music, links, notes, questions, references, or the current obstacle.</p></article>
                <article><span>03</span><h3>Build</h3><p>We work through the project, system, story, or creative decision together.</p></article>
                <article><span>04</span><h3>Move</h3><p>Leave with direction, deliverables, or a concrete next-step roadmap.</p></article>
              </div>
              <div className="services-support-card"><div><p className="services-kicker">Not sure what fits?</p><h2>Send the context. I’ll point you toward the cleanest next step.</h2><p>You do not need to diagnose the service yourself. Tell me what you are building, where it feels stuck, and what result you want.</p></div><Link href="/services/inquire?intent=question">Ask what fits</Link></div>
            </div>
          )}
        </article>

        <article className={`services-layer ${openLayer === "details" ? "is-open" : ""}`}>
          <LayerHeader number="03" title="Explore + details" summary="Free pathways, capabilities, future tools, and payment information." isOpen={openLayer === "details"} controls="details-layer-content" onClick={() => toggleLayer("details")} />
          {openLayer === "details" && (
            <div id="details-layer-content" className="services-layer-content">
              <div className="services-details-block">
                <div className="services-rail-heading"><div><p className="services-kicker">Free universe</p><h2>Explore the ecosystem before booking.</h2></div><span>Swipe or scroll →</span></div>
                <div className="services-detail-rail">{FREE_UNIVERSE.map((signal) => <Link key={signal.href} href={signal.href} className="services-free-card"><span>{signal.eyebrow}</span><h3>{signal.title}</h3><p>{signal.body}</p><strong>{signal.cta}</strong></Link>)}</div>
              </div>
              <div className="services-skills-compact"><div><p className="services-kicker">Capabilities</p><h2>Music, systems, story, workflow, and practice.</h2></div><div className="services-skill-cloud">{SKILL_AREAS.map((skill) => <span key={skill}>{skill}</span>)}</div></div>
              <div id="toolkit-coming-soon" className="services-details-block">
                <div className="services-rail-heading"><div><p className="services-kicker">Toolkit</p><h2>Resources in development.</h2></div><span>Swipe or scroll →</span></div>
                <div className="services-detail-rail">{TOOLKIT_ITEMS.map((item) => <article key={item.title} className="services-toolkit-card"><div className="services-offer-meta"><span className="services-status">{item.status}</span><span className="services-action-type">{item.category}</span></div><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
              </div>
              <div className="services-payment-compact"><div><p className="services-kicker">Payment + accounts</p><h2>Simple offers, clear next steps.</h2><p>Calls, lessons, and audits can use direct booking or payment links. Custom builds begin with scope, quote, and deposit.</p></div><div className="services-payment-list"><span>Calls + lessons → booking link</span><span>Audits → intake + payment</span><span>Custom builds → quote + deposit</span><span>Future clients → project account</span></div></div>
            </div>
          )}
        </article>
      </section>

      <section className="services-cta services-cta-compact"><p className="services-kicker">Ready to work?</p><h2>Choose the path that matches your stage.</h2><div className="services-cta-actions"><Link href="/services/inquire?intent=question">Ask what fits</Link><Link href="/nexus">Return to Nexus</Link></div></section>
    </main>
  );
}
