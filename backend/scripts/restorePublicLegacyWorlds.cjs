// Explicit 2026-10-12 authorization: four public, non-Canon Worlds only.
// Default dry-run. --apply uses one transaction; --verify is read-only.
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
require('dotenv').config({path:path.join(__dirname,'../.env'),quiet:true});
const mongoose = require('mongoose');
const {planMigration,worldDocument,PUBLIC_RESTORATION_IDS} = require('../lib/curatedWorldMigration');
const ownerId = '6a07c846d22cce3a5b753a8d';
const profileId = '6a374e14d57265c6788eaff0';
const pinned = {"Break the Code": ["6a834e19bf1fd9c09c19168b", "6a834e19bf1fd9c09c19168e", "6a834e19bf1fd9c09c191692"], "Glory & Command": ["6a834e1bbf1fd9c09c1916cf", "6a834e1bbf1fd9c09c1916cb", "6a834e1bbf1fd9c09c1916c9"], "The Price of Focus": ["6a834e1cbf1fd9c09c1916d5", "6a834e1cbf1fd9c09c1916d7", "6a834e1bbf1fd9c09c1916d3"], "Same Self, Higher Form": ["6a834e1cbf1fd9c09c1916dd", "6a834e1cbf1fd9c09c1916d9", "6a834e1cbf1fd9c09c1916db"]};
const sinId = '6a374e55d57265c6788eb357';
const sinTracks = ['6a3e941a1dd57fdd0197c3a3','6a3eb2e59f7358347d6be1af','6a3ed590d84bc0637c420278','6a3eb4299f7358347d6be33b','6a3e99e077c5fa4246035080','6a3eb4ce9f7358347d6be401'];
const projection = Object.fromEntries(['ownerId','title','slug','legacyRegistryId','releaseWorldId','trackNumber','realmId','isFocusTrack','visibility','isPublic','publicCanon','catalogTreatment','lifecycle','status','accessTier','playbackStatus','unlockDate','dropDate','showInNexus','nexusReviewStatus','updatedAt'].map(k=>[k,1]));
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const protectedTracks = tracks => tracks.map(t => Object.fromEntries(Object.entries(t).filter(([k])=>!['releaseWorldId','trackNumber','updatedAt'].includes(k))));
function plansFor(state) {
 return planMigration({...state,ownerId,profileId,publicRestoration:true,artworkExists:url=>fs.existsSync(path.join(__dirname,'../../frontend/public',url))}).filter(p=>PUBLIC_RESTORATION_IDS.includes(p.candidate.id));
}
function validatePlans(plans,state) {
 assert.equal(plans.length,4);
 for(const p of plans){
  const sequence=p.status==='exists'?state.tracks.filter(t=>String(t.releaseWorldId)===p.worldId).sort((a,b)=>a.trackNumber-b.trackNumber).map(t=>String(t._id)):p.trackIds;
  assert.deepEqual(sequence,pinned[p.candidate.title],`Exact audited IDs required: ${p.candidate.title}`);
  assert.ok(['ready','exists'].includes(p.status),`${p.candidate.title}: ${p.issues.join('; ')}`);
  if(p.status==='exists'){
   const w=state.worlds.find(w=>String(w._id)===p.worldId);
   assert.equal(w.visibility,'public');assert.equal(w.publicCanon,false);assert.equal(w.isFeatured,false);
  }
 }
 const sin=state.tracks.filter(t=>String(t.releaseWorldId)===sinId).sort((a,b)=>a.trackNumber-b.trackNumber);
 assert.deepEqual(sin.map(t=>String(t._id)),sinTracks,'SIN sequence must remain intact');
}
(async()=>{try{
 await mongoose.connect(process.env.MONGODB_URI,{autoIndex:false,autoCreate:false,serverSelectionTimeoutMS:10000});
 const db=mongoose.connection.db;
 async function read(session){return {
  profiles:await db.collection('creativeprofiles').find({ownerId},{session,projection:{ownerId:1}}).toArray(),
  // Also inspect matching slugs across owners: public slug routing is global.
  worlds:await db.collection('releaseworlds').find({$or:[{ownerId},{slug:{$in:PUBLIC_RESTORATION_IDS}}]},{session,projection:{ownerId:1,creativeProfileId:1,title:1,slug:1,status:1,visibility:1,publicCanon:1,isFeatured:1,updatedAt:1}}).sort({_id:1}).toArray(),
  tracks:await db.collection('releasetracks').find({ownerId},{session,projection}).sort({_id:1}).toArray(),
  editorial:await db.collection('nexuseditorialconfigs').find({},{session,projection:{selectedWorldIds:1,featuredTrackId:1,updatedAt:1}}).sort({_id:1}).toArray(),
 };}
 const before=await read();const plans=plansFor(before);validatePlans(plans,before);
 assert.ok(!before.worlds.some(w=>w.ownerId!==ownerId),'A requested public slug belongs to another owner');
 console.log(JSON.stringify({mode:process.argv.includes('--apply')?'apply':process.argv.includes('--verify')?'verify':'dry-run',plans:plans.map(p=>({title:p.candidate.title,status:p.status,trackIds:pinned[p.candidate.title],visibility:'public',publicCanon:false,isFeatured:false}))},null,2));
 if(process.argv.includes('--apply')){
  const indexes=await db.collection('releaseworlds').indexes();
  assert.ok(indexes.some(i=>i.unique&&i.key.ownerId===1&&i.key.slug===1&&Object.keys(i.key).length===2),'Existing unique owner/slug index required');
  const session=await mongoose.startSession();
  try{await session.withTransaction(async()=>{
   const fresh=await read(session);assert.equal(digest(fresh),digest(before),'State changed after dry-run; retry');
   const freshPlans=plansFor(fresh);validatePlans(freshPlans,fresh);
   for(const p of freshPlans.filter(p=>p.status==='ready')){
    const now=new Date(),world=worldDocument(p,ownerId,new mongoose.Types.ObjectId(profileId),now);world._id=new mongoose.Types.ObjectId();
    await db.collection('releaseworlds').insertOne(world,{session});
    for(const [i,t] of p.tracks.entries()){
     const result=await db.collection('releasetracks').updateOne({_id:t._id,ownerId,releaseWorldId:null,updatedAt:t.updatedAt},{$set:{releaseWorldId:world._id,trackNumber:i+1,updatedAt:now}},{session});
     assert.equal(result.modifiedCount,1,'Membership changed; abort');
    }
   }
   const after=await read(session);validatePlans(plansFor(after),after);
   assert.equal(digest(protectedTracks(after.tracks)),digest(protectedTracks(before.tracks)),'Protected child state changed');
   assert.equal(digest(after.editorial),digest(before.editorial),'Editorial configuration changed');
   assert.equal(digest(after.worlds.filter(w=>before.worlds.some(b=>String(b._id)===String(w._id)))),digest(before.worlds),'Existing Worlds changed');
   const untouched=rows=>rows.filter(t=>!Object.values(pinned).flat().includes(String(t._id)));
   assert.equal(digest(untouched(after.tracks)),digest(untouched(before.tracks)),'Unrelated tracks changed');
  },{readConcern:{level:'snapshot'},writeConcern:{w:'majority'}});}finally{await session.endSession();}
 }
 if(process.argv.includes('--apply')||process.argv.includes('--verify')){
  const after=await read();const finalPlans=plansFor(after);validatePlans(finalPlans,after);assert.ok(finalPlans.every(p=>p.status==='exists'));
  const r=require('../resolvers');
  const rows=[];
  for(const p of finalPlans){
   const w=after.worlds.find(w=>String(w._id)===p.worldId);
   const publicTracks=await r.Query.getPublicReleaseTracks(null,{releaseWorldId:w._id});
   assert.ok(publicTracks.every(t=>t.visibility==='public'||t.visibility==='listed'),'Private child exposed');
   const expected=after.tracks.filter(t=>String(t.releaseWorldId)===p.worldId&&['public','listed'].includes(t.visibility)).sort((a,b)=>a.trackNumber-b.trackNumber);
   assert.deepEqual(publicTracks.map(t=>String(t._id)),expected.map(t=>String(t._id)));
   assert.ok(!after.editorial.some(c=>(c.selectedWorldIds||[]).some(id=>String(id)===p.worldId)));
   rows.push({title:w.title,id:p.worldId,path:'/releases/'+w.slug,visibility:w.visibility,publicCanon:w.publicCanon,isFeatured:w.isFeatured,publicTracks:publicTracks.map(t=>({id:String(t._id),title:t.title,realmId:t.realmId,visibility:t.visibility,accessTier:t.accessTier,playbackStatus:t.playbackStatus,hasAudio:Boolean(t.audioUrl)})),privateTracks:3-publicTracks.length});
  }
  console.log(JSON.stringify({verified:rows,idempotent:true,created:process.argv.includes('--apply')?plans.filter(p=>p.status==='ready').length:0,protectedStatePreserved:process.argv.includes('--apply')?true:undefined},null,2));
 }
}catch(e){console.error(e.message);process.exitCode=1;}finally{await mongoose.disconnect();}})();
