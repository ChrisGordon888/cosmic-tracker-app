'use client';
import { useMemo } from 'react';
import { projectReading, type EvidenceItem, type IntelligenceClaim } from '@/lib/groundedReasoning';
import type { Workbench } from '@/lib/intelligenceWorkbench';
const evidenceLabels:Record<string,string>={CREATOR_MEANING:'You said',CREATOR_CONTEXT:'Your context',CREATOR_ROLE:'Your role',CREATOR_LYRIC:'Lyric',CREATOR_MOMENT:'Moment',FINGERPRINT_SIGNAL:'Signal',REALM:'Realm',TRACK_RELATIONSHIP:'Relationship',PROJECT_POSITION:'Project',PROJECT_STORY:'Project story',AUDIO_MEASUREMENT:'Audio'};
export function EvidenceClaims({claims,evidence,onMoment}:{claims:IntelligenceClaim[];evidence:EvidenceItem[];onMoment?:(time:number)=>void}){
 return <div>{claims.map(c=><article key={c.id} className="intelligence-observation"><small>{c.claimType==='MOMENT_AUDIO_ALIGNMENT'?'Your moment + recording':c.claimType.replaceAll('_',' ').toLowerCase()} · {c.confidence.replaceAll('_',' ').toLowerCase()}</small><p>{c.statement}</p><details><summary>Why?</summary>{c.evidenceIds.map(id=>{const e=evidence.find(item=>item.id===id);return e?<blockquote className="intelligence-preserve" key={id}><small>{evidenceLabels[e.type]??e.type} · {e.source==='CREATOR'?'From you':e.source==='DERIVED'?'Derived':'Recorded'}{e.line?` · line ${e.line}`:''}{e.timeSeconds!=null?` · ${e.timeSeconds}s`:''}</small><p>{e.summary}</p>{onMoment&&e.timeSeconds!=null&&<button onClick={()=>onMoment(e.timeSeconds!)}>Listen at {e.timeSeconds}s in Song Lab</button>}</blockquote>:null;})}{c.unknowns.map(u=><p key={u}>Unknown / limit: {u}</p>)}</details></article>)}</div>;
}
export function ProjectReading({analysis,worldId}:{analysis:Workbench;worldId:string}){
 const reading=useMemo(()=>projectReading(analysis,worldId),[analysis,worldId]);
 if(!reading)return null;
 const title=(id:string)=>analysis.songs.find(s=>s.trackId===id)?.sourceFacts.title??'Song';
 return <details><summary>Between tracks · {reading.status.toLowerCase()}</summary><p>Sequence is known. Narrative meaning remains a hypothesis. No audio analysis is used.</p>{reading.transitions.map(t=><section key={`${t.from}:${t.to}`}><h4>{title(t.from)} → {title(t.to)}</h4><EvidenceClaims claims={[t.claim]} evidence={reading.ledger}/></section>)}{reading.arc?<EvidenceClaims claims={[reading.arc]} evidence={reading.ledger}/>:<p>Arc still emerging. The sequence is known; its meaning stays open.</p>}</details>;
}
export function RelationshipEvidence({edge,title,onSelect,emphasized=false}:{edge:Workbench['catalog']['edges'][number];title:(id:string)=>string;onSelect:(id:string)=>void;emphasized?:boolean}){
 return <div className={`intelligence-evidence ${emphasized?'intelligence-arrival':''}`}><strong>{title(edge.a)} ↔ {title(edge.b)}</strong><p>Shared signals: {edge.shared.join(' · ')}</p><p>{edge.support.join(' · ')}</p><div className="intelligence-actions"><button onClick={()=>onSelect(edge.a)}>Explore {title(edge.a)}</button><button onClick={()=>onSelect(edge.b)}>Explore {title(edge.b)}</button></div></div>;
}
