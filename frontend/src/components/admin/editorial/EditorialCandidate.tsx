'use client';
import {useState} from 'react';
import {useQuery} from '@apollo/client';
import Link from 'next/link';
import {STUDIO_EVIDENCE} from '@/graphql/editorialStudio';
import {REALM_THEMES} from '@/lib/realmTheme';
import {publicWorldHref} from '@/lib/releaseSharing';
import {STUDIO_REALMS,actionAssessment,placementLabels,intentState,type Assessment,type Signal,type Project,type Config,type Intent,type StudioAction,type RealmKey} from '@/lib/editorialStudio';
export default function EditorialCandidate({signal,project,config,assessments,busy,prepare}:{signal:Signal;project?:Project;config?:Config|null;assessments:Assessment[];busy:boolean;prepare:(items:Intent[])=>Promise<void>}){
 const {track,releaseWorld:world}=signal;
 const [open,setOpen]=useState(false),[notes,setNotes]=useState(''),[realm,setRealm]=useState(track.realmId==null?'':String(track.realmId));
 const evidence=useQuery<{nexusReviewEvidence:{id:string;title:string;body?:string;meta?:string}[]}>(STUDIO_EVIDENCE,{variables:{trackId:track.id},skip:!open||!['in-review','needs-changes','approved','published'].includes(track.nexusReviewStatus??''),fetchPolicy:'network-only'});
 const soundtrack=config?.realmSoundtracks?.some(s=>s.trackId===track.id&&s.worldId===world.id&&s.realmId===track.realmId)??false;
 const submit=(action:StudioAction,selected?:boolean)=>{
  const r=action==='approve'?(realm===''?undefined:Number(realm)):track.realmId??undefined;
  const base={key:`${action}:${track.id}`,action,id:track.id,label:`${track.title} / ${world.title}`,realmId:r,selected,notes,source:JSON.stringify({worldId:world.id,realmId:track.realmId})};
  const after=action==='approve'||action==='needs-changes'?JSON.stringify({review:action==='approve'?'approved':'needs-changes',realm:action==='approve'?r??track.realmId:track.realmId}):action==='spotlight'||action==='anchor'?track.id:String(action==='publish'?true:action==='unpublish'?false:selected);
  void prepare([{...base,before:intentState(base,config,[signal]),after}]);
 };
 function control(action:StudioAction,label:string,selected?:boolean){
  const check=actionAssessment(assessments,'track',track.id,selected===false?'withdraw':action);
  // Realm changes are validated by a fresh server assessment when preparing approval.
  const mayReassess=action==='approve'&&realm!==''&&Number(realm)!==track.realmId&&track.nexusReviewStatus==='in-review';
  return <div key={label}><button disabled={busy||(!check.allowed&&!mayReassess)||(action==='needs-changes'&&!notes.trim())} onClick={()=>submit(action,selected)}>{label}</button>{!check.allowed&&<small>{check.reasons.join(' ')}</small>}</div>;
 }
 return <article className="studio-candidate"><div className="studio-identity">{project?.world.coverArtUrl?<img src={project.world.coverArtUrl} alt="" width={64} height={64} loading="lazy"/>:<span className="studio-art" aria-hidden="true">♫</span>}<div><h3>{track.title}</h3><p>{world.title} · {signal.creativeProfile?.artistName||signal.creativeProfile?.displayName||project?.creatorName||'Creator identity unavailable'}</p></div></div>
  <div className="studio-tags"><span>{track.realmId==null?'Unassigned':REALM_THEMES[track.realmId as RealmKey]?.name??'Unknown Realm'}</span><span>{track.visibility}</span><span>{track.nexusReviewStatus??'Not submitted'}</span><span>{track.showInNexus?'Nexus publication flag on':'Not Nexus-published'}</span></div>
  <div className="studio-tags">{placementLabels(track,world,config).map(label=><span key={label}>{label}</span>)}</div>
  <details onToggle={e=>setOpen(e.currentTarget.open)}><summary>Review & manage {track.title}</summary>
   <p>{track.playbackStatus} · {track.accessTier} access. Editor access is not proof of anonymous playback.</p>
   <p>Creator Canon: {world.publicCanon===true?'Yes':world.publicCanon===false?'No':'Legacy / unspecified'}. Parent: {world.visibility} / {world.status}.</p>
   <h4>Effective public eligibility</h4><p>Soundtrack: {assessments.find(a=>a.id===track.id&&a.kind==='track')?.publicSoundtrack == null ? 'unknown' : assessments.find(a=>a.id===track.id&&a.kind==='track')?.publicSoundtrack ? 'eligible now' : 'not currently delivered by the soundtrack filter'}. Nexus: {assessments.find(a=>a.id===track.id&&a.kind==='track')?.publicNexus == null ? 'unknown' : assessments.find(a=>a.id===track.id&&a.kind==='track')?.publicNexus ? 'eligible now' : 'not currently delivered by the Nexus filter'}.</p><h4>Known prerequisites</h4><ul>{Array.from(new Set((assessments.find(a=>a.kind==='track'&&a.id===track.id)?.actions??[]).filter(a=>!a.allowed&&a.name!=='withdraw').flatMap(a=>a.reasons))).map(reason=><li key={reason}>{reason}</li>)}</ul>{!assessments.some(a=>a.kind==='track'&&a.id===track.id)&&<p>Eligibility needs verification.</p>}
   {track.nexusReviewStatus==='in-review'&&<label>Realm for approval<select value={realm} onChange={e=>setRealm(e.target.value)}><option value="">Choose a Realm</option>{STUDIO_REALMS.map(id=><option key={id} value={id}>{REALM_THEMES[id].name}</option>)}</select></label>}
   <label>Review / withdrawal note<textarea value={notes} onChange={e=>setNotes(e.target.value)} maxLength={4000}/></label>
   <div className="studio-actions">{track.nexusReviewStatus==='in-review'&&<>{control('approve','Prepare approval')}{control('needs-changes','Request changes')}</>}{track.showInNexus?control('unpublish','Withdraw Nexus publication'):control('publish','Publish to Nexus')}{control('soundtrack',soundtrack?'Withdraw official soundtrack':'Select official soundtrack',!soundtrack)}{control('anchor','Set Realm anchor')}{control('spotlight','Set Nexus Spotlight')}</div>
   <p className="studio-caption">Approval never publishes. There is no separate rejection state; request changes returns the submission with your note.</p>
   <h4>Review record</h4><p>Submitted: {track.nexusSubmittedAt||'—'} · Reviewed: {track.nexusReviewedAt||'—'}</p><p>Published: {track.nexusPublishedAt||'—'} · Withdrawn: {track.nexusUnpublishedAt||'—'}</p><p>{track.nexusReviewNotes||'No saved review note.'}</p>
   <h4>Creator-published evidence</h4>{evidence.loading?<p role="status">Loading evidence…</p>:evidence.error?<p role="alert">Evidence unavailable for this source.</p>:evidence.data?.nexusReviewEvidence.length?evidence.data.nexusReviewEvidence.map(e=><article key={e.id}><strong>{e.title}</strong><p>{e.body}</p><small>{e.meta}</small></article>):<p>No authorized published evidence returned.</p>}
   <Link href={publicWorldHref(world.slug,world.id)} target="_blank" rel="noreferrer">Open public World ↗</Link><p className="studio-caption">Public pages may process scheduled releases. Use a signed-out window to inspect visitor playback.</p>
  </details>
 </article>;
}
