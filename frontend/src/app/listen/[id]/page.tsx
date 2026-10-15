'use client';
import { gql,useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import type { MusicTrack } from '@/lib/musicRegistry';
const QUERY=gql`query ShareableTrack($id:ID!){getShareableTrack(id:$id){id title ownerId artistName audioUrl previewAudioUrl accessGate visibility playbackStatus}}`;
export default function ShareableTrack(){
 const params=useParams<{id:string}>();const id=params?.id;const {data,loading,error}=useQuery(QUERY,{variables:{id},skip:!id,fetchPolicy:'network-only'});const {playOrToggleTrack,currentTrack,isPlaying}=useMusicPlayer();
 const t=data?.getShareableTrack;
 if(loading)return <main className="p-8">Loading track…</main>;
 if(error||!t)return <main className="p-8">This track is unavailable.</main>;
 const url=t.audioUrl||t.previewAudioUrl;
 const music={id:`release-${t.id}`,trackTitle:t.title,artist:t.artistName||'Independent creator',trackUrl:url,realmId:0,realmName:'Shared music',realmColor:'#b5a8df',visibility:'public',status:'finished',role:'public'} as MusicTrack;
 return <main className="mx-auto max-w-xl p-8"><p>Shared music</p><h1 className="text-3xl">{t.title}</h1><p>{t.artistName}</p>{url?<button type="button" className="mt-6 rounded border p-4" onClick={()=>playOrToggleTrack(music)}>{currentTrack?.id===music.id&&isPlaying?'Pause':'Play'}</button>:<p>{t.accessGate==='signup-required'?'Sign in to listen.':'Playback is not currently available.'}</p>}<p className="mt-6">A shared link does not imply current Canon or Nexus placement.</p></main>;
}
