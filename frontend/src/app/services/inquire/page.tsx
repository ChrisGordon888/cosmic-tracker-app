// src/app/services/inquire/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "@/styles/servicesInquiry.css";
import CosmicBackground from "@/components/CosmicBackground";
import "@/styles/servicesBackgroundReveal.css";

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
        slug: "not-sure", label: "Not sure yet / help me choose", category: "Question", price: "Open inquiry",
        short: "Share the music and context you have. We’ll identify a useful next step.",
        bestFor: "Artists who want to discuss where to begin.",
    },
    {
        slug: "creative-direction-session", label: "Creative-development pilot session", category: "Session", price: "Pilot session · ~$150",
        short: "A focused session with Christopher to develop one song and sharpen its next direction.",
        bestFor: "One song in any shape: a beat, rough demo, hook, verse, voice memo or lyrics.",
        sendPrompt: "Share your song, lyrics, visual references or creative notes, if you have them.",
        messagePrompt: "What do you want to develop in this song, and what would you like to leave with?",
    },
    {
        slug: "song-project-development-pack", label: "Song / Project Development", category: "Multiple sessions", price: "Scoped separately",
        short: "Repeated feedback on demos, lyrics, hooks, melody, arrangement and project direction.",
        bestFor: "Artists who want to develop unfinished work over several sessions.",
    },
    {
        slug: "music-daw-workflow-lesson", label: "Music / DAW Workflow Support", category: "Workflow", price: "Scoped separately",
        short: "Practical Pro Tools / Ableton support with recording, session setup, organization and production process.",
        bestFor: "Artists who want help working with their sessions.",
    },
    {
        slug: "artist-world-audit", label: "Artist-World / Release Development", category: "Release", price: "Scoped separately",
        short: "Develop story, visual direction, listener pathway and the release world around your music.",
        bestFor: "Artists ready to explore a separately scoped extension of their music.",
    },
];

const INTENT_OPTIONS = [
    { slug: "question", label: "I have a question" },
    { slug: "book", label: "I want to book" },
    { slug: "request", label: "I want to request this service" },
    { slug: "quote", label: "I want a quote" },
];

const CONTACT_OPTIONS = [
    "Email is best",
    "Text/call after we connect",
    "Zoom / Google Meet",
    "Not sure yet",
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

    const [website,setWebsite]=useState('');
    const [sending,setSending]=useState(false);
    const [feedback,setFeedback]=useState('');
    async function submit(event:React.FormEvent){
        event.preventDefault();if(sending)return;setSending(true);setFeedback('');
        try{const response=await fetch('/api/services-inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,offer,intent,message,links,timeline,contactPreference,website})});const result=await response.json();setFeedback(result.message||'Inquiry not sent. Please try again.');}
        catch{setFeedback('Could not confirm sending. Your entries are still here; please try again later.');}
        finally{setSending(false);}
    }

    return (
        <section className="services-inquire-card services-inquire-card-v2">
            <div className="services-inquire-heading">
                <nav className="services-nav services-inquire-nav" aria-label="Inquiry navigation">
                    <Link href="/services">Services</Link>
                    <Link href="/nexus">Nexus</Link>
                    <Link href="/practice">Practice</Link>
                </nav>

                <p className="services-kicker">Services Front Desk</p>
                <h1>{isCreativeDirection ? "Ask about a creative-development session." : "Tell me what you are building."}</h1>
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
                            <strong>{isCreativeDirection ? "Discuss the session" : "Choose the closest offer"}</strong>
                            <p>{isCreativeDirection ? "This is an inquiry, not a reservation." : "You can choose “not sure” if you need direction first."}</p>
                        </article>

                        <article>
                            <span>02</span>
                            <strong>Send your context</strong>
                            <p>{isCreativeDirection ? "Demos, visuals, links, questions, and the part that needs direction." : "Links, goals, stuck points, timeline, and what you want help with."}</p>
                        </article>

                        <article>
                            <span>03</span>
                            <strong>{isCreativeDirection ? "Confirm the path" : "Get the next step"}</strong>
                            <p>{isCreativeDirection ? "We’ll confirm fit, scope, timing and price before starting." : "I’ll reply with fit, scope and a useful next step."}</p>
                        </article>
                    </div>
                </aside>

                <form className="services-inquire-form services-inquire-form-v2" onSubmit={submit}>
                    <label hidden aria-hidden="true" style={{display:"none"}}>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label>
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
                            <input required maxLength={150} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                        </label>

                        <label>
                            Email
                            <input
                                type="email" required maxLength={254}
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                            />
                        </label>
                    </div>

                    <label>
                        Links to music / socials / website / project
                        <textarea
                            maxLength={3000} value={links}
                            onChange={(event) => setLinks(event.target.value)}
                            placeholder={linkPlaceholder}
                        />
                    </label>

                    <div className="services-inquire-grid">
                        <label>
                            Timeline / preferred timing
                            <input
                                maxLength={300} value={timeline}
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
                        {isCreativeDirection ? "Song-development focus" : "What do you need help with?"}
                        <textarea
                            required maxLength={6000} value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder={messagePlaceholder}
                        />
                    </label>

                    <div className="services-inquire-note">
                        <strong>Before you send:</strong>
                        <p>
                            Your inquiry is sent securely to the business inbox. This is a conversation, not a booking or payment.
                        </p>
                    </div>

                    <div className="services-inquire-actions">
                        <button type="submit" disabled={sending}>{sending ? "Sending…" : "Send inquiry"}</button>
                        <Link href="/services">Back to Services</Link>
                    </div>
                    <p role="status" aria-live="polite">{feedback}</p>
                </form>
            </div>
        </section>
    );
}

export default function ServicesInquiryPage() {
    return (
        <main className="services-inquire-page">
            <CosmicBackground />
            <Suspense fallback={<section className="services-inquire-card">Loading inquiry...</section>}>
                <InquiryForm />
            </Suspense>
        </main>
    );
}
