const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
function load(name){const file=path.join(__dirname,'../src/lib',name+'.ts');const module={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(`(function(require,module,exports){${code}\n})`,{crypto:require('node:crypto').webcrypto,Uint8Array,Set})(name=>load(name.replace('./','')),module,module.exports);return module.exports;}
const {getRealmFinderResult}=load('creatorRealmFinder');
const {suggestCatalogRealm,similarCatalogTracks}=load('catalogSorting');
const {contentHash,compareIntake,excludedIncoming}=load('catalogIntake');
const base={id:'a',title:'Song',slug:'song',realmId:null,status:'demo',visibility:'private'};
test('Extracted Signal Board scorer retains Realm zero and known answer weights',()=>{const r=getRealmFinderResult({'dominant-signal':'integrate',movement:'center',world:'center',tension:'persona-authenticity',texture:'clarity',aftertaste:'truth'});assert.equal(r.realmId,0);assert.equal(r.resonanceScores[0],100);assert.equal(r.resonanceScores[101],35);});
test('Recommendation uses stored scores and meaningful secondary resonance, including zero',()=>{const r=suggestCatalogRealm({...base,realmFinderScores:{realm0:80,realm101:60}});assert.equal(r.home,0);assert.equal(r.secondary,101);assert.match(r.strength,/Saved/);});
test('Metadata fallback reuses creator Realm vocabulary, without inferring from tempo/key/title',()=>{assert.equal(suggestCatalogRealm({...base,mood:'reflective personal'}).home,101);assert.equal(suggestCatalogRealm({...base,mood:'dreamlike'}).home,202);assert.equal(suggestCatalogRealm({...base,title:'reflection',bpm:80,keySignature:'C minor'}).home,null);assert.equal(suggestCatalogRealm({...base,realmFinderScores:{realm0:50,realm101:50}}).home,null);});
test('Similarity ranks supported metadata and excludes tempo/key-only matches',()=>{const t={...base,realmId:0,mood:'authentic',bpm:100,keySignature:'C minor'};const list=[{...base,id:'z',realmId:0,bpm:100,mood:'authentic',keySignature:'C minor'},{...base,id:'b',realmId:0,bpm:150},{...base,id:'c',bpm:100,keySignature:'C minor'}];const result=similarCatalogTracks(t,list);assert.equal(result[0].track.id,'z');assert.equal(result.length,2);assert.equal(result[1].track.id,'b');});
test('Recommendation and similarity never mutate catalog or imply assigned Realm',()=>{const t=Object.freeze({...base,mood:'dreamlike'}),catalog=Object.freeze([Object.freeze({...base,id:'b',mood:'dreamlike'})]);const before=JSON.stringify([t,catalog]);suggestCatalogRealm(t);similarCatalogTracks(t,catalog);assert.equal(JSON.stringify([t,catalog]),before);assert.equal(t.realmId,null);});
test('SHA256 compares exact bytes; names alone never prove exact content',async()=>{const buffer=Uint8Array.from([97,98,99]).buffer;const hash=await contentHash(buffer);assert.equal(hash,'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');assert.equal(compareIntake({id:'a',title:'one',audioContentHash:hash},{id:'b',title:'different',audioContentHash:hash}),'exact');assert.equal(compareIntake({id:'a',title:'Song v1.wav'},{id:'b',title:'Song final.mp3'}),'possible');assert.equal(compareIntake({id:'a',title:'different'},{id:'b',title:'other'}),null);});
test('Duplicate choices only exclude incoming files, never delete existing records',()=>{const a={id:'incoming',title:'a'},b={id:'existing',title:'b'},pair={id:'pair',a,b};assert.equal(excludedIncoming([pair],{},new Set(['incoming'])).length,0);assert.equal(excludedIncoming([pair],{pair:'keep-a'},new Set(['incoming'])).length,0);assert.equal(excludedIncoming([pair],{pair:'keep-b'},new Set(['incoming']))[0],'incoming');assert.equal(excludedIncoming([pair],{pair:'both'},new Set(['incoming'])).length,0);assert.equal(b.title,'b');});
test('Project labels distinguish standalone, valid release, and broken reference',()=>{
 const {catalogProjectLabel}=load('catalogSorting');const releases=new Map([['real',{}]]);
 assert.equal(catalogProjectLabel({},releases),'Standalone Catalog');
 assert.equal(catalogProjectLabel({releaseWorldId:null},releases),'Standalone Catalog');
 assert.equal(catalogProjectLabel({releaseWorldId:'real'},releases),'Release track');
 assert.equal(catalogProjectLabel({releaseWorldId:'missing'},releases),'Project link needs repair');
});
test('Smart Sort renders a neutral Realm selection with insufficient evidence',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const file=path.join(__dirname,'../src/components/creator/SmartSortPanel.tsx');const module={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(`(function(require,module,exports){${code}\n})`)(name=>{
  if(name==='@/lib/catalogSorting')return load('catalogSorting');
  if(name==='@/lib/libraryCleanup')return load('libraryCleanup');
  if(name==='./CatalogPlacementSuggestion')return {default:()=>null};
  return require(name);
 },module,module.exports);
 const html=renderToStaticMarkup(React.createElement(module.exports.default,{track:base,catalog:[],releases:new Map(),position:1,total:1,onSave:async()=>{},onNext:()=>{},onClose:()=>{}}));
 assert.match(html,/<option value="" selected="">Choose a Realm…<\/option>/);
 assert.doesNotMatch(html,/<option value="202" selected/);
 assert.match(html,/<button disabled="">Accept chosen Realm/);
});
