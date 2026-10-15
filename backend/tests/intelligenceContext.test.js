const test = require('node:test'), assert = require('node:assert/strict');
const resolvers = require('../resolvers'), Track = require('../models/ReleaseTrack'), World = require('../models/ReleaseWorld'), Feedback = require('../models/HypothesisFeedback');
const { contextInput, feedbackIdentity } = require('../lib/intelligenceContext');
const id = 'aaaaaaaaaaaaaaaaaaaaaaaa', user = { id: 'owner-a', role: 'creator', creatorStatus: 'active' };
const input = { subjectType: 'track', subjectId: id, hypothesisType: 'bridge', engineVersion: 'workbench-v3.1', evidenceHash: '123abc', response: 'RESONATES' };
test('Context validates optional patches, clear semantics and strict bounds', () => {
 assert.deepEqual(contextInput({meaning:' One thought ',emotionalStart:null}), {'creatorContext.meaning':'One thought','creatorContext.emotionalStart':''});
 for (const value of [{meaning:'a'.repeat(4001)},{emotionalStart:'a'.repeat(501)},{creatorRole:4},{ownerId:'foreign'}]) assert.throws(()=>contextInput(value));
 assert.ok(Track.schema.path('creatorContext.meaning'));
});
test('Owner creates, edits and clears context without changing existing metadata; other owners denied', async () => {
 const old=Track.findOneAndUpdate, state={notes:'preserve',hook:'preserve',realmId:0};
 Track.findOneAndUpdate=async(q,update,options)=>{assert.equal(options.runValidators,true);if(q.ownerId!==user.id)return null;assert.equal(q._id,id);Object.assign(state,update.$set);return state;};
 try {
  for(const meaning of ['one sentence','edited','']) await resolvers.Mutation.saveSongContext(null,{trackId:id,input:{meaning}},{user});
  assert.equal(state['creatorContext.meaning'],'');assert.equal(state.notes,'preserve');assert.equal(state.hook,'preserve');assert.equal(state.realmId,0);
  await assert.rejects(()=>resolvers.Mutation.saveSongContext(null,{trackId:id,input:{meaning:'intrusion'}},{user:{...user,id:'owner-b'}}));
  await assert.rejects(()=>resolvers.Mutation.saveSongContext(null,{trackId:id,input:{meaning:'x'}},{}));
  assert.equal(resolvers.ReleaseTrack.creatorContext({ownerId:user.id,creatorContext:{meaning:'secret'}},null,{user:{...user,id:'owner-b'}}),null);
 } finally {Track.findOneAndUpdate=old;}
});
test('Feedback validates stable identity and changed evidence, owner subjects, all responses and deletion', async () => {
 const old=[Track.exists,World.exists,Feedback.findOneAndUpdate,Feedback.deleteOne,Feedback.find];const records=new Map();
 Track.exists=World.exists=async q=>q._id===id&&q.ownerId===user.id;
 Feedback.findOneAndUpdate=async(q,update)=>{assert.equal(q.ownerId,user.id);const record={...q,...update.$set};records.set(q.hypothesisKey,record);return record;};
 Feedback.deleteOne=async q=>{assert.equal(q.ownerId,user.id);records.delete(q.hypothesisKey);};
 Feedback.find=q=>({sort:async()=>Array.from(records.values()).filter(r=>r.ownerId===q.ownerId)});
 try {
  assert.equal(feedbackIdentity(input),feedbackIdentity({...input,response:'NOT_REALLY'}));assert.notEqual(feedbackIdentity(input),feedbackIdentity({...input,evidenceHash:'456def'}));
  for(const response of ['RESONATES','INTERESTING','NOT_REALLY']) assert.equal((await resolvers.Mutation.respondToHypothesis(null,{input:{...input,response}},{user})).response,response);
  assert.equal(records.size,1);
  await assert.rejects(()=>resolvers.Mutation.respondToHypothesis(null,{input},{user:{...user,id:'owner-b'}}));
  await assert.rejects(()=>resolvers.Mutation.respondToHypothesis(null,{input},{}));
  for(const patch of [{subjectId:'bad'},{hypothesisType:'fact'},{note:'x'.repeat(2001)},{response:'invalid'},{engineVersion:'bad space'}]) await assert.rejects(()=>resolvers.Mutation.respondToHypothesis(null,{input:{...input,...patch}},{user}));
  assert.deepEqual(await resolvers.Query.myHypothesisFeedback(null,{},{user:{...user,id:'owner-b'}}),[]);
  await resolvers.Mutation.respondToHypothesis(null,{input:{...input,response:null}},{user});assert.equal(records.size,0);
 } finally {[Track.exists,World.exists,Feedback.findOneAndUpdate,Feedback.deleteOne,Feedback.find]=old;}
});
test('Every intelligence GraphQL document matches the server',()=>{
 const {makeExecutableSchema}=require('@graphql-tools/schema'),{parse,validate}=require('graphql'),fs=require('node:fs');
 const schema=makeExecutableSchema({typeDefs:require('../schemas'),resolvers});
 for(const m of fs.readFileSync('../frontend/src/graphql/intelligence.ts','utf8').matchAll(/gql`([\s\S]*?)`/g)) assert.deepEqual(validate(schema,parse(m[1])).map(e=>e.message),[]);
});
test('Song moments validate times/text and preserve owner boundaries for CRUD and read',async()=>{
 const {momentInput}=require('../lib/songMoments');
 const valid={timeSeconds:74,type:'TURN',note:'Creator marked'};
 assert.equal(momentInput(valid).timeSeconds,74);
 for(const patch of [{timeSeconds:-1},{timeSeconds:Infinity},{timeSeconds:86401},{endTimeSeconds:70},{note:'x'.repeat(2001)},{type:'AI_DETECTED'}])assert.throws(()=>momentInput({...valid,...patch}));
 const oldUpdate=Track.findOneAndUpdate,oldFind=Track.findOne;const writes=[];
 Track.findOneAndUpdate=async(q,u)=>{if(q.ownerId!==user.id)return null;writes.push({q,u});return {_id:id,ownerId:user.id};};
 Track.findOne=async q=>{assert.equal(q.ownerId,user.id);assert.deepEqual(q.catalogTreatment,{$nin:['vault','test']});return {_id:id};};
 try{
  await resolvers.Mutation.saveSongMoment(null,{trackId:id,input:valid},{user});assert.ok(writes[0].u.$push.songMoments);assert.ok(writes[0].q.$expr);
  await resolvers.Mutation.saveSongMoment(null,{trackId:id,momentId:id,input:{...valid,timeSeconds:80}},{user});assert.equal(writes[1].u.$set['songMoments.$.timeSeconds'],80);
  await resolvers.Mutation.deleteSongMoment(null,{trackId:id,momentId:id},{user});assert.equal(writes[2].u.$pull.songMoments._id,id);
  for(const op of ['saveSongMoment','deleteSongMoment'])await assert.rejects(()=>resolvers.Mutation[op](null,{trackId:id,momentId:id,input:valid},{user:{...user,id:'foreign'}}));
  await assert.rejects(()=>resolvers.Query.songLabTrack(null,{trackId:id},{}));await resolvers.Query.songLabTrack(null,{trackId:id},{user});
  assert.equal(resolvers.ReleaseTrack.songMoments({ownerId:user.id,songMoments:[valid]},null,{user:{...user,id:'foreign'}}),null);
  assert.deepEqual(resolvers.ReleaseTrack.songMoments({ownerId:user.id,songMoments:[{timeSeconds:80},{timeSeconds:2}]},null,{user}).map(m=>m.timeSeconds),[2,80]);
 }finally{Track.findOneAndUpdate=oldUpdate;Track.findOne=oldFind;}
});
