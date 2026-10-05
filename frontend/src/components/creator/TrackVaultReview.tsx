'use client';
import {useEffect,useRef,useState} from 'react';
import {emptyRights,sourceLabels,reviewLabels,type VaultTrack,type RightsInfo} from '@/lib/trackVault';
export default function TrackVaultReview({track,position,total,onSave,onNext,onClose}:{track:VaultTrack;position:number;total:number;onSave:(input:{catalogTreatment:string;rightsInfo:RightsInfo;archive:boolean})=>Promise<void>;onNext:()=>void;onClose:()=>void}) {
 const ref=useRef<HTMLDialogElement>(null);
 const [treatment,setTreatment]=useState(track.catalogTreatment||'current');
 const [rights,setRights]=useState<RightsInfo>({...emptyRights,...track.rightsInfo});
 const [archive,setArchive]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{const node=ref.current;node?.showModal();return()=>node?.close();},[]);
 const change=<K extends keyof RightsInfo>(key:K,value:RightsInfo[K])=>setRights(r=>({...r,[key]:value}));
 async function save(){
  if((treatment!=='current'||archive)&&!window.confirm('Save this private catalog choice? COSMIC will hide this track from public playback and Nexus, and reset Nexus review. Files and project association remain. Existing copied file URLs cannot be revoked.'))return;
  setBusy(true);setError('');try{await onSave({catalogTreatment:treatment,rightsInfo:rights,archive});onNext();}catch(e){setError(e instanceof Error?e.message:'Could not save.');}finally{setBusy(false);}
 }
 return <dialog ref={ref} className="library-cleanup vault-review" aria-labelledby="vault-title" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}>
 <header><p>Catalog review · {position} of {total}</p><h2 id="vault-title">{track.title}</h2><p>{track.visibility} · {track.status} · {track.releaseWorldId?'Project-associated':'Standalone'} · Realm {track.realmId??'undecided'}</p></header>
 <fieldset className="cleanup-fields" disabled={busy}>
 <label>Catalog treatment<select value={treatment} onChange={e=>setTreatment(e.target.value as typeof treatment)}><option value="current">Current</option><option value="vault">Private Vault</option><option value="test">Test / Sandbox</option></select></label>
 <label><input type="checkbox" checked={archive} onChange={e=>setArchive(e.target.checked)}/>Archive recording (preserves files; uses existing lifecycle)</label>
 <p>Returning to Current never restores public visibility or Nexus inclusion automatically.</p>
 <details><summary>Rights / source · {reviewLabels[rights.reviewStatus]}</summary>
 <p>Creator-supplied information only. Recording a license or ownership claim does not verify permissions or authorize commercial use.</p>
 <label>Source / license<select value={rights.sourceType} onChange={e=>change('sourceType',e.target.value as RightsInfo['sourceType'])}>{Object.entries(sourceLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
 <label>Information status<select value={rights.reviewStatus} onChange={e=>change('reviewStatus',e.target.value as RightsInfo['reviewStatus'])}>{Object.entries(reviewLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
 <label>Producer / instrumental creator<input maxLength={200} value={rights.producerName||''} onChange={e=>change('producerName',e.target.value)}/></label>
 <label>Public source page (not a confidential document)<input type="url" maxLength={1000} value={rights.sourceUrl||''} onChange={e=>change('sourceUrl',e.target.value)}/></label>
 <label>Intended for commercial distribution?<select value={rights.commercialIntent==null?'unknown':String(rights.commercialIntent)} onChange={e=>change('commercialIntent',e.target.value==='unknown'?null:e.target.value==='true')}><option value="unknown">Not recorded</option><option value="true">Yes</option><option value="false">No</option></select></label>
 <label><input type="checkbox" checked={rights.documentationRecorded} onChange={e=>change('documentationRecorded',e.target.checked)}/>I have documentation stored elsewhere</label>
 <label>Private notes: license/date, master ownership, writer splits, unresolved questions<textarea maxLength={4000} rows={5} value={rights.notes||''} onChange={e=>change('notes',e.target.value)}/></label>
 <p>No confidential document uploads. Current media storage has public file URLs. Keep contracts and license proof in your own secure storage.</p>
 </details></fieldset>
 {error&&<p role="alert">{error}</p>}
 <footer><button disabled={busy} onClick={()=>void save()}>{busy?'Saving…':'Save & next'}</button><button disabled={busy} onClick={onNext}>Keep current / skip without saving</button><button disabled={busy} onClick={onClose}>Close</button></footer>
 </dialog>;
}
