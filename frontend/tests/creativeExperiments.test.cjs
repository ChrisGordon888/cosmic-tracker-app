const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/creativeExperiments.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:m.exports});
test('resuming preserves order and every unavailable place without exposing an ID',()=>{
 const saved={slots:[{index:0,trackId:'a',available:true},{index:1,trackId:null,available:false},{index:2,trackId:'c',available:true}]};const before=JSON.stringify(saved);
 assert.equal(JSON.stringify(m.exports.experimentDraft(saved)),JSON.stringify(['a','unavailable:1','c']));assert.equal(JSON.stringify(saved),before);
});
