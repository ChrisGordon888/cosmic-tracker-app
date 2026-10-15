const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const page=fs.readFileSync('src/app/releases/[slug]/page.tsx','utf8');
const provider=fs.readFileSync('src/context/MusicPlayerProvider.tsx','utf8');
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function lib(name){const out={};vm.runInNewContext(compile(fs.readFileSync(`src/lib/${name}.ts`,'utf8')),{exports:out,require:n=>lib(n.replace('./',''))});return out;}
const {getMusicAvailability}=lib('musicAvailability'),{playerRealm}=lib('playerRealm');
function handoff(tracks,index=0){
 const out={},calls=[];
 const availability=page.slice(page.indexOf('function getTrackAvailability('),page.indexOf('\nexport default',page.indexOf('function getTrackAvailability(')));
 const actions=page.slice(page.indexOf('    const toPlayerTrack ='),page.indexOf('\n    return (\n        <main',page.indexOf('    const toPlayerTrack =')));
 vm.runInNewContext(compile(availability+actions+'\nexports.play=playReleaseTrack;'),{exports:out,getMusicAvailability,playerRealm,isCreatorView:false,isSignedInForMusic:false,releaseTracks:tracks,world:{slug:'world',title:'Fixture'},getPlayerArtworkUrl:()=>null,playOrToggleTrack:(...args)=>calls.push(args)});
 out.play(tracks[index]);return calls[0];
}
const track=(title,realmId=303,visibility='listed')=>({id:title,title,realmId,visibility,audioUrl:'/song.mp3',accessTier:'public',playbackStatus:'playable'});
const titles=q=>Array.from(q,t=>t.trackTitle);
for(const [name,tracks,expected] of [
 ['Break the Code',['hardcoded','losing my mind','HardWay'].map(t=>track(t)),['hardcoded','losing my mind','HardWay']],
 ['Glory & Command',[track('Glory n Power',55,'public'),track('Bank',55),track('Mula',55,'private')],['Glory n Power','Bank']],
 ['The Price of Focus',[track('13933',44),track('new jazz',44,'private'),track('Golden Tickets',44)],['13933','Golden Tickets']],
 ['Same Self, Higher Form',['same person','Walking Forward','Feel Blessed'].map(t=>track(t,0)),['same person','Walking Forward','Feel Blessed']],
 ['SIN',['Do Over','Hold My Hand','In The Deep','Her Fantasy','Running From The Plug','Siren'].map((t,i)=>track(t,[101,101,202,101,202,202][i])),['Do Over','Hold My Hand','In The Deep','Her Fantasy','Running From The Plug','Siren']],
 ['single-track World',[track('single',null)],['single']],
])test(`${name}: actual page hands off ordered playable queue with individual Realms`,()=>{
 const [selected,queue,options]=handoff(tracks);assert.deepEqual(titles(queue),expected);assert.equal(selected.id,queue[0].id);assert.equal(options.source,'release');
 assert.equal(queue.length,expected.length);
 for(const item of queue){assert.equal(item.realmId,tracks.find(t=>`release-${t.id}`===item.id).realmId);assert.equal(item.releaseSlug,'world');}
});
test('Starting the middle track retains the complete queue; private and locked selections cannot launch',()=>{
 const tracks=['first','middle','last'].map(t=>track(t));const [selected,queue]=handoff(tracks,1);
 assert.equal(selected.trackTitle,'middle');assert.deepEqual(titles(queue),['first','middle','last']);
 for(const state of [{visibility:'private'},{accessTier:'signup'},{accessTier:'premium'},{playbackStatus:'locked'},{dropDate:'2099-01-01'}]){
  const restricted={...track('restricted'),...state};assert.equal(handoff([restricted]),undefined);
  assert.deepEqual(titles(handoff([tracks[0],restricted])[1]),['first']);
 }
});
test('Actual provider traversal, Shuffle and ended handler use only the supplied World queue',async()=>{
 const out={},queue=handoff(['first','middle','last'].map(t=>track(t)))[1];
 const currentTrackRef={current:queue[0]},audioRef={current:{currentTime:0}},isShuffleEnabledRef={current:false};let ended;
 const helpers=provider.slice(provider.indexOf('function dedupeTracks'),provider.indexOf('export function MusicPlayerProvider'));
 const traversal=provider.slice(provider.indexOf('    const playNext ='),provider.indexOf('    const playOrToggleTrack ='));
 const ending=provider.slice(provider.indexOf('    useEffect(() => {\n        handleTrackEndedRef.current'),provider.indexOf('    useEffect(() => {\n        const audio = new Audio'));
 const handleTrackEndedRef={current:null};
 vm.runInNewContext(compile(helpers+traversal+ending+'\nexports.next=playNext;exports.previous=playPrevious;'),{exports:out,useCallback:f=>f,useEffect:f=>f(),getActiveQueue:()=>queue,resolvePlayableTrack:t=>t,isShuffleEnabledRef,currentTrackRef,audioRef,recentlyPlayedIdsRef:{current:[]},pushCurrentTrackToHistory:()=>{},popPreviousHistoryTrack:()=>null,startTrack:async t=>{currentTrackRef.current=t;},setCurrentTime:()=>{},setIsPlaying:()=>{},isContinuousEnabledRef:{current:true},handleTrackEndedRef});
 await out.next();assert.equal(currentTrackRef.current.trackTitle,'middle');await out.previous();assert.equal(currentTrackRef.current.trackTitle,'first');
 ended=handleTrackEndedRef.current;ended();await Promise.resolve();assert.equal(currentTrackRef.current.trackTitle,'middle');ended();await Promise.resolve();assert.equal(currentTrackRef.current.trackTitle,'last');
 isShuffleEnabledRef.current=true;await out.next();assert.ok(queue.includes(currentTrackRef.current));assert.notEqual(currentTrackRef.current.trackTitle,'last');
});
