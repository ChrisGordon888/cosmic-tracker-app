const test=require('node:test'),assert=require('node:assert/strict');
const {validateSampler,samplerIds}=require('../lib/realmSampler');
const r=require('../resolvers'),C=require('../models/NexusEditorialConfig');
const tracks=Array.from({length:12},(_,i)=>({_id:String(i),realmId:0,visibility:'public',playbackStatus:'playable',audioUrl:'/fictional.wav',accessTier:'public'}));
test('Sampler validates ordered subset, nine cap, cross-Realm and duplicates',()=>{
 assert.deepEqual(validateSampler(0,['5','2','0'],tracks),['5','2','0']);
 assert.equal(validateSampler(0,tracks.slice(0,9).map(t=>t._id),tracks).length,9);
 assert.throws(()=>validateSampler(0,tracks.slice(0,10).map(t=>t._id),tracks),/nine/);
 assert.throws(()=>validateSampler(303,['0'],tracks),/Realm/);
 assert.throws(()=>validateSampler(0,['0','0'],tracks),/unique/);
 assert.deepEqual(samplerIds({nexusRealmSamplers:[{realmId:0,trackIds:['5','2']},{realmId:303,trackIds:['a']}]},0),['5','2']);
});
test('Sampler mutation authorizes, checks live eligibility, records order/audit and rejects lost updates',async()=>{
 const old=[C.findOne,C.findOneAndUpdate,r.Query.getPublicNexusTracks];let writes=0,conflict=false;
 const config={_id:'config',samplerRevision:0,nexusRealmSamplers:[]};
 const admin={id:'curator',role:'admin',platformPermissions:['nexus.editorial']};
 try{
 C.findOne=async()=>config;r.Query.getPublicNexusTracks=async()=>tracks;
 C.findOneAndUpdate=async(q,u)=>{if(conflict)return null;assert.ok(q.$or||q.samplerRevision===config.samplerRevision);writes++;config.samplerRevision++;config.nexusRealmSamplers=u.$set.nexusRealmSamplers;assert.equal(u.$push.placementHistory.$each[0].destination,'nexus-realm-sampler');assert.equal(u.$push.placementHistory.$each[0].actorId,'curator');return config};
 const save=(ids,revision=config.samplerRevision,user=admin)=>r.Mutation.setNexusRealmSampler(null,{realmId:0,trackIds:ids,expectedRevision:revision},{user});
 for(const user of [null,{id:'a',role:'creator'},{id:'b',role:'creator',platformPermissions:['nexus.editorial']},{role:'admin'}])await assert.rejects(save(['0'],0,user));
 await save(['2','0']);assert.deepEqual(config.nexusRealmSamplers[0].trackIds,['2','0']);assert.equal(writes,1);
 await assert.rejects(save(['1'],0),/Reload/);
 await save(['0','2']);assert.deepEqual(config.nexusRealmSamplers[0].trackIds,['0','2']);
 await assert.rejects(save(['missing']),/eligible/);await assert.rejects(save(tracks.slice(0,10).map(t=>t._id)),/nine/);
 conflict=true;await assert.rejects(save(['0']),/Reload/);conflict=false;
 await save([]);assert.deepEqual(config.nexusRealmSamplers[0].trackIds,[]);
 assert.ok(tracks.every(t=>t.showInNexus===undefined));assert.equal(tracks.length,12);
 }finally{[C.findOne,C.findOneAndUpdate,r.Query.getPublicNexusTracks]=old}
});
