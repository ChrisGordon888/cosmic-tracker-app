const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file) {
  const module = {exports:{}};
  const source = fs.readFileSync(path.join(__dirname, '../src/lib', file + '.ts'), 'utf8');
  const code = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(name=>load(name.replace('./','')),module,module.exports);
  return module.exports;
}
const { CREATOR_TOUR_TITLES, creatorTourSessionKey, readCreatorTour, creatorTourAtLocation, creatorTourDestination, creatorTourTarget, isCreatorTourRoute } = load('creatorTour');

test('Tour follows the real seven-step route journey and retains its project', () => {
  let state = {step:0,projectSlug:'fixture'};
  const routes = [
    ['/creator/library','#intake',0], ['/creator/library','#catalog',1], ['/creator/library','#organize',2],
    ['/creator/projects','',3], ['/releases/fixture/board','',4], ['/creator/releases/fixture/publish','',5], ['/nexus','',6],
  ];
  for(const [pathname,hash,step] of routes) {
    assert.equal(creatorTourDestination({...state,step}), pathname+hash);
    state = creatorTourAtLocation(state,pathname,hash);
    assert.equal(state.step,step); assert.equal(state.projectSlug,'fixture');
    assert.ok(creatorTourTarget(state,pathname));
  }
  assert.equal(CREATOR_TOUR_TITLES.length,7);
  assert.equal(creatorTourAtLocation(state,'/releases/fixture/board').step,6,'submission context survives the return to Workshop');
});

test('Unrelated navigation and returning Home do not restart an active tour', () => {
  const state={step:3,projectSlug:'fixture'};
  assert.equal(creatorTourAtLocation(state,'/creator'),state);
  assert.equal(creatorTourAtLocation(state,'/services'),state);
  assert.equal(isCreatorTourRoute('/services'),false);
  assert.equal(isCreatorTourRoute('/releases/fixture'),false,'no tour overlay on listener worlds');
  assert.equal(isCreatorTourRoute('/creator/onboarding/profile'),true);
  assert.equal(creatorTourTarget(state,'/creator'),null,'do not highlight an unrelated Home control');
});

test('Missing project never invents a release; choosing a Workshop gives the tour its actual project', () => {
  for(const step of [4,5]) {
    const state={step};
    assert.equal(creatorTourDestination(state),'/creator/projects');
    assert.equal(creatorTourAtLocation(state,'/creator/projects').step,step);
    const chosen=creatorTourAtLocation(state,'/releases/chosen-song/board');
    assert.equal(chosen.projectSlug,'chosen-song');assert.equal(chosen.step,4);
    assert.equal(creatorTourDestination({...chosen,step:5}),'/creator/releases/chosen-song/publish');
  }
});

test('Tour reload data is validated and scoped by creator identity', () => {
  assert.notEqual(creatorTourSessionKey('creator-a'),creatorTourSessionKey('creator-b'));
  assert.equal(creatorTourSessionKey('a/b'),'cosmic:creator-tour-session:v1:a%2Fb');
  const restored=readCreatorTour(JSON.stringify({step:5,projectSlug:'fixture'}));
  assert.equal(restored.step,5);assert.equal(restored.projectSlug,'fixture');
  for(const invalid of [null,'bad json','null','{}','{"step":-1}','{"step":7}','{"step":0.5}','{"step":"1"}']) assert.equal(readCreatorTour(invalid),null);
  assert.equal(readCreatorTour('{"step":4,"projectSlug":"https://outside.invalid"}').projectSlug,undefined);
});

test('Browser back navigation updates the lesson without discarding selected project context', () => {
  const state=creatorTourAtLocation({step:6,projectSlug:'fixture'},'/creator/library','#organize');
  assert.equal(state.step,2);assert.equal(state.projectSlug,'fixture');
  const publish=creatorTourAtLocation(state,'/creator/releases/another-project/publish');
  assert.equal(publish.step,5);assert.equal(publish.projectSlug,'another-project');
});

test('Reduced motion keeps static guidance for both tours; mobile does not inherit desktop card height', () => {
  const postcss = require('postcss');
  const css = postcss.parse(fs.readFileSync(path.join(__dirname, '../src/styles/creatorTour.css'), 'utf8'));
  const reduced = css.nodes.find(n => n.type === 'atrule' && n.params === '(prefers-reduced-motion: reduce)');
  assert.ok(reduced);
  for (const target of ['.creator-tour-target', '.workspace-tour-target']) {
    const rule = reduced.nodes.find(n => n.type === 'rule' && n.selector.includes(target));
    assert.ok(rule.nodes.some(n => n.prop === 'animation' && n.value === 'none' && n.important));
    assert.ok(rule.nodes.some(n => n.prop === 'outline-color'));
  }
  const home = postcss.parse(fs.readFileSync(path.join(__dirname, '../src/styles/creator.css'), 'utf8'));
  const desktop = home.nodes.find(n => n.type === 'atrule' && n.params === '(min-width: 1101px)');
  assert.ok(desktop.nodes.some(n => n.type === 'rule' && n.selector === '.creator-console-grid-bottom > .creator-console-panel' && n.nodes.some(d => d.prop === 'min-height' && d.value === '16rem')));
});
