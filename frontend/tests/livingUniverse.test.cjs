const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const cache={};function lib(name){if(cache[name])return cache[name];const m={exports:{}};cache[name]=m.exports;const source=fs.readFileSync(`src/lib/${name}.ts`,'utf8').replaceAll('import.meta.url',"'file:///fixture'");vm.runInNewContext(`(function(require,module,exports){${ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText}})`,{fetch:(...a)=>globalThis.fetch(...a),Blob,Uint8Array,Float32Array,Float64Array,Uint32Array,AbortController,URLSearchParams})(n=>n.startsWith('./')?lib(n.slice(2)):require(n),m,m.exports);return m.exports;}
const {buildIntelligence}=lib('intelligenceWorkbench'),{livingUniverse}=lib('livingUniverse');
const tracks=Array.from({length:60},(_,i)=>({id:String(i).padStart(3,'0'),ownerId:'owner',title:`Song ${i}`,realmId:i===0?0:null,creativeSignals:['dreamy','floating','memory'],releaseWorldId:i<6?'world':null,trackNumber:i+1}));
const world={id:'world',ownerId:'owner',title:'Fictional six',slug:'fictional'};
test('Scene is bounded, deterministic, owner scoped and retains explicit off-window selection',()=>{
 const a=buildIntelligence([...tracks,{...tracks[0],id:'foreign',ownerId:'other'},{...tracks[0],id:'vault',catalogTreatment:'vault'}],[world],'owner');
 const first=livingUniverse(a,'000'),next=livingUniverse(a,'001');assert.equal(first.nodes.length,60);assert.ok(first.edges.length<=70);assert.equal(first.nodes.some(n=>['foreign','vault'].includes(n.id)),false);
 assert.equal(first.nodes[0].id,'000');assert.equal(next.nodes[0].id,'000');assert.equal(JSON.stringify(first.nodes),JSON.stringify(livingUniverse(a,'000').nodes));assert.ok(livingUniverse(a,'059').nodes.some(n=>n.id==='059'));
 const ids=new Set(first.nodes.map(n=>n.id));assert.ok(first.edges.every(e=>e.meaningful&&ids.has(e.a)&&ids.has(e.b)));assert.ok(first.nodes.every(n=>n.position.every(Number.isFinite)));
});
test('Project neighborhoods use canonical memberships without changing sources; empty scene remains valid',()=>{
 const a=buildIntelligence(tracks,[world],'owner'),before=JSON.stringify(a);const scene=livingUniverse(a,'000');assert.ok(scene.nodes.filter(n=>n.groupId==='world:world').length>0);assert.equal(JSON.stringify(a),before);
 const empty=livingUniverse(buildIntelligence([],[],'owner'),'');assert.equal(empty.nodes.length,0);assert.equal(empty.edges.length,0);
});

test('Realm zero stays distinct from missing; authored intent is separately typed and owner-filtered',()=>{
 const analysis=buildIntelligence(tracks,[world],'owner');
 const scene=livingUniverse(analysis,'000',[{id:'path',a:'000',b:'001',note:'My intention'},{id:'foreign',a:'000',b:'foreign',note:''}]);
 assert.equal(scene.nodes.find(n=>n.id==='000').realmName,'InterSiddhi');
 assert.equal(scene.nodes.find(n=>n.id==='001').realmName,'Realm undecided');
 assert.equal(scene.edges.filter(e=>e.kind==='authored').length,1);
 assert.equal(scene.edges.find(e=>e.kind==='authored').note,'My intention');
 assert.ok(scene.edges.filter(e=>e.kind==='supported').length<=12);
});

test('All songs coexist in every scale; Realm zero and missing assignments are distinct',()=>{
 const a=buildIntelligence(tracks,[world],'owner'),before=JSON.stringify(a);
 const zero=livingUniverse(a,'',[],{scale:'realm',realmId:0});assert.equal(zero.scopeCount,1);assert.equal(zero.nodes.length,60);
 const unassigned=livingUniverse(a,'',[],{scale:'realm',realmId:null});assert.equal(unassigned.scopeCount,59);
 const empty=livingUniverse(a,'',[],{scale:'realm',realmId:303});assert.equal(empty.scopeCount,0);assert.equal(empty.nodes.length,60);
 const all=livingUniverse(a,'');assert.equal(all.scale,'universe');assert.equal(all.focusIds.length,0);assert.equal(all.nodes.length,60);assert.equal('pageCount' in all,false);
 assert.equal(JSON.stringify(a),before);
});

test('Spatial identity survives focus and return with genuine depth and bounded wider relationships',()=>{
 const a=buildIntelligence(tracks,[world],'owner');
 const broad=livingUniverse(a,'000',[],{scale:'universe'});
 const focused=livingUniverse(a,'002',[],{scale:'song',context:{scale:'universe'}});
 for(const n of broad.nodes) assert.equal(JSON.stringify(n.position),JSON.stringify(focused.nodes.find(x=>x.id===n.id).position));
 assert.ok(new Set(broad.nodes.map(n=>n.position[2].toFixed(2))).size>5);
 assert.ok(broad.edges.some(e=>e.a!=='000'&&e.b!=='000'));
 assert.ok(broad.edges.length<=18);assert.equal(focused.contextKey,broad.contextKey);
});

test('Explicit navigation respects valid songs and Realm zero; no arbitrary default',()=>{
 const {intelligenceNavigation}=lib('intelligenceNavigation');
 assert.equal(intelligenceNavigation('', ['000']).songId,'');
 assert.equal(intelligenceNavigation('', ['000']).view.scale,'universe');
 assert.equal(intelligenceNavigation('?song=000', ['000']).view.scale,'song');
 assert.equal(intelligenceNavigation('?song=foreign', ['000']).songId,'');
 assert.equal(intelligenceNavigation('?realm=0', ['000']).view.realmId,0);
 assert.equal(intelligenceNavigation('?realm=unassigned', ['000']).view.realmId,null);
 assert.equal(intelligenceNavigation('?realm=', ['000']).view.scale,'universe');
});

test('Hidden songs leave the complete analysis and pairing candidates without changing source records',()=>{
 const before=JSON.stringify(tracks),a=buildIntelligence(tracks,[world],'owner',undefined,['000','001']);
 assert.equal(a.songs.length,58);assert.ok(a.catalog.edges.every(e=>!['000','001'].includes(e.a)&&!['000','001'].includes(e.b)));
 assert.ok(a.projects.every(p=>p.members.every(s=>!['000','001'].includes(s.trackId))));
 assert.equal(livingUniverse(a,'').nodes.length,58);assert.equal(JSON.stringify(tracks),before);
 const restored=buildIntelligence(tracks,[world],'owner');assert.equal(restored.songs.length,60);
 const prior=livingUniverse(restored,'').nodes.find(n=>n.id==='002').position;assert.equal(JSON.stringify(livingUniverse(a,'').nodes.find(n=>n.id==='002').position),JSON.stringify(prior));
});
