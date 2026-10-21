const test = require('node:test');
const assert = require('node:assert/strict');
const r = require('../resolvers');
const W = require('../models/ReleaseWorld');
const T = require('../models/ReleaseTrack');
const P = require('../models/CreativeProfile');
const A = require('../models/ReleaseAsset');

test('Scheduled World validates, publishes only the page, preserves private child and editorial state', async () => {
 const methods = [[W,'find'],[W,'findOne'],[T,'find'],[P,'findOne'],[A,'findOne'],[A,'findOneAndUpdate']];
 const originals = methods.map(([m,k])=>m[k]);
 const user = {id:'fictional-owner',role:'creator',creatorStatus:'active'};
 const world = new W({ownerId:user.id,creativeProfileId:new T()._id,title:'Fixture',slug:'fixture',coverArtUrl:'/fictional.png',visibility:'private',publicCanon:false,isFeatured:false});
 const child = new T({ownerId:user.id,releaseWorldId:world._id,title:'Private song',slug:'private-song',audioUrl:'/fictional.wav',visibility:'private',isPublic:false,realmId:0});
 world.save=async()=>{await world.validate();return world;};
 const profile={_id:world.creativeProfileId,isPublic:false,save:async()=>{}};
 try {
  W.findOne=async q=>q.ownerId && q.ownerId!==user.id?null:world;
  W.find=q=>q.status==='scheduled'?{sort:async()=>world.status==='scheduled'&&world.fullDropDate<=new Date()?[world]:[]}:{limit:async()=>world.visibility==='public'?[world]:[]};
  T.find=()=>({sort:async()=>[child]});
  P.findOne=async()=>profile;
  A.findOne=()=>({sort:async()=>null});A.findOneAndUpdate=async()=>null;
  for (const actor of [null,{id:'inactive',role:'creator',creatorStatus:'invited'}]) {
   await assert.rejects(r.Mutation.scheduleReleaseWorld(null,{releaseWorldId:world.id,publishAt:new Date(Date.now()+60000).toISOString()},{user:actor}));
  }
  for (const publishAt of ['invalid',new Date(Date.now()-1000).toISOString()]) {
   await assert.rejects(r.Mutation.scheduleReleaseWorld(null,{releaseWorldId:world.id,publishAt},{user}));
  }
  await assert.rejects(r.Mutation.scheduleReleaseWorld(null,{releaseWorldId:world.id,publishAt:new Date(Date.now()+60000).toISOString()},{user:{...user,id:'other'}}),/not found/i);
  await r.Mutation.scheduleReleaseWorld(null,{releaseWorldId:world.id,publishAt:new Date(Date.now()+60000).toISOString()},{user});
  assert.equal(world.status,'scheduled');await world.validate();
  await r.Mutation.cancelScheduledReleaseWorld(null,{releaseWorldId:world.id},{user});assert.equal(world.status,'draft');
  await r.Mutation.scheduleReleaseWorld(null,{releaseWorldId:world.id,publishAt:new Date(Date.now()+60000).toISOString()},{user});
  world.fullDropDate=new Date(Date.now()-1000);
  assert.equal(await r.Query.getPublicReleaseWorldBySlug(null,{slug:'fixture'}),world);
  assert.equal(world.status,'active');assert.equal(world.visibility,'public');
  assert.equal(child.visibility,'private');assert.equal(child.isPublic,false);assert.equal(child.realmId,0);
  assert.equal(world.publicCanon,false);assert.equal(world.isFeatured,false);
  await assert.rejects(r.Mutation.scheduleReleaseWorld(null,{releaseWorldId:world.id,publishAt:new Date(Date.now()+60000).toISOString()},{user}),/Unpublish/);
  await r.Mutation.unpublishReleaseWorld(null,{releaseWorldId:world.id},{user});assert.equal(world.visibility,'private');
 } finally {methods.forEach(([m,k],i)=>m[k]=originals[i]);}
});

test('Duplicate public slugs require exact World identity; private/archived Worlds cannot resolve',async()=>{
 const original=[W.find,W.findOne];
 const worlds=[{_id:'a',slug:'same',visibility:'public',status:'active'},{_id:'b',slug:'same',visibility:'public',status:'active'},{_id:'private',slug:'same',visibility:'private',status:'draft'},{_id:'archived',slug:'same',visibility:'public',status:'archived'}];
 const eligible=q=>worlds.filter(w=>w.slug===q.slug&&w.visibility===q.visibility&&w.status!==q.status.$ne&&(!q._id||w._id===q._id));
 W.find=q=>q.status==='scheduled'?{sort:async()=>[]}:{limit:async n=>eligible(q).slice(0,n)};
 W.findOne=async q=>eligible(q)[0]||null;
 try {
  await assert.rejects(r.Query.getPublicReleaseWorldBySlug(null,{slug:'same'}),/ambiguous/);
  assert.equal((await r.Query.getPublicReleaseWorldBySlug(null,{slug:'same',worldId:'b'}))._id,'b');
  for(const worldId of ['private','archived','missing'])assert.equal(await r.Query.getPublicReleaseWorldBySlug(null,{slug:'same',worldId}),null);
  assert.equal(await r.Query.getPublicReleaseWorldBySlug(null,{slug:'wrong',worldId:'b'}),null);
 }finally{[W.find,W.findOne]=original;}
});


test('Archived World cannot be published or implicitly restored', async () => {
 const methods = [[W,'findOne'],[T,'find'],[P,'findOne'],[A,'findOne']];
 const originals = methods.map(([m,k])=>m[k]);
 const user={id:'fixture-owner',role:'creator',creatorStatus:'active'};
 const world=new W({ownerId:user.id,creativeProfileId:new T()._id,title:'Archived fixture',slug:'archived-fixture',status:'archived',visibility:'private',coverArtUrl:'/fixture.png'});
 let writes=0;
 world.save=async()=>{writes++;return world;};
 try {
  W.findOne=async()=>world;
  T.find=()=>({sort:async()=>[new T({ownerId:user.id,releaseWorldId:world._id,title:'Fixture',slug:'fixture',audioUrl:'/fixture.wav',visibility:'private',playbackStatus:'playable',realmId:0})]});
  P.findOne=async()=>({_id:world.creativeProfileId,save:async()=>{writes++;}});
  A.findOne=()=>({sort:async()=>null});
  const readiness=await r.Query.getReleasePublishingReadiness(null,{releaseWorldId:world.id},{user});
  assert.equal(readiness.ready,false);
  assert.ok(readiness.blockingIssues.some(issue=>issue.code==='RELEASE_ARCHIVED'));
  await assert.rejects(r.Mutation.publishReleaseWorld(null,{releaseWorldId:world.id},{user}),/Restore/);
  assert.equal(writes,0);assert.equal(world.status,'archived');assert.equal(world.visibility,'private');
 }finally{methods.forEach(([m,k],i)=>m[k]=originals[i]);}
});
