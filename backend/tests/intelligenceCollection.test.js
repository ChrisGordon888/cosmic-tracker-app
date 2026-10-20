const test=require('node:test'),assert=require('node:assert/strict');
const service=require('../lib/intelligenceCollection'),directions=require('../lib/creativeDirection'),Preference=require('../models/CreativeDirection'),Track=require('../models/ReleaseTrack'),resolvers=require('../resolvers');
const id='aaaaaaaaaaaaaaaaaaaaaaaa',foreignId='bbbbbbbbbbbbbbbbbbbbbbbb';
test('Collection inclusion is owner scoped, idempotent and independent of catalog and direction reset',async()=>{
 const originals=[Track.exists,Track.updateOne,Preference.find,Preference.findOneAndUpdate,Preference.deleteOne,Preference.deleteMany];
 const catalog={id,ownerId:'owner',realmId:0,releaseWorldId:'world',visibility:'private',publicCanon:true,status:'draft',audioUrl:'unchanged'};const before=JSON.stringify(catalog);
 let rows=[{ownerId:'owner',targetId:id,value:'ASPIRE'}];
 const matches=(row,q)=>row.ownerId===q.ownerId&&(!q.targetId||(q.targetId instanceof RegExp?q.targetId.test(row.targetId):q.targetId.$not?!q.targetId.$not.test(row.targetId):row.targetId===q.targetId))&&(!q.value||row.value===q.value);
 Track.exists=async q=>q._id===id&&q.ownerId==='owner'; Track.updateOne=()=>assert.fail('must never mutate track');
 Preference.find=q=>({select(){return this;},lean:async()=>rows.filter(r=>matches(r,q)).map(r=>({...r}))});
 Preference.findOneAndUpdate=async(q,u)=>{rows=rows.filter(r=>!matches(r,q));rows.push({...q,...u.$set});};
 Preference.deleteOne=Preference.deleteMany=async q=>{rows=rows.filter(r=>!matches(r,q));};
 try{
  await assert.rejects(()=>service.setIncluded('foreign',{trackId:id,included:false}));
  await assert.rejects(()=>service.setIncluded('foreign',{trackId:id,included:true}));
  await assert.rejects(()=>service.setIncluded('owner',{trackId:foreignId,included:false}));
  assert.deepEqual(await service.setIncluded('owner',{trackId:id,included:false}),[id]);
  await service.setIncluded('owner',{trackId:id.toUpperCase(),included:false});assert.equal(rows.length,2);
  assert.deepEqual(await service.listHidden('foreign'),[]);
  assert.equal((await directions.list('owner'))[0].value,'ASPIRE');
  await directions.reset('owner');assert.deepEqual(await service.listHidden('owner'),[id]);
  assert.deepEqual(await service.setIncluded('owner',{trackId:id,included:true}),[]);assert.equal(JSON.stringify(catalog),before);
  assert.throws(()=>service.inputSchema.parse({trackId:id,included:false,ownerId:'foreign'}));
  assert.throws(()=>service.inputSchema.parse({trackId:id,included:'false'}));
  for(const user of [undefined,{id:'owner',role:'listener'}]){
   await assert.rejects(()=>resolvers.Query.myIntelligenceHiddenTrackIds(null,{}, {user}));
   await assert.rejects(()=>resolvers.Mutation.setIntelligenceInclusion(null,{trackId:id,included:false},{user}));
  }
 }finally{[Track.exists,Track.updateOne,Preference.find,Preference.findOneAndUpdate,Preference.deleteOne,Preference.deleteMany]=originals;}
});
