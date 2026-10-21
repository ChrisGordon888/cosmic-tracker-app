'use client';
import {useState} from 'react';
import type {Workbench} from '@/lib/intelligenceWorkbench';
export type CreatorPath={id:string;a:string;b:string;note:string};
export type PathSave=(input:{a:string;b:string;note:string})=>Promise<void>;
export default function CreatorPaths({analysis,selectedId,paths,onSave,onRemove,onTry,onListen}:{analysis:Workbench;selectedId:string;paths:CreatorPath[];onSave?:PathSave;onRemove?:(id:string)=>Promise<void>;onTry:(ids:string[])=>void;onListen:(ids:string[])=>void}){
 const [other,setOther]=useState(''),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const allowed=new Set(analysis.songs.map(s=>s.trackId));
 const relevant=paths.filter(p=>allowed.has(p.a)&&allowed.has(p.b)&&(p.a===selectedId||p.b===selectedId));
 const title=(id:string)=>analysis.songs.find(s=>s.trackId===id)?.sourceFacts.title??'Unavailable song';
 const existing=relevant.find(p=>p.a===other||p.b===other);
 async function save(){if(!onSave||!other)return;setBusy(true);setMessage('');try{await onSave({a:selectedId,b:other,note});setMessage('Path saved privately.');setOther('');setNote('');}catch{setMessage('Path could not be saved. Both songs must still belong to your current catalog.');}finally{setBusy(false);}}
 return <section className="creator-paths"><h3>Your Paths</h3><p>These songs belong together because you say so. A Path records intention, not acoustic similarity.</p><fieldset disabled={busy}><label>Connect {title(selectedId)} to<select value={other} onChange={e=>{setOther(e.target.value);const p=relevant.find(p=>p.a===e.target.value||p.b===e.target.value);setNote(p?.note??'');}}><option value="">Choose another song…</option>{analysis.songs.filter(s=>s.trackId!==selectedId).map(s=><option key={s.trackId} value={s.trackId}>{s.sourceFacts.title}</option>)}</select></label><label>Why they belong together (optional)<textarea maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} /></label><button disabled={!other||!onSave} onClick={()=>void save()}>{existing?'Update Path':'Save Path'}</button></fieldset>
 {relevant.map(p=><article key={p.id}><strong>{title(p.a)} ↔ {title(p.b)}</strong>{p.note&&<p>{p.note}</p>}<div className="universe-actions"><button onClick={()=>onListen([selectedId,p.a===selectedId?p.b:p.a])}>Hear Path</button><button onClick={()=>onTry([selectedId,p.a===selectedId?p.b:p.a])}>Try these together</button><button disabled={busy} onClick={()=>{setOther(p.a===selectedId?p.b:p.a);setNote(p.note);}}>Edit</button>{onRemove&&<button disabled={busy} onClick={async()=>{setBusy(true);try{await onRemove(p.id);setMessage('Path removed. Songs are unchanged.');}catch{setMessage('Path could not be removed.');}finally{setBusy(false);}}}>Remove Path</button>}</div></article>)}{!relevant.length&&<p>No authored Paths for this song yet.</p>}<p role="status">{message}</p></section>;
}
