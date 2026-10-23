const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript');
function load(window){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/resonanceAnalysis.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:m.exports,window,AudioContext:window.AudioContext,setTimeout,clearTimeout});return m.exports;}
test('Energy is measured from samples, silence is zero',()=>{const {measuredEnergy}=load({});assert.equal(measuredEnergy(new Uint8Array([128,128])),0);assert.equal(measuredEnergy(new Uint8Array([0,128])),Math.sqrt(.5));});
test('Capture uses one existing element, silent analysis branch, and idempotent cleanup',async()=>{
 let stopped=0,closed=0,resumed=0,gain;
 const node=()=>({connect(){},disconnect(){}});
 class Context {state='running';destination={};createMediaStreamSource(){return node()}createAnalyser(){return node()}createGain(){gain={...node(),gain:{value:1}};return gain}async resume(){resumed++}async close(){closed++}}
 const {openResonanceAnalysis}=load({AudioContext:Context});
 const stream={getAudioTracks:()=>[{}],getTracks:()=>[{stop:()=>stopped++}]};
 const audio={captureStream:()=>stream};
 const tap=await openResonanceAnalysis(audio);assert.equal(gain.gain.value,0);assert.equal(resumed,1);tap.close();tap.close();assert.equal(stopped,1);assert.equal(closed,1);
});
test('Unsupported/restricted capture fails without modifying playback',async()=>{
 const {openResonanceAnalysis}=load({AudioContext:class{}});
 const audio={src:'/fictional.wav',paused:false};await assert.rejects(openResonanceAnalysis(audio));assert.equal(audio.paused,false);assert.equal(audio.src,'/fictional.wav');
 let stopped=0;await assert.rejects(openResonanceAnalysis({captureStream:()=>({getAudioTracks:()=>[],getTracks:()=>[{stop:()=>stopped++}]})}));assert.equal(stopped,1);
});

test('Track switching waits for a delayed capture track instead of failing early',async()=>{
 let ready=false,listener,stopped=0;
 const node=()=>({connect(){},disconnect(){},gain:{}});
 class Context {state='running';destination={};createMediaStreamSource(){return node()}createAnalyser(){return node()}createGain(){return node()}async resume(){}async close(){}}
 const stream={getAudioTracks:()=>ready?[{}]:[],getTracks:()=>[{stop:()=>stopped++}],addEventListener:(_,fn)=>{listener=fn},removeEventListener:()=>{listener=null}};
 const pending=load({AudioContext:Context}).openResonanceAnalysis({captureStream:()=>stream});
 assert.ok(listener);ready=true;listener();const tap=await pending;assert.equal(listener,null);tap.close();assert.equal(stopped,1);
});
