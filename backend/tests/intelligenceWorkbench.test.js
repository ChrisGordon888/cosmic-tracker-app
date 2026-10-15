const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const resolvers=require('../resolvers'),T=require('../models/ReleaseTrack'),W=require('../models/ReleaseWorld');
test('Intelligence document validates against existing GraphQL contract',()=>{
 const {makeExecutableSchema}=require('@graphql-tools/schema'),{parse,validate}=require('graphql');
 const schema=makeExecutableSchema({typeDefs:require('../schemas'),resolvers});
 const document=fs.readFileSync('../frontend/src/graphql/intelligence.ts','utf8').match(/gql`([\s\S]*?)`/)[1];
 assert.deepEqual(validate(schema,parse(document)).map(e=>e.message),[]);
});
test('Both source queries enforce creator access and scope each lookup to the current user',async()=>{
 const oldT=T.find,oldW=W.find,queries=[];
 T.find=q=>({sort:async()=>{queries.push(q);return [];}});W.find=q=>({sort:async()=>{queries.push(q);return [];}});
 try{
  for(const name of ['myCatalogTracks','myReleaseWorlds']){
   await assert.rejects(()=>resolvers.Query[name](null,{},{}));
   await assert.rejects(()=>resolvers.Query[name](null,{},{user:{id:'listener',role:'listener'}}));
   for(const id of ['owner-a','owner-b'])await resolvers.Query[name](null,{},{user:{id,role:'creator',creatorStatus:'active'}});
  }
  assert.deepEqual(queries,[{ownerId:'owner-a'},{ownerId:'owner-b'},{ownerId:'owner-a'},{ownerId:'owner-b'}]);
 }finally{T.find=oldT;W.find=oldW;}
});
