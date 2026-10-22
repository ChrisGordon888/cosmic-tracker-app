const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;vm.runInNewContext(code,{exports:m.exports,AbortSignal,fetch,require:n=>n==='node:crypto'?require(n):load('src/lib/serviceOffers.ts')});return m.exports;}
const {validateInquiry,sendInquiry}=load('src/server/servicesInquiry.ts');
const good={name:'Fixture',email:'fixture@example.com',offer:'creative-direction-session',message:'One song',timeline:'Next month',links:'https://example.com'};
test('Inquiry validates email, lengths, service and honeypot server-side',()=>{assert.equal(validateInquiry(good).name,'Fixture');for(const bad of [{...good,email:'bad'},{...good,message:''},{...good,name:'a'.repeat(151)},{...good,website:'bot'},{...good,offer:'invented'}])assert.throws(()=>validateInquiry(bad));});
test('Missing transport and provider failures never claim success',async()=>{assert.equal((await sendInquiry(validateInquiry(good),{})).status,503);assert.equal((await sendInquiry(validateInquiry(good),{key:'fake',from:'sender@example.com',to:'inbox@example.com'},async()=>({ok:false,json:async()=>({})}))).ok,false);});
test('Configured transport uses business destination and visitor Reply-To; acceptance requires provider ID',async()=>{const r=await sendInquiry(validateInquiry(good),{key:'fixture',from:'sender@example.com',to:'inbox@example.com'},async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');const body=JSON.parse(options.body);assert.equal(body.reply_to,good.email);assert.equal(body.to[0],'inbox@example.com');assert.ok(body.text.includes('INQUIRY ONLY'));return {ok:true,json:async()=>({id:'fake'})};});assert.equal(r.ok,true);});
test('Actual API rejects bad methods/origins, validates input and returns honest unconfigured state',async()=>{
 const api={exports:{}};const code=ts.transpileModule(fs.readFileSync('src/pages/api/services-inquiry.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 vm.runInNewContext(`(function(require,module,exports){${code}})`,{process:{env:{}},URL})(()=>({validateInquiry,sendInquiry}),api,api.exports);
 async function request(req){const res={code:0,body:null,setHeader(){},status(n){this.code=n;return this;},json(body){this.body=body;return this;}};await api.exports.default({headers:{host:'example.com'},...req},res);return res;}
 assert.equal((await request({method:'GET'})).code,405);
 assert.equal((await request({method:'POST',headers:{host:'example.com',origin:'https://other.example'},body:good})).code,403);
 assert.equal((await request({method:'POST',body:{}})).code,400);
 const missing=await request({method:'POST',body:good});assert.equal(missing.code,503);assert.equal(missing.body.ok,false);
});

test('Unchanged retries keep reference, email body and provider idempotency key stable',async()=>{
 const data=validateInquiry({...good,inquiryId:'11111111-1111-4111-8111-111111111111'}),requests=[];
 const config={key:'fake',from:'sender@example.com',to:'inbox@example.com'};
 const transport=async(url,options)=>{requests.push(options);return {ok:true,json:async()=>({id:'fake'})};};
 const first=await sendInquiry(data,config,transport);const second=await sendInquiry(data,config,transport);
 assert.equal(first.reference,second.reference);assert.equal(requests[0].body,requests[1].body);assert.equal(requests[0].headers['Idempotency-Key'],requests[1].headers['Idempotency-Key']);
 await sendInquiry({...data,message:'Changed scope'},config,transport);
 assert.notEqual(requests[0].headers['Idempotency-Key'],requests[2].headers['Idempotency-Key']);
 assert.throws(()=>validateInquiry({...good,inquiryId:'injected'}));
});
test('All displayed services are accepted, non-pilot prices are uncommitted, transport exceptions fail honestly',async()=>{
 for(const offer of load('src/lib/serviceOffers.ts').SERVICE_OFFERS){assert.equal(validateInquiry({...good,offer:offer.slug}).offer,offer.slug);if(!['not-sure','creative-direction-session'].includes(offer.slug))assert.equal(offer.price,'Scoped separately');}
 const result=await sendInquiry(validateInquiry(good),{key:'fake',from:'from',to:'to'},async()=>{throw Error('timeout');});assert.equal(result.ok,false);assert.equal(result.status,502);
});
