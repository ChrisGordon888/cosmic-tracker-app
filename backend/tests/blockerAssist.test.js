const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../../frontend/node_modules/typescript');
const { ApolloServer } = require('apollo-server-express');
const { buildASTSchema, validate } = require('graphql');
const typeDefs = require('../schemas');
const resolvers = require('../resolvers');
const ReleaseWorld = require('../models/ReleaseWorld');
const CreativeProfile = require('../models/CreativeProfile');
const ReleaseTrack = require('../models/ReleaseTrack');
const ReleaseAsset = require('../models/ReleaseAsset');

function load(relative) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../../frontend/src', relative), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const context = { exports: {}, require: (name) => {
    assert.equal(name, '@apollo/client');
    return require('../../frontend/node_modules/@apollo/client');
  } };
  vm.runInNewContext(code, context);
  return context.exports;
}
const logic = load('lib/blockerAssist.ts');
const workspaceDocument = load('graphql/blockerAssist.ts').BLOCKER_ASSIST_WORKSPACE;
const readinessDocument = load('graphql/onboarding.ts').GET_RELEASE_PUBLISHING_READINESS;
const blank = () => ({ observed: false, suppressedUntil: 0 });
const missing = (codes = [logic.COVER_BLOCKER]) => ({ releaseWorldId: 'release', blockingIssues: codes.map((code) => ({ code })), completedChecks: [] });

test('Only explicit featured selections qualify, never first/recent or archived releases', () => {
  const release = { id: 'release', title: 'Test', slug: 'test', status: 'draft', isFeatured: false };
  assert.equal(logic.explicitlyFeaturedRelease({ myCreativeProfiles: [], myReleaseWorlds: [release] }), null);
  assert.equal(logic.explicitlyFeaturedRelease({ myCreativeProfiles: [{ featuredReleaseWorldId: release.id }], myReleaseWorlds: [release] }).id, release.id);
  assert.equal(logic.explicitlyFeaturedRelease({ myCreativeProfiles: [], myReleaseWorlds: [{ ...release, isFeatured: true }] }).id, release.id);
  assert.equal(logic.explicitlyFeaturedRelease({ myCreativeProfiles: [], myReleaseWorlds: [{ ...release, isFeatured: true, status: 'archived' }] }), null);
});

test('One supported blocker only; multiple, unsupported and empty states stay quiet', () => {
  assert.equal(logic.evaluateBlockerAssist('release', missing(), blank(), 0).view, 'noticed');
  for (const codes of [[], ['TRACK_REQUIRED'], [logic.COVER_BLOCKER, 'TRACK_REQUIRED'], [logic.COVER_BLOCKER, logic.COVER_BLOCKER]]) {
    assert.equal(logic.evaluateBlockerAssist('release', missing(codes), blank(), 0).view, null);
  }
  assert.equal(logic.evaluateBlockerAssist('other-release', missing(), blank(), 0).view, null);
});

test('Clearance requires prior observation and affirmative verification of the specific condition', () => {
  const observed = logic.evaluateBlockerAssist('release', missing(), blank(), 0).memory;
  assert.equal(logic.evaluateBlockerAssist('release', missing(), observed, 1).view, 'noticed');
  assert.equal(logic.evaluateBlockerAssist('release', missing([]), observed, 1).view, null);
  const cleared = { ...missing([]), completedChecks: [logic.COVER_COMPLETE] };
  assert.equal(logic.evaluateBlockerAssist('release', cleared, blank(), 1).view, null);
  const result = logic.evaluateBlockerAssist('release', cleared, observed, 1);
  assert.equal(result.view, 'cleared');
  assert.equal(logic.evaluateBlockerAssist('release', cleared, result.memory, 2).view, null);
  assert.equal(logic.evaluateBlockerAssist('release', { ...cleared, blockingIssues: [{ code: 'TRACK_REQUIRED' }] }, observed, 1).view, 'cleared');
  assert.equal(logic.evaluateBlockerAssist('release', { ...cleared, blockingIssues: [{ code: logic.COVER_BLOCKER }] }, observed, 1).view, 'noticed');
});

