'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import MediaPresentation from '@/components/media/MediaPresentation';
import type {CreativeMedia} from '@/lib/creativeMedia';
import '@/styles/commerce.css';
export default function Media(){
 const [items,setItems]=useState<CreativeMedia[]|null>(null),[error,setError]=useState(''),[topic,setTopic]=useState('');
 async function load(){setError('');try{const r=await fetch('/api/commerce/media/public');const d=await r.json();if(!r.ok)throw Error(d.error);setItems(d.items);}catch{setError('The media collection could not be loaded. Please retry.');}}
 useEffect(()=>{void load();},[]);
 return <main className="commerce-shell"><p className="commerce-kicker">COSMIC Media</p><h1>Inside the work.</h1><p>Production sessions, stories and creative discoveries. Follow the process into the music.</p><nav><Link href="/shop">Explore creative resources →</Link><Link href="/services">Work with Christopher →</Link></nav>{error?<p role="alert">{error} <button onClick={()=>void load()}>Retry</button></p>:!items?<p role="status">Loading media…</p>:!items.length?<p>Nothing published yet. New work appears here when it is ready to share.</p>:<><label>Explore by topic<select value={topic} onChange={e=>setTopic(e.target.value)}><option value="">All creative work</option>{[...new Set(items.map(i=>i.topic).filter(Boolean))].map(t=><option key={t}>{t}</option>)}</select></label>{items.filter(i=>!topic||i.topic===topic).map(item=><MediaPresentation key={item.slug} item={item}/>)}</>}</main>;
}
