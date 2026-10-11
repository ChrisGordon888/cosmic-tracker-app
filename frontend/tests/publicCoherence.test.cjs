const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
const walk = node => Array.isArray(node) ? node.flatMap(walk) : node && typeof node === 'object' ? [node, ...walk(node.props?.children)] : [];
function render(file, mocks = {}) {
  const m = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}})`, { window: { confirm: () => mocks.confirm !== false } })((name) => mocks[name] || (name.endsWith('.css') ? {} : name === 'next/link' ? { default: 'a' } : name.startsWith('@/components/') ? { default: () => null } : require(name)), m, m.exports);
  return m.exports.default;
}
test('Home exposes all six specific Realm destinations as native links', () => {
  const nodes = walk(render('src/app/page.tsx')());
  const links = nodes.filter(n => n.props?.className === 'landing-realm');
  assert.equal(links.length, 6);
  assert.deepEqual(links.map(n => n.props.href), [303,202,101,55,44,0].map(id => `/realms/${id}`));
});
test('Project Canon sends only existing world selection with concurrency token; cancellation is inert', async () => {
  for (const confirmed of [false,true]) {
    const calls = [];
    const component = render('src/components/creator/ProjectCanonControl.tsx', { confirm: confirmed, react: { useState: v => [v,()=>{}] }, '@apollo/client': { gql:()=>'', useMutation:()=>[async args=>calls.push(args),{loading:false}] } });
    const tree = component({world:{id:'w',title:'World',visibility:'public',publicCanon:false,updatedAt:'version'},onSaved:async()=>{}});
    walk(tree).find(n=>n.type==='button'&&n.props.children==='Canon').props.onClick();
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(calls.length,confirmed?1:0);
    if(confirmed)assert.equal(JSON.stringify(calls[0].variables),JSON.stringify({id:'w',expectedUpdatedAt:'version',selected:true}));
  }
});
test('Both natural project surfaces request the same canonical field and share the control',()=>{
  for(const file of ['src/app/creator/projects/page.tsx','src/app/creator/releases/[slug]/publish/page.tsx']) {
    const s=fs.readFileSync(file,'utf8'); assert.match(s,/publicCanon/);assert.match(s,/<ProjectCanonControl/);assert.match(s,/cache-and-network/);
  }
  const library=fs.readFileSync('src/components/creator/PublicCurationReview.tsx','utf8');assert.match(library,/Manage World/);assert.match(library,/releaseWorldId/);
});
test('Three Mirrors preserve the six-Realm pairing and primary orientation path',()=>{
 const nodes=walk(render('src/app/scroll/page.tsx')());
 const cards=nodes.filter(n=>n.props?.className==='scroll-mirror-card');assert.equal(cards.length,3);
 const paths=cards.map(c=>walk(c).filter(n=>n.props?.href?.startsWith('/realms')).map(n=>n.props.href));
 assert.deepEqual(paths,[['/realms/303','/realms/44'],['/realms/101','/realms/55'],['/realms/202','/realms/0']]);
 assert.ok(nodes.some(n=>n.props?.href==='/find-your-realm'));
});
test('Public Practice has optional neutral state, transient reflection, no private tools mounted',()=>{
 const states=[];
 const c=render('src/app/practice/page.tsx',{react:{useState:v=>{states.push(v);return[v,()=>{}]},useEffect:()=>{}},'next-auth/react':{useSession:()=>({data:null,status:'unauthenticated'})},'@/lib/moonPhases':{getMoonPhaseForDate:()=>null}});
 const nodes=walk(c());const buttons=nodes.filter(n=>n.type==='button');assert.equal(buttons.length,6);assert.ok(buttons.every(n=>n.props['aria-pressed']===false));
 assert.equal(nodes.find(n=>n.type==='textarea').props.value,'');assert.ok(nodes.some(n=>n.props?.href==='/auth?callbackUrl=%2Fpractice'));
 assert.ok(!nodes.some(n=>n.props?.className==='practice-daily-grid'&&walk(n).some(c=>typeof c.type==='function')));
});
test('Quiet Realm block has no playback and uses each Realm identity',()=>{
 const s=fs.readFileSync('src/app/nexus/page.tsx','utf8');const block=s.slice(s.indexOf('<article className={`realm-dormant'),s.indexOf('</article>',s.indexOf('<article className={`realm-dormant')));
 assert.match(block,/realmGroup.icon/);assert.match(block,/realmGroup.description/);assert.match(block,/Enter the Realm/);assert.ok(!block.includes('<button'));
});
test('Realm return links preserve their own listening destinations',()=>{for(const id of [303,202,101,55,44,0])assert.ok(fs.readFileSync(`src/app/realms/${id}/page.tsx`,'utf8').includes(`/nexus#realm-${id}`));});
test('Nexus renders one project shelf after Realm Soundtracks, with no editorial empty block',()=>{
 const source=fs.readFileSync('src/components/creator/SelectedWorlds.tsx','utf8');
 assert.match(source,/p.isSelected/);assert.ok(!source.includes('No editorial selections yet.'));
 const nexus=fs.readFileSync('src/app/nexus/page.tsx','utf8');assert.equal((nexus.match(/<PublicWorlds selectedOnly \/>/g)||[]).length,1);assert.ok(!nexus.includes('<SelectedWorlds'));
});
test('Canonical Realm pages expose public music and guard saved progression; entry only redirects',()=>{
 for(const id of [303,202,101,55,44,0]){
 const s=fs.readFileSync(`src/app/realms/${id}/page.tsx`,'utf8');
 assert.match(s,/RealmBackground/);assert.match(s,/RealmSoundstage/);assert.match(s,/skip: !session/);assert.match(s,/session && showProgression/);assert.ok(!s.includes('if (!session) {'));
 }
 const redirect=fs.readFileSync('src/app/realms/[id]/entry/page.tsx','utf8');assert.match(redirect,/router.replace/);assert.match(redirect,/window.location.search/);assert.ok(!redirect.includes('RealmSoundstage'));
 const nexus=fs.readFileSync('src/app/nexus/page.tsx','utf8');assert.ok(nexus.indexOf('id="realm-soundtracks"')<nexus.indexOf('<PublicWorlds selectedOnly />'));
});
test('Practice family shares environment and routes without replacing saved tools',()=>{
 for(const route of ['practice','tracker','rituals','calendar'])assert.match(fs.readFileSync(`src/app/${route}/page.tsx`,'utf8'),/<PracticeShell/);
 const shell=fs.readFileSync('src/components/practice/PracticeShell.tsx','utf8');for(const path of ['/tracker','/rituals','/calendar','/practice#reflection'])assert.ok(shell.includes(path));
 const practice=fs.readFileSync('src/app/practice/page.tsx','utf8');for(const tool of ['SacredYesSection','MoodSection','PracticeQuestsSection'])assert.match(practice,new RegExp(`<${tool} />`));
 for(const path of ['src/components/MoonPhaseCard.tsx','src/app/practice/page.tsx','src/app/calendar/page.tsx']){const s=fs.readFileSync(path,'utf8');assert.match(s,/@\/lib\/moonPhases/);assert.ok(!/moonPhases202[56]|utils\/moonPhases/.test(s));}
});
test('Scroll deeper context is optional and symbolic lenses do not replace Mirror pairing',()=>{
 const s=fs.readFileSync('src/app/scroll/page.tsx','utf8');assert.match(s,/<summary>Historical note/);assert.match(s,/<summary>Ways of seeing/);for(const label of ['Parts + Self','Pattern / design','Number / symbol','Witness / tradition'])assert.ok(s.includes(label));assert.ok(!s.includes('A historical object.'));
});
test('Current lunar calculations extend beyond static tables and principal markers use crossings',()=>{
 const m={exports:{}};const code=ts.transpileModule(fs.readFileSync('src/lib/moonPhases.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
 vm.runInNewContext(`(function(require,module,exports){${code}})`,{Date})(require,m,m.exports);
 const full=m.exports.getMoonPhaseForDate(new Date('2026-10-26T04:12:00Z'));assert.equal(full.phase,'Full Moon');assert.ok(full.illumination>.98);
 const future=m.exports.getMoonPhaseForDate(new Date('2031-01-01T12:00:00Z'));assert.equal(future.date.getFullYear(),2031);assert.ok(future.illumination>=0&&future.illumination<=1);
 const markers=m.exports.getLunarMonthMarkers(new Date(2026,9,1));assert.equal(markers.length,4);assert.ok(markers.some(m=>m.phase==='Full Moon'&&[25,26].includes(m.date.getDate())));
});
