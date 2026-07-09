// src/app/services/page.tsx
"use client";

import Link from "next/link";
import "@/styles/servicesPage.css";
import CosmicBackground from "@/components/CosmicBackground";

type Offer = {
  slug: string;
  tier: string;
  title: string;
  price: string;
  format: string;
  body: string;
  bestFor: string;
  youSend: string;
  youReceive: string;
  outcome: string;
  includes: string[];
  cta: string;
  paymentHref?: string;
  paymentCta?: string;
  featured?: boolean;
};

type ToolkitLink = {
  category: string;
  title: string;
  description: string;
  href: string;
  tag: string;
  affiliate?: boolean;
};

const inquiryHref = (slug: string) => `/services/inquire?offer=${slug}`;

const START_HERE_OFFERS: Offer[] = [
  {
    slug: "cosmic-clarity-call",
    tier: "Call",
    title: "Cosmic Clarity Call",
    price: "30 min — $55",
    format: "1 live call",
    body:
      "A focused call for quick creative, emotional, workflow, or next-step clarity.",
    bestFor: "Quick direction, creative stuckness, or choosing the next move.",
    youSend: "Your question, current challenge, or what you are trying to decide.",
    youReceive: "A focused call with notes, perspective, and direct next steps.",
    outcome: "You leave with a clearer direction and one simple action path.",
    includes: ["Quick diagnosis", "Next-step clarity", "Action notes"],
    cta: "Inquire",
    paymentHref: "#payment-link-coming-soon",
    paymentCta: "Pay / Book Soon",
  },
  {
    slug: "creative-direction-session",
    tier: "Session",
    title: "Creative Direction Session",
    price: "60 min — $111",
    format: "1 live session",
    body:
      "A deeper session for shaping a project, release, brand direction, story, creative identity, or personal creative path.",
    bestFor: "Artists, creators, and seekers who need deeper creative direction.",
    youSend: "Music, visuals, links, notes, questions, or a short project summary.",
    youReceive: "Live direction, creative feedback, and a practical next-step roadmap.",
    outcome: "Your idea becomes more organized, grounded, and ready to move.",
    includes: ["Project direction", "Creative feedback", "Next-step roadmap"],
    cta: "Inquire",
    paymentHref: "#payment-link-coming-soon",
    paymentCta: "Pay / Book Soon",
    featured: true,
  },
  {
    slug: "music-daw-workflow-lesson",
    tier: "Lesson",
    title: "Music / DAW Workflow Lesson",
    price: "60 min — $88",
    format: "1 live lesson",
    body:
      "Beginner-friendly help with Ableton, Pro Tools, recording workflow, basic music theory, chords, melodies, arrangement, and vocal session setup.",
    bestFor: "Beginners or returning creatives who want practical music help.",
    youSend: "Your DAW questions, current setup, song idea, or what you want to learn.",
    youReceive: "A live lesson, screen-share guidance, and practice steps.",
    outcome: "You understand your tools better and can keep creating with less friction.",
    includes: ["DAW workflow", "Music basics", "Recording setup"],
    cta: "Inquire",
    paymentHref: "#payment-link-coming-soon",
    paymentCta: "Pay / Book Soon",
  },
];

const AUDIT_OFFERS: Offer[] = [
  {
    slug: "artist-world-audit",
    tier: "Artist",
    title: "Artist World Audit",
    price: "$222",
    format: "Written audit + optional walkthrough",
    body:
      "For artists with music, visuals, ideas, content, or a release page who want a clearer world, story, rollout, and listener pathway.",
    bestFor: "Independent artists building identity, story, and release direction.",
    youSend: "Songs, visuals, socials, website/release page, notes, and goals.",
    youReceive: "A written audit with world notes, positioning, and rollout suggestions.",
    outcome: "You understand what your artist world is saying and how to strengthen it.",
    includes: ["Music/project review", "World + story notes", "Rollout suggestions"],
    cta: "Request Audit",
    paymentHref: "#payment-link-coming-soon",
    paymentCta: "Pay Soon",
    featured: true,
  },
  {
    slug: "song-project-development-pack",
    tier: "Project",
    title: "Song / Project Development Pack",
    price: "3 sessions — $333",
    format: "3 live development sessions",
    body:
      "Three focused sessions to develop a song, EP idea, rollout concept, lyrics, hooks, melodies, arrangement, or project direction.",
    bestFor: "Artists who want hands-on support moving one project forward.",
    youSend: "Demos, lyrics, references, project notes, and what feels unfinished.",
    youReceive: "Three development sessions with feedback, direction, and assignments.",
    outcome: "Your song or project gets clearer, stronger, and closer to release.",
    includes: ["Song feedback", "Development calls", "Project direction"],
    cta: "Develop Project",
    paymentHref: "#payment-link-coming-soon",
    paymentCta: "Pay Soon",
    featured: true,
  },
  {
    slug: "studio-systems-reset",
    tier: "Studio",
    title: "Studio Systems Reset",
    price: "$444",
    format: "Audit + workflow map + walkthrough",
    body:
      "A deeper reset for your recording setup, DAW sessions, templates, file organization, vocal workflow, and creative productivity system.",
    bestFor: "Artists/producers with messy sessions, setup confusion, or workflow drag.",
    youSend: "Setup photos, DAW screenshots, session notes, template questions, and workflow pain points.",
    youReceive: "A written workflow map, setup notes, template suggestions, and a walkthrough.",
    outcome: "Your creative machine becomes cleaner, faster, and easier to return to.",
    includes: ["Setup review", "Workflow map", "Template suggestions"],
    cta: "Request Reset",
  },
];

