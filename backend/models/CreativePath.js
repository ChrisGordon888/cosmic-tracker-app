const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 ownerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 a:{type:mongoose.Schema.Types.ObjectId,ref:'ReleaseTrack',required:true},
 b:{type:mongoose.Schema.Types.ObjectId,ref:'ReleaseTrack',required:true},
 note:{type:String,default:'',maxlength:1000},
},{timestamps:true});
// Unordered pair, normalized by the service; one intention per owner/pair.
schema.index({ownerId:1,a:1,b:1},{unique:true});
module.exports=mongoose.models.CreativePath||mongoose.model('CreativePath',schema);
