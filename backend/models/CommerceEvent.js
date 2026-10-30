const mongoose=require('mongoose');
const schema=new mongoose.Schema({ownerId:{type:String,required:true},eventId:{type:String,required:true},slug:String,kind:{type:String,enum:['visit','cta','affiliate-outbound','beatstars-outbound']},campaign:String,createdAt:{type:Date,default:Date.now}},{versionKey:false});
schema.index({ownerId:1,eventId:1},{unique:true});schema.index({createdAt:1},{expireAfterSeconds:7776000});schema.index({ownerId:1,slug:1,createdAt:1});
module.exports=mongoose.model('CommerceEvent',schema);
