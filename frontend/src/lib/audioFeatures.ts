import {perceivePCM} from './acousticPerception';
import {z} from 'zod';
export const AUDIO_VERSION='pcm-perception-v2';
export const AUDIO_SAMPLE_RATE=16000;
export const AUDIO_MAX_BYTES=16*1024*1024;
const db=z.number().finite().min(-120).max(12);
export const AudioMeasurementsSchema=z.object({spectralCentroidHz:z.number().finite().min(0).max(8000).nullable(),highBandRatio:z.number().finite().min(0).max(1).nullable(),activityRisesPerSecond:z.number().finite().min(0).max(10).nullable(),spectralFrames:z.number().int().min(0).max(2400),audioHash:z.string().regex(/^[a-f0-9]{64}$/),analysisVersion:z.literal(AUDIO_VERSION),durationSeconds:z.number().positive().max(600),sampleRate:z.literal(16000),channelCount:z.number().int().min(1).max(2),rmsDbfs:db,peakDbfs:db,variationDb:z.number().min(0).max(132),binSeconds:z.literal(1),rmsEnvelope:z.array(db).min(1).max(600),peaks:z.array(z.number().min(0).max(4)).length(256),changeCandidates:z.array(z.object({timeSeconds:z.number().min(2).max(598),deltaDb:z.number().min(-132).max(132)})).max(5)}).superRefine((p,ctx)=>{if(p.rmsEnvelope.length!==Math.ceil(p.durationSeconds)||p.peakDbfs+0.000001<p.rmsDbfs||p.changeCandidates.some(c=>c.timeSeconds>p.durationSeconds-2||Math.abs(c.deltaDb)<6))ctx.addIssue({code:'custom',message:'Inconsistent audio measurements.'});});
export const AudioFeatureProfileSchema=AudioMeasurementsSchema.safeExtend({trackId:z.string(),sourceIdentity:z.string(),generatedAt:z.string(),toolchain:z.string(),measurementOrigin:z.literal('OWNER_BROWSER')});
export type AudioMeasurements=z.infer<typeof AudioMeasurementsSchema>;
export type AudioFeatureProfile=z.infer<typeof AudioFeatureProfileSchema>;
export type AudioSummary=Pick<AudioFeatureProfile,'trackId'|'sourceIdentity'|'analysisVersion'|'rmsDbfs'|'durationSeconds'|'spectralCentroidHz'|'highBandRatio'|'activityRisesPerSecond'|'spectralFrames'>;
const toDb=(amplitude:number)=>Math.max(-120,Math.min(12,20*Math.log10(Math.max(1e-6,amplitude))));
// Equal-power average across channels: antiphase stereo must not cancel.
export function measurePCM(channels:Float32Array[],sampleRate:number,audioHash:string):AudioMeasurements{
 if(sampleRate!==AUDIO_SAMPLE_RATE||channels.length<1||channels.length>2||!channels[0]?.length||channels.some(c=>c.length!==channels[0].length))throw Error('Unsupported audio layout.');
 const length=channels[0].length,durationSeconds=length/sampleRate;
 if(durationSeconds>600)throw Error('Use a recording up to 10 minutes.');
 const powers=new Float64Array(Math.ceil(durationSeconds)),counts=new Uint32Array(powers.length),peaks=Array<number>(256).fill(0);let total=0,peak=0;
 for(let i=0;i<length;i++){
  let power=0,localPeak=0;
  for(const channel of channels){const value=channel[i];if(!Number.isFinite(value)||Math.abs(value)>4)throw Error('Invalid decoded audio.');power+=value*value/channels.length;localPeak=Math.max(localPeak,Math.abs(value));}
  const bin=Math.floor(i/sampleRate);powers[bin]+=power;counts[bin]++;total+=power;peak=Math.max(peak,localPeak);const bucket=Math.min(255,Math.floor(i/length*256));peaks[bucket]=Math.max(peaks[bucket],localPeak);
 }
 const rmsEnvelope=Array.from(powers,(value,i)=>toDb(Math.sqrt(value/counts[i]))),sorted=[...rmsEnvelope].sort((a,b)=>a-b);
 const candidates:{timeSeconds:number;deltaDb:number}[]=[];
 for(let i=2;i<=rmsEnvelope.length-2;i++){
  const before=(powers[i-2]+powers[i-1])/(counts[i-2]+counts[i-1]),after=(powers[i]+powers[i+1])/(counts[i]+counts[i+1]);
  const deltaDb=toDb(Math.sqrt(after))-toDb(Math.sqrt(before));
  if(Math.abs(deltaDb)>=6&&Math.max(before,after)>1e-8&&i<=durationSeconds-2)candidates.push({timeSeconds:i,deltaDb});
 }
 const changes:typeof candidates=[];
 for(const c of candidates.sort((a,b)=>Math.abs(b.deltaDb)-Math.abs(a.deltaDb)||a.timeSeconds-b.timeSeconds)){if(changes.every(other=>Math.abs(other.timeSeconds-c.timeSeconds)>=5))changes.push(c);if(changes.length===5)break;}
 return AudioMeasurementsSchema.parse({...perceivePCM(channels,sampleRate),audioHash,analysisVersion:AUDIO_VERSION,durationSeconds,sampleRate,channelCount:channels.length,rmsDbfs:toDb(Math.sqrt(total/length)),peakDbfs:toDb(peak),variationDb:sorted[Math.floor((sorted.length-1)*.9)]-sorted[Math.floor((sorted.length-1)*.1)],binSeconds:1,rmsEnvelope,peaks,changeCandidates:changes.sort((a,b)=>a.timeSeconds-b.timeSeconds)});
}
export function levelTrend(profile:AudioMeasurements){
 if(profile.durationSeconds<9)return null;
 const n=Math.floor(profile.rmsEnvelope.length/3);
 const average=(values:number[])=>10*Math.log10(Math.max(1e-12,values.reduce((sum,db)=>sum+10**(db/10),0)/values.length));
 const first=average(profile.rmsEnvelope.slice(0,n)),last=average(profile.rmsEnvelope.slice(-n));
 return {deltaDb:last-first,direction:Math.abs(last-first)<3?'steady':last>first?'rises':'falls'} as const;
}
