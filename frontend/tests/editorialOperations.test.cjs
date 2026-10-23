const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),React=require('react');
const walk=n=>Array.isArray(n)?n.flatMap(walk):n&&typeof n==='object'?[n,...walk(n.props?.children)]:[];
function component(canPlace,status='approved',selected=false){
 const calls=[],refetches=[];const m={exports:{}};
 const code=ts.transpileModule(fs.readFileSync('src/components/admin/EditorialPlacementControls.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const imports=name=>name==='./NexusSamplerControls'?{default:()=>null}:name==='react'?{...React,useState:x=>[x,()=>{}]}:name==='@apollo/client'?{
 gql:s=>s[0],useQuery:q=>({data:q.includes('ReviewEvidence')?{nexusReviewEvidence:[]}:{nexusEditorialConfig:{selectedWorldIds:selected?['w']:[],realmDiscovery:[],realmSoundtracks:selected?[{trackId:'t',worldId:'w',realmId:0}]:[]}},refetch:async()=>refetches.push(q)}),useMutation:q=>[async variables=>calls.push({q,...variables})]
 }:require(name);
 vm.runInNewContext(code,{exports:m.exports,require:imports});
 return {nodes:walk(m.exports.default({canPlace,world:{id:'w',publicCanon:true,visibility:'public',status:'active'},track:{id:'t',realmId:0,nexusReviewStatus:status,visibility:'public',status:'released'}})),calls,refetches};
}
test('Review-only admin sees permission reason and cannot select placements',()=>{
 const {nodes}=component(false);assert.ok(nodes.some(n=>typeof n.props?.children==='string'&&n.props.children.includes('nexus.editorial')));
 for(const n of nodes.filter(n=>n.type==='button'))assert.equal(n.props.disabled,true);
});
test('Approval gates soundtrack only; explicit Realm 0 actions call independent mutations',async()=>{
 const pending=component(true,'in-review');assert.equal(pending.nodes.find(n=>n.props?.children==='Select soundtrack').props.disabled,true);
 const {nodes,calls,refetches}=component(true);
 for(const label of ['Admit to Realm discovery','Select soundtrack','Select Nexus World'])await nodes.find(n=>n.props?.children===label).props.onClick();
 assert.equal(calls.length,3);assert.ok(calls[0].q.includes('setRealmDiscovery'));assert.ok(calls[1].q.includes('setRealmSoundtrack'));assert.ok(calls[2].q.includes('setNexusProjectSelection'));assert.equal(calls[1].variables.realmId,0);assert.ok(calls.every(c=>c.variables.selected===true));await new Promise(resolve=>setImmediate(resolve));assert.equal(refetches.length,3);
});
test('Selected soundtrack can be withdrawn independently; no workspace editing link',async()=>{
 const {nodes,calls}=component(true,'published',true);await nodes.find(n=>n.props?.children==='Withdraw soundtrack').props.onClick();assert.equal(calls[0].variables.selected,false);assert.equal(nodes.filter(n=>n.type==='a').length,0);
 const source=fs.readFileSync('src/app/admin/nexus/page.tsx','utf8');assert.ok(!source.includes('Open Board'));assert.ok(source.includes('nexusEditorialAccess?.canPublish'));assert.ok(source.includes('An owner must explicitly grant nexus.publish'));
});
