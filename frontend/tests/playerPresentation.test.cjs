const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const source = fs.readFileSync('src/lib/playerPresentation.ts', 'utf8');
const mod = {exports:{}};
vm.runInNewContext(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, {exports:mod.exports});
const {adaptPlayer,choosePlayer} = mod.exports;
const state = mode => ({mode,previous:mode,tour:false,manual:false});
test('Tour compacts expanded presentation and restores it without changing playback', () => {
  const active=adaptPlayer(state('expanded'),true);
  assert.equal(active.mode,'compact');
  assert.equal(adaptPlayer(active,false).mode,'expanded');
  assert.equal(adaptPlayer(active,true),active);
});
test('Manual presentation choices during guidance survive tour completion', () => {
  for(const mode of ['expanded','compact','minimized']) {
    const chosen=choosePlayer(adaptPlayer(state('expanded'),true),mode);
    assert.equal(adaptPlayer(chosen,false).mode,mode);
  }
});
test('Minimized player remains minimized; restore and repeated tours work', () => {
  assert.equal(adaptPlayer(state('minimized'),true).mode,'minimized');
  const restored=choosePlayer(state('minimized'),'compact');
  assert.equal(restored.mode,'compact');
  const ended=adaptPlayer(choosePlayer(adaptPlayer(restored,true),'expanded'),false);
  assert.equal(adaptPlayer(ended,true).mode,'compact');
  assert.equal(adaptPlayer(adaptPlayer(ended,true),false).mode,'expanded');
});

test('Saved dock is validated and tour relocation never changes preference', () => {
  const {readPlayerDock,playerDock}=mod.exports;
  assert.equal(readPlayerDock(null),'right');
  assert.equal(readPlayerDock('offscreen'),'right');
  for(const preferred of ['left','right']) {
    assert.equal(readPlayerDock(preferred),preferred);
    assert.equal(playerDock(preferred,true),'left');
    assert.equal(playerDock(preferred,false),preferred);
  }
});

test('Compact renders usable transport and seek; Expanded retains Shuffle and Flow', () => {
  const React = require('react');
  const {renderToStaticMarkup}=require('react-dom/server');
  let expanded=false;
  const player={currentTrack:{trackTitle:'Fixture song',artist:'Fixture artist',realmName:'Fixture',realmId:0},
    currentTime:12,duration:100,volume:.7,isPlaying:true,queueLength:2,hasNextTrack:true,hasPreviousTrack:true};
  const component={exports:{}};
  const code=ts.transpileModule(fs.readFileSync('src/components/music/MiniPlayer.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const imports=name=>{
    if(name==='@/lib/releaseSharing') {
      const sharing={exports:{}};
      vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/releaseSharing.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:sharing.exports,URL});
      return sharing.exports;
    }
    if(name==='next/link') return {__esModule:true,default:'a'};
    if(name==='next/navigation') return {usePathname:()=>'/creator'};
    if(name.includes('CreatorTourProvider')) return {useCreatorTour:()=>({guidanceVisible:false})};
    if(name.includes('useMusicPlayer')) return {useMusicPlayer:()=>({...player,isExpanded:expanded})};
    if(name.includes('playerPresentation')) return mod.exports;
    if(name.includes('publicJourney')) return {isPublicWorld:()=>false};
    if(name.includes('realmTheme')) return {getRealmTheme:()=>({accent:'#fff',soft:'#222',border:'#444',glow:'#000'})};
    if(name.endsWith('.css')) return {};
    return require(name);
  };
  vm.runInNewContext(code,{exports:component.exports,require:imports});
  const compact=renderToStaticMarkup(React.createElement(component.exports.default));
  for(const label of ['Play previous track','Play next track','Seek Fixture song','Pause Fixture song','Expand player','Minimize player']) assert.ok(compact.includes(`aria-label="${label}"`),label);
  assert.ok(!compact.includes('>Shuffle<'));
  expanded=true;
  const full=renderToStaticMarkup(React.createElement(component.exports.default));
  for(const label of ['Shuffle','Flow','Compact player','Dock player left']) assert.ok(full.includes(label),label);
  player.currentTrack.realmId=null;player.currentTrack.realmName='';
  const unknown=renderToStaticMarkup(React.createElement(component.exports.default));
  assert.ok(!unknown.includes('Realm 0'));assert.ok(!unknown.includes('INTERSIDDHI'));

});

test('Actual shared-player actions replace stale track, audio and context on explicit selection',async()=>{
 const source=fs.readFileSync('src/context/MusicPlayerProvider.tsx','utf8');
 const start=source.slice(source.indexOf('    const startTrack = useCallback('),source.indexOf('    const setQueue = useCallback('));
 const play=source.slice(source.indexOf('    const playOrToggleTrack = useCallback('),source.indexOf('    const togglePlayPause = useCallback('));
 const old={id:'old-session',trackTitle:'Previous song',trackUrl:'/old'};
 const media={exports:{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/playerMediaSource.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:media.exports,URL});
 const audio={removeAttribute(){},paused:false,src:'/old',currentTime:12,pause(){this.paused=true},async play(){this.paused=false}};
 let selected=old,context=null;
 const refs={current:old};const out={};
 const env={exports:out,console,setPlayerMediaSource:media.exports.setPlayerMediaSource,useCallback:fn=>fn,audioRef:{current:audio},currentTrackRef:refs,resolvePlayableTrack:t=>t,setCurrentTrack:t=>selected=t,setCurrentTime:()=>{},setDuration:()=>{},setIsPlaying:()=>{},markRecentlyPlayed:()=>{},replaceQueue:(_,options)=>context=options,ensureTrackQueue:()=>{},pushCurrentTrackToHistory:()=>{}};
 vm.runInNewContext(ts.transpileModule(start+play+'\nexports.play=playOrToggleTrack;',{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,env);
 for(const [id,title,url,label] of [['canon','Not Enough','/canon','Canon entry'],['suggested','HardWay','/hardway','Realm guidance'],['orbit','Orbit song','/orbit','Realm flow']]){
  const track={id,trackTitle:title,trackUrl:url,artworkUrl:`/${id}.png`};await out.play(track,[track],{source:'realm',label});
  assert.equal(selected.trackTitle,title);assert.equal(refs.current.id,id);assert.equal(audio.src,url);assert.equal(selected.artworkUrl,`/${id}.png`);assert.equal(context.label,label);assert.equal(audio.paused,false);
 }
});
