'use client';
import {gql,useQuery,useMutation} from '@apollo/client';
import {useState} from 'react';
import {PUBLIC_PROJECTS} from '@/graphql/publicProjects';
import type {PublicProject} from '@/lib/publicProjects';
import {realmName} from '@/lib/creativeFingerprint';
const CONFIG=gql`query RealmSelections{nexusEditorialConfig{id realmDiscovery{worldId realmId} realmSoundtracks{worldId trackId realmId} soundtrackWithdrawnTrackIds}}`;
const DISCOVERY=gql`mutation RealmDiscovery($worldId:ID!,$realmId:Int!,$selected:Boolean!){setRealmDiscovery(worldId:$worldId,realmId:$realmId,selected:$selected){id realmDiscovery{worldId realmId}}}`;
const SOUNDTRACK=gql`mutation RealmSoundtrack($trackId:ID!,$realmId:Int!,$selected:Boolean!){setRealmSoundtrack(trackId:$trackId,realmId:$realmId,selected:$selected){id realmSoundtracks{trackId worldId realmId} soundtrackWithdrawnTrackIds}}`;
type Selection={worldId:string;trackId?:string;realmId:number};
export default function RealmSelections(){
 const projects=useQuery(PUBLIC_PROJECTS,{variables:{includeNonCanon:true},fetchPolicy:'network-only'}),config=useQuery(CONFIG,{fetchPolicy:'network-only'});
 const [discovery]=useMutation(DISCOVERY),[soundtrack]=useMutation(SOUNDTRACK);
 const [realms,setRealms]=useState<Record<string,string>>({}),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const state=config.data?.nexusEditorialConfig;
 async function save(kind:'world'|'track',id:string,realmId:number,selected:boolean){setBusy(true);setMessage('');try{await(kind==='world'?discovery:soundtrack)({variables:{[kind==='world'?'worldId':'trackId']:id,realmId,selected}});await config.refetch();setMessage('Editorial placement saved. Personal publication and Nexus selection are unchanged.');}catch(e){setMessage(e instanceof Error?e.message:'Could not save.');}finally{setBusy(false);}}
 return <section className="glass-card p-5 mb-6"><h2 className="text-xl">Realm discovery & official soundtracks</h2><p>Discovery admits a public project, including non-Canon work. Soundtrack selection separately admits a track in its current project and Realm. Neither admits it to Nexus.</p><p role="status">{message}</p>
 {projects.error||config.error?<p role="alert">Editorial data unavailable. <button onClick={()=>{void projects.refetch();void config.refetch();}}>Retry</button></p>:projects.loading||config.loading?<p>Loading…</p>:<>
 {(projects.data?.publicProjects??[]).map((p:PublicProject)=>{const value=realms[p.world.id]??(p.realmId==null?'':String(p.realmId));return <article key={p.world.id} className="border-b border-white/10 py-4"><h3>{p.world.title} · {p.creatorName}</h3><label>Discovery Realm <select className="bg-slate-900 p-2" value={value} onChange={e=>setRealms({...realms,[p.world.id]:e.target.value})}><option value="">Choose a Realm</option>{[303,202,101,55,44,0].map(id=><option key={id} value={id}>{realmName(id)}</option>)}</select></label><button className="border rounded p-2 m-2" disabled={busy||value===''} onClick={()=>void save('world',p.world.id,Number(value),true)}>Admit project to discovery</button>
 {p.tracks.map(t=><div key={t.id} className="flex flex-wrap gap-3 py-2"><span>{t.title} · {t.realmId==null?'Unassigned':realmName(t.realmId)}</span><button disabled={busy||t.realmId==null} onClick={()=>void save('track',t.id,t.realmId!,true)}>Select official soundtrack</button><button disabled={busy||t.realmId==null} onClick={()=>void save('track',t.id,t.realmId!,false)}>Withdraw soundtrack</button></div>)}</article>})}
 <h3 className="mt-4">Stored discovery placements</h3>{(state?.realmDiscovery??[]).map((s:Selection)=><p key={`${s.worldId}-${s.realmId}`}>{s.worldId} · {realmName(s.realmId)} <button disabled={busy} onClick={()=>void save('world',s.worldId,s.realmId,false)}>Remove discovery placement</button></p>)}
 <h3 className="mt-4">Stored soundtrack placements</h3>{(state?.realmSoundtracks??[]).map((s:Selection)=><p key={`${s.trackId}-${s.realmId}`}>{s.trackId} · {realmName(s.realmId)} <button disabled={busy} onClick={()=>void save('track',s.trackId!,s.realmId,false)}>Remove soundtrack placement</button></p>)}
 <p>Existing explicitly published Nexus signals remain soundtrack-eligible unless withdrawn here. Stale/unpublished/suspended sources are filtered at read time.</p>
 </> }</section>;
}
