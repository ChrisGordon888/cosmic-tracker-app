'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import '@/styles/practicePage.css';
import '@/styles/practiceFamily.css';

export default function PracticeShell({children,className=''}:{children:ReactNode;className?:string}) {
  const path=usePathname();
  return <main className={`practice-page practice-chamber practice-family ${className}`}>
    <div className="practice-environment" aria-hidden="true"><span className="practice-chamber-moon"/><span className="practice-chamber-shelf"/></div>
    <nav className="practice-room-nav" aria-label="Practice rooms">
      {[['/practice','Foyer'],['/tracker','Today'],['/rituals','Rituals'],['/calendar','Cycles / History'],['/practice#reflection','Reflection']].map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}
    </nav>
    {children}
  </main>;
}
