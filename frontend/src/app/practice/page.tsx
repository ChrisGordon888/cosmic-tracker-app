"use client";

import PracticeShell from "@/components/practice/PracticeShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getMoonPhaseForDate } from "@/lib/moonPhases";
import SacredYesSection from "@/components/SacredYesSection";
import MoodSection from "@/components/MoodSection";
import PracticeQuestsSection from "@/components/PracticeQuestsSection";
import "@/styles/practicePage.css";

const STATES = ["Heavy", "Quiet", "Neutral", "Steady", "Open", "Clear"];

export default function PracticePortal() {
    const { data: session, status } = useSession();
    const [now, setNow] = useState<Date | null>(null);
    const [state, setState] = useState("");
    const [reflection, setReflection] = useState("");
    useEffect(() => {
        const update = () => setNow(new Date());
        update();
        const timer = window.setInterval(update, 60000);
        return () => window.clearInterval(timer);
    }, []);
    // Ephemeral public reflection: never shared, stored, or attached to another account.
    useEffect(() => { setState(""); setReflection(""); }, [session?.user?.email]);
    const moon = now ? getMoonPhaseForDate(now) : null;
    return (
        <PracticeShell>

            <header className="practice-hero">
                <div className="practice-hero-copy">
                    <p className="practice-kicker">Practice</p>
                    <h1>A way in, today.</h1>
                    <p>Rituals, reflection, rhythm and natural cycles. Start small. Nothing to perform.</p>
                </div>
                <nav className="practice-hero-links" aria-label="Practice navigation"><Link href="/">Home</Link><Link href="/nexus">Listen</Link><Link href="/scroll">Read the Scroll</Link></nav>
            </header>

            <section className="practice-daily-grid" aria-label="A way in today">
                <article className="practice-module">
                    <p className="practice-kicker">Today / cycle</p>
                    <h2>{now ? now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Today'}</h2>
                    <p>{moon ? `${moon.icon} ${moon.phase} · approximately ${Math.round(moon.illumination * 100)}% illuminated` : 'Opening the calendar…'}</p>
                    <p className="practice-fine">Calculated lunar estimate · your device’s local date. A calendar anchor, not a reading of your mood.</p>
                </article>
                <article className="practice-module">
                    <p className="practice-kicker">Your state · optional</p>
                    <h2>How are you arriving?</h2>
                    <div className="practice-state-options" role="group" aria-label="Your present state">{STATES.map(label => <button key={label} type="button" aria-pressed={state === label} onClick={() => setState(state === label ? '' : label)}>{label}</button>)}</div>
                    <p className="practice-fine">A word for now, not a diagnosis. Tap again to clear. Nothing is saved here.</p>
                </article>
                <article className="practice-module">
                    <p className="practice-kicker">Featured practice · two minutes</p>
                    <h2>Notice. Choose. Begin.</h2>
                    <ol><li>Pause in a comfortable position and notice one thing around you.</li><li>Name one small commitment worth your attention.</li><li>Take its first step, or write down when you will.</li></ol>
                    <p className="practice-fine">Adapt or skip any step. This is an invitation, not a treatment.</p>
                </article>
            </section>

            <section className="practice-secondary-grid" aria-label="Rhythm and reflection">
                <article className="practice-module">
                    <p className="practice-kicker">Natural cycles</p><h2>Look outside, too.</h2>
                    <p>Notice daylight where you are, the weather and what is changing in your surroundings. Choose a repeatable moment in your day to pause. No location or seasonal assumption needed.</p>
                </article>
                <article className="practice-module">
                    <p id="reflection" className="practice-kicker">Reflection</p><h2>What deserves a clear yes?</h2>
                    <label htmlFor="practice-reflection">One sentence is enough.</label>
                    <textarea id="practice-reflection" rows={3} maxLength={2000} value={reflection} onChange={event => setReflection(event.target.value)} placeholder="Today, I can make room for…" />
                    <p className="practice-fine">Only on this open page. Leaving or reloading clears it.</p>
                </article>
                <article className="practice-module">
                    <p className="practice-kicker">Creative practice</p><h2>Make one honest mark.</h2>
                    <p>Write four lines, record a rough phrase, or listen to one unfinished idea without editing. Name what you want to keep before deciding what to change.</p>
                    <Link href="/creator">Continue in Creator OS →</Link>
                </article>
            </section>

            {status === 'loading' ? <p className="practice-private-status" role="status">Checking your private practice access…</p> : session?.user ? <details className="practice-private-tools">
                <summary>Your saved practice · commitments, mood and actions</summary>
                <p>Your personal chamber: save a commitment, state and reflection, then carry them into Today, Rituals and History. The quick check above stays unsaved.</p>
                <nav className="practice-actions" aria-label="Saved practice"><Link href="/tracker">Today</Link><Link href="/rituals">Rituals</Link><Link href="/calendar">History</Link></nav>
                <div className="practice-daily-grid"><div className="practice-module"><SacredYesSection /></div><div className="practice-module"><MoodSection /></div><div className="practice-module"><PracticeQuestsSection /></div></div>
            </details> : <section className="practice-private-tools"><h2>Keep a rhythm over time.</h2><p>Sign in for your saved commitments, mood, practices, rituals and history. Today’s public practice needs no account.</p><div className="practice-actions"><Link href="/auth?callbackUrl=%2Fpractice">Sign in for saved practice →</Link></div></section>}
        </PracticeShell>
    );
}
