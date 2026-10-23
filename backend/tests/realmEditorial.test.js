const test=require('node:test'),assert=require('node:assert/strict');
const r=require('../resolvers'),W=require('../models/ReleaseWorld'),T=require('../models/ReleaseTrack'),C=require('../models/NexusEditorialConfig'),U=require('../models/User'),P=require('../models/CreativeProfile');
const owner='aaaaaaaaaaaaaaaaaaaaaaaa',editor={id:'editor',role:'admin',platformPermissions:['nexus.editorial']};
test('Explicit independent Realm admission, exact soundtrack tuple, withdrawal, owner safety and legacy approval',async()=>{
 const old=[W.find,W.findOne,T.find,T.findOne,C.findOne,C.findOneAndUpdate,U.exists,P.findOne];
 const world={_id:'bbbbbbbbbbbbbbbbbbbbbbbb',ownerId:owner,creativeProfileId:'profile',visibility:'public',status:'active',publicCanon:false};
 const track={_id:'cccccccccccccccccccccccc',ownerId:owner,releaseWorldId:world._id,realmId:0,visibility:'listed',status:'released',playbackStatus:'playable',audioUrl:'/fixture.wav',nexusReviewStatus:'in-review',showInNexus:false};
 const config={_id:'config',realmDiscovery:[],realmSoundtracks:[],soundtrackWithdrawnTrackIds:[],selectedWorldIds:[]};let suspended=false;
 function match(doc,q){return Object.entries(q).every(([k,v])=>k==='$and'?v.every(x=>match(doc,x)):k==='$or'?v.some(x=>match(doc,x)):v&&typeof v==='object'?Object.entries(v).every(([op,val])=>op==='$ne'?doc[k]!==val:op==='$in'?val.includes(doc[k]):op==='$nin'?!val.includes(doc[k]):op==='$exists'?(doc[k]!==undefined)===val:true):doc[k]===v);}
 W.find=q=>({select:async()=>match(world,q)?[world]:[],sort:async()=>q.status==='scheduled'?[]:match(world,q)?[world]:[]});W.findOne=async q=>match(world,q)?world:null;T.find=q=>({sort:async()=>match(track,q)?[track]:[]});T.findOne=async q=>match(track,q)?track:null;
 U.exists=async q=>{assert.equal(q.creatorStatus.$ne,'suspended');return suspended?null:{_id:owner}};P.findOne=async()=>({artistName:'Fixture'});C.findOne=async()=>config;
 C.findOneAndUpdate=async(q,u)=>{for(const [f,v]of Object.entries(u.$addToSet||{}))if(!config[f].some(x=>JSON.stringify(x)===JSON.stringify(v)))config[f].push(v);for(const [f,v]of Object.entries(u.$pull||{}))config[f]=config[f].filter(x=>typeof v==='object'?!match(x,v):x!==v);return config;};
 const music=(nexusOnly=false)=>r.Query.getPublicNexusTracks(null,{realmId:track.realmId,nexusOnly});
 try{
 for(const user of [null,{id:owner,role:'creator',creatorStatus:'active'},{id:'b',role:'creator',creatorStatus:'active'}])for(const method of ['setRealmDiscovery','setRealmSoundtrack'])await assert.rejects(r.Mutation[method](null,{worldId:world._id,trackId:track._id,realmId:0,selected:true},{user}));
 assert.deepEqual(await music(),[]);assert.deepEqual(await r.Query.publicProjects(null,{discoveryOnly:true,realmId:0}),[]);
 await r.Mutation.setRealmDiscovery(null,{worldId:world._id,realmId:0,selected:true},{user:editor});assert.equal((await r.Query.publicProjects(null,{discoveryOnly:true,realmId:0})).length,1);assert.deepEqual(await music(),[]);
 await assert.rejects(r.Mutation.setRealmSoundtrack(null,{trackId:track._id,realmId:0,selected:true},{user:editor}),/Approve/);track.nexusReviewStatus='approved';
 for(let i=0;i<2;i++)await r.Mutation.setRealmSoundtrack(null,{trackId:track._id,realmId:0,selected:true},{user:editor});assert.equal(config.realmSoundtracks.length,1);assert.equal((await music()).length,1);assert.deepEqual(await music(true),[]);assert.equal(track.nexusReviewStatus,'approved');assert.equal(world.publicCanon,false);
 track.realmId=303;assert.deepEqual(await music(),[]);track.realmId=0;suspended=true;assert.deepEqual(await music(),[]);assert.deepEqual(await r.Query.publicProjects(null,{discoveryOnly:true,realmId:0}),[]);suspended=false;world.visibility='private';assert.deepEqual(await music(),[]);world.visibility='public';
 await r.Mutation.setRealmSoundtrack(null,{trackId:track._id,realmId:0,selected:false},{user:editor});assert.deepEqual(await music(),[]);config.soundtrackWithdrawnTrackIds=[];track.showInNexus=true;track.nexusReviewStatus='published';assert.equal((await music()).length,0);assert.equal((await music(true)).length,1);
 }finally{[W.find,W.findOne,T.find,T.findOne,C.findOne,C.findOneAndUpdate,U.exists,P.findOne]=old;}
});
