import { getMusicAvailability } from './musicAvailability';
import type { MusicTrack } from '../context/MusicPlayerProvider';
import { playerRealm } from './playerRealm';
export type ProjectTrack={id:string;title:string;trackNumber:number;realmId?:number|null;isFocusTrack?:boolean;visibility?:string;playbackStatus?:string;accessTier?:string;audioUrl?:string|null;previewAudioUrl?:string|null;unlockDate?:string|null;dropDate?:string|null};
export type PublicProject={creatorName?:string;isSelected?:boolean;realmId:number|null;world:{id:string;title:string;slug:string;coverArtUrl?:string|null;oneLineSummary?:string|null;story?:string|null;releaseType:string};tracks:ProjectTrack[]};
export function projectPlayback(project:PublicProject,signedIn:boolean){
 const tracks=project.tracks.map(track=>({track,availability:getMusicAvailability(track,{isCreatorView:false,isSignedIn:signedIn,releaseVisibility:'public'})}));
 const playable=tracks.filter(t=>t.availability.isPlayable);
 const lead=playable.find(t=>t.track.isFocusTrack)||playable[0];
 return {total:tracks.length,available:playable.length,member:tracks.filter(t=>t.track.accessTier==='signup'&&!t.availability.isPlayable).length,lead:lead?{id:`release-${lead.track.id}`,trackTitle:lead.track.title,trackUrl:lead.availability.resolvedAudioUrl,...playerRealm(lead.track.realmId),artist:project.creatorName||'Independent creator',visibility:'public',releaseSlug:project.world.slug} as MusicTrack:null};
}
