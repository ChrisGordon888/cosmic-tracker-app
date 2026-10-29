'use client';
import Link from 'next/link';
import { useState } from 'react';
import { publicWorldProof, proofLink, youtubeEmbed, type WorldProofItem } from '@/lib/worldProof';
import '@/styles/worldProof.css';
function ProofCard({ item }: { item: WorldProofItem }) {
  const [loaded, setLoaded] = useState(false);
  const href = proofLink(item.href), embed = youtubeEmbed(item.href);
  return <article className="world-proof-card">
    <p className="release-world-label">{item.eyebrow}</p><h3>{item.title}</h3>
    {item.meta && <strong>{item.meta}</strong>}{item.body && <p>{item.body}</p>}
    {embed && (loaded ? <div className="world-proof-video"><iframe src={embed} title={`${item.title} — video`} allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /><button onClick={()=>setLoaded(false)}>Close video</button></div> : <div><button onClick={()=>setLoaded(true)}>Load video</button><small>Loads YouTube only when you choose. Playback stays manual.</small></div>)}
    {href && <a href={href} target="_blank" rel="noopener noreferrer">{embed ? 'Watch on YouTube' : 'Visit profile or reference'} ↗</a>}
  </article>;
}
export default function WorldProof({ items, worldHref }: { items: WorldProofItem[]; worldHref?: string }) {
  const published = publicWorldProof(items);
  if (!published.length && !worldHref) return null;
  return <section className="world-proof release-world-story-section" aria-label="People and process">
    <div className="release-world-section-heading"><p className="release-world-label">People & process</p><h2>Behind the work.</h2><p>Contributor roles and creative context published with permission recorded by this World’s creator. Credits do not establish ownership or grant project access.</p></div>
    {!published.length && <p>No approved contributor credits or process references have been published.</p>}
    <div className="world-proof-grid">{published.map(item=><ProofCard key={item.id} item={item}/>)}</div>
    {worldHref && <p><Link href={`/services/inquire?offer=song-project-development-pack&intent=question&world=${encodeURIComponent(worldHref)}`}>Work together with COSMIC →</Link><small>Discuss a creative project with Christopher. This does not contact or imply availability of the credited contributors.</small></p>}
  </section>;
}
