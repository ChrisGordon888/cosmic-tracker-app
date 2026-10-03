'use client';
import { useEffect, useRef, useState } from 'react';
import { catalogProjectLabel, catalogRealms, type CatalogTrack } from '@/lib/catalogSorting';
import { needsReviewWarning } from '@/lib/libraryCleanup';
import CatalogPlacementSuggestion from './CatalogPlacementSuggestion';
export default function SmartSortPanel({track,catalog,releases,position,total,onSave,onNext,onClose}: {track:CatalogTrack;releases:ReadonlyMap<string, unknown>;catalog:CatalogTrack[];position:number;total:number;onSave:(realmId:number)=>Promise<void>;onNext:()=>void;onClose:()=>void}) {
 const ref=useRef<HTMLDialogElement>(null);const [choice,setChoice]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>dialog?.close();},[]);
 async function accept(id:number){
  if(id===track.realmId){onNext();return;}
  if(needsReviewWarning(track,{realmId:id})&&!window.confirm('Changing this Realm may withdraw Nexus approval and require another review. Save?'))return;
  setBusy(true);setError('');try{await onSave(id);onNext();}catch(e){setError(e instanceof Error?e.message:'Could not save.');}finally{setBusy(false);}
 }
 return <dialog ref={ref} className="library-cleanup" aria-labelledby="smart-sort-title" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}>
 <p>{position} / {total} · {catalogProjectLabel(track,releases)}</p><h2 id="smart-sort-title">Smart Sort — {track.title}</h2>
 <CatalogPlacementSuggestion track={track} catalog={catalog} disabled={busy} onChoose={id=>void accept(id)}/>
 <label>Choose another Realm<select disabled={busy} value={choice} onChange={e=>setChoice(e.target.value)}><option value="">Choose a Realm…</option>{catalogRealms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
 <button disabled={busy||choice===''} onClick={()=>void accept(Number(choice))}>Accept chosen Realm</button><button disabled={busy} onClick={onNext}>Skip</button><button disabled={busy} onClick={onClose}>Close</button>
 {error&&<p role="alert">{error}</p>}<p>Only an accepted Realm is saved. Nothing is published.</p>
 </dialog>;
}
