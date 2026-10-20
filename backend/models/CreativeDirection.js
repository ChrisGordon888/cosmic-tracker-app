const mongoose = require('mongoose');
// inclusion:<trackId>/HIDDEN is an independent collection preference, not a creative direction.
// Separate from hypothesis usefulness: identity, aspiration and rejection are distinct intentions.
const schema = new mongoose.Schema({
 ownerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 targetId:{type:String,required:true},
 value:{type:String,enum:['RECOGNIZE','EXPLORE','STRETCH','ME','ASPIRE','NOT_NOW','HIDDEN'],required:true},
},{timestamps:true});
schema.index({ownerId:1,targetId:1},{unique:true});
module.exports=mongoose.models.CreativeDirection||mongoose.model('CreativeDirection',schema);
