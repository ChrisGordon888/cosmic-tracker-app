'use client';
import { similarCatalogTracks, suggestCatalogRealm, catalogRealms, type CatalogTrack } from '@/lib/catalogSorting';
export default function CatalogPlacementSuggestion({track,catalog,onChoose,disabled=false}: {track:CatalogTrack;catalog:CatalogTrack[];onChoose:(id:number)=>void;disabled?:boolean}) {
 const result=suggestCatalogRealm(track,catalog), similar=similarCatalogTracks(track,catalog);
 const name=(id:number)=>catalogRealms.find(r=>r.id===id)?.name;
 return <section className="cleanup-suggestion" aria-label="Placement suggestion">
 <h3>Suggested Home: {result.home===null?'No clear suggestion':name(result.home)}</h3>
 <p>{result.strength}</p>{result.secondary!==null&&<p>Secondary resonance: {name(result.secondary)}</p>}
 {result.reasons.map(reason=><p key={reason}>{reason}</p>)}
 <p>Metadata comparison only. No audio or artist similarity was analyzed.</p>
 {similar.length>0?<><h4>Similar in your Library</h4><ul>{similar.map(item=><li key={item.track.id}><strong>{item.track.title}</strong><small> — {item.reasons.join(' · ')}</small></li>)}</ul></>:<p>No sufficiently supported catalog matches yet.</p>}
 {result.home!==null&&<button type="button" disabled={disabled} onClick={()=>onChoose(result.home!)}>Use {name(result.home)}</button>}
 </section>;
}
