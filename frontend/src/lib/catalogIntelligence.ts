import { fingerprint, SIGNALS, ONTOLOGY, realmName, type FingerprintTrack } from './creativeFingerprint';
export type IntelligenceTrack = FingerprintTrack & { title?: string; status?: string; catalogTreatment?: string | null };
const vocabulary = Object.values(SIGNALS).flat() as string[];
const category = (signal:string) => Object.entries(SIGNALS).find(([,tags])=>(tags as readonly string[]).includes(signal))?.[0];
const groups = (signals:string[]) => new Set(signals.map(category).filter(Boolean)).size;
const tags = (track:IntelligenceTrack) => [...new Set((track.creativeSignals??[]).filter(s=>vocabulary.includes(s)))];
export function activeCatalog(tracks:IntelligenceTrack[],ownerId:string) {
  return tracks.filter(t=>Boolean(ownerId)&&t.ownerId===ownerId&&(t.catalogTreatment??'current')==='current'&&t.status!=='archived').slice().sort((a,b)=>a.id.localeCompare(b.id));
}
export function signalQuality(tracks:IntelligenceTrack[],ownerId:string) {
  const current=activeCatalog(tracks,ownerId),tagged=current.filter(t=>tags(t).length);
  return vocabulary.map(signal=>{
    const matches=tagged.filter(t=>tags(t).includes(signal));
    const cooccurrence=vocabulary.filter(s=>s!==signal).map(other=>({signal:other,count:matches.filter(t=>tags(t).includes(other)).length,total:tagged.filter(t=>tags(t).includes(other)).length})).filter(p=>p.count>0).sort((a,b)=>b.count-a.count||a.signal.localeCompare(b.signal));
    const realms:Record<string,number>={};for(const t of matches){const key=t.realmId==null?'Undecided':realmName(t.realmId);realms[key]=(realms[key]??0)+1;}
    const share=tagged.length?matches.length/tagged.length:0;
    const overlap=cooccurrence.find(p=>matches.length>=3&&p.total>=3&&p.count/Math.max(matches.length,p.total)>=.8);
    const finding=tagged.length<8||matches.length<3?'Insufficient usage data':share>=.6?'Broad':overlap?'Overlapping':share<=.35?'Distinctive':'Observed';
    return {signal,count:matches.length,tagged:tagged.length,percentage:Math.round(share*100),realms,cooccurrence,finding,overlapWith:overlap?.signal??null,note:matches.length===0?'Unused in this sample; rarity is not evidence of low value.':matches.length<3?'Rare in this sample; usefulness needs creator review.':finding==='Broad'?'Frequent enough to carry less distinguishing weight; this does not make it a bad signal.':finding==='Overlapping'?`Frequently paired with ${overlap?.signal}; not proof of redundancy.`:'Describes this sample, not a universal vocabulary judgment.'};
  });
}
export type Relationship = { a:string;b:string;score:number;shared:string[];categories:number;meaningful:boolean;strong:boolean;support:string[] };
export function analyzeCatalog(tracks:IntelligenceTrack[],ownerId:string) {
  const current=activeCatalog(tracks,ownerId);
  const evidence=new Map(current.map(t=>[t.id,fingerprint(t).evidence]));
  const signals=new Map(current.map(t=>[t.id,[...new Set(evidence.get(t.id)!.map(e=>e.signal))]]));
  const enough=(t:IntelligenceTrack)=>signals.get(t.id)!.length>=3&&groups(signals.get(t.id)!)>=2;
  const eligible=current.filter(enough),needsSignals=current.filter(t=>!enough(t));
  const frequency=new Map(vocabulary.map(s=>[s,eligible.filter(t=>signals.get(t.id)!.includes(s)).length]));
  const weight=(s:string)=>1+Math.log((eligible.length+1)/((frequency.get(s)??0)+1));
  const compare=(a:IntelligenceTrack,b:IntelligenceTrack):Relationship=>{
    const left=signals.get(a.id)!,right=signals.get(b.id)!,shared=left.filter(s=>right.includes(s)).sort();
    const union=[...new Set([...left,...right])];
    // Explicit tags are full-strength; matched prose is half-strength. Context cannot qualify an edge.
    const confidence=(t:IntelligenceTrack,s:string)=>evidence.get(t.id)!.find(e=>e.signal===s)?.source==='CREATOR_TAG'?1:.5;
    const denominator=union.reduce((n,s)=>n+weight(s)*Math.max(left.includes(s)?confidence(a,s):0,right.includes(s)?confidence(b,s):0),0);
    const overlap=denominator?shared.reduce((n,s)=>n+weight(s)*Math.min(confidence(a,s),confidence(b,s)),0)/denominator:0;
    const support:string[]=[];let bonus=0;
    if(a.realmId!=null&&a.realmId===b.realmId){support.push(`Shared creator Realm: ${realmName(a.realmId)}`);bonus+=.03;}
    else if(a.realmId!=null&&b.realmId!=null&&(ONTOLOGY[a.realmId]?.neighbors.includes(b.realmId)||ONTOLOGY[b.realmId]?.neighbors.includes(a.realmId))){support.push(`Neighbor Realms: ${realmName(a.realmId)} ↔ ${realmName(b.realmId)}`);bonus+=.02;}
    if(a.releaseWorldId&&a.releaseWorldId===b.releaseWorldId){support.push('Already share a project');bonus+=.02;}
    if(a.bpm&&b.bpm&&Math.abs(a.bpm-b.bpm)<=10){support.push('Nearby stated tempo');bonus+=.01;}
    if(a.keySignature?.trim()&&a.keySignature.trim().toLowerCase()===b.keySignature?.trim().toLowerCase()){support.push('Same stated key');bonus+=.01;}
    const meaningful=shared.length>=2&&groups(shared)>=2&&overlap>=.28;
    return {a:a.id,b:b.id,score:meaningful?overlap+bonus:overlap,shared,categories:groups(shared),meaningful,strong:meaningful&&shared.length>=3&&overlap>=.55,support:meaningful?support:[]};
  };
  const relationships:Relationship[]=[];
  for(let a=0;a<eligible.length;a++)for(let b=a+1;b<eligible.length;b++)relationships.push(compare(eligible[a],eligible[b]));
  const edges=relationships.filter(r=>r.meaningful).sort((a,b)=>b.score-a.score||a.a.localeCompare(b.a)||a.b.localeCompare(b.b));
  const edgeMap=new Map(relationships.map(r=>[[r.a,r.b].sort().join('|'),r]));
  const edge=(a:string,b:string)=>edgeMap.get([a,b].sort().join('|'));
  // Complete-link groups prevent a chain of weak bridges becoming one invented project.
  const assigned=new Set<string>();const cores:string[][]=[];
  for(const seed of edges){
    if(assigned.has(seed.a)||assigned.has(seed.b))continue;
    const core=[seed.a,seed.b];
    for(const t of eligible)if(!assigned.has(t.id)&&!core.includes(t.id)&&core.every(id=>edge(id,t.id)?.meaningful))core.push(t.id);
    core.forEach(id=>assigned.add(id));cores.push(core.sort());
  }
  const clusters=cores.map((ids,index)=>{
    const shared=vocabulary.filter(s=>ids.filter(id=>signals.get(id)!.includes(s)).length>=Math.ceil(ids.length*.6));
    const internal=edges.filter(e=>ids.includes(e.a)&&ids.includes(e.b));
    const cohesion=ids.length>=3&&internal.every(e=>e.strong)?'Strong cohesion':ids.length>=3?'Promising':'Loose / exploratory';
    const realms:Record<string,number>={};ids.forEach(id=>{const r=current.find(t=>t.id===id)!.realmId;if(r!=null)realms[r]=(realms[r]??0)+1;});
    const ranking=Object.entries(realms).sort((a,b)=>b[1]-a[1]);
    const realm=ranking[0]&&ranking[0][1]>ids.length/2?Number(ranking[0][0]):null;
    return {id:`shape-${index+1}`,trackIds:ids,shared,cohesion,realm,possibleProject:ids.length>=3&&shared.length>=2&&groups(shared)>=2,why:`Every pair shares at least two concepts across two categories. ${shared.length?'Recurring identity: '+shared.join(' · ')+'.':'No single identity is shared by most tracks yet.'}`};
  });
  const bridges=eligible.map(t=>{
    const connections=clusters.map(c=>({clusterId:c.id,links:c.trackIds.filter(id=>id!==t.id).map(id=>edge(t.id,id)).filter((e):e is Relationship=>Boolean(e?.meaningful))})).filter(c=>c.links.length>=2);
    return {trackId:t.id,connections};
  }).filter(b=>b.connections.length>=2);
  const ownOrbits=eligible.length>=4?eligible.filter(t=>!edges.some(e=>e.a===t.id||e.b===t.id)):[];
  const realmDistribution:Record<string,number>={};for(const t of current){const key=t.realmId==null?'Undecided':realmName(t.realmId);realmDistribution[key]=(realmDistribution[key]??0)+1;}
  return {ownerId,total:current.length,excluded:tracks.filter(t=>t.ownerId===ownerId).length-current.length,tagged:current.filter(t=>tags(t).length).length,taggedWithThree:current.filter(t=>tags(t).length>=3).length,eligible:eligible.map(t=>t.id),needsSignals:needsSignals.map(t=>t.id),edges,clusters,hypotheses:clusters.filter(c=>c.possibleProject),bridges,ownOrbits:ownOrbits.map(t=>t.id),outlierComparisonAvailable:eligible.length>=4,quality:signalQuality(current,ownerId),realmDistribution};
}
