import PublicAtmosphere from '@/components/public/PublicAtmosphere';
import Link from 'next/link';
import '@/styles/servicesPage.css';

export default function ServicesPage() {
    return <main className="services-page service-session public-surface">
        <PublicAtmosphere source="/cosmic-lava-lamp.mp4" tone="services" />
        <section className="services-hero">
            <p className="services-kicker">Creative development with Christopher</p>
            <h1>Bring the song.<span>Find what it wants to become.</span></h1>
            <p className="services-intro">A focused creative-development session.<br />Protect what makes it yours. Sharpen what comes next.</p>
            <p className="session-pilot">Pilot session · ~$150</p>
            <div className="public-actions"><Link href="/services/inquire?offer=creative-direction-session&intent=question" className="public-action">Ask about a session →</Link><a href="#session" className="public-link">Inside the session ↓</a></div>
        </section>
        <section id="session" className="session-progression" aria-label="Your creative-development session">
            <div><p className="services-kicker">01 / Bring</p><h2>What exists now.</h2><p>One song in any shape.</p><ul>{['Beat', 'Rough demo', 'Hook / verse', 'Voice memo', 'Lyrics'].map(item => <li key={item}>{item}</li>)}</ul></div>
            <div><p className="services-kicker">02 / Develop</p><h2>Find the anchor.</h2><p>Work with Christopher on the choices that make the record distinct.</p><ul>{['Writing', 'Structure', 'Melody / cadence', 'Performance', 'Artistic direction'].map(item => <li key={item}>{item}</li>)}</ul></div>
            <div><p className="services-kicker">03 / Leave with</p><h2>A clearer record.<br />Specific next moves.</h2><p>What to protect. What to deepen.<br />What to cut. What to do next.</p></div>
        </section>
        <section className="session-world" aria-labelledby="song-outward">
            <div><p className="services-kicker">When the song is ready</p><h2 id="song-outward">Let its identity<br />reach outward.</h2><p>COSMIC can help shape an initial expression of the larger artistic world around the music. Bring visuals and context if you have them.</p><p>If the song needs more development, the session ends with direction and next actions. The song comes first.</p><p className="session-boundary">Additional production, engineering, mix/master and custom world development can be scoped separately.</p></div>
            <Link href="/releases/sirens-in-neverland" className="session-example"><img src="/sirensInNeverland.jpg" alt="SIRENS in Neverland release artwork" width="400" height="400" loading="lazy" /><span>Christopher’s music · SIRENS in Neverland</span><strong>Explore the release world →</strong></Link>
        </section>
        <details className="session-capabilities public-width">
            <summary>More ways to develop the work <span>Additional / separately scoped</span></summary>
            <dl>
                <div><dt>Song / Project Development</dt><dd>Bring unfinished demos, lyrics, hooks or melodies. Develop arrangement and project direction through repeated feedback across multiple sessions.</dd></div>
                <div><dt>Music / DAW Workflow Support</dt><dd>Practical Pro Tools / Ableton help: recording and session setup, organization, and a production process you can keep using.</dd></div>
                <div><dt>Artist-World / Release Development</dt><dd>Shape story, visual direction and the listener pathway around the music. Release-world work is scoped separately from the pilot session.</dd></div>
            </dl>
            <p>We agree on the scope, number of sessions and price before starting additional work.</p>
            <Link href="/demo/world" className="public-link">Optional reference: Low Tide, a fictional World Seed →</Link>
        </details>
        <div className="public-width public-actions"><Link href="/nexus" className="public-link">Discover more in Nexus →</Link><Link href="/creator" className="public-link">Build my own →</Link></div>
        <p className="session-horizon">A single can become an EP, an album, a visual era. This session finds the next move—not the whole journey.</p>
    </main>;
}
