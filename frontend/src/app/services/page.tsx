// src/app/services/page.tsx
"use client";

import Link from "next/link";
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
  return (
    <article className={`services-offer-card ${offer.featured ? "is-featured" : ""}`}>
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

      <Link className="services-offer-action" href={offer.actionHref}>
        {offer.actionLabel}
      </Link>
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
          <Link href="/services/inquire?intent=question">Ask a Question</Link>
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
            <OfferCard key={offer.slug} offer={offer} />
          ))}
        </div>

        <div className="services-section-support">
          <p>Not sure which entry offer fits?</p>
          <Link href="/services/inquire?intent=question">Ask a Question</Link>
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
            <OfferCard key={offer.slug} offer={offer} />
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
            <OfferCard key={offer.slug} offer={offer} />
          ))}
        </div>
      </section>

      <section className="services-toolkit" aria-labelledby="toolkit-heading">
        <div className="services-section-heading">
          <p className="services-kicker">Cosmic Toolkit</p>
          <h2 id="toolkit-heading">Tools, templates, gear, and resources.</h2>
          <p>
            This section is affiliate-ready for future recommendations, templates, and
            resources. Some links may become affiliate links. I only share tools I use,
            trust, or genuinely recommend.
          </p>
        </div>

        <div className="services-toolkit-grid">
          {TOOLKIT_ITEMS.map((item) => (
            <article key={item.title} className="services-toolkit-card">
              <div className="services-offer-meta">
                <span className="services-status">{item.status}</span>
                <span className="services-action-type">{item.category}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href={item.href}>{item.cta}</a>
            </article>
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
          <p className="services-kicker">Payment + accounts</p>
          <h2>Payment links can be added as each offer goes live.</h2>
          <p>
            Calls, lessons, and audits can later point to PayPal, Cash App, Stripe Payment
            Links, Calendly, or invoices. After purchase, clients can be invited to create
            an account for future project notes, resources, and status tracking.
          </p>
        </div>

        <div className="services-payment-list">
          <span>Simple offers → book/pay link</span>
          <span>Audits → payment or intake first</span>
          <span>Custom builds → quote + deposit</span>
          <span>Future clients → account portal</span>
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
          <Link href="/services/inquire?intent=question">Ask What Fits</Link>
          <Link href="/nexus">Return to Nexus</Link>
        </div>
      </section>
    </main>
  );
}
