const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const cache={};function lib(name){if(cache[name])return cache[name];const m={exports:{}};cache[name]=m.exports;const source=fs.readFileSync(`src/lib/${name}.ts`,'utf8').replaceAll('import.meta.url',"'file:///fixture'");vm.runInNewContext(`(function(require,module,exports){${ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText}})`,{fetch:(...a)=>globalThis.fetch(...a),Blob,Uint8Array,Float32Array,Float64Array,Uint32Array,AbortController})(n=>n.startsWith('./')?lib(n.slice(2)):require(n),m,m.exports);return m.exports;}
const audio=lib('audioFeatures'),{audioReading,cosmicRead}=lib('cosmicRead'),{buildIntelligence}=lib('intelligenceWorkbench');
const hash='a'.repeat(64),rate=16000;
const tone=(seconds,amplitude=.5)=>Float32Array.from({length:seconds*rate},(_,i)=>amplitude*Math.sin(2*Math.PI*400*i/rate));
const profile=m=>({...m,trackId:'a',sourceIdentity:'source',generatedAt:'2026-10-15T00:00:00Z',toolchain:'fixture',measurementOrigin:'OWNER_BROWSER'});
test('PCM measures known duration/RMS/peak; silence stays finite and antiphase stereo does not cancel',()=>{
 const signal=tone(10),m=audio.measurePCM([signal],rate,hash);assert.equal(m.durationSeconds,10);assert.ok(Math.abs(m.rmsDbfs-20*Math.log10(.5/Math.sqrt(2)))<.01);assert.ok(Math.abs(m.peakDbfs-20*Math.log10(.5))<.01);assert.equal(m.changeCandidates.length,0);assert.equal(m.peaks.length,256);
 const stereo=audio.measurePCM([signal,Float32Array.from(signal,x=>-x)],rate,hash);assert.ok(Math.abs(stereo.rmsDbfs-m.rmsDbfs)<.001);
 const silence=audio.measurePCM([new Float32Array(rate*10)],rate,hash);assert.equal(silence.rmsDbfs,-120);assert.equal(silence.variationDb,0);assert.equal(silence.changeCandidates.length,0);
 for(const channels of [[],[new Float32Array(0)],[new Float32Array([NaN])],[tone(1),tone(2)]])assert.throws(()=>audio.measurePCM(channels,rate,hash));
 assert.throws(()=>audio.measurePCM([tone(1)],44100,hash));
});
test('Sustained level changes produce bounded candidates and grounded moment alignment only inside tolerance',()=>{
 const rising=Float32Array.from({length:rate*20},(_,i)=>(i<rate*10?.05:.5)*Math.sin(2*Math.PI*400*i/rate));
 const m=audio.measurePCM([rising],rate,hash);assert.ok(m.changeCandidates.some(c=>c.timeSeconds===10));assert.equal(audio.levelTrend(m).direction,'rises');
 const reading=audioReading(profile(m),[{id:'turn',type:'TURN',timeSeconds:12}],'I am letting someone go.');
 assert.ok(reading.claims.some(c=>c.claimType==='MOMENT_AUDIO_ALIGNMENT'));assert.ok(reading.claims.every(c=>c.evidenceIds.every(id=>reading.ledger.some(e=>e.id===id))));
 assert.equal(audioReading(profile(m),[{id:'turn',type:'TURN',timeSeconds:17}]).claims.some(c=>c.claimType==='MOMENT_AUDIO_ALIGNMENT'),false);
 assert.match(reading.claims.find(c=>c.claimType==='CONTEXT_AND_RECORDING').statement,/does not confirm or contradict/);
 const falling=audio.measurePCM([Float32Array.from(rising).reverse()],rate,hash);assert.equal(audio.levelTrend(falling).direction,'falls');
 assert.equal(audio.levelTrend(audio.measurePCM([tone(3)],rate,hash)),null);
});
test('Zero enrichment yields immediate catalog understanding; source safety rejects foreign and unsupported inputs',()=>{
 const tracks=['a','b'].map(id=>({id,ownerId:'owner',title:id,creativeSignals:['dreamy','floating','memory'],realmId:0,status:'demo'}));
 const read=cosmicRead(buildIntelligence(tracks,[],'owner'),'a');assert.match(read.statement,/shares supported signals/);assert.ok(read.ledger.length);assert.ok(!read.statement.includes('Complete'));
 const sparse=cosmicRead(buildIntelligence([{id:'a',ownerId:'owner',title:'a',realmId:null}],[],'owner'),'a');assert.match(sparse.statement,/no context form required/);
 const {authorizedAudioUrl}=lib('analyzeSongAudio');const source={id:'a',ownerId:'owner',canAccessAudio:true,audioUrl:'/fixture.wav'};assert.equal(authorizedAudioUrl(source,'owner','a'),'/fixture.wav');
 for(const patch of [{ownerId:'foreign'},{id:'other'},{canAccessAudio:false},{audioUrl:'javascript:bad'},{audioUrl:'//other.invalid/x'},{sourceFileSize:17*1024*1024}])assert.throws(()=>authorizedAudioUrl({...source,...patch},'owner','a'));
});
test('Audio fetch rejects access failures, empty and oversized streams',async()=>{
 const {audioBytes}=lib('analyzeSongAudio'),old=globalThis.fetch;try{
  globalThis.fetch=async()=>new Response('denied',{status:403});await assert.rejects(()=>audioBytes('/fixture',new AbortController().signal));
  globalThis.fetch=async()=>new Response('',{headers:{'content-length':String(17*1024*1024)}});await assert.rejects(()=>audioBytes('/fixture',new AbortController().signal),/16 MB/);
  globalThis.fetch=async()=>new Response('');await assert.rejects(()=>audioBytes('/fixture',new AbortController().signal),/empty/);
  globalThis.fetch=async()=>new Response('fixture');assert.equal((await audioBytes('/fixture',new AbortController().signal)).byteLength,7);
 }finally{globalThis.fetch=old;}
});
test('Six fictional project recordings preserve order and gaps; audio never becomes emotional agreement',()=>{
 const worlds=[{id:'world',ownerId:'owner',title:'Fictional six',slug:'fictional',status:'active'}];
 const tracks=Array.from({length:6},(_,i)=>({id:String(i),ownerId:'owner',title:`Fixture ${i+1}`,releaseWorldId:'world',trackNumber:i+1,realmId:i===0?0:null}));
 const a=buildIntelligence([...tracks].reverse(),worlds,'owner');assert.deepEqual(Array.from(a.projects[0].members,s=>s.trackId),['0','1','2','3','4','5']);
 const strong=profile(audio.measurePCM([Float32Array.from({length:rate*12},(_,i)=>(i<6*rate?.05:.5)*Math.sin(i))],rate,hash));
 for(const meaning of ['It gradually opens up.','This becomes quiet.']){const result=audioReading(strong,[],meaning);assert.ok(result.claims.every(c=>!c.statement.includes('creator is wrong')));assert.match(result.claims.find(c=>c.claimType==='CONTEXT_AND_RECORDING').statement,/separate observations/);}
 const ui=fs.readFileSync('src/components/intelligence/ProjectAudioFlow.tsx','utf8');assert.match(ui,/gap preserved/);assert.match(ui,/project.members.map/);
});
test('perception distinguishes known spectral and amplitude activity; silence has no spectrum',()=>{
 const low=audio.measurePCM([tone(3)],rate,hash),high=audio.measurePCM([Float32Array.from({length:rate*3},(_,i)=>.5*Math.sin(2*Math.PI*4000*i/rate))],rate,hash);
 assert.ok(Math.abs(low.spectralCentroidHz-400)<20);assert.ok(Math.abs(high.spectralCentroidHz-4000)<20);assert.ok(low.highBandRatio<.01);assert.ok(high.highBandRatio>.99);
 const pulses=tone(4);for(let i=0;i<pulses.length;i++)if(Math.floor(i/(rate/5))%2===0)pulses[i]=0;
 const busy=audio.measurePCM([pulses],rate,hash);assert.ok(busy.activityRisesPerSecond>2);assert.equal(low.activityRisesPerSecond,0);
 const silence=audio.measurePCM([new Float32Array(rate)],rate,hash);assert.equal(silence.spectralCentroidHz,null);assert.equal(silence.highBandRatio,null);
 const contrast=lib('acousticPerception').comparePerception(low,high);assert.ok(contrast[0].includes('above 2 kHz'));
});
