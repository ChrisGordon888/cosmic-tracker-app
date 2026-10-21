const mongoose=require('mongoose');
const schema=new mongoose.Schema({ownerId:{type:String,required:true},subjectId:{type:mongoose.Schema.Types.ObjectId,required:true},subjectType:{type:String,default:'track'},leaseId:String,inputHash:String,engineVersion:String,promptVersion:String,provider:String,model:String,status:{type:String,enum:['RUNNING','READY','FAILED','STALE']},claims:{type:[mongoose.Schema.Types.Mixed],default:[]},evidence:{type:[mongoose.Schema.Types.Mixed],default:[]},questions:{type:[String],default:[]},errorMessage:String},{timestamps:true});
schema.index({ownerId:1,subjectId:1},{unique:true});
module.exports=mongoose.model('IntelligenceRun',schema);
