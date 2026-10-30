const mongoose=require('mongoose');
const schema=new mongoose.Schema({ownerId:{type:String,required:true},type:{type:String,required:true},enabled:{type:Boolean,default:false},destination:String,embedUrl:String,allowedHosts:[String],revision:{type:Number,default:0}},{timestamps:true});
schema.index({ownerId:1,type:1},{unique:true});
module.exports=mongoose.model('CommerceProvider',schema);
