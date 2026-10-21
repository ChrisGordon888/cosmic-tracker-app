const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const cache={};function lib(name){if(cache[name])return cache[name];const m={exports:{}};cache[name]=m.exports;const source=fs.readFileSync(`src/lib/${name}.ts`,'utf8').replaceAll('import.meta.url',"'file:///fixture'");vm.runInNewContext(`(function(require,module,exports){${ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText}})`,{fetch:(...a)=>globalThis.fetch(...a),Blob,Uint8Array,Float32Array,Float64Array,Uint32Array,AbortController})(n=>n.startsWith('./')?lib(n.slice(2)):require(n),m,m.exports);return m.exports;}
const {buildIntelligence}=lib('intelligenceWorkbench'),{signature,compassPairing,safeSeed,seedTransition}=lib('creativeCompass');
const tracks=['a','b','c','d'].map(id=>({id,ownerId:'owner',title:id,creativeSignals:['dreamy','floating','memory','nostalgic'],realmId:0}));
const analysis=()=>buildIntelligence(tracks,[],'owner');
test('Signature requires repeated explicit evidence, separates aspiration, and never infers vocal identity',()=>{
 const a=analysis(),s=signature(a,[{targetId:'d',value:'ASPIRE'}]);assert.ok(s.threads.length>0&&s.threads.length<=3);assert.ok(s.threads.every(t=>t.count===4));assert.equal(s.aspiring[0].trackId,'d');
 assert.equal(signature(buildIntelligence(tracks.slice(0,2),[],'owner')).threads.length,0);
 assert.equal(signature(buildIntelligence(tracks.map(t=>({...t,creativeSignals:[],notes:'dreamy floating memory'})),[],'owner')).threads.length,0);
 assert.match(s.unknown,/cannot be established/);
});
test('Aspiration changes a supported pairing with bounded adjustments; rejection never removes a direction',()=>{
 const a=analysis(),base=compassPairing(a,'a'),next=compassPairing(a,'a',[{targetId:'d',value:'ASPIRE'}]);assert.equal(base.related.id,'b');assert.equal(next.related.id,'d');assert.ok(next.candidates.every(c=>Math.abs(c.adjustment)<=.18));assert.match(next.related.why,/wish to explore/);
 const rejected=compassPairing(a,'a',[{targetId:'b',value:'NOT_NOW'}]);assert.equal(rejected.candidates.length,base.candidates.length);assert.ok(rejected.candidates.some(c=>c.id==='b'));
 assert.equal(compassPairing(a,'a',[]).related.id,'b');
 const recognize=compassPairing(a,'a',[{targetId:'orientation',value:'RECOGNIZE'},{targetId:'b',value:'ME'},{targetId:'d',value:'ASPIRE'}]);assert.equal(recognize.related.id,'b');
});
test('Sparse and foreign/Vault/archived songs cannot manufacture relationships or enter an experiment',()=>{
 const a=buildIntelligence([...tracks,{...tracks[0],id:'foreign',ownerId:'other'},{...tracks[0],id:'vault',catalogTreatment:'vault'},{...tracks[0],id:'archived',status:'archived'}],[],'owner');
 assert.deepEqual(Array.from(safeSeed(['a','a','foreign','vault','archived','b'],a)),['a','b']);
 assert.equal(compassPairing(buildIntelligence([{id:'s',ownerId:'owner',title:'Sparse'}],[],'owner'),'s',[{targetId:'s',value:'ASPIRE'}]).related,undefined);
});
test('Provisional order is bounded, preserves canonical sources, and uses existing transition evidence',()=>{
 const a=analysis(),before=JSON.stringify(a),order=safeSeed(['d','b','a'],a);assert.deepEqual(Array.from(order),['d','b','a']);assert.match(seedTransition(a,'d','b').signal,/Shared signals/);assert.equal(JSON.stringify(a),before);
 const many=buildIntelligence(Array.from({length:9},(_,i)=>({...tracks[0],id:String(i)})),[],'owner');assert.equal(safeSeed(many.songs.map(s=>s.trackId),many).length,6);
});

test('Audition resolves current authorized sources in sequence order, preserves Realm zero/null, and rejects partial queues',async()=>{
 const {resolveAudition}=lib('creativeAudition'),a=analysis();
 const load=async id=>({id,ownerId:'owner',title:id,realmId:id==='b'?null:0,audioUrl:'/fixture.wav',canAccessAudio:true});
 const queue=await resolveAudition(a,['b','a'],load);assert.deepEqual(Array.from(queue,t=>t.trackTitle),['b','a']);assert.equal(queue[0].realmId,null);assert.equal(queue[1].realmId,0);
 for(const patch of [{ownerId:'foreign'},{canAccessAudio:false},{id:'other'}])await assert.rejects(()=>resolveAudition(a,['a','b'],async id=>({...await load(id),...(id==='b'?patch:{})})));
 await assert.rejects(()=>resolveAudition(a,['foreign'],load));await assert.rejects(()=>resolveAudition(a,['a','a'],load));
});
