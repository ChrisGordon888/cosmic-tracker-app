const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(name){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(`src/lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(`(function(require,module,exports){${code}})`)(n=>load(n.replace('./','')),m,m.exports);return m.exports;}
const {fingerprint,interpretFingerprint,scanCatalog,SIGNALS}=load('creativeFingerprint');
const {similarCatalogTracks}=load('catalogSorting');
const base={id:'one',ownerId:'a',title:'Unimportant',slug:'one',realmId:null,status:'demo',visibility:'private'};
const frontier=['powerful','defiant','driving','dark','breakthrough'];
const roads=['hazy','nostalgic','romantic','floating','dreamy','memory'];
test('Generalized Mistletoe and Tales evidence classify without title rules or BPM bias',()=>{
 for(const title of ['Mistletoe','Unrelated title']){const r=interpretFingerprint({...base,title,creativeSignals:frontier,bpm:81,keySignature:'B minor'});assert.equal(r.home,303);assert.equal(r.strength,'Strong fit');}
 const r=interpretFingerprint({...base,creativeSignals:roads});assert.equal(r.home,101);assert.equal(r.strength,'Strong fit');assert.equal(r.secondary,202);
});
test('Sparse, absent, ambiguous, and conflicting evidence never masquerade as certainty',()=>{
 assert.equal(interpretFingerprint(base).home,null);
 assert.equal(interpretFingerprint({...base,creativeSignals:['dark']}).strength,'Insufficient evidence');
 assert.equal(interpretFingerprint({...base,creativeSignals:['defiant','peaceful']}).strength,'Mixed');
 assert.equal(interpretFingerprint({...base,creativeSignals:['ambition','authenticity']}).strength,'Mixed');
});
test('Evidence carries provenance; metadata is not duplicated as inferred audio',()=>{
 const fp=fingerprint({...base,creativeSignals:['defiant'],mood:'defiance momentum',bpm:81});
 assert.equal(fp.evidence.find(e=>e.signal==='defiant').source,'CREATOR_TAG');
 assert.equal(fp.evidence.find(e=>e.signal==='driving').source,'CREATOR_DESCRIPTION');
 assert.equal(fp.bpm,81);assert.equal(fp.evidence.length,2);
});
test('Exact-signal creator precedent is private and title-independent',()=>{
 const other={...base,id:'two',realmId:55,creativeSignals:frontier,creativeDecisions:[{realmId:55,action:'overridden',suggestedRealmId:303,signals:frontier,at:'2026-10-06',engineVersion:'fingerprint-v2.1'}]};
 assert.equal(interpretFingerprint({...base,creativeSignals:frontier},[other]).home,55);
 assert.equal(interpretFingerprint({...base,ownerId:'b',creativeSignals:frontier},[other]).home,303);
 assert.equal(interpretFingerprint({...base,creativeSignals:roads},[other]).home,101);
});
test('Similarity favors multiple shared signals, excludes other owners, and keeps same Realm weak',()=>{
 const t={...base,realmId:303,creativeSignals:frontier};
 const rows=similarCatalogTracks(t,[{...t,id:'same'},{...t,id:'foreign',ownerId:'b'},{...base,id:'realm-only',realmId:303}]);
 assert.equal(rows[0].track.id,'same');assert.ok(rows[0].reasons.some(r=>r.includes('Shared signals')));
 assert.ok(!rows.some(r=>r.track.id==='foreign'));assert.equal(rows.find(r=>r.track.id==='realm-only').score,1);
});
test('Catalog scan is read-only and separates no evidence from useful suggestions',()=>{
 const tracks=[base,{...base,id:'two',creativeSignals:frontier}];const before=JSON.stringify(tracks);
 const rows=scanCatalog(tracks);assert.equal(rows[0].bucket,'No evidence');assert.equal(rows[1].bucket,'Strong suggestion');assert.equal(JSON.stringify(tracks),before);
});
test('Frontend and backend share exactly the same curated signal contract',()=>{
 const backend=require('../../backend/lib/creativeFingerprint');assert.deepEqual(Object.values(SIGNALS).flat().sort(),backend.signals.slice().sort());
});
test('All six archetypes have supported routes to strong fit without genre or tempo',()=>{
 const cases={303:frontier,101:roads,202:['hazy','dreamy','escape','floating'],55:['powerful','driving','ambition','bright'],44:['playful','groovy','exchange','bright'],0:['peaceful','still','authenticity','awareness']};
 for(const [realm,creativeSignals] of Object.entries(cases)){const r=interpretFingerprint({...base,creativeSignals});assert.equal(r.home,Number(realm));assert.equal(r.strength,'Strong fit');}
});

test('Stale tags, changed Realm, newer manual decisions and old engine versions cannot calibrate',()=>{
 const target={...base,creativeSignals:frontier};
 const decision={realmId:55,action:'overridden',suggestedRealmId:303,signals:frontier,at:'2026-10-06',engineVersion:'fingerprint-v2.1'};
 const source={...base,id:'other',realmId:55,creativeSignals:frontier,creativeDecisions:[decision]};
 assert.equal(interpretFingerprint(target,[source]).home,55);
 for(const stale of [{...source,creativeSignals:roads},{...source,realmId:101},{...source,creativeDecisions:[{...decision,engineVersion:'old'}]},{...source,creativeDecisions:[decision,{...decision,action:'manual'}]}]) assert.equal(interpretFingerprint(target,[stale]).home,303);
 const before=JSON.stringify([target,source]);interpretFingerprint(target,[source]);assert.equal(JSON.stringify([target,source]),before);
});
