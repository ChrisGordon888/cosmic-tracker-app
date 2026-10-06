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
});
