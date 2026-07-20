// src/app/services/inquire/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "@/styles/servicesPage.css";
import CosmicBackground from "@/components/CosmicBackground";

type OfferOption = {
  slug: string;
  label: string;
  category: string;
  price: string;
  short: string;
  bestFor: string;
  outcome?: string;
  sendPrompt?: string;
  messagePrompt?: string;
};

const OFFER_OPTIONS: OfferOption[] = [
  {
    slug: "not-sure",
    label: "Not sure yet / help me choose",
    category: "Question",
    price: "Open inquiry",
    short: "Send the situation and I’ll help point you toward the best next step.",
    bestFor: "Anyone who resonates with the work but does not know which offer fits.",
  },
  {
    slug: "cosmic-clarity-call",
    label: "Cosmic Clarity Call",
    category: "Call",
    price: "30 min — $55",
    short: "A focused call for quick creative, emotional, workflow, or next-step clarity.",
    bestFor: "Quick direction, creative stuckness, or choosing the next move.",
  },
  {
    slug: "creative-direction-session",
    label: "Creative Direction Session",
    category: "Session",
    price: "60 min — $111",
    short: "A deeper session for shaping a project, release, brand direction, story, or creative path.",
    bestFor: "Artists, creators, and seekers who need deeper creative direction.",
    outcome: "You leave with clearer positioning, feedback, and a practical next-step roadmap.",
    sendPrompt: "Paste demos, socials, visuals, notes, references, release pages, or any links that show what you are building.",
    messagePrompt: "Tell me what you are making, what feels unclear, what decision you need help with, and what you would love to leave the session knowing.",
  },
  {
    slug: "music-daw-workflow-lesson",
    label: "Music / DAW Workflow Lesson",
    category: "Lesson",
    price: "60 min — $88",
    short: "Beginner-friendly help with Ableton, Pro Tools, recording workflow, chords, and session setup.",
    bestFor: "Beginners or returning creatives who want practical music help.",
  },
  {
    slug: "artist-world-audit",
    label: "Artist World Audit",
    category: "Audit",
    price: "$222",
    short: "A review of music, visuals, story, rollout, release page, and listener pathway.",
    bestFor: "Independent artists building identity, story, and release direction.",
  },
  {
    slug: "song-project-development-pack",
    label: "Song / Project Development Pack",
    category: "Project",
    price: "3 sessions — $333",
    short: "Three focused sessions to develop a song, EP idea, rollout concept, lyrics, or project direction.",
    bestFor: "Artists who want hands-on support moving one song or project forward.",
  },
  {
    slug: "studio-systems-reset",
    label: "Studio Systems Reset",
    category: "Studio",
    price: "$444",
    short: "A deeper reset for recording setup, DAW sessions, templates, files, and creative workflow.",
    bestFor: "Artists/producers with messy sessions, setup confusion, or workflow drag.",
  },
  {
    slug: "release-portal-accelerator",
    label: "Release Portal Accelerator",
    category: "Release",
    price: "Starting at $777",
    short: "A guided build for shaping, customizing, and launching a release portal.",
    bestFor: "Artists with a single, EP, album, or campaign they want to launch better.",
  },
  {
    slug: "cosmic-artist-sprint",
    label: "Cosmic Artist Sprint",
    category: "Sprint",
    price: "4 weeks — starting at $888",
    short: "A focused artist development sprint with weekly calls, feedback, workflow, and rollout direction.",
    bestFor: "Artists who want support across music, identity, workflow, and discipline.",
  },
  {
    slug: "creator-system-custom-build",
    label: "Creator System Custom Build",
    category: "System",
    price: "Starting at $1,500",
    short: "A custom website, portfolio, dashboard, fan portal, creative OS, or digital workflow system.",
    bestFor: "Creators, artists, and small brands who need something custom.",
  },
];

