// src/app/services/inquire/page.tsx
"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "@/styles/servicesInquiry.css";
import CosmicBackground from "@/components/CosmicBackground";
import "@/styles/servicesBackgroundReveal.css";

import { SERVICE_OFFERS as OFFER_OPTIONS } from '@/lib/serviceOffers';

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
    const [receipt,setReceipt]=useState('');
    const attempt=useRef<{payload:string;id:string}|null>(null);
    const inFlight=useRef(false);
    async function submit(event:React.FormEvent){
        event.preventDefault();if(inFlight.current||receipt)return;
        inFlight.current=true;setSending(true);setFeedback('');
        try {
            const payload=JSON.stringify({name,email,offer,intent,message,links,timeline,contactPreference,website});
            if(attempt.current?.payload!==payload)attempt.current={payload,id:crypto.randomUUID()};
            const response=await fetch('/api/services-inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...JSON.parse(payload),inquiryId:attempt.current.id})});
            const result=await response.json();
            if(response.ok&&result.ok&&typeof result.reference==='string')setReceipt(result.reference);
            setFeedback(result.message||'Inquiry not sent. Please try again.');
        } catch {setFeedback('Could not confirm sending. Your entries are still here. Retry without changing them to avoid a duplicate.');}
        finally {inFlight.current=false;setSending(false);}
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
                    <fieldset disabled={sending||Boolean(receipt)} style={{border:0,padding:0,margin:0,minWidth:0,display:'grid',gap:'1.25rem'}}>
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
                        Project references / music / social or profile links
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
                            Your name, email, context and links go to the COSMIC business inbox and, when commercial intake is enabled, a private engagement record for follow-up. Share only material you are comfortable sending by email; no confidential masters or payment details. This is an inquiry, not a booking or payment.
                        </p>
                    </div>

                    <div className="services-inquire-actions">
                        <button type="submit" disabled={sending}>{sending ? "Sending…" : "Send inquiry"}</button>
                        <Link href="/services">Back to Services</Link>
                    </div>
                    </fieldset>
                    <div role="status" aria-live="polite">
                        <p>{feedback}</p>
                        {receipt && <><h2>Context sent. Let’s confirm the fit.</h2><p>Inquiry reference: <strong>{receipt}</strong></p><p>Keep this reference for follow-up. Christopher can reply to the email you supplied to discuss scope, timing and price. A booking is confirmed separately; no payment has been taken.</p><Link href="/services">Explore the studio →</Link></>}
                    </div>
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
