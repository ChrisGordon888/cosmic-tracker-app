'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useRef,useState} from 'react';
import {visibleCreatorSections,creatorRouteActive} from '@/lib/creatorNavigation';
import {useCommercialAccess} from './CommercialAccess';
export default function CreatorRail(){
 const pathname=usePathname(),{allowed}=useCommercialAccess();const [open,setOpen]=useState(false);const trigger=useRef<HTMLButtonElement>(null);
 const sections=visibleCreatorSections(allowed);const current=sections.flatMap(s=>s.items).find(i=>creatorRouteActive(pathname,i.href));
 return <aside className="creator-navigation" onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus();}}}><button ref={trigger} className="creator-navigation-toggle" aria-expanded={open} aria-controls="creator-destinations" onClick={()=>setOpen(!open)}>Workspace · {current?.label||'Creator'} <span aria-hidden="true">{open?'−':'+'}</span></button><nav id="creator-destinations" className={open?'is-open':''} aria-label="Creator navigation">{sections.map(section=><section key={section.label}><h2>{section.label}</h2>{section.items.map(item=><Link key={item.href} href={item.href} aria-current={creatorRouteActive(pathname,item.href)?'page':undefined} onClick={()=>setOpen(false)}><span aria-hidden="true">{item.mark}</span>{item.label}</Link>)}</section>)}<section><h2>Public COSMIC</h2><Link href="/nexus" onClick={()=>setOpen(false)}>← Explore music</Link><Link href="/shop" onClick={()=>setOpen(false)}>Shop ↗</Link><Link href="/media" onClick={()=>setOpen(false)}>Media ↗</Link></section></nav></aside>;
}
