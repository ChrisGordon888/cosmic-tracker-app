const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs');
const r=require('../resolvers'),C=require('../models/NexusEditorialConfig');
test('Studio snapshot is authorized and never initializes missing configuration',async()=>{
 const old=C.findOne;let calls=0;
 try{C.findOne=async q=>{calls++;assert.deepEqual(q,{key:'global'});return null;};
 for(const user of [null,{role:'creator',id:'a',platformPermissions:['nexus.editorial']},{role:'admin',id:'s',creatorStatus:'suspended'}])await assert.rejects(r.Query.editorialStudioConfig(null,{}, {user}));
 assert.equal(calls,0);
 assert.equal(await r.Query.editorialStudioConfig(null,{}, {user:{role:'admin',id:'r'}}),null);assert.equal(calls,1);
 }finally{C.findOne=old;}
});
test('Studio documents validate, request no private media and contain only queries',()=>{
 const {makeExecutableSchema}=require('@graphql-tools/schema'),{parse,validate}=require('graphql');
 const schema=makeExecutableSchema({typeDefs:require('../schemas'),resolvers:r});
 const source=fs.readFileSync('../frontend/src/graphql/editorialStudio.ts','utf8');
 for(const match of source.matchAll(/gql`([\s\S]*?)`/g)){const doc=parse(match[1]);assert.deepEqual(validate(schema,doc).map(e=>e.message),[]);assert.ok(doc.definitions.every(d=>['query','mutation'].includes(d.operation)));assert.doesNotMatch(match[1],/\b(audioUrl|previewAudioUrl|nexusEditorialConfig|getPublicNexusTracks|notes|hook)\b/);}
});
test('Assessments distinguish approval, publication, soundtrack and anonymous sampler eligibility',async()=>{
 const {assessEditorial}=require('../lib/editorialAssessment');
 const base={track:{_id:'song',nexusReviewStatus:'approved',showInNexus:false},world:{_id:'world',publicCanon:false},capabilities:{canReview:true,canPublish:true,canPlace:true},config:{},anonymousPlayable:true,publicSource:false};
 const actions=async patch=>Object.fromEntries((await assessEditorial({...base,...patch})).actions.map(a=>[a.name,a]));
 let a=await actions({});assert.equal(a.publish.allowed,true);assert.equal(a.soundtrack.allowed,true);assert.equal(a.sampler.allowed,false);assert.equal(a.world.allowed,false);assert.equal(a.discovery.allowed,true);assert.equal(a.approve.allowed,false);
 a=await actions({sourceProblem:'Creator account is ineligible.',anonymousPlayable:false});for(const name of ['publish','soundtrack','sampler','spotlight','anchor'])assert.equal(a[name].allowed,false);assert.equal(a.withdraw.allowed,true);
 a=await actions({capabilities:{canReview:true,canPublish:false,canPlace:false}});assert.equal(a.publish.allowed,false);assert.equal(a.soundtrack.allowed,false);assert.equal(a.withdraw.allowed,false);
 a=await actions({track:{_id:'song',nexusReviewStatus:'in-review'},publicationProblem:'Choose a valid Realm.'});assert.equal(a.approve.allowed,false);assert.equal(a['needs-changes'].allowed,true);
});
test('Anonymous delivery reuses public readers with a private no-scheduling sentinel and returns IDs only',async()=>{
 const original=[r.Query.getPublicNexusTracks,r.Query.publicProjects,C.findOne];let reads=0;
 try{
 C.findOne=async()=>({featuredTrackId:null});
 r.Query.getPublicNexusTracks=async(_,args,context,mode)=>{assert.equal(typeof mode,'symbol');assert.deepEqual(context,{});reads++;return[{_id:args.samplerOnly?'sampler':args.nexusOnly?'nexus':'soundtrack',audioUrl:'never-return-this'}];};
 r.Query.publicProjects=async(_,args)=>[{world:{_id:args.discoveryOnly?'discovery':'world',privateNotes:'never-return-this'}}];
 const data=await r.Query.publicEditorialDelivery(null,{realmId:0});assert.equal(reads,3);assert.deepEqual(data.soundtrackIds,['soundtrack']);assert.deepEqual(data.samplerIds,['sampler']);assert.deepEqual(data.worldIds,['world']);assert.doesNotMatch(JSON.stringify(data),/never-return/);await assert.rejects(r.Query.publicEditorialDelivery(null,{realmId:999}));
 }finally{[r.Query.getPublicNexusTracks,r.Query.publicProjects,C.findOne]=original;}
});
test('Assessment boundary denies unauthorized users, including forged grants, before accessing records',async()=>{
 for(const user of [null,{id:'x',role:'creator',platformPermissions:['nexus.editorial']},{id:'s',role:'admin',creatorStatus:'suspended'}])await assert.rejects(r.Query.editorialStudioAssessment(null,{trackIds:['a'],worldIds:[]},{user}));
 await assert.rejects(r.Query.editorialStudioAssessment(null,{trackIds:[],worldIds:['w']},{user:{id:'r',role:'admin'}}));
 await assert.rejects(r.Query.editorialStudioAssessment(null,{trackIds:Array(501).fill('a'),worldIds:[]},{user:{id:'r',role:'admin'}}),/500/);
});
