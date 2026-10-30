const mongoose=require('mongoose');
const schema=new mongoose.Schema({ownerId:{type:String,required:true,index:true},slug:{type:String,required:true},title:String,description:String,category:String,provider:String,artwork:String,pricing:String,merchant:String,recommendation:String,affiliateConfirmed:Boolean,destination:String,display:String,cta:String,status:{type:String,default:'draft'},featured:{type:Number,default:0},included:String,evidence:String,faq:String,campaigns:[String],revision:{type:Number,default:0}},{timestamps:true});
schema.index({ownerId:1,slug:1},{unique:true});
module.exports=mongoose.model('CommerceOffering',schema);
