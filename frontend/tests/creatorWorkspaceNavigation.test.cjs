const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript');
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/creatorNavigation.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:m.exports});
const {visibleCreatorSections,creatorRouteActive}=m.exports;
test('operator navigation is absent until authorization is confirmed',()=>{const paths=visibleCreatorSections(false).flatMap(s=>s.items.map(i=>i.href));for(const path of ['/creator/media','/creator/marketplace','/creator/engagements'])assert.equal(paths.includes(path),false);assert.ok(paths.includes('/creator/library'));assert.ok(paths.includes('/creator/intelligence'));});
test('authorized navigation groups actual routes and highlights contextual parents',()=>{const paths=visibleCreatorSections(true).flatMap(s=>s.items.map(i=>i.href));assert.equal(new Set(paths).size,paths.length);assert.ok(paths.includes('/creator/media'));assert.ok(creatorRouteActive('/creator/marketplace/report','/creator/marketplace'));assert.equal(creatorRouteActive('/creator/marketplace','/creator'),false);assert.equal(creatorRouteActive('/creator/library-other','/creator/library'),false);});

test('Workshop action preserves the existing project route regardless of publication state',()=>{
 const action=m.exports.creatorWorkshopAction;
 for(const status of ['draft','active','released']){
  const result=action({id:'owned-project',slug:'my-world',status});
  assert.equal(result.href,'/releases/my-world/board');assert.equal(result.label,'Open Workshop');assert.equal(result.meta,'Develop project');
 }
});
test('Workshop remains discoverable without a usable current project',()=>{
 for(const project of [null,{id:'id',slug:'',status:'draft'},{id:'',slug:'world',status:'draft'},{id:'id',slug:'world',status:'archived'}]){
  const result=m.exports.creatorWorkshopAction(project);
  assert.equal(result.href,'/creator/projects');assert.equal(result.label,'Choose or create a project');assert.equal(result.meta,'Choose or create a project');
 }
});
