const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const candidates = require('../../backend/migrations/curatedWorlds.v1.json');
const registry = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/musicRegistry.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: registry });

test('Restoration preserves six historical titles, ordered identities, context and story', () => {
  const historical = registry.MUSIC_COLLECTIONS.filter(c => c.type === 'public-three-piece');
  assert.equal(historical.length, 6);
  assert.equal(candidates.length, 6);
  for (const c of candidates) {
    const source = historical.find(h => h.id === c.id);
    for (const field of ['title', 'realmId', 'description', 'story']) assert.equal(c[field], source[field]);
    assert.deepEqual(c.trackIds, Array.from(source.trackIds));
    for (const id of c.trackIds) assert.equal(registry.MUSIC_REGISTRY.filter(t => t.id === id).length, 1);
    assert.ok(fs.existsSync(`public${c.artworkUrl}`));
  }
});
