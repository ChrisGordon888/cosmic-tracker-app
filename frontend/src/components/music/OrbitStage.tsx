'use client';
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { MusicTrack } from '@/context/MusicPlayerProvider';
import { chamberPositions, chamberConnection } from '@/lib/orbitStageGeometry';
import { createRealmHeart } from '@/lib/realmHeartRenderer';
import './orbitStage.css';

export type ChamberMeasurement = { energy: number; high: number };
type Props = {
    tracks: MusicTrack[]; selectedId?: string; playingId?: string;
    realmName: string; realmIcon: string; color: string; reduced: boolean;
    measurement: RefObject<ChamberMeasurement>;
    onChoose: (track: MusicTrack) => void;
    isTrackLocked: (track: MusicTrack) => boolean;
};
/** Rendering only. No provider, capture, data fetching, queue, or audio ownership. */
export default function OrbitStage({ tracks, selectedId, playingId, realmName, realmIcon, color, reduced, measurement, onChoose, isTrackLocked }: Props) {
    const visible = tracks.slice(0,8);
    const root = useRef<HTMLDivElement>(null), core = useRef<HTMLCanvasElement>(null);
    const nodes = useRef<(HTMLButtonElement | null)[]>([]), paths = useRef<(SVGPathElement | null)[]>([]);
    const settling = useRef({ pointer:false, focus:false });
    const [motion, setMotion] = useState(true);
    const phase = useRef(0);
    // Read changing selection without restarting the animation or recreating GPU resources.
    const state = useRef({ ids: visible.map(t=>t.id), playingId, measurement, reduced, motion });
    useEffect(()=>{ state.current={ids:visible.map(t=>t.id),playingId,measurement,reduced,motion}; });
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
            if(moving){clock+=delta;phase.current+=delta*Math.PI*2/110;}
            const energy=s.reduced?0:s.measurement.current.energy;
            const response = Math.min(1, energy + (s.reduced ? 0 : s.measurement.current.high * .15));
            if (clock !== drawnClock || response !== drawnEnergy) {
                renderer?.draw(clock,response); drawnClock=clock; drawnEnergy=response;
            }
            const positions=chamberPositions(s.ids.length,phase.current);
            positions.forEach((p,i)=>{
                const node=nodes.current[i],path=paths.current[i];
                if(node){node.style.left=`${p.x}%`;node.style.top=`${p.y}%`;node.style.zIndex=String(10+Math.round(p.depth*10));node.style.setProperty('--depth',String(p.scale));}
                if(path){path.setAttribute('d',chamberConnection(p.x,p.y));const active=s.ids[i]===s.playingId;path.style.opacity=String(active?.5+energy*.5:.16);path.style.strokeWidth=String(active?.18+energy*.5:.11);}
            });
            element?.style.setProperty('--chamber-energy',String(energy));
        }
        const sync=()=>{cancelAnimationFrame(frame);last=performance.now();if(!disposed&&!document.hidden&&visibleOnScreen)frame=requestAnimationFrame(draw);};
        const observer=new IntersectionObserver(entries=>{visibleOnScreen=entries[0].isIntersecting;sync();});observer.observe(element);
        document.addEventListener('visibilitychange',sync);sync();
        return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',sync);canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);renderer?.dispose();};
    },[color]);
    const positions=chamberPositions(visible.length,phase.current);
    return <div className="orbit-chamber" ref={root} style={{color,'--chamber-color':color} as CSSProperties}
        onPointerEnter={e=>{if(e.pointerType!=='touch')settling.current.pointer=true;}}
        onPointerLeave={()=>{settling.current.pointer=false;}}
        onPointerDown={()=>{settling.current.pointer=true;}}
        onPointerUp={e=>{if(e.pointerType==='touch')settling.current.pointer=false;}}
        onPointerCancel={()=>{settling.current.pointer=false;}}
        onFocusCapture={()=>{settling.current.focus=true;}}
        onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))settling.current.focus=false;}}>
        <div className="chamber-vault" aria-hidden="true" />
        <div className="chamber-floor" aria-hidden="true"><i/><i/><i/></div>
        <svg className="chamber-filaments" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <ellipse cx="50" cy="48" rx="37" ry="32" className="chamber-orbit" />
            <ellipse cx="50" cy="48" rx="41" ry="35" className="chamber-orbit outer" />
            {visible.map((track,i)=><path key={track.id} ref={el=>{paths.current[i]=el;}} d={chamberConnection(positions[i].x,positions[i].y)} />)}
        </svg>
        <div className="chamber-heart" aria-hidden="true"><div className="chamber-heart-fallback"/><canvas ref={core}/><span>{realmIcon}</span></div>
        <div className="chamber-signature"><strong>{realmName}</strong><small>REALM HEART</small></div>
        <div className="chamber-motes" aria-hidden="true"><i/><i/><i/><i/></div>
        {visible.map((track,i)=><button key={track.id} ref={el=>{nodes.current[i]=el;}}
            className={`chamber-song ${selectedId===track.id?'is-selected':''}`} style={{left:`${positions[i].x}%`,top:`${positions[i].y}%`}}
            aria-label={`${playingId===track.id?'Pause':'Play'} ${track.trackTitle}`} aria-pressed={selectedId===track.id}
            disabled={!track.trackUrl||isTrackLocked(track)} onClick={()=>onChoose(track)} title={track.trackTitle}>
            <span className="chamber-song-surface">{track.artworkUrl?<img src={track.artworkUrl} alt=""/>:<span aria-hidden="true">♪</span>}</span>
            <span className="chamber-song-label">{track.trackTitle}</span>
        </button>)}
        <button className="chamber-motion" disabled={reduced} aria-pressed={motion&&!reduced} onClick={()=>setMotion(v=>!v)}>{reduced?'Reduced motion':motion?'Pause chamber motion':'Resume chamber motion'}</button>
        <span className="chamber-caption">Authored atmosphere · audio response when enabled</span>
    </div>;
}
