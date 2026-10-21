const {z}=require('zod');
const crypto=require('node:crypto');
const Track=require('../models/ReleaseTrack');
const Profile=require('../models/AudioFeatureProfile');
const VERSION='pcm-perception-v2';
const db=z.number().finite().min(-120).max(12);
const MeasurementSchema=z.object({
 spectralCentroidHz:z.number().finite().min(0).max(8000).nullable(),highBandRatio:z.number().finite().min(0).max(1).nullable(),activityRisesPerSecond:z.number().finite().min(0).max(10).nullable(),spectralFrames:z.number().int().min(0).max(2400),
 audioHash:z.string().regex(/^[a-f0-9]{64}$/),analysisVersion:z.literal(VERSION),
 durationSeconds:z.number().positive().max(600),sampleRate:z.literal(16000),channelCount:z.number().int().min(1).max(2),
 rmsDbfs:db,peakDbfs:db,variationDb:z.number().finite().min(0).max(132),
 binSeconds:z.literal(1),rmsEnvelope:z.array(db).min(1).max(600),peaks:z.array(z.number().finite().min(0).max(4)).length(256),
 changeCandidates:z.array(z.object({timeSeconds:z.number().finite().min(2).max(598),deltaDb:z.number().finite().min(-132).max(132)}).strict()).max(5),
}).strict().superRefine((p,ctx)=>{
 if(p.rmsEnvelope.length!==Math.ceil(p.durationSeconds))ctx.addIssue({code:'custom',message:'Envelope does not match duration.'});
 if(p.peakDbfs+0.000001<p.rmsDbfs||p.changeCandidates.some(c=>c.timeSeconds>p.durationSeconds-2||Math.abs(c.deltaDb)<6))ctx.addIssue({code:'custom',message:'Inconsistent audio measurements.'});
});
function sourceIdentity(track){return crypto.createHash('sha256').update(JSON.stringify([String(track._id),track.audioUrl||'',track.audioContentHash||null,track.sourceFileSize??null])).digest('hex');}
async function owned(ownerId,trackId){
 if(!/^[a-f\d]{24}$/i.test(trackId))throw Error('Invalid song.');
 const track=await Track.findOne({_id:trackId,ownerId,catalogTreatment:{$nin:['vault','test']},status:{$ne:'archived'}}).select('ownerId audioUrl audioContentHash sourceFileSize').lean();
 if(!track)throw Error('Song not found.');return track;
}
function currentProfile(track,stored){return stored&&stored.sourceIdentity===sourceIdentity(track)&&stored.analysisVersion===VERSION?stored:null;}
async function state(ownerId,trackId){const track=await owned(ownerId,trackId),stored=await Profile.findOne({ownerId,trackId}).lean();return {source:{...track,id:String(track._id)},sourceIdentity:sourceIdentity(track),status:currentProfile(track,stored)?'READY':stored?'STALE':'NOT_ANALYZED',profile:currentProfile(track,stored)};}
async function save(ownerId,trackId,expectedSourceIdentity,input){
 const track=await owned(ownerId,trackId);
 if(!track.audioUrl||sourceIdentity(track)!==expectedSourceIdentity)throw Error('Audio source changed. Listen again.');
 if(track.sourceFileSize>16*1024*1024)throw Error('Audio exceeds the selected-song analysis limit.');
 const profile=MeasurementSchema.parse(input);
 if(track.audioContentHash&&track.audioContentHash!==profile.audioHash)throw Error('Downloaded audio differs from the saved source.');
 const saved=await Profile.findOneAndUpdate({ownerId,trackId},{$set:{...profile,sourceIdentity:expectedSourceIdentity,generatedAt:new Date(),toolchain:'browser-web-audio/worker-pcm',measurementOrigin:'OWNER_BROWSER'}},{upsert:true,new:true,runValidators:true});
 // Recheck after save: a simultaneous replacement cannot be presented as current.
 const fresh=await owned(ownerId,trackId);
 return {sourceIdentity:sourceIdentity(fresh),status:currentProfile(fresh,saved)?'READY':'STALE',profile:currentProfile(fresh,saved)};
}
module.exports={VERSION,MeasurementSchema,sourceIdentity,currentProfile,owned,state,save};
module.exports.list=async ownerId=>{
 const tracks=await Track.find({ownerId,catalogTreatment:{$nin:['vault','test']},status:{$ne:'archived'}}).select('audioUrl audioContentHash sourceFileSize').lean();
 const stored=await Profile.find({ownerId,trackId:{$in:tracks.map(t=>t._id)}}).lean();
 const byId=new Map(tracks.map(t=>[String(t._id),t]));
 return stored.filter(p=>{const track=byId.get(String(p.trackId));return track&&currentProfile(track,p);});
};
