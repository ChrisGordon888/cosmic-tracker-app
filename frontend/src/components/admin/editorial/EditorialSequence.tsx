'use client';
import {useState} from 'react';
import {actionAssessment,intentState,type Assessment,type Config,type Signal,type Intent} from '@/lib/editorialStudio';
export default function EditorialSequence({kind,realmId,config,signals,assessments,busy,prepare}:{kind:'sampler'|'order';realmId:number;config?:Config|null;signals:Signal[];assessments:Assessment[];busy:boolean;prepare:(items:Intent[])=>Promise<void>}){
 const saved=kind==='sampler'?config?.nexusRealmSamplers.find(s=>s.realmId===realmId)?.trackIds??[]:config?.realmOrders.find(s=>s.realmId===realmId)?.trackIds??[];
 const [draft,setDraft]=useState({ids:[...saved],before:intentState({action:kind,id:String(realmId),realmId},config,signals),revision:config?.samplerRevision??0});
 const candidates=signals.filter(s=>s.track.realmId===realmId&&actionAssessment(assessments,'track',s.track.id,kind==='sampler'?'sampler':'anchor').allowed);
 const changed=draft.before!==intentState({action:kind,id:String(realmId),realmId},config,signals);
 function move(index:number,delta:number){const ids=[...draft.ids];[ids[index],ids[index+delta]]=[ids[index+delta],ids[index]];setDraft({...draft,ids});}
 const labels=(id:string)=>signals.find(s=>s.track.id===id)?.track.title??`Unresolved selection · ${id}`;
 return <section><h3>{kind==='sampler'?'Nexus sampler':'Published Signal ordering'}</h3><p>{kind==='sampler'?`${draft.ids.length}/9 · only anonymously playable official soundtrack candidates qualify.`:'Ordering is independent of sampler order and soundtrack selection.'}</p>
 {changed&&<p role="alert">Server state changed. Your draft is preserved. Reload the saved sequence before making a new confirmation.</p>}
 <button disabled={busy} onClick={()=>setDraft({ids:[...saved],before:intentState({action:kind,id:String(realmId),realmId},config,signals),revision:config?.samplerRevision??0})}>Reload saved sequence</button>
 <ol className="studio-sequence">{draft.ids.map((id,index)=><li key={id}><strong>{labels(id)}</strong>{!candidates.some(s=>s.track.id===id)&&<p>Stale or currently ineligible selection; remove it before saving. No automatic cleanup.</p>}<div className="studio-links"><button disabled={busy||index===0} aria-label={`Move ${labels(id)} up`} onClick={()=>move(index,-1)}>↑</button><button disabled={busy||index===draft.ids.length-1} aria-label={`Move ${labels(id)} down`} onClick={()=>move(index,1)}>↓</button><button disabled={busy} onClick={()=>setDraft({...draft,ids:draft.ids.filter(x=>x!==id)})}>Remove {labels(id)}</button></div></li>)}</ol>
 <h4>Eligible candidates</h4>{candidates.filter(s=>!draft.ids.includes(s.track.id)).map(s=><button key={s.track.id} disabled={busy||(kind==='sampler'&&draft.ids.length>=9)} onClick={()=>setDraft({...draft,ids:[...draft.ids,s.track.id]})}>Add {s.track.title}</button>)}{!candidates.length&&<p>No verified eligible candidates. Check assessment status and soundtrack / publication prerequisites.</p>}
 <div className="studio-links"><button disabled={busy||changed||JSON.stringify(saved)===JSON.stringify(draft.ids)} onClick={()=>void prepare([{key:`${kind}:${realmId}`,action:kind,id:String(realmId),label:`${kind==='sampler'?'Sampler':'Published order'} · ${draft.ids.map(labels).join(' → ')||'empty'}`,realmId,ids:draft.ids,revision:draft.revision,before:draft.before,after:kind==='sampler'?JSON.stringify({ids:draft.ids,revision:draft.revision+1}):JSON.stringify(draft.ids)}])}>Validate & preview sequence</button></div>
 </section>;
}
