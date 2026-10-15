"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CREATOR_LINKS } from '@/lib/creatorNavigation';

const links = [
  { label: 'Home', href: CREATOR_LINKS.home, mark: '⌂' },
  { label: 'Library', href: CREATOR_LINKS.catalog, mark: '♫' },
  { label: 'Projects', href: CREATOR_LINKS.projects, mark: '▤' },
  { label: 'Profile', href: CREATOR_LINKS.profile, mark: '○' },
];

export default function CreatorRail() {
  const pathname = usePathname();
  return <nav className="creator-navigation" aria-label="Creator navigation">
    {links.map(({ label, href, mark }) => {
      const route = href.split('#')[0];
      const current = route === '/creator' ? pathname === route : pathname === route || pathname?.startsWith(`${route}/`);
      return <Link key={href} href={href} title={`Creator ${label}`} aria-current={current ? 'page' : undefined}>
        <span aria-hidden="true">{mark}</span>{label}
      </Link>;
    })}
  </nav>;
}
