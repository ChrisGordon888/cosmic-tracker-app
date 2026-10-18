const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 ownerId:{type:String,required:true},trackId:{type:mongoose.Schema.Types.ObjectId,required:true},
 sourceIdentity:{type:String,required:true},audioHash:{type:String,required:true},analysisVersion:{type:String,required:true},generatedAt:Date,
 toolchain:String,measurementOrigin:{type:String,enum:['OWNER_BROWSER'],required:true},
 durationSeconds:Number,sampleRate:Number,channelCount:Number,rmsDbfs:Number,peakDbfs:Number,variationDb:Number,binSeconds:Number,
 rmsEnvelope:[Number],peaks:[Number],changeCandidates:[{_id:false,timeSeconds:Number,deltaDb:Number}],
},{timestamps:true});
schema.index({ownerId:1,trackId:1},{unique:true});
module.exports=mongoose.model('AudioFeatureProfile',schema);
