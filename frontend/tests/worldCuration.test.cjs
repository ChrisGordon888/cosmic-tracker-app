const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const walk=n=>Array.isArray(n)?n.flatMap(walk):n&&typeof n==='object'?[n,...walk(n.props?.children)]:[];
function load(file,mocks){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(`(function(require,module,exports){${code}})`)(name=>mocks[name]||(name.endsWith('.css')?{}:name==='next/link'?{default:'a'}:require(name)),m,m.exports);return m.exports;}
const projects=[{world:{id:'b',title:'World B',slug:'b'},creatorName:'Artist B',isSelected:true,realmId:303,tracks:[]},{world:{id:'a',title:'World A',slug:'a'},creatorName:'Artist A',isSelected:false,realmId:101,tracks:[]}];
const common={'@/graphql/publicProjects':{PUBLIC_PROJECTS:'worlds'},'@/lib/publicProjects':{projectPlayback:()=>({total:0,available:0,member:0,lead:null})},'@/lib/creativeFingerprint':{realmName:id=>`Realm ${id}`}};
test('Actual public shelf renders each selected/unselected World once with creator and one restrained marker',()=>{
 const {PublicWorlds}=load('src/components/creator/SelectedWorlds.tsx',{...common,'@apollo/client':{useQuery:()=>({data:{publicProjects:projects}})},'@/hooks/useMusicPlayer':{useMusicPlayer:()=>({})},'@/context/PlatformAccessProvider':{usePlatformAccess:()=>({isAuthenticated:false})}});
 const nodes=walk(PublicWorlds({}));assert.equal(nodes.filter(n=>n.type==='section').length,1);assert.deepEqual(nodes.filter(n=>n.type==='h3').map(n=>n.props.children),['World B','World A']);assert.equal(nodes.filter(n=>n.props?.className==='public-world-label').length,1);assert.ok(nodes.some(n=>n.props?.children==='Artist A'));assert.ok(nodes.some(n=>n.props?.href==='/releases/b'));
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
