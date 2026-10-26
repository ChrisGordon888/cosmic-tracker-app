'use client';
import {useState} from 'react';
import {print} from 'graphql';
import Link from 'next/link';
import {STUDIO_DELIVERY} from '@/graphql/editorialStudio';
import type {Delivery} from '@/lib/editorialStudio';
export default function EditorialPublicCheck({realmId}:{realmId?:number}){
 const [result,setResult]=useState<Delivery|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function verify(){setBusy(true);setError('');setResult(null);try{
  const response=await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL||'http://localhost:4000/graphql',{method:'POST',credentials:'omit',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:print(STUDIO_DELIVERY),variables:{realmId}}),signal:AbortSignal.timeout(15000)});
  const body=await response.json();if(!response.ok||body.errors?.length||!body.data?.publicEditorialDelivery)throw Error('Anonymous delivery check failed. No public-visibility conclusion is available.');
  setResult(body.data.publicEditorialDelivery);
 }catch(e){setError(e instanceof Error?e.message:'Verification failed.');}finally{setBusy(false);}}
 return <section className="studio-panel"><h2>Public-view verification</h2><p>Stored placement → server eligibility → anonymous metadata delivery. This dedicated check uses the same public filters without processing scheduled releases. It does not test audio bytes or page rendering.</p><button disabled={busy} onClick={()=>void verify()}>{busy?'Checking without credentials…':'Verify anonymous delivery now'}</button>{error&&<p role="alert">{error}</p>}{result&&<div role="status"><p>Confirmed anonymous metadata delivery at {result.checkedAt}</p><p>{result.soundtrackIds.length} soundtrack tracks · {result.samplerIds.length} sampler tracks · {result.nexusIds.length} Nexus Signals · {result.discoveryIds.length} Discovery Worlds · {result.worldIds.length} Nexus Worlds</p><details><summary>Exact delivered references</summary><pre>{JSON.stringify(result,null,2)}</pre></details></div>}<div className="studio-links"><Link href="/nexus" target="_blank" rel="noreferrer">Open Nexus ↗</Link>{realmId!=null&&<Link href={`/realms/${realmId}`} target="_blank" rel="noreferrer">Open Realm ↗</Link>}</div><p className="studio-caption">Normal public pages can process due scheduled releases and may retain your login. Use a signed-out window to check visitor playback. Rerun this check after any editorial changes.</p></section>;
}
