const test=require('node:test'),assert=require('node:assert/strict');
const Track=require('../models/ReleaseTrack'),r=require('../resolvers');
const {curationUpdate}=require('../lib/publicCanon');
test('New tracks default to public access and ordinary playback, with visibility still private',()=>{
 const t=new Track({ownerId:'owner',title:'New',slug:'new'});assert.equal(t.accessTier,'public');assert.equal(t.playbackStatus,'playable');assert.equal(t.visibility,'private');assert.equal(r.ReleaseTrack.audioUrl(t,null,{}),null);
 for(const visibility of ['public','listed']){const track=new Track({ownerId:'owner',title:'New',slug:'new',visibility,audioUrl:'/full'});assert.equal(r.ReleaseTrack.audioUrl(track,null,{}),'/full');}
});
test('Explicit member, premium, preview and date gates survive defaults and Canon/List curation',()=>{
 for(const patch of [{accessTier:'signup'},{accessTier:'premium'},{playbackStatus:'preview'},{playbackStatus:'locked'},{unlockDate:new Date('2099-01-01')}]){
 const t=new Track({ownerId:'owner',title:'Gated',slug:'gated',visibility:'public',audioUrl:'/full',previewAudioUrl:'/preview',...patch});assert.equal(r.ReleaseTrack.audioUrl(t,null,{}),null);
 for(const choice of ['canon','listed']){const update=curationUpdate(t,choice);assert.equal(update.accessTier,undefined);assert.equal(update.playbackStatus,undefined);assert.equal(update.unlockDate,undefined);}
 }
 for(const patch of [{visibility:'private'},{catalogTreatment:'test'},{catalogTreatment:'vault'},{status:'archived'}])assert.equal(r.ReleaseTrack.audioUrl(new Track({ownerId:'owner',title:'Protected',slug:'protected',visibility:'public',audioUrl:'/full',...patch}),null,{}),null);
});
test('CreateReleaseTrack default is playable but explicit gates are preserved',async()=>{
 const old=[Track.create,Track.findOne,Track.countDocuments];try{
 Track.findOne=()=>({sort:()=>({select:async()=>null})});Track.create=async input=>new Track(input);Track.countDocuments=async()=>0;
 const user={id:'owner',role:'creator',creatorStatus:'active'};
 for(const visibility of ['public','listed']){const t=await r.Mutation.createReleaseTrack(null,{input:{title:'Fresh',slug:'fresh',visibility,audioUrl:'/full'}},{user});assert.equal(t.playbackStatus,'playable');assert.equal(t.accessTier,'public');assert.equal(t.releaseWorldId,null);}
 const t=await r.Mutation.createReleaseTrack(null,{input:{title:'Intentional',slug:'intentional',visibility:'public',audioUrl:'/full',accessTier:'signup',playbackStatus:'preview',previewAudioUrl:'/preview'}},{user});assert.equal(t.accessTier,'signup');assert.equal(t.playbackStatus,'preview');
 }finally{[Track.create,Track.findOne,Track.countDocuments]=old;}
});
