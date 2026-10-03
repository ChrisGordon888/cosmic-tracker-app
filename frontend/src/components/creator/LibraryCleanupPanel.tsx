'use client';
import { useEffect, useRef, useState } from 'react';
import { cleanupChanges, needsReviewWarning, parseFilename, realmIds, workingCoverStyles, type CleanupTrack, type WorkingCoverStyle } from '@/lib/libraryCleanup';
import WorkingCover from './WorkingCover';
import CatalogPlacementSuggestion from './CatalogPlacementSuggestion';
import type { CatalogTrack } from '@/lib/catalogSorting';
export default function LibraryCleanupPanel({track, catalog, position, total, location, releaseArtwork, onSave, onNext, onClose}: {track: CleanupTrack; catalog:CatalogTrack[]; position:number; total:number; location:string; releaseArtwork?:string|null; onSave:(changes:Record<string,string|number|null>)=>Promise<void>; onNext:()=>void; onClose:()=>void}) {
 const [draft,setDraft]=useState({...track}); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [suggestion,setSuggestion]=useState(parseFilename(track.title)); const ref=useRef<HTMLDialogElement>(null); const titleRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{const el=ref.current; el?.showModal(); return ()=>el?.close();},[]);
 const [showPlacement,setShowPlacement]=useState(false);
 const changes=cleanupChanges(track,draft);
 const change=(key:string,value:unknown)=>setDraft(d=>({...d,[key]:value}));
 async function save(){
  if(!draft.title.trim()) {setError('A title is required.');return;}
  if(draft.bpm != null && (!Number.isInteger(draft.bpm)||draft.bpm<20||draft.bpm>300)){setError('Use a whole BPM between 20 and 300, or leave it blank.');return;}
  if(needsReviewWarning(track,changes)&&!window.confirm('These changes can withdraw this track from Nexus and require a new review. Save these changes?'))return;
  setBusy(true);setError('');try{await onSave(changes);onNext();}catch(e){setError(e instanceof Error?e.message:'Could not save.');}finally{setBusy(false);}
 }
 return <dialog ref={ref} className="library-cleanup" onCancel={e=>{e.preventDefault();if(!busy)onClose();}} aria-labelledby="cleanup-title">
 <header><p>{position} / {total} · {location}</p><h2 id="cleanup-title">Clean up Library</h2><strong>{track.title}</strong></header>
 <div className="cleanup-preview"><WorkingCover track={draft} releaseArtwork={releaseArtwork}/></div>
 {suggestion&&<section className="cleanup-suggestion"><strong>COSMIC noticed</strong><p>Title: {suggestion.title} · Key: {suggestion.keySignature} · BPM: {suggestion.bpm}</p><p>Suggestions from the current title. Accept replaces these draft fields; Save confirms them.</p><button disabled={busy} onClick={()=>{setDraft(d=>({...d,...suggestion}));setSuggestion(null);}}>Accept</button><button disabled={busy} onClick={()=>{setSuggestion(null);titleRef.current?.focus();}}>Edit</button><button disabled={busy} onClick={()=>setSuggestion(null)}>Skip suggestion</button></section>}
 <button type="button" disabled={busy} onClick={()=>setShowPlacement(value=>!value)}>{showPlacement?'Hide suggestion':'Suggest placement'}</button>
 {showPlacement&&<><CatalogPlacementSuggestion track={draft} catalog={catalog} disabled={busy} onChoose={id=>{change('realmId',id);setShowPlacement(false);}}/><p>Use a suggestion to fill the Realm field. Save &amp; next confirms your choice, or choose another Realm below.</p><button disabled={busy} onClick={()=>setShowPlacement(false)}>Skip placement suggestion</button></>}
 <fieldset disabled={busy} className="cleanup-fields"><label>Title<input ref={titleRef} value={draft.title} onChange={e=>change('title',e.target.value)}/></label><label>BPM (optional)<input type="number" min="20" max="300" value={draft.bpm??''} onChange={e=>change('bpm',e.target.value===''?null:Number(e.target.value))}/></label><label>Key (optional)<input value={draft.keySignature??''} onChange={e=>change('keySignature',e.target.value)}/></label>
 <label>Realm<select value={draft.realmId??''} onChange={e=>change('realmId',e.target.value===''?null:Number(e.target.value))}><option value="">Realm undecided</option>{realmIds.map((id,i)=><option key={id} value={id}>{id} — {['Fractured Frontier','The Veil','Moonlit Roads','Skybound City','Astral Bazaar','InterSiddhi'][i]}</option>)}</select></label>
 <label>Lifecycle<select value={draft.status} onChange={e=>change('status',e.target.value)}>{['idea','writing','demo','recording','mixing','mastered','released','archived'].map(s=><option key={s}>{s}</option>)}</select></label>
 <label>Visibility<select value={draft.visibility} onChange={e=>change('visibility',e.target.value)}>{['private','listed','public'].map(s=><option key={s}>{s}</option>)}</select></label>
 <label>Working cover<select value={draft.workingCoverStyle??'minimal'} onChange={e=>change('workingCoverStyle',e.target.value as WorkingCoverStyle)}>{workingCoverStyles.map(s=><option key={s}>{s}</option>)}</select></label></fieldset>
 <p>Real track and Release World artwork take precedence. Working covers do not satisfy publication artwork requirements.</p>
 {needsReviewWarning(track,changes)&&<p role="status">Changing Realm, lifecycle or visibility may withdraw existing Nexus approval and require review again.</p>}{error&&<p role="alert">{error}</p>}
 <footer><button disabled={busy} onClick={()=>void save()}>{busy?'Saving…':'Save & next'}</button><button disabled={busy} onClick={onNext}>Skip</button><button disabled={busy} onClick={onClose}>Close</button></footer></dialog>;
}
