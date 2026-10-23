const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const walk=n=>Array.isArray(n)?n.flatMap(walk):n&&typeof n==='object'?[n,...walk(n.props?.children)]:[];
function load(file,mocks){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(`(function(require,module,exports){${code}})`)(name=>mocks[name]||(name.endsWith('.css')?{}:name==='next/link'?{default:'a'}:require(name)),m,m.exports);return m.exports;}
const projects=[{world:{id:'b',title:'World B',slug:'b'},creatorName:'Artist B',isSelected:true,realmId:303,tracks:[]},{world:{id:'a',title:'World A',slug:'a'},creatorName:'Artist A',isSelected:false,realmId:101,tracks:[]}];
const common={'@/lib/releaseSharing':load('src/lib/releaseSharing.ts',{}),'@/graphql/publicProjects':{PUBLIC_PROJECTS:'worlds'},'@/lib/publicProjects':{projectPlayback:()=>({total:0,available:0,member:0,lead:null})},'@/lib/creativeFingerprint':{realmName:id=>`Realm ${id}`}};
test('Actual public shelf renders each selected/unselected World once with creator and one restrained marker',()=>{
 const {PublicWorlds}=load('src/components/creator/SelectedWorlds.tsx',{...common,'@apollo/client':{useQuery:()=>({data:{publicProjects:projects}})},'@/hooks/useMusicPlayer':{useMusicPlayer:()=>({})},'@/context/PlatformAccessProvider':{usePlatformAccess:()=>({isAuthenticated:false})}});
 const nodes=walk(PublicWorlds({}));assert.equal(nodes.filter(n=>n.type==='section').length,1);assert.deepEqual(nodes.filter(n=>n.type==='h3').map(n=>n.props.children),['World B','World A']);assert.equal(nodes.filter(n=>n.props?.className==='public-world-label').length,1);assert.ok(nodes.some(n=>n.props?.children==='Artist A'));assert.ok(nodes.some(n=>n.props?.href==='/releases/b?world=b'));
});
test('Admin select/remove uses existing mutation, waits for both refetches, and stale metadata stays hidden',async()=>{
 const calls=[],refresh=[];
 const {default:Panel}=load('src/components/admin/ProjectSelections.tsx',{...common,react:{Fragment:require('react').Fragment,useState:v=>[v,()=>{}]},'@apollo/client':{gql:()=> 'config',useQuery:q=>q==='worlds'?{data:{publicProjects:projects},refetch:async()=>refresh.push('worlds')}:{data:{nexusEditorialConfig:{selectedWorldIds:['b','stale']}},refetch:async()=>refresh.push('config')},useMutation:()=>[async args=>calls.push(args)]}});
 const nodes=walk(Panel());const buttons=nodes.filter(n=>n.type==='button');assert.deepEqual(buttons.map(n=>n.props.children),['Deselect from Nexus','Select for Nexus','Remove selection']);
 await buttons[1].props.onClick();await buttons[0].props.onClick();await buttons[2].props.onClick();assert.equal(JSON.stringify(calls.map(c=>c.variables)),JSON.stringify([{worldId:'a',selected:true},{worldId:'b',selected:false},{worldId:'stale',selected:false}]));assert.equal(refresh.length,6);
 assert.ok(nodes.some(n=>n.type==='span'&&JSON.stringify(n.props.children).includes('No longer eligible')));
});
test('Admin query failure does not show an empty eligibility list or active selection controls',()=>{
 const {default:Panel}=load('src/components/admin/ProjectSelections.tsx',{...common,react:{Fragment:require('react').Fragment,useState:v=>[v,()=>{}]},'@apollo/client':{gql:()=>'',useQuery:()=>({error:new Error('offline')}),useMutation:()=>[()=>{}]}});
 const nodes=walk(Panel());assert.equal(nodes.filter(n=>n.props?.role==='alert').length,1);assert.deepEqual(nodes.filter(n=>n.type==='button').map(n=>n.props.children),['Retry']);
});
function realLib(name){return load(`src/lib/${name}.ts`,{'./musicAvailability':load('src/lib/musicAvailability.ts',{}),'./playerRealm':load('src/lib/playerRealm.ts',{'./realmTheme':load('src/lib/realmTheme.ts',{})})});}
for(const surface of ['Realm','Nexus'])test(`${surface} World Play hands off the full ordered public queue from its actual card`,()=>{
 const playback=realLib('publicProjects'),calls=[];
 const song=(id,trackNumber,realmId,visibility='listed',isFocusTrack=false)=>({id,title:id,trackNumber,realmId,visibility,isFocusTrack,audioUrl:`/${id}.mp3`,accessTier:'public',playbackStatus:'playable'});
 const p={world:{id:'world',title:'Break the Code',slug:'break-the-code'},creatorName:'Artist',realmId:303,isSelected:surface==='Nexus',tracks:[song('C',3,0),song('A',1,303),song('private',2.5,55,'private'),song('B',2,null,'listed',true)]};
 let variables;
 const {PublicWorlds}=load('src/components/creator/SelectedWorlds.tsx',{...common,'@/lib/publicProjects':playback,'@apollo/client':{useQuery:(_,o)=>{variables=o.variables;return {data:{publicProjects:[p]}};}},'@/hooks/useMusicPlayer':{useMusicPlayer:()=>({playOrToggleTrack:(...args)=>calls.push(args)})},'@/context/PlatformAccessProvider':{usePlatformAccess:()=>({isAuthenticated:false})}});
 const nodes=walk(PublicWorlds(surface==='Realm'?{realmId:303}:{selectedOnly:true}));
 nodes.find(n=>n.type==='button').props.onClick();
 const [selected,queue,options]=calls[0];assert.ok(queue,'World card must supply a queue');
 assert.deepEqual(Array.from(queue,t=>t.trackTitle),['A','B','C']);assert.equal(selected.id,'release-B');
 assert.deepEqual(Array.from(queue,t=>t.realmId),[303,null,0]);assert.ok(queue.every(t=>t.releaseSlug==='break-the-code'));
 assert.equal(options.source,'release');assert.equal(options.label,'Break the Code release');assert.equal(variables.selectedOnly,surface==='Nexus');
 const first=playback.projectPlayback({...p,tracks:p.tracks.map(t=>({...t,isFocusTrack:false}))},false);assert.equal(first.lead.id,'release-A');
 const single=playback.projectPlayback({...p,tracks:[p.tracks[1]]},false);assert.equal(single.queue.length,1);
});
