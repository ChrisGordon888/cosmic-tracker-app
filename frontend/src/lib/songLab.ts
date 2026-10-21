import type { MusicTrack } from '@/context/MusicPlayerProvider';
import { realmName } from './creativeFingerprint';
export const MAX_WAVEFORM_BYTES = 32 * 1024 * 1024;
export type LabSource = { id:string; ownerId:string; title:string; realmId:number|null; audioUrl?:string|null; previewAudioUrl?:string|null; canAccessAudio:boolean; sourceFileSize?:number|null; playbackStatus?:string|null; accessTier?:string|null; visibility?:string|null; unlockDate?:string|null; dropDate?:string|null };
export function labPlayerTrack(source:LabSource, ownerId:string):MusicTrack|null {
 if(source.ownerId!==ownerId||!source.canAccessAudio)return null;
 const url=source.audioUrl?.trim()||source.previewAudioUrl?.trim();
 if(!url||(!url.startsWith('/')&&!/^https?:\/\//i.test(url)))return null;
 let sourceKey=2166136261;for(const c of url)sourceKey=Math.imul(sourceKey^c.charCodeAt(0),16777619);
 return {id:`song-lab-${source.id}-${sourceKey>>>0}`,ownerId:source.ownerId,trackTitle:source.title,trackUrl:url,audioUrl:source.audioUrl,previewAudioUrl:source.previewAudioUrl,realmId:source.realmId??null,realmName:source.realmId==null?'Realm undecided':realmName(source.realmId),visibility:source.visibility??undefined,accessTier:source.accessTier,playbackStatus:source.playbackStatus,unlockDate:source.unlockDate,dropDate:source.dropDate};
}
export function markerPercent(time:number,duration:number){return duration>0?Math.max(0,Math.min(100,time/duration*100)):0;}
export async function waveformBlob(url:string,signal:AbortSignal):Promise<Blob>{
 const response=await fetch(url,{signal,credentials:'same-origin'});
 if(!response.ok||!response.body){await response.body?.cancel();throw new Error('Audio source unavailable.');}
 if(Number(response.headers.get('content-length'))>MAX_WAVEFORM_BYTES){await response.body.cancel();throw new Error('Audio exceeds the browser waveform limit.');}
 const reader=response.body.getReader(),chunks:Uint8Array<ArrayBuffer>[]=[];let size=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_WAVEFORM_BYTES)throw new Error('Audio exceeds the browser waveform limit.');chunks.push(new Uint8Array(value));}}finally{await reader.cancel();}
 return new Blob(chunks,{type:response.headers.get('content-type')||'audio/mpeg'});
}
