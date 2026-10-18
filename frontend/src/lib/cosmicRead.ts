import type {Workbench} from './intelligenceWorkbench';
import {songEvidence,evidence,claim,type EvidenceItem,type IntelligenceClaim} from './groundedReasoning';
import {levelTrend,type AudioFeatureProfile} from './audioFeatures';
export function cosmicRead(analysis:Workbench,trackId:string){
 const song=analysis.songs.find(s=>s.trackId===trackId);if(!song)return null;
 const ledger=songEvidence(analysis,trackId),related=ledger.filter(e=>e.type==='TRACK_RELATIONSHIP'),signals=ledger.filter(e=>e.type==='FINGERPRINT_SIGNAL');
 const relatedNames=song.derived.relatedTrackIds.slice(0,2).map(id=>analysis.songs.find(s=>s.trackId===id)?.sourceFacts.title.slice(0,60)).filter(Boolean).join(' and ');
 const facts=song.sourceFacts,world=analysis.projects.find(p=>p.world.id===facts.releaseWorldId);
 let statement:string;
 if(song.derived.bridge)statement='This song connects more than one signal neighborhood in your catalog. Its role in a project is still yours to decide.';
 else if(related.length)statement=`${song.derived.evidence.slice(0,3).map(e=>e.signal).join(' · ')}. This song shares supported signals with ${relatedNames||'nearby songs'} in your catalog.`;
 else if(signals.length)statement=`${song.derived.evidence.slice(0,3).map(e=>e.signal).join(' · ')}. A distinct starting point; there is no supported relationship to force onto it.`;
 else if(world)statement=`${facts.title} sits ${facts.trackNumber?`at position ${facts.trackNumber}`:'in the sequence'} in ${world.world.title}. The sequence is known; a narrative reading is still open.`;
 else if(facts.releaseWorldId)statement='This song references a project outside the current sample. You can still inspect its recording without changing its project link.';
 else statement='A standalone song with room to find its own direction. Listen for a first measured read, or explore it as it is—no context form required.';
 return {statement,ledger,song};
}
export function audioReading(profile:AudioFeatureProfile,moments:{id:string;timeSeconds:number;type:string}[],meaning?:string|null){
 const ledger:EvidenceItem[]=[],claims:IntelligenceClaim[]=[];
 const add=(summary:string,path:string,timeSeconds?:number)=>{const e=evidence('AUDIO_MEASUREMENT',profile.trackId,'STORED_FACT',summary,path,{...(timeSeconds===undefined?{}:{timeSeconds}),provenance:{engineVersion:profile.analysisVersion,inputHash:profile.audioHash}});ledger.push(e);return e;};
 const summary=add(`Browser-measured recording: ${profile.durationSeconds.toFixed(1)} seconds; average RMS ${profile.rmsDbfs.toFixed(1)} dBFS; resampled sample peak ${profile.peakDbfs.toFixed(1)} dBFS. Not perceived loudness or true peak.`,'audio.summary');
 const trend=levelTrend(profile);
 if(trend&&trend.direction!=='steady'){
  const e=add(`Average PCM level ${trend.direction} ${Math.abs(trend.deltaDb).toFixed(1)} dB from the first third to the last third, including silence.`,'audio.rmsEnvelope');
  claims.push(claim('track',profile.trackId,'AUDIO_LEVEL',e.summary,[e],'SUPPORTED',['Level is not emotional intensity, activity density or perceived loudness.']));
  if(meaning){const intent=evidence('CREATOR_MEANING',profile.trackId,'CREATOR',meaning,'creatorContext.meaning');ledger.push(intent);claims.push(claim('track',profile.trackId,'CONTEXT_AND_RECORDING',`You said “${meaning.slice(0,180)}”. The measured recording level ${trend.direction} toward the ending. These are separate observations; one does not confirm or contradict the other’s meaning.`,[intent,e],'TENTATIVE',['No automatic semantic agreement or disagreement is inferred.']));}
 }else claims.push(claim('track',profile.trackId,'AUDIO_SUMMARY',`${profile.durationSeconds.toFixed(1)} seconds measured. ${trend?'Average signal level stays within 3 dB between the opening and ending thirds.':'This short recording is measured without forcing a long-form trend.'}`,[summary],'SUPPORTED',['RMS measures signal amplitude, not perceived loudness.']));
 for(const change of profile.changeCandidates){
  const e=add(`A ${Math.abs(change.deltaDb).toFixed(1)} dB ${change.deltaDb>0?'rise':'fall'} between adjacent two-second RMS windows near ${change.timeSeconds}s.`,'audio.changeCandidates',change.timeSeconds);
  const moment=moments.filter(m=>m.type==='TURN'&&Math.abs(m.timeSeconds-change.timeSeconds)<=3).sort((a,b)=>Math.abs(a.timeSeconds-change.timeSeconds)-Math.abs(b.timeSeconds-change.timeSeconds))[0];
  if(moment){const m=evidence('CREATOR_MOMENT',profile.trackId,'CREATOR',`You marked TURN at ${moment.timeSeconds}s.`,`songMoments.${moment.id}`,{timeSeconds:moment.timeSeconds});ledger.push(m);claims.push(claim('track',profile.trackId,'MOMENT_AUDIO_ALIGNMENT',`Your marked turn at ${moment.timeSeconds}s is within 3 seconds of a measurable level-change candidate at ${change.timeSeconds}s.`,[m,e],'SUPPORTED',['Temporal proximity is not causation or proof of a narrative turn.']));break;}
 }
 return {ledger,claims:claims.slice(0,3)};
}
