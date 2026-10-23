'use client';
import {gql,useQuery,useMutation} from '@apollo/client';
import {useState} from 'react';
import {GET_PUBLIC_NEXUS_TRACKS} from '@/graphql/realms';
const CONFIG=gql`query SamplerConfig{nexusEditorialConfig{id samplerRevision nexusRealmSamplers{realmId trackIds}}}`;
const SAVE=gql`mutation SaveSampler($realmId:Int!,$trackIds:[ID!]!,$expectedRevision:Int!){setNexusRealmSampler(realmId:$realmId,trackIds:$trackIds,expectedRevision:$expectedRevision){id samplerRevision nexusRealmSamplers{realmId trackIds}}}`;
export default function NexusSamplerControls({trackId,realmId,canPlace}:{trackId:string;realmId:number|null|undefined;canPlace:boolean}){
 const config=useQuery(CONFIG,{fetchPolicy:'network-only'});
 const main=useQuery(GET_PUBLIC_NEXUS_TRACKS,{variables:{realmId},skip:realmId==null,fetchPolicy:'network-only'});
 const [save]=useMutation(SAVE),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const state=config.data?.nexusEditorialConfig;
 const ids:string[]=state?.nexusRealmSamplers?.find((s:{realmId:number})=>s.realmId===realmId)?.trackIds??[];
 const tracks: {id:string;title:string;accessTier?:string;playbackStatus?:string;audioUrl?:string;previewAudioUrl?:string}[]=main.data?.getPublicNexusTracks??[];
 const selected=ids.includes(trackId),eligible=tracks.some(t=>t.id===trackId);
 const blocked=!canPlace||busy||config.loading||main.loading||!!config.error||!!main.error||realmId==null;
 async function update(next:string[]){setBusy(true);setMessage('');try{await save({variables:{realmId,trackIds:next,expectedRevision:state?.samplerRevision??0}});await config.refetch();setMessage('Sampler saved. Main soundtrack, Nexus publication and World featuring are unchanged.');}catch(e){setMessage(e instanceof Error?e.message:'Sampler save failed.');await config.refetch();}finally{setBusy(false)}}
 function move(index:number,delta:number){const next=[...ids];[next[index],next[index+delta]]=[next[index+delta],next[index]];void update(next);}
 return <section className="my-4 border-t border-white/10 pt-4"><h5>Nexus Realm Sampler · {ids.length}/9</h5>
 <p className="text-xs text-white/60">An explicit preview of the main soundtrack, in editorial order. Only publicly playable main-soundtrack selections qualify; no standalone Nexus publication is required.</p>
 {(config.error||main.error)&&<p role="alert">Selection data unavailable. <button onClick={()=>{void config.refetch();void main.refetch();}}>Retry</button></p>}
 <button className="my-2 rounded-xl border border-white/20 px-3 py-2 disabled:opacity-40" disabled={blocked||(!selected&&(!eligible||ids.length>=9))} onClick={()=>void update(selected?ids.filter(id=>id!==trackId):[...ids,trackId])}>{selected?'Withdraw from Nexus sampler':'Select for Nexus sampler'}</button>
 {!canPlace&&<p className="text-xs">Requires nexus.editorial or owner authority.</p>}
 {!eligible&&!selected&&<p className="text-xs">Select this track for the main soundtrack first; reload this review after placement.</p>}
 {message&&<p role="status">{message}</p>}
 <details><summary>Sampler order / withdrawal</summary><ol>{ids.map((id,index)=><li key={id} className="flex flex-wrap items-center gap-2 py-2"><span>{index+1}. {tracks.find(t=>t.id===id)?.title??'Unavailable selection'}</span><button aria-label={`Move sampler track ${index+1} up`} disabled={blocked||index===0} onClick={()=>move(index,-1)}>↑</button><button aria-label={`Move sampler track ${index+1} down`} disabled={blocked||index===ids.length-1} onClick={()=>move(index,1)}>↓</button><button disabled={blocked} onClick={()=>void update(ids.filter(value=>value!==id))}>Remove</button></li>)}</ol>
 {ids.length>0&&<button disabled={blocked} onClick={()=>void update([])}>Clear this sampler</button>}
 </details></section>;
}
