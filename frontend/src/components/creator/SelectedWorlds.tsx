'use client';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { PUBLIC_PROJECTS } from '@/graphql/publicProjects';
import { projectPlayback,type PublicProject } from '@/lib/publicProjects';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { usePlatformAccess } from '@/context/PlatformAccessProvider';
import { realmName } from '@/lib/creativeFingerprint';
export default function SelectedWorlds(){
 const {data,loading,error}=useQuery(PUBLIC_PROJECTS,{variables:{selectedOnly:true},fetchPolicy:'network-only'});const {isAuthenticated}=usePlatformAccess();const {playOrToggleTrack,currentTrack,isPlaying}=useMusicPlayer();
 return <section className="glass-card p-5 mt-6"><h2 className="text-2xl font-display">Selected Worlds</h2><p>Creator projects, selected for Nexus.</p>{loading?<p>Loading worlds…</p>:error?<p>Worlds could not be loaded.</p>:!data?.publicProjects.length?<p>No worlds selected yet.</p>:<div className="grid gap-4 mt-4 sm:grid-cols-2">{data.publicProjects.map((p:PublicProject)=>{const state=projectPlayback(p,isAuthenticated);return <article key={p.world.id} className="rounded-xl border border-white/15 p-4 min-w-0">{p.world.coverArtUrl&&<img src={p.world.coverArtUrl} alt="" className="w-full aspect-square object-cover rounded-lg"/>}<h3 className="text-xl mt-3">{p.world.title}</h3><p>{p.realmId==null?'Mixed / undecided Realm':`${realmName(p.realmId)} context`}</p><p>{p.world.oneLineSummary||p.world.story?.slice(0,180)}</p><p>{state.total} tracks in this public world · {state.available} playable now{state.member?` · ${state.member} require sign-in`:''}</p><div className="flex flex-wrap gap-3 mt-3"><Link href={`/releases/${p.world.slug}`} className="btn-secondary">Enter World →</Link>{state.lead&&<button type="button" className="btn-secondary" onClick={()=>playOrToggleTrack(state.lead!)}>{currentTrack?.id===state.lead.id&&isPlaying?'Pause':'Play'} {state.lead.trackTitle}</button>}</div></article>;})}</div>}</section>;
}
