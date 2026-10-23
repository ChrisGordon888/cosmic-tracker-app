const test=require('node:test'),assert=require('node:assert/strict');
const r=require('../resolvers'),T=require('../models/ReleaseTrack'),W=require('../models/ReleaseWorld'),C=require('../models/NexusEditorialConfig'),P=require('../models/CreativeProfile');
const U=require('../models/User');
const creator={id:'creator-a',role:'creator',creatorStatus:'active'};
test('Audio field boundary blocks private, member, future, locked and full preview files for anonymous listeners',()=>{
 const track={ownerId:'creator-a',visibility:'public',playbackStatus:'playable',audioUrl:'/full',previewAudioUrl:'/preview',accessTier:'public'};
 assert.equal(r.ReleaseTrack.audioUrl(track,null,{}),'/full');
 for(const patch of [{visibility:'private',isPublic:true},{accessTier:'signup'},{accessTier:'premium'},{unlockDate:new Date('2099-01-01')},{playbackStatus:'coming-soon'},{playbackStatus:'locked'},{status:'archived'}])assert.equal(r.ReleaseTrack.audioUrl({...track,...patch},null,{}),null);
 assert.equal(r.ReleaseTrack.audioUrl({...track,accessTier:'signup'},null,{user:{id:'listener',role:'listener'}}),'/full');
 assert.equal(r.ReleaseTrack.audioUrl({...track,playbackStatus:'preview'},null,{}),null);
 assert.equal(r.ReleaseTrack.previewAudioUrl({...track,playbackStatus:'preview'},null,{}),'/preview');
 assert.equal(r.ReleaseTrack.audioUrl({...track,visibility:'private'},null,{user:creator}),'/full');
});
test('Normal creator and listener cannot self-approve, publish, unpublish or select editorial Spotlight',async()=>{
 for(const user of [creator,{id:'listener',role:'listener'}])for(const mutation of ['setNexusFeaturedSignal','setFeaturedSignal','reviewNexusSubmission','publishTrackToNexus','unpublishTrackFromNexus'])await assert.rejects(r.Mutation[mutation](null,{trackId:'another-creators-track'},{user}),/permission|access/i);
 const original=T.findOne;
 try{T.findOne=async query=>{assert.equal(query.ownerId,'creator-a');return null;};await assert.rejects(r.Mutation.submitTrackForNexusReview(null,{trackId:'creator-b-track'},{user:creator}),/not found/i);}finally{T.findOne=original;}
});
test('Spotlight selects the configured public track and its own parent; explicit empty config has no implicit Siren fallback',async()=>{
 const originals=[C.findOne,T.findOne,W.find,W.findOne,U.exists,P.findOne];
 let selected='single';const tracks={single:{id:'single',releaseWorldId:'world-single',ownerId:'bbbbbbbbbbbbbbbbbbbbbbbb'},siren:{id:'siren',releaseWorldId:'sirens',ownerId:'aaaaaaaaaaaaaaaaaaaaaaaa'}};
 try{
 U.exists=async()=>({_id:'fixture'});P.findOne=async()=>({artistName:'Fixture'});
 C.findOne=async()=>({featuredTrackId:selected});
 W.find=()=>({sort:async()=>[]});
 T.findOne=async q=>{assert.equal(q.showInNexus,true);assert.equal(q.nexusReviewStatus,'published');assert.ok(q.$or[1].visibility.$exists===false);return tracks[q._id]??null;};
 W.findOne=async q=>{assert.equal(q.visibility,'public');return {id:q._id,slug:q._id,ownerId:q.ownerId};};
 for(const id of ['single','siren']){selected=id;assert.equal((await r.Query.getPublicFeaturedSignal()).id,id);assert.equal((await r.Query.getPublicFeaturedReleaseWorld()).id,tracks[id].releaseWorldId);}
 selected=null;assert.equal(await r.Query.getPublicFeaturedSignal(),null);assert.equal(await r.Query.getPublicFeaturedReleaseWorld(),null);
 selected='deleted';assert.equal(await r.Query.getPublicFeaturedSignal(),null);
 }finally{[C.findOne,T.findOne,W.find,W.findOne,U.exists,P.findOne]=originals;}
});
test('Editorial change only updates editorial fields, preserving project Featured Signal',async()=>{
 const originals=[C.findOne,T.findById,T.updateMany,T.findByIdAndUpdate,W.findOne];
 const track={_id:'single',ownerId:'a',releaseWorldId:'w',realmId:101,visibility:'listed',publicCanon:false,playbackStatus:'playable',audioUrl:'/audio',showInNexus:true,nexusReviewStatus:'published',isFocusTrack:true};
 const config={featuredTrackId:'siren',realmAnchors:[],realmOrders:[],save:async()=>{}};const writes=[];
 try{
 W.findOne=async()=>({ownerId:'a',visibility:'public',status:'active'});C.findOne=async()=>config;T.findById=async()=>track;T.updateMany=async(q,u)=>writes.push(u);T.findByIdAndUpdate=async(id,u)=>writes.push(u);
 await r.Mutation.setNexusFeaturedSignal(null,{trackId:'single'},{user:{id:'owner',role:'owner'}});
 assert.equal(config.featuredTrackId,'single');assert.equal(track.isFocusTrack,true);
 for(const write of writes)for(const key of Object.keys(write.$set))assert.ok(['nexusRole','isRealmAnchor','nexusSortOrder'].includes(key));
 }finally{[C.findOne,T.findById,T.updateMany,T.findByIdAndUpdate,W.findOne]=originals;}
});
test('Attribution and world links resolve through the actual owner, never a hardcoded artist',async()=>{
 const originals=[W.findOne,P.findOne];
 try{W.findOne=async q=>{assert.equal(q.ownerId,'artist-b');return {slug:'b-world',creativeProfileId:'profile-b'};};P.findOne=async q=>{assert.equal(q.ownerId,'artist-b');return {artistName:'Artist B'};};
 const track={releaseWorldId:'world-b',ownerId:'artist-b'};assert.equal(await r.ReleaseTrack.artistName(track),'Artist B');assert.equal(await r.ReleaseTrack.releaseSlug(track),'b-world');
 }finally{[W.findOne,P.findOne]=originals;}
});
test('Spotlight cannot bypass withdrawn World consent or stale unpublished track state',async()=>{
 const old=[T.findOne,W.find,W.findOne,C.findOne];try{
 C.findOne=async()=>({featuredTrackId:'t'});W.find=()=>({sort:async()=>[]});T.findOne=async q=>{assert.equal(q.nexusReviewStatus,'published');return {releaseWorldId:'w',ownerId:'a'};};W.findOne=async q=>{assert.deepEqual(q.publicCanon,{$ne:false});return null;};assert.equal(await r.Query.getPublicFeaturedSignal(),null);
 }finally{[T.findOne,W.find,W.findOne,C.findOne]=old;}
});
test('Intentionally approved Listed track can publish without changing Canon; private or foreign-parent tracks cannot',async()=>{
 const old=[T.findById,W.findById];
 const track={ownerId:'a',releaseWorldId:'w',publicCanon:false,visibility:'listed',realmId:101,status:'released',catalogTreatment:'current',playbackStatus:'playable',audioUrl:'/audio',nexusReviewStatus:'approved',showInNexus:false,save:async()=>{}};
 try{T.findById=async()=>track;W.findById=async()=>({ownerId:'a',visibility:'public',publicCanon:false,status:'active'});
 const result=await r.Mutation.publishTrackToNexus(null,{trackId:'t'},{user:{id:'editor',role:'owner'}});assert.equal(result.publicCanon,false);assert.equal(result.showInNexus,true);assert.equal(result.nexusReviewStatus,'published');
 track.visibility='private';await assert.rejects(r.Mutation.publishTrackToNexus(null,{trackId:'t'},{user:{id:'editor',role:'owner'}}),/visibility/);
 track.visibility='listed';W.findById=async()=>({ownerId:'b',visibility:'public'});await assert.rejects(r.Mutation.publishTrackToNexus(null,{trackId:'t'},{user:{id:'editor',role:'owner'}}),/parent release/);
 }finally{[T.findById,W.findById]=old;}
});
