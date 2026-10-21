'use client';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import WaveSurfer from 'wavesurfer.js';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { SONG_LAB_SOURCE, SAVE_SONG_MOMENT, DELETE_SONG_MOMENT } from '@/graphql/intelligence';
import { labPlayerTrack, markerPercent, waveformBlob, MAX_WAVEFORM_BYTES } from '@/lib/songLab';
import type { SongMoment } from '@/lib/creatorContext';
const emptyMoment={timeSeconds:0,endTimeSeconds:null as number|null,type:'MOMENT',label:'',note:'',lyricExcerpt:''};
export default function SongLab({trackId,ownerId,moments,project,onChanged,seekRequest=null,onSeekHandled}:{trackId:string;ownerId:string;moments:SongMoment[];project?:string;onChanged:()=>Promise<void>;seekRequest?:number|null;onSeekHandled?:()=>void}){
 const {data,error,loading}=useQuery(SONG_LAB_SOURCE,{variables:{trackId},fetchPolicy:'no-cache'});
 const [saveMoment]=useMutation(SAVE_SONG_MOMENT),[deleteMoment]=useMutation(DELETE_SONG_MOMENT);
 const player=useMusicPlayer();const source=data?.songLabTrack;const track=source?labPlayerTrack(source,ownerId):null;
 const seekTo=player.seekTo;
 const active=!!track&&player.currentTrack?.id===track.id;
 const [duration,setDuration]=useState(0),[problem,setProblem]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(false);
 const [draft,setDraft]=useState(emptyMoment),[editing,setEditing]=useState<string|null>(null),[form,setForm]=useState(false),[pendingSeek,setPendingSeek]=useState<number|null>(null);
 const container=useRef<HTMLDivElement>(null),wave=useRef<WaveSurfer|null>(null),seekHandler=useRef<(time:number)=>void>(()=>{});
 const url=track?.trackUrl;
 async function seek(time:number){if(!track)return;setPendingSeek(time);await player.playTrack(track,[track],{source:'catalog',label:'Song Lab'});}
 useEffect(()=>{seekHandler.current=time=>{void seek(time);};});
 useEffect(()=>{if(seekRequest!==null&&track?.id){seekHandler.current(seekRequest);onSeekHandled?.();}},[seekRequest,track?.id,onSeekHandled]);
 useEffect(()=>{if(active&&player.duration>0&&pendingSeek!==null){seekTo(pendingSeek);setPendingSeek(null);}},[active,player.duration,seekTo,pendingSeek]);
 useEffect(()=>{
  if(!url||!container.current)return;
  const abort=new AbortController();let disposed=false;setReady(false);setProblem('');setDuration(0);
  // WaveSurfer is a muted visual instrument; all audible controls use MusicPlayerProvider.
  const ws=WaveSurfer.create({container:container.current,waveColor:'#71849a',progressColor:'#dcba5c',cursorColor:'#f4d376',height:110,normalize:false,interact:true,dragToSeek:false,mediaControls:false});
  ws.setMuted(true);wave.current=ws;
  ws.on('interaction',time=>seekHandler.current(time));
  ws.on('ready',length=>{if(!disposed){setDuration(length);setReady(true);}});
  ws.on('error',()=>{if(!disposed)setProblem('Waveform unavailable. The source may require renewed access, CORS support, or a smaller file. Existing player controls remain available.');});
  if((source?.sourceFileSize??0)>MAX_WAVEFORM_BYTES)setProblem('This file is too large for browser waveform decoding (32 MB limit). Playback remains available.');
  else void waveformBlob(url,abort.signal).then(blob=>{if(!disposed)return ws.loadBlob(blob);}).catch(()=>{if(!disposed)setProblem('Waveform unavailable. Check source access/CORS or try a smaller file. No access rules were changed.');});
  return ()=>{disposed=true;abort.abort();ws.destroy();wave.current=null;};
 },[url,source?.sourceFileSize]);
 useEffect(()=>{if(ready&&wave.current)wave.current.setTime(active?player.currentTime:0);},[ready,active,player.currentTime]);
 async function persist(removeId?:string){setBusy(true);setProblem('');try{if(removeId)await deleteMoment({variables:{trackId,momentId:removeId}});else await saveMoment({variables:{trackId,momentId:editing,input:draft}});await onChanged();setForm(false);setEditing(null);setDraft(emptyMoment);}catch{setProblem('Could not save or refresh the moment. Your draft remains here.');}finally{setBusy(false);}}
 if(loading)return <p role="status">Opening this song’s authorized source…</p>;
 if(error||!track)return <p role="alert">Song Lab cannot access this source. Refresh sources or check the song in Library.</p>;
 const time=active?player.currentTime:0,total=duration||(active?player.duration:0);
 return <section className="intelligence-song-lab"><h4>Song Lab · {track.trackTitle}</h4><p>{track.realmName} · {project||'Standalone catalog'}</p><div ref={container} aria-label="Song waveform"/><div className="intelligence-moment-strip" aria-label="Moment markers">{total>0&&moments.map(m=><button key={m.id} style={{left:`${markerPercent(m.timeSeconds,total)}%`}} title={`${m.timeSeconds.toFixed(1)}s · ${m.label||m.type}`} aria-label={`Seek to ${m.label||m.type} at ${m.timeSeconds} seconds`} onClick={()=>void seek(m.timeSeconds)}>◆</button>)}</div>
 <p>{time.toFixed(1)} / {total.toFixed(1)} seconds · {ready?'Waveform ready':'Waveform is optional; playback uses the shared player.'}</p>
 <button onClick={()=>{if(active&&player.isPlaying)player.pause();else void player.playTrack(track,[track],{source:'catalog',label:'Song Lab'});}}>{active&&player.isPlaying?'Pause':'Play'}</button>
 <button onClick={()=>{if(active)player.pause();setEditing(null);setDraft({...emptyMoment,timeSeconds:Math.round(time*10)/10});setForm(true);}}>Add moment at {time.toFixed(1)}s</button>
 <label>Seek<input aria-label="Seek song" type="range" min={0} max={total||1} step={.1} value={Math.min(time,total||1)} disabled={!total} onChange={e=>void seek(Number(e.target.value))}/></label>
 {problem&&<p role="alert">{problem}</p>}
 {form&&<fieldset disabled={busy}><legend>{editing?'Edit your moment':'Your moment'}</legend><label>Time (seconds)<input type="number" min={0} max={86400} step={.1} value={draft.timeSeconds} onChange={e=>setDraft({...draft,timeSeconds:Number(e.target.value)})}/></label><label>End (optional)<input type="number" min={draft.timeSeconds} max={86400} step={.1} value={draft.endTimeSeconds??''} onChange={e=>setDraft({...draft,endTimeSeconds:e.target.value===''?null:Number(e.target.value)})}/></label><label>Type<select value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value})}>{['HOOK','VERSE','TURN','DROP','MOMENT','NOTE','LYRIC','ENERGY','CUSTOM'].map(t=><option key={t}>{t}</option>)}</select></label><label>Label<input maxLength={200} value={draft.label} onChange={e=>setDraft({...draft,label:e.target.value})}/></label><label>Your note<textarea maxLength={2000} value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})}/></label><label>Lyric excerpt you associate with this moment<textarea maxLength={1000} value={draft.lyricExcerpt} onChange={e=>setDraft({...draft,lyricExcerpt:e.target.value})}/></label><button onClick={()=>void persist()}>Save moment</button><button onClick={()=>setForm(false)}>Cancel</button></fieldset>}
 <p>Moments are marked by you. COSMIC has not detected sections or hooks.</p><ol>{moments.slice().sort((a,b)=>a.timeSeconds-b.timeSeconds).map(m=><li key={m.id}><button onClick={()=>void seek(m.timeSeconds)}>{m.timeSeconds.toFixed(1)}s · {m.label||m.type}</button><p>{m.note}</p>{m.lyricExcerpt&&<blockquote>Linked by you: {m.lyricExcerpt}</blockquote>}<button disabled={busy} onClick={()=>{setEditing(m.id);setDraft({timeSeconds:m.timeSeconds,endTimeSeconds:m.endTimeSeconds??null,type:m.type,label:m.label||'',note:m.note||'',lyricExcerpt:m.lyricExcerpt||''});setForm(true);}}>Edit</button><details><summary>Delete moment</summary><button disabled={busy} onClick={()=>void persist(m.id)}>Delete this moment</button></details></li>)}</ol></section>;
}
