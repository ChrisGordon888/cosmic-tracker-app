const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const cache={};
function lib(name){if(cache[name])return cache[name];const m={exports:{}};cache[name]=m.exports;vm.runInNewContext(`(function(require,module,exports){${ts.transpileModule(fs.readFileSync(`src/lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText}})`)(n=>n.startsWith('./')?lib(n.slice(2)):require(n),m,m.exports);return m.exports;}
const {buildIntelligence,sourceHash,isAnalysisStale,SongIntelligenceProfileSchema,constellationGraph}=lib('intelligenceWorkbench');
const owner='one';const song=(id,extra={})=>({id,ownerId:owner,title:id,realmId:101,creativeSignals:['nostalgic','floating','dreamy','memory'],status:'demo',catalogTreatment:'current',visibility:'private',...extra});
const world={id:'sin',ownerId:owner,title:'SIN fixture',slug:'sirens-in-neverland',status:'active',story:'Creator story'};
const songs=Array.from({length:6},(_,i)=>song(`song${i}`,{releaseWorldId:'sin',trackNumber:i+1,realmId:[101,101,202,101,202,202][i]}));
test('Schemas separate creator context from derived matches and preserve owner provenance',()=>{
 const a=buildIntelligence([song('a',{notes:'This is my exact story.',hook:'An exact hook',creativeSignals:['peaceful','still','awareness'],realmId:0})],[],owner,'2026-10-15T12:00:00.000Z');
 const p=a.songs[0];assert.equal(p.creatorContext.notes,'This is my exact story.');assert.equal(p.creatorContext.hook,'An exact hook');assert.equal(p.sourceFacts.realmId,0);assert.equal(p.confidence.level,'supported');assert.ok(p.provenance.inputHash);assert.equal(p.provenance.analysisVersion.includes('workbench-v1'),true);
 assert.equal(SongIntelligenceProfileSchema.safeParse({...p,ownerId:'foreign'}).success,false);assert.equal(p.derived.evidence.some(e=>e.signal==='peaceful'&&e.source==='CREATOR_TAG'),true);
});
test('Foreign owner, Vault, test and archive never reach observations, relationships, graph or projects',()=>{
 const a=buildIntelligence([song('a'),song('b'),song('foreign',{ownerId:'two',notes:'secret'}),song('vault',{catalogTreatment:'vault'}),song('test',{catalogTreatment:'test'}),song('archive',{status:'archived'})],[world,{...world,id:'foreign',ownerId:'two'}],owner);
 assert.deepEqual(Array.from(a.songs,s=>s.trackId),['a','b']);assert.equal(a.projects.length,1);assert.equal(JSON.stringify(a).includes('secret'),false);assert.deepEqual(Array.from(constellationGraph(a).nodes,n=>n.id),['a','b']);assert.equal(buildIntelligence(songs,[world],'').songs.length,0);
});
test('Staleness reacts to input and engine changes, not generated time or foreign-owner changes',()=>{
 const p=buildIntelligence(songs,[world],owner).songs[0];assert.equal(isAnalysisStale(p,songs,[world],owner),false);
 for(const field of [{notes:'new'},{realmId:0},{creativeSignals:['raw']},{releaseWorldId:null}])assert.equal(isAnalysisStale(p,[{...songs[0],...field},...songs.slice(1)],[world],owner),true);
 assert.equal(isAnalysisStale({...p,provenance:{...p.provenance,analysisVersion:'old'}},songs,[world],owner),true);
 assert.equal(isAnalysisStale(p,songs,[{...world,story:'new story'}],owner),true);
 assert.equal(sourceHash(songs,[world],owner),sourceHash([...songs,song('foreign',{ownerId:'two'})],[world],owner));
});
test('SIN-shaped evaluation preserves six-track order, creator truth and explains role hypotheses without writes',()=>{
 const before=JSON.stringify(songs);const a=buildIntelligence([...songs].reverse(),[world],owner);const p=a.projects[0];
 assert.equal(JSON.stringify(songs),before);assert.deepEqual(Array.from(p.members,s=>s.sourceFacts.trackNumber),[1,2,3,4,5,6]);assert.equal(p.world.story,'Creator story');assert.equal(p.signals[0].count,6);assert.ok(p.roles.every(r=>r.role==='Anchor candidate'&&r.why));assert.ok(p.unknown.some(s=>s.includes('not proof of redundancy')));assert.ok(a.observations.length<=3);assert.ok(a.catalog.edges.every(e=>e.shared.length>=2));
});
test('Missing data produces no manufactured observations or forced roles; null stays distinct from zero',()=>{
 const a=buildIntelligence([song('zero',{realmId:0,creativeSignals:[]}),song('null',{realmId:null,creativeSignals:[]})],[],owner);
 assert.equal(a.observations.length,0);assert.equal(a.songs[0].confidence.level,'limited');assert.deepEqual(Array.from(constellationGraph(a,{realm:'0'}).nodes,n=>n.id),['zero']);assert.deepEqual(Array.from(constellationGraph(a,{realm:'unknown'}).nodes,n=>n.id),['null']);
});
test('Graph filters exclude private songs from public Canon view and cap clutter without losing catalog inspection',()=>{
 const many=Array.from({length:90},(_,i)=>song(`t${String(i).padStart(3,'0')}`,{publicCanon:true,visibility:i===0?'private':'public',releaseWorldId:i<3?'sin':null}));
 const a=buildIntelligence(many,[world],owner);const g=constellationGraph(a);assert.equal(g.nodes.length,80);assert.equal(g.hidden,10);assert.equal(a.songs.length,90);assert.ok(g.edges.length<=120);assert.equal(constellationGraph(a,{worldId:'sin'}).nodes.length,3);assert.ok(!constellationGraph(a,{canonOnly:true}).nodes.some(n=>n.id==='t000'));
});
test('Workbench is metadata-only, mobile has a usable list and account-keyed requests avoid shared cache',()=>{
 const query=fs.readFileSync('src/graphql/intelligence.ts','utf8');assert.ok(!query.includes('audioUrl'));
 const route=fs.readFileSync('src/app/creator/intelligence/page.tsx','utf8');assert.match(route,/key=\{user.id\}/);assert.match(route,/fetchPolicy:'no-cache'/);
 const ui=fs.readFileSync('src/components/intelligence/IntelligenceWorkbench.tsx','utf8');assert.ok(!ui.includes('useMusicPlayer'));assert.match(ui,/useMemo\(\(\)=>buildIntelligence/);
 const graph=fs.readFileSync('src/components/intelligence/Constellation.tsx','utf8');assert.match(graph,/intelligence-mobile-map/);assert.match(graph,/nodesConnectable=\{false\}/);assert.match(fs.readFileSync('src/styles/intelligenceWorkbench.css','utf8'),/prefers-reduced-motion/);
});
