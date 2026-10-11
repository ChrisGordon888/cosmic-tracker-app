'use client';
import Link from 'next/link';
import ProjectCanonControl from './ProjectCanonControl';
import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
type Track={id:string;title:string;updatedAt:string;visibility?:string|null;isPublic?:boolean|null;publicCanon?:boolean|null;catalogTreatment?:string|null;status:string;showInNexus?:boolean;legacyRegistryId?:string|null;releaseWorldId?:string|null};
type World={id:string;title:string;slug?:string;visibility:string;publicCanon?:boolean|null;updatedAt?:string|null};
const CURATE=gql`mutation CuratePublicTrack($id:ID!,$expectedUpdatedAt:String!,$choice:String!,$confirmImpact:Boolean!){curatePublicTrack(id:$id,expectedUpdatedAt:$expectedUpdatedAt,choice:$choice,confirmImpact:$confirmImpact){id publicCanon visibility isPublic showInNexus nexusReviewStatus catalogTreatment updatedAt}}`;
const reasons=(t:Track,world?:World)=>{
 if(t.status==='archived'||['vault','test'].includes(t.catalogTreatment||''))return [];
 const shareable=['public','listed'].includes(t.visibility||'')||(t.visibility==null&&t.isPublic);
 return [shareable&&'Shareable visibility',shareable&&world?.visibility==='public'&&'Public project',t.showInNexus&&t.publicCanon!==false&&world?.publicCanon!==false&&'Nexus',shareable&&(!t.releaseWorldId||world?.visibility==='public')&&'Public catalog visibility'].filter(Boolean);
};
export default function PublicCurationReview({tracks,worlds,onSaved}:{tracks:Track[];worlds:World[];onSaved:()=>Promise<unknown>}){
 const [save,{loading}]=useMutation(CURATE);
 const [message,setMessage]=useState(''),[all,setAll]=useState(false);
 const queue=tracks.filter(t=>all||reasons(t,worlds.find(w=>w.id===t.releaseWorldId)).length).sort((a,b)=>Number(a.publicCanon!=null)-Number(b.publicCanon!=null));
 async function choose(t:Track,choice:string){
 const world=worlds.find(w=>w.id===t.releaseWorldId);
 const effect=choice==='canon'?'Allow this work in your current public identity. Existing playback/access rules still apply; no Nexus submission or featuring.':choice==='listed'?'Keep this song in public Realm/catalog browsing and direct links, below Canon priority. Remove editorial submission and reset Nexus review.':`Make this track private${choice==='sandbox'?' and move it to Test / Sandbox':''}, remove Nexus inclusion and reset review.`;
 if(!window.confirm(`${t.title}: ${effect}${world?.visibility==='public'?` It belongs to published project ${world.title}. Private/Sandbox removes listener access to this track; the project stays published.`:''} Files and project links stay intact. Copied media URLs cannot be revoked.`))return;
 setMessage('');try{await save({variables:{id:t.id,expectedUpdatedAt:t.updatedAt,choice,confirmImpact:true}});await onSaved();setMessage(`${t.title}: ${choice} saved. You can choose again to correct it; Nexus editorial placement is not automatically restored.`);}catch(e){setMessage(e instanceof Error?e.message:'Save failed. Reload before retrying.');}
 }
 return <details className="catalog-intelligence"><summary>Curate public music · current public identity</summary>
 <p>{tracks.filter(t=>t.publicCanon===true&&t.visibility==='public'&&t.status!=='archived'&&!['vault','test'].includes(t.catalogTreatment||'')).length} Canon · {tracks.filter(t=>t.visibility==='listed').length} Listed · {tracks.filter(t=>t.visibility==='private'&&t.catalogTreatment!=='test').length} Private · {tracks.filter(t=>t.catalogTreatment==='test').length} Sandbox</p>
 <p>Canon highlights current representative work; Listed remains public catalog music. Neither means Nexus editorial approval. Unreviewed legacy exposure stays unchanged until you decide. Private preserves creative history; it does not archive the lifecycle.</p>
 <p>{queue.filter(t=>t.publicCanon==null).length} exposed items need review.</p>
 <label><input type="checkbox" checked={all} onChange={e=>setAll(e.target.checked)}/> Include all private / protected music</label>
 <p role="status">{message}</p>
 {queue.map(t=><div key={t.id} style={{overflowWrap:'anywhere',padding:'12px 0',borderBottom:'1px solid #ffffff22'}}><strong>{t.title}</strong>{worlds.filter(w=>w.id===t.releaseWorldId&&w.slug).map(w=><p key={w.id}>World: {w.title} · <Link href={`/creator/releases/${w.slug}/publish`}>Manage World →</Link></p>)}<p>{t.publicCanon==null?'Needs review':t.publicCanon?'Canon selected':'Outside Canon'} · {t.visibility||'Legacy visibility'} · {reasons(t,worlds.find(w=>w.id===t.releaseWorldId)).join(' · ')||'Private catalog'}</p><div style={{display:'flex',flexWrap:'wrap',gap:8}}>{[['canon','Canon'],['listed','Listed / public catalog'],['private','Private'],['sandbox','Test / Sandbox']].map(([choice,label])=><button type="button" style={{minHeight:44}} key={choice} disabled={loading} onClick={()=>void choose(t,choice)}>{label}</button>)}</div>{['public','listed'].includes(t.visibility||'')&&<a href={`/listen/${t.id}`} target="_blank" rel="noreferrer">Open shareable track →</a>}</div>)}
 <details><summary>Release World presentation</summary>{worlds.map(w=><ProjectCanonControl key={w.id} world={w} onSaved={onSaved} />)}</details>
 </details>;
}
