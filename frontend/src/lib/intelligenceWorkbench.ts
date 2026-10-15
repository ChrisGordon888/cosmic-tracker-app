import { z } from 'zod';
import { analyzeCatalog } from './catalogIntelligence';
import { fingerprint, ENGINE_VERSION as FINGERPRINT_VERSION } from './creativeFingerprint';

export const ANALYSIS_VERSION = `workbench-v1:${FINGERPRINT_VERSION}:catalog-v1`;
const text = z.string().nullish();
const realm = z.union([z.literal(303),z.literal(202),z.literal(101),z.literal(55),z.literal(44),z.literal(0)]).nullable();
export const SongSourceSchema = z.object({
  id:z.string().min(1),ownerId:z.string().min(1),title:z.string(),releaseWorldId:text,
  trackNumber:z.number().nullish(),realmId:realm.optional(),creativeSignals:z.array(z.string()).nullish(),
  realmFinderSignals:z.array(z.string()).nullish(),mood:text,hook:text,notes:text,bpm:z.number().nullish(),keySignature:text,
  role:text,isFocusTrack:z.boolean().nullish(),visibility:text,publicCanon:z.boolean().nullish(),
  status:text,catalogTreatment:text,updatedAt:text,
});
export const WorldSourceSchema=z.object({id:z.string(),ownerId:z.string(),title:z.string(),slug:z.string(),story:text,oneLineSummary:text,status:text,updatedAt:text});
export type SongSource=z.infer<typeof SongSourceSchema>;
export type WorldSource=z.infer<typeof WorldSourceSchema>;
const EvidenceSchema=z.object({signal:z.string(),source:z.enum(['CREATOR_TAG','CREATOR_DESCRIPTION','STORY','LEGACY_FINDER']),weight:z.number()});
export const SongIntelligenceProfileSchema=z.object({
  trackId:z.string(),ownerId:z.string(),sourceFacts:SongSourceSchema,
  creatorContext:z.object({notes:z.string(),hook:z.string(),mood:z.string(),role:z.string()}),
  derived:z.object({evidence:z.array(EvidenceSchema),relatedTrackIds:z.array(z.string()),clusterIds:z.array(z.string()),bridge:z.boolean()}),
  confidence:z.object({level:z.enum(['limited','supported']),reasons:z.array(z.string())}),
  provenance:z.object({analysisVersion:z.string(),inputHash:z.string(),generatedAt:z.iso.datetime(),sources:z.array(z.string())}),
}).refine(p=>p.ownerId===p.sourceFacts.ownerId&&p.trackId===p.sourceFacts.id,{message:'Profile and source identity must agree'});
export type SongIntelligenceProfile=z.infer<typeof SongIntelligenceProfileSchema>;
export type Observation={id:string;kind:'derived'|'hypothesis';text:string;why:string;trackIds:string[];confidence:'limited'|'supported'};

