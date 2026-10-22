import PublicAtmosphere from '@/components/public/PublicAtmosphere';
import Link from 'next/link';
import { SERVICE_OFFERS } from '@/lib/serviceOffers';
import '@/styles/servicesPage.css';

export default function ServicesPage() {
    return <main className="services-page service-session public-surface">
        <PublicAtmosphere source="/cosmic-lava-lamp.mp4" tone="services" />
        <section className="services-hero">
            <p className="services-kicker">The COSMIC studio · with Christopher</p>
            <h1>Bring the song.<span>Find what it wants to become.</span></h1>
            <p className="services-intro">A focused creative-development session.<br />Protect what makes it yours. Sharpen what comes next.</p>
            <p className="session-pilot">{SERVICE_OFFERS.find(offer=>offer.slug==='creative-direction-session')?.price}</p>
            <div className="public-actions"><Link href="/services/inquire?offer=creative-direction-session&intent=question" className="public-action">Ask about a session →</Link><a href="#services" className="public-link">Find your way in ↓</a></div>
        </section>
        <section id="services" className="studio-services public-width" aria-labelledby="studio-services-title">
            <p className="services-kicker">Four ways into the work</p>
            <h2 id="studio-services-title">Start where you are.</h2>
            <p>One focused session, a song that needs developing, a world taking shape, or a skill you want to build.</p>
            <div className="studio-service-grid">{SERVICE_OFFERS.filter(offer=>offer.slug!=='not-sure').map(offer=><article key={offer.slug}>
                <p className="services-kicker">{offer.price}</p><h3>{offer.label}</h3><p>{offer.short}</p>
                <p className="studio-service-fit">{offer.bestFor}</p>
                <Link className="public-link" href={`/services/inquire?offer=${offer.slug}&intent=question`}>Discuss {offer.slug==='creative-direction-session'?'the pilot':'this work'} →</Link>
            </article>)}</div>
            <p>Beyond the pilot, scope, deliverables, timing and price are agreed individually. An inquiry does not reserve availability.</p>
            <Link href="/services/inquire?offer=not-sure" className="public-link">Not sure which fits? Start a conversation →</Link>
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
        <section className="studio-engagement public-width" aria-labelledby="engagement-title">
            <p className="services-kicker">From first hello to working together</p><h2 id="engagement-title">A clear path into the studio.</h2>
            <ol><li><strong>Share the starting point.</strong><p>Choose a service and send your context. Links and a few honest notes are enough.</p></li><li><strong>Agree on the work.</strong><p>Confirm fit, deliverables, timing and price by email before making plans.</p></li><li><strong>Arrange the session and billing.</strong><p>Scheduling details and an invoice or secure payment link are shared separately once the scope is agreed. Never send card details through the inquiry form.</p></li></ol>
            <p>A submitted inquiry is not a confirmed booking. Custom production, engineering, mix/master and digital builds are not included in the pilot unless explicitly agreed.</p>
            <Link href="/demo/world" className="public-link">Explore Low Tide · a fictional World Seed demonstration →</Link>
            <p className="studio-service-fit">An example of COSMIC’s presentation tools, not a client commission or a promise of what every engagement includes.</p>
        </section>
        <div className="public-width public-actions"><Link href="/nexus" className="public-link">Discover more in Nexus →</Link><Link href="/creator" className="public-link">Build my own →</Link></div>
        <p className="session-horizon">A single can become an EP, an album, a visual era. This session finds the next move—not the whole journey.</p>
    </main>;
}
