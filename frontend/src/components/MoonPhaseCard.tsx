'use client';
import { useEffect, useState } from 'react';
import { getMoonPhaseForDate } from '@/lib/moonPhases';
import '@/styles/moonPhaseCard.css';

export default function MoonPhaseCard() {
  const [now,setNow]=useState<Date|null>(null);
  useEffect(()=>{const update=()=>setNow(new Date());update();const timer=window.setInterval(update,60000);return()=>window.clearInterval(timer);},[]);
  const moon=now?getMoonPhaseForDate(now):null;
  return <section className="moon-phase-card" aria-label="Calculated lunar phase">
    <div className="moon-phase-header"><div><p className="moon-phase-eyebrow">Calculated lunar estimate</p><h2>{moon?.phase||'Today’s Moon'}</h2></div><span className="moon-icon" aria-hidden="true">{moon?.icon||'☾'}</span></div>
    <p>{moon?`Approximately ${Math.round(moon.illumination*100)}% illuminated`:'Loading the current cycle…'}</p>
    <p className="moon-phase-guidance">A calendar anchor for reflection, not a prediction of mood or health.</p>
    <div className="moon-phase-meta"><span>Local date</span><strong>{now?.toLocaleDateString()||'Today'}</strong></div>
  </section>;
}
