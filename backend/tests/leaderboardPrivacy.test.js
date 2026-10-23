const test = require('node:test');
const assert = require('node:assert/strict');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('../schemas');
const resolvers = require('../resolvers');
const User = require('../models/User');

test('Anonymous leaderboard exposes only public identity, preserves ranking and bounds queries', async () => {
 const original = User.find; let cap, selection;
 User.find = () => ({ select(fields) { selection = fields; return this; }, sort() { return this; }, limit(n) { cap = n; return [{ _id:'fixture',name:'Fictional artist',image:null,level:2,xp:30,email:'private@example.invalid',platformPermissions:['nexus.editorial'] }]; } });
 const server = new ApolloServer({typeDefs,resolvers,context:()=>({user:null})});
 try {
  const good = await server.executeOperation({query:'{ getLeaderboard(limit: 1000) { rank user { id name image level xp } } }'});
  assert.equal(good.errors,undefined); assert.equal(cap,100); assert.equal(selection,'_id name image level xp'); assert.equal(good.data.getLeaderboard[0].user.name,'Fictional artist');
  for(const field of ['email','platformPermissions','creatorAccessOwnerIds','musicStats { totalListeningTime }','streaks { currentStreak }']) {
   const bad = await server.executeOperation({query:`{ getLeaderboard { user { ${field} } } }`});
   assert.ok(bad.errors); assert.equal(bad.data,undefined);
  }
  for(const limit of [0,-1,null])assert.ok((await server.executeOperation({query:'query($n:Int){getLeaderboard(limit:$n){rank}}',variables:{n:limit}})).errors);
 } finally { User.find=original; await server.stop(); }
});
