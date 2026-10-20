const test=require('node:test'),assert=require('node:assert/strict');
const service=require('../lib/creativeExperiments'),Model=require('../models/CreativeExperiment'),Track=require('../models/ReleaseTrack'),inclusion=require('../lib/intelligenceCollection'),resolvers=require('../resolvers');
const a='aaaaaaaaaaaaaaaaaaaaaaaa',b='bbbbbbbbbbbbbbbbbbbbbbbb',c='cccccccccccccccccccccccc',eid='dddddddddddddddddddddddd';
test('experiment inputs are bounded, ordered, distinct and cannot supply owner/provenance',()=>{
 assert.deepEqual(service.inputSchema.parse({trackIds:[b,a]}).trackIds,[b,a]);
 for(const input of [{trackIds:[]},{trackIds:[a,a]},{trackIds:[a],ownerId:'other'},{trackIds:[a],provenance:'MODEL'},{trackIds:[a],title:'a'.repeat(121)},{trackIds:['invalid']}])assert.throws(()=>service.inputSchema.parse(input));
});
test('private drafts preserve unavailable slots, enforce ownership and never modify catalog',async()=>{
 const old=[Model.find,Model.create,Model.findOneAndUpdate,Model.deleteOne,Track.find,inclusion.listHidden,Track.updateOne];let rows=[],hidden=[],allowed=[a,b,c];
 inclusion.listHidden=async()=>hidden;
 Track.find=q=>{assert.equal(q.status.$ne,'archived');assert.deepEqual(q.catalogTreatment.$nin,['vault','test']);return {select(){return this},lean:async()=>q.ownerId==='owner'?allowed.filter(id=>!hidden.includes(id)).map(_id=>({_id})):[]}};
 Track.updateOne=()=>{throw Error('Catalog must not be written')};
 Model.find=q=>({sort(){return this},lean:async()=>rows.filter(r=>r.ownerId===q.ownerId)});
 Model.create=async values=>{const row={...values,_id:eid,createdAt:new Date(),updatedAt:new Date()};rows.push(row);return row};
 Model.findOneAndUpdate=(q,u)=>({lean:async()=>{const row=rows.find(r=>r._id===q._id&&r.ownerId===q.ownerId);if(row)Object.assign(row,u.$set);return row}});
 Model.deleteOne=async q=>{const before=rows.length;rows=rows.filter(r=>r._id!==q._id||r.ownerId!==q.ownerId);return {deletedCount:before-rows.length}};
 try{
  await assert.rejects(()=>service.save('other',{trackIds:[a]}));
  const saved=await service.save('owner',{title:'Idea',trackIds:[b,a,c]});assert.equal(saved.provenance,'CREATOR_SAVED_SEQUENCE');
  assert.deepEqual(saved.slots.map(s=>s.trackId),[b,a,c]);assert.equal((await service.list('other')).length,0);
  await assert.rejects(()=>service.save('other',{id:eid,trackIds:[a]}));await assert.rejects(()=>service.remove('other',eid));
  hidden=[a];allowed=[a,b];const unavailable=(await service.list('owner'))[0];assert.deepEqual(unavailable.slots.map(s=>s.trackId),[b,null,null]);assert.deepEqual(rows[0].trackIds,[b,a,c]);
  await assert.rejects(()=>service.save('owner',{id:eid,trackIds:[a,b]}));assert.deepEqual(rows[0].trackIds,[b,a,c]);
  await service.save('owner',{id:eid,trackIds:[b],note:'Explicitly removed unavailable places'});assert.deepEqual(rows[0].trackIds,[b]);
  await service.remove('owner',eid);assert.equal(rows.length,0);
  await assert.rejects(()=>resolvers.Query.myCreativeExperiments(null,{},{}));
  await assert.rejects(()=>resolvers.Mutation.saveCreativeExperiment(null,{input:{trackIds:[a]}},{}));
  await assert.rejects(()=>resolvers.Mutation.deleteCreativeExperiment(null,{id:eid},{}));
 }finally{[Model.find,Model.create,Model.findOneAndUpdate,Model.deleteOne,Track.find,inclusion.listHidden,Track.updateOne]=old;}
});
test('experiment GraphQL documents validate against server schema',()=>{
 const fs=require('fs'),{buildASTSchema,parse,validate}=require('graphql');const schema=require('../schemas');
 const built=buildASTSchema(schema);const source=fs.readFileSync(require('path').join(__dirname,'../../frontend/src/graphql/intelligence.ts'),'utf8');
 for(const match of source.matchAll(/gql`([\s\S]*?)`/g))assert.deepEqual(validate(built,parse(match[1])),[]);
});
