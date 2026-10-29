const test=require('node:test'),assert=require('node:assert/strict'),express=require('express'),jwt=require('jsonwebtoken');
const O=require('../models/Opportunity'),U=require('../models/User');
test('summary endpoint rejects anonymous/foreign operators before reading private records',async()=>{
 const oldFind=U.findOne,oldO=O.find,old={...process.env};let reads=0;
 process.env.NEXTAUTH_SECRET='fictional-secret';process.env.SERVICES_OPERATOR_ID='operator';
 U.findOne=async()=>({_id:'unrelated',role:'creator',creatorStatus:'active'});O.find=()=>{reads++;throw Error('must not read')};
 const app=express();app.use('/services',require('../routes/services'));const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
 try{const url=`http://127.0.0.1:${server.address().port}/services/summary`;assert.equal((await fetch(url)).status,401);assert.equal((await fetch(url,{headers:{Authorization:`Bearer ${jwt.sign({email:'fixture@example.test'},process.env.NEXTAUTH_SECRET)}`}})).status,403);assert.equal(reads,0);
 U.findOne=async()=>({_id:'operator',role:'creator',creatorStatus:'active'});
 O.find=q=>{assert.equal(q.ownerId,'operator');assert.ok(q.$or);return{select:fields=>{assert.ok(!fields.includes('email'));return{lean:async()=>[{engagement:{approval:'inquiry',notification:'pending'}}]};}};};
 const ok=await fetch(url,{headers:{Authorization:`Bearer ${jwt.sign({email:'operator@example.test'},process.env.NEXTAUTH_SECRET)}`}});assert.equal(ok.status,200);assert.deepEqual(await ok.json(),{attention:1});
 }
 finally{await new Promise(resolve=>server.close(resolve));U.findOne=oldFind;O.find=oldO;for(const k of ['NEXTAUTH_SECRET','SERVICES_OPERATOR_ID'])if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}
});
