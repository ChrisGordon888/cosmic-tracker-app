const test=require('node:test'),assert=require('node:assert/strict');
const {validateAudioIdentity,archiveBlockReason}=require('../lib/catalogHygiene');
const resolvers=require('../resolvers');
const ReleaseWorld=require('../models/ReleaseWorld'),ReleaseTrack=require('../models/ReleaseTrack'),CreativeProfile=require('../models/CreativeProfile'),NexusEditorialConfig=require('../models/NexusEditorialConfig'),MusicCollection=require('../models/MusicCollection');
const user={id:'owner-a',role:'creator',creatorStatus:'active'};
test('Upload identity explicitly validates hashes, filename and size',()=>{assert.doesNotThrow(()=>validateAudioIdentity({audioContentHash:'a'.repeat(64),sourceFileSize:123,sourceFileName:'song.wav'}));for(const input of [{audioContentHash:'fake'},{audioContentHash:'A'.repeat(64)},{sourceFileSize:-1},{sourceFileSize:1.5},{sourceFileName:'bad\nfile'}])assert.throws(()=>validateAudioIdentity(input));});
test('Archive blocks public/unlisted/released/featured and linked projects',()=>{const r={visibility:'private',status:'draft',isFeatured:false};assert.equal(archiveBlockReason(r),null);for(const visibility of ['public','unlisted'])assert.ok(archiveBlockReason({...r,visibility}));assert.ok(archiveBlockReason({...r,status:'released'}));assert.ok(archiveBlockReason({...r,isFeatured:true}));for(const key of ['profileReference','trackPublication','editorialReference','collectionReference'])assert.ok(archiveBlockReason(r,{[key]:true}));});
test('Archive resolver is owner-scoped, guards references and preserves all children',async()=>{
 const originals=[ReleaseWorld.findOne,ReleaseTrack.find,CreativeProfile.exists,NexusEditorialConfig.exists,MusicCollection.exists];let saves=0,linked=false;
 const child={_id:'track-a',releaseWorldId:'release-a',ownerId:user.id,nexusReviewStatus:'draft',showInNexus:false};
 let release={_id:'release-a',ownerId:user.id,status:'draft',visibility:'private',isFeatured:false,save:async()=>{saves++;}};
 try{
  ReleaseWorld.findOne=async q=>q.ownerId===user.id?release:null;
  ReleaseTrack.find=async q=>{assert.equal(q.ownerId,user.id);assert.equal(String(q.releaseWorldId),'release-a');return [child];};
  CreativeProfile.exists=async()=>false;NexusEditorialConfig.exists=async()=>linked;MusicCollection.exists=async()=>false;
  await assert.rejects(resolvers.Mutation.archiveReleaseWorld(null,{id:'release-a'},{user:{...user,id:'other'}}),/not found/);
  linked=true;await assert.rejects(resolvers.Mutation.archiveReleaseWorld(null,{id:'release-a'},{user}),/references/);assert.equal(saves,0);
  linked=false;const before=JSON.stringify(child);await resolvers.Mutation.archiveReleaseWorld(null,{id:'release-a'},{user});assert.equal(saves,1);assert.equal(release.status,'archived');assert.equal(JSON.stringify(child),before);
 }finally{[ReleaseWorld.findOne,ReleaseTrack.find,CreativeProfile.exists,NexusEditorialConfig.exists,MusicCollection.exists]=originals;}
});
test('Audio identity is owner-only at GraphQL field resolution',()=>{const track={ownerId:user.id,audioContentHash:'a'.repeat(64),sourceFileName:'private song.wav',sourceFileSize:10};for(const key of ['audioContentHash','sourceFileName','sourceFileSize']){assert.equal(resolvers.ReleaseTrack[key](track,null,{user}),track[key]);assert.equal(resolvers.ReleaseTrack[key](track,null,{user:{id:'other'}}),null);assert.equal(resolvers.ReleaseTrack[key](track,null,{}),null);}});
test('Replacing audio clears identity while metadata-only edits retain it',async()=>{
 const originals=[ReleaseTrack.findOne,ReleaseTrack.findOneAndUpdate];let update;
 const track={_id:'t',ownerId:user.id,releaseWorldId:null,title:'Song',slug:'song',audioUrl:'/old.wav',showInNexus:false,nexusReviewStatus:'draft',audioContentHash:'a'.repeat(64)};
 try{
  ReleaseTrack.findOne=async()=>track;
  ReleaseTrack.findOneAndUpdate=async(q,input)=>{assert.equal(q.ownerId,user.id);update=input;return {...track,...input};};
  await resolvers.Mutation.updateReleaseTrack(null,{id:'t',input:{bpm:120}},{user});assert.equal('audioContentHash' in update,false);
  await resolvers.Mutation.updateReleaseTrack(null,{id:'t',input:{audioUrl:'/new.wav'}},{user});assert.equal(update.audioContentHash,null);assert.equal(update.sourceFileName,null);assert.equal(update.sourceFileSize,null);
 }finally{[ReleaseTrack.findOne,ReleaseTrack.findOneAndUpdate]=originals;}
});
