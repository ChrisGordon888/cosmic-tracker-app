const {z}=require('zod');
const Direction=require('../models/CreativeDirection');
const Track=require('../models/ReleaseTrack');
const inputSchema=z.object({targetId:z.string().regex(/^(orientation|[a-f0-9]{24})$/i),value:z.enum(['RECOGNIZE','EXPLORE','STRETCH','ME','ASPIRE','NOT_NOW']).nullable()}).strict().refine(i=>i.value===null||(i.targetId==='orientation'?['RECOGNIZE','EXPLORE','STRETCH'].includes(i.value):['ME','ASPIRE','NOT_NOW'].includes(i.value)),{message:'Direction does not match its target.'});
async function list(ownerId){return Direction.find({ownerId}).select('targetId value').lean();}
async function save(ownerId,input){
 const {targetId,value}=inputSchema.parse(input);
 if(targetId!=='orientation'&&value!==null){
  const owned=await Track.exists({_id:targetId,ownerId,catalogTreatment:{$nin:['vault','test']},status:{$ne:'archived'}});
  if(!owned)throw Error('Current owned song required.');
 }
 if(value===null)await Direction.deleteOne({ownerId,targetId});
 else await Direction.findOneAndUpdate({ownerId,targetId},{$set:{value}},{upsert:true,new:true,runValidators:true});
 return list(ownerId);
}
async function reset(ownerId){await Direction.deleteMany({ownerId});return [];}
module.exports={inputSchema,list,save,reset};
