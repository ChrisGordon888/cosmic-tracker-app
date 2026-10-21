'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {useApolloClient,useMutation,useQuery} from '@apollo/client';
import {AUDIO_ANALYSIS_SOURCE,SONG_AUDIO_STATE,SAVE_AUDIO_MEASUREMENTS} from '@/graphql/intelligence';
import {AudioFeatureProfileSchema} from '@/lib/audioFeatures';
import {cosmicRead,audioReading} from '@/lib/cosmicRead';
import type {Workbench} from '@/lib/intelligenceWorkbench';
import {EvidenceClaims} from './EvidenceClaims';
export default function CosmicRead({analysis,trackId,ownerId,onChanged,onMoment}:{analysis:Workbench;trackId:string;ownerId:string;onChanged?:()=>Promise<void>;onMoment:(time:number)=>void}){
 const read=useMemo(()=>cosmicRead(analysis,trackId),[analysis,trackId]);
 return <section className="cosmic-read"><h4>COSMIC Read</h4><p className="cosmic-read-statement">{read?.statement}</p>{read?.song.creatorContext.deep.meaning&&<p className="intelligence-preserve">You said: {read.song.creatorContext.deep.meaning.length>220?`${read.song.creatorContext.deep.meaning.slice(0,220)}…`:read.song.creatorContext.deep.meaning}</p>}<details><summary>Why?</summary><p>This reading uses your existing catalog; no audio or model interpretation is assumed.</p><div className="intelligence-chips">{read?.ledger.filter(e=>['FINGERPRINT_SIGNAL','REALM','PROJECT_POSITION','TRACK_RELATIONSHIP'].includes(e.type)).map(e=><span key={e.id}>{e.summary}</span>)}</div>{read?.song.derived.bridge&&<p>At least two meaningful catalog relationships reach each connected signal cluster. This is a catalog bridge, not a claimed story pivot.</p>}</details>{onChanged&&<AudioRead key={ownerId+trackId} trackId={trackId} ownerId={ownerId} analysis={analysis} onChanged={onChanged} onMoment={onMoment}/>}</section>;
}
function AudioRead({trackId,ownerId,analysis,onChanged,onMoment}:{trackId:string;ownerId:string;analysis:Workbench;onChanged:()=>Promise<void>;onMoment:(time:number)=>void}){
 const client=useApolloClient(),state=useQuery(SONG_AUDIO_STATE,{variables:{trackId},fetchPolicy:'no-cache'});
 const [save]=useMutation(SAVE_AUDIO_MEASUREMENTS),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const abort=useRef<AbortController|null>(null);
 useEffect(()=>()=>abort.current?.abort(),[]);
 const refreshState=state.refetch;
 useEffect(()=>{void refreshState().catch(()=>{});},[analysis.inputHash,refreshState]);
 const parsed=AudioFeatureProfileSchema.safeParse(state.data?.songAudioState?.profile);
 const profile=state.data?.songAudioState?.status==='READY'&&parsed.success?parsed.data:null;
 const song=analysis.songs.find(s=>s.trackId===trackId);
 const reading=profile?audioReading(profile,song?.sourceFacts.songMoments??[],song?.creatorContext.deep.meaning):null;
 const primary=reading?.claims.find(c=>c.claimType==='MOMENT_AUDIO_ALIGNMENT')??reading?.claims[0];
 async function listen(){
  const controller=new AbortController();abort.current?.abort();abort.current=controller;setBusy(true);setError('');
  const timeout=setTimeout(()=>controller.abort(),120000);
  try{
   const fresh=await client.query({query:AUDIO_ANALYSIS_SOURCE,variables:{trackId},fetchPolicy:'no-cache',context:{fetchOptions:{signal:controller.signal}}});
   const {analyzeSongAudio}=await import('@/lib/analyzeSongAudio');
   controller.signal.throwIfAborted();
   const input=await analyzeSongAudio(fresh.data.songAudioState.source,ownerId,trackId,controller.signal);
   controller.signal.throwIfAborted();
   const result=await save({variables:{trackId,sourceIdentity:fresh.data.songAudioState.sourceIdentity,input}});
   if(result.data.saveSongAudioMeasurements.status!=='READY')throw Error('The source changed while listening. Please try again.');
   if(!controller.signal.aborted){await state.refetch();await onChanged();}
  }catch(problem){if(!controller.signal.aborted)setError(problem instanceof Error?problem.message:'Could not measure this audio.');}
  finally{clearTimeout(timeout);if(abort.current===controller){setBusy(false);if(controller.signal.aborted)setError('Listening stopped. You can try again.');}}
 }
 return <div className="intelligence-audio" aria-busy={busy}><div className="intelligence-actions"><button disabled={busy||state.loading} onClick={()=>void listen()}>{busy?'Listening…':profile?'Measure again':state.data?.songAudioState?.status==='STALE'?'Measure updated audio':'Measure recording'}</button>{busy&&<button onClick={()=>abort.current?.abort()}>Cancel</button>}<small>{profile?'Measured in your browser':'Measure this recording · no model call'}</small></div>{state.data?.songAudioState?.status==='STALE'&&<p role="status">The recording changed. The earlier audio read is hidden.</p>}{(error||state.error)&&<p role="alert">{error||'Saved measurements could not be loaded. Retry by selecting this song again.'}</p>}{busy&&<p role="status" className="intelligence-listening">Measuring the recording. You can keep exploring.</p>}{profile&&reading&&<div className="intelligence-arrival" key={profile.generatedAt}><EvidenceClaims claims={primary?[primary]:[]} evidence={reading.ledger} onMoment={onMoment}/><details><summary>More from the recording</summary><EvidenceClaims claims={reading.claims.filter(c=>c.id!==primary?.id)} evidence={reading.ledger} onMoment={onMoment}/><p>{profile.durationSeconds.toFixed(1)}s · RMS {profile.rmsDbfs.toFixed(1)} dBFS · sample peak {profile.peakDbfs.toFixed(1)} dBFS · one-second RMS spread {profile.variationDb.toFixed(1)} dB.</p><svg className="intelligence-audio-flow" viewBox="0 0 256 50" role="img" aria-label="Measured amplitude outline"><polyline fill="none" stroke="currentColor" strokeWidth="1" points={profile.peaks.map((v,i)=>`${i},${48-Math.min(1,v)*44}`).join(' ')}/></svg>{profile.changeCandidates.map(c=><p key={c.timeSeconds}><button onClick={()=>onMoment(c.timeSeconds)}>Hear the change near {c.timeSeconds}s →</button> {c.deltaDb>0?'Rise':'Fall'} of {Math.abs(c.deltaDb).toFixed(1)} dB between two-second windows.</p>)}<p>Resampled PCM measurements, not LUFS, true peak, tempo, emotion or a section detector. Level changes are listening candidates. Silent passages affect the averages.</p><small>Saved {new Date(profile.generatedAt).toLocaleDateString()}. Measurements come from your browser and are private.</small></details></div>}</div>;
}
