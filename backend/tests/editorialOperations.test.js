const test=require('node:test'),assert=require('node:assert/strict');
const r=require('../resolvers'),T=require('../models/ReleaseTrack'),W=require('../models/ReleaseWorld'),U=require('../models/User'),P=require('../models/CreativeProfile'),B=require('../models/BoardArtifact'),C=require('../models/NexusEditorialConfig');
test('Server capabilities distinguish reviewer, explicit publisher, curator and suspended/forged grants',async()=>{
 const access=user=>r.Query.nexusEditorialAccess(null,{}, {user});
 assert.deepEqual(access({id:'admin',role:'admin'}),{canReview:true,canPublish:false,canPlace:false});
 assert.deepEqual(access({id:'admin',role:'admin',platformPermissions:['NEXUS.PUBLISH','nexus.editorial']}),{canReview:true,canPublish:true,canPlace:true});
 for(const role of ['creator','listener'])assert.deepEqual(access({id:'x',role,platformPermissions:['nexus.publish','nexus.editorial']}),{canReview:false,canPublish:false,canPlace:false});
 for(const role of ['owner','admin'])assert.deepEqual(access({id:'x',role,creatorStatus:'suspended',platformPermissions:['nexus.publish','nexus.editorial']}),{canReview:false,canPublish:false,canPlace:false});
 for(const user of [null,{id:'a',role:'creator'},{id:'b',role:'creator'},{id:'s',role:'admin',creatorStatus:'suspended'}])for(const name of ['publishTrackToNexus','reviewNexusSubmission','setRealmDiscovery','setRealmSoundtrack','setNexusProjectSelection'])await assert.rejects(r.Mutation[name](null,{trackId:'t',worldId:'w',selected:true},{user}));
});
test('Read-only evidence is submission, owner, World and published-text scoped; unpublish preserves soundtrack',async()=>{
 const old=[T.findById,W.findOne,U.exists,P.findOne,B.find,C.findOne];
 const owner='aaaaaaaaaaaaaaaaaaaaaaaa',admin={id:'editor',role:'admin',platformPermissions:['nexus.publish']};
 const track={_id:'t',ownerId:owner,releaseWorldId:'w',slug:'song',visibility:'public',status:'released',realmId:0,audioUrl:'/fixture',playbackStatus:'playable',nexusReviewStatus:'in-review',save:async()=>{}};
 const world={_id:'w',ownerId:owner,visibility:'public',status:'active',creativeProfileId:'p'};let eligible=true;
 const config={realmSoundtracks:[{trackId:'t',worldId:'w',realmId:0}],realmAnchors:[],realmOrders:[]};
 try{
 T.findById=async()=>track;W.findOne=async q=>eligible&&q.ownerId===owner?world:null;U.exists=async()=>({_id:owner});P.findOne=async()=>({artistName:'Fixture'});C.findOne=async()=>config;
 B.find=q=>{assert.deepEqual(q,{ownerId:owner,releaseWorldId:'w',isPublic:true,assetId:null,connectedTrackSlug:{$in:['','song']}});return{select:fields=>{assert.equal(fields,'title body meta kind');return{sort:async()=>[{title:'Creator-published process'}]}}}};
 assert.equal((await r.Query.nexusReviewEvidence(null,{trackId:'t'},{user:admin})).length,1);
 await assert.rejects(r.Query.nexusReviewEvidence(null,{trackId:'t'},{user:{id:'other',role:'creator'}}));
 for(const query of ['getReleaseTracks','getReleaseAssets'])await assert.rejects(r.Query[query](null,{releaseWorldId:'w'},{user:{id:'bbbbbbbbbbbbbbbbbbbbbbbb',role:'creator',creatorStatus:'active'}}),/not found/);
 await r.Mutation.reviewNexusSubmission(null,{trackId:'t',decision:'approve'},{user:admin});assert.equal(track.showInNexus,false);assert.equal(track.nexusReviewStatus,'approved');
 await r.Mutation.publishTrackToNexus(null,{trackId:'t'},{user:admin});assert.equal(track.showInNexus,true);assert.equal(track.nexusPublishedBy,'editor');
 await r.Mutation.unpublishTrackFromNexus(null,{trackId:'t'},{user:admin});assert.equal(track.showInNexus,false);assert.equal(track.nexusReviewStatus,'approved');assert.equal(config.realmSoundtracks.length,1);
 eligible=false;await assert.rejects(r.Mutation.publishTrackToNexus(null,{trackId:'t'},{user:admin}),/eligible/);await assert.rejects(r.Query.nexusReviewEvidence(null,{trackId:'t'},{user:admin}),/eligible/);
 }finally{[T.findById,W.findOne,U.exists,P.findOne,B.find,C.findOne]=old}
});
test('Editorial UI GraphQL documents validate against actual schema',()=>{
 const {makeExecutableSchema}=require('@graphql-tools/schema'),{parse,validate}=require('graphql'),fs=require('fs');
 const schema=makeExecutableSchema({typeDefs:require('../schemas'),resolvers:r});
 for(const file of ['../frontend/src/graphql/nexusReview.ts','../frontend/src/components/admin/EditorialPlacementControls.tsx','../frontend/src/components/admin/NexusSamplerControls.tsx'])for(const match of fs.readFileSync(file,'utf8').matchAll(/gql`([\s\S]*?)`/g))assert.deepEqual(validate(schema,parse(match[1])).map(e=>e.message),[]);
});
