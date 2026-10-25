# Realm Soundstage V3 — immersive chamber

Base: accepted c097f34, feat/realm-editorial-resonance. Local visual implementation;
no editorial, authentication, storage, database, or real creator data changes.

## Rendering decision and boundaries
A small raw WebGL procedural sphere provides moving material, spherical light and rim
glow. One low-resolution canvas, one shader program, six vertices; no engine, package,
texture downloads, WebGL song hit testing, or additional audio. CSS supplies the vault,
pedestal, reflection-inspired lighting and fallback heart. SVG connects each visible
song to the center. DOM buttons retain artwork, accessible names and normal focus.
This is projected dimensional composition, not a true volumetric scene or free camera.

RealmResonance still owns the shared player, queue, selection, paging/search, seeking,
pills, selected identity/World link, analysis opt-in/capture/status. It passes an energy
and high-frequency sample ref plus callbacks to OrbitStage. No per-frame React state
is used for material/position updates. Existing media-source/CORS and delayed capture
code is untouched. Nexus sampler and all editorial placements remain unchanged.

OrbitStage has no provider/data-fetch/audio/queue dependency. Geometry and WebGL heart
renderer are separate pure/rendering utilities; no speculative node model is introduced.

## Behavior
- At most eight real visible song buttons; complete uncapped parent queue and pills.
- Projected depth and slow 110-second orbital revolution; artwork stays upright.
- Hover, focus-within and pointer interaction hold targets; pause-motion button stops
  authored orbital/material time. Audio intensity can still respond when analysis is
  enabled. Reduced motion freezes authored and measured visual movement entirely.
- Inactive center connections are quiet. Playing song gains measured intensity/width.
  No song-to-song relationships are claimed. Authored atmosphere is labeled separately
  from the opt-in measured spectrum status. Missing measurement means zero response.
- One-song scene retains its heart, chamber and pedestal without phantom songs.
- Mobile 44px targets, bounded two-line labels, full selected title/tooltip, ordered pills.
- Shader unavailable/compile failure/context loss: CSS heart, all controls retained.

## Resource limits
30fps visual update ceiling, 384px desktop / 256px narrow core render target; no DPR
multiplier. No extra GPU draw when material time and measured intensity are unchanged.
Visibility/intersection suspends the stage RAF; teardown removes observers/listeners,
cancels RAF and releases shader/program/buffer resources. Capture teardown stays with
the parent and still closes captured tracks/AudioContext. Audio sampling is separately
bounded at ~30Hz and skips hidden documents. These are code limits, not measured
battery/GPU benchmarks. Shader rendering and authored depth need founder approval.

## Verification (2026-10-25)
- 28 focused frontend tests passed, including real parent queue forwarding, uncapped
  pills, independent sampler contract, geometry bounds, stage callbacks, fallback and
  cleanup; 13 existing backend editorial/sampler/access tests passed.
- TypeScript passed. Changed TS/TSX lint: no errors, one raw img warning (artwork).
- Actual components/provider in isolated fictional browser harness: 1/5/9/30/100 counts,
  several existing Realm palettes, long title/missing artwork, measured tone response,
  song 100 via pills, switch to 99/97, keyboard seeking, MiniPlayer pause, focused target
  stability, 390px overflow-song selection and controls.
- Simulated JS reduced-motion and unsupported capture; explicit no-WebGL fixture.
  Browser navigation exercised teardown; observer/listener/RAF cleanup also unit tested.
- No authenticated staging writes or real media/data tests performed in this pass.
  c097f34 staging acceptance is Christopher-reported prior acceptance, not re-run here.
- Physical touch devices, OS reduced-motion integration, context-loss recovery on real
  hardware, Safari capture support and low-end battery/GPU benchmarks remain manual.
- No production build re-run. Previous isolated build was blocked by fetching Geist /
  Geist Mono from Google Fonts; production build success is not claimed.

## Repeat acceptance
Run `FIXTURE_PORT=4322 node frontend/dev/realm-music/preview.cjs` from repository root.
Use localhost:4322 with existing README paths. Do not stop another server on 4321.
1. Compare full counts 1,5,9,30,100 in the same Realm, then Veil and InterSiddhi.
2. Select last pill; confirm correct orbit page and MiniPlayer identity. Play, seek,
   switch, pause in MiniPlayer. Enable visuals; verify actual measured status.
3. Tab to song objects, Enter/Space. Verify focus freezes targets and remains visible.
   Check pointer settling, manual motion pause and secondary search with all pills intact.
4. Use /mobile?mode=full&count=9&realm=202; scroll/select ninth pill, check transport,
   long labels and MiniPlayer clearance. Repeat on a real touch device.
5. Add &reduced, &fallback, &nogl independently. Verify usable composition/playback and
   truthful status. Also test actual OS reduced motion and background/return behavior.
6. Compare Nexus sampler fixture; production sampler is unchanged. Authenticate staging
   separately for founder review without changing placements or seeding records.

## File inventory
Modified: frontend/src/components/music/RealmResonance.tsx,
frontend/src/components/music/realmResonance.css,
frontend/dev/realm-music/Fixture.tsx, frontend/dev/realm-music/preview.cjs,
frontend/dev/realm-music/README.md, frontend/tests/realmMusicV2.test.cjs.
New: frontend/src/components/music/OrbitStage.tsx,
frontend/src/components/music/orbitStage.css,
frontend/src/lib/orbitStageGeometry.ts, frontend/src/lib/realmHeartRenderer.ts,
frontend/tests/orbitStage.test.cjs, this document.

Stop for Christopher's artistic acceptance. No new Worlds, planets, moons, persisted
artifacts, Intelligence grouping or camera-navigation systems were implemented.
