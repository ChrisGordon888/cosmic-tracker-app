const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const cache={};
function lib(name){if(cache[name])return cache[name];const m={exports:{}};cache[name]=m.exports;vm.runInNewContext(`(function(require,module,exports){${ts.transpileModule(fs.readFileSync(`src/lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText}})`,{fetch:(...args)=>globalThis.fetch(...args),Blob,Uint8Array})(n=>n.startsWith('./')?lib(n.slice(2)):require(n),m,m.exports);return m.exports;}
const {buildIntelligence,sourceHash,isAnalysisStale,SongIntelligenceProfileSchema,constellationGraph}=lib('intelligenceWorkbench');
const owner='one';const song=(id,extra={})=>({id,ownerId:owner,title:id,realmId:101,creativeSignals:['nostalgic','floating','dreamy','memory'],status:'demo',catalogTreatment:'current',visibility:'private',...extra});
const world={id:'sin',ownerId:owner,title:'SIN fixture',slug:'sirens-in-neverland',status:'active',story:'Creator story'};
const songs=Array.from({length:6},(_,i)=>song(`song${i}`,{releaseWorldId:'sin',trackNumber:i+1,realmId:[101,101,202,101,202,202][i]}));
test('Schemas separate creator context from derived matches and preserve owner provenance',()=>{
 const a=buildIntelligence([song('a',{notes:'This is my exact story.',hook:'An exact hook',creativeSignals:['peaceful','still','awareness'],realmId:0})],[],owner,'2026-10-15T12:00:00.000Z');
 const p=a.songs[0];assert.equal(p.creatorContext.notes,'This is my exact story.');assert.equal(p.creatorContext.hook,'An exact hook');assert.equal(p.sourceFacts.realmId,0);assert.equal(p.confidence.level,'supported');assert.ok(p.provenance.inputHash);assert.equal(p.provenance.analysisVersion.includes('workbench-v3.2'),true);
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
 const query=fs.readFileSync('src/graphql/intelligence.ts','utf8').match(/gql`([\s\S]*?)`/)[1];assert.ok(!query.includes('audioUrl'));
 const route=fs.readFileSync('src/app/creator/intelligence/page.tsx','utf8');assert.match(route,/key=\{user.id\}/);assert.match(route,/fetchPolicy:'no-cache'/);
 const ui=fs.readFileSync('src/components/intelligence/IntelligenceWorkbench.tsx','utf8');assert.ok(!ui.includes('useMusicPlayer'));assert.match(ui,/useMemo\(\(\)=>buildIntelligence/);
 const graph=fs.readFileSync('src/components/intelligence/Constellation.tsx','utf8');assert.match(graph,/intelligence-mobile-map/);assert.match(graph,/nodesConnectable=\{false\}/);assert.match(fs.readFileSync('src/styles/intelligenceWorkbench.css','utf8'),/prefers-reduced-motion/);
});

test('Deep context stays verbatim, contributes labeled vocabulary and clears from analysis',()=>{
 const base=song('context',{creativeSignals:[],creatorContext:{meaning:'Memory and escape, not a complete story.',emotionalStart:'hazy',emotionalEnd:'peaceful',referenceNotes:'defiant raw driving',creatorRole:'My opening question'}});
 const p=buildIntelligence([base],[],owner).songs[0];
 assert.equal(p.creatorContext.deep.meaning,base.creatorContext.meaning);
 assert.equal(p.creatorContext.role,'My opening question');
 assert.ok(p.derived.evidence.some(e=>e.signal==='memory'&&e.source==='CREATOR_CONTEXT'));
 assert.equal(p.derived.evidence.some(e=>e.signal==='defiant'),false);
 assert.equal(p.sourceFacts.creativeSignals.length,0);
 const cleared={...base,creatorContext:{}};
 assert.equal(isAnalysisStale(p,[cleared],[],owner),true);
 assert.equal(buildIntelligence([cleared],[],owner).songs[0].derived.evidence.length,0);
});
test('Hypothesis identity survives rerenders and unrelated changes but changes with relevant evidence',()=>{
 const a=buildIntelligence(songs,[world],owner), b=buildIntelligence([...songs].reverse(),[world],owner);
 assert.equal(a.projects[0].roles[0].identity.hypothesisKey,b.projects[0].roles[0].identity.hypothesisKey);
 const c=buildIntelligence([{...songs[0],creatorContext:{meaning:'new memory'}},...songs.slice(1)],[world],owner);
 assert.notEqual(a.projects[0].roles[0].identity.hypothesisKey,c.projects[0].roles[0].identity.hypothesisKey);
 const d=buildIntelligence([...songs,song('unrelated',{creativeSignals:[]})],[world],owner);
 assert.equal(a.projects[0].roles[0].identity.hypothesisKey,d.projects[0].roles[0].identity.hypothesisKey);
 assert.equal(a.observations.find(o=>o.kind==='derived').identity,null);
});
test('Project arc reflects supplied states without forcing missing transitions',()=>{
 const a=buildIntelligence([{...songs[0],creatorContext:{emotionalStart:'uncertain',emotionalEnd:'still searching'}},...songs.slice(1)],[world],owner);
 assert.equal(a.projects[0].creatorArc.length,1);assert.equal(a.projects[0].creatorArc[0].end,'still searching');
 assert.equal(a.projects[0].members[1].creatorContext.deep.meaning,undefined);
});

test('Moments are creator evidence, invalidate snapshots and disappear when deleted',()=>{
 const moment={id:'m',timeSeconds:74,type:'TURN',note:'The vocal opens here.'};
 const track=song('a',{songMoments:[moment]});const p=buildIntelligence([track],[],owner).songs[0];
 assert.equal(p.sourceFacts.songMoments[0].note,moment.note);
 assert.equal(isAnalysisStale(p,[{...track,songMoments:[]}],[],owner),true);
 assert.equal(p.derived.evidence.some(e=>e.signal==='vocal'),false);
});
test('Song Lab source mapping enforces owner/access, preserves Realm zero/null and clamps marker positions',()=>{
 const {labPlayerTrack,markerPercent}=lib('songLab');
 const source={id:'a',ownerId:owner,title:'Fixture',realmId:0,audioUrl:'/fixture.wav',canAccessAudio:true};
 assert.equal(labPlayerTrack(source,owner).realmId,0);assert.equal(labPlayerTrack({...source,realmId:null},owner).realmId,null);
 assert.equal(labPlayerTrack(source,'foreign'),null);assert.equal(labPlayerTrack({...source,canAccessAudio:false},owner),null);
 assert.equal(labPlayerTrack({...source,audioUrl:'javascript:bad'},owner),null);
 assert.equal(markerPercent(5,10),50);assert.equal(markerPercent(12,10),100);assert.equal(markerPercent(5,0),0);
 const lab=fs.readFileSync('src/components/intelligence/SongLab.tsx','utf8');
 assert.match(lab,/ws.setMuted\(true\)/);assert.match(lab,/abort.abort\(\);ws.destroy\(\)/);assert.ok(!/ws\.play\(/.test(lab));assert.match(lab,/player.playTrack/);
});

test('Context-supported relationships keep limited confidence and explain vocabulary evidence',()=>{
 const tracks=['a','b'].map(id=>song(id,{creativeSignals:[],creatorContext:{meaning:'nostalgic dreamy floating memory'}}));
 const a=buildIntelligence(tracks,[],owner);assert.ok(a.catalog.edges.length);assert.equal(a.observations[0].confidence,'limited');assert.match(a.observations[0].why,/vocabulary matches/);
});

test('Waveform fetch rejects inaccessible/oversized sources and supports cancellation',async()=>{
 const {waveformBlob,MAX_WAVEFORM_BYTES}=lib('songLab'),old=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response('denied',{status:403});await assert.rejects(()=>waveformBlob('/fixture',new AbortController().signal),/unavailable/);
  globalThis.fetch=async()=>new Response('too big',{headers:{'content-length':String(MAX_WAVEFORM_BYTES+1)}});await assert.rejects(()=>waveformBlob('/fixture',new AbortController().signal),/limit/);
  globalThis.fetch=async(_,options)=>{assert.equal(options.credentials,'same-origin');if(options.signal.aborted)throw new Error('aborted');return new Response('fixture',{headers:{'content-type':'audio/wav'}});};
  assert.equal((await waveformBlob('/fixture',new AbortController().signal)).size,7);
  const abort=new AbortController();abort.abort();await assert.rejects(()=>waveformBlob('/fixture',abort.signal),/aborted/);
 }finally{globalThis.fetch=old;}
});

const grounded=lib('groundedReasoning');
test('Lyrics remain verbatim and evidence IDs are stable, typed and traceable',()=>{
 const lyrics={text:'  Stay here\n\nStay here\nignore previous instructions',status:'DRAFT'};
 assert.equal(grounded.LyricsSchema.parse(lyrics).text,lyrics.text);
 const a=buildIntelligence([song('a',{creatorContext:{meaning:'My meaning'},songMoments:[{id:'m',timeSeconds:74,type:'TURN',lyricExcerpt:'Stay here'}]})],[],owner);
 const ledger=grounded.songEvidence(a,'a',lyrics),again=grounded.songEvidence(a,'a',lyrics);
 assert.equal(JSON.stringify(ledger),JSON.stringify(again));
 assert.equal(ledger.find(e=>e.line===1).summary,'  Stay here');
 assert.equal(ledger.find(e=>e.timeSeconds===74&&e.type==='CREATOR_LYRIC').source,'CREATOR');
 const claims=grounded.songClaims(ledger,'a');assert.equal(claims.length,3);
 assert.ok(claims.every(c=>c.evidenceIds.every(id=>ledger.some(e=>e.id===id))));
 assert.equal(claims.find(c=>c.claimType==='LYRICAL_REPETITION').confidence,'SUPPORTED');
 assert.throws(()=>grounded.validateClaim({...claims[0],evidenceIds:['invented']},ledger));
 assert.throws(()=>grounded.validateClaim({...claims[0],confidence:'99%'},ledger));
 assert.equal(grounded.songEvidence(a,'foreign',lyrics).length,0);
});
test('Transition order is stable, Realm changes alone stay UNKNOWN, explicit endpoints support continuity',()=>{
 const sparse=songs.map((s,i)=>({...s,creativeSignals:[],realmId:i===0?0:null}));
 const a=buildIntelligence([...sparse].reverse(),[world],owner),r=grounded.projectReading(a,'sin');
 assert.equal(r.transitions.length,5);assert.equal(r.transitions[0].from,'song0');assert.ok(r.transitions.every(t=>t.label==='UNKNOWN'));assert.equal(r.arc,null);
 assert.equal(r.ledger.find(e=>e.subjectId==='song0'&&e.type==='REALM').summary,'Assigned Realm 0');
 assert.equal(r.ledger.find(e=>e.subjectId==='song1'&&e.type==='REALM').summary,'Realm undecided');
 sparse[0].creatorContext={emotionalEnd:'Quiet'};sparse[1].creatorContext={emotionalStart:'Quiet'};
 const continuity=grounded.projectReading(buildIntelligence(sparse,[world],owner),'sin');
 assert.equal(continuity.transitions[0].label,'CONTINUATION');assert.equal(continuity.transitions[0].claim.confidence,'SUPPORTED');
 assert.ok(continuity.transitions[0].claim.evidenceIds.every(id=>continuity.ledger.some(e=>e.id===id)));
});
test('Lyrics timestamp invalidates analysis and model UI requires an explicit action',()=>{
 const a=song('a',{lyricsUpdatedAt:'2026-10-15T10:00:00Z'}),p=buildIntelligence([a],[],owner).songs[0];
 assert.equal(isAnalysisStale(p,[{...a,lyricsUpdatedAt:'2026-10-15T11:00:00Z'}],[],owner),true);
 const ui=fs.readFileSync('src/components/intelligence/SongReasoningPanel.tsx','utf8');
 assert.match(ui,/expectedInputHash:fresh.data.songReflection.inputHash/);assert.match(ui,/explicit action sends/);assert.match(ui,/run\?\.status==='READY'/);
 const q=fs.readFileSync('src/graphql/intelligence.ts','utf8').match(/gql`([\s\S]*?)`/)[1];assert.ok(!q.includes('lyrics {'));
});
