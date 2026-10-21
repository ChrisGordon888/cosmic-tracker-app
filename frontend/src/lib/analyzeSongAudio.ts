import {AUDIO_MAX_BYTES,AUDIO_SAMPLE_RATE,AudioMeasurementsSchema,type AudioMeasurements} from './audioFeatures';
export type AuthorizedAudioSource={id:string;ownerId:string;audioUrl?:string|null;audioContentHash?:string|null;sourceFileSize?:number|null;canAccessAudio:boolean};
export function authorizedAudioUrl(source:AuthorizedAudioSource,ownerId:string,trackId:string){
 if(source.ownerId!==ownerId||source.id!==trackId||!source.canAccessAudio)throw Error('This source is not available to this account.');
 const url=source.audioUrl?.trim();
 if(!url||(!/^https?:\/\//i.test(url)&&!/^\/(?!\/)/.test(url)))throw Error('A supported full audio source is needed.');
 if((source.sourceFileSize??0)>AUDIO_MAX_BYTES)throw Error('Use a source up to 16 MB for browser listening.');
 return url;
}
export async function audioBytes(url:string,signal:AbortSignal){
 const response=await fetch(url,{signal,credentials:'same-origin'});
 if(!response.ok||!response.body)throw Error('Audio could not be opened. Check source access.');
 if(Number(response.headers.get('content-length'))>AUDIO_MAX_BYTES){await response.body.cancel();throw Error('Use a source up to 16 MB.');}
 const reader=response.body.getReader(),parts:Uint8Array<ArrayBuffer>[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>AUDIO_MAX_BYTES)throw Error('Use a source up to 16 MB.');parts.push(new Uint8Array(value));}}finally{await reader.cancel();}
 if(!size)throw Error('This audio source is empty.');return new Blob(parts).arrayBuffer();
}
export async function analyzeSongAudio(source:AuthorizedAudioSource,ownerId:string,trackId:string,signal:AbortSignal):Promise<AudioMeasurements>{
 const url=authorizedAudioUrl(source,ownerId,trackId),bytes=await audioBytes(url,signal);
 const audioHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 if(source.audioContentHash&&source.audioContentHash!==audioHash)throw Error('The audio file changed. Refresh its source before listening again.');
 signal.throwIfAborted();
 // Browser decode is asynchronous but cannot be cancelled once started. Ignore late completion.
 const context=new OfflineAudioContext(1,1,AUDIO_SAMPLE_RATE);
 let buffer:AudioBuffer;
 try{buffer=await new Promise<AudioBuffer>((resolve,reject)=>{
  const cancel=()=>reject(Error('Listening cancelled.'));signal.addEventListener('abort',cancel,{once:true});
  context.decodeAudioData(bytes).then(resolve,reject).finally(()=>signal.removeEventListener('abort',cancel));
 });}catch{signal.throwIfAborted();throw Error('This recording could not be decoded. Try a supported WAV, MP3 or AAC source.');}
 signal.throwIfAborted();
 if(buffer.duration>600||buffer.numberOfChannels>2)throw Error('Use mono or stereo audio up to 10 minutes.');
 const channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i).slice());
 return new Promise((resolve,reject)=>{
  const worker=new Worker(new URL('../workers/audioAnalysis.worker.ts',import.meta.url));
  const cleanup=()=>{worker.terminate();signal.removeEventListener('abort',cancel);clearTimeout(timer);};
  const cancel=()=>{cleanup();reject(Error('Listening cancelled.'));};
  const timer=setTimeout(()=>{cleanup();reject(Error('Listening timed out. Please try a smaller source.'));},30000);
  signal.addEventListener('abort',cancel,{once:true});
  worker.onerror=()=>{cleanup();reject(Error('Audio measurement could not finish.'));};
  worker.onmessage=event=>{cleanup();try{if(event.data.error)throw Error(event.data.error);resolve(AudioMeasurementsSchema.parse(event.data.profile));}catch(error){reject(error);}};
  if(signal.aborted){cancel();return;}
  worker.postMessage({channels,sampleRate:buffer.sampleRate,audioHash},channels.map(c=>c.buffer));
 });
}
