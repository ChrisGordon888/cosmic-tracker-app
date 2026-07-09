// src/app/services/inquire/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "@/styles/servicesPage.css";
import CosmicBackground from "@/components/CosmicBackground";

const OFFER_OPTIONS = [
  { slug: "cosmic-clarity-call", label: "Cosmic Clarity Call" },
  { slug: "creative-direction-session", label: "Creative Direction Session" },
  { slug: "music-daw-workflow-lesson", label: "Music / DAW Workflow Lesson" },
  { slug: "artist-world-audit", label: "Artist World Audit" },
  { slug: "song-project-development-pack", label: "Song / Project Development Pack" },
  { slug: "studio-systems-reset", label: "Studio Systems Reset" },
  { slug: "release-portal-accelerator", label: "Release Portal Accelerator" },
  { slug: "cosmic-artist-sprint", label: "Cosmic Artist Sprint" },
  { slug: "creator-system-custom-build", label: "Creator System Custom Build" },
  { slug: "not-sure", label: "Not sure yet" },
];

function InquiryForm() {
  const searchParams = useSearchParams();
  const initialOffer = searchParams.get("offer") || "not-sure";
  const [offer, setOffer] = useState(
    OFFER_OPTIONS.some((option) => option.slug === initialOffer) ? initialOffer : "not-sure",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("");
  const [links, setLinks] = useState("");
  const [timeline, setTimeline] = useState("");
  const [paymentPreference, setPaymentPreference] = useState("PayPal / Cash App / invoice is fine");

  const selectedOffer = OFFER_OPTIONS.find((option) => option.slug === offer)?.label || "Not sure yet";

  const mailtoHref = useMemo(() => {
    const subject = `Services inquiry — ${selectedOffer}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Offer: ${selectedOffer}`,
      "",
      "What are you building / what do you need help with?",
      project,
      "",
      "Relevant links:",
      links,
      "",
      "Timeline / preferred call times:",
      timeline,
      "",
      "Preferred payment method:",
      paymentPreference,
    ].join("\n");

    return `mailto:chris.c.gordon777@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [email, links, name, paymentPreference, project, selectedOffer, timeline]);

  return (
    <section className="services-inquiry-card">
      <div className="services-section-heading">
        <p className="services-kicker">Services Inquiry</p>
        <h1>Tell me what you are building.</h1>
        <p>
          Choose the offer that feels closest. This opens an email with your answers
          so we can confirm fit, payment, timeline, and next steps.
        </p>
      </div>

      <form className="services-inquiry-form">
        <label>
          <span>Which offer?</span>
          <select value={offer} onChange={(event) => setOffer(event.target.value)}>
            {OFFER_OPTIONS.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="services-inquiry-row">
          <label>
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
          </label>

          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" />
          </label>
        </div>

        <label>
          <span>What are you building / what do you need help with?</span>
          <textarea
            value={project}
            onChange={(event) => setProject(event.target.value)}
            placeholder="Tell me about your music, release, workflow, project, practice, brand, or current block."
          />
        </label>

        <label>
          <span>Relevant links</span>
          <textarea
            value={links}
            onChange={(event) => setLinks(event.target.value)}
            placeholder="Music links, website, socials, demos, release page, references, etc."
          />
        </label>

        <div className="services-inquiry-row">
          <label>
            <span>Timeline / preferred call times</span>
            <input
              value={timeline}
              onChange={(event) => setTimeline(event.target.value)}
              placeholder="This week, next week, evenings, etc."
            />
          </label>

          <label>
            <span>Preferred payment method</span>
            <input
              value={paymentPreference}
              onChange={(event) => setPaymentPreference(event.target.value)}
              placeholder="PayPal, Cash App, invoice, etc."
            />
          </label>
        </div>

        <div className="services-inquiry-actions">
          <a href={mailtoHref}>Open Email Inquiry</a>
          <Link href="/services">Back to Services</Link>
        </div>
      </form>
    </section>
  );
}

export default function ServicesInquiryPage() {
  return (
    <main className="services-page services-inquiry-page">
      <CosmicBackground />
      <Suspense
        fallback={
          <section className="services-inquiry-card">
            <p className="services-kicker">Services Inquiry</p>
            <h1>Opening inquiry portal...</h1>
          </section>
        }
      >
        <InquiryForm />
      </Suspense>
    </main>
  );
}
