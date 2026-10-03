const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function load(relative) {
  const file = path.join(__dirname, '../src', relative);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (name) => {
    if (name.endsWith('.css')) return {};
    if (name === '@/lib/worldExperience') return load('lib/worldExperience.ts');
    if (name === './WorldFragment') return load('components/world/WorldFragment.tsx');
    return require(name);
  };
  vm.runInNewContext(`(function(require, module, exports) { ${code}\n })`, { console })(localRequire, module, module.exports);
  return module.exports;
}

const { focusedWorldTrack, fragmentsForTrack, safeWorldLink } = load('lib/worldExperience.ts');
const { getMusicAvailability } = load('lib/musicAvailability.ts');
const WorldSurface = load('components/world/WorldSurface.tsx').default;
const { demoWorld } = load('lib/demo/lowTide.ts');
const { workspaceTourKey } = load('lib/workspaceTour.ts');

test('Missing/stale visual selection falls back safely, without inventing tracks', () => {
  assert.equal(focusedWorldTrack([], 'removed'), null);
  const tracks = [{ id: 'a' }, { id: 'b' }];
  assert.equal(focusedWorldTrack(tracks, 'removed').id, 'a');
  assert.equal(focusedWorldTrack(tracks, 'b').id, 'b');
});

test('Only explicitly public shared or associated fragments enter a destination', () => {
  const fragments = [
    { id: 'shared', isPublic: true },
    { id: 'matching', isPublic: true, connectedTrackSlug: 'song' },
    { id: 'other', isPublic: true, connectedTrackSlug: 'other' },
    { id: 'private', isPublic: false, connectedTrackSlug: 'song', body: 'PRIVATE' },
    { id: 'unspecified' },
  ];
  assert.equal(fragmentsForTrack(fragments, 'song').map((f) => f.id).join(','), 'shared,matching');
  assert.equal(fragmentsForTrack(fragments).map((f) => f.id).join(','), 'shared');
});

test('Fragment links reject executable and protocol-relative URLs', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,hi', '//example.com', '/\\evil.test', 'file:///tmp/file']) {
    assert.equal(safeWorldLink(value), undefined);
  }
  assert.equal(safeWorldLink('/releases/test'), '/releases/test');
  assert.equal(safeWorldLink(' https://example.com/work '), 'https://example.com/work');
});

test('An empty world and an artwork-free single song render without private notes or autoplay', () => {
  const base = { title: 'One song', tracks: [], fragments: [], playingTrackId: null, isPlaying: false, onPlay: () => {} };
  const empty = renderToStaticMarkup(React.createElement(WorldSurface, base));
  assert.match(empty, /This world is still quiet/);
  const track = { id: 'a', slug: 'song', title: 'First song', playable: true, actionLabel: 'Listen', notes: 'PRIVATE STUDIO NOTE' };
  const single = renderToStaticMarkup(React.createElement(WorldSurface, { ...base, tracks: [track] }));
  assert.match(single, /First song/);
  assert.match(single, /Press play to wake this world/);
  assert.doesNotMatch(single, /PRIVATE STUDIO NOTE|<audio|autoplay/i);
});

