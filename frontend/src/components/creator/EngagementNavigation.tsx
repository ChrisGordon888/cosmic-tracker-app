'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
export default function EngagementNavigation() {
  const [attention,setAttention] = useState<number|null>(null);
  useEffect(()=>{const controller=new AbortController();fetch('/api/engagements/summary',{signal:controller.signal,cache:'no-store'}).then(async r=>{if(r.ok){const d=await r.json();if(Number.isSafeInteger(d.attention))setAttention(d.attention);}}).catch(()=>{});return()=>controller.abort();},[]);
  return <nav aria-label="Commercial operations"><Link href="/creator/engagements">Engagements →{attention!==null&&<span> · {attention} action required</span>}</Link></nav>;
}
