const test=require('node:test'),assert=require('node:assert/strict');
const service=require('../lib/audioFeatures'),Track=require('../models/ReleaseTrack'),Profile=require('../models/AudioFeatureProfile'),resolvers=require('../resolvers');
const id='aaaaaaaaaaaaaaaaaaaaaaaa',ownerId='owner-a';
const valid={audioHash:'a'.repeat(64),analysisVersion:service.VERSION,durationSeconds:10,sampleRate:16000,channelCount:1,rmsDbfs:-20,peakDbfs:-10,variationDb:4,binSeconds:1,rmsEnvelope:Array(10).fill(-20),peaks:Array(256).fill(.3),changeCandidates:[]};
test('Audio contract rejects invalid, oversized, unbounded and inconsistent browser output',()=>{
 assert.equal(service.MeasurementSchema.parse(valid).sampleRate,16000);
 for(const patch of [{durationSeconds:601},{sampleRate:44100},{rmsDbfs:NaN},{peaks:[]},{rmsEnvelope:[-20]},{peakDbfs:-30},{changeCandidates:[{timeSeconds:9,deltaDb:10}]},{url:'https://client-supplied.invalid'}])assert.throws(()=>service.MeasurementSchema.parse({...valid,...patch}));
});
test('Audio cache is owner scoped, version/source bound; changed files hide measurements and cannot be saved as current',async()=>{
 const old=[Track.findOne,Profile.findOne,Profile.findOneAndUpdate];
 let track={_id:id,ownerId,audioUrl:'/owned.wav',audioContentHash:valid.audioHash,sourceFileSize:100},stored=null,writes=0;
 Track.findOne=q=>({select(){return this;},lean:async()=>{assert.deepEqual(q.catalogTreatment,{$nin:['vault','test']});return q.ownerId===ownerId?track:null;}});
 Profile.findOne=q=>({lean:async()=>{assert.equal(q.ownerId,ownerId);return stored;}});
 Profile.findOneAndUpdate=async(q,u)=>{assert.equal(q.ownerId,ownerId);writes++;stored={...q,...u.$set};return stored;};
 try{
  await assert.rejects(()=>service.state('foreign',id));await assert.rejects(()=>service.save('foreign',id,'x',valid));assert.equal(writes,0);
  const initial=await service.state(ownerId,id);assert.equal(initial.status,'NOT_ANALYZED');assert.equal(initial.source.audioUrl,'/owned.wav');
  const saved=await service.save(ownerId,id,initial.sourceIdentity,valid);assert.equal(saved.status,'READY');assert.equal((await service.state(ownerId,id)).profile.audioHash,valid.audioHash);assert.equal(writes,1);
  await assert.rejects(()=>service.save(ownerId,id,initial.sourceIdentity,{...valid,audioHash:'b'.repeat(64)}),/differs/);
  track={...track,audioUrl:'/replacement.wav'};const stale=await service.state(ownerId,id);assert.equal(stale.status,'STALE');assert.equal(stale.profile,null);
  await assert.rejects(()=>service.save(ownerId,id,initial.sourceIdentity,valid),/changed/);assert.equal(writes,1);
  assert.equal(service.currentProfile(track,{...stored,sourceIdentity:service.sourceIdentity(track),analysisVersion:'old'}),null);
  await assert.rejects(()=>resolvers.Query.songAudioState(null,{trackId:id},{}));
  await assert.rejects(()=>resolvers.Mutation.saveSongAudioMeasurements(null,{trackId:id,sourceIdentity:'x',input:valid},{}));
 }finally{[Track.findOne,Profile.findOne,Profile.findOneAndUpdate]=old;}
});
test('Project audio list excludes stale profiles and queries only current owned sources',async()=>{
 const old=[Track.find,Profile.find];const track={_id:id,audioUrl:'/owned.wav'};
 Track.find=q=>({select(){return this;},lean:async()=>{assert.equal(q.ownerId,ownerId);assert.deepEqual(q.catalogTreatment,{$nin:['vault','test']});return [track];}});
 Profile.find=q=>({lean:async()=>{assert.equal(q.ownerId,ownerId);assert.deepEqual(q.trackId.$in,[id]);return [{trackId:id,sourceIdentity:service.sourceIdentity(track),analysisVersion:service.VERSION},{trackId:'foreign',sourceIdentity:'x'},{trackId:id,sourceIdentity:'stale'}];}});
 try{assert.equal((await service.list(ownerId)).length,1);}finally{[Track.find,Profile.find]=old;}
});
test('Current audio enters model evidence as measurements only, invalidates reflections, and never fetches audio',async()=>{
 const reason=require('../lib/songReasoning');const old=[Track.findOne,Profile.findOne,Track.find];
 const track={_id:id,ownerId,audioUrl:'/owned.wav',audioContentHash:valid.audioHash,sourceFileSize:100,title:'Fixture',realmId:0,creativeSignals:[]};let stored=null;
 Track.findOne=q=>({select(){return this;},lean:async()=>q.ownerId===ownerId?track:null});
 Track.find=()=>{assert.fail('no related retrieval needed');};
 Profile.findOne=q=>({lean:async()=>{assert.equal(q.ownerId,ownerId);return stored;}});
 try{
  const before=await reason.snapshot(ownerId,id);stored={...valid,trackId:id,sourceIdentity:service.sourceIdentity(track)};const after=await reason.snapshot(ownerId,id);
  assert.notEqual(before.inputHash,after.inputHash);assert.ok(after.evidence.some(e=>e.type==='AUDIO_MEASUREMENT'&&e.summary.includes('Owner-browser')));
  assert.equal(JSON.stringify(after.evidence).includes('/owned.wav'),false);
  stored.sourceIdentity='stale';const stale=await reason.snapshot(ownerId,id);assert.ok(!stale.evidence.some(e=>e.type==='AUDIO_MEASUREMENT'));
 }finally{[Track.findOne,Profile.findOne,Track.find]=old;}
});
