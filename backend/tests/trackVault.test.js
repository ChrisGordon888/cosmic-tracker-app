const test=require('node:test'),assert=require('node:assert/strict');
const r=require('../resolvers'),T=require('../models/ReleaseTrack'),W=require('../models/ReleaseWorld'),C=require('../models/NexusEditorialConfig');
const {rightsInput}=require('../lib/trackVault');
const user={id:'creator-a',role:'creator',creatorStatus:'active'};
const stamp=new Date('2026-10-04T12:00:00Z');
const rights={sourceType:'purchased',reviewStatus:'needsReview',producerName:'Fixture producer',notes:'Splits not yet recorded',documentationRecorded:true,commercialIntent:true};
test('Private rights and catalog treatment require ownership or an existing support grant',()=>{
 const track={ownerId:'creator-a',catalogTreatment:'vault',rightsInfo:rights};
 for(const other of [undefined,{id:'b',role:'creator',creatorStatus:'active'},{id:'admin',role:'admin'}]){
  assert.equal(r.ReleaseTrack.rightsInfo(track,null,{user:other}),null);assert.equal(r.ReleaseTrack.catalogTreatment(track,null,{user:other}),null);
 }
 assert.equal(r.ReleaseTrack.rightsInfo(track,null,{user}),rights);
 assert.equal(r.ReleaseTrack.rightsInfo(track,null,{user:{id:'support',role:'admin',creatorAccessOwnerIds:['creator-a']}}),rights);
});
test('Explicit Vault, Sandbox and archive actions preserve files/project/lifecycle unless archiving; restoring Current stays private',async()=>{
 const original=[T.findOne,T.findOneAndUpdate,C.findOne];
 const track={_id:'track',ownerId:'creator-a',updatedAt:stamp,status:'demo',visibility:'public',isPublic:true,showInNexus:true,audioUrl:'/original.wav',releaseWorldId:'world'};
 try{
 T.findOne=async q=>q.ownerId===track.ownerId?track:null;C.findOne=async()=>null;
 T.findOneAndUpdate=async(q,u,opts)=>{assert.equal(q.ownerId,user.id);assert.equal(q.updatedAt,stamp);assert.equal(opts.runValidators,true);Object.assign(track,u.$set);return track;};
 for(const catalogTreatment of ['vault','test']){
  await r.Mutation.updateTrackVault(null,{id:'track',expectedUpdatedAt:stamp.toISOString(),input:{catalogTreatment,rightsInfo:rights}},{user});
  assert.equal(track.visibility,'private');assert.equal(track.showInNexus,false);assert.equal(track.status,'demo');assert.equal(track.releaseWorldId,'world');assert.equal(track.audioUrl,'/original.wav');assert.equal(track.rightsInfo.reviewStatus,'needsReview');
 }
 await r.Mutation.updateTrackVault(null,{id:'track',expectedUpdatedAt:String(stamp.getTime()),input:{catalogTreatment:'current'}},{user});assert.equal(track.visibility,'private');assert.equal(track.showInNexus,false);
 await r.Mutation.updateTrackVault(null,{id:'track',expectedUpdatedAt:stamp.toISOString(),input:{archive:true}},{user});assert.equal(track.status,'archived');assert.equal(track.audioUrl,'/original.wav');
 await assert.rejects(r.Mutation.updateTrackVault(null,{id:'track',expectedUpdatedAt:stamp.toISOString(),input:{catalogTreatment:'test'}},{user:{...user,id:'creator-b'}}),/not found/);
 await assert.rejects(r.Mutation.updateTrackVault(null,{id:'track',expectedUpdatedAt:'2020-01-01',input:{rightsInfo:rights}},{user}),/changed/);
 }finally{[T.findOne,T.findOneAndUpdate,C.findOne]=original;}
});
test('Vault and Sandbox cannot leak audio or pass public track selection, even with stale public flags',async()=>{
 const original=[W.findOne,T.find];
 try{
 const tracks=['current','vault','test'].map(catalogTreatment=>({ownerId:'creator-a',catalogTreatment,visibility:'public',isPublic:true,audioUrl:'/audio',playbackStatus:'playable'}));
 W.findOne=async()=>({ownerId:'creator-a'});T.find=q=>({sort:async()=>{assert.deepEqual(q.catalogTreatment,{$nin:['vault','test']});return tracks.filter(t=>!q.catalogTreatment.$nin.includes(t.catalogTreatment));}});
 assert.equal((await r.Query.getPublicReleaseTracks(null,{releaseWorldId:'world'})).length,1);
 for(const t of tracks.slice(1)){assert.equal(r.ReleaseTrack.audioUrl(t,null,{}),null);assert.equal(r.ReleaseTrack.audioUrl(t,null,{user:{...user,id:'other'}}),null);assert.equal(r.ReleaseTrack.audioUrl(t,null,{user}),'/audio');}
 }finally{[W.findOne,T.find]=original;}
});
test('Ordinary track edit cannot bypass a protected catalog classification',async()=>{
 const original=T.findOne;
 try{T.findOne=async()=>({_id:'track',ownerId:user.id,catalogTreatment:'test',visibility:'private'});
 for(const input of [{visibility:'public'},{isPublic:true},{visibility:'listed'}])await assert.rejects(r.Mutation.updateReleaseTrack(null,{id:'track',input},{user}),/Return this track to Current/);
 }finally{T.findOne=original;}
});
test('Source metadata validates bounded notes and URLs, with no legal-cleared state',()=>{
 assert.equal(rightsInput(rights).sourceType,'purchased');
 assert.throws(()=>rightsInput({...rights,reviewStatus:'cleared'}),/supported/);
 assert.throws(()=>rightsInput({...rights,sourceUrl:'javascript:alert(1)'}),/HTTP/);
 assert.throws(()=>rightsInput({...rights,notes:'x'.repeat(4001)}),/4000/);
});
test('Legacy registry suppression returns only IDs for explicit internal classifications or archive',async()=>{
 const original=[T.find,W.find];try{W.find=()=>({distinct:async()=>[]});T.find=q=>({distinct:async field=>{assert.equal(field,'legacyRegistryId');assert.deepEqual(q.$or,[{catalogTreatment:{$in:['vault','test']}},{status:'archived'},{publicCanon:false},{releaseWorldId:{$in:[]}}]);return ['legacy-id'];}});assert.deepEqual(await r.Query.unavailableRegistryTrackIds(),['legacy-id']);}finally{[T.find,W.find]=original;}
});
test('Protected tracks cannot be submitted or selected for Nexus even with stale publication metadata',async()=>{
 const original=[T.findOne,T.findById,W.findOne];
 try{const track={_id:'track',ownerId:user.id,releaseWorldId:'world',catalogTreatment:'test',showInNexus:true,nexusReviewStatus:'published'};
 T.findOne=async()=>track;T.findById=async()=>track;W.findOne=async()=>({visibility:'public',ownerId:user.id});
 await assert.rejects(r.Mutation.submitTrackForNexusReview(null,{trackId:'track'},{user}),/Current/);
 await assert.rejects(r.Mutation.setNexusFeaturedSignal(null,{trackId:'track'},{user:{id:'owner',role:'owner'}}),/published Nexus/);
 }finally{[T.findOne,T.findById,W.findOne]=original;}
});
test('Actual GraphQL execution never serializes rights notes to another creator or anonymous caller',async()=>{
 const {makeExecutableSchema}=require('@graphql-tools/schema');const {graphql}=require('graphql');
 const track={id:'fixture',ownerId:user.id,rightsInfo:rights,catalogTreatment:'current'};
 const schema=makeExecutableSchema({typeDefs:require('../schemas'),resolvers:{...r,Query:{...r.Query,getPublicReleaseTracks:async()=>[track]}}});
 const source='{ getPublicReleaseTracks(releaseWorldId:"fixture") { id rightsInfo { notes sourceType reviewStatus } catalogTreatment } }';
 for(const contextValue of [{},{user:{...user,id:'creator-b'}}]){const result=await graphql({schema,source,contextValue});assert.equal(result.errors,undefined);assert.equal(result.data.getPublicReleaseTracks[0].rightsInfo,null);assert.equal(result.data.getPublicReleaseTracks[0].catalogTreatment,null);}
 const result=await graphql({schema,source,contextValue:{user}});assert.equal(result.errors,undefined);assert.equal(result.data.getPublicReleaseTracks[0].rightsInfo.notes,rights.notes);
});
test('Existing lifecycle enum remains intact and rights never add a legal clearance state',()=>{
 assert.deepEqual(T.schema.path('status').enumValues,['idea','writing','demo','recording','mixing','mastered','released','archived']);
 assert.equal(T.schema.path('rightsInfo.reviewStatus').enumValues.includes('cleared'),false);
});
test('Normal current tracks still submit for Nexus review with unknown rights information',async()=>{
 const original=[T.findOne,W.findOne];
 const track={_id:'track',ownerId:user.id,releaseWorldId:'world',catalogTreatment:'current',visibility:'public',isPublic:true,status:'mastered',playbackStatus:'playable',audioUrl:'/audio',realmId:101,rightsInfo:{sourceType:'unknown',reviewStatus:'unknown'},save:async()=>{}};
 try{T.findOne=async()=>track;W.findOne=async()=>({visibility:'public',status:'active',ownerId:user.id});await r.Mutation.submitTrackForNexusReview(null,{trackId:'track'},{user});assert.equal(track.nexusReviewStatus,'in-review');assert.equal(track.showInNexus,false);assert.equal(track.rightsInfo.reviewStatus,'unknown');}finally{[T.findOne,W.findOne]=original;}
});
test('Release drop excludes private Vault tracks while publishing normal tracks',async()=>{
 const P=require('../models/CreativeProfile'),A=require('../models/ReleaseAsset');
 const original=[T.find,W.findOne,W.findOneAndUpdate,P.findOne,A.findOne,A.findOneAndUpdate];
 const world={_id:'world',id:'world',slug:'fixture-world',title:'Fixture',ownerId:user.id,creativeProfileId:'profile',visibility:'private',status:'draft',coverArtUrl:'/cover',save:async()=>{}};
 const normal={_id:'normal',title:'Normal',slug:'normal',status:'mastered',catalogTreatment:'current',visibility:'private',audioUrl:'/normal',playbackStatus:'playable',save:async()=>{}};
 const protectedTrack={...normal,_id:'vault',title:'Vault',catalogTreatment:'vault',audioUrl:'/vault'};
 try{
 W.findOne=async()=>world;W.findOneAndUpdate=async()=>world;P.findOne=async()=>({_id:'profile',save:async()=>{}});A.findOne=()=>({sort:async()=>null});A.findOneAndUpdate=async()=>null;
 T.find=q=>({sort:async()=>[normal,protectedTrack].filter(t=>!q.catalogTreatment?.$nin.includes(t.catalogTreatment))});
 await r.Mutation.dropReleaseWorld(null,{releaseWorldId:'world'},{user});
 assert.equal(normal.visibility,'public');assert.equal(normal.status,'released');assert.equal(protectedTrack.visibility,'private');assert.equal(protectedTrack.status,'mastered');
 }finally{[T.find,W.findOne,W.findOneAndUpdate,P.findOne,A.findOne,A.findOneAndUpdate]=original;}
});
