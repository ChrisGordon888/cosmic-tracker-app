const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),React=require('react');
const walk=n=>Array.isArray(n)?n.flatMap(walk):n&&typeof n==='object'?[n,...walk(n.props?.children)]:[];
function render(ids=[],canPlace=true){
 const calls=[],m={exports:{}};
 const imports=name=>name==='react'?{...React,useState:v=>[v,()=>{}]}:name==='@/graphql/realms'?{GET_PUBLIC_NEXUS_TRACKS:'main'}:name==='@apollo/client'?{gql:s=>s[0],useQuery:q=>({data:q==='main'?{getPublicNexusTracks:[{id:'a',title:'A'},{id:'b',title:'B'}]}:{nexusEditorialConfig:{samplerRevision:3,nexusRealmSamplers:[{realmId:0,trackIds:ids}]}},refetch:async()=>{}}),useMutation:()=>[async value=>calls.push(value)]}:require(name);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/admin/NexusSamplerControls.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:m.exports,require:imports});
 return {calls,nodes:walk(m.exports.default({trackId:'a',realmId:0,canPlace}))};
}
test('Main selection is not automatically sampler-selected; explicit addition preserves revision and Realm 0',()=>{
 const {nodes,calls}=render();assert.equal(calls.length,0);nodes.find(n=>n.props?.children==='Select for Nexus sampler').props.onClick();assert.equal(JSON.stringify(calls[0].variables),JSON.stringify({realmId:0,trackIds:['a'],expectedRevision:3}));
});
test('Sampler moves preserve intentional order and withdrawals do not call other destinations',()=>{
 const {nodes,calls}=render(['a','b']);nodes.find(n=>n.props?.['aria-label']==='Move sampler track 2 up').props.onClick();assert.deepEqual(Array.from(calls[0].variables.trackIds),['b','a']);
 nodes.find(n=>n.props?.children==='Withdraw from Nexus sampler').props.onClick();assert.deepEqual(Array.from(calls[1].variables.trackIds),['b']);
});
test('Unauthorized or full samplers cannot add another song',()=>{
 for(const fixture of [render([],false),render(Array.from({length:9},(_,i)=>String(i)))])assert.equal(fixture.nodes.find(n=>n.props?.children==='Select for Nexus sampler').props.disabled,true);
});
