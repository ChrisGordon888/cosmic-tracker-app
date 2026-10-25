# Realm Soundstage V3.2 — founder review checkpoint

Base: d3454dd on feat/realm-editorial-resonance. Frontend-only evolution.

## Interaction and rendering
- Pointer horizontal movement beyond 7px and greater than vertical movement begins
  a drag; capture is acquired only then. A stage-width drag turns one full revolution.
  Drag-generated clicks are suppressed. Vertical touch scrolling uses touch-action pan-y.
- Unrestricted accumulated angle; 30-degree arrow clicks and 1.1 rad/s hold after 250ms.
  Release/cancel/lost capture/blur/hidden document/unmount stop continuous input.
- Center eases to the nearest equivalent multiple of 2π, immediately in reduced motion.
  Direct input leaves the chosen orientation in place. No inertia or automatic recenter.
- Before direct manipulation, idle motion completes a revolution in approximately 65s.
  Hover/focus settle targets. Motion control pauses authored material/ambient motion;
  measured response remains opt-in. Reduced motion disables both automatic responses.
- Rodrigues rotation around a fixed tilted axis gives actual projected z, perspective,
  scale, opacity and stacking. Camera stays fixed; artwork remains upright. This is
  projected 3D geometry with DOM targets, not a new WebGL world or physics engine.
- Existing small procedural WebGL heart and SVG measured center connections retained.
  Realm name lives inside the protected core footprint to avoid rotating-label overlap.
  At most eight actual song targets; parent queue, pills and search remain uncapped.

## Atmosphere and hierarchy
RealmSoundstage previously added a Realm-scoped glass-card (including blur and dark
panel background) around the already dark RealmResonance surface. The outer card is
now a transparent shell. Inner background alpha is reduced to 27–44%; pedestal is
luminous/translucent. No page-wide video or overlay setting changed. The public page
hero and descriptive intro remain; duplicated Soundstage/Realm heading is removed.
Official Realm Soundtrack label and core identity remain. No editorial semantics changed.
Fixture has an explicitly fictional colored gradient behind actual production music
components to make transparency observable; it does not reproduce the live Realm video.

## Verification (2026-10-25)
- 30 focused frontend tests pass; TypeScript passes; changed-file lint has zero errors
  and one existing raw artwork img warning; git diff --check passes.
- Browser: 1/5/9/30/100, three Realm themes, measured local tones, switching, keyboard
  seek, shared MiniPlayer identity, mobile ninth-pill selection, all 100 ordered pills.
- Browser: song-start drag leaves playback unchanged; next click plays; 25 keyboard
  arrow increments (>2 revolutions), hold/release with stable final position, Center.
- 390px iframe visual/drag check, simulated reduced motion and CSS fallback playback,
  unavailable capture produces truthful explanation. Unit tests cover horizontal vs
  vertical threshold, click suppression, geometry periodicity/depth, fallback/cleanup.
- New fixture bundle timestamp/hash was checked. Port 4321 is historically stale and
  was not stopped; own fresh 4322 server was used. No authenticated records were used.
- No production build rerun; earlier build encountered Google Fonts Geist/Geist Mono
  fetch failure. Production build success is not claimed.

## Limits and manual acceptance
30fps stage ceiling, 384px desktop/256px mobile core, no new renderer/dependency/audio.
No low-end device GPU/battery benchmark, physical touchscreen or actual OS reduced-
motion test in this pass. Hardware WebGL context-loss/recovery remains manual.
Public animated-video contrast and final artistic quality require founder staging
review. Fixtures cannot establish authenticated database or live-media acceptance.

Run from repo root: FIXTURE_PORT=4322 node frontend/dev/realm-music/preview.cjs.
Open /?mode=full&count=5&realm=303 and /mobile?mode=full&count=9&realm=202.
Restart only your owned fixture process after edits; it bundles once at startup.
Compare all count links; drag in both directions; hold arrows; Center; click songs;
select last pill; seek; pause in MiniPlayer; enable live visuals. Repeat with &reduced,
&nogl, &fallback, then actual OS reduced motion and a real touch device. Review the
actual public Realm without changing selections or records. Nexus is unchanged.

No backend, GraphQL, data, permissions, commerce, Nexus or deployment modifications.
Stop for Christopher's artistic acceptance. Safe rollback is a revert of this isolated
checkpoint; d3454dd remains the preceding visual checkpoint.
