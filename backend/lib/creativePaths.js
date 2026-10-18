const {z}=require('zod');
const Path=require('../models/CreativePath');
const Track=require('../models/ReleaseTrack');
const id=z.string().regex(/^[a-f0-9]{24}$/i).transform(s=>s.toLowerCase());
const inputSchema=z.object({a:id,b:id,note:z.string().trim().max(1000).default('')}).strict().refine(v=>v.a!==v.b,{message:'Choose two different songs.'});
const eligible=ownerId=>({ownerId,catalogTreatment:{$nin:['vault','test']},status:{$ne:'archived'}});
async function list(ownerId){
 const tracks=await Track.find(eligible(ownerId)).select('_id').lean();
 const ids=tracks.map(t=>t._id);
 return Path.find({ownerId,a:{$in:ids},b:{$in:ids}}).sort({createdAt:1}).lean();
}
async function save(ownerId,input){
 const parsed=inputSchema.parse(input),[a,b]=[parsed.a,parsed.b].sort();
 const tracks=await Track.countDocuments({...eligible(ownerId),_id:{$in:[a,b]}});
 if(tracks!==2)throw Error('Two current owned songs are required.');
 try{await Path.findOneAndUpdate({ownerId,a,b},{$set:{note:parsed.note}},{upsert:true,new:true,runValidators:true});}
 catch(error){if(error.code!==11000)throw error;await Path.updateOne({ownerId,a,b},{$set:{note:parsed.note}},{runValidators:true});}
 return list(ownerId);
}
async function remove(ownerId,pathId){await Path.deleteOne({_id:id.parse(pathId),ownerId});return list(ownerId);}
module.exports={inputSchema,list,save,remove};
