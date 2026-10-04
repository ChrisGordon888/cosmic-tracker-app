const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function compile(source){const exports={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});return exports;}
test('Two creator identities have explicit local selections, never a recent-project implicit feature',()=>{
 const source=read('src/app/creator/page.tsx');const {getFeaturedProject}=compile('export '+source.slice(source.indexOf('function getFeaturedProject'),source.indexOf('function getReleaseHealth')));
 const a=[{id:'a',title:'Creator A',isFeatured:true}],b=[{id:'b',title:'Creator B',isFeatured:false}];
 assert.equal(getFeaturedProject(a,{featuredReleaseWorldId:'a'}).id,'a');assert.equal(getFeaturedProject(b,{featuredReleaseWorldId:'a'}),null);assert.equal(getFeaturedProject(b,{featuredReleaseWorldId:'b'}).id,'b');
 const nexus=read('src/app/nexus/page.tsx');
 assert.match(nexus,/featuredSignalRecord = publicFeaturedSignalData\?\.getPublicFeaturedSignal/);
 assert.doesNotMatch(nexus,/myFeaturedSignalData/);
 assert.match(nexus,/Nexus Spotlight/);
 assert.doesNotMatch(nexus,/GET_MY_FEATURED_RELEASE_WORLD/);
 assert.doesNotMatch(read('src/app/creator/projects/page.tsx'),/<span>Nexus Featured<\/span>/);
});
test('Google HTTPS avatars match precise Next image configuration, local paths remain valid',()=>{
 const config=compile(read('next.config.ts')).default;
 const {getImgProps}=require('next/dist/shared/lib/get-img-props');
 const {imageConfigDefault}=require('next/dist/shared/lib/image-config');
 const defaultLoader=require('next/dist/shared/lib/image-loader').default;
 const state={defaultLoader,imgConf:{...imageConfigDefault,...config.images}};
 for(const src of ['https://lh3.googleusercontent.com/a/example','/avatar.png'])assert.doesNotThrow(()=>getImgProps({src,alt:'Avatar',width:96,height:96},state));
 assert.throws(()=>getImgProps({src:'https://untrusted.example/avatar.png',alt:'Avatar',width:96,height:96},state),/not configured/);
 assert.equal(config.images.remotePatterns.length,1);assert.equal(config.images.remotePatterns[0].protocol,'https');
 const profile=read('src/app/profile/page.tsx');assert.match(profile,/avatarUrl \? \(/);assert.match(profile,/✦/);
});
