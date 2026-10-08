const test=require('node:test'),assert=require('node:assert/strict');
const {curationUpdate}=require('../lib/publicCanon');const r=require('../resolvers'),T=require('../models/ReleaseTrack'),W=require('../models/ReleaseWorld'),C=require('../models/NexusEditorialConfig');
const user={id:'a',role:'creator',creatorStatus:'active'},stamp=new Date('2026-10-07');
test('Canon is explicit; private archive preserves Current, lifecycle, projects and evidence',()=>{
 const t={catalogTreatment:'current',status:'demo'};
 assert.deepEqual(curationUpdate(t,'canon'),{publicCanon:true,visibility:'public',isPublic:true});
 for(const choice of ['listed','private','sandbox']){const u=curationUpdate(t,choice);assert.equal(u.publicCanon,false);assert.equal(u.showInNexus,false);assert.equal(u.nexusReviewStatus,'draft');assert.ok(!('releaseWorldId'in u));assert.ok(!('creativeSignals'in u));assert.ok(!('status'in u));}
 assert.equal(curationUpdate(t,'private').catalogTreatment,undefined);assert.equal(curationUpdate(t,'listed').visibility,'listed');assert.equal(curationUpdate(t,'sandbox').catalogTreatment,'test');
 for(const t of [{status:'archived'},{catalogTreatment:'test'},{catalogTreatment:'vault'}])assert.throws(()=>curationUpdate(t,'canon'),/Current/);
});
test('Atomic curation enforces owner, timestamp and confirmation, preserves original file and project',async()=>{
 const old=[T.findOne,T.findOneAndUpdate,C.findOne];const t={_id:'t',ownerId:'a',updatedAt:stamp,audioUrl:'/original',releaseWorldId:'world',status:'demo'};
 try{T.findOne=async q=>q.ownerId==='a'?t:null;C.findOne=async()=>null;T.findOneAndUpdate=async(q,u)=>{assert.equal(q.ownerId,'a');assert.equal(q.updatedAt,stamp);return {...t,...u.$set};};
 const args={id:'t',expectedUpdatedAt:stamp.toISOString(),choice:'private',confirmImpact:true};
 const result=await r.Mutation.curatePublicTrack(null,args,{user});assert.equal(result.audioUrl,'/original');assert.equal(result.releaseWorldId,'world');assert.equal(result.visibility,'private');
 await assert.rejects(r.Mutation.curatePublicTrack(null,{...args,confirmImpact:false},{user}),/Confirm/);
 await assert.rejects(r.Mutation.curatePublicTrack(null,{...args,expectedUpdatedAt:'2020-01-01'},{user}),/changed/);
 await assert.rejects(r.Mutation.curatePublicTrack(null,args,{user:{...user,id:'b'}}),/not found/);
 }finally{[T.findOne,T.findOneAndUpdate,C.findOne]=old;}
});
test('Listed direct access remains subject to audio gates; private and Sandbox cannot play anonymously',async()=>{
 const old=T.findOne;try{T.findOne=async q=>{assert.deepEqual(q.visibility,{$in:['public','listed']});assert.deepEqual(q.catalogTreatment,{$nin:['vault','test']});return {visibility:'listed',audioUrl:'/audio',accessTier:'public',playbackStatus:'playable',ownerId:'a'};};const t=await r.Query.getShareableTrack(null,{id:'t'});assert.equal(r.ReleaseTrack.audioUrl(t,null,{}),'/audio');for(const other of [{...t,visibility:'private'},{...t,catalogTreatment:'test'},{...t,accessTier:'signup'}])assert.equal(r.ReleaseTrack.audioUrl(other,null,{}),null);}finally{T.findOne=old;}
});
test('Discovery excludes deliberately non-Canon tracks and hidden worlds without changing direct Release World query',async()=>{
 const old=[W.find,T.find];try{W.find=q=>({sort:async()=>[],distinct:async()=>{assert.deepEqual(q.publicCanon,{$ne:false});return ['world'];}});T.find=q=>({sort:async()=>{assert.deepEqual(q.publicCanon,{$ne:false});return [];}});await r.Query.getPublicNexusTracks(null,{});}finally{[W.find,T.find]=old;}
});
test('Project selection changes only bounded presentation field with owner/concurrency guard',async()=>{const old=W.findOneAndUpdate;try{W.findOneAndUpdate=async(q,u)=>{assert.equal(q.ownerId,'a');assert.equal(q.updatedAt.getTime(),stamp.getTime());assert.deepEqual(u,{$set:{publicCanon:false}});return {id:'world'};};await r.Mutation.curatePublicWorld(null,{id:'world',expectedUpdatedAt:stamp.toISOString(),selected:false},{user});}finally{W.findOneAndUpdate=old;}});
test('New frontend GraphQL documents match the executable schema',()=>{
 const {makeExecutableSchema}=require('@graphql-tools/schema'),{parse,validate}=require('graphql'),fs=require('node:fs');
 const schema=makeExecutableSchema({typeDefs:require('../schemas'),resolvers:r});
 for(const file of ['frontend/src/components/creator/PublicCurationReview.tsx','frontend/src/app/listen/[id]/page.tsx']){
 const source=fs.readFileSync(require('node:path').join(__dirname,'../..',file),'utf8');
 for(const match of source.matchAll(/gql`([\s\S]*?)`/g))assert.deepEqual(validate(schema,parse(match[1])).map(e=>e.message),[]);
 }
});
test('Direct track links cannot bypass private or missing parent World',async()=>{
 const old=[T.findOne,W.findOne];try{T.findOne=async()=>({ownerId:'a',releaseWorldId:'world',visibility:'listed'});W.findOne=async q=>{assert.equal(q.ownerId,'a');assert.equal(q.visibility,'public');return null;};assert.equal(await r.Query.getShareableTrack(null,{id:'t'}),null);W.findOne=async()=>({id:'world',publicCanon:false,visibility:'public'});assert.equal((await r.Query.getShareableTrack(null,{id:'t'})).visibility,'listed');}finally{[T.findOne,W.findOne]=old;}
});
