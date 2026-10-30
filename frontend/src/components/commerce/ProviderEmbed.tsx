'use client';
import {useState} from 'react';
/** Only normalized, server-approved official player URLs reach this component. */
export default function ProviderEmbed({src,fallback}:{src:string;fallback:string}){
 const [loaded,setLoaded]=useState(false);
 let trusted=false;try{const u=new URL(src);trusted=u.protocol==='https:'&&u.hostname==='player.beatstars.com'&&!u.port&&!u.username&&!u.password;}catch{/* fail closed */}
 if(!trusted)return <p>Player unavailable. Use the provider link below.</p>;
 return <section aria-label="BeatStars player"><h2>Listen & license</h2><p>Loading this player connects to BeatStars and its privacy/cookie controls. Playback and checkout stay with BeatStars; COSMIC’s shared music player is unchanged.</p>{loaded?<><iframe src={src} title="Official BeatStars Blaze store" loading="lazy" referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" allow="encrypted-media; fullscreen"/><button onClick={()=>setLoaded(false)}>Close player</button></>:<button onClick={()=>setLoaded(true)}>Load BeatStars player</button>}<p>If the player is blocked or does not load, <a href={fallback} target="_blank" rel="noopener noreferrer">open BeatStars directly ↗</a>. Loading an iframe is not proof of a working account, checkout or purchase.</p></section>;
}
