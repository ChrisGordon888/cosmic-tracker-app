'use client';
import {Suspense,useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import OfferPresentation from '@/components/commerce/OfferPresentation';
import type {CommerceOffer} from '@/lib/commerce';
import '@/styles/commerce.css';
function Preview(){const id=useSearchParams()?.get('id'),[offer,setOffer]=useState<CommerceOffer|null>(null),[error,setError]=useState('');useEffect(()=>{if(!id)return;const controller=new AbortController();fetch('/api/commerce/preview/'+encodeURIComponent(id),{signal:controller.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setOffer(d);}).catch(e=>{if(!controller.signal.aborted)setError(e.message);});return()=>controller.abort();},[id]);return <main className="commerce-shell"><Link href="/creator/marketplace">← Marketplace</Link><p>Private operator preview · no analytics recorded</p>{error?<p role="alert">{error}</p>:offer?<OfferPresentation offer={offer} preview/>:<p>Loading your private preview…</p>}</main>;}
export default function PreviewPage(){return <Suspense fallback={<p>Loading preview…</p>}><Preview/></Suspense>;}
