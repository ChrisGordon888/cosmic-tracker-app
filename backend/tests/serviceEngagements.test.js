const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createService,authorize,signature}=require('../lib/serviceEngagements');
const OpportunityModel=require('../models/Opportunity');
const id='111111111111111111111111',owner='222222222222222222222222';
const inquiry={inquiryId:'11111111-1111-4111-8111-111111111111',name:'Fictional Artist',email:'fixture@example.test',offer:'creative-direction-session',message:'One original song',links:'https://example.test/reference',timeline:'Next month'};
function fixture(){
 let record=null,calls=[];
 const value=(o,k)=>k.split('.').reduce((a,x)=>a?.[x],o);
 function matches(q){return record&&Object.entries(q).every(([k,v])=>v&&typeof v==='object'&&'$exists'in v?(value(record,k)!==undefined)===v.$exists:v===null?value(record,k)==null:value(record,k)===v);}
 function apply(u){for(const [k,v]of Object.entries(u.$set||{})){const keys=k.split('.'),last=keys.pop();let o=record;for(const key of keys)o=o[key]??={};o[last]=v;}}
 const Opportunity={findOne:async q=>matches(q)?structuredClone(record):null,findOneAndUpdate:async(q,u,opts)=>{if(!record&&opts?.upsert){record={_id:id,...structuredClone(u.$setOnInsert)};return structuredClone(record);}if(!matches(q))return null;apply(u);return structuredClone(record);},updateOne:async(q,u)=>{if(!matches(q))return{matchedCount:0};apply(u);return{matchedCount:1};}};
 let session={id:'cs_test_fixture',url:'https://checkout.stripe.com/c/pay/test',livemode:false,client_reference_id:id,metadata:{engagementId:id},currency:'usd',amount_total:15000,status:'open',payment_status:'unpaid',invoice:null};
 const env={SERVICES_OPERATOR_ID:owner,STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',SERVICES_PUBLIC_URL:'https://example.test'};
 const transport=async(url,options)=>{calls.push({url,options});return{ok:true,json:async()=>structuredClone(session)}};
 const service=createService({Opportunity,env,transport});
 return {service,env,calls,Opportunity,get record(){return record;},get session(){return session;},paid(){session={...session,status:'complete',payment_status:'paid',invoice:'in_fixture',payment_intent:{id:'pi_fixture',status:'succeeded',amount_received:15000,latest_charge:{paid:true,amount_refunded:0,disputed:false}}};}};
}
async function approved(f){await f.service.intake(inquiry);return f.service.approve(id,{scope:'One focused creative session',agreement:'Fictional client agreed in test email',amountCents:15000});}
function signed(event,secret='whsec_fixture'){const raw=Buffer.from(JSON.stringify(event)),t=Math.floor(Date.now()/1000);return[raw,`t=${t},v1=${crypto.createHmac('sha256',secret).update(`${t}.`).update(raw).digest('hex')}`];}
test('Opportunity retains normal fields; engagement and unique references are additive',()=>{const doc=new OpportunityModel({ownerId:owner,title:'Normal',desiredOutcome:'Outcome'});assert.equal(doc.engagement,undefined);assert.ok(OpportunityModel.schema.indexes().some(([keys,opts])=>keys['engagement.inquiryId']&&opts.unique));});
test('only configured active business operator is authorized',()=>{for(const user of [null,{id:owner,role:'listener'},{id:'other',role:'owner'},{id:owner,role:'creator',creatorStatus:'suspended'}])assert.throws(()=>authorize(user,owner));authorize({id:owner,role:'creator',creatorStatus:'active'},owner);assert.throws(()=>authorize({id:owner,role:'owner'},''));});
test('inquiry is durable, idempotent, private and conflicts cannot overwrite it',async()=>{const f=fixture();await f.service.intake(inquiry);await f.service.intake(inquiry);assert.equal(f.record.ownerId,owner);assert.equal(f.record.engagement.approval,'inquiry');assert.equal(f.record.engagement.paymentStatus,'not-requested');await assert.rejects(()=>f.service.intake({...inquiry,message:'Changed'}));assert.equal(f.record.engagement.context,inquiry.message);});
test('unapproved and foreign records cannot request checkout',async()=>{const f=fixture();await f.service.intake(inquiry);await assert.rejects(()=>f.service.checkout(id));await assert.rejects(()=>f.service.get('333333333333333333333333'));assert.equal(f.calls.length,0);});
test('approval validates quote and locks scope',async()=>{const f=fixture();await f.service.intake(inquiry);await assert.rejects(()=>f.service.approve(id,{scope:'x',agreement:'x',amountCents:0}));await f.service.approve(id,{scope:'One session',agreement:'Agreed',amountCents:15000});await assert.rejects(()=>f.service.approve(id,{scope:'New',agreement:'x',amountCents:20000}));});
test('hosted checkout uses stored quote, stable idempotency, invoice creation and no browser authority',async()=>{const f=fixture();await approved(f);await f.service.checkout(id);await f.service.checkout(id);const posts=f.calls.filter(x=>x.options.method==='POST');assert.equal(posts.length,1);const body=new URLSearchParams(posts[0].options.body);assert.equal(body.get('line_items[0][price_data][unit_amount]'),'15000');assert.equal(body.get('invoice_creation[enabled]'),'true');assert.equal(posts[0].options.headers['Idempotency-Key'],`cosmic-service-${id}`);assert.equal(f.record.engagement.paymentStatus,'unpaid');});
test('verified payment, duplicate and stale webhook payloads use current Stripe state',async()=>{const f=fixture();await approved(f);await f.service.checkout(id);f.paid();const event={id:'evt_fixture',type:'checkout.session.completed',livemode:false,data:{object:{id:'cs_test_fixture',payment_status:'unpaid'}}};await f.service.webhook(...signed(event));await f.service.webhook(...signed(event));assert.equal(f.record.engagement.paymentStatus,'paid');assert.equal(f.record.engagement.invoiceId,'in_fixture');assert.equal(f.record.engagement.delivery,'not-started');});
test('signature tampering, stale signatures and live events are rejected',async()=>{const f=fixture(),[raw,header]=signed({livemode:false});assert.throws(()=>signature(Buffer.from('{}'),header,'whsec_fixture'));assert.throws(()=>signature(raw,header,'whsec_fixture',Date.now()+600000));await assert.rejects(()=>f.service.webhook(...signed({livemode:true})));});
test('mismatched amount or identity never marks paid',async()=>{const f=fixture();await approved(f);await f.service.checkout(id);f.paid();f.session.amount_total=1;await assert.rejects(()=>f.service.reconcile(id));assert.equal(f.record.engagement.paymentStatus,'unpaid');f.session.amount_total=15000;f.session.client_reference_id='other';await assert.rejects(()=>f.service.reconcile(id));});
test('refunds reconcile and scheduling/delivery stay distinct',async()=>{const f=fixture();await approved(f);await f.service.checkout(id);await assert.rejects(()=>f.service.followUp(id,{scheduling:'confirmed',delivery:'delivered',nextAction:'Done'}));f.paid();await f.service.reconcile(id);await f.service.followUp(id,{scheduling:'confirmed',delivery:'in-progress',nextAction:'Prepare session',note:'Fictional invitation accepted'});f.session.payment_intent.latest_charge.amount_refunded=100;await f.service.webhook(...signed({livemode:false,type:'charge.refunded',data:{object:{payment_intent:'pi_fixture'}}}));assert.equal(f.record.engagement.paymentStatus,'refunded-or-partial');assert.equal(f.record.engagement.scheduling,'confirmed');});
test('missing/live keys fail closed; expired uncertain attempts cannot create a second charge',async()=>{const f=fixture();await approved(f);f.env.STRIPE_SECRET_KEY='sk_live_fake';await assert.rejects(()=>f.service.checkout(id));assert.equal(f.calls.length,0);f.env.STRIPE_SECRET_KEY='sk_test_fixture';f.record.engagement.attemptAt=new Date(Date.now()-24*3600000);await assert.rejects(()=>f.service.checkout(id));assert.equal(f.calls.length,0);});
test('provider errors preserve durable approval and are retryable',async()=>{const f=fixture();await approved(f);const broken=createService({Opportunity:f.Opportunity,env:f.env,transport:async()=>({ok:false,json:async()=>({})})});await assert.rejects(()=>broken.checkout(id));assert.equal(f.record.engagement.approval,'approved');assert.equal(f.record.engagement.sessionId,undefined);await f.service.checkout(id);assert.equal(f.record.engagement.sessionId,'cs_test_fixture');});
test('out-of-order concurrent reconciliation cannot overwrite a newer snapshot',async()=>{const f=fixture();await approved(f);await f.service.checkout(id);const stale=structuredClone(f.session);let release;const slow=createService({Opportunity:f.Opportunity,env:f.env,transport:async()=>{await new Promise(r=>release=r);return{ok:true,json:async()=>stale}}});const pending=slow.reconcile(id);await new Promise(r=>setImmediate(r));f.paid();await f.service.reconcile(id);release();await assert.rejects(()=>pending);assert.equal(f.record.engagement.paymentStatus,'paid');});
test('a webhook arriving before session persistence asks Stripe to retry',async()=>{const f=fixture();await approved(f);await assert.rejects(()=>f.service.webhook(...signed({livemode:false,type:'checkout.session.completed',data:{object:{id:'cs_test_pending',metadata:{engagementId:id}}}})),error=>error.status===503);});
test('signed malformed Checkout payload cannot query an unlinked engagement',async()=>{const f=fixture();await approved(f);for(const object of [{},{id:'cs_live_other'}])await assert.rejects(()=>f.service.webhook(...signed({livemode:false,type:'checkout.session.completed',data:{object}})),e=>e.status===400);assert.equal(f.calls.length,0);});
test('wrong currency and metadata fail verified reconciliation even after signed delivery',async()=>{for(const [key,value] of [['currency','eur'],['metadata',{engagementId:'wrong'}],['id','cs_test_wrong']]){const f=fixture();await approved(f);await f.service.checkout(id);f.paid();f.session[key]=value;await assert.rejects(()=>f.service.webhook(...signed({livemode:false,type:'checkout.session.completed',data:{object:{id:'cs_test_fixture'}}})) ,e=>e.status===409);assert.equal(f.record.engagement.paymentStatus,'unpaid');}});
test('expired, failed and delayed events re-read current state without fulfillment',async()=>{const f=fixture();await approved(f);await f.service.checkout(id);f.session.status='expired';await f.service.webhook(...signed({livemode:false,type:'checkout.session.expired',data:{object:{id:'cs_test_fixture'}}}));assert.equal(f.record.engagement.paymentStatus,'expired');f.paid();await f.service.webhook(...signed({livemode:false,type:'checkout.session.async_payment_failed',data:{object:{id:'cs_test_fixture'}}}));assert.equal(f.record.engagement.paymentStatus,'paid');assert.equal(f.record.engagement.delivery,'not-started');});
test('failed matched delivery is retryable without duplicate fulfillment',async()=>{const f=fixture();await approved(f);await f.service.checkout(id);f.paid();const event=signed({livemode:false,type:'checkout.session.completed',data:{object:{id:'cs_test_fixture'}}});const broken=createService({Opportunity:f.Opportunity,env:f.env,transport:async()=>{throw Error('fixture transport unavailable');}});await assert.rejects(()=>broken.webhook(...event));assert.equal(f.record.engagement.paymentStatus,'unpaid');await f.service.webhook(...event);await f.service.webhook(...event);assert.equal(f.record.engagement.paymentStatus,'paid');assert.equal(f.record.engagement.delivery,'not-started');});
test('signed malformed JSON and absent operator fail closed before lookup',async()=>{
 const raw=Buffer.from('{broken'),t=Math.floor(Date.now()/1000);
 const header=`t=${t},v1=${crypto.createHmac('sha256','whsec_fixture').update(`${t}.`).update(raw).digest('hex')}`;
 assert.throws(()=>signature(raw,header,'whsec_fixture'),e=>e.status===400);
 const f=fixture();await assert.rejects(()=>f.service.webhook(...signed(null)),e=>e.status===400);
 f.env.SERVICES_OPERATOR_ID='';await assert.rejects(()=>f.service.webhook(...signed({livemode:false})),e=>e.status===503);
 assert.equal(f.calls.length,0);
});

function liveFixture() {
 const f=fixture();
 Object.assign(f.env,{SERVICES_PAYMENT_MODE:'live',SERVICES_LIVE_ENABLED:'true',SERVICES_ENVIRONMENT_ID:'production-fixture',MONGODB_URI:'mongodb://localhost/live_fixture',SERVICES_LIVE_DATABASE_NAME:'live_fixture',SERVICES_TEST_DATABASE_NAME:'sandbox_fixture',STRIPE_LIVE_ACCOUNT_ID:'acct_fixture',STRIPE_LIVE_SECRET_KEY:'sk_live_fixture',STRIPE_LIVE_WEBHOOK_SECRET:'whsec_live_fixture'});
 f.Opportunity.db={name:'live_fixture'};
 f.session.id='cs_live_fixture';f.session.livemode=true;
 let account='acct_fixture';
 const service=createService({Opportunity:f.Opportunity,env:f.env,transport:async(url,options)=>{f.calls.push({url,options});return{ok:true,json:async()=>url.endsWith('/account')?{id:account}:structuredClone(f.session)};}});
 return {...f,service,get record(){return f.record;},get session(){return f.session;},paid:f.paid,setAccount:x=>account=x};
}
test('live requires explicit activation, distinct database and actual connection identity',async()=>{
 for(const mutate of [f=>delete f.env.SERVICES_LIVE_ENABLED,f=>f.env.SERVICES_TEST_DATABASE_NAME='live_fixture',f=>f.Opportunity.db.name='sandbox_fixture',f=>delete f.env.STRIPE_LIVE_ACCOUNT_ID]) {
  const f=liveFixture();mutate(f);await assert.rejects(()=>f.service.intake(inquiry));assert.equal(f.record,null);assert.equal(f.calls.length,0);
 }
});
test('live account and immutable environment binding protect checkout; legacy stays test',async()=>{
 const f=liveFixture();await approved(f);assert.equal(f.record.engagement.paymentMode,'live');
 f.setAccount('acct_wrong');await assert.rejects(()=>f.service.checkout(id));assert.equal(f.record.engagement.sessionId,undefined);
 f.setAccount('acct_fixture');f.env.SERVICES_ENVIRONMENT_ID='different';await assert.rejects(()=>f.service.get(id));
 const legacy=fixture();await approved(legacy);delete legacy.record.engagement.paymentMode;await legacy.service.get(id);
 Object.assign(legacy.env,f.env);legacy.Opportunity.db={name:'live_fixture'};await assert.rejects(()=>legacy.service.get(id));
});
test('live signed matched replay reconciles provider evidence without duplicate fulfillment',async()=>{
 const f=liveFixture();await approved(f);await f.service.checkout(id);f.paid();
 const event={type:'checkout.session.completed',livemode:true,data:{object:{id:'cs_live_fixture'}}};
 await assert.rejects(()=>f.service.webhook(...signed(event)));
 await assert.rejects(()=>f.service.webhook(...signed({...event,livemode:false},'whsec_live_fixture')));
 for(let n=0;n<2;n++)await f.service.webhook(...signed(event,'whsec_live_fixture'));
 assert.equal(f.record.engagement.paymentStatus,'paid');assert.equal(f.record.engagement.delivery,'not-started');
 const posts=f.calls.filter(c=>c.options.method==='POST');assert.equal(posts.length,1);
 assert.equal(posts[0].options.headers['Idempotency-Key'],`cosmic-service-live-production-fixture-${id}`);
 f.session.currency='eur';await assert.rejects(()=>f.service.reconcile(id));
});
test('disabled mode cannot create checkout or accept webhook',async()=>{
 const f=fixture();f.env.SERVICES_PAYMENT_MODE='disabled';await approved(f);
 await assert.rejects(()=>f.service.checkout(id));await assert.rejects(()=>f.service.webhook(...signed({livemode:false})));assert.equal(f.calls.length,0);
});
