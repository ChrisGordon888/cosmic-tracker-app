import Link from 'next/link';
import { PUBLIC_REALM_IDS } from '@/lib/publicRealmNavigation';
import { REALM_NAMES } from '@/lib/musicRegistry';
export default function PublicRealmNavigation({realmId}:{realmId:number}) {
  return <nav aria-label="Explore all Realms" className="flex flex-wrap gap-2 my-4">
    {PUBLIC_REALM_IDS.map(id=><Link key={id} href={`/realms/${id}`} aria-current={id===realmId?'page':undefined} className="rounded-full border border-white/25 px-3 py-2 text-sm text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{REALM_NAMES[id]}</Link>)}
  </nav>;
}
