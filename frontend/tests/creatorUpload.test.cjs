const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
const {NextRequest}=require('next/server'),{encode}=require('next-auth/jwt'),{getPayloadFromClientToken}=require('@vercel/blob/client');
function compile(file,resolve=require){const m={exports:{}};const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;vm.runInNewContext(`(function(require,module,exports){${js}})`,{process,fetch:(...args)=>global.fetch(...args),AbortSignal,Date,URL,Buffer,Uint8Array})(resolve,m,m.exports);return m.exports;}
const policy=compile('src/server/creatorUpload.ts');
const {POST}=compile('src/app/api/upload/route.ts',n=>n==='@/server/creatorUpload'?policy:require(n));
const endpoint='http://localhost:3000/api/upload';
const body=(pathname='catalog-audio/123-fixture.wav')=>({type:'blob.generate-client-token',payload:{pathname,callbackUrl:endpoint,multipart:false,clientPayload:JSON.stringify({ownerId:'forged-owner'})}});
function request(data,cookie,headers={}){return new NextRequest(endpoint,{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{cookie:`next-auth.session-token=${cookie}`} :{}),...headers},body:JSON.stringify(data)});}
test('Real session decoding and SDK issuance enforce fresh creator permissions and bounded tokens',async()=>{
 const original={fetch:global.fetch,secret:process.env.NEXTAUTH_SECRET,blob:process.env.BLOB_READ_WRITE_TOKEN,url:process.env.NEXTAUTH_URL,vercel:process.env.VERCEL};
 process.env.NEXTAUTH_SECRET='fixture-session-secret';process.env.BLOB_READ_WRITE_TOKEN='vercel_blob_rw_fixture_secret';process.env.NEXTAUTH_URL='http://localhost:3000';delete process.env.VERCEL;
 let role='creator',creatorStatus='active',calls=0;
 global.fetch=async(url,options)=>{calls++;assert.equal(options.headers.Authorization,'Bearer fixture-backend-token');assert.equal(options.cache,'no-store');return {ok:true,json:async()=>({data:{me:{id:'server-owner',role,creatorStatus}}})};};
 try{
  const cookie=await encode({secret:process.env.NEXTAUTH_SECRET,token:{accessToken:'fixture-backend-token'},maxAge:3600});
  assert.equal((await POST(request(body()))).status,401);assert.equal(calls,0);
  assert.equal((await POST(request(body(),'invalid-cookie'))).status,401);
  for(const pair of [['listener','none'],['creator','invited'],['creator','none'],['creator','suspended'],['owner','suspended']]){[role,creatorStatus]=pair;assert.equal((await POST(request(body(),cookie))).status,403);}
  for(const pair of [['creator','active'],['admin','none'],['owner','none']]){[role,creatorStatus]=pair;const response=await POST(request(body(),cookie));assert.equal(response.status,200);const token=getPayloadFromClientToken((await response.json()).clientToken);assert.equal(token.maximumSizeInBytes,100*1024*1024);assert.deepEqual(token.allowedContentTypes,['audio/wav','audio/x-wav']);assert.equal(token.allowOverwrite,false);assert.equal(token.addRandomSuffix,true);assert.equal(token.pathname,'catalog-audio/123-fixture.wav');assert.ok(token.validUntil<=Date.now()+600000);assert.equal(JSON.parse(token.onUploadCompleted.tokenPayload).ownerId,'server-owner');}
  for(const path of ['other/file.wav','catalog-audio/../secret.wav','catalog-audio/%2e%2e/x.wav','catalog-audio/file.svg','release-covers/world/file.wav','/catalog-audio/a.wav'])assert.equal((await POST(request(body(path),cookie))).status,400);
  const image=await POST(request(body('release-covers/onboarding/123-cover.png'),cookie));assert.equal(image.status,200);assert.equal(getPayloadFromClientToken((await image.json()).clientToken).maximumSizeInBytes,20*1024*1024);
  const foreignCallback=body();foreignCallback.payload.callbackUrl='https://example.invalid/api/upload';assert.equal((await POST(request(foreignCallback,cookie))).status,400);
  assert.equal((await POST(request(body(),cookie,{origin:'https://example.invalid'}))).status,403);
  assert.equal((await POST(request({...body(),padding:'x'.repeat(17000)},cookie))).status,413);
  global.fetch=async()=>{throw Error('offline');};assert.equal((await POST(request(body(),cookie))).status,503);
  const event={type:'blob.upload-completed',payload:{blob:{pathname:'fixture.wav',url:'https://example.invalid/fixture.wav'},tokenPayload:'fixture-only'}};
  assert.equal((await POST(request(event))).status,400);
  assert.equal((await POST(request(event,null,{'x-vercel-signature':'00'.repeat(32)}))).status,400);
  const signature=crypto.createHmac('sha256',process.env.BLOB_READ_WRITE_TOKEN).update(JSON.stringify(event)).digest('hex');
  assert.equal((await POST(request(event,null,{'x-vercel-signature':signature}))).status,200);
 }finally{global.fetch=original.fetch;for(const [key,value]of Object.entries({NEXTAUTH_SECRET:original.secret,BLOB_READ_WRITE_TOKEN:original.blob,NEXTAUTH_URL:original.url,VERCEL:original.vercel})){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
test('Existing upload families retain supported extensions',()=>{
 for(const path of ['catalog-audio/123-file.mp3','release-audio/world/123-file.flac','release-images/world/123-file.jpg','release-covers/onboarding/123-file.webp','release-videos/world/123-file.mp4','release-documents/world/123-file.pdf','release-assets/world/123-file.m4a'])assert.ok(policy.uploadConstraints(path).maximumSizeInBytes>0);
});
