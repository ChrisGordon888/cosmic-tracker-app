import {measurePCM} from '../lib/audioFeatures';
self.onmessage=(event:MessageEvent<{channels:Float32Array[];sampleRate:number;audioHash:string}>)=>{
 try{self.postMessage({profile:measurePCM(event.data.channels,event.data.sampleRate,event.data.audioHash)});}catch(error){self.postMessage({error:error instanceof Error?error.message:'Audio could not be measured.'});}
};
