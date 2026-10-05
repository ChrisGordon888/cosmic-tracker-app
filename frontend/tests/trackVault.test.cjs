const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
function load(name){const module={exports:{}};const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib',name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;vm.runInNewContext(`(function(require,module,exports){${code}\n})`,{Date,Intl})(n=>load(n.replace('./','')),module,module.exports);return module.exports;}
const {matchesVault,trackExposure}=load('trackVault');
const track={id:'a',title:'Song',status:'demo',visibility:'public',playbackStatus:'playable',audioUrl:'/audio',updatedAt:'now',rightsInfo:{sourceType:'unknown',reviewStatus:'unknown'}};
test('Library/Vault filters preserve lifecycle and distinguish unknown from explicitly needs review',()=>{
 assert.equal(matchesVault(track,'review'),false);assert.equal(matchesVault(track,'unknown'),true);
 assert.equal(matchesVault({...track,catalogTreatment:'test'},'browse'),false);assert.equal(matchesVault({...track,catalogTreatment:'test'},'all'),true);
 assert.equal(matchesVault({...track,visibility:'private'},'vault'),true);assert.equal(matchesVault({...track,status:'archived'},'vault'),true);
 assert.equal(matchesVault({...track,rightsInfo:{reviewStatus:'needsReview'}},'review'),true);assert.equal(track.status,'demo');
});
test('Exposure uses listener access, parent publication, actual preview media and registry fallback',()=>{
 const world={id:'w',visibility:'public',status:'active'};
 assert.equal(trackExposure(track,world).guest,true);assert.equal(trackExposure(track,{...world,visibility:'private'}).guest,false);assert.equal(trackExposure(track).guest,false);
 const member=trackExposure({...track,accessTier:'signup'},world);assert.equal(member.guest,false);assert.equal(member.member,true);
 assert.equal(trackExposure({...track,playbackStatus:'preview'},world).guest,false);assert.equal(trackExposure({...track,playbackStatus:'preview',previewAudioUrl:'/preview'},world).guest,true);
 assert.equal(trackExposure({...track,visibility:'private'},undefined,track).guest,true);
 assert.equal(trackExposure({...track,visibility:'private',showInNexus:true},world,track).guest,true, 'stale Nexus flag must not conceal legacy registry exposure');
 for(const catalogTreatment of ['vault','test'])assert.equal(trackExposure({...track,catalogTreatment},world,track).guest,false);
});
test('Review mounts without a mutation; explicit save awaits confirmation and Skip never invokes save',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/components/creator/TrackVaultReview.tsx'),'utf8');
 assert.match(source,/useEffect\(\(\)=>\{const node=ref.current;node\?\.showModal\(\)/);
 assert.match(source,/window.confirm/);assert.match(source,/await onSave/);assert.match(source,/onClick=\{onNext\}>Keep current \/ skip without saving/);
 assert.doesNotMatch(source,/legally cleared|safe to monetize|copyright verified/i);
});
test('Actual Library and Prepare Release GraphQL documents validate with private rights fields',()=>{
 const {buildASTSchema,parse,validate}=require('graphql');const schema=buildASTSchema(require('../../backend/schemas'));
 for(const relative of ['app/creator/library/page.tsx','app/creator/releases/[slug]/publish/page.tsx']){
 const source=fs.readFileSync(path.join(__dirname,'../src',relative),'utf8');
 for(const [,body] of source.matchAll(/gql`([\s\S]*?)`/g)){if(body.includes('${'))continue;assert.deepEqual(validate(schema,parse(body)),[]);}
 }
});
