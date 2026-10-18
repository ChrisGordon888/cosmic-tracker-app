const test=require('node:test'),assert=require('node:assert/strict');
const service=require('../lib/creativePaths'),Path=require('../models/CreativePath'),Track=require('../models/ReleaseTrack'),resolvers=require('../resolvers');
const a='aaaaaaaaaaaaaaaaaaaaaaaa',b='bbbbbbbbbbbbbbbbbbbbbbbb',pid='cccccccccccccccccccccccc';
test('Path validates distinct IDs and a bounded note, rejecting supplied ownership',()=>{
 for(const input of [{a,b:a},{a:'bad',b},{a,b,note:'x'.repeat(1001)},{a,b,ownerId:'other'}])assert.throws(()=>service.inputSchema.parse(input));
 assert.deepEqual(service.inputSchema.parse({a,b,note:'  intention  '}),{a,b,note:'intention'});
});
test('Paths are owner isolated, normalized, editable, removable and never update tracks',async()=>{
 const old=[Track.countDocuments,Track.find,Path.find,Path.findOneAndUpdate,Path.deleteOne];let rows=[],eligible=true;
 Track.countDocuments=async q=>{assert.deepEqual(q.catalogTreatment,{$nin:['vault','test']});assert.equal(q.status.$ne,'archived');return q.ownerId==='owner'&&eligible?2:0;};
 Track.find=q=>({select(){return this;},lean:async()=>q.ownerId==='owner'&&eligible?[{_id:a},{_id:b}]:[]});
 Path.find=q=>({sort(){return this;},lean:async()=>rows.filter(p=>p.ownerId===q.ownerId&&q.a.$in.includes(p.a)&&q.b.$in.includes(p.b))});
 Path.findOneAndUpdate=async(q,u)=>{rows=rows.filter(p=>p.ownerId!==q.ownerId||p.a!==q.a||p.b!==q.b);rows.push({...q,...u.$set,_id:pid});};
 Path.deleteOne=async q=>{rows=rows.filter(p=>p.ownerId!==q.ownerId||p._id!==q._id);};
 try{
  await assert.rejects(()=>service.save('other',{a,b}));assert.equal(rows.length,0);
  await service.save('owner',{a:b,b:a,note:'First'});assert.equal(rows[0].a,a);
  await service.save('owner',{a,b,note:'Edited'});assert.equal(rows.length,1);assert.equal(rows[0].note,'Edited');
  assert.equal((await service.list('other')).length,0);await service.remove('other',pid);assert.equal(rows.length,1);
  eligible=false;assert.equal((await service.list('owner')).length,0);await assert.rejects(()=>service.save('owner',{a,b}));
  eligible=true;await service.remove('owner',pid);assert.equal(rows.length,0);
  await assert.rejects(()=>resolvers.Query.myCreativePaths(null,{},{}));
  await assert.rejects(()=>resolvers.Mutation.saveCreativePath(null,{input:{a,b}},{}));
  await assert.rejects(()=>resolvers.Mutation.removeCreativePath(null,{id:pid},{}));
 }finally{[Track.countDocuments,Track.find,Path.find,Path.findOneAndUpdate,Path.deleteOne]=old;}
});
