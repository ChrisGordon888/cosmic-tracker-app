const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');
const { buildASTSchema, parse, validate } = require('graphql');
function load(relative) {
  const file = path.join(__dirname, '../src', relative);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { Date, Intl })(name => name.startsWith('@/') ? load(`${name.slice(2)}.ts`) : name.startsWith('./') ? load(path.join(path.dirname(relative),`${name}.ts`)) : require(name), module, module.exports);
  return module.exports;
}
const { getMusicAvailability: availability, playableMusicTracks, listenerCatalogCounts } = load('lib/musicAvailability.ts');
const { mapReleaseTracksToMusicTracks, mergeMusicCatalogs, findRealmRecommendation } = load('lib/publicMusicCatalog.ts');
const anon = { isCreatorView: false, isSignedIn: false };
const song = { id: 'public', visibility: 'public', audioUrl: '/full.wav', playbackStatus: 'playable' };
test('Anonymous shuffle candidates exclude private, member, premium, scheduled, locked and missing preview music', () => {
  const tracks = [song, {...song,id:'member',visibility:'signup'}, {...song,id:'premium',accessTier:'premium'}, {...song,id:'private',visibility:'private',isPublic:true}, {...song,id:'future',unlockDate:'4102444800000'}, {...song,id:'locked',playbackStatus:'locked'}, {...song,id:'preview-missing',playbackStatus:'preview'}, {...song,id:'preview',playbackStatus:'preview',previewAudioUrl:'/preview.wav'}];
  assert.deepEqual(Array.from(playableMusicTracks(tracks,anon), t=>t.id), ['public','preview']);
  assert.equal(availability(tracks.at(-1),anon).resolvedAudioUrl,'/preview.wav');
  assert.equal(availability(tracks[1],anon).label,'Join to Unlock');
  assert.equal(availability(tracks[1],{...anon,isSignedIn:true}).isPlayable,true);
  assert.equal(availability(tracks[2],{...anon,isSignedIn:true}).isPlayable,false);
});
test('Counts separate visible records, immediate playback and member-gated metadata', () => {
  const tracks=[song,{...song,id:'member',accessTier:'signup',audioUrl:null},{...song,id:'private',visibility:'private'},{...song,id:'future',unlockDate:'2099-01-01'}];
  const count=listenerCatalogCounts(tracks,false);
  assert.equal(count.catalogued,3);assert.equal(count.playable,1);assert.equal(count.memberGated,1);
});
test('Creator attribution and explicit registry linkage preserve distinct same-title creators',()=>{
  const registry=[{id:'original',trackTitle:'holdMyHand',realmId:101,trackUrl:'/old',visibility:'public'}];
  const live=mapReleaseTracksToMusicTracks([
    {id:'a',releaseWorldId:'world-a',title:'Hold My Hand',realmId:101,showInNexus:true,visibility:'public',audioUrl:'/a',artistName:'Artist A',releaseSlug:'world-a',legacyRegistryId:'original'},
    {id:'b',releaseWorldId:'world-b',title:'Hold My Hand',realmId:101,showInNexus:true,visibility:'public',audioUrl:'/b',artistName:'Artist B'},
    {id:'private',title:'Private',realmId:101,showInNexus:true,visibility:'private',isPublic:true},
  ]);
  const catalog=mergeMusicCatalogs(registry,live);
  assert.equal(catalog.length,2);assert.equal(catalog[0].artist,'Artist A');assert.equal(catalog[1].artist,'Artist B');
  const suggested=findRealmRecommendation(catalog,registry,101,'holdMyHand');
  assert.equal(suggested.id,'release-a');assert.equal(suggested.releaseSlug,'world-a');assert.equal(availability(suggested,anon).isPlayable,true);
  assert.equal(findRealmRecommendation(catalog,[],101,'Hold My Hand'),null);
});
test('Discovery GraphQL documents validate against the actual backend schema',()=>{
  const schema=buildASTSchema(require('../../backend/schemas'));
  for(const [file,names] of [['graphql/realms.ts',['GET_PUBLIC_NEXUS_TRACKS']],['graphql/musicAccess.ts',['GET_MY_NEXUS_TRACKS']]]){
    const docs=load(file);for(const name of names)assert.deepEqual(validate(schema,docs[name]),[],name);
  }
  for(const file of ['app/nexus/page.tsx','app/releases/[slug]/page.tsx']){
    const source=fs.readFileSync(path.join(__dirname,'../src',file),'utf8');
    const documents=[...source.matchAll(/(?:const|export const) (\w+) = gql`([\s\S]*?)`;/g)];
    const fragments=Object.fromEntries(documents.filter(([,name,body])=>body.trim().startsWith('fragment')).map(([,name,body])=>[name,body]));
    for(const [,name,body] of documents.filter(([,name,body])=>!body.trim().startsWith('fragment'))){
      const expanded=body.replace(/\$\{(\w+)\}/g,(_,key)=>fragments[key]);
      assert.deepEqual(validate(schema,parse(expanded)),[],`${file}: ${name}`);
    }
  }
});

