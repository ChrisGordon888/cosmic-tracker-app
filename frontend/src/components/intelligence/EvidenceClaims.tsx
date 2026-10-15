'use client';
import { useMemo } from 'react';
import { projectReading, type EvidenceItem, type IntelligenceClaim } from '@/lib/groundedReasoning';
import type { Workbench } from '@/lib/intelligenceWorkbench';
export function EvidenceClaims({claims,evidence,onMoment}:{claims:IntelligenceClaim[];evidence:EvidenceItem[];onMoment?:(time:number)=>void}){
 return <div>{claims.map(c=><article key={c.id} className="intelligence-observation"><small>{c.claimType.replaceAll('_',' ')} · {c.confidence.replaceAll('_',' ')} · {c.sourceMode==='MODEL_ASSISTED'?'Model hypothesis':'Rule-based reading'}</small><p>{c.statement}</p><details><summary>Why?</summary>{c.evidenceIds.map(id=>{const e=evidence.find(item=>item.id===id);return e?<blockquote className="intelligence-preserve" key={id}><small>{e.type.replaceAll('_',' ')} · {e.source}{e.line?` · line ${e.line}`:''}{e.timeSeconds!=null?` · ${e.timeSeconds}s`:''}</small><p>{e.summary}</p><small>{e.sourcePath}</small>{onMoment&&e.timeSeconds!=null&&<button onClick={()=>onMoment(e.timeSeconds!)}>Listen at {e.timeSeconds}s in Song Lab</button>}</blockquote>:null;})}{c.unknowns.map(u=><p key={u}>Unknown / limit: {u}</p>)}<small>Evidence version {c.inputHash} · {c.engineVersion}</small></details></article>)}</div>;
}
export function ProjectReading({analysis,worldId}:{analysis:Workbench;worldId:string}){
 const reading=useMemo(()=>projectReading(analysis,worldId),[analysis,worldId]);
 if(!reading)return null;
 const title=(id:string)=>analysis.songs.find(s=>s.trackId===id)?.sourceFacts.title??'Song';
 return <details><summary>Between tracks · {reading.status.toLowerCase()}</summary><p>Sequence is known. Narrative meaning remains a hypothesis. No audio analysis is used.</p>{reading.transitions.map(t=><section key={`${t.from}:${t.to}`}><h4>{title(t.from)} → {title(t.to)}</h4><EvidenceClaims claims={[t.claim]} evidence={reading.ledger}/></section>)}{reading.arc?<EvidenceClaims claims={[reading.arc]} evidence={reading.ledger}/>:<p>Arc still emerging. Supply emotional context only where it helps express your intent.</p>}</details>;
}
