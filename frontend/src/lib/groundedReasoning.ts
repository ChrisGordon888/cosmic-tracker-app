import { z } from 'zod';
import type { SongIntelligenceProfile, Workbench } from './intelligenceWorkbench';
export const REASONING_VERSION = 'grounded-v1';
export const LyricsSchema = z.object({ text:z.string().max(30000),status:z.enum(['DRAFT','PARTIAL','COMPLETE']),updatedAt:z.string().nullish() });
export type Lyrics = z.infer<typeof LyricsSchema>;
export const EvidenceItemSchema=z.object({
 id:z.string(),type:z.enum(['CREATOR_MEANING','CREATOR_CONTEXT','CREATOR_ROLE','CREATOR_LYRIC','CREATOR_MOMENT','HOOK','FINGERPRINT_SIGNAL','REALM','TRACK_RELATIONSHIP','PROJECT_POSITION','PROJECT_STORY','PUBLICATION_STATE','AUDIO_MEASUREMENT']),subjectId:z.string(),
 source:z.enum(['CREATOR','STORED_FACT','DERIVED']),summary:z.string().max(2000),sourcePath:z.string(),
 provenance:z.object({engineVersion:z.string(),inputHash:z.string()}),timeSeconds:z.number().nullish(),line:z.number().int().positive().nullish(),
});
export type EvidenceItem=z.infer<typeof EvidenceItemSchema>;
export const ClaimSchema=z.object({id:z.string(),subjectType:z.enum(['track','world','transition']),subjectId:z.string(),claimType:z.string().max(80),statement:z.string().min(1).max(1200),confidence:z.enum(['SUPPORTED','TENTATIVE','LOW_EVIDENCE']),evidenceIds:z.array(z.string()).min(1).max(30),unknowns:z.array(z.string().max(500)).max(10),sourceMode:z.enum(['DETERMINISTIC','MODEL_ASSISTED']),engineVersion:z.string(),inputHash:z.string(),generatedAt:z.string()});
export type IntelligenceClaim=z.infer<typeof ClaimSchema>;
export function evidenceHash(value:unknown){let a=2166136261,b=5381;for(const c of JSON.stringify(value)){a=Math.imul(a^c.charCodeAt(0),16777619);b=Math.imul(b,33)^c.charCodeAt(0);}return `${(a>>>0).toString(16)}${(b>>>0).toString(16)}`;}
export function evidence(type:EvidenceItem['type'],subjectId:string,source:EvidenceItem['source'],summary:string,sourcePath:string,extra:Partial<EvidenceItem>={}):EvidenceItem{
 const inputHash=evidenceHash({type,subjectId,source,summary,sourcePath,...extra});
 return EvidenceItemSchema.parse({id:`ev-${inputHash}`,type,subjectId,source,summary:summary.slice(0,2000),sourcePath,provenance:{engineVersion:REASONING_VERSION,inputHash},...extra});
}
export function trackEvidence(song:SongIntelligenceProfile,lyrics?:Lyrics|null):EvidenceItem[]{
 const t=song.sourceFacts,c=song.creatorContext.deep,result:EvidenceItem[]=[];
 const add=(type:EvidenceItem['type'],value:string|null|undefined,path:string)=>{if(value)result.push(evidence(type,t.id,'CREATOR',value.slice(0,2000),path));};
 add('CREATOR_MEANING',c.meaning,'creatorContext.meaning');add('CREATOR_ROLE',c.creatorRole,'creatorContext.creatorRole');
 for(const key of ['emotionalStart','emotionalEnd','referenceNotes'] as const)add('CREATOR_CONTEXT',c[key],`creatorContext.${key}`);
 add('HOOK',t.hook,'hook');add('CREATOR_CONTEXT',t.notes,'notes');add('CREATOR_CONTEXT',t.mood,'mood');
 for(const e of song.derived.evidence)result.push(evidence('FINGERPRINT_SIGNAL',t.id,e.source==='CREATOR_TAG'?'CREATOR':'DERIVED',`${e.signal} · ${e.source==='CREATOR_TAG'?'explicit creator tag':`vocabulary match (${e.source})`}`,`signals.${e.signal}`));
 result.push(evidence('REALM',t.id,'STORED_FACT',t.realmId==null?'Realm undecided':`Assigned Realm ${t.realmId}`,'realmId'));
 if(t.releaseWorldId)result.push(evidence('PROJECT_POSITION',t.id,'STORED_FACT',`Project position ${t.trackNumber??'unknown'}`,'releaseWorldId/trackNumber'));
 for(const m of t.songMoments??[]){result.push(evidence('CREATOR_MOMENT',t.id,'CREATOR',`You marked ${m.type} at ${m.timeSeconds}s. ${m.label??''} ${m.note??''}`.slice(0,2000),`songMoments.${m.id}`,{timeSeconds:m.timeSeconds}));if(m.lyricExcerpt)result.push(evidence('CREATOR_LYRIC',t.id,'CREATOR',m.lyricExcerpt,`songMoments.${m.id}.lyricExcerpt`,{timeSeconds:m.timeSeconds}));}
 if(lyrics)lyrics.text.split('\n').forEach((line,i)=>{if(line.trim()&&result.filter(e=>e.line).length<200)result.push(evidence('CREATOR_LYRIC',t.id,'CREATOR',line.slice(0,2000),`lyrics.line.${i+1}`,{line:i+1}));});
 return result;
}
export function songEvidence(analysis:Workbench,trackId:string,lyrics?:Lyrics|null){
 const song=analysis.songs.find(s=>s.trackId===trackId);if(!song)return [];
 const result=trackEvidence(song,lyrics),world=analysis.projects.find(p=>p.world.id===song.sourceFacts.releaseWorldId)?.world;
 if(world?.story)result.push(evidence('PROJECT_STORY',world.id,'CREATOR',world.story.slice(0,2000),'story'));
 for(const edge of analysis.catalog.edges.filter(e=>e.a===trackId||e.b===trackId).slice(0,3)){
  const other=analysis.songs.find(s=>s.trackId===(edge.a===trackId?edge.b:edge.a));if(other)result.push(evidence('TRACK_RELATIONSHIP',trackId,'DERIVED',`Related to ${other.sourceFacts.title}: shared ${edge.shared.join(', ')}. Metadata relationship, not acoustic similarity.`,`relationships.${other.trackId}`));
 }
 return result;
}
export function validateClaim(raw:unknown,ledger:EvidenceItem[]):IntelligenceClaim{
 const claim=ClaimSchema.parse(raw),ids=new Set(ledger.map(e=>e.id));
 if(claim.evidenceIds.some(id=>!ids.has(id)))throw new Error('Claim references evidence outside its snapshot.');
 return claim;
}
export function claim(subjectType:IntelligenceClaim['subjectType'],subjectId:string,type:string,statement:string,items:EvidenceItem[],confidence:IntelligenceClaim['confidence'],unknowns:string[]=[]):IntelligenceClaim{
 const inputHash=evidenceHash(items.map(e=>e.id));
 return validateClaim({id:`claim-${evidenceHash({subjectId,type,inputHash,statement})}`,subjectType,subjectId,claimType:type,statement,confidence,evidenceIds:items.slice(0,30).map(e=>e.id),unknowns,sourceMode:'DETERMINISTIC',engineVersion:REASONING_VERSION,inputHash,generatedAt:new Date().toISOString()},items);
}
export function songClaims(ledger:EvidenceItem[],trackId:string):IntelligenceClaim[]{
 const claims:IntelligenceClaim[]=[],meaning=ledger.find(e=>e.type==='CREATOR_MEANING'),turn=ledger.find(e=>e.type==='CREATOR_MOMENT'&&e.summary.includes(' TURN '));
 if(meaning&&turn)claims.push(claim('track',trackId,'CREATOR_TURN','Your stated meaning and a creator-marked turn provide two places to begin a reading. Their narrative relationship remains yours to explain.',[meaning,turn],'TENTATIVE',['A marked turn does not establish an acoustic or narrative change.']));
 const lines=ledger.filter(e=>e.type==='CREATOR_LYRIC'&&e.line);const groups=new Map<string,EvidenceItem[]>();
 for(const line of lines){const key=line.summary.trim().toLowerCase();groups.set(key,[...(groups.get(key)??[]),line]);}
 const repeated=[...groups.values()].filter(v=>v.length>1).sort((a,b)=>b.length-a.length)[0];
 if(repeated)claims.push(claim('track',trackId,'LYRICAL_REPETITION',`A line repeats ${repeated.length} times in the inspected lyrics. It may be worth exploring as a recurring thread; repetition alone does not establish its meaning.`,repeated,'SUPPORTED',['Only literal line repetition was inspected; up to 200 nonempty lines.']));
 const linked=ledger.find(e=>e.type==='CREATOR_LYRIC'&&e.timeSeconds!=null);
 if(linked)claims.push(claim('track',trackId,'CREATOR_LYRIC_LINK',`You associated a lyric excerpt with ${linked.timeSeconds}s. This is your timing reference, not automatic lyric alignment.`,[linked],'SUPPORTED',['The excerpt may belong to an earlier lyric draft.']));
 return claims.slice(0,3);
}
export function projectReading(analysis:Workbench,worldId:string){
 const project=analysis.projects.find(p=>p.world.id===worldId);if(!project)return null;
 const ledger=project.members.flatMap(s=>trackEvidence(s));
 const transitions=project.members.slice(1).map((next,i)=>{
  const previous=project.members[i],a=previous.creatorContext.deep.emotionalEnd?.trim(),b=next.creatorContext.deep.emotionalStart?.trim();
  const aMotion=previous.derived.evidence.filter(e=>['driving','floating','groovy','still'].includes(e.signal)),bMotion=next.derived.evidence.filter(e=>['driving','floating','groovy','still'].includes(e.signal));
  const related=project.edges.find(e=>(e.a===previous.trackId&&e.b===next.trackId)||(e.b===previous.trackId&&e.a===next.trackId));
  const items=ledger.filter(e=>[previous.trackId,next.trackId].includes(e.subjectId)&&(['REALM','PROJECT_POSITION','FINGERPRINT_SIGNAL'].includes(e.type)||['creatorContext.emotionalEnd','creatorContext.emotionalStart'].includes(e.sourcePath))).sort((a,b)=>Number(b.type==='CREATOR_CONTEXT')-Number(a.type==='CREATOR_CONTEXT'));
  if(related){const relationship=evidence('TRACK_RELATIONSHIP',previous.trackId,'DERIVED',`Shared signals across this boundary: ${related.shared.join(', ')}. ${related.strong?'Stronger':'Exploratory'} metadata evidence, not acoustic similarity.`,`transition.${previous.trackId}.${next.trackId}`);ledger.push(relationship);items.unshift(relationship);}
  let label='UNKNOWN',statement='There is not enough evidence to name this transition.',confidence:IntelligenceClaim['confidence']='LOW_EVIDENCE';
  if(a&&b&&a.toLowerCase()===b.toLowerCase()){label='CONTINUATION';statement='Your ending state and the next song’s opening state match after ignoring case and surrounding spaces. This supports a possible continuity in your intended arc.';confidence='SUPPORTED';}
  else if(aMotion.length&&bMotion.length&&!aMotion.some(x=>bMotion.some(y=>x.signal===y.signal))&&previous.derived.evidence.length>=3&&next.derived.evidence.length>=3){label='CONTRAST';statement='The supplied motion vocabulary changes across this boundary. A contrast is plausible; no audio-energy change has been measured.';confidence='TENTATIVE';}
  else if(related?.strong){label='CONTINUATION';statement='A strong shared-signal relationship supports a possible continuation. Lyrical and narrative continuity remain unverified.';confidence='TENTATIVE';}
  return {from:previous.trackId,to:next.trackId,label,claim:claim('transition',`${previous.trackId}:${next.trackId}`,label,statement,items,confidence,['Realm changes describe placement; they do not prove a narrative pivot.'])};
 });
 const supported=transitions.filter(t=>t.label!=='UNKNOWN');
 const endpoints=ledger.filter(e=>['creatorContext.emotionalStart','creatorContext.emotionalEnd'].includes(e.sourcePath));
 const arc=supported.length>=2&&endpoints.length>=2?claim('world',worldId,'POSSIBLE_ARC',`${supported.length} of ${transitions.length} adjacent boundaries support a possible continuity or contrast. Your recorded emotional states include “${endpoints[0]?.summary.slice(0,180)}” → “${endpoints[endpoints.length-1]?.summary.slice(0,180)}” in sequence order. This is a partial thread to inspect, not a complete story.`,[...endpoints,...ledger.filter(e=>supported.some(t=>t.claim.evidenceIds.includes(e.id)))].filter((e,i,a)=>a.findIndex(x=>x.id===e.id)===i),'TENTATIVE',['No forced opening/build/turn/release structure.']):null;
 return {ledger,transitions,arc,status:arc?'PARTIAL STRUCTURE':'ARC STILL EMERGING'};
}
