'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import envelopes from '@/lib/demo/audioEnvelopes.json';
import { sampleEnvelope } from '@/lib/demo/audioEnvelope';
import '@/styles/lowTideScene.css';

type Place = 'shore' | 'room' | 'desk';
export default function LowTideScene({ currentTime, playingTrackId, isPlaying, motionPaused, focusedTrackId }: {
  currentTime: number; playingTrackId: string | null; isPlaying: boolean; motionPaused: boolean; focusedTrackId: string | null;
}) {
  const [place, setPlace] = useState<Place>('shore');
  const [quiet, setQuiet] = useState(true);
  const [hidden, setHidden] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const entered = useRef(false);
  const id = useId().replace(/:/g, '');
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setQuiet(preference.matches);
    const visibility = () => setHidden(document.hidden);
    update(); visibility();
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    return () => { preference.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => { if (entered.current) heading.current?.focus({ preventScroll: true }); }, [place]);
  const visit = (next: Place) => { entered.current = true; setPlace(next); };
  const playingKey = playingTrackId === 'demo-low-tide-threshold' ? 'threshold' : playingTrackId === 'demo-low-tide-return' ? 'return-path' : null;
  const moving = !quiet && !motionPaused && !hidden;
  const { energy, texture } = sampleEnvelope(playingKey ? envelopes[playingKey] : undefined, currentTime, moving && isPlaying);
  const later = focusedTrackId === 'demo-low-tide-return';
  const transform = place === 'shore' ? 'translate(0px, 0px) scale(1)' : place === 'room' ? 'translate(-235px, -140px) scale(2)' : 'translate(-520px, -500px) scale(3.3)';
  const style = { '--tide-energy': energy, '--tide-texture': texture } as CSSProperties;
  return <div className={`low-tide-scene ${moving ? 'can-move' : 'quiet'} ${later ? 'later-light' : ''}`} style={style} onKeyDown={event => {
    if (event.key === 'Escape' && place !== 'shore') { event.stopPropagation(); visit(place === 'desk' ? 'room' : 'shore'); }
  }}>
    <div className="tide-picture">
      <svg viewBox="0 0 640 560" role="img" aria-label={place === 'shore' ? 'A small lit room above the tide. Enter its window to explore.' : place === 'room' ? 'Inside the window: a desk, a curtain and the water beyond.' : 'On the desk, a penciled arrangement and two marks left by the light.'}>
        <defs>
          <linearGradient id={`${id}sky`} x2="0" y2="1"><stop stopColor={later ? '#667579' : '#344e59'} /><stop offset="1" stopColor="#a6afa0" /></linearGradient>
          <linearGradient id={`${id}water`} x2="0" y2="1"><stop stopColor="#44666b" /><stop offset="1" stopColor="#132f3c" /></linearGradient>
          <radialGradient id={`${id}light`}><stop stopColor="#ffe5a8" stopOpacity=".8" /><stop offset="1" stopColor="#ffd08b" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="640" height="560" fill={`url(#${id}sky)`} />
        <g className="tide-camera" style={{ transform }}>
          <path d="M0 250 Q140 220 270 248 T640 235 V560 H0Z" fill={`url(#${id}water)`} />
          <g className="tide-water" fill="none" stroke="#bad2c6" strokeWidth="1.5">
            {[0,1,2,3,4,5,6].map(row => <path key={row} d={`M-50 ${290 + row * 38} Q110 ${268 + row * 38} 260 ${291 + row * 38} T710 ${285 + row * 38}`} opacity={.4 - row * .04} />)}
          </g>
          <path d="M76 430 L185 250 480 262 604 463 570 560 64 560Z" fill="#303e3d" />
          <path d="M156 125 L360 75 502 136 496 344 153 347Z" fill="#656d5d" />
          <path d="M360 75 L502 136 496 344 358 310Z" fill="#414e47" />
          <path d="M135 132 L357 61 524 132 508 146 358 88 154 153Z" fill="#253b3d" />
          <rect x="220" y="151" width="156" height="160" fill="#293f40" stroke="#b9b59a" strokeWidth="9" />
          <rect x="230" y="162" width="136" height="139" fill={later ? '#959b84' : '#cab687'} />
          <path d="M230 162 H366 V220 L300 208 230 225Z" fill="#899883" />
          <ellipse className="tide-light" cx="300" cy="225" rx="123" ry="130" fill={`url(#${id}light)`} />
          <path className="tide-curtain" d="M230 161 Q265 202 240 255 L255 266 Q275 213 257 161Z" fill="#e0d9bb" opacity=".8" />
          <path d="M242 266 L345 262 357 276 241 281Z" fill="#614e38" />
          <path d="M250 279 V299 M346 276 V299" stroke="#614e38" strokeWidth="6" />
          <g className="tide-paper"><path d="M270 267 L306 266 311 275 274 277Z" fill="#f2dfb4" /><path d="M278 270 L298 270 M280 273 L295 273" stroke="#71664f" strokeWidth="1" /></g>
          <path d="M285 310 V315 M301 310 L302 316" stroke="#e7d8b0" strokeWidth="2" />
          <path d="M220 229 H376" stroke="#9a9b83" strokeWidth="6" />
          <path d="M298 151 V263" stroke="#9a9b83" strokeWidth="6" />
          <path className="tide-reflection" d="M260 350 L345 350 394 535 180 535Z" fill="#e5c887" opacity=".14" />
        </g>
      </svg>
      {place === 'shore' && <button className="tide-enter" onClick={() => visit('room')}>Enter the window ↗</button>}
      {place === 'room' && <button className="tide-enter" onClick={() => visit('desk')}>Look on the desk ↗</button>}
    </div>
    <div className="tide-discovery">
      <p className="world-eyebrow">Viewing · {later ? 'Return Path' : 'Threshold'} / {place === 'shore' ? 'Outside' : place === 'room' ? 'The room' : 'The arrangement'}</p>
      <h3 ref={heading} tabIndex={-1}>{place === 'shore' ? 'Someone left the light on.' : place === 'room' ? 'The silence has a room.' : 'Leave room after the hook.'}</h3>
      <p>{place === 'shore' ? 'The water moves. The room waits. Start the music, then come closer.' : place === 'room' ? later ? 'Same window, later light. The second song returns to the first song’s shapes without repeating its feeling.' : 'The curtain answers the high notes. The light gathers with the chords. On the desk: the choice that gave this song space.' : 'Protect: the unhurried melody. Deepen: the warm low notes. Cut: the urge to fill every gap. Next: let a vocal phrase answer the keys.'}</p>
      {place === 'desk' && <p className="tide-pencil">Fictional writing direction: “Leave the light where I can find it.” The sound study has no recorded vocal.</p>}
      {place !== 'shore' && <button onClick={() => visit(place === 'desk' ? 'room' : 'shore')}>← {place === 'desk' ? 'Back to the room' : 'Back to the shore'}</button>}
    </div>
  </div>;
}
