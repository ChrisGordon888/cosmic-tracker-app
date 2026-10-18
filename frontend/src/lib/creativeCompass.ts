import type {Workbench} from './intelligenceWorkbench';
import {SIGNALS} from './creativeFingerprint';
export type Direction={targetId:string;value:string};
export type Orientation='RECOGNIZE'|'EXPLORE'|'STRETCH';
export function signature(analysis:Workbench,directions:Direction[]=[]){
 const patterns=Object.entries(SIGNALS).flatMap(([category,tags])=>tags.map(signal=>{
  const songs=analysis.songs.filter(s=>s.derived.evidence.some(e=>e.signal===signal&&e.source==='CREATOR_TAG'));
  return {signal,category,trackIds:songs.map(s=>s.trackId),count:songs.length};
 })).filter(p=>p.count>=3).sort((a,b)=>b.count-a.count||a.signal.localeCompare(b.signal));
 // Avoid three near-synonyms from one category dominating the first glance.
 const categories=new Set<string>();const threads=patterns.filter(p=>{if(categories.has(p.category))return false;categories.add(p.category);return true;}).slice(0,3);
 const aspiring=analysis.songs.filter(s=>directions.some(d=>d.targetId===s.trackId&&d.value==='ASPIRE'));
 return {threads,aspiring,unknown:'Vocal identity, production style and artistic intent cannot be established from catalog tags. Repetition here is not proof of uniqueness or sound similarity.'};
}
export function compassPairing(analysis:Workbench,trackId:string,directions:Direction[]=[]){
 const orientation=(directions.find(d=>d.targetId==='orientation')?.value??'EXPLORE') as Orientation;
 const candidates=analysis.catalog.edges.filter(e=>e.a===trackId||e.b===trackId).map(edge=>{
  const id=edge.a===trackId?edge.b:edge.a,value=directions.find(d=>d.targetId===id)?.value;
  const preference=value==='ME'?(orientation==='RECOGNIZE'?.12:.04):value==='ASPIRE'?(orientation==='RECOGNIZE'?.03:.12):value==='NOT_NOW'?-.08:0;
  const contrast=orientation==='STRETCH'&&!edge.strong?.06:0;
  return {id,edge,adjustment:preference+contrast,score:edge.score+preference+contrast,why:`Shared signals: ${edge.shared.join(' · ')}. ${value==='ASPIRE'?'Your wish to explore this example gently raises its priority.':value==='ME'?'Your identity preference gently raises its priority.':value==='NOT_NOW'?'You set this example aside; it remains eligible with lower priority.':'Selected from supported catalog relationships.'}${contrast?' Stretch gives this less-established relationship a small lift.':''} This is a metadata relationship, not a claim that the recordings sound alike.`};
 }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 const source=analysis.songs.find(s=>s.trackId===trackId);
 const sourceTags=source?.derived.evidence.filter(e=>e.source==='CREATOR_TAG').map(e=>e.signal)??[];
 const contrast=sourceTags.length>=3?analysis.songs.filter(s=>s.trackId!==trackId&&s.trackId!==candidates[0]?.id).map(s=>({song:s,different:s.derived.evidence.filter(e=>e.source==='CREATOR_TAG'&&!sourceTags.includes(e.signal)).map(e=>e.signal)})).filter(c=>c.different.length>=3).sort((a,b)=>b.different.length-a.different.length||a.song.trackId.localeCompare(b.song.trackId))[0]:undefined;
 return {orientation,related:candidates[0],contrast,candidates};
}
export function safeSeed(ids:string[],analysis:Workbench){const allowed=new Set(analysis.songs.map(s=>s.trackId));return [...new Set(ids)].filter(id=>allowed.has(id)).slice(0,6);}
export function seedTransition(analysis:Workbench,a:string,b:string){
 const edge=analysis.catalog.edges.find(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a));
 const left=analysis.songs.find(s=>s.trackId===a),right=analysis.songs.find(s=>s.trackId===b);
 const end=left?.creatorContext.deep.emotionalEnd,start=right?.creatorContext.deep.emotionalStart;
 return {signal:edge?`Shared signals: ${edge.shared.join(' · ')}. This does not establish an audible transition.`:'No supported signal relationship; audition the contrast without forcing a story.',creator:end||start?`Your words: ${end||'Ending unknown'} → ${start||'Opening unknown'}`:null};
}
