'use client';
import NexusSamplerControls from './NexusSamplerControls';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
const CONFIG=gql`query ReviewPlacements { nexusEditorialConfig { id selectedWorldIds realmDiscovery { worldId realmId } realmSoundtracks { trackId worldId realmId } } }`;
const EVIDENCE=gql`query ReviewEvidence($trackId:ID!){nexusReviewEvidence(trackId:$trackId){id title body meta kind}}`;
const DISCOVERY=gql`mutation ReviewDiscovery($worldId:ID!,$realmId:Int!,$selected:Boolean!){setRealmDiscovery(worldId:$worldId,realmId:$realmId,selected:$selected){id}}`;
const SOUNDTRACK=gql`mutation ReviewSoundtrack($trackId:ID!,$realmId:Int!,$selected:Boolean!){setRealmSoundtrack(trackId:$trackId,realmId:$realmId,selected:$selected){id}}`;
const WORLD=gql`mutation ReviewWorld($worldId:ID!,$selected:Boolean!){setNexusProjectSelection(worldId:$worldId,selected:$selected){id}}`;
type Placement={worldId:string;trackId?:string;realmId:number};
export default function EditorialPlacementControls({world,track,canPlace}:{
 world:{id:string;publicCanon?:boolean|null;visibility:string;status:string};
 track:{id:string;realmId?:number|null;nexusReviewStatus:string;visibility:string;status:string};
 canPlace:boolean;
}){
 const config=useQuery(CONFIG,{fetchPolicy:'network-only'});
 const evidence=useQuery(EVIDENCE,{variables:{trackId:track.id},fetchPolicy:'network-only'});
 const [saveDiscovery]=useMutation(DISCOVERY),[saveSoundtrack]=useMutation(SOUNDTRACK),[saveWorld]=useMutation(WORLD);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const data=config.data?.nexusEditorialConfig;
 const realm=track.realmId;
 const discovery=(data?.realmDiscovery??[]).some((s:Placement)=>s.worldId===world.id&&s.realmId===realm);
 const soundtrack=(data?.realmSoundtracks??[]).some((s:Placement)=>s.trackId===track.id&&s.worldId===world.id&&s.realmId===realm);
 const selected=(data?.selectedWorldIds??[]).includes(world.id);
 const publicWorld=world.visibility==='public'&&world.status!=='archived';
 const approved=['approved','published'].includes(track.nexusReviewStatus);
 async function save(destination:'discovery'|'soundtrack'|'world',value:boolean){
  setBusy(true);setMessage('');
  try{await (destination==='discovery'?saveDiscovery:destination==='soundtrack'?saveSoundtrack:saveWorld)({variables:{worldId:world.id,trackId:track.id,realmId:realm,selected:value}});await config.refetch();setMessage('Placement saved. Other destinations and creator publication are unchanged.');}
  catch(error){setMessage(error instanceof Error?error.message:'Placement could not be saved.');}finally{setBusy(false);}
 }
 const blocked=!canPlace||busy||config.loading||Boolean(config.error);
 return <section className="my-5 rounded-2xl border border-white/10 p-4">
  <h4 className="font-semibold">Independent editorial placements</h4>
  <p className="text-xs text-white/60">Nexus music publication is controlled below. Each selection here is separate; Canon remains the creator’s classification.</p>
  {!canPlace&&<p className="text-sm text-amber-100">Placement access requires the owner role or an administrator explicitly granted nexus.editorial.</p>}
  {config.loading?<p>Loading placements…</p>:config.error?<p role="alert">Placements unavailable. <button onClick={()=>void config.refetch()}>Retry</button></p>:<div className="mt-3 grid gap-3 sm:grid-cols-3">
   <div><p>Realm discovery: {discovery?'Selected':'Not selected'}</p><button className="mt-2 min-h-11 rounded-xl border border-white/20 px-3 py-2 text-sm disabled:opacity-40" disabled={blocked||(!discovery&&(!publicWorld||realm==null))} onClick={()=>void save('discovery',!discovery)}>{discovery?'Withdraw discovery':'Admit to Realm discovery'}</button>{!discovery&&(!publicWorld||realm==null)&&<p className="text-xs">Requires a public World and assigned Realm.</p>}</div>
   <div><p>Official soundtrack: {soundtrack?'Selected':'Not selected'}</p><button className="mt-2 min-h-11 rounded-xl border border-white/20 px-3 py-2 text-sm disabled:opacity-40" disabled={blocked||realm==null||(!soundtrack&&(!approved||!publicWorld||!['public','listed'].includes(track.visibility)||track.status==='archived'))} onClick={()=>void save('soundtrack',!soundtrack)}>{soundtrack?'Withdraw soundtrack':'Select soundtrack'}</button>{!approved&&<p className="text-xs">Approve this submission first.</p>}</div>
   <div><p>Nexus Canon World: {selected?'Selected':'Not selected'}</p><button className="mt-2 min-h-11 rounded-xl border border-white/20 px-3 py-2 text-sm disabled:opacity-40" disabled={blocked||(!selected&&(!publicWorld||world.publicCanon!==true))} onClick={()=>void save('world',!selected)}>{selected?'Withdraw Nexus World':'Select Nexus World'}</button>{world.publicCanon!==true&&<p className="text-xs">Requires creator Canon and a public World.</p>}</div>
  </div>}
  <p role="status" className="text-sm my-2">{message}</p>
  <NexusSamplerControls key={String(soundtrack)} trackId={track.id} realmId={realm} canPlace={canPlace} />
  <details><summary>Creator-published process evidence</summary><p className="text-xs text-white/60">Only published text fragments for this World/submitted song. Private notes, attachment URLs and other songs’ workspace materials are excluded.</p>
   {evidence.loading?<p>Loading evidence…</p>:evidence.error?<p role="alert">Evidence unavailable: {evidence.error.message}</p>:evidence.data?.nexusReviewEvidence?.length?evidence.data.nexusReviewEvidence.map((item:{id:string;title:string;body?:string;meta?:string})=><article className="my-3" key={item.id}><h5>{item.title}</h5><p>{item.body}</p><small>{item.meta}</small></article>):<p>No creator-published process evidence. Nothing private has been requested.</p>}
  </details>
 </section>;
}
