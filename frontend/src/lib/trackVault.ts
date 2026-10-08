import { getMusicAvailability, type AvailabilityTrack } from './musicAvailability';
export const sourceLabels = { unknown: 'Unknown', selfProduced: 'Self-produced (creator stated)', freeNonProfit: 'Free non-profit license', freeForProfit: 'Free-for-profit license', purchased: 'Purchased license', commissioned: 'Commissioned', exclusiveRecorded: 'Exclusive / ownership claim recorded', other: 'Other' };
export const reviewLabels = { unknown: 'Unknown', needsReview: 'Needs review', recorded: 'Information recorded' };
export type RightsInfo = { sourceType: keyof typeof sourceLabels; reviewStatus: keyof typeof reviewLabels; producerName?: string; sourceUrl?: string; notes?: string; documentationRecorded: boolean; commercialIntent?: boolean | null };
export const emptyRights: RightsInfo = { sourceType: 'unknown', reviewStatus: 'unknown', producerName: '', sourceUrl: '', notes: '', documentationRecorded: false, commercialIntent: null };
export type VaultTrack = AvailabilityTrack & { publicCanon?:boolean|null; id: string; title: string; status: string; updatedAt: string; releaseWorldId?: string | null; catalogTreatment?: 'current'|'vault'|'test'|null; rightsInfo?: RightsInfo|null; realmId?:number|null; showInNexus?:boolean; legacyRegistryId?:string|null };
export type ExposureWorld = { publicCanon?:boolean|null; id:string; visibility:string; status:string };
export function matchesVault(track:VaultTrack, filter:string) {
 const treatment=track.catalogTreatment||'current';
 if(filter==='all')return true;
 if(filter==='test')return treatment==='test';
 if(treatment==='test')return false;
 if(filter==='vault')return treatment==='vault'||track.visibility==='private'||track.status==='archived'||track.rightsInfo?.reviewStatus==='needsReview';
 if(filter==='review')return track.rightsInfo?.reviewStatus==='needsReview';
 if(filter==='unknown')return !track.rightsInfo||track.rightsInfo.reviewStatus==='unknown';
 if(filter==='current')return treatment==='current'&&track.status!=='archived';
 if(filter==='public'||filter==='listed'||filter==='private')return track.visibility===filter;
 return true;
}
export function trackExposure(track:VaultTrack, world?:ExposureWorld, registryTrack?:AvailabilityTrack) {
 const protectedTrack=['vault','test'].includes(track.catalogTreatment||'')||track.status==='archived';
 const presented=!protectedTrack&&world?.visibility==='public'&&world.status!=='archived';
 const options={isCreatorView:false,releaseVisibility:presented?'public':'private'};
 const guest=getMusicAvailability(track,{...options,isSignedIn:false});
 const member=getMusicAvailability(track,{...options,isSignedIn:true});
 // Registry music remains an independent public source until explicitly superseded in Nexus.
 const nexusEligible=Boolean(presented&&world?.publicCanon!==false&&track.publicCanon!==false&&track.showInNexus&&[303,202,101,55,44,0].includes(track.realmId as number)
  &&(['public','listed'].includes(track.visibility||'')||(track.visibility==null&&track.isPublic===true))
  &&['playable','preview','coming-soon'].includes(track.playbackStatus||'')
  &&(track.audioUrl||track.previewAudioUrl||track.playbackStatus==='coming-soon'));
 const legacy=!protectedTrack&&track.publicCanon!==false&&world?.publicCanon!==false&&registryTrack&&!nexusEligible?registryTrack:null;
 return { guest:guest.isPlayable||Boolean(legacy&&getMusicAvailability(legacy,{isCreatorView:false,isSignedIn:false}).isPlayable), member:member.isPlayable||Boolean(legacy&&getMusicAvailability(legacy,{isCreatorView:false,isSignedIn:true}).isPlayable), label:protectedTrack?'Excluded from COSMIC public playback':guest.label, publishedWorld:Boolean(presented), nexus:nexusEligible, legacy:Boolean(legacy) };
}