const INTENT_OPTIONS = [
  { slug: "question", label: "I have a question" },
  { slug: "book", label: "I want to book" },
  { slug: "buy", label: "I want to buy" },
  { slug: "request", label: "I want to request this service" },
  { slug: "apply", label: "I want to apply" },
  { slug: "quote", label: "I want a quote" },
];

const CONTACT_OPTIONS = [
  "Email is best",
  "Text/call after we connect",
  "Zoom / Google Meet",
  "Not sure yet",
];

const PAYMENT_OPTIONS = [
  "I’m open to PayPal / Cash App / invoice",
  "I prefer a booking link",
  "I prefer an invoice",
  "I have questions before payment",
];

function getSafeOption<T extends { slug: string }>(options: T[], value: string | null, fallback: string) {
  return options.some((option) => option.slug === value) ? value || fallback : fallback;
}

function InquiryForm() {
  const searchParams = useSearchParams();
  const initialOffer = searchParams?.get("offer") || "not-sure";
  const initialIntent = searchParams?.get("intent") || "question";

  const [offer, setOffer] = useState(getSafeOption(OFFER_OPTIONS, initialOffer, "not-sure"));
  const [intent, setIntent] = useState(getSafeOption(INTENT_OPTIONS, initialIntent, "question"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [links, setLinks] = useState("");
  const [timeline, setTimeline] = useState("");
  const [contactPreference, setContactPreference] = useState(CONTACT_OPTIONS[0]);
  const [paymentPreference, setPaymentPreference] = useState(PAYMENT_OPTIONS[0]);
  const [message, setMessage] = useState("");

  const selectedOffer = useMemo(
    () => OFFER_OPTIONS.find((option) => option.slug === offer) || OFFER_OPTIONS[0],
    [offer],
  );

  const selectedIntent = useMemo(
    () => INTENT_OPTIONS.find((option) => option.slug === intent) || INTENT_OPTIONS[0],
    [intent],
  );

  const isCreativeDirection = selectedOffer.slug === "creative-direction-session";
  const linkPlaceholder =
    selectedOffer.sendPrompt ||
    "Paste Spotify, SoundCloud, Google Drive, socials, website, release page, references, or project links.";
  const messagePlaceholder =
    selectedOffer.messagePrompt ||
    "Tell me what you are building, where you feel stuck, what you want support with, and what a good outcome would look like.";

  const mailtoHref = useMemo(() => {
    const subject = `Services Inquiry — ${selectedOffer.label}`;
    const body = [
      `Intent: ${selectedIntent.label}`,
      `Offer: ${selectedOffer.label}`,
      `Price / range: ${selectedOffer.price}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Preferred contact: ${contactPreference}`,
      `Payment preference: ${paymentPreference}`,
      `Timeline / preferred timing: ${timeline}`,
      "",
      "Links / references / project materials:",
      links,
      "",
      isCreativeDirection
        ? "Creative Direction focus — what I'm building, what feels unclear, and what I want to leave with:"
        : "What I'm building / what I need help with:",
      message,
      "",
      "Anything else Chris should know:",
    ].join("\n");

    return `mailto:chris.c.gordon777@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [
    contactPreference,
    email,
    links,
    message,
    name,
    paymentPreference,
    isCreativeDirection,
    selectedIntent.label,
    selectedOffer.label,
    selectedOffer.price,
    timeline,
  ]);

  return (
    <section className="services-inquire-card services-inquire-card-v2">
      <div className="services-inquire-heading">
        <nav className="services-nav services-inquire-nav" aria-label="Inquiry navigation">
          <Link href="/services">Services</Link>
          <Link href="/nexus">Nexus</Link>
          <Link href="/practice">Practice</Link>
        </nav>

        <p className="services-kicker">Services Front Desk</p>
        <h1>{isCreativeDirection ? "Book Creative Direction." : "Tell me what you are building."}</h1>
        <p>
          {isCreativeDirection
            ? "Send the project context you already have. A few links, notes, questions, or demos are enough to start the session cleanly."
            : "You do not need to have everything perfect. Choose the closest offer, send the context you have, and I’ll help clarify the cleanest next step."}
        </p>
      </div>

      <div className="services-inquire-layout">
        <aside className="services-inquire-summary" aria-label="Selected offer summary">
          <div className="services-inquire-selected-card">
            <div className="services-offer-meta">
              <span className="services-status">{selectedOffer.category}</span>
              <span className="services-action-type">{selectedIntent.slug}</span>
            </div>

            <h2>{selectedOffer.label}</h2>
            <p className="services-price">{selectedOffer.price}</p>
            <p>{selectedOffer.short}</p>

            <div className="services-offer-detail services-outcome">
              <span>Best For</span>
              <p>{selectedOffer.bestFor}</p>
            </div>
          </div>

          <div className="services-inquire-path">
            <article>
              <span>01</span>
              <strong>{isCreativeDirection ? "Reserve the session" : "Choose the closest offer"}</strong>
              <p>{isCreativeDirection ? "Use this request to start the booking conversation." : "You can choose “not sure” if you need direction first."}</p>
            </article>

            <article>
              <span>02</span>
              <strong>Send your context</strong>
              <p>{isCreativeDirection ? "Demos, visuals, links, questions, and the part that needs direction." : "Links, goals, stuck points, timeline, and what you want help with."}</p>
            </article>

            <article>
              <span>03</span>
              <strong>{isCreativeDirection ? "Confirm the path" : "Get the next step"}</strong>
              <p>{isCreativeDirection ? "I’ll reply with timing, payment/booking direction, and how to prepare." : "I’ll reply with fit, booking/payment direction, or a better recommendation."}</p>
            </article>
          </div>
        </aside>

        <form className="services-inquire-form services-inquire-form-v2">
          <div className="services-inquire-grid">
            <label>
              Offer
              <select value={offer} onChange={(event) => setOffer(event.target.value)}>
                {OFFER_OPTIONS.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Intent
              <select value={intent} onChange={(event) => setIntent(event.target.value)}>
                {INTENT_OPTIONS.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="services-inquire-grid">
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
          </div>

          <label>
            Links to music / socials / website / project
            <textarea
              value={links}
              onChange={(event) => setLinks(event.target.value)}
              placeholder={linkPlaceholder}
            />
          </label>

          <div className="services-inquire-grid">
            <label>
              Timeline / preferred timing
              <input
                value={timeline}
                onChange={(event) => setTimeline(event.target.value)}
                placeholder="Example: this week, this month, before my next release..."
              />
            </label>

            <label>
              Preferred contact
              <select value={contactPreference} onChange={(event) => setContactPreference(event.target.value)}>
                {CONTACT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Payment / booking preference
            <select value={paymentPreference} onChange={(event) => setPaymentPreference(event.target.value)}>
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            {isCreativeDirection ? "Creative Direction focus" : "What do you need help with?"}
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={messagePlaceholder}
            />
          </label>

          <div className="services-inquire-note">
            <strong>Before you send:</strong>
            <p>
              {isCreativeDirection
                ? "Rough links and honest context are enough. This opens your email app with a Creative Direction request prefilled so you can edit before sending."
                : "A few rough links and honest context are enough. This form opens your email app with everything prefilled, so you can edit before sending."}
            </p>
          </div>

          <div className="services-inquire-actions">
            <a href={mailtoHref}>{isCreativeDirection ? "Open Booking Inquiry" : "Open Email Inquiry"}</a>
            <Link href="/services">Back to Services</Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function ServicesInquiryPage() {
  return (
    <main className="services-page services-inquire-page">
      <CosmicBackground />
      <Suspense fallback={<section className="services-inquire-card">Loading inquiry...</section>}>
        <InquiryForm />
      </Suspense>
    </main>
  );
}
