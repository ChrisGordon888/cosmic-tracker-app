const test=require('node:test'),assert=require('node:assert/strict');
const r=require('../resolvers'),W=require('../models/ReleaseWorld'),T=require('../models/ReleaseTrack'),A=require('../models/ReleaseAsset'),B=require('../models/BoardArtifact');
test('Two creator boundary: foreign private track, assets and board never resolve',async()=>{
 const originals=[T.findOne,W.findOne,A.findOne];const owner={id:'fictional-a',role:'creator',creatorStatus:'active'},other={...owner,id:'fictional-b'};
 T.findOne=async q=>q.ownerId===owner.id?{id:'track',save:async()=>{}}:null;
 W.findOne=async q=>q.ownerId===owner.id?{id:'world'}:null;
 A.findOne=async q=>q.ownerId===owner.id?{id:'asset',save:async()=>{}}:null;
 try{assert.equal(await r.Query.getReleaseTrack(null,{id:'track'},{user:other}),null);assert.equal(await r.Query.getReleaseAsset(null,{id:'asset'},{user:other}),null);await assert.rejects(r.Query.getReleaseAssets(null,{releaseWorldId:'world'},{user:other}));await assert.rejects(r.Query.getBoardArtifacts(null,{releaseWorldId:'world'},{user:other}));await assert.rejects(r.Mutation.saveBoardArtifacts(null,{releaseWorldId:'world',artifacts:[]},{user:other}));assert.equal((await r.Query.getReleaseTrack(null,{id:'track'},{user:owner})).id,'track');}finally{[T.findOne,W.findOne,A.findOne]=originals;}
});
test('Published proof remains constrained by public parent and explicit artifact publication',async()=>{
 const originals=[W.findOne,T.find,B.find];let published=false,queries=[];
 W.findOne=async q=>{assert.equal(q.visibility,'public');assert.deepEqual(q.status,{$ne:'archived'});return published?{_id:'world',ownerId:'fictional-a'}:null;};
 T.find=()=>({select:async()=>[]});B.find=q=>{queries.push(q);return{sort:async()=>[]};};
 try{assert.deepEqual(await r.Query.getPublicBoardArtifacts(null,{releaseWorldId:'world'}),[]);assert.equal(queries.length,0);published=true;await r.Query.getPublicBoardArtifacts(null,{releaseWorldId:'world'});assert.equal(queries[0].ownerId,'fictional-a');assert.equal(queries[0].isPublic,true);}finally{[W.findOne,T.find,B.find]=originals;}
});
test('Admin invitation keeps activation private; invited creators cannot self-approve admin invitations',async()=>{
 const User=require('../models/User'),original=User.findById;
 const target={_id:'fictional-a',role:'listener',creatorStatus:'none',save:async()=>{}};
 User.findById=async()=>target;
 const admin={id:'fictional-admin',role:'admin'},creator={id:'fictional-a',role:'creator',creatorStatus:'invited'};
 try {
  await assert.rejects(r.Mutation.inviteCreator(null,{userId:target._id},{user:creator}),/Administrator/);
  await r.Mutation.inviteCreator(null,{userId:target._id},{user:admin});
  assert.equal(target.creatorStatus,'invited');assert.equal(target.creatorActivationPolicy,'admin');
  await assert.rejects(r.Mutation.activateMyCreatorAccount(null,{}, {user:creator}),/administrator activation/);
  await assert.rejects(r.Mutation.activateCreator(null,{userId:target._id},{user:creator}),/Administrator/);
  await r.Mutation.activateCreator(null,{userId:target._id},{user:admin});assert.equal(target.creatorStatus,'active');
  target.creatorStatus='suspended';await assert.rejects(r.Mutation.beginCreatorOnboarding(null,{}, {user:creator}),/Suspended/);
 } finally {User.findById=original;}
});
