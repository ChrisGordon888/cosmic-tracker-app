'use client';
import {useEffect,useRef,useState} from 'react';
/** Decorative full-stage atmosphere. Still image is the default, including before hydration. */
export default function ImpossibleEnvironment({paused}:{paused:boolean}){
 const video=useRef<HTMLVideoElement>(null),[failed,setFailed]=useState(false),[started,setStarted]=useState(false);
 useEffect(()=>{if(!paused)setStarted(true);},[paused]);
 useEffect(()=>{
  const node=video.current;if(!node||failed)return;
  let visible=true,cancelled=false;
  node.defaultPlaybackRate=1;node.playbackRate=1;
  const sync=()=>{if(paused||!visible||document.hidden)node.pause();else void node.play().catch(()=>{if(!cancelled)setFailed(true);});};
  const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;sync();});observer.observe(node);
  document.addEventListener('visibilitychange',sync);sync();
  return()=>{cancelled=true;observer.disconnect();document.removeEventListener('visibilitychange',sync);node.pause();};
 },[paused,failed,started]);
 return <div className="impossible-installation" aria-hidden="true"><img src="/intelligence/escher-poster.jpg" alt=""/>{started&&<video hidden={paused||failed} ref={video} muted playsInline loop preload="metadata" poster="/intelligence/escher-poster.jpg" onError={()=>setFailed(true)}><source src="/intelligence/escher_cosmic_loop.mp4" type="video/mp4"/></video>}</div>;
}
