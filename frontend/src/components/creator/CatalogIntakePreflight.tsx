'use client';
import { useEffect, useMemo, useState } from 'react';
import { compareIntake, contentHash, excludedIncoming, fileIdentity, intakeSignature, type IntakeApproval, type IntakeDecision, type IntakeIdentity } from '@/lib/catalogIntake';
import { parseFilename } from '@/lib/libraryCleanup';
export default function CatalogIntakePreflight({files,catalog,disabled,onChange}: {files:File[];catalog:IntakeIdentity[];disabled:boolean;onChange:(approval:IntakeApproval)=>void}) {
 const signature=intakeSignature(files);
 const [scan,setScan]=useState<{signature:string;hashes:Record<string,string>;urls:Record<string,string>;unhashed:number}|null>(null);
 const [decisions,setDecisions]=useState<Record<string,IntakeDecision>>({});
 useEffect(()=>{
  let active=true;const urls:Record<string,string>={};setScan(null);setDecisions({});
  void (async()=>{
   const hashes:Record<string,string>={};let unhashed=0;
   for(const file of files){const id=fileIdentity(file);urls[id]=URL.createObjectURL(file);
    try {if(file.size>100*1024*1024)throw new Error('Large file');hashes[id]=await contentHash(await file.arrayBuffer());}catch{unhashed++;}
    if(!active){Object.values(urls).forEach(URL.revokeObjectURL);return;}
   }
   if(active)setScan({signature,hashes,urls,unhashed});
  })();
  return()=>{active=false;Object.values(urls).forEach(URL.revokeObjectURL);};
 },[files,signature]);
 const incoming=useMemo(()=>files.map(file=>({id:fileIdentity(file),title:file.name,fileName:file.name,audioContentHash:scan?.hashes[fileIdentity(file)],audioUrl:scan?.urls[fileIdentity(file)]})),[files,scan]);
 const pairs=useMemo(()=>incoming.flatMap((a,index)=>[...incoming.slice(index+1),...catalog].flatMap(b=>{const kind=compareIntake(a,b);return kind?[{id:JSON.stringify([a.id,b.id,a.audioContentHash,b.audioContentHash,kind]),a,b,kind}]:[];})),[incoming,catalog]);
 const excluded=useMemo(()=>excludedIncoming(pairs,decisions,new Set(incoming.map(i=>i.id))),[pairs,decisions,incoming]);
 const ready=scan?.signature===signature && pairs.every(pair=>Boolean(decisions[pair.id]));
 useEffect(()=>{onChange({signature,hashes:scan?.hashes??{},excluded,ready});},[signature,scan,excluded,ready,onChange]);
 if(!scan)return <p role="status">Checking selected files locally…</p>;
 return <section className="cleanup-suggestion" aria-label="Intake preflight"><h3>Intake preflight</h3>
 <p>{files.length-excluded.length} selected to upload · {pairs.filter(p=>p.kind==='exact').length} exact-content matches · {pairs.filter(p=>p.kind==='possible').length} possible versions · {files.filter(f=>parseFilename(f.name)).length} metadata suggestions</p>
 <p>Exact means matching client-calculated SHA-256 bytes, not an audio comparison. Older records without hashes cannot be verified as exact. Existing catalog records are never deleted or replaced here.</p>
 {scan.unhashed>0&&<p>{scan.unhashed} files could not be hashed (including files over 100 MB). Filename-only checks apply.</p>}
 {pairs.map(pair=><fieldset key={pair.id} disabled={disabled}><legend>{pair.kind==='exact'?'Exact content match':'Possible duplicate / version'}</legend>
 {[pair.a,pair.b].map((item,index)=><div key={item.id}><strong>{index===0?'A':'B'}: {item.title}</strong>{item.audioUrl&&<audio controls preload="none" src={item.audioUrl} aria-label={`Listen to ${item.title}`}/>}</div>)}
 <p>Keep A/B excludes the other file only if it is in this upload queue. Existing catalog music remains untouched.</p>
 {(['keep-a','keep-b','both'] as const).map((value,index)=><button type="button" key={value} aria-pressed={decisions[pair.id]===value} onClick={()=>setDecisions(d=>({...d,[pair.id]:value}))}>{['Keep A','Keep B','Keep both'][index]}</button>)}
 </fieldset>)}
 {!ready&&<p>Review each match before uploading.</p>}
 </section>;
}
