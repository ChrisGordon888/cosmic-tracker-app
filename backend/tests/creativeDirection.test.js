const test=require('node:test'),assert=require('node:assert/strict');
const service=require('../lib/creativeDirection'),Direction=require('../models/CreativeDirection'),Track=require('../models/ReleaseTrack'),resolvers=require('../resolvers');
const id='aaaaaaaaaaaaaaaaaaaaaaaa';
test('Direction values remain distinct and valid only for their target',()=>{
 for(const value of ['ME','ASPIRE','NOT_NOW'])assert.equal(service.inputSchema.parse({targetId:id,value}).value,value);
 for(const input of [{targetId:'orientation',value:'ME'},{targetId:id,value:'STRETCH'},{targetId:id,value:'LIKE'},{targetId:'bad',value:null},{targetId:id,value:'ME',ownerId:'foreign'}])assert.throws(()=>service.inputSchema.parse(input));
});
test('Directions are owner scoped, editable, clearable and resettable without touching tracks',async()=>{
 const old=[Track.exists,Direction.find,Direction.findOneAndUpdate,Direction.deleteOne,Direction.deleteMany];let rows=[],writes=0;
 Track.exists=async q=>{assert.deepEqual(q.catalogTreatment,{$nin:['vault','test']});assert.equal(q.status.$ne,'archived');return q.ownerId==='owner'&&q._id===id;};
 Direction.find=q=>({select(){return this;},lean:async()=>rows.filter(r=>r.ownerId===q.ownerId)});
 Direction.findOneAndUpdate=async(q,u)=>{rows=rows.filter(r=>r.ownerId!==q.ownerId||r.targetId!==q.targetId);rows.push({...q,...u.$set});writes++;};
 Direction.deleteOne=async q=>{rows=rows.filter(r=>r.ownerId!==q.ownerId||r.targetId!==q.targetId);};
 Direction.deleteMany=async q=>{rows=rows.filter(r=>r.ownerId!==q.ownerId);};
 try{
  await assert.rejects(()=>service.save('foreign',{targetId:id,value:'ME'}));assert.equal(writes,0);
  assert.equal((await service.save('owner',{targetId:id,value:'ME'}))[0].value,'ME');
  assert.equal((await service.save('owner',{targetId:id,value:'ASPIRE'}))[0].value,'ASPIRE');assert.equal(rows.length,1);
  assert.equal((await service.list('foreign')).length,0);
  await service.save('foreign',{targetId:'orientation',value:'STRETCH'});
  await service.save('owner',{targetId:id,value:null});assert.equal((await service.list('owner')).length,0);
  await service.save('owner',{targetId:'orientation',value:'RECOGNIZE'});await service.reset('owner');assert.equal(rows.length,1);assert.equal(rows[0].ownerId,'foreign');
  await assert.rejects(()=>resolvers.Query.myCreativeDirections(null,{},{}));
  await assert.rejects(()=>resolvers.Mutation.saveCreativeDirection(null,{input:{targetId:id,value:'ME'}},{}));
  await assert.rejects(()=>resolvers.Mutation.resetCreativeDirections(null,{},{}));
 }finally{[Track.exists,Direction.find,Direction.findOneAndUpdate,Direction.deleteOne,Direction.deleteMany]=old;}
});
test('Frontend Intelligence GraphQL documents validate against the actual schema',()=>{
 const {buildASTSchema,parse,validate}=require('graphql'),fs=require('node:fs');
 const schema=buildASTSchema(require('../schemas'));
 const text=fs.readFileSync(require('node:path').join(__dirname,'../../frontend/src/graphql/intelligence.ts'),'utf8');
 for(const match of text.matchAll(/gql`([\s\S]*?)`/g))assert.deepEqual(validate(schema,parse(match[1])).map(e=>e.message),[]);
});
