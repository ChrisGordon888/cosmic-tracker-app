const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(name){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(`src/lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(`(function(require,module,exports){${code}})`)(n=>load(n.replace('./','')),m,m.exports);return m.exports;}
const {listenerRealmPath}=load('listenerPaths'),{projectPlayback}=load('publicProjects');
const t={id:'song',title:'Listed',realmId:202,visibility:'listed',playbackStatus:'playable',audioUrl:'/fixture.wav',accessTier:'public'};
const p={world:{id:'world',slug:'fixture',title:'Fixture'},realmId:202,tracks:[t,{...t,id:'second'}]};
test('Project counts and lead come from contextual tracks, not standalone discovery',()=>{const r=projectPlayback(p,false);assert.equal(r.total,2);assert.equal(r.available,2);assert.equal(r.lead.trackTitle,'Listed');});
test('Listener routing covers active, contextual project, member and quiet destinations',()=>{
 const active={...t,trackUrl:'/fixture.wav',releaseSlug:'fixture'};
 assert.equal(listenerRealmPath(202,[active],[],false).state,'active');
 assert.equal(listenerRealmPath(202,[],[p],false).href,'/releases/fixture');
 const member={...active,accessTier:'signup'};assert.equal(listenerRealmPath(202,[member],[],false).state,'member');assert.ok(listenerRealmPath(202,[member],[],false).href.includes('callbackUrl='));
 assert.equal(listenerRealmPath(44,[],[],false).href,'/nexus#realm-44');assert.equal(listenerRealmPath(44,[],[],false).state,'quiet');
});
test('Nexus runtime no longer references hardcoded EPs; all six anchors survive empty catalogs',()=>{const source=fs.readFileSync('src/app/nexus/page.tsx','utf8');assert.ok(!source.includes('PUBLIC_THREE_PIECE_COLLECTIONS'));assert.ok(!source.includes("signIn('github')"));assert.ok(!source.includes('filter((realmGroup) => realmGroup.tracks.length > 0)'));assert.ok(source.includes('SelectedWorlds'));});
test('Normal listener and practice sign-in use provider-choice route with return destinations',()=>{for(const route of ['nexus','practice','tracker']){const s=fs.readFileSync(`src/app/${route}/page.tsx`,'utf8');assert.ok(!/signIn\(['"]github/.test(s));assert.ok(s.includes(`/auth?callbackUrl=%2F${route}`));}});
