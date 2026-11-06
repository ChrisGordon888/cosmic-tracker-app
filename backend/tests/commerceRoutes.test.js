const {test}=require('node:test'),assert=require('node:assert/strict'),express=require('express'),jwt=require('jsonwebtoken');
const O=require('../models/CommerceOffering'),P=require('../models/CommerceProvider'),U=require('../models/User'),E=require('../models/CommerceEvent');
test('actual router enforces owner CRUD, public publication/disable rules, stale edits and idempotent opt-in events',async()=>{
 const saved=[],oldEnv={...process.env};const patch=(obj,k,v)=>{saved.push([obj,k,obj[k]]);obj[k]=v;};let rows=[],providers=[],events=[],mediaRows=[];const M=require('../models/CommerceMedia'),ml=require('../lib/commerceMediaLinks');patch(ml,'candidates',async()=>({worlds:[],tracks:[]}));patch(M,'init',async()=>{});patch(M,'find',q=>chain(mediaRows.filter(r=>match(r,q))));
 const match=(o,q)=>Object.entries(q).every(([k,v])=>String(o[k])===String(v));
 const chain=list=>({sort:()=>({lean:async()=>list}),lean:async()=>list});
 process.env.SERVICES_OPERATOR_ID='operator';process.env.NEXTAUTH_SECRET='fictional-commerce-tests';
 patch(U,'findOne',async q=>({_id:q.email==='owner@example.test'?'operator':'other',role:'creator',creatorStatus:'active'}));
 patch(O,'find',q=>chain(rows.filter(r=>match(r,q))));patch(P,'find',q=>chain(providers.filter(r=>match(r,q))));
 for(const [model,list] of [[O,rows],[P,providers],[M,mediaRows]]){patch(model,'findOne',q=>({lean:async()=>list.find(r=>match(r,q))||null}));patch(model,'create',async o=>{const row={...o,_id:(model===O?'a':'b').repeat(24),revision:0};list.push(row);return row;});patch(model,'findOneAndUpdate',async(q,u)=>{const row=list.find(r=>match(r,q));if(!row)return null;Object.assign(row,u.$set);row.revision++;return row;});}
 patch(E,'init',async()=>{});patch(E,'updateOne',async(q,u)=>{if(!events.some(e=>e.eventId===q.eventId))events.push(u.$setOnInsert);});
 const app=express();app.use('/commerce',require('../routes/commerce'));const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});const url=`http://127.0.0.1:${server.address().port}/commerce`;
 async function request(path,body,identity){const r=await fetch(url+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(identity?{Authorization:'Bearer '+jwt.sign({email:identity+'@example.test'},process.env.NEXTAUTH_SECRET)}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,body:await r.json()};}
 try{
 assert.equal((await request('/media/operator')).status,401);
 assert.equal((await request('/media/operator',null,'foreign')).status,403);
 const mi={slug:'process',title:'Process fixture',status:'draft',url:'https://youtu.be/abcdefghijk',description:'Test process',worldId:'c'.repeat(24)};
 assert.equal((await request('/media/save',mi,'foreign')).status,403);
 let mr=await request('/media/save',mi,'owner');assert.equal(mr.status,200);
 assert.deepEqual((await request('/media/public')).body.items,[]);
 assert.equal((await request('/media/save',{...mi,id:mr.body._id,revision:0,status:'published'},'owner')).status,200);
 let pub=(await request('/media/public')).body.items;assert.equal(pub.length,1);assert.equal(pub[0].ownerId,undefined);assert.deepEqual(pub[0].links,[]);
 assert.equal((await request('/media/save',{...mi,id:mr.body._id,revision:0},'owner')).status,409);
 assert.equal((await request('/media/save',{...mi,id:mr.body._id,revision:1},'owner')).status,200);
 assert.deepEqual((await request('/media/public')).body.items,[]);
 assert.equal((await request('/operator')).status,401);assert.equal((await request('/operator',null,'foreign')).status,403);
 const p={type:'affiliate_external',enabled:true,allowedHosts:['example.com'],destination:'https://example.com/product'};assert.equal((await request('/providers',p,'owner')).status,200);
 const input={slug:'fixture',title:'Fictional recommendation',category:'selects',provider:'affiliate_external',description:'Fixture only',artwork:'https://example.com/art.png',pricing:'Merchant pricing',display:'external',cta:'Visit merchant',status:'draft',affiliateConfirmed:true,merchant:'Fixture',recommendation:'Owner authored'};
 assert.equal((await request('/offerings',input,'foreign')).status,403);let r=await request('/offerings',input,'owner');assert.equal(r.status,200);const id=r.body._id;
 assert.deepEqual((await request('/public')).body.offerings,[]);assert.equal((await request('/public/fixture')).status,404);assert.equal((await request('/preview/'+id,null,'foreign')).status,403);
 assert.equal((await request('/preview/'+id,null,'owner')).status,200);
 assert.equal((await request('/offerings',{...input,id,revision:0,status:'published'},'owner')).status,200);
 assert.equal((await request('/offerings',{...input,id,revision:0},'owner')).status,409);
 r=await request('/public/fixture');assert.equal(r.status,200);assert.match(r.body.disclosure,/commission/);assert.equal(r.body.ownerId,undefined);assert.equal(r.body.revision,undefined);
 const event={slug:'fixture',kind:'cta',consent:true,eventId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',campaign:'private-email@example.test'};
 assert.equal((await request('/events',{...event,consent:false})).status,400);assert.equal((await request('/events',event)).status,200);assert.equal((await request('/events',event)).status,200);assert.equal(events.length,1);assert.equal(events[0].campaign,'direct');assert.equal(events[0].kind,'affiliate-outbound');
 assert.equal((await request('/providers',{...p,revision:0,enabled:false},'owner')).status,200);assert.deepEqual((await request('/public')).body.offerings,[]);
 assert.equal((await request('/offerings',{...input,id,revision:1,status:'draft'},'owner')).status,200);
 rows[0].privateReview=true;assert.equal((await request('/offerings',{...input,id,revision:2,status:'published',privateReview:false},'owner')).status,400);
 }finally{await new Promise(resolve=>server.close(resolve));for(const [obj,k,v] of saved)obj[k]=v;for(const k of ['SERVICES_OPERATOR_ID','NEXTAUTH_SECRET'])if(oldEnv[k]===undefined)delete process.env[k];else process.env[k]=oldEnv[k];}
});
