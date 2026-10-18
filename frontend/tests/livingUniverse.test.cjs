const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const cache={};function lib(name){if(cache[name])return cache[name];const m={exports:{}};cache[name]=m.exports;const source=fs.readFileSync(`src/lib/${name}.ts`,'utf8').replaceAll('import.meta.url',"'file:///fixture'");vm.runInNewContext(`(function(require,module,exports){${ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText}})`,{fetch:(...a)=>globalThis.fetch(...a),Blob,Uint8Array,Float32Array,Float64Array,Uint32Array,AbortController})(n=>n.startsWith('./')?lib(n.slice(2)):require(n),m,m.exports);return m.exports;}
const {buildIntelligence}=lib('intelligenceWorkbench'),{livingUniverse}=lib('livingUniverse');
const tracks=Array.from({length:60},(_,i)=>({id:String(i).padStart(3,'0'),ownerId:'owner',title:`Song ${i}`,realmId:i===0?0:null,creativeSignals:['dreamy','floating','memory'],releaseWorldId:i<6?'world':null,trackNumber:i+1}));
const world={id:'world',ownerId:'owner',title:'Fictional six',slug:'fictional'};
test('Scene is bounded, deterministic, owner scoped and retains explicit off-window selection',()=>{
 const a=buildIntelligence([...tracks,{...tracks[0],id:'foreign',ownerId:'other'},{...tracks[0],id:'vault',catalogTreatment:'vault'}],[world],'owner');
 const first=livingUniverse(a,'000'),next=livingUniverse(a,'001');assert.ok(first.nodes.length<=16);assert.ok(first.edges.length<=70);assert.equal(first.nodes.some(n=>['foreign','vault'].includes(n.id)),false);
 assert.equal(first.nodes[0].id,'000');assert.equal(next.nodes[0].id,'001');assert.equal(JSON.stringify(first.nodes),JSON.stringify(livingUniverse(a,'000').nodes));assert.ok(livingUniverse(a,'059').nodes.some(n=>n.id==='059'));
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

test('Realm zero, empty Realm and bounded Universe pages preserve eligible sources',()=>{
 const a=buildIntelligence(tracks,[world],'owner'),before=JSON.stringify(a);
 const zero=livingUniverse(a,'001',[],{scale:'realm',realmId:0});assert.equal(zero.scopeCount,1);assert.equal(zero.nodes[0].id,'000');
 const empty=livingUniverse(a,'000',[],{scale:'realm',realmId:303});assert.equal(empty.nodes.length,0);
 const first=livingUniverse(a,'000',[],{scale:'universe',page:0}),next=livingUniverse(a,'000',[],{scale:'universe',page:1});
 assert.equal(first.nodes.length,12);assert.equal(first.pageCount,5);assert.equal(next.nodes.some(n=>first.nodes.some(m=>m.id===n.id)),false);
 assert.equal(livingUniverse(a,'000',[],{scale:'universe',page:999}).page,4);assert.equal(JSON.stringify(a),before);
});

test('Spatial identity survives focus and return with genuine depth and bounded wider relationships',()=>{
 const a=buildIntelligence(tracks,[world],'owner');
 const broad=livingUniverse(a,'000',[],{scale:'universe',page:0});
 const focused=livingUniverse(a,'002',[],{scale:'song',context:{scale:'universe',page:0}});
 for(const n of broad.nodes) assert.equal(JSON.stringify(n.position),JSON.stringify(focused.nodes.find(x=>x.id===n.id).position));
 assert.ok(new Set(broad.nodes.map(n=>n.position[2].toFixed(2))).size>5);
 assert.ok(broad.edges.some(e=>e.a!=='000'&&e.b!=='000'));
 assert.ok(broad.edges.length<=18);assert.equal(focused.contextKey,broad.contextKey);
});
