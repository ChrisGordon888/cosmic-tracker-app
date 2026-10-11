// Default: read-only. Apply requires local replica-set transactions; no fallback writes.
const path=require('node:path'),fs=require('node:fs');
require('dotenv').config({path:path.join(__dirname,'../.env')});
const mongoose=require('mongoose');
const {planMigration,worldDocument,assertLocalApply}=require('../lib/curatedWorldMigration');
const args=process.argv.slice(2),value=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
const ownerId=value('--owner'),profileId=value('--profile'),database=value('--database'),apply=args.includes('--apply');
const uri=process.env.MONGODB_URI;
(async()=>{try{
 if(!ownerId||!profileId||!database)throw new Error('Usage: --owner ID --profile ID --database NAME [--apply]. Default is dry-run.');
 if(apply)assertLocalApply(uri,database);
 await mongoose.connect(uri,{dbName:database,autoIndex:false,autoCreate:false,serverSelectionTimeoutMS:7000});
 const db=mongoose.connection.db;
 const read=async session=>({ownerId,profileId,profiles:await db.collection('creativeprofiles').find({ownerId},{session,projection:{ownerId:1}}).toArray(),worlds:await db.collection('releaseworlds').find({ownerId},{session,projection:{ownerId:1,title:1,slug:1}}).toArray(),tracks:await db.collection('releasetracks').find({ownerId},{session,projection:{ownerId:1,legacyRegistryId:1,releaseWorldId:1,realmId:1,isFocusTrack:1,updatedAt:1}}).toArray(),artworkExists:url=>fs.existsSync(path.join(__dirname,'../../frontend/public',url))});
 let plans=planMigration(await read());
 const report=plans.map(p=>({title:p.candidate.title,status:p.status,issues:p.issues,trackIds:p.trackIds,worldId:p.worldId}));
 console.log(JSON.stringify({mode:apply?'local-apply':'dry-run',candidates:report},null,2));
 if(apply){
  const indexes=await db.collection('releaseworlds').indexes();
  if(!indexes.some(i=>i.unique&&i.key.ownerId===1&&i.key.slug===1&&Object.keys(i.key).length===2))throw new Error('Existing unique ownerId/slug index is required; no index is created by this script.');
  for(const plan of plans.filter(p=>p.status==='ready')){
   const session=await mongoose.startSession();
   try{await session.withTransaction(async()=>{
    const fresh=planMigration(await read(session)).find(p=>p.candidate.id===plan.candidate.id);
    if(fresh.status==='exists')return;
    if(fresh.status!=='ready')throw new Error(`Changed state: ${plan.candidate.title}; rerun audit.`);
    const world=worldDocument(fresh,ownerId,new mongoose.Types.ObjectId(profileId),new Date());world._id=new mongoose.Types.ObjectId();
    await db.collection('releaseworlds').insertOne(world,{session});
    for(const [index,track] of fresh.tracks.entries()){
      const result=await db.collection('releasetracks').updateOne({_id:track._id,ownerId,releaseWorldId:null,updatedAt:track.updatedAt},{$set:{releaseWorldId:world._id,trackNumber:index+1,updatedAt:new Date()}},{session});
      if(result.modifiedCount!==1)throw new Error('Track relationship changed; transaction rolled back.');
    }
   });console.log(`Created or already present: ${plan.candidate.title}`);}finally{await session.endSession();}
  }
 }
}catch(error){console.error(error.message);process.exitCode=1;}finally{await mongoose.disconnect();}})();
