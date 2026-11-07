const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {authorize}=require('../lib/serviceEngagements');
async function request({env={NEXTAUTH_SECRET:'fixture',SERVICES_OPERATOR_ID:'operator'},user={id:'operator',role:'owner'},dbFailure=false,badToken=false,token='fixture'}={}){
 let handler;const router={post(){},use(fn){handler=fn;}};
 const express={Router:()=>router,json:()=>()=>{},raw:()=>()=>{}};
 const module={exports:{}};
 const dependencies={express,jsonwebtoken:{verify(){if(badToken)throw Error();return {email:'fixture@example.invalid'};}},'../models/User':{async findOne(){if(dbFailure)throw Error('private database details');return user;}},'../models/Opportunity':{find:()=>({select:()=>({lean:async()=>[]})})},'../lib/serviceEngagements':{authorize,createService:()=>({})},'../lib/servicePaymentMode':{paymentMode:()=>({mode:'test'})},'../lib/hostedBookings':{},'../lib/commercialOperations':{summarize:()=>({attention:0})}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../routes/services'),'utf8'),{require:n=>dependencies[n]??require(n),module,process:{env},URL,Buffer});
 const res={code:200,set(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
 await handler({method:'GET',path:'/summary',headers:{authorization:token?`Bearer ${token}`:''}},res);return res;
}
test('missing commercial configuration and database failure are unavailable, not permission denial',async()=>{
 for(const options of [{env:{NEXTAUTH_SECRET:'fixture'}},{env:{SERVICES_OPERATOR_ID:'operator'}},{dbFailure:true}]){const res=await request(options);assert.equal(res.code,503);assert.doesNotMatch(JSON.stringify(res.body),/private database details/);}
});
test('operator summary preserves authentication and role boundaries',async()=>{
 assert.equal((await request({token:''})).code,401);assert.equal((await request({badToken:true})).code,401);
 assert.equal((await request({user:{id:'other',role:'owner'}})).code,403);
 assert.equal((await request({user:{id:'operator',role:'creator',creatorStatus:'suspended'}})).code,403);
 const res=await request();assert.equal(res.code,200);assert.equal(res.body.attention,0);
});