test('Other-release playback cannot wake this world and locked/preview rules stay canonical', () => {
  const locked = getMusicAvailability({ audioUrl: '/full.wav', playbackStatus: 'locked', visibility: 'public' }, { isCreatorView: false, isSignedIn: false });
  const preview = getMusicAvailability({ audioUrl: '/full.wav', playbackStatus: 'preview', visibility: 'public' }, { isCreatorView: false, isSignedIn: false });
  assert.equal(locked.isPlayable, false);
  assert.equal(preview.isPlayable, false);
  const html = renderToStaticMarkup(React.createElement(WorldSurface, {
    title: 'Locked release', tracks: [{ id: 'a', slug: 'a', title: 'Song', playable: locked.isPlayable, actionLabel: locked.label }],
    fragments: [], playingTrackId: 'another-release', isPlaying: true, onPlay: () => { throw Error('Must not autoplay'); },
  }));
  assert.doesNotMatch(html, /class="world-surface is-awake/);
  assert.match(html, /disabled=""/);
});

test('Tour persistence keys cannot cross signed-in identities', () => {
  assert.notEqual(workspaceTourKey('creator-a'), workspaceTourKey('creator-b'));
  assert.notEqual(workspaceTourKey('a:b'), workspaceTourKey('a%3Ab'));
});

test('Demo media is local, playable PCM and explicitly fictional', () => {
  assert.equal(demoWorld.tracks.length, 2);
  for (const track of demoWorld.tracks) {
    assert.match(track.audioUrl, /^\/demo-world\//);
    const audio = fs.readFileSync(path.join(__dirname, '../public', track.audioUrl));
    assert.equal(audio.toString('ascii', 0, 4), 'RIFF');
    assert.equal(audio.toString('ascii', 8, 12), 'WAVE');
    assert.equal(audio.readUInt16LE(22), 1);
    assert.equal(audio.readUInt32LE(24), 22050);
    assert.equal((audio.length - 44) / (22050 * 2), 24);
    assert.ok(fs.existsSync(path.join(__dirname, '../public', track.artworkUrl)));
  }
});

const { sampleEnvelope } = load('lib/demo/audioEnvelope.ts');
const envelopes = require('../src/lib/demo/audioEnvelopes.json');

test('Demo envelopes match shipped audio and contain meaningful changing energy', () => {
  const crypto = require('node:crypto');
  for (const [name, envelope] of Object.entries(envelopes)) {
    const wav = fs.readFileSync(path.join(__dirname, '../public/demo-world', `${name}.wav`));
    assert.equal(crypto.createHash('sha256').update(wav).digest('hex'), envelope.sha256);
    assert.equal(envelope.duration, 24);
    assert.ok(envelope.step > .12 && envelope.step < .13);
    for (const values of [envelope.energy, envelope.texture]) {
      assert.ok(values.every(v => Number.isFinite(v) && v >= 0 && v <= 1));
      assert.ok(Math.max(...values) - Math.min(...values) > .7);
    }
    // Independently verify an actual PCM RMS ratio, not merely generated metadata.
    const step = Math.round(envelope.step * 22050);
    const rms = index => {
      let sum = 0;
      for (let i = index * step; i < (index + 1) * step; i++) sum += wav.readInt16LE(44 + i * 2) ** 2;
      return Math.sqrt(sum / step);
    };
    assert.ok(Math.abs(rms(20) / rms(50) - envelope.energy[20] / envelope.energy[50]) < .002);
  }
});

test('Audio-derived motion follows seeks, interpolates, and stays quiet without active local playback', () => {
  const envelope = { step: 1, duration: 3, energy: [0, 1, .2], texture: [1, 0, .4] };
  assert.equal(sampleEnvelope(envelope, .5, true).energy, .5);
  assert.equal(sampleEnvelope(envelope, 2, true).energy, .2);
  assert.equal(sampleEnvelope(envelope, 1, true).energy, 1);
  for (const time of [-1, NaN, Infinity, 3, 100]) assert.equal(sampleEnvelope(envelope, time, true).energy, 0);
  assert.equal(sampleEnvelope(envelope, 1, false).energy, 0);
  assert.equal(sampleEnvelope(undefined, 1, true).energy, 0);
  assert.notEqual(sampleEnvelope(envelopes.threshold, 2, true).energy, sampleEnvelope(envelopes.threshold, 6, true).energy);
});

const { isPublicWorld, isPublicJourney, publicDestinations } = load('lib/publicJourney.ts');
test('Quiet public chrome never classifies the Signal Board or Creator workspace as a world', () => {
  for (const route of ['/releases/sirens-in-neverland', '/releases/test/', '/demo/world']) assert.equal(isPublicWorld(route), true);
  for (const route of ['/releases/test/board', '/creator', '/creator/releases/test/publish', '/creator/library', null]) {
    assert.equal(isPublicWorld(route), false);
    assert.equal(isPublicJourney(route), false);
  }
  assert.equal(publicDestinations.find(item => item.label === 'Creator').href, '/creator');
});
