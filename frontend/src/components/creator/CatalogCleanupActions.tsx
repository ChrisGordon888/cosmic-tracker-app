'use client';
import { useState } from 'react';
import { catalogCleanupAction } from '@/lib/catalogCleanupActions';
export default function CatalogCleanupActions({treatment,status,onSave}:{treatment?:string|null;status:string;onSave:(input:{catalogTreatment?:string;archive?:boolean})=>Promise<void>}) {
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function run(action:'test'|'archive'){
  const change=catalogCleanupAction(action);
  if(!window.confirm(change.confirmation))return;
  setBusy(true);setMessage('');try{await onSave(change.input);setMessage(change.success);}catch(e){setMessage(e instanceof Error?e.message:'Could not update track.');}finally{setBusy(false);}
 }
 return <details><summary>Catalog actions</summary><button type="button" disabled={busy||treatment==='test'} onClick={()=>void run('test')}>Move to Test / Sandbox</button><button type="button" disabled={busy||status==='archived'} onClick={()=>void run('archive')}>Archive track</button><p role="status">{message}</p></details>;
}
