'use client';
import {useEffect,useRef,useState} from 'react';
import {useApolloClient} from '@apollo/client';
import {useMusicPlayer} from '@/hooks/useMusicPlayer';
import {SONG_LAB_SOURCE} from '@/graphql/intelligence';
import {resolveAudition} from '@/lib/creativeAudition';
import type {Workbench} from '@/lib/intelligenceWorkbench';
export function useIntelligenceAudition(analysis:Workbench){
 const client=useApolloClient(),player=useMusicPlayer(),request=useRef(0);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>()=>{request.current++;},[analysis.ownerId]);
 async function audition(ids:string[]){
  const token=++request.current;setBusy(true);setError('');
  try{
   const sources=await resolveAudition(analysis,ids,async trackId=>{
    const result=await client.query({query:SONG_LAB_SOURCE,variables:{trackId},fetchPolicy:'no-cache'});
    return result.data?.songLabTrack;
   });
   if(token!==request.current)return;
   await player.playTrack(sources[0],sources,{source:'catalog',label:sources.length>1?'World Seed · private experiment':'Creative Compass'});
  }catch(e){if(token===request.current)setError(e instanceof Error?e.message:'Could not audition this selection.');}
  finally{if(token===request.current)setBusy(false);}
 }
 return {audition,busy,error};
}
export type IntelligenceAudition=ReturnType<typeof useIntelligenceAudition>;
