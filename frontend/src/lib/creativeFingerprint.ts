import { realmFinderRealms } from './creatorRealmFinder';
export const SIGNALS = {
  feelings: ['powerful','defiant','hazy','nostalgic','romantic','reflective','playful','peaceful'],
  motion: ['driving','floating','groovy','still'],
  atmosphere: ['dark','dreamy','raw','bright','intimate'],
  themes: ['breakthrough','memory','love','escape','ambition','loyalty','exchange','authenticity','awareness'],
} as const;
export type SignalGroup = keyof typeof SIGNALS;
export type RealmDecision = { realmId: number; suggestedRealmId?: number | null; action: string; engineVersion: string; signals: string[]; at: string };
export type FingerprintTrack = { id: string; ownerId?: string; creativeSignals?: string[] | null; creativeDecisions?: RealmDecision[] | null; mood?: string | null; hook?: string | null; notes?: string | null; bpm?: number | null; keySignature?: string | null; realmId?: number | null; releaseWorldId?: string | null; realmFinderSignals?: string[] | null; updatedAt?: string | null };
export type Evidence = { signal: string; source: 'CREATOR_TAG' | 'CREATOR_DESCRIPTION' | 'STORY' | 'LEGACY_FINDER'; weight: number };
export const ENGINE_VERSION = 'fingerprint-v2.1';
const aliases: Record<string,string[]> = {powerful:['power'],defiant:['defiance','confrontation','rebellion'],driving:['momentum','driven'],nostalgic:['nostalgia'],romantic:['romance'],dreamy:['dreaminess','dreamlike'],floating:['drift','suspended time'],reflective:['personal','reflection'],authenticity:['authentic','integrity'],awareness:['aware','presence'],exchange:['reciprocity','resources'],breakthrough:['rupture','transformation']};
const all = Object.values(SIGNALS).flat() as string[];
export function fingerprint(track: FingerprintTrack) {
  const evidence: Evidence[] = [];
  for (const signal of track.creativeSignals ?? []) if(all.includes(signal)) evidence.push({signal,source:'CREATOR_TAG',weight:3});
  const texts: [string,'CREATOR_DESCRIPTION'|'STORY'|'LEGACY_FINDER'][] = [[track.mood??'','CREATOR_DESCRIPTION'],[track.hook??'','STORY'],[track.notes??'','CREATOR_DESCRIPTION'],[(track.realmFinderSignals??[]).join(' '),'LEGACY_FINDER']];
  for(const [text,source] of texts) for(const signal of all) {
    const normalized=` ${text.toLowerCase().replace(/[^a-z ]/g,' ')} `;
    if([signal,...(aliases[signal]??[])].some(word=>normalized.includes(` ${word} `)) && !evidence.some(e=>e.signal===signal)) evidence.push({signal,source,weight:1});
  }
  const groups=Object.fromEntries(Object.entries(SIGNALS).map(([group,values])=>[group,evidence.filter(e=>(values as readonly string[]).includes(e.signal)).map(e=>e.signal)])) as Record<SignalGroup,string[]>;
  return {version:ENGINE_VERSION,trackId:track.id,ownerId:track.ownerId,...groups,evidence,bpm:track.bpm??null,key:track.keySignature??null,realm:track.realmId??null,projectId:track.releaseWorldId??null,creatorDecision:track.creativeDecisions?.at(-1)??null,updatedAt:track.updatedAt??null};
}
// Core +3, secondary +1, opposing -2, multiplied by explicit-tag 3 / text 1.
// Tempo, key, title, and assigned Realm never vote for a Realm.
export const ONTOLOGY: Record<number,{core:string[];secondary:string[];opposing:string[];neighbors:number[];why:string}> = {
  303:{core:['defiant','breakthrough','raw'],secondary:['powerful','driving','dark','loyalty'],opposing:['peaceful','still'],neighbors:[55,202],why:'Pressure, confrontation and breaking into a new form; unlike Skybound City, disruption matters more than achievement.'},
  202:{core:['dreamy','escape','hazy'],secondary:['dark','floating'],opposing:['raw','authenticity'],neighbors:[101,303],why:'Altered perception, dream and escape; memory and relationships would pull this toward Moonlit Roads.'},
  101:{core:['nostalgic','memory','romantic','reflective'],secondary:['floating','dreamy','hazy','love','intimate'],opposing:['defiant','breakthrough'],neighbors:[202,0],why:'Memory, relationships and inward reflection; dreaminess supports the lived experience rather than replacing it.'},
  55:{core:['ambition','powerful','driving'],secondary:['bright','breakthrough'],opposing:['still','escape'],neighbors:[303,44],why:'Directed momentum, ambition and building something visible; unlike the Frontier, the emphasis is on construction.'},
  44:{core:['exchange','groovy','playful'],secondary:['loyalty','love','bright'],opposing:['still','escape'],neighbors:[55,0],why:'Reciprocity, rhythm and value moving between people; ambition alone belongs closer to Skybound City.'},
  0:{core:['authenticity','awareness','peaceful','still'],secondary:['reflective','intimate'],opposing:['defiant','ambition'],neighbors:[101,44],why:'Presence, integrity and unforced coherence; reflection here resolves toward being rather than revisiting memory.'},
};
export function interpretFingerprint(track: FingerprintTrack, catalog: FingerprintTrack[] = []) {
  const fp=fingerprint(track);
  const ranks=Object.entries(ONTOLOGY).map(([id,rule])=>({id:Number(id),score:fp.evidence.reduce((s,e)=>s+e.weight*(rule.core.includes(e.signal)?3:rule.secondary.includes(e.signal)?1:rule.opposing.includes(e.signal)?-2:0),0),conflicts:fp.evidence.filter(e=>rule.opposing.includes(e.signal)).length})).sort((a,b)=>b.score-a.score||a.id-b.id);
  const [top,next]=ranks; const n=fp.evidence.length; const gap=top.score-next.score;
  const groups=Object.keys(SIGNALS).filter(k=>fp[k as SignalGroup].length).length;
  const conflicting=Object.values(ONTOLOGY).some(rule=>fp.evidence.some(e=>rule.core.includes(e.signal))&&fp.evidence.some(e=>rule.opposing.includes(e.signal)));
  const strength=n<2||top.score<=0?'Insufficient evidence':gap<=3||conflicting?'Mixed':n<3?'Low evidence':n>=4&&groups>=3&&gap>=6?'Strong fit':'Good fit';
  let home=strength==='Insufficient evidence'?null:top.id;
  const snapshot=[...(track.creativeSignals??[])].sort().join('|');
  const precedent=track.ownerId && (track.creativeSignals?.length??0)>=3 ? catalog.filter(t=>t.ownerId===track.ownerId&&t.id!==track.id&&[...(t.creativeSignals??[])].sort().join('|')===snapshot).flatMap(t=>(t.creativeDecisions??[]).slice(-1).filter(d=>d.realmId===t.realmId&&d.engineVersion===ENGINE_VERSION&&['accepted','overridden'].includes(d.action)&&[...d.signals].sort().join('|')===snapshot&&ONTOLOGY[d.realmId])).sort((a,b)=>new Date(b.at).getTime()-new Date(a.at).getTime())[0] : undefined;
  if(precedent) home=precedent.realmId;
  const secondary=ranks.find(r=>r.id!==home&&r.score>0&&r.score>=top.score*.45);
  return {home,secondary:home!==null?secondary?.id??null:null,strength:precedent?'Good fit':strength,reasons:precedent?[`Your prior decision for these exact signals favors ${realmFinderRealms[precedent.realmId as keyof typeof realmFinderRealms].name}. This is your precedent, not a universal rule.`]:home===null?['Add a few signals so COSMIC has something to work with.']:[ONTOLOGY[home].why,`Evidence: ${fp.evidence.map(e=>e.signal).join(' · ')}.`,...(conflicting?['Some signals point in opposing directions; review this interpretation.']:[])],fingerprint:fp};
}
export function scanCatalog<T extends FingerprintTrack>(tracks:T[], catalog: FingerprintTrack[]=tracks) {
  return tracks.map(track=>({track,result:interpretFingerprint(track,catalog)})).map(row=>({...row,bucket:row.result.fingerprint.evidence.length===0?'No evidence':row.result.strength==='Strong fit'||row.result.strength==='Good fit'?'Strong suggestion':row.result.strength==='Mixed'?'Ambiguous':'Needs more signals'}));
}
export const realmName = (id:number) => realmFinderRealms[id as keyof typeof realmFinderRealms]?.name ?? 'Realm undecided';
