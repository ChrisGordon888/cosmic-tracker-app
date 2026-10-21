const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {buildASTSchema,execute,validate}=require('graphql');
const {addTypenameToDocument}=require('@apollo/client/utilities');
const cache={};
function compile(file,resolve){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8').replaceAll('import.meta.url',"'file:///fixture'"),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(`(function(require,module,exports){${code}})`,{URLSearchParams})(resolve,m,m.exports);return m.exports;}
function lib(name){return cache[name]??(cache[name]=compile(`src/lib/${name}.ts`,n=>n.startsWith('./')?lib(n.slice(2)):require(n)));}
const documents=compile('src/graphql/intelligence.ts',require),schema=buildASTSchema(require('../../backend/schemas'));
const owner='aaaaaaaaaaaaaaaaaaaaaaaa';
const tracks=Array.from({length:50},(_,i)=>({id:(i+1).toString(16).padStart(24,'0'),ownerId:owner,title:`Catalog song ${i+1}`,slug:`song-${i+1}`,nexusReviewStatus:'draft',trackNumber:i+1,role:'unassigned',isFocusTrack:false,realmId:[303,202,101,55,44,0,null][i%7],realmFinderScores:{realm303:0,realm202:12,realm101:75,realm55:0,realm44:0,realm0:0},realmFinderSignals:[],creativeSignals:['dreamy','memory','floating'],status:'demo',catalogTreatment:'current',visibility:i%2?'private':'listed',songMoments:[],creatorContext:{meaning:null}}));
const roots={myCatalogTracks:tracks,myReleaseWorlds:[],myIntelligenceHiddenTrackIds:[],myCreativeExperiments:[],myCreativePaths:[],myCreativeDirections:[],myHypothesisFeedback:[]};
const {buildIntelligence}=lib('intelligenceWorkbench'),{livingUniverse}=lib('livingUniverse');
const MiniUniverse=compile('src/components/intelligence/MiniUniverse.tsx',require).default;
let received;
test('Actual GraphQL/Apollo-shaped 50-song catalog survives nested typename and reaches both Universe views',async()=>{
 const query=addTypenameToDocument(documents.INTELLIGENCE_SOURCES);
 assert.deepEqual(validate(schema,query),[]);assert.deepEqual(validate(schema,documents.INTELLIGENCE_AUDIO_PROFILES),[]);
 const response=await execute({schema,document:query,rootValue:roots,contextValue:{user:{id:owner}}});
 assert.equal(response.errors,undefined);received=response.data;
 assert.equal(received.myCatalogTracks[0].realmFinderScores.__typename,'RealmFinderScores');
 const analysis=buildIntelligence(received.myCatalogTracks,[],owner);
 assert.equal(analysis.invalidCount,0);assert.equal(analysis.songs.length,50);
 assert.equal('__typename' in analysis.songs[0].sourceFacts.realmFinderScores,false);
 const scene=livingUniverse(analysis,tracks[0].id,[]);assert.equal(scene.nodes.length,50);assert.equal(scene.regions.reduce((sum,r)=>sum+r.count,0),50);
 let rendered=0;for(const r of scene.regions){const realm=livingUniverse(analysis,'',[],{scale:'realm',realmId:r.id});const html=renderToStaticMarkup(React.createElement(MiniUniverse,{universe:realm,selectedId:'',onSelect:()=>{},onRealm:()=>{}}));const members=scene.nodes.filter(n=>(n.realmId??null)===r.id);rendered+=members.length;for(const member of members)assert.ok(html.includes(member.title));}
 assert.equal(rendered,50);assert.ok(scene.regions.find(r=>r.id===0).count>0);assert.ok(scene.regions.find(r=>r.id===null).count>0);
 const excluded=buildIntelligence([...received.myCatalogTracks,{...tracks[0],id:'foreign',ownerId:'another'},{...tracks[0],id:'vault',catalogTreatment:'vault'},{...tracks[0],id:'archived',status:'archived'}],[],owner,undefined,[tracks[2].id]);
 assert.equal(excluded.songs.length,49);assert.equal(excluded.songs.some(s=>s.trackId===tracks[2].id),false);
 const paths=[{id:'p',a:tracks[0].id,b:tracks[1].id,note:'Creator intention'}];assert.ok(livingUniverse(excluded,tracks[0].id,paths).edges.some(e=>e.kind==='authored'));
});
function page({source={data:roots},audio={},accessLoading=false}={}){
 let passed;
 const Page=compile('src/app/creator/intelligence/page.tsx',n=>{
  if(n.endsWith('.css'))return {};
  if(n==='@apollo/client')return {useMutation:()=>[async()=>({})],useQuery:doc=>({...((doc===documents.INTELLIGENCE_SOURCES)?source:audio),refetch:async()=>({})})};
  if(n==='@/context/PlatformAccessProvider')return {usePlatformAccess:()=>({user:{id:owner},canAccessCreatorOS:true,loading:accessLoading})};
  if(n==='@/graphql/intelligence')return documents;
  if(n==='@/lib/audioFeatures')return {AUDIO_VERSION:'pcm-perception-v2'};
  if(n==='@/components/intelligence/IntelligenceWorkbench')return {default:props=>{passed=props;const a=buildIntelligence(props.tracks,props.worlds,props.ownerId,undefined,props.hiddenTrackIds);return React.createElement('div',null,`${a.songs.length} voices`);}};
  return require(n);
 }).default;
 return {html:renderToStaticMarkup(React.createElement(Page)),get props(){return passed;}};
}
test('Optional audio absent, failed or stale never hides the authenticated catalog',()=>{
 for(const audio of [{loading:true},{data:{myAudioProfiles:[]}},{error:Error('Audio unavailable')},{data:{myAudioProfiles:[{trackId:tracks[0].id,analysisVersion:'pcm-level-v1'}]}}]){const result=page({source:{data:received??roots},audio});assert.match(result.html,/50 voices/);assert.equal(result.props.audioProfiles.length,0);}
 assert.match(page({audio:{error:Error('failed')}}).html,/Recording measurements could not be loaded/);
});
test('Source failures, loading and malformed responses are explicit, never zero voices',()=>{
 for(const source of [{error:Error('GraphQL 400')},{data:{...roots,myCatalogTracks:null}},{data:{...roots,myIntelligenceHiddenTrackIds:null}}]){const result=page({source});assert.match(result.html,/Intelligence is unavailable/);assert.doesNotMatch(result.html,/0 voices/);}
 assert.match(page({source:{loading:true}}).html,/Reading your current signals/);assert.match(page({accessLoading:true}).html,/Checking creator access/);
});

test('Empty, fully excluded and invalid collections have distinct explanations',()=>{
 const {intelligenceEmptyMessage}=lib('intelligenceWorkbench');
 const full=buildIntelligence(tracks,[],owner),empty=buildIntelligence([],[],owner),hidden=buildIntelligence(tracks,[],owner,undefined,tracks.map(t=>t.id));
 assert.match(intelligenceEmptyMessage(0,empty,empty),/catalog is empty/);
 assert.match(intelligenceEmptyMessage(50,full,hidden),/All eligible songs are hidden/);
 const invalid=buildIntelligence([{...tracks[0],title:42}],[],owner);
 assert.match(intelligenceEmptyMessage(1,invalid,invalid),/not an empty-catalog result/);
 assert.equal(intelligenceEmptyMessage(50,full,full),null);
});
