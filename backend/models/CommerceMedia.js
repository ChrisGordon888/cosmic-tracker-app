const mongoose = require('mongoose');
const schema = new mongoose.Schema({
 ownerId:{type:String,required:true,index:true},slug:{type:String,required:true},title:String,description:String,
 url:String,thumbnail:String,topic:String,order:{type:Number,default:0},status:{type:String,default:'draft'},
 worldId:String,trackId:String,offerSlug:String,service:String,revision:{type:Number,default:0},
},{timestamps:true});
schema.index({ownerId:1,slug:1},{unique:true});
module.exports=mongoose.model('CommerceMedia',schema);