const BUILD_WITH_COSMIC: Offer[] = [
  {
    slug: "release-portal-accelerator",
    tier: "Release",
    title: "Release Portal Accelerator",
    price: "Starting at $777",
    format: "Done-with-you release build",
    body:
      "A guided build for artists who want help shaping, customizing, and launching a release portal with story, visuals, track direction, and fan pathway.",
    bestFor: "Artists with a single, EP, album, or campaign they want to launch better.",
    youSend: "Music, cover art, photos, links, story notes, rollout goals, and references.",
    youReceive: "Guided portal setup, world copy, release direction, and launch support.",
    outcome: "Your release has a stronger home, clearer story, and better fan pathway.",
    includes: ["Portal setup", "World copy", "Launch direction"],
    cta: "Request Portal",
    featured: true,
  },
  {
    slug: "cosmic-artist-sprint",
    tier: "Sprint",
    title: "Cosmic Artist Sprint",
    price: "4 weeks — starting at $888",
    format: "Weekly coaching sprint",
    body:
      "A focused artist development sprint with weekly calls, music feedback, workflow setup, identity work, practice rhythm, and rollout direction.",
    bestFor: "Artists who want support across music, identity, workflow, and discipline.",
    youSend: "Your music, goals, creative blocks, current systems, and weekly progress.",
    youReceive: "Weekly coaching, feedback, assignments, and a personalized artist roadmap.",
    outcome: "You build momentum, clarity, and a stronger creative system over one month.",
    includes: ["Weekly coaching", "Music + workflow feedback", "Artist roadmap"],
    cta: "Apply for Sprint",
    featured: true,
  },
  {
    slug: "creator-system-custom-build",
    tier: "System",
    title: "Creator System Custom Build",
    price: "Starting at $1,500",
    format: "Scoped custom project",
    body:
      "A custom website, portfolio, dashboard, fan portal, creative OS, or digital workflow system built around your actual creative process.",
    bestFor: "Creators, artists, and small brands who need something custom.",
    youSend: "Project goals, references, content, features, pages, and workflow needs.",
    youReceive: "A scoped custom build with design, structure, implementation, and launch support.",
    outcome: "You get a digital system built around your real work, not a generic template.",
    includes: ["Custom build", "Workflow design", "Launch support"],
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

const TOOLKIT_LINKS: ToolkitLink[] = [
  {
    category: "Studio",
    title: "Beginner Vocal Recording Chain",
    description:
      "A future gear list for recording cleaner vocals at home: mic, interface, headphones, room treatment, and simple signal flow.",
    href: "#toolkit-coming-soon",
    tag: "Coming soon",
    affiliate: true,
  },
  {
    category: "Music",
    title: "DAW + Workflow Resources",
    description:
      "Recommended tools, templates, and learning resources for Ableton, Pro Tools, writing, arranging, and finishing songs.",
    href: "#toolkit-coming-soon",
    tag: "Affiliate ready",
    affiliate: true,
  },
  {
    category: "Creator",
    title: "Creator Systems Stack",
    description:
      "Hosting, domains, dashboards, design tools, and productivity systems for artists building their online world.",
    href: "#toolkit-coming-soon",
    tag: "Recommended",
    affiliate: true,
  },
  {
    category: "Practice",
    title: "Practice + Performance Kit",
    description:
      "Future resources for yoga, mobility, recovery, journaling, breathwork, and daily creative rhythm.",
    href: "#toolkit-coming-soon",
    tag: "Coming soon",
    affiliate: true,
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
      <p className="services-format">Format: {offer.format}</p>
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

      <div className="services-card-actions">
        <Link href={inquiryHref(offer.slug)}>{offer.cta}</Link>
        {offer.paymentHref && (
          <a className="services-secondary-action" href={offer.paymentHref}>
            {offer.paymentCta || "Pay Now"}
          </a>
        )}
      </div>
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
          <Link href="/services/inquire?offer=not-sure">Ask What Fits</Link>
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

      <section className="services-toolkit" aria-labelledby="toolkit-heading">
        <div className="services-section-heading">
          <p className="services-kicker">Cosmic Toolkit</p>
          <h2 id="toolkit-heading">Tools, gear, templates, and resources I recommend.</h2>
          <p>
            This section is affiliate-ready. Some links may eventually be affiliate links;
            I only want to share tools I use, trust, or genuinely recommend.
          </p>
        </div>

        <div className="services-toolkit-grid">
          {TOOLKIT_LINKS.map((tool) => (
            <a key={tool.title} href={tool.href} className="services-toolkit-card">
              <div className="services-offer-topline">
                <span>{tool.category}</span>
                {tool.affiliate && <em>Affiliate Ready</em>}
              </div>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <strong>{tool.tag}</strong>
            </a>
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
          <h2>Payment links can be added offer-by-offer.</h2>
          <p>
            The inquiry flow is live first. As each offer becomes active, the buttons can
            point to PayPal, Cash App, Stripe Payment Links, Calendly, or invoices depending
            on the offer.
          </p>
        </div>

        <div className="services-payment-list">
          <span>Calls → book/pay link</span>
          <span>Audits → payment link</span>
          <span>Custom builds → quote + deposit</span>
          <span>Sprints → application first</span>
          <span>Toolkit → affiliate links</span>
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
          <Link href="/services/inquire?offer=not-sure">Ask What Fits</Link>
          <Link href="/nexus">Return to Nexus</Link>
        </div>
      </section>
    </main>
  );
}
