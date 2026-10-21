import { getMusicAvailability } from './musicAvailability';
import type { MusicTrack } from '../context/MusicPlayerProvider';
import { playerRealm } from './playerRealm';
export type ProjectTrack={id:string;title:string;trackNumber:number;realmId?:number|null;isFocusTrack?:boolean;visibility?:string;playbackStatus?:string;accessTier?:string;audioUrl?:string|null;previewAudioUrl?:string|null;unlockDate?:string|null;dropDate?:string|null};
export type PublicProject={creatorName?:string;isSelected?:boolean;realmId:number|null;world:{id:string;title:string;slug:string;coverArtUrl?:string|null;oneLineSummary?:string|null;story?:string|null;releaseType:string};tracks:ProjectTrack[]};
export function projectPlayback(project:PublicProject,signedIn:boolean){
 const tracks=project.tracks.map(track=>({track,availability:getMusicAvailability(track,{isCreatorView:false,isSignedIn:signedIn,releaseVisibility:'public'})}));
 const playable=tracks.filter(t=>t.availability.isPlayable && t.availability.resolvedAudioUrl)
  .sort((a,b)=>a.track.trackNumber-b.track.trackNumber);
 const queue:MusicTrack[]=playable.map(({track,availability})=>({
  id:`release-${track.id}`,trackTitle:track.title,trackUrl:availability.resolvedAudioUrl!,
  ...playerRealm(track.realmId),artist:project.creatorName||'Independent creator',
  visibility:track.visibility,accessTier:track.accessTier,playbackStatus:track.playbackStatus,
  audioUrl:track.audioUrl,previewAudioUrl:track.previewAudioUrl,unlockDate:track.unlockDate,dropDate:track.dropDate,
  releaseSlug:project.world.slug,
  releaseWorldId:project.world.id,
 }));
 const focusIndex=playable.findIndex(t=>t.track.isFocusTrack);
 return {total:tracks.length,available:queue.length,member:tracks.filter(t=>t.track.accessTier==='signup'&&!t.availability.isPlayable).length,
  queue,lead:queue[focusIndex>=0?focusIndex:0]??null};
}
