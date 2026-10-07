const test=require('node:test'),assert=require('node:assert/strict');
const resolvers=require('../resolvers'),Track=require('../models/ReleaseTrack');
const {realmDecision,signals}=require('../lib/creativeFingerprint');
const user={id:'owner-a',role:'creator',creatorStatus:'active'};
test('Signals use atomic owner-scoped add/remove without Realm writes',async()=>{
 const original=Track.findOneAndUpdate;let calls=[];
 try{
  Track.findOneAndUpdate=async(filter,update)=>{calls.push({filter,update});return filter._id==='missing'?null:{id:filter._id,ownerId:user.id,creativeSignals:['defiant'],realmId:101};};
  const invoke=(signal,enabled,id='song')=>resolvers.Mutation.setTrackCreativeSignal(null,{id,signal,enabled},{user});
  assert.equal((await invoke('defiant',true)).realmId,101);
  await invoke('defiant',false);
  assert.deepEqual(calls[0],{filter:{_id:'song',ownerId:user.id},update:{$addToSet:{creativeSignals:'defiant'}}});
  assert.deepEqual(calls[1].update,{$pull:{creativeSignals:'defiant'}});
  await assert.rejects(invoke('invented',true),/Unknown/);
  await assert.rejects(invoke('defiant',true,'missing'),/not found/);
  await assert.rejects(resolvers.Mutation.setTrackCreativeSignal(null,{id:'song',signal:'defiant',enabled:true},{user:null}));
 }finally{Track.findOneAndUpdate=original;}
});
test('Private fingerprint fields are inaccessible even on a public track',()=>{
 const track={ownerId:user.id,creativeSignals:['defiant'],creativeDecisions:[]};
 for(const field of ['creativeSignals','creativeDecisions']){
  assert.equal(resolvers.ReleaseTrack[field](track,null,{user:null}),null);
  assert.equal(resolvers.ReleaseTrack[field](track,null,{user:{id:'owner-b',role:'creator'}}),null);
  assert.deepEqual(resolvers.ReleaseTrack[field](track,null,{user}),track[field]);
 }
});
test('Confirmation and rejection history validate Realm zero and preserve evidence',()=>{
 const track={creativeSignals:['peaceful']};
 assert.equal(realmDecision({action:'accepted',suggestedRealmId:0},0,track).realmId,0);
 const override=realmDecision({action:'overridden',suggestedRealmId:303},101,track);
 assert.equal(override.action,'overridden');assert.deepEqual(override.signals,['peaceful']);
 assert.throws(()=>realmDecision({action:'accepted',suggestedRealmId:303},101,track));
 assert.throws(()=>realmDecision({action:'manual'},999,track));
});
test('Signal schema persists bounded curated vocabulary and decision documents',async()=>{
 const track=new Track({ownerId:user.id,title:'Fixture',slug:'fixture',creativeSignals:['defiant'],creativeDecisions:[realmDecision({action:'manual'},303,{creativeSignals:['defiant']})]});
 await track.validate();assert.equal(track.toObject().creativeSignals[0],'defiant');
 track.creativeSignals=['unknown'];await assert.rejects(track.validate());
 assert.equal(new Set(signals).size,signals.length);
});
test('Inline and Library GraphQL documents validate against actual backend schema',()=>{
 const {buildASTSchema,parse,validate}=require('graphql');const fs=require('node:fs');
 const schema=buildASTSchema(require('../schemas'));
 for(const path of ['../../frontend/src/app/creator/library/page.tsx','../../frontend/src/components/creator/InlineTrackSignals.tsx']){
  const source=fs.readFileSync(require('node:path').join(__dirname,path),'utf8');
  for(const match of source.matchAll(/gql\s*`([^`]+)`/g)) assert.deepEqual(validate(schema,parse(match[1])),[]);
 }
});
test('Real Realm update preserves owner guard and appends bounded calibration atomically',async()=>{
 const original=[Track.findOne,Track.findOneAndUpdate];let saved;
 const track={_id:'song',ownerId:user.id,title:'Fixture',slug:'fixture',releaseWorldId:null,realmId:null,creativeSignals:['defiant'],visibility:'private',catalogTreatment:'current',nexusReviewStatus:'draft'};
 try{
  Track.findOne=async q=>{assert.equal(q.ownerId,user.id);return track;};
  Track.findOneAndUpdate=async(q,update)=>{assert.equal(q.ownerId,user.id);saved=update;return {...track,...update};};
  await resolvers.Mutation.updateReleaseTrack(null,{id:'song',input:{realmId:303,creativeDecision:{action:'accepted',suggestedRealmId:303}}},{user});
  assert.equal(saved.realmId,303);assert.equal(saved.creativeDecision,undefined);
  assert.equal(saved.$push.creativeDecisions.$slice,-20);
  assert.equal(saved.$push.creativeDecisions.$each[0].action,'accepted');
  Track.findOne=async()=>null;
  await assert.rejects(resolvers.Mutation.updateReleaseTrack(null,{id:'song',input:{realmId:101,creativeDecision:{action:'manual'}}},{user}),/not found/);
 }finally{[Track.findOne,Track.findOneAndUpdate]=original;}
});
