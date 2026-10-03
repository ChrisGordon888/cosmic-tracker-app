const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path'),ts=require('typescript');
const sandbox={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib/libraryCleanup.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,sandbox);
const {parseFilename,isOrganized,matchesCleanup,workingCoverStyles,cleanupChanges,needsReviewWarning}=sandbox.exports;
const base={id:'1',title:'close',slug:'stable-url',realmId:0,status:'demo',visibility:'private',releaseWorldId:null};
test('Conservative producer filename suggestions preserve title and reject ambiguity',()=>{
 for(const [title,key,bpm] of [['close','C',120],['2 Many Days','G',88],['hotel room','C',155],['greatness, degraded','D',141],['try me','F',80],['somehow far','A',142],['noCVS','F',149]]){
  const result=parseFilename(`${title}(${key}min ${bpm}).wav`); assert.equal(result.title,title);assert.equal(result.keySignature,`${key} minor`);assert.equal(result.bpm,bpm);
 }
 for(const value of ['song 120','song (120)','song (Xmin 120)','song (Cmin 999)','song (Cmin 120) final'])assert.equal(parseFilename(value),null);
});
test('Organization accepts Realm zero without BPM, key or release membership',()=>{assert.equal(isOrganized(base),true);assert.equal(isOrganized({...base,realmId:null}),false);assert.equal(isOrganized({...base,realmId:77}),false);assert.equal(isOrganized({...base,title:'Untitled track'}),false);});
test('Standalone and release queues do not classify titles as tests',()=>{assert.equal(matchesCleanup(base,'standalone'),true);assert.equal(matchesCleanup(base,'release'),false);assert.equal(matchesCleanup({...base,releaseWorldId:'r'},'release'),true);assert.equal(matchesCleanup({...base,title:'test',status:'mastered'},'ideas'),false);});
test('Only changed fields are sent, title retains slug and metadata does not change privacy/audio',()=>{assert.deepEqual(Object.keys(cleanupChanges(base,{...base})),[]);const changes=cleanupChanges(base,{...base,title:'New title',bpm:120});assert.equal(changes.slug,'stable-url');assert.equal(changes.bpm,120);assert.equal('visibility' in changes,false);assert.equal('audioUrl' in changes,false);assert.equal(needsReviewWarning({...base,nexusReviewStatus:'published'},{realmId:101}),true);assert.equal(needsReviewWarning({...base,nexusReviewStatus:'published'},{title:'new'}),false);});
test('GraphQL accepts precisely the approved cover styles and rejects invalid styles',()=>{
 const {buildASTSchema,parse,validate}=require('../../backend/node_modules/graphql');const schema=buildASTSchema(require('../../backend/schemas'));
 const values=schema.getType('WorkingCoverStyle').getValues().map(v=>v.name);assert.equal(values.join(','),workingCoverStyles.join(','));
 for(const style of values)assert.equal(validate(schema,parse(`mutation { updateReleaseTrack(id:"x", input:{workingCoverStyle:${style}}){id workingCoverStyle} }`)).length,0);
 assert.ok(validate(schema,parse('mutation { updateReleaseTrack(id:"x", input:{workingCoverStyle:neon}){id} }')).length);
});
test('Actual Library documents match schema',()=>{const {buildASTSchema,parse,validate}=require('../../backend/node_modules/graphql');const schema=buildASTSchema(require('../../backend/schemas'));const source=fs.readFileSync(path.join(__dirname,'../src/app/creator/library/page.tsx'),'utf8');for(const match of source.matchAll(/gql`([\s\S]*?)`/g))assert.deepEqual(validate(schema,parse(match[1])).map(e=>e.message),[]);});
test('Real artwork wins over working treatments; none stays neutral',()=>{
 const module={exports:{}};const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/components/creator/WorkingCover.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(`(function(require,module,exports){${code}\n})`)(require,module,module.exports);
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),Cover=module.exports.default;
 const render=t=>renderToStaticMarkup(React.createElement(Cover,{track:{...base,...t}}));
 assert.match(render({artworkUrl:'/track.png',releaseCoverArtUrl:'/release.png',workingCoverStyle:'signal'}),/src="\/track.png"/);
 assert.match(render({releaseCoverArtUrl:'/release.png'}),/src="\/release.png"/);
 assert.match(render({}),/Working cover/);
 assert.doesNotMatch(render({workingCoverStyle:'none'}),/Working cover/);
});
