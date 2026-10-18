const crypto=require('node:crypto');
const Track=require('../models/ReleaseTrack'),World=require('../models/ReleaseWorld'),Run=require('../models/IntelligenceRun');
const provider=require('./groundedProvider');
const VERSION='grounded-v1';
const Audio=require('../models/AudioFeatureProfile');
const {currentProfile}=require('./audioFeatures');
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const eligible=ownerId=>({ownerId,catalogTreatment:{$nin:['vault','test']},status:{$ne:'archived'}});
async function snapshot(ownerId,trackId){
 if(!/^[a-f\d]{24}$/i.test(trackId))throw new Error('Invalid song.');
 const track=await Track.findOne({_id:trackId,...eligible(ownerId)}).select('title realmId creativeSignals creatorContext hook mood notes lyrics songMoments releaseWorldId trackNumber updatedAt audioUrl audioContentHash sourceFileSize').lean();
 if(!track)throw new Error('Song not found.');
 const world=track.releaseWorldId?await World.findOne({_id:track.releaseWorldId,ownerId,status:{$ne:'archived'}}).select('title story updatedAt').lean():null;
 const related=(track.creativeSignals||[]).length?await Track.find({...eligible(ownerId),_id:{$ne:track._id},creativeSignals:{$in:track.creativeSignals}}).select('title creativeSignals').sort({_id:1}).limit(60).lean():[];
 const ranked=related.map(t=>({id:String(t._id),title:t.title,shared:(t.creativeSignals||[]).filter(s=>track.creativeSignals.includes(s))})).filter(t=>t.shared.length>=2).sort((a,b)=>b.shared.length-a.shared.length||a.id.localeCompare(b.id)).slice(0,3);
 const audio=currentProfile(track,await Audio.findOne({ownerId,trackId}).lean());
 const evidence=[];let characters=0;
 function add(type,path,text,extra={}){if(!text||evidence.length>=240)return;const summary=String(text).slice(0,2000);if(characters+summary.length>36000)return;characters+=summary.length;const id=`ev-${hash({trackId,type,path,summary,extra})}`;evidence.push({id,type,subjectId:trackId,source:['REALM','PROJECT_POSITION','AUDIO_MEASUREMENT'].includes(type)?'STORED_FACT':type==='TRACK_RELATIONSHIP'?'DERIVED':'CREATOR',summary,sourcePath:path,provenance:{engineVersion:VERSION,inputHash:hash({summary,extra})},...extra});}
 add('CREATOR_CONTEXT','title',track.title);add('CREATOR_MEANING','creatorContext.meaning',track.creatorContext?.meaning);
 for(const field of ['emotionalStart','emotionalEnd','creatorRole','referenceNotes'])add(field==='creatorRole'?'CREATOR_ROLE':'CREATOR_CONTEXT',`creatorContext.${field}`,track.creatorContext?.[field]);
 for(const field of ['hook','mood','notes'])add(field==='hook'?'HOOK':'CREATOR_CONTEXT',field,track[field]);
 add('REALM','realmId',track.realmId==null?'Realm undecided':`Assigned Realm ${track.realmId}`);
 for(const signal of track.creativeSignals||[])add('FINGERPRINT_SIGNAL',`signals.${signal}`,`${signal} · explicit creator tag`);

 for(const m of (track.songMoments||[]).slice(0,40)){add('CREATOR_MOMENT',`songMoments.${m._id}`,`Creator marked ${m.type}: ${m.label||''} ${m.note||''}`,{timeSeconds:m.timeSeconds});add('CREATOR_LYRIC',`songMoments.${m._id}.lyricExcerpt`,m.lyricExcerpt,{timeSeconds:m.timeSeconds});}
 if(world){add('PROJECT_POSITION','releaseWorldId/trackNumber',`${world.title}, position ${track.trackNumber??'unknown'}`);add('PROJECT_STORY','project.story',world.story,{subjectId:String(world._id)});}
 for(const r of ranked)add('TRACK_RELATIONSHIP',`relationships.${r.id}`,`${r.title} shares explicit signals ${r.shared.join(', ')}; not acoustic similarity.`);
 if(audio)add('AUDIO_MEASUREMENT','audio.rms',`Owner-browser measurement of resampled PCM: duration ${audio.durationSeconds.toFixed(1)}s, RMS ${audio.rmsDbfs.toFixed(1)} dBFS, sample peak ${audio.peakDbfs.toFixed(1)} dBFS. Not LUFS, true peak, emotion, or sonic similarity.`);
 let lyricChars=0;(track.lyrics?.text||'').split('\n').forEach((line,i)=>{if(line.trim()&&i<300&&lyricChars+line.length<=16000){add('CREATOR_LYRIC',`lyrics.line.${i+1}`,line,{line:i+1});lyricChars+=line.length;}});
 return {trackId,evidence,inputHash:hash({version:VERSION,track,world,ranked,audio:audio?{audioHash:audio.audioHash,analysisVersion:audio.analysisVersion,rmsDbfs:audio.rmsDbfs,peakDbfs:audio.peakDbfs,durationSeconds:audio.durationSeconds}:null}),engineVersion:VERSION};
}
function display(run,current,config){
 let status=run?.status||'NOT_RUN';if(run&&(run.inputHash!==current.inputHash||run.promptVersion!==provider.PROMPT_VERSION||(config.model&&run.model!==config.model)))status='STALE';else if(status==='RUNNING'&&Date.now()-new Date(run.updatedAt).getTime()>90000)status='FAILED';
 return {available:config.available,provider:config.provider,model:config.model||run?.model||'',status,inputHash:current.inputHash,engineVersion:VERSION,promptVersion:provider.PROMPT_VERSION,claims:status==='READY'?run.claims:[],evidence:status==='READY'?run.evidence:current.evidence,questions:status==='READY'?run.questions:[],generatedAt:run?.updatedAt?.toISOString?.()||null,errorMessage:status==='FAILED'?'Reflection failed or timed out. You can retry.':null};
}
const recent=new Map();
module.exports={snapshot,display,hash,VERSION,
 async get(ownerId,id){const current=await snapshot(ownerId,id),run=await Run.findOne({ownerId,subjectId:id}).lean();return display(run,current,provider.configuration());},
 async reflect(ownerId,id,expectedHash){
  const current=await snapshot(ownerId,id),config=provider.configuration();if(!config.available)throw new Error('Model reflection is not configured.');if(expectedHash!==current.inputHash)throw new Error('Evidence changed. Refresh before reflecting.');
  const previous=await Run.findOne({ownerId,subjectId:id}).lean();if(previous?.status==='READY'&&previous.inputHash===current.inputHash&&previous.model===config.model&&previous.promptVersion===provider.PROMPT_VERSION)return display(previous,current,config);
  const now=Date.now();for(const [key,times] of recent){if(times.every(t=>now-t>=3600000))recent.delete(key);}
  const calls=(recent.get(ownerId)||[]).filter(t=>now-t<3600000);if(calls.length>=10)throw new Error('Reflection limit reached. Try again later.');
  if(previous?.status==='RUNNING'&&now-new Date(previous.updatedAt).getTime()<90000)return display(previous,current,config);
  const leaseId=crypto.randomUUID();let run;try{run=await Run.findOneAndUpdate({ownerId,subjectId:id,$or:[{status:{$ne:'RUNNING'}},{updatedAt:{$lt:new Date(now-90000)}}]},{$set:{status:'RUNNING',leaseId,inputHash:current.inputHash,engineVersion:VERSION,promptVersion:provider.PROMPT_VERSION,provider:config.provider,model:config.model,claims:[],evidence:[],questions:[],errorMessage:''}},{upsert:true,new:true});}catch(e){if(e.code===11000)throw new Error('Reflection already running.');throw e;}
  recent.set(ownerId,[...calls,now]);
  try{
   const result=await provider.reasonAboutSong(current);const fresh=await snapshot(ownerId,id);
   if(fresh.inputHash!==current.inputHash){await Run.updateOne({_id:run._id,ownerId,leaseId},{$set:{status:'STALE',claims:[],evidence:[]}});return display({...run.toObject(),status:'STALE'},fresh,config);}
   const claims=result.claims.map((c,i)=>({id:`model-${hash({hash:current.inputHash,c,i})}`,subjectType:'track',subjectId:id,claimType:c.type,statement:c.statement,evidenceIds:c.evidenceRefs,unknowns:c.unknowns,confidence:new Set(current.evidence.filter(e=>c.evidenceRefs.includes(e.id)).map(e=>e.type)).size>=2?'TENTATIVE':'LOW_EVIDENCE',sourceMode:'MODEL_ASSISTED',engineVersion:VERSION,inputHash:current.inputHash,generatedAt:new Date().toISOString()}));
   const saved=await Run.findOneAndUpdate({_id:run._id,ownerId,leaseId},{$set:{status:'READY',claims,evidence:current.evidence,questions:result.questions}},{new:true});if(!saved)throw new Error('Reflection lease expired.');return display(saved.toObject(),fresh,config);
  }catch{await Run.updateOne({_id:run._id,ownerId,leaseId},{$set:{status:'FAILED',claims:[],evidence:[],errorMessage:'Reflection failed.'}});return display({...run.toObject(),status:'FAILED'},current,config);}
 }
};
