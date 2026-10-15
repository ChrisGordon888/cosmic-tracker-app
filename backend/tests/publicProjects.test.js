const test = require('node:test'), assert = require('node:assert/strict');
const { projectTrackFilter, projectRealm } = require('../lib/publicProjects');
const r = require('../resolvers'), W = require('../models/ReleaseWorld'), T = require('../models/ReleaseTrack'), C = require('../models/NexusEditorialConfig'), U = require('../models/User'), P = require('../models/CreativeProfile');
const owner = 'aaaaaaaaaaaaaaaaaaaaaaaa', editor = { id: 'editor', role: 'creator', platformPermissions: ['nexus.editorial'] };
async function fixture(fn) {
 const originals = [W.find, W.findOne, T.find, C.findOne, C.findOneAndUpdate, U.exists, P.findOne];
 const state = { worlds: ['a','b','c'].map(id => ({ _id: id, ownerId: owner, creativeProfileId: 'profile', publicCanon: true, visibility: 'public', status: 'active' })), selected: ['b','a'], writes: [] };
 U.exists = async q => q._id === owner ? { _id: owner } : null;
 P.findOne = async q => q.ownerId === owner && q._id === 'profile' ? { artistName: 'Artist A' } : null;
 const eligible = (w,q) => w.publicCanon === q.publicCanon && w.visibility === q.visibility && w.status !== q.status.$ne;
 W.find = q => ({ sort: async order => { assert.deepEqual(order, {updatedAt:-1,_id:1}); return state.worlds.filter(w => eligible(w,q) && (!q._id || q._id.$in.includes(w._id))); } });
 W.findOne = async q => state.worlds.find(w => w._id === q._id && eligible(w,q));
 T.find = q => ({ sort: async order => { assert.equal(q.ownerId, owner); assert.equal(order.trackNumber,1); assert.deepEqual(q.$or[0],{visibility:{$in:['public','listed']}}); assert.equal(q.publicCanon,undefined); return [{id:'listed',visibility:'listed',publicCanon:false,realmId:101,isFocusTrack:true}]; } });
 C.findOne = async () => ({_id:'config',selectedWorldIds:state.selected});
 C.findOneAndUpdate = async (q,u) => { state.writes.push(u); if(u.$addToSet) state.selected = [...new Set([...state.selected,u.$addToSet.selectedWorldIds])]; if(u.$pull) state.selected = state.selected.filter(id=>id!==u.$pull.selectedWorldIds); return {selectedWorldIds:state.selected}; };
 try { await fn(state); } finally { [W.find,W.findOne,T.find,C.findOne,C.findOneAndUpdate,U.exists,P.findOne] = originals; }
}
test('Public Worlds use current eligibility, stored selection order, owner attribution and contextual Listed tracks',()=>fixture(async s=>{
 const rows=await r.Query.publicProjects(null,{}); assert.deepEqual(rows.map(p=>p.world._id),['b','a','c']); assert.deepEqual(rows.map(p=>p.isSelected),[true,true,false]); assert.equal(rows[0].creatorName,'Artist A'); assert.equal(rows[0].tracks[0].publicCanon,false); assert.equal(rows[0].realmId,101);
 assert.equal((await r.Query.publicProjects(null,{selectedOnly:true})).length,2);
 s.selected=[]; assert.deepEqual((await r.Query.publicProjects(null,{})).map(p=>p.world._id),['a','b','c']);
}));
test('Canon withdrawal, private/archive and invalid owner/profile cannot surface even with stale selections',()=>fixture(async s=>{
 for(const change of [{publicCanon:false},{visibility:'private'},{status:'archived'},{ownerId:'bbbbbbbbbbbbbbbbbbbbbbbb'},{ownerId:'invalid'},{creativeProfileId:'other-owner-profile'}]) {
  const original={...s.worlds[0]}; Object.assign(s.worlds[0],change);
  assert.ok(!(await r.Query.publicProjects(null,{selectedOnly:true})).some(p=>p.world._id==='a'));
  await assert.rejects(r.Mutation.setNexusProjectSelection(null,{worldId:'a',selected:true},{user:editor}),/public Canon/);
  s.worlds[0]=original;
 }
}));
test('Ordinary creator cannot select or deselect; delegated editor and owner can persist references only',()=>fixture(async s=>{
 for(const selected of [true,false]) await assert.rejects(r.Mutation.setNexusProjectSelection(null,{worldId:'c',selected},{user:{id:owner,role:'creator',creatorStatus:'active'}}),/editorial/);
 await r.Mutation.setNexusProjectSelection(null,{worldId:'c',selected:true},{user:editor});
 assert.ok(s.selected.includes('c')); assert.deepEqual(s.writes[0],{$addToSet:{selectedWorldIds:'c'},$set:{updatedBy:'editor'}});
 await r.Mutation.setNexusProjectSelection(null,{worldId:'c',selected:false},{user:{id:'owner',role:'owner'}});
 assert.ok(!s.selected.includes('c')); assert.deepEqual(s.writes[1],{$pull:{selectedWorldIds:'c'},$set:{updatedBy:'owner'}}); assert.ok(s.worlds.every(w=>w.publicCanon));
 s.worlds[0].publicCanon=false; await r.Mutation.setNexusProjectSelection(null,{worldId:'a',selected:false},{user:editor}); assert.ok(!s.selected.includes('a'));
}));
test('Project Realm derives from focus or unanimous child context; protected children excluded',()=>{
 assert.equal(projectRealm([{realmId:202,isFocusTrack:true},{realmId:303}]),202); assert.equal(projectRealm([{realmId:202},{realmId:303}]),null); assert.equal(projectRealm([]),null); assert.deepEqual(projectTrackFilter({_id:'w',ownerId:'a'}).catalogTreatment,{$nin:['vault','test']});
});
test('Project GraphQL document matches schema',()=>{const {makeExecutableSchema}=require('@graphql-tools/schema'),{parse,validate}=require('graphql'),fs=require('node:fs'); const schema=makeExecutableSchema({typeDefs:require('../schemas'),resolvers:r}); const source=fs.readFileSync('../frontend/src/graphql/publicProjects.ts','utf8'); assert.deepEqual(validate(schema,parse(source.match(/gql`([\s\S]*?)`/)[1])).map(e=>e.message),[]);});
test('Six-track contextual project preserves sequence and Listed playback metadata independently of Canon songs',()=>fixture(async()=>{
 T.find=q=>({sort:async order=>{assert.equal(order.trackNumber,1);return Array.from({length:6},(_,i)=>({id:`sin-${i+1}`,trackNumber:i+1,visibility:'listed',publicCanon:false,audioUrl:`/${i+1}.mp3`}));}});
 const [p]=await r.Query.publicProjects(null,{});assert.deepEqual(p.tracks.map(t=>t.trackNumber),[1,2,3,4,5,6]);assert.ok(p.tracks.every(t=>t.visibility==='listed'&&!t.publicCanon&&t.audioUrl));
}));
test('Multiple creators retain their own profile attribution and owner-scoped child queries',()=>fixture(async s=>{
 const second='bbbbbbbbbbbbbbbbbbbbbbbb';s.worlds[1].ownerId=second;s.worlds[1].creativeProfileId='second-profile';
 U.exists=async()=>({_id:'exists'});
 P.findOne=async q=>q._id==='second-profile'&&q.ownerId===second?{artistName:'Artist B'}:q._id==='profile'&&q.ownerId===owner?{artistName:'Artist A'}:null;
 T.find=q=>({sort:async()=>[{id:`${q.ownerId}-track`,realmId:101}]});
 const rows=await r.Query.publicProjects(null,{});assert.equal(rows[0].creatorName,'Artist B');assert.equal(rows[0].tracks[0].id,`${second}-track`);assert.equal(rows[1].creatorName,'Artist A');assert.equal(rows[1].tracks[0].id,`${owner}-track`);
}));
test('Four creator Canon Worlds are eligible; only A2/B1 enter selected query, deselection preserves Canon',()=>fixture(async s=>{
 s.worlds=['A1','A2','A3','B1'].map(id=>({_id:id,ownerId:owner,creativeProfileId:'profile',publicCanon:true,visibility:'public',status:'active'}));s.selected=['A2','B1'];
 const b='bbbbbbbbbbbbbbbbbbbbbbbb';s.worlds[3].ownerId=b;s.worlds[3].creativeProfileId='b-profile';U.exists=async()=>({_id:'exists'});P.findOne=async q=>({artistName:q.ownerId===b?'Artist B':'Artist A'});T.find=()=>({sort:async()=>[]});
 assert.equal((await r.Query.publicProjects(null,{})).length,4);assert.deepEqual((await r.Query.publicProjects(null,{selectedOnly:true})).map(p=>p.world._id),['A2','B1']);
 await r.Mutation.setNexusProjectSelection(null,{worldId:'A2',selected:false},{user:editor});assert.deepEqual((await r.Query.publicProjects(null,{selectedOnly:true})).map(p=>p.world._id),['B1']);assert.equal(s.worlds[1].publicCanon,true);
 s.worlds[3].publicCanon=false;assert.equal((await r.Query.publicProjects(null,{selectedOnly:true})).length,0);
}));
