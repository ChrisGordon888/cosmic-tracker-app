'use client';
import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import Link from 'next/link';
import OfferPresentation from '@/components/commerce/OfferPresentation';
import type {CommerceOffer} from '@/lib/commerce';
import '@/styles/commerce.css';
export default function OfferPage(){const slug=useParams<{slug:string}>()?.slug||'',[offer,setOffer]=useState<CommerceOffer|null>(null),[error,setError]=useState('');useEffect(()=>{const controller=new AbortController();setOffer(null);setError('');fetch('/api/commerce/public/'+encodeURIComponent(slug),{signal:controller.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setOffer(d);}).catch(e=>{if(!controller.signal.aborted)setError(e.message);});return()=>controller.abort();},[slug]);return <main className="commerce-shell"><Link href="/shop">← Shop</Link>{error?<p role="alert">{error}</p>:offer?<OfferPresentation offer={offer}/>:<p role="status">Loading offering…</p>}</main>;}
