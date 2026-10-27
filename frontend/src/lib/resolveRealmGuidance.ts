import {findRealmRecommendation,type RuntimeMusicTrack} from '@/lib/publicMusicCatalog';
import {MUSIC_REGISTRY} from '@/lib/musicRegistry';
import {getMusicAvailability} from '@/lib/musicAvailability';
export function resolveRealmGuidance(catalog:RuntimeMusicTrack[],realmId:number,title:string,trackId?:string,signedIn=false){
 const eligible=catalog.filter(t=>t.realmId===realmId&&getMusicAvailability(t,{isCreatorView:false,isSignedIn:signedIn}).isPlayable);
 // Registry supplies historical identity only, never playable media or fallback records.
 return eligible.find(t=>t.id===trackId)??findRealmRecommendation(eligible,MUSIC_REGISTRY,realmId,title)??eligible[0]??null;
}