test('Not now suppresses for 24 hours; clearance during suppression is quietly consumed', () => {
  const deferred = { observed: true, suppressedUntil: 100 + logic.BLOCKER_SNOOZE_MS };
  assert.equal(logic.evaluateBlockerAssist('release', missing(), deferred, 101).view, null);
  assert.equal(logic.evaluateBlockerAssist('release', missing(), deferred, deferred.suppressedUntil).view, 'noticed');
  const cleared = { ...missing([]), completedChecks: [logic.COVER_COMPLETE] };
  const result = logic.evaluateBlockerAssist('release', cleared, deferred, 101);
  assert.equal(result.view, null);
  assert.equal(result.memory.observed, false);
  assert.equal(logic.evaluateBlockerAssist('release', cleared, result.memory, deferred.suppressedUntil).view, null);
  assert.notEqual(logic.assistStorageKey('a', 'release'), logic.assistStorageKey('b', 'release'));
  assert.notEqual(logic.assistStorageKey('a', 'release'), logic.assistStorageKey('a', 'other'));
  for (const raw of [null, '{broken', '{}', '{"observed":true,"suppressedUntil":"forever"}']) assert.equal(logic.readAssistMemory(raw).observed, false);
});

test('Existing owner-scoped readiness evaluator verifies missing cover and real cover-state change', async () => {
  const schema = buildASTSchema(typeDefs);
  for (const document of [workspaceDocument, readinessDocument]) assert.deepEqual(validate(schema, document), []);
  const owner = { id: 'creator', role: 'creator', creatorStatus: 'active' };
  const release = new ReleaseWorld({ ownerId: owner.id, creativeProfileId: '507f1f77bcf86cd799439011', title: 'Featured', slug: 'featured', isFeatured: true });
  const track = new ReleaseTrack({ ownerId: owner.id, releaseWorldId: release._id, title: 'Demo', slug: 'demo' });
  const original = [ReleaseWorld.findOne, CreativeProfile.findOne, ReleaseTrack.find, ReleaseAsset.findOne];
  let tracks = [track];
  let asset = null;
  ReleaseWorld.findOne = async (filter) => filter.ownerId === owner.id && String(filter._id) === release.id ? release : null;
  CreativeProfile.findOne = async () => ({ _id: release.creativeProfileId, isPublic: false });
  ReleaseTrack.find = () => ({ sort: async () => tracks });
  ReleaseAsset.findOne = () => ({ sort: async () => asset });
  const server = new ApolloServer({ typeDefs, resolvers, context: () => ({ user: owner }) });
  async function inspect() {
    const result = await server.executeOperation({ query: readinessDocument, variables: { releaseWorldId: release.id } });
    assert.equal(result.errors, undefined);
    return result.data.getReleasePublishingReadiness;
  }
  try {
    const initial = await inspect();
    assert.equal(initial.blockingIssues.length, 1);
    assert.equal(initial.blockingIssues[0].code, logic.COVER_BLOCKER);
    const observed = logic.evaluateBlockerAssist(release.id, initial, blank(), 0);
    assert.equal(observed.view, 'noticed');
    tracks = [];
    assert.equal(logic.evaluateBlockerAssist(release.id, await inspect(), observed.memory, 1).view, null);
    tracks = [track];
    assert.equal(logic.evaluateBlockerAssist(release.id, await inspect(), observed.memory, 2).view, 'noticed');
    // Both supported storage paths must clear the evaluator's actual cover condition.
    release.coverArtUrl = 'https://example.com/cover.jpg';
    assert.equal(logic.evaluateBlockerAssist(release.id, await inspect(), observed.memory, 3).view, 'cleared');
    release.coverArtUrl = '';
    asset = { _id: '507f1f77bcf86cd799439012', isPublic: false };
    assert.equal(logic.evaluateBlockerAssist(release.id, await inspect(), observed.memory, 4).view, 'cleared');
    assert.equal(release.visibility, 'private');
    assert.equal(release.status, 'draft');
  } finally {
    await server.stop();
    [ReleaseWorld.findOne, CreativeProfile.findOne, ReleaseTrack.find, ReleaseAsset.findOne] = original;
  }
});
