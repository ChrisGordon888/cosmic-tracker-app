const test=require('node:test'),assert=require('node:assert/strict');
const {planMigration,worldDocument,assertLocalApply}=require('../lib/curatedWorldMigration');
const candidates=require('../migrations/curatedWorlds.v1.json');
const fixture=()=>({ownerId:'owner',profileId:'profile',profiles:[{_id:'profile',ownerId:'owner'}],worlds:[],tracks:candidates.flatMap(c=>c.trackIds.map((id,index)=>({_id:id,ownerId:'owner',legacyRegistryId:id,releaseWorldId:null,realmId:c.realmId,trackNumber:index+1,publicCanon:index===0,visibility:'private',audioUrl:'/unchanged.wav',nexusReviewStatus:'draft'}))),artworkExists:()=>true});
test('Dry-run resolves six exact ordered owner-scoped candidates and does not mutate input',()=>{const data=fixture(),before=JSON.stringify(data);const plans=planMigration(data);assert.equal(plans.filter(p=>p.status==='ready').length,6);assert.equal(JSON.stringify(data),before);assert.deepEqual(plans[0].trackIds,candidates[0].trackIds);});
test('Missing, duplicated, foreign-owner, linked and Realm-ambiguous tracks are not guessed',()=>{for(const change of [d=>d.tracks.shift(),d=>d.tracks.push({...d.tracks[0]}),d=>d.tracks[0].ownerId='other',d=>d.tracks[0].releaseWorldId='sin',d=>d.tracks[0].realmId=44]){const data=fixture();change(data);assert.equal(planMigration(data)[0].status,'skip');}});
test('Missing artwork or unowned profile prevents migration',()=>{const data=fixture();data.artworkExists=()=>false;assert.ok(planMigration(data).every(p=>p.status==='skip'));data.artworkExists=()=>true;data.profileId='foreign';assert.ok(planMigration(data).every(p=>p.status==='skip'));});
test('Existing title or migration slug is idempotent, including typographic apostrophes',()=>{const data=fixture();data.worlds=[{_id:'existing',ownerId:'owner',slug:candidates[0].id,title:'Renamed by creator'},{_id:'other',ownerId:'owner',slug:'custom',title:"Don't Follow the Siren"}];const plans=planMigration(data);assert.equal(plans[0].status,'exists');assert.equal(plans[1].status,'exists');assert.equal(plans.filter(p=>p.status==='ready').length,4);});
test('Created Worlds default private draft non-Canon, with no editorial state; rerun is inert',()=>{const data=fixture();const plans=planMigration(data);const doc=worldDocument(plans[0],'owner','profile',new Date());assert.equal(doc.visibility,'private');assert.equal(doc.publicCanon,false);assert.equal(doc.status,'draft');assert.equal(doc.isFeatured,false);assert.ok(!('selectedWorldIds' in doc));assert.equal(doc.story,candidates[0].story);data.worlds.push({...doc,_id:'new'});assert.equal(planMigration(data)[0].status,'exists');});
test('Only loopback explicitly development databases can apply; remote and production refused',()=>{assert.doesNotThrow(()=>assertLocalApply('mongodb://127.0.0.1:27017/cosmic_dev','cosmic_dev'));for(const [uri,db] of [['mongodb+srv://remote/cosmic_dev','cosmic_dev'],['mongodb://localhost/cosmic','cosmic'],['mongodb://localhost/production','production'],['mongodb://127.0.0.1.evil/cosmic_dev','cosmic_dev']])assert.throws(()=>assertLocalApply(uri,db));});

test('Private restoration refuses Canon/Public, Listed and legacy-public tracks without altering state',()=>{
 for(const state of [{visibility:'public',publicCanon:true},{visibility:'listed',publicCanon:false},{visibility:undefined,isPublic:true},{visibility:undefined}]){
  const data=fixture();Object.assign(data.tracks[0],state);const before=JSON.stringify(data);
  const plan=planMigration(data)[0];assert.equal(plan.status,'skip');
  assert.match(plan.issues.join(' '),/availability|visibility/);
  assert.throws(()=>worldDocument(plan,'owner','profile',new Date()),/safe ready/);
  assert.equal(JSON.stringify(data),before);
 }
});
test('Mixed private and Listed sequence is skipped in full, not partially restored',()=>{
 const data=fixture();data.tracks[1].visibility='listed';
 const plan=planMigration(data)[0];assert.equal(plan.status,'skip');
 assert.deepEqual(plan.trackIds,candidates[0].trackIds);
});
test('SIN membership is never reassigned, even for a private track',()=>{
 const data=fixture();data.tracks.find(t=>t.legacyRegistryId==='202-siren').releaseWorldId='sin';
 data.tracks.find(t=>t.legacyRegistryId==='101-hold-my-hand').releaseWorldId='sin';
 const before=JSON.stringify(data),plans=planMigration(data);
 assert.equal(plans[1].status,'skip');assert.equal(plans[2].status,'skip');assert.equal(JSON.stringify(data),before);
});
test('Explicit public restoration admits only the four approved sequences and preserves child states',()=>{
 const data=fixture();data.publicRestoration=true;
 data.tracks.forEach((t,i)=>{t.visibility=i%3===2?'private':'listed';t.accessTier='public';t.playbackStatus='playable';});
 const before=JSON.stringify(data),plans=planMigration(data);
 assert.deepEqual(plans.filter(p=>p.status==='ready').map(p=>p.candidate.title),['Break the Code','Glory & Command','The Price of Focus','Same Self, Higher Form']);
 for(const p of plans.filter(p=>p.status==='ready')){
  const w=worldDocument(p,'owner','profile',new Date());assert.equal(w.visibility,'public');assert.equal(w.publicCanon,false);assert.equal(w.isFeatured,false);
  assert.deepEqual(p.trackIds,p.candidate.trackIds);
 }
 assert.equal(JSON.stringify(data),before);
});
