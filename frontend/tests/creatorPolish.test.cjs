const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { parse, buildASTSchema, validate } = require('graphql');
const read = relative => fs.readFileSync(path.join(__dirname, '../src', relative), 'utf8');
const worlds = [
  { id: 'feature', slug: 'feature', title: 'Featured work', status: 'draft', visibility: 'private', releaseType: 'single', isFeatured: true, updatedAt: '2026-09-01' },
  { id: 'recent', slug: 'recent', title: 'Recent work', status: 'active', visibility: 'public', releaseType: 'ep', updatedAt: '2026-10-03', lastOpenedAt: '2026-08-01' },
  { id: 'archive', slug: 'archive', title: 'Archived work', status: 'archived', visibility: 'private', releaseType: 'album', updatedAt: '2026-10-04' },
];
const data = { myReleaseWorlds: worlds, myCreativeProfiles: [{ id: 'profile', artistName: 'Test artist', featuredReleaseWorldId: 'feature' }], myCatalogTracks: [] };
function load(relative, options = {}) {
  const code = ts.transpileModule(read(relative), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  const localRequire = name => {
    if (name.endsWith('.css')) return {};
    if (name === 'next/link') return { __esModule: true, default: ({children, ...props}) => React.createElement('a', props, children) };
    if (name === 'next/navigation') return { usePathname: () => options.pathname ?? '/creator' };
    if (name === 'next-auth/react') return { useSession: () => ({ status: 'authenticated' }), signIn() {} };
    if (name === '@apollo/client') return { gql: (parts, ...values) => parse(parts.reduce((s, p, i) => s + p + (values[i] || ''), '')), useQuery: () => ({ data: options.data ?? data, loading: false, refetch() {} }), useMutation: () => [() => {}, { loading: false }] };
    if (name.startsWith('@/components/creator/')) return { __esModule: true, default: () => null };
    if (name.startsWith('@/lib/')) return load(name.slice(2) + '.ts', options);
    return require(name);
  };
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { console, Date, Intl })(localRequire, module, module.exports);
  return module.exports;
}

test('Capture and catalog have distinct stable targets; all organizer tools stay behind Organize Library', () => {
  const { CREATOR_LINKS } = load('lib/creatorNavigation.ts');
  assert.equal(CREATOR_LINKS.capture, '/creator/library#intake');
  assert.equal(CREATOR_LINKS.catalog, '/creator/library#catalog');
  const source = read('app/creator/library/page.tsx');
  assert.match(source, /id="intake" tabIndex=\{-1\}/);
  assert.match(source, /id="catalog" tabIndex=\{-1\}/);
  const disclosure = source.slice(source.indexOf('<details className="creator-library-organize"'), source.indexOf('<section className="creator-library-intake"'));
  for (const label of ['Review catalog / rights', 'Clean up Library', 'Smart Sort tracks needing Realm', 'Public exposure audit']) assert.ok(disclosure.includes(label));
});

test('Home resumes recent active work independently of feature, excludes archive, and keeps actionable recent links', () => {
  const Page = load('app/creator/page.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Page));
  assert.match(html, /<h1>Recent work<\/h1>/);
  assert.match(html, /Your featured project/);
  assert.match(html, /Featured work/);
  assert.doesNotMatch(html, /Archived work|\/releases\/archive/);
  assert.match(html, /href="\/releases\/recent\/board"/);
  assert.match(html, /href="\/creator\/projects#archived"/);
  assert.match(html, /<span>Active Projects<\/span><strong>2<\/strong>/);
  assert.doesNotMatch(html, /creator-console-rail-lines|Signal boards/);
});

test('Archived featured selection cannot be presented as a live feature; active filtering preserves all active lifecycle states', () => {
  const source = read('app/creator/page.tsx');
  const code = ts.transpileModule('export ' + source.slice(source.indexOf('function getFeaturedProject'), source.indexOf('function getReleaseHealth')), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports });
  assert.equal(exports.getFeaturedProject([{...worlds[2], isFeatured:true}], {featuredReleaseWorldId:'archive'}), null);
  const { activeCreatorProjects } = load('lib/creatorNavigation.ts');
  assert.deepEqual(Array.from(activeCreatorProjects([...worlds, {...worlds[0], id:'released', status:'released'}]), w => w.id), ['feature', 'recent', 'released']);
});

