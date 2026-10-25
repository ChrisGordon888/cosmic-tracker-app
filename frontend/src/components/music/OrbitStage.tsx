'use client';
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { MusicTrack } from '@/context/MusicPlayerProvider';
import { chamberPositions, chamberConnection, spectralRibbon, centeredAngle, horizontalDrag } from '@/lib/orbitStageGeometry';
import { createRealmHeart } from '@/lib/realmHeartRenderer';
import './orbitStage.css';

export type ChamberMeasurement = { energy: number; high: number; bands?: number[] };
type Props = {
    tracks: MusicTrack[]; selectedId?: string; playingId?: string;
    realmName: string; realmIcon: string; color: string; reduced: boolean; visualsEnabled?: boolean;
    measurement: RefObject<ChamberMeasurement>;
    onChoose: (track: MusicTrack) => void;
    isTrackLocked: (track: MusicTrack) => boolean;
};
/** Rendering only. No provider, capture, data fetching, queue, or audio ownership. */
export default function OrbitStage({ tracks, selectedId, playingId, realmName, realmIcon, color, reduced, visualsEnabled = true, measurement, onChoose, isTrackLocked }: Props) {
    const visible = tracks.slice(0,8);
    const staticVisuals = reduced || !visualsEnabled;
    const root = useRef<HTMLDivElement>(null), core = useRef<HTMLCanvasElement>(null);
    const nodes = useRef<(HTMLButtonElement | null)[]>([]), paths = useRef<(SVGPathElement | null)[]>([]);
    const settling = useRef({ pointer:false, focus:false });
    const [motion, setMotion] = useState(true);
    const phase = useRef(0);
    const directed = useRef(false);
    const centerTarget = useRef<number | null>(null);
    const drag = useRef<{id:number;x:number;y:number;angle:number;active:boolean} | null>(null);
    const suppressClick = useRef(false);
    const held = useRef(0);
    const heldMoved = useRef(false);
    const heldSince = useRef(0);
    const stopInput = () => { held.current=0; drag.current=null; settling.current.pointer=false; settling.current.focus=false; };
    const rotate = (direction:number) => {
        directed.current=true; centerTarget.current=null;
        phase.current+=direction*Math.PI/6;
    };
    const ribbons = useRef<(SVGPathElement | null)[]>([]);
    // Read changing selection without restarting the animation or recreating GPU resources.
    const state = useRef({ ids: visible.map(t=>t.id), playingId, selectedId, measurement, reduced:staticVisuals, motion });
    useEffect(()=>{ state.current={ids:visible.map(t=>t.id),playingId,selectedId,measurement,reduced:staticVisuals,motion}; });
    useEffect(() => {
        const element=root.current, canvas=core.current;
        if (!element || !canvas) return;
        // Computed CSS resolves rgba/hex/current canonical Realm colors without a color dependency.
        const rgb=getComputedStyle(element).color.match(/[\d.]+/g)?.slice(0,3).map(Number) ?? [220,230,255];
        canvas.width=canvas.height=window.innerWidth<600?256:384;
        let renderer=createRealmHeart(canvas,rgb.map(c=>c/255) as [number,number,number]);
        renderer?.draw(0,0);
        element.dataset.renderer=renderer?'webgl':'css';
        let disposed=false, frame=0, last=0, clock=0, visibleOnScreen=true, drawnClock=-1, drawnEnergy=-1;
        const lost=(event:Event)=>{event.preventDefault(); renderer?.dispose();renderer=null;element.dataset.renderer='css';};
        const restored=()=>{if(disposed)return;renderer=createRealmHeart(canvas,rgb.map(c=>c/255) as [number,number,number]);renderer?.draw(clock,0);element.dataset.renderer=renderer?'webgl':'css';drawnClock=-1;};
        canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
        function draw(now:number) {
            if(disposed)return;
            frame=requestAnimationFrame(draw);
            if(now-last<33)return;
            const delta=Math.min((now-last)/1000,.05);last=now;
            const s=state.current;
            const moving=s.motion&&!s.reduced&&!settling.current.pointer&&!settling.current.focus;
            if(moving) clock+=delta;
            if(held.current && now-heldSince.current>250){phase.current+=held.current*delta*1.1;heldMoved.current=true;}
            else if(centerTarget.current!==null){
                const difference=centerTarget.current-phase.current;
                phase.current+=s.reduced?difference:difference*Math.min(1,delta*9);
                if(Math.abs(difference)<.001){phase.current=centerTarget.current;centerTarget.current=null;}
            } else if(moving&&!directed.current) phase.current+=delta*Math.PI*2/65;
            const energy=s.reduced?0:s.measurement.current.energy;
            const response = Math.min(1, energy + (s.reduced ? 0 : s.measurement.current.high * .15));
            if (clock !== drawnClock || response !== drawnEnergy) {
                renderer?.draw(clock,response); drawnClock=clock; drawnEnergy=response;
            }
            const positions=chamberPositions(s.ids.length,phase.current);
            positions.forEach((p,i)=>{
                const node=nodes.current[i],path=paths.current[i];
                if(node){node.style.left=`${p.x}%`;node.style.top=`${p.y}%`;node.style.zIndex=String(p.depth<.4?4:10+Math.round(p.depth*10));node.style.setProperty('--depth',String(p.scale));node.style.setProperty('--distance',String(.7+p.depth*.3));node.dataset.labelSide=p.y<35?'above':'below';}
                if(path){const active=s.ids[i]===s.playingId; const selected=s.ids[i]===s.selectedId; path.setAttribute('d',chamberConnection(p.x,p.y,active?energy:0,clock));path.style.opacity=String(active?.5+energy*.5:selected?.36:.16);path.style.strokeWidth=String(active?.18+energy*.4:.11);}
            });
            ribbons.current.forEach((ribbon,i)=>{
                if(!ribbon)return;
                const band=s.reduced?0:(s.measurement.current.bands?.[i]??0);
                ribbon.setAttribute('d',spectralRibbon(i,band,clock));
                ribbon.style.opacity=String(energy>0?.03+band*.16:0);
            });
            element?.style.setProperty('--chamber-energy',String(energy));
        }
        const sync=()=>{if(document.hidden)stopInput();cancelAnimationFrame(frame);last=performance.now();if(!disposed&&!document.hidden&&visibleOnScreen)frame=requestAnimationFrame(draw);};
        const observer=new IntersectionObserver(entries=>{visibleOnScreen=entries[0].isIntersecting;sync();});observer.observe(element);
        document.addEventListener('visibilitychange',sync);window.addEventListener('blur',stopInput);sync();
        return()=>{stopInput();window.removeEventListener('blur',stopInput);disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',sync);canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);renderer?.dispose();};
    },[color]);
    const positions=chamberPositions(visible.length,phase.current);
    return <div className="orbit-chamber" data-chamber-version="3.3" data-song-count={visible.length} ref={root} style={{color,'--chamber-color':color} as CSSProperties}
        onPointerEnter={e=>{if(e.pointerType!=='touch')settling.current.pointer=true;}}
        onPointerLeave={()=>{settling.current.pointer=false;}}
        onPointerDown={e=>{
            suppressClick.current=false;
            if(e.button!==0 || (e.target as HTMLElement).closest('.chamber-turn,.chamber-motion'))return;
            suppressClick.current=false;settling.current.pointer=true;
            drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,angle:phase.current,active:false};
        }}
        onPointerMove={e=>{
            const d=drag.current;if(!d||d.id!==e.pointerId)return;
            if(e.buttons!==1){drag.current=null;return;}
            const dx=e.clientX-d.x,dy=e.clientY-d.y;
            if(!d.active&&!horizontalDrag(dx,dy))return;
            if(!d.active){d.active=true;e.currentTarget.setPointerCapture(e.pointerId);}
            directed.current=true;centerTarget.current=null;suppressClick.current=true;
            phase.current=d.angle+dx/Math.max(280,e.currentTarget.clientWidth)*Math.PI*2;
        }}
        onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);drag.current=null;if(e.pointerType==='touch')settling.current.pointer=false;}}
        onPointerCancel={stopInput}
        onLostPointerCapture={()=>{drag.current=null;}}
        onClickCapture={e=>{if(suppressClick.current){suppressClick.current=false;e.preventDefault();e.stopPropagation();}}}
        onFocusCapture={()=>{settling.current.focus=true;}}
        onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))settling.current.focus=false;}}>
        <div className="chamber-overhead" aria-hidden="true"><i/><i/><i/></div>
        <div className="chamber-projection" aria-hidden="true"/>
        <div className="chamber-aura" aria-hidden="true" />
        <svg className="chamber-spectral-field" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {Array.from({length:7},(_,i)=><path key={i} ref={el=>{ribbons.current[i]=el;}} d={spectralRibbon(i,0,0)} />)}
        </svg>
        <div className="chamber-uprights" aria-hidden="true" />
        <div className="chamber-vault" aria-hidden="true" />
        <div className="chamber-floor" aria-hidden="true"><i/><i/><i/></div>
        <svg className="chamber-filaments" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <ellipse cx="50" cy="46" rx="33" ry="28" className="chamber-orbit" />
            <ellipse cx="50" cy="46" rx="38" ry="32" className="chamber-orbit outer" />
            <ellipse cx="50" cy="49" rx="39" ry="14" transform="rotate(-14 50 49)" className="chamber-field rear" />
            <ellipse cx="50" cy="49" rx="39" ry="14" transform="rotate(14 50 49)" className="chamber-field" />
            {visible.map((track,i)=><path key={track.id} ref={el=>{paths.current[i]=el;}} d={chamberConnection(positions[i].x,positions[i].y)} />)}
        </svg>
        <div className="chamber-heart" aria-hidden="true"><div className="chamber-heart-fallback"/><canvas ref={core}/><span>{realmIcon}</span></div>
        <div className="chamber-signature"><strong>{realmName}</strong><small>REALM HEART</small></div>
        <div className="chamber-motes" aria-hidden="true"><i/><i/><i/><i/></div>
        {visible.map((track,i)=><button key={track.id} ref={el=>{nodes.current[i]=el;}}
            className={`chamber-song ${selectedId===track.id?'is-selected':''}`} style={{left:`${positions[i].x}%`,top:`${positions[i].y}%`}}
            aria-label={`${playingId===track.id?'Pause':'Play'} ${track.trackTitle}`} aria-pressed={selectedId===track.id}
            disabled={!track.trackUrl||isTrackLocked(track)} onDragStart={e=>e.preventDefault()} onClick={()=>onChoose(track)} title={track.trackTitle}>
            <span className="chamber-song-surface">{track.artworkUrl?<img src={track.artworkUrl} alt=""/>:<span aria-hidden="true">♪</span>}</span>
            <span className="chamber-song-label">{track.trackTitle}</span>
        </button>)}
        <div className="chamber-turn" role="group" aria-label="Assembly orientation">
            {[-1,0,1].map(direction=><button key={direction}
                aria-label={direction<0?'Turn assembly left':direction>0?'Turn assembly right':'Center assembly'}
                onPointerDown={e=>{if(!direction||e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);held.current=direction;heldSince.current=performance.now();heldMoved.current=false;directed.current=true;centerTarget.current=null;}}
                onPointerUp={()=>{held.current=0;}}
                onPointerCancel={()=>{held.current=0;heldMoved.current=false;}}
                onLostPointerCapture={()=>{held.current=0;}}
                onBlur={()=>{held.current=0;}}
                onClick={()=>{if(!direction){directed.current=true;centerTarget.current=centeredAngle(phase.current);}else if(!heldMoved.current)rotate(direction);heldMoved.current=false;}}
            >{direction<0?'↶':direction>0?'↷':'Center'}</button>)}
        </div>
        <button className="chamber-motion" disabled={staticVisuals} aria-pressed={motion&&!staticVisuals} onClick={()=>setMotion(v=>!v)}>{reduced?'Reduced motion':!visualsEnabled?'Visuals paused':motion?'Pause chamber motion':'Resume chamber motion'}</button>
        <span className="chamber-caption">Drag to turn · Center to restore · live response when enabled</span>
    </div>;
}
