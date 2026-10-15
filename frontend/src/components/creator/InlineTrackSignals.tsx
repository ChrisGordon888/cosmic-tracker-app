'use client';
import { useMemo, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { SIGNALS, interpretFingerprint, realmName } from '@/lib/creativeFingerprint';
import { similarCatalogTracks, catalogRealms, type CatalogTrack } from '@/lib/catalogSorting';
import { needsReviewWarning } from '@/lib/libraryCleanup';
import '@/styles/trackSignals.css';
const SIGNAL=gql`mutation SetTrackSignal($id:ID!,$signal:String!,$enabled:Boolean!){setTrackCreativeSignal(id:$id,signal:$signal,enabled:$enabled){id creativeSignals updatedAt}}`;
const REALM=gql`mutation ConfirmTrackRealm($id:ID!,$input:UpdateReleaseTrackInput!){updateReleaseTrack(id:$id,input:$input){id realmId creativeDecisions{realmId suggestedRealmId action engineVersion signals at} updatedAt}}`;
export default function InlineTrackSignals({track,catalog,onRefresh}:{track:CatalogTrack;catalog:CatalogTrack[];onRefresh:()=>Promise<unknown>}) {
 const [saveSignal]=useMutation(SIGNAL),[saveRealm]=useMutation(REALM);
 const [pending,setPending]=useState<string|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[choice,setChoice]=useState('');
 const [optimistic,setOptimistic]=useState<string[]|null>(null);
 const [relatedOpen,setRelatedOpen]=useState(false);
 const effective=useMemo(()=>({...track,creativeSignals:optimistic??track.creativeSignals}),[track,optimistic]);
 const result=useMemo(()=>interpretFingerprint(effective,catalog),[effective,catalog]);
 async function toggle(signal:string){
  if(pending)return;
  const prior=effective.creativeSignals??[],enabled=!prior.includes(signal);
  setOptimistic(enabled?[...prior,signal]:prior.filter(s=>s!==signal));setPending(signal);setError('');setNotice('Saving…');
  try{await saveSignal({variables:{id:track.id,signal,enabled}});setNotice('Saved');}catch(e){setError(e instanceof Error?e.message:'Could not save signal.');setNotice('');}finally{setOptimistic(null);setPending(null);}
 }
 async function confirm(id:number){
  if(needsReviewWarning(track,{realmId:id})&&!window.confirm('Changing this Realm may withdraw Nexus approval and require another review. Save?'))return;
  setPending('realm');setError('');
  try{await saveRealm({variables:{id:track.id,input:{realmId:id,creativeDecision:{suggestedRealmId:result.home,action:result.home===null?'manual':result.home===id?'accepted':'overridden'}}}});setNotice('Realm saved');setChoice('');await onRefresh();}catch(e){setError(e instanceof Error?e.message:'Could not save Realm.');}finally{setPending(null);}
 }
 const related=useMemo(()=>relatedOpen?similarCatalogTracks(effective,catalog).filter(r=>r.reasons.some(reason=>reason.startsWith('Shared signals:'))):[],[relatedOpen,effective,catalog]);
 return <section className="track-signals" aria-label={`Creative signals for ${track.title}`}>
 <details><summary>+ Signals · {effective.creativeSignals?.length??0}</summary>
 <p>Tell COSMIC what this song feels like. A few taps are enough; each tap saves.</p>
 {Object.entries(SIGNALS).map(([group,tags])=><fieldset key={group}><legend>{group}</legend>{tags.map(signal=><button type="button" key={signal} disabled={pending!==null} aria-pressed={effective.creativeSignals?.includes(signal)??false} onClick={()=>void toggle(signal)}>{signal}</button>)}</fieldset>)}
 </details>
 <span role="status">{notice}</span>{error&&<p role="alert">{error} Your previous saved signals are retained.</p>}
 {track.realmId!=null?<p>Your Realm: {realmName(track.realmId)}. Your choice stays authoritative.</p>:<><p>COSMIC suggests: {result.home===null?'No clear suggestion':realmName(result.home)} · {result.strength}</p>{result.home!==null&&<><p>{result.reasons[0]}</p>{result.secondary!==null&&<p>Also near: {realmName(result.secondary)}</p>}<button type="button" disabled={pending!==null} onClick={()=>void confirm(result.home!)}>Confirm</button></>}</>}
 <details><summary>Choose another Realm</summary><select aria-label={`Realm for ${track.title}`} value={choice} onChange={e=>setChoice(e.target.value)}><option value="">Choose a Realm…</option>{catalogRealms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select><button type="button" disabled={choice===''||pending!==null} onClick={()=>void confirm(Number(choice))}>Confirm chosen Realm</button></details>
 <details onToggle={event=>setRelatedOpen(event.currentTarget.open)}><summary>Related songs</summary>{related.length?related.map(r=><p key={r.track.id}>{r.track.title} — {r.reasons.join(' · ')}</p>):<p>Tag a few more songs to find supported connections. Same Realm alone is not a strong match.</p>}</details>
 </section>;
}
