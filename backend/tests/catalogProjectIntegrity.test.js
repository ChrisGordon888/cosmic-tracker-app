const test = require('node:test');
const assert = require('node:assert/strict');
const { ApolloServer } = require('apollo-server-express');
const resolvers = require('../resolvers');
const typeDefs = require('../schemas');
const Track = require('../models/ReleaseTrack');
const World = require('../models/ReleaseWorld');
const Profile = require('../models/CreativeProfile');
const user = { id: 'integrity-owner', role: 'creator', creatorStatus: 'active' };

test('Standalone GraphQL creation/listing and Create Single preserve project integrity', async () => {
 const invalidRole = new Track({ownerId:user.id,title:'Old Single path',slug:'old',role:'single'});
 assert.match(invalidRole.validateSync().message, /single.*not a valid enum/);
 assert.equal(new Track({ownerId:user.id,title:'Default',slug:'default'}).releaseWorldId,null);
 const originals = [Track.create,Track.countDocuments,Track.findOne,Track.find,World.findOne,World.find,World.create,World.exists,World.deleteOne,Track.exists,Profile.find];
 let track, world, deleted = false, failWorldSave = false;
 const server = new ApolloServer({typeDefs,resolvers,context:()=>({user})});
 try {
  Track.create = async input => { assert.equal(input.releaseWorldId,null);track = new Track(input);track.save=async()=>{await track.validate();return track;};await track.validate();return track; };
  Track.countDocuments = async()=>0;
  Track.findOne = q => q._id ? Promise.resolve(track) : {sort:()=>({select:async()=>null})};
  Track.find = () => ({sort:async()=>[track]});
  World.find = () => ({sort:async()=>world?[world]:[]});
  World.findOne = async q => world && String(q._id)===String(world._id) && q.ownerId===user.id ? world : null;
  World.exists=async()=>false;
  World.create=async input=>{world = new World(input); world.save=async()=>{if(failWorldSave)throw Error('simulated parent save failure');return world;};return world;};
  World.deleteOne=async()=>{deleted=true;world=null;};
  Track.exists=async q=>track?.releaseWorldId && String(track.releaseWorldId)===String(q.releaseWorldId)?{_id:track._id}:null;
  Profile.find=()=>({sort:async()=>[{_id:new Track()._id}]});
  const created=await server.executeOperation({query:'mutation { createReleaseTrack(input:{title:"Fresh",slug:"fresh"}) { id releaseWorldId } }'});
  assert.equal(created.errors,undefined);assert.equal(created.data.createReleaseTrack.releaseWorldId,null);
  const listed=await server.executeOperation({query:'query { myCatalogTracks { id releaseWorldId } myReleaseWorlds { id } }'});
  assert.equal(listed.errors,undefined);assert.equal(listed.data.myCatalogTracks[0].releaseWorldId,null);assert.equal(listed.data.myReleaseWorlds.length,0);
  const single=await resolvers.Mutation.createSingleFromTrack(null,{trackId:track.id},{user});
  assert.equal(String(track.releaseWorldId),single.id);assert.equal(track.role,'lead-single');assert.equal(deleted,false);
  await assert.rejects(resolvers.Mutation.createSingleFromTrack(null,{trackId:track.id},{user}),/already belongs/);
  // A failure after attachment must not delete its parent and create another orphan.
  track.releaseWorldId=null;track.role='unknown';failWorldSave=true;
  await assert.rejects(resolvers.Mutation.createSingleFromTrack(null,{trackId:track.id},{user}),/simulated/);
  assert.equal(deleted,false);assert.equal(String(track.releaseWorldId),world.id);
 } finally {
  await server.stop();
  [Track.create,Track.countDocuments,Track.findOne,Track.find,World.findOne,World.find,World.create,World.exists,World.deleteOne,Track.exists,Profile.find]=originals;
 }
});

test('Explicit orphan repair checks ownership and clears only invalid reference',async()=>{
 const originals=[Track.findOne,World.findOne,Track.findOneAndUpdate];
 const track=new Track({ownerId:user.id,title:'Orphan',slug:'orphan',releaseWorldId:new Track()._id});
 let valid=false,writes=0;
 try {
  Track.findOne=async q=>q.ownerId===user.id?track:null;
  World.findOne=async q=>{assert.equal(q.ownerId,user.id);assert.equal(String(q._id),String(track.releaseWorldId));return valid?{}:null;};
  Track.findOneAndUpdate=async(q,update,opts)=>{
   writes++;assert.equal(q.ownerId,user.id);assert.equal(String(q.releaseWorldId),String(track.releaseWorldId));
   assert.deepEqual(update,{$set:{releaseWorldId:null}});assert.equal(opts.timestamps,false);
   track.releaseWorldId=null;return track;
  };
  await assert.rejects(resolvers.Mutation.repairCatalogTrackProjectLink(null,{trackId:track.id},{user:{...user,id:'other'}}),/not found/);
  valid=true;await assert.rejects(resolvers.Mutation.repairCatalogTrackProjectLink(null,{trackId:track.id},{user}),/valid Release World/);assert.equal(writes,0);
  valid=false;const before=track.toObject();await resolvers.Mutation.repairCatalogTrackProjectLink(null,{trackId:track.id},{user});
  assert.equal(track.releaseWorldId,null);assert.deepEqual(track.toObject(),{...before,releaseWorldId:null});assert.equal(writes,1);
 }finally{[Track.findOne,World.findOne,Track.findOneAndUpdate]=originals;}
});
