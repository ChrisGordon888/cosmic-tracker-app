const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function lib(name){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(`src/lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;vm.runInNewContext(`(function(require,module,exports){${code}})`)(n=>lib(n.replace('./','').replace('@/lib/','')),m,m.exports);return m.exports;}
const {playerRealm}=lib('playerRealm');
test('Featured release mapping preserves each track Realm, unknown stays null, genuine zero stays InterSiddhi',()=>{
 const s=fs.readFileSync('src/app/nexus/page.tsx','utf8');const fn=s.slice(s.indexOf('function toPlayerTrack('),s.indexOf('export default function CosmicNexusHub'));
 const out={};vm.runInNewContext(ts.transpileModule(fn+'\nexports.map=toPlayerTrack;',{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:out,playerRealm,getFeaturedTrackPlaybackUrl:()=>'/audio'});
 for(const [realmId,name] of [[101,'Moonlit Roads'],[202,'The Veil'],[0,'InterSiddhi'],[null,''],[undefined,'']]){
 const p=out.map({id:'song',title:'Song',realmId},{slug:'sirens-in-neverland'},false);assert.equal(p.realmId,realmId??null);assert.equal(p.realmName,name);assert.equal(p.releaseSlug,'sirens-in-neverland');}
 assert.equal(lib('realmTheme').getRealmTheme(null).realmId,null);
});
test('Nexus soundtracks use public music while Worlds stay selected-only and registry bypass stays closed',()=>{
 const s=fs.readFileSync('src/app/nexus/page.tsx','utf8');assert.match(s,/variables: \{ samplerOnly: true \}/);assert.ok(s.includes('creatorTracks.map((track, index)'));assert.match(s,/<PublicWorlds selectedOnly \/>/);
 const realm=fs.readFileSync('src/components/realm/RealmSoundstage.tsx','utf8');assert.ok(!realm.includes('nexusOnly: true'));
 const world=fs.readFileSync('src/app/releases/[slug]/page.tsx','utf8');assert.match(world,/playerRealm\(track.realmId\)/);assert.match(world,/fragment ReleaseTrackFields on ReleaseTrack \{\s+realmId/);
});
test('Public/Listed playback is anonymous by default; membership requires explicit state',()=>{
 const {getMusicAvailability}=lib('musicAvailability');const opts={isCreatorView:false,isSignedIn:false};
 for(const visibility of ['public','listed']){const t={visibility,audioUrl:'/a',playbackStatus:'playable',publicCanon:visibility==='public'};assert.equal(getMusicAvailability(t,opts).isPlayable,true);assert.equal(getMusicAvailability({...t,accessTier:'signup'},opts).isPlayable,false);assert.equal(getMusicAvailability({...t,accessTier:'signup'},{...opts,isSignedIn:true}).isPlayable,true);}
});
test('Listening-history effect skips null Realm but logs genuine InterSiddhi zero and other Realms',async()=>{
 const s=fs.readFileSync('src/context/MusicPlayerProvider.tsx','utf8');const marker=s.indexOf('// Listen history requires');const start=s.lastIndexOf('    useEffect(',marker);const end=s.indexOf('}, [currentTrack, isPlaying, currentTime, duration, logMusicListen, isAuthenticated]);',marker)+ '}, [currentTrack, isPlaying, currentTime, duration, logMusicListen, isAuthenticated]);'.length;
 const code=ts.transpileModule(s.slice(start,end),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 for(const realmId of [null,0,101]){const calls=[];vm.runInNewContext(code,{useEffect:fn=>fn(),isAuthenticated:true,currentTrack:{id:'t',trackTitle:'Track',realmId},isPlaying:true,currentTime:80,duration:100,loggedListenIdsRef:{current:new Set()},logMusicListen:args=>{calls.push(args);return Promise.resolve({data:{}})},window:{dispatchEvent:()=>{}},CustomEvent:class{},console});await new Promise(resolve=>setImmediate(resolve));assert.equal(calls.length,realmId==null?0:1);if(calls.length)assert.equal(calls[0].variables.realmId,realmId);}
});
