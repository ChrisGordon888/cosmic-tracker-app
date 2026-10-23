const test=require('node:test'),assert=require('node:assert/strict');
const {curationUpdate}=require('../lib/publicCanon');const r=require('../resolvers'),T=require('../models/ReleaseTrack'),W=require('../models/ReleaseWorld'),C=require('../models/NexusEditorialConfig');
const U=require('../models/User');
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
test('Soundtrack query retains public eligibility filters and requires editorial selection',async()=>{
 const old=[W.find,T.find,C.findOne,U.exists];try{
 C.findOne=async()=>({realmSoundtracks:[]});U.exists=async()=>({_id:"fixture"});
 W.find=q=>({sort:async()=>[],select:async()=>{assert.equal(q.publicCanon,undefined);assert.equal(q.visibility,'public');return [{_id:'world',ownerId:'a'}];}});
 T.find=q=>({sort:async order=>{
  assert.equal(q.publicCanon,undefined);assert.equal(q.showInNexus,undefined);
  assert.deepEqual(q.catalogTreatment,{$nin:['vault','test']});assert.deepEqual(q.status,{$ne:'archived'});
  assert.deepEqual(q.$and[0],{$or:[{releaseWorldId:null},{releaseWorldId:'world',ownerId:'a'}]});
  assert.deepEqual(q.$and[1].$or[0],{visibility:{$in:['public','listed']}});assert.equal(order.publicCanon,-1);return [];
 }});await r.Query.getPublicNexusTracks(null,{});
 }finally{[W.find,T.find,C.findOne,U.exists]=old;}
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

test('Soundtrack query excludes unapproved public and Canon tracks and preserves published selections',async()=>{
 const old=[W.find,T.find,C.findOne,U.exists];
 const matches=(record,query)=>Object.entries(query).every(([key,value])=>{
  if(key==='$and')return value.every(q=>matches(record,q));
  if(key==='$or')return value.some(q=>matches(record,q));
  const actual=record[key];
  if(value===null)return actual==null;
  if(typeof value!=='object')return actual===value;
  return Object.entries(value).every(([op,want])=>op==='$in'?want.includes(actual):op==='$nin'?!want.includes(actual):op==='$ne'?actual!==want:op==='$exists'?(actual!==undefined)===want:false);
 });
 const base={ownerId:'a',realmId:44,status:'demo',visibility:'listed',publicCanon:false,showInNexus:false,catalogTreatment:'current',playbackStatus:'playable',audioUrl:'/a'};
 const rows=[{...base,id:'standalone'},{...base,id:'canon',publicCanon:true,visibility:'public'},{...base,id:'child',releaseWorldId:'public'},{...base,id:'private',visibility:'private'},{...base,id:'vault',catalogTreatment:'vault'},{...base,id:'sandbox',catalogTreatment:'test'},{...base,id:'archived',status:'archived'},{...base,id:'private-parent',releaseWorldId:'private'},{...base,id:'orphan',releaseWorldId:'missing'},{...base,id:'foreign-parent',releaseWorldId:'public',ownerId:'b'},{...base,id:'member',accessTier:'signup'},{...base,id:'approved-listed',showInNexus:true,nexusReviewStatus:'published'},{...base,id:'approved-canon',publicCanon:true,showInNexus:true,nexusReviewStatus:'published'},{...base,id:'approval-only',nexusReviewStatus:'approved'},{...base,id:'flag-without-publication',showInNexus:true,nexusReviewStatus:'draft'}];
 try{
 C.findOne=async()=>({realmSoundtracks:[]});U.exists=async()=>({_id:"fixture"});
 W.find=()=>({sort:async()=>[],select:async()=>[{_id:'public',ownerId:'a'}]});
 T.find=q=>({sort:async()=>rows.filter(t=>matches(t,q)).sort((a,b)=>Number(b.publicCanon)-Number(a.publicCanon))});
 const result=await r.Query.getPublicNexusTracks(null,{realmId:44});
 assert.deepEqual(result.map(t=>t.id),['approved-canon','approved-listed']);

 assert.equal(r.ReleaseTrack.audioUrl(result[0],null,{}),'/a');
 const curated=await r.Query.getPublicNexusTracks(null,{realmId:44,nexusOnly:true});assert.deepEqual(curated.map(t=>t.id),['approved-canon','approved-listed']);
 }finally{[W.find,T.find,C.findOne,U.exists]=old;}
});
test('Nexus discovery requires both editorial flags, preserves broader public access, and ranks Canon first',async()=>{
 const old=[W.find,T.find,C.findOne,U.exists];let query;
 try{C.findOne=async()=>({realmSoundtracks:[]});U.exists=async()=>({_id:"fixture"});W.find=()=>({sort:async()=>[],select:async()=>[]});T.find=q=>({sort:async order=>{query=q;assert.equal(order.publicCanon,-1);return [];}});
 await r.Query.getPublicNexusTracks(null,{nexusOnly:true});assert.equal(query.showInNexus,true);assert.equal(query.nexusReviewStatus,'published');assert.equal(query.publicCanon,undefined);
 await r.Query.getPublicNexusTracks(null,{nexusOnly:false});assert.equal(query.showInNexus,undefined);assert.equal(query.nexusReviewStatus,undefined);
 }finally{[W.find,T.find,C.findOne,U.exists]=old;}
});
