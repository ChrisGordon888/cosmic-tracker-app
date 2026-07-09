// src/app/services/inquire/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "@/styles/servicesPage.css";
import CosmicBackground from "@/components/CosmicBackground";

const OFFER_OPTIONS = [
  { slug: "not-sure", label: "Not sure yet / help me choose" },
  { slug: "cosmic-clarity-call", label: "Cosmic Clarity Call" },
  { slug: "creative-direction-session", label: "Creative Direction Session" },
  { slug: "music-daw-workflow-lesson", label: "Music / DAW Workflow Lesson" },
  { slug: "artist-world-audit", label: "Artist World Audit" },
  { slug: "song-project-development-pack", label: "Song / Project Development Pack" },
  { slug: "studio-systems-reset", label: "Studio Systems Reset" },
  { slug: "release-portal-accelerator", label: "Release Portal Accelerator" },
  { slug: "cosmic-artist-sprint", label: "Cosmic Artist Sprint" },
  { slug: "creator-system-custom-build", label: "Creator System Custom Build" },
];

const INTENT_LABELS: Record<string, string> = {
  book: "I want to book this offer",
  buy: "I want to buy this offer",
  request: "I want to request this service",
  apply: "I want to apply",
  quote: "I want a quote",
  question: "I have a question",
};

function InquiryForm() {
  const searchParams = useSearchParams();
  const initialOffer = searchParams?.get("offer") || "not-sure";
  const initialIntent = searchParams?.get("intent") || "question";

  const [offer, setOffer] = useState(
    OFFER_OPTIONS.some((option) => option.slug === initialOffer) ? initialOffer : "not-sure",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [links, setLinks] = useState("");
  const [timeline, setTimeline] = useState("");
  const [message, setMessage] = useState("");

  const selectedOffer = useMemo(
    () => OFFER_OPTIONS.find((option) => option.slug === offer) || OFFER_OPTIONS[0],
    [offer],
  );

  const intentLabel = INTENT_LABELS[initialIntent] || INTENT_LABELS.question;

  const mailtoHref = useMemo(() => {
    const subject = `Services Inquiry — ${selectedOffer.label}`;
    const body = [
      `Intent: ${intentLabel}`,
      `Offer: ${selectedOffer.label}`,
      `Name: ${name || ""}`,
      `Email: ${email || ""}`,
      `Links: ${links || ""}`,
      `Timeline: ${timeline || ""}`,
      "",
      "What I'm building / what I need help with:",
      message || "",
    ].join("%0D%0A");

    return `mailto:chris.c.gordon777@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
  }, [email, intentLabel, links, message, name, selectedOffer.label, timeline]);

  return (
    <section className="services-inquire-card">
      <div className="services-inquire-heading">
        <p className="services-kicker">Services Inquiry</p>
        <h1>Tell me what you are building.</h1>
        <p>
          Choose the offer, share your context, then open a prefilled email. This keeps the
          flow public and simple while payment links, booking links, and future client
          accounts are added.
        </p>
      </div>

      <form className="services-inquire-form">
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

        <label>
          Links to music / socials / website / project
          <textarea
            value={links}
            onChange={(event) => setLinks(event.target.value)}
            placeholder="Paste links here..."
          />
        </label>

        <label>
          Timeline / preferred timing
          <input
            value={timeline}
            onChange={(event) => setTimeline(event.target.value)}
            placeholder="Example: this week, this month, before my next release..."
          />
        </label>

        <label>
          What do you need help with?
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tell me what you are building, where you feel stuck, and what kind of support you want."
          />
        </label>

        <div className="services-inquire-actions">
          <a href={mailtoHref}>Open Email Inquiry</a>
          <Link href="/services">Back to Services</Link>
        </div>
      </form>
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