function renderPage(relative, responses, auth = false, stateOverrides) {
  const React=require('react');
  const {renderToStaticMarkup}=require('react-dom/server');
  let stateIndex=0;
  const actualApollo=require('@apollo/client');
  function requireFixture(name) {
    if(name.endsWith('.css'))return {};
    if(name==='react')return stateOverrides ? {...React,useState(initial){const index=stateIndex++;return React.useState(index<stateOverrides.length?stateOverrides[index]:initial);}} : React;
    if(name==='@apollo/client')return {...actualApollo,useQuery(doc){const key=doc.definitions.find(d=>d.kind==='OperationDefinition')?.name?.value;return {data:responses[key],loading:false};},useMutation:()=>[async()=>({})]};
    if(name==='next-auth/react')return {useSession:()=>({data:auth?{user:{name:'Listener'}}:null,status:auth?'authenticated':'unauthenticated'}),signIn:()=>{}};
    if(name==='@/context/PlatformAccessProvider')return {usePlatformAccess:()=>({isAuthenticated:auth,canAccessCreatorOS:typeof auth==='object'&&auth.creator})};
    if(name==='next/navigation')return {useParams:()=>({slug:'other-world'})};
    if(name==='@/context/CreatorViewProvider')return {useCreatorView:()=>({isCreatorView:typeof auth==='object'&&auth.creator})};
    if(name==='@/hooks/useMusicPlayer')return {useMusicPlayer:()=>({playOrToggleTrack:()=>{},currentTrack:null,isPlaying:false})};
    if(name==='next/link')return {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
    if(name==='next/image')return {__esModule:true,default:({priority,...props})=>React.createElement('img',props)};
    if(name.startsWith('@/components/'))return {__esModule:true,default:()=>null};
    if(name.startsWith('@/'))return load(name.slice(2)+'.ts');
    return require(name);
  }
  const source=fs.readFileSync(path.join(__dirname,'../src',relative),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const module={exports:{}};
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`,{console,Date,Intl})(requireFixture,module,module.exports);
  return renderToStaticMarkup(React.createElement(module.exports.default));
}
test('Actual Nexus renders the chosen single title, artist and world URL; an empty Spotlight does not render a false selection',()=>{
  const track={id:'fictional-single',releaseWorldId:'fictional-world',title:'Fictional Song',realmId:101,showInNexus:true,visibility:'public',playbackStatus:'playable',audioUrl:'/fixture.wav',artistName:'Fictional Artist',releaseSlug:'fictional-world'};
  const world={id:'fictional-world',title:'Fictional World',slug:'fictional-world',releaseType:'single',status:'released',visibility:'public'};
  const html=renderPage('app/nexus/page.tsx',{
    GetPublicFeaturedSignal:{getPublicFeaturedSignal:track},GetPublicFeaturedReleaseWorld:{getPublicFeaturedReleaseWorld:world},GetPublicFeaturedReleaseTracks:{getPublicReleaseTracks:[track]},GetPublicNexusTracks:{getPublicNexusTracks:[track]},
  });
  assert.match(html,/Play Fictional Song/);assert.match(html,/Fictional World/);assert.match(html,/Fictional Artist/);assert.match(html,/href="\/releases\/fictional-world"/);
  assert.doesNotMatch(html,/Play Siren|Look to the light, the fire inside/);
  const empty=renderPage('app/nexus/page.tsx',{});
  assert.doesNotMatch(empty,/nexus-latest-signal fade-in|id="current-release"/);
});
test('Profile offers a return to the account-persisted Realm without inventing saved-song data',()=>{
 const html=renderPage('app/profile/page.tsx',{GetMe:{me:{name:'Fixture Listener',currentRealm:101,unlockedRealms:[303,101],completedTrials:[],visitedLocations:[],musicStats:{tracksListened:[]}}}},true);
 assert.match(html,/href="\/realms\/101"/);assert.match(html,/Continue in your Realm/);
});
test('Realm result renders immediate music for public tracks and an explicit sign-in action for gated tracks',()=>{
 const {MUSIC_REGISTRY}=load('lib/musicRegistry.ts');
 const {REALM_RESULT_CONTENT}=load('lib/realmResultContent.ts');
 const title=REALM_RESULT_CONTENT[303].modeVariants['move-through'].recommendedTrack;
 const original=MUSIC_REGISTRY.find(t=>t.realmId===303&&t.trackTitle===title);
 assert.ok(original,'curated result exists');
 const track={id:'result',releaseWorldId:'world',releaseSlug:'result-world',title:original.trackTitle,realmId:303,showInNexus:true,visibility:'public',playbackStatus:'playable',audioUrl:'/fixture.wav',legacyRegistryId:original.id};
 const states=[0,{},'move-through',true];
 const publicHtml=renderPage('app/find-your-realm/page.tsx',{GetPublicNexusTracks:{getPublicNexusTracks:[track]}},false,states);
 assert.ok(publicHtml.includes(`Play ${track.title}`));assert.match(publicHtml,/href="\/releases\/result-world"/);
 const gatedHtml=renderPage('app/find-your-realm/page.tsx',{GetPublicNexusTracks:{getPublicNexusTracks:[{...track,accessTier:'signup',audioUrl:null}]}},false,states);
 assert.match(gatedHtml,/Sign in to listen/);assert.ok(!gatedHtml.includes(`Play ${track.title}`));
});
test('A creator following another artist’s public world gets public listening without creator tools',()=>{
 const html=renderPage('app/releases/[slug]/page.tsx',{
  GetMyReleaseWorldBySlug:{getMyReleaseWorldBySlug:null},
  GetPublicReleaseWorldBySlug:{getPublicReleaseWorldBySlug:{id:'other-world',slug:'other-world',title:'Other Artist',visibility:'public',releaseType:'single',story:'Public story fixture'}},
  GetReleasePagePublicData:{getPublicReleaseTracks:[],getPublicBoardArtifacts:[]},
 },{creator:true});
 assert.match(html,/Public story fixture/);assert.doesNotMatch(html,/Creator tools|Keep shaping what the listener will feel/);
});
test('Explicit registry suppression hides migrated Vault/Sandbox audio without deleting other creators',()=>{
 const registry=[{id:'retired',trackTitle:'Hidden',realmId:101,trackUrl:'/old',visibility:'public'},{id:'kept',trackTitle:'Kept',realmId:101,trackUrl:'/kept',visibility:'public'}];
 const catalog=mergeMusicCatalogs(registry,[],['retired']);assert.deepEqual(Array.from(catalog,t=>t.id),['kept']);
});
