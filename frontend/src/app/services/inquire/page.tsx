// src/app/services/inquire/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "@/styles/servicesPage.css";
import CosmicBackground from "@/components/CosmicBackground";

const OFFER_OPTIONS = [
  { slug: "not-sure", label: "Not sure yet / help me choose" },
  { slug: "cosmic-clarity-call", label: "Cosmic Clarity Call — 30 min / $55" },
  { slug: "creative-direction-session", label: "Creative Direction Session — 60 min / $111" },
  { slug: "music-daw-workflow-lesson", label: "Music / DAW Workflow Lesson — 60 min / $88" },
  { slug: "artist-world-audit", label: "Artist World Audit — $222" },
  { slug: "song-project-development-pack", label: "Song / Project Development Pack — 3 sessions / $333" },
  { slug: "studio-systems-reset", label: "Studio Systems Reset — $444" },
  { slug: "release-portal-accelerator", label: "Release Portal Accelerator — starting at $777" },
  { slug: "cosmic-artist-sprint", label: "Cosmic Artist Sprint — 4 weeks / starting at $888" },
  { slug: "creator-system-custom-build", label: "Creator System Custom Build — starting at $1,500" },
];

function getOfferLabel(slug: string) {
  return OFFER_OPTIONS.find((option) => option.slug === slug)?.label || OFFER_OPTIONS[0].label;
}

function InquiryForm() {
  const searchParams = useSearchParams();
  const initialOffer = searchParams?.get("offer") || "not-sure";
  const safeInitialOffer = OFFER_OPTIONS.some((option) => option.slug === initialOffer)
    ? initialOffer
    : "not-sure";

  const [offer, setOffer] = useState(safeInitialOffer);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectLinks, setProjectLinks] = useState("");
  const [timeline, setTimeline] = useState("");
  const [paymentPreference, setPaymentPreference] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(() => {
    const selectedOffer = getOfferLabel(offer);
    const subject = `Services Inquiry — ${selectedOffer}`;
    const body = [
      `Name: ${name || ""}`,
      `Email: ${email || ""}`,
      `Offer: ${selectedOffer}`,
      "",
      `Project / links: ${projectLinks || ""}`,
      `Timeline / urgency: ${timeline || ""}`,
      `Preferred payment method: ${paymentPreference || ""}`,
      "",
      "What I need help with:",
      message || "",
    ].join("\n");

    return `mailto:chris.c.gordon777@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [email, message, name, offer, paymentPreference, projectLinks, timeline]);

  return (
    <section className="services-inquire-card">
      <p className="services-kicker">Service Inquiry</p>
      <h1>Tell me what you want to build.</h1>
      <p>
        Choose the offer that feels closest, share your context, and the button will open a
        prefilled email. This keeps the flow public and simple while payment links and client
        accounts are being built.
      </p>

      <div className="services-inquire-grid">
        <label>
          <span>Offer</span>
          <select value={offer} onChange={(event) => setOffer(event.target.value)}>
            {OFFER_OPTIONS.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
          />
        </label>

        <label>
          <span>Timeline</span>
          <input
            value={timeline}
            onChange={(event) => setTimeline(event.target.value)}
            placeholder="ASAP, this month, flexible..."
          />
        </label>

        <label>
          <span>Payment preference</span>
          <select value={paymentPreference} onChange={(event) => setPaymentPreference(event.target.value)}>
            <option value="">Choose one</option>
            <option value="PayPal">PayPal</option>
            <option value="Cash App">Cash App</option>
            <option value="Stripe / card">Stripe / card</option>
            <option value="Invoice">Invoice</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </label>

        <label className="services-inquire-wide">
          <span>Project links</span>
          <input
            value={projectLinks}
            onChange={(event) => setProjectLinks(event.target.value)}
            placeholder="Music, website, social, Dropbox, Drive, references..."
          />
        </label>

        <label className="services-inquire-wide">
          <span>What do you need help with?</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share what you are building, where you feel stuck, and what kind of support would help."
          />
        </label>
      </div>

      <div className="services-inquire-actions">
        <a href={mailtoHref}>Open Email Inquiry</a>
        <Link href="/services">Back to Services</Link>
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
