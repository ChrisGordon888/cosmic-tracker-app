'use client';
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
export default function WorldProof({ items }: { items: WorldProofItem[] }) {
  const published = publicWorldProof(items);
  if (!published.length) return null;
  return <section className="world-proof release-world-story-section" aria-label="People and process">
    <div className="release-world-section-heading"><p className="release-world-label">People & process</p><h2>Behind the work.</h2><p>Credits and creative context selected by this World’s creator.</p></div>
    <div className="world-proof-grid">{published.map(item=><ProofCard key={item.id} item={item}/>)}</div>
  </section>;
}
