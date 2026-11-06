'use client';
import {useState} from 'react';
import Link from 'next/link';
import {mediaSource,type CreativeMedia} from '@/lib/creativeMedia';
export default function MediaPresentation({item,preview=false}:{item:CreativeMedia;preview?:boolean}){
 const [loaded,setLoaded]=useState(false);const source=mediaSource(item.url);
 return <article className="media-feature"><p className="commerce-kicker">{item.topic||'Inside the work'} · {source?.provider||'Media'}</p><h2>{item.title||'Your next creative story'}</h2>{preview&&<p>Private preview · not published. External media loads only by choice.</p>}
 <div className="media-screen">{loaded&&source?.embed?<><iframe src={source.embed} title={item.title||'Production video'} allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"/><button type="button" onClick={()=>setLoaded(false)}>Close video</button></>:<>{item.thumbnail?<img src={item.thumbnail} alt={item.title||'Video thumbnail'} loading="lazy" referrerPolicy="no-referrer"/>:<div className="offer-art-placeholder">Music. Process. Possibility.</div>}{source?.embed&&<button type="button" onClick={()=>setLoaded(true)}>Load video from YouTube</button>}</>}</div><p className="commerce-copy">{item.description||'Describe the work and what viewers will discover.'}</p>{source&&<a href={item.url} target="_blank" rel="noopener noreferrer">Open on {source.provider} ↗</a>}<small>{source?.provider==='Instagram'?'Instagram is presented as a direct post/Reel link. Availability and embedding permissions remain with the creator and Instagram.':'Loading connects to YouTube. Restricted or unavailable videos can be opened directly. COSMIC does not control provider playback.'}</small>
 {!!item.links?.length&&<nav aria-label="Continue from this video">{item.links.map(link=><Link key={link.href} href={link.href}>{link.label} →</Link>)}</nav>}</article>;
}
