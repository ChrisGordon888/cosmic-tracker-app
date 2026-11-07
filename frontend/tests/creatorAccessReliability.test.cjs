const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
let query={loading:false,data:{myReleaseWorlds:[]}},access={allowed:false,status:'loading',retry(){}};
function load(file){
 const m={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(`src/${file}`,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(`(function(require,module,exports){${code}})`,{AbortController,fetch})(n=>{
  if(n.endsWith('.css'))return {};
  if(n==='next/link')return ({children,...props})=>React.createElement('a',props,children);
  if(n==='next/navigation')return {usePathname:()=>'/creator'};
  if(n==='next-auth/react')return {useSession:()=>({status:'authenticated'})};
  if(n==='@apollo/client')return {gql:()=>'',useQuery:()=>query,useMutation:()=>[()=>{},{}]};
  if(n==='@/lib/creatorNavigation')return load('lib/creatorNavigation.ts');
  if(n==='@/lib/releaseSharing')return {publicWorldHref:p=>`/releases/${p.slug}`};
  if(n==='./CommercialAccess')return {useCommercialAccess:()=>access};
  if(n.startsWith('@/components/'))return ()=>null;
  return require(n);
 },m,m.exports);return m.exports;
}
const Page=load('app/creator/page.tsx').default,Rail=load('components/creator/CreatorRail.tsx').default;
const html=component=>renderToStaticMarkup(React.createElement(component));
const project={id:'fictional-owned-id',title:'Fictional Focus',slug:'fictional-focus',status:'draft',visibility:'private',releaseType:'ep'};
test('pending Home does not render an empty-project action; loaded and refreshing project opens board',()=>{
 query={loading:true};assert.match(html(Page),/Loading your projects/);assert.doesNotMatch(html(Page),/Choose or create a project/);
 for(const loading of [false,true]){query={loading,data:{myReleaseWorlds:[project]}};assert.match(html(Page),/href="\/releases\/fictional-focus\/board"[^>]*><span>Open Workshop/);}
});
test('empty and archived catalog guides creation; unusable recent records cannot hide a valid project',()=>{
 for(const projects of [[],[{...project,status:'archived'}]]){query={loading:false,data:{myReleaseWorlds:projects}};assert.match(html(Page),/Choose or create a project/);assert.doesNotMatch(html(Page),/href="\/releases\/fictional-focus\/board"/);}
 query={loading:false,data:{myReleaseWorlds:[...Array.from({length:7},(_,i)=>({...project,id:`invalid-${i}`,slug:'',updatedAt:'2030-01-01'})),project]}};assert.match(html(Page),/href="\/releases\/fictional-focus\/board"/);
});
test('API failure does not render empty-project action',()=>{query={loading:false,error:{message:'Unavailable'}};assert.match(html(Page),/Try again/);assert.doesNotMatch(html(Page),/Choose or create a project/);});
const {requestCommercialAccess}=load('lib/commercialAccess.ts');
const signal=()=>new AbortController().signal;
test('response distinguishes denial, sign-in, configuration failure and real zero',async()=>{
 for(const [status,expected] of [[401,'signed-out'],[403,'denied'],[503,'unavailable'],[500,'unavailable'],[200,'authorized']]){
  const result=await requestCommercialAccess(signal(),async()=>({status,ok:status===200,json:async()=>({attention:0})}));assert.equal(result.status,expected);assert.equal(result.attention,status===200?0:null);
 }
});
test('network/malformed responses fail closed but retry can recover',async()=>{
 for(const request of [async()=>{throw Error('network');},async()=>({status:200,ok:true,json:async()=>({})}),async()=>({status:200,ok:true,json:async()=>{throw Error('invalid JSON');}})])assert.equal((await requestCommercialAccess(signal(),request)).status,'unavailable');
 let attempts=0;const request=async()=>{if(++attempts===1)throw Error('offline');return {status:200,ok:true,json:async()=>({attention:3})};};
 assert.equal((await requestCommercialAccess(signal(),request)).status,'unavailable');assert.equal((await requestCommercialAccess(signal(),request)).attention,3);
});
test('rail protects destinations in loading, denied and failure states; failure offers retry',()=>{
 for(const status of ['loading','denied','unavailable','signed-out']){
  access={status,allowed:false,retry(){}};const output=html(Rail);assert.doesNotMatch(output,/href="\/creator\/(media|marketplace|engagements)"/);
  if(status==='loading')assert.match(output,/Checking business access/);
  if(status==='unavailable')assert.match(output,/Retry access check/);
  if(status==='signed-out')assert.match(output,/Sign in again/);
 }
 access={status:'authorized',allowed:true,attention:0,retry(){}};const output=html(Rail);for(const route of ['media','marketplace','engagements'])assert.ok(output.includes(`/creator/${route}`));
});