// A change detector, not encryption or an identity/security boundary. No analysis is persisted.
function digest(value:unknown){let a=2166136261,b=5381;for(const char of JSON.stringify(value)){a=Math.imul(a^char.charCodeAt(0),16777619);b=Math.imul(b,33)^char.charCodeAt(0);}return `${(a>>>0).toString(16)}${(b>>>0).toString(16)}`;}
export function scopedSources(rawTracks:unknown[],rawWorlds:unknown[],ownerId:string){
  const tracks=rawTracks.map(t=>SongSourceSchema.safeParse(t)).flatMap(r=>r.success?[r.data]:[])
    .filter(t=>Boolean(ownerId)&&t.ownerId===ownerId&&(t.catalogTreatment??'current')==='current'&&t.status!=='archived').sort((a,b)=>a.id.localeCompare(b.id));
  const worlds=rawWorlds.map(w=>WorldSourceSchema.safeParse(w)).flatMap(r=>r.success?[r.data]:[])
    .filter(w=>Boolean(ownerId)&&w.ownerId===ownerId&&w.status!=='archived').sort((a,b)=>a.id.localeCompare(b.id));
  return {tracks,worlds};
}
export function sourceHash(rawTracks:unknown[],rawWorlds:unknown[],ownerId:string){return digest({version:ANALYSIS_VERSION,ownerId,...scopedSources(rawTracks,rawWorlds,ownerId)});}
export function isAnalysisStale(profile:SongIntelligenceProfile,tracks:unknown[],worlds:unknown[],ownerId:string){return profile.ownerId!==ownerId||profile.provenance.analysisVersion!==ANALYSIS_VERSION||profile.provenance.inputHash!==sourceHash(tracks,worlds,ownerId);}
export function buildIntelligence(rawTracks:unknown[],rawWorlds:unknown[],ownerId:string,generatedAt=new Date().toISOString()){
  const {tracks,worlds}=scopedSources(rawTracks,rawWorlds,ownerId);
  const catalog=analyzeCatalog(tracks.map(t=>({...t,status:t.status??undefined})),ownerId);
  const inputHash=sourceHash(tracks,worlds,ownerId);
  const songs=tracks.map(t=>{
    const fp=fingerprint(t),explicit=fp.evidence.filter(e=>e.source==='CREATOR_TAG').length;
    return SongIntelligenceProfileSchema.parse({trackId:t.id,ownerId,sourceFacts:t,
      creatorContext:{notes:t.notes??'',hook:t.hook??'',mood:t.mood??'',role:t.role??'unknown'},
      derived:{evidence:fp.evidence,relatedTrackIds:catalog.edges.filter(e=>e.a===t.id||e.b===t.id).map(e=>e.a===t.id?e.b:e.a),clusterIds:catalog.clusters.filter(c=>c.trackIds.includes(t.id)).map(c=>c.id),bridge:catalog.bridges.some(b=>b.trackId===t.id)},
      confidence:{level:explicit>=3?'supported':'limited',reasons:[`${explicit} explicit creator signals; ${fp.evidence.length-explicit} vocabulary matches from context.`, 'Evidence describes supplied metadata, not audio or lyrical meaning.']},
      provenance:{analysisVersion:ANALYSIS_VERSION,inputHash,generatedAt,sources:['owner catalog','creator signals','creator mood / hook / notes','legacy Finder signals','owned project context']},
    });
  });
  const byId=new Map(songs.map(s=>[s.trackId,s]));
  const observations:Observation[]=[];
  const strongest=catalog.edges.find(e=>e.strong);
  if(strongest)observations.push({id:'shared',kind:'derived',text:`${byId.get(strongest.a)?.sourceFacts.title} and ${byId.get(strongest.b)?.sourceFacts.title} share a strong signal relationship.`,why:`Shared vocabulary: ${strongest.shared.join(', ')}. Weighted overlap discounts common tags and gives text matches less weight. This is not a claim that the songs sound alike.`,trackIds:[strongest.a,strongest.b],confidence:'supported'});
  const bridge=catalog.bridges[0];
  if(bridge)observations.push({id:'bridge',kind:'hypothesis',text:`${byId.get(bridge.trackId)?.sourceFacts.title} may bridge ${bridge.connections.length} signal clusters.`,why:'At least two meaningful relationships reach each connected cluster. This is a catalog position, not an assigned creative role.',trackIds:[bridge.trackId],confidence:'limited'});
  const cluster=catalog.hypotheses[0];
  if(cluster)observations.push({id:'cluster',kind:'hypothesis',text:`${cluster.trackIds.length} songs form a possible shared direction around ${cluster.shared.slice(0,3).join(' + ')}.`,why:cluster.why,trackIds:cluster.trackIds,confidence:'limited'});
  const projects=worlds.map(world=>{
    const members=songs.filter(s=>s.sourceFacts.releaseWorldId===world.id).sort((a,b)=>(a.sourceFacts.trackNumber??0)-(b.sourceFacts.trackNumber??0));
    const ids=new Set(members.map(s=>s.trackId));const edges=catalog.edges.filter(e=>ids.has(e.a)&&ids.has(e.b));
    const signals=[...new Set(members.flatMap(s=>s.derived.evidence.map(e=>e.signal)))].map(signal=>({signal,count:members.filter(s=>s.derived.evidence.some(e=>e.signal===signal)).length})).filter(s=>s.count>=2).sort((a,b)=>b.count-a.count||a.signal.localeCompare(b.signal));
    const roles=members.flatMap(s=>{
      const strong=edges.filter(e=>(e.a===s.trackId||e.b===s.trackId)&&e.strong);
      if(s.derived.bridge)return [{trackId:s.trackId,role:'Bridge candidate',why:'Connects multiple catalog clusters; not necessarily a transition within this World.'}];
      if(strong.length>=2)return [{trackId:s.trackId,role:'Anchor candidate',why:`Strong signal relationships to ${strong.length} other songs in this World.`}];
      return [];
    });
    const contrasts=members.slice(1).flatMap((s,i)=>{
      const previous=members[i],a=fingerprint(previous.sourceFacts).motion,b=fingerprint(s.sourceFacts).motion;
      return a.length&&b.length&&!a.some(v=>b.includes(v))?[{from:previous.trackId,to:s.trackId,why:`Recognized motion vocabulary changes from ${a.join(' / ')} to ${b.join(' / ')}. This is not measured audio energy.`}]:[];
    });
    return {world,members,signals,edges,roles,contrasts,unknown:[...(!world.story?.trim()?['No creator-authored project story is recorded.']:[]),`${members.filter(s=>s.derived.evidence.length<3).length} songs have fewer than three recognized signals.`,'Lyrics, arrangement, sound and narrative arc have not been analyzed. Similar metadata is not proof of redundancy.']};
  });
  return {ownerId,songs,projects,catalog,observations,inputHash,generatedAt,invalidCount:rawTracks.filter(t=>typeof t==='object'&&t!==null&&'ownerId' in t&&t.ownerId===ownerId&&!SongSourceSchema.safeParse(t).success).length};
}
export type Workbench=ReturnType<typeof buildIntelligence>;
export function constellationGraph(workbench:Workbench,filters:{realm?:string;worldId?:string;canonOnly?:boolean}={}){
  const candidates=workbench.songs.filter(s=>(filters.realm==null||filters.realm==='all'||String(s.sourceFacts.realmId??'unknown')===filters.realm)&&(!filters.worldId||s.sourceFacts.releaseWorldId===filters.worldId)&&(!filters.canonOnly||(s.sourceFacts.publicCanon===true&&s.sourceFacts.visibility==='public')));
  const visible=candidates.slice(0,80),ids=new Set(visible.map(s=>s.trackId));
  const degree=new Map<string,number>();
  const edges=workbench.catalog.edges.filter(e=>ids.has(e.a)&&ids.has(e.b)).filter(e=>{if((degree.get(e.a)??0)>=3||(degree.get(e.b)??0)>=3)return false;degree.set(e.a,(degree.get(e.a)??0)+1);degree.set(e.b,(degree.get(e.b)??0)+1);return true;});
  const realmOrder=[303,202,101,55,44,0,null];
  const maxGroup=Math.max(1,...realmOrder.map(r=>visible.filter(s=>(s.sourceFacts.realmId??null)===r).length));
  const groupSpan=Math.ceil(Math.sqrt(maxGroup));
  const nodes=visible.map(s=>{const r=s.sourceFacts.realmId??null;const sector=realmOrder.indexOf(r);const group=visible.filter(t=>(t.sourceFacts.realmId??null)===r),i=group.indexOf(s);const columns=Math.ceil(Math.sqrt(group.length));return {id:s.trackId,title:s.sourceFacts.title,realmId:r,x:(sector%3)*(groupSpan*200+160)+(i%columns)*200,y:Math.floor(sector/3)*(groupSpan*140+160)+Math.floor(i/columns)*140};});
  return {nodes,edges,total:candidates.length,hidden:candidates.length-visible.length};
}