test('Projects keep archive recovery separate and Workshop primary while preserving publishing details', () => {
  const Page = load('app/creator/projects/page.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Page));
  const archive = html.slice(html.indexOf('<details class="creator-projects-card creator-project-archive"'));
  assert.match(archive, /Archived projects \(1\)/);
  assert.match(archive, /Archived work/);
  assert.match(archive, /href="\/creator\/releases\/archive\/publish"/);
  assert.doesNotMatch(archive, /Publish Release|Set Featured/);
  assert.doesNotMatch(html.slice(0, html.indexOf(archive)), /Archived work/);
  assert.match(html, /href="\/releases\/recent\/board" class="creator-projects-primary-button">Open Workshop/);
  assert.match(html, /<summary>Project details &amp; publishing<\/summary>/);
  assert.match(html, /Prepare Release/);
});

test('Rail has real links and correct active-page state, including profile editor', () => {
  const Rail = load('components/creator/CreatorRail.tsx', {pathname:'/creator/library'}).default;
  const html = renderToStaticMarkup(React.createElement(Rail));
  assert.match(html, /href="\/creator\/library#catalog"[^>]*aria-current="page"/);
  assert.match(html, /href="\/creator\/onboarding\/profile"/);
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
  assert.equal((html.match(/<a /g) || []).length, 4);
});

test('Tour identity is owner-scoped and Workshop V2 targets only real panels', () => {
  const { creatorHomeTourKey } = load('lib/creatorNavigation.ts');
  assert.notEqual(creatorHomeTourKey('owner-a'), creatorHomeTourKey('owner-b'));
  assert.equal(creatorHomeTourKey('owner/a'), 'cosmic:creator-home-tour:v1:owner%2Fa');
  const { WORKSPACE_TOUR_STEPS } = load('lib/workspaceTour.ts');
  assert.deepEqual(Array.from(WORKSPACE_TOUR_STEPS, s => s.title), ['Music','Realm','Artwork','Story','Release','Studio Board']);
  const source = read('app/releases/[slug]/board/page.tsx');
  for (const stop of WORKSPACE_TOUR_STEPS) assert.ok(source.includes(`data-workspace-tour="${stop.target}"`));
});

test('Home attention fields use the existing GraphQL schema', () => {
  const schemaSource = fs.readFileSync(path.join(__dirname, '../../backend/schemas/index.js'), 'utf8');
  const schema = buildASTSchema(parse(schemaSource.slice(schemaSource.indexOf('`') + 1, schemaSource.lastIndexOf('`'))));
  const query = read('app/creator/page.tsx').match(/const CREATOR_HOME_QUERY = gql`([\s\S]*?)`/)[1];
  assert.deepEqual(validate(schema, parse(query)).map(e => e.message), []);
});

test('Empty and archive-only accounts have no active or implicit featured project, with recoverable history', () => {
  for (const myReleaseWorlds of [[], [{...worlds[2], isFeatured:true}]]) {
    const fixture = {...data, myReleaseWorlds, myCreativeProfiles:[{id:'profile', featuredReleaseWorldId:'archive'}]};
    const Home = load('app/creator/page.tsx', {data:fixture}).default;
    const home = renderToStaticMarkup(React.createElement(Home));
    assert.match(home, /<h1>Creator OS<\/h1>/);
    assert.match(home, /No active projects yet/);
    assert.doesNotMatch(home, /<button[^>]*>Set Featured/);
    const Projects = load('app/creator/projects/page.tsx', {data:fixture}).default;
    const projects = renderToStaticMarkup(React.createElement(Projects));
    assert.match(projects, /No active projects yet/);
    if (myReleaseWorlds.length) assert.match(projects, /href="\/creator\/releases\/archive\/publish"/);
  }
});

test('Home attention counts exclude Vault, Sandbox and archived tracks; Realm zero is a real assignment', () => {
  const track = {id:'a', status:'demo', realmId:null, catalogTreatment:'current', rightsInfo:{reviewStatus:'needsReview'}};
  const fixture = {...data, myCatalogTracks:[track, {...track,id:'zero',realmId:0,rightsInfo:{reviewStatus:'unknown'}}, {...track,id:'test',catalogTreatment:'test'}, {...track,id:'vault',catalogTreatment:'vault'}, {...track,id:'archive',status:'archived'}]};
  const Home = load('app/creator/page.tsx', {data:fixture}).default;
  const html = renderToStaticMarkup(React.createElement(Home));
  assert.match(html, /Realm undecided · 1/);
  assert.match(html, /Rights explicitly needing review · 1/);
  assert.match(html, /<span>Unsorted<\/span><strong>2<\/strong>/);
});
