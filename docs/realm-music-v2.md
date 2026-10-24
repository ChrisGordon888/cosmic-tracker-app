# Realm Music V2 — handoff (2026-10-23)

Branch: `feat/realm-editorial-resonance`. Sampler authority checkpoint: `7a956f5`. The following presentation checkpoint is separate. No deployment, production mutation, permission grant or content backfill was performed.

## Contract and diagnosis

Previously Nexus cards drew from standalone Nexus publication, conflating publication with a Realm sampler. The main portal and Nexus now have different explicit sources:

- Main: existing `realmSoundtracks` exact track/World/Realm selection, approved or published submission, live public source and eligible owner. No nine-song cap.
- Sampler: `nexusRealmSamplers` is an ordered subset of the current, anonymously playable main soundtrack, zero through nine per Realm. Empty is intentional. No implicit Canon, Spotlight, standalone publication or World featuring.
- `setNexusRealmSampler(realmId, trackIds, expectedRevision)` requires `nexus.editorial` through existing role/activation checks. Server validates uniqueness, cap, matching Realm and current source eligibility. Global sampler revision prevents concurrent overwrite. Existing bounded placement history records actor, Realm, IDs and replacement-order action.
- `getPublicNexusTracks(samplerOnly:true)` reapplies main eligibility and playback authorization, then returns stored editorial order. `nexusOnly:true` remains independent standalone publication. Both flags together are rejected.
- Main withdrawal/private source/suspended owner removes sampler visibility at read time. Stored sampler IDs are retained, not backfilled. Editors may remove stale entries or clear a sequence; saving a sequence still containing an ineligible ID is rejected. Re-admitting that same source can restore its existing sampler selection: explicitly withdraw it if that is not wanted.

## Presentation

The full Realm uses a single square SVG/canvas coordinate plane. Song centers lie on rings of radius 31 or 39; no connector stems. The Realm orb, subdued nebula gradients, measured waveform/spectrum and energy glow occupy one scene. Selected identity sits inside the stage. Search and pages of eight keep a large main soundtrack navigable, while playback queues the full playable collection. Associated World links retain canonical sharing paths.

Nexus uses compact ordered sampler cards with shared transport, a numbered list and full-Realm navigation; no visualizer per card. Realm identity/colors, progression routes, MusicPlayerProvider and MiniPlayer remain authoritative. No dependencies were added.

## Verification and limits

- Final focused regression runs: 13 backend tests and 36 frontend tests passed. TypeScript (`tsc --noEmit --incremental false`), changed backend syntax and `git diff --check` passed. Earlier sampler-only verification is checkpointed separately.
- Actual components and MusicPlayerProvider browser-tested in an isolated fictional fixture, with locally generated 220/440 Hz WAVs and mocked authentication/Apollo (no telemetry). This is not authenticated staging or database verification.
- Live spectrum on both tracks; switching, pause/resume via MiniPlayer and scene; seeking to 30 seconds reflected in both; 12-song page navigation and song 12 playback; one/two/eight-node composition; 390px iframe and MiniPlayer clearance; compact sampler next-track synchronization.
- Reduced-motion preference was simulated in the fixture; live analysis disabled and static atmosphere retained. Unsupported capture was simulated; explicit fallback appeared while playback continued.
- Browser WebAudio availability/CORS remains media/browser-dependent. No fabricated spectrum; audio routing remains unchanged. Analysis is opt-in and capped near 30fps; existing capture cleanup tests cover delayed track attachment and idempotent disposal.
- Production build attempted in an isolated frontend copy, preserving running-server `.next`. Failed on external `fonts.googleapis.com` DNS fetches for Geist/Geist Mono; not verified production-build success.
- Changed-file lint: no errors; existing Nexus warnings and native artwork `<img>` optimization warnings. Local Node 19/npm 11 compatibility warning also observed; use supported deployment Node.

## Manual staging acceptance (3001 frontend / 4001 backend)

1. Confirm isolated staging MongoDB and existing authorized editorial account. Do not grant new permissions or use real recordings. Start with existing disposable JelloTheMan content; record its current placements before changes.
2. In `/admin/nexus`, approve its eligible public submission and explicitly select its main Fractured Frontier soundtrack. With no sampler selection, `/realms/303` contains it while Nexus shows curated-empty. Confirm no standalone Nexus publish or World feature action occurred.
3. Select **Nexus Realm Sampler**. Reload Nexus signed out: it appears and plays through MiniPlayer. Reload editorial page: selection persists. Review history actor/action/Realm.
4. With additional disposable approved main songs, reorder the sampler; reload and verify numbered order and next/previous playback. One/two tracks are valid. Nine saves; a tenth is disabled and an authorized direct mutation with ten is rejected. Main may contain twelve or more independently.
5. Withdraw sampler only: main still plays. Restore sampler, then withdraw main: both public sampler eligibility and main placement disappear. Restore only the original disposable placements after testing; remove stale sampler IDs explicitly if needed.
6. Confirm private/unapproved/suspended/foreign-Realm inputs cannot be added. A normal creator and reviewer without `nexus.editorial` must fail direct mutation. Two editors with the same revision: second save must fail with reload guidance.
7. Full player: play, pause, seek, next/previous and MiniPlayer switching; enable visuals and verify actual media measurement or honest fallback. Check one/two/many songs, long titles/artwork/World links, search, keyboard focus, 390px and OS reduced motion. No progression or Realm 0 identity changes.
8. Confirm independent Realm discovery, standalone Nexus publication, selected Canon Worlds and Spotlight remain unchanged. Restore disposable placement selections; never delete real content.

## Safe rollback

Keep the two checkpoints separate. To undo presentation later, inspect a clean tree and revert only its checkpoint locally; sampler authority remains. To undo the entire feature, revert presentation first, then `7a956f5`. Reverting code does not delete persisted configuration/history; coordinate any future data cleanup separately. No reset, history rewrite or automatic migration is required.

## Complete file inventory (relative to repository)

Sampler checkpoint:
- backend/lib/realmSampler.js
- backend/models/NexusEditorialConfig.js
- backend/resolvers/index.js
- backend/schemas/index.js
- backend/tests/editorialOperations.test.js
- backend/tests/realmEditorial.test.js
- backend/tests/realmSampler.test.js
- frontend/src/app/nexus/page.tsx
- frontend/src/components/admin/EditorialPlacementControls.tsx
- frontend/src/components/admin/NexusSamplerControls.tsx
- frontend/src/components/music/RealmOrbitCard.tsx
- frontend/src/graphql/realms.ts
- frontend/tests/editorialOperations.test.cjs
- frontend/tests/nexusAdmission.test.cjs
- frontend/tests/realmSampler.test.cjs

Presentation checkpoint:
- frontend/src/app/nexus/page.tsx
- frontend/src/components/music/NexusRealmSampler.tsx
- frontend/src/components/music/nexusRealmSampler.css
- frontend/src/components/music/RealmResonance.tsx
- frontend/src/components/music/realmResonance.css
- frontend/src/components/realm/RealmSoundstage.tsx
- frontend/src/lib/orbitGeometry.ts
- frontend/tests/realmMusicV2.test.cjs
- docs/realm-music-v2.md

## Bounded Nexus orbital restoration — 2026-10-24

Supersedes only the compact text-list sampler presentation described above. `NexusRealmSampler` now adapts the existing `RealmOrbitCard` to the same server-selected ordered sampler, with `preserveOrder`, a sampler-only shared-player queue, five real visible nodes and all song pills. Realm progress is the existing progression percentage, not playback time. The main Realm Resonance player, public Realm order, backend authority, standalone publication and selected Worlds shelf are unchanged. Editorial controls now put Official Soundtrack before Discovery.

Compact controls have explicit selected/disabled states, focus styling, a native Enter link (no nested button), 24px song nodes, reduced-motion CSS and a one-song pill. Zero-data playback is disabled; Nexus retains its existing curated-empty card. The unused text-list stylesheet was removed.

Verification: 21 focused frontend tests and 13 backend regressions passed; TypeScript and diff checks passed. Changed-file lint has zero errors and five existing Nexus warnings. An initial backend test invocation used the wrong working directory; rerunning from backend passed. Isolated production build remains blocked fetching Geist/Geist Mono from Google Fonts (DNS), without touching staging build output. Local Node/npm compatibility warning remains.

Actual components/shared provider were rendered with fictional audio and mocked API/authentication: 0/1/5/9 node/pill states, ninth-song overflow playback, orbital selection, keyboard Play, Enter destination, MiniPlayer pause synchronization, desktop and 390px iframe were inspected. Reduced-motion styling is present and the compact composition has no continuous animation; OS-level reduced-motion acceptance remains manual. No authenticated DB tests or editorial changes were performed.

Manual acceptance: reload staged Nexus, confirm the existing curated order, play an orb and an overflow pill, pause in MiniPlayer, Enter the correct Realm, inspect 390px/keyboard/OS reduced motion, and confirm selected Worlds below remain unchanged. Review the console control order without changing placements. Five nodes are intentionally stable; songs six through nine remain available through pills and the shared queue. Full Realm visual changes are deferred to a separate founder-reviewed pass.

## Targeted correction and scalable foundation — 2026-10-24

Base checkpoint: c183b4c. No editorial contracts or records changed.

### Corrections and evidence
- The prior order correction touched submission review's EditorialPlacementControls.
  The actual `/admin/nexus/editorial` console renders **RealmSelections**; its project
  and stored-placement sections still put discovery first. Both now put soundtrack
  first. Rendered actual component verified with fictional read-only Apollo data;
  an authenticated console reload is still Christopher's acceptance step.
- Full Realm restores every ordered song as an always-visible horizontal pill path.
  Search/results are secondary disclosure. Selecting an overflow song updates the
  bounded orbit page. Queue and transport stay with MusicPlayerProvider. A small
  stage-height reservation prevents lower node labels colliding with selected-song
  identity; long selected titles clamp visually to two lines, with full title tooltip.
- In the in-app Chromium browser, the staging Jello song played but capture produced
  no measurable signal. Read-only public media HEAD: audio/mpeg, byte ranges, ACAO `*`.
  It is a public Blob origin. The shared element had no crossorigin attribute.
  Requesting anonymous CORS **before src assignment**, only for HTTPS public Vercel
  Blob hosts, changed that same song to **Live spectrum · measured audio**. This is
  frontend request mode, not a storage/access-policy change. Other hosts retain their
  delivery mode. No recording, URL, permissions, or uploaded object was changed.
- Unsupported browser, security restriction, no captured track, and suspended audio
  context now have separate safe messages. The original reported generic error may
  also occur in browsers without captureStream; that browser-specific case is not
  claimed fixed. We do not fake a spectrum or reroute audible output through analysis.

### Reproducible foundation
`frontend/dev/realm-music/README.md` documents the localhost-only standalone harness.
It is outside the app/public route trees, production-guarded, uses production player
components with generated tones and mocked non-writing API hooks, and needs no DB.
Sampler counts 0/1/2/3/4/5/9 retain real-count geometry and five-node cap; all ordered
pills remain. Full Realm counts 1/5/9/30/100 retain eight-node cap and uncapped queue.
Same-Realm comparisons, existing color identities, long titles, and 390px frames are
available. No new music, editorial selection or staging records are seeded.

### Visual review gate / proposal only
Current full-stage rings remain an unaccepted interim composition. Do not treat this
foundation checkpoint as artistic acceptance. Next proposed pass, only after review:
- Keep RealmResonance responsible for shared selection, queue, transport and pills.
- Extract a pure OrbitStage receiving bounded visible songs, selected ID, theme and
  measured energy. Retain accessible DOM buttons and one canvas; no new player.
- Use slow intentional orbital motion (roughly one revolution per 90–120 seconds),
  counter-rotate labels, and freeze targets on hover, focus-within or pointer interaction.
  Reduced motion uses the same static geometry with no energy-driven motion.
- Connect only the active song to the central Realm identity; do not draw relationships
  between songs or claim creative meaning from geometry. A radial/audio response is
  measured activity, not evidence of semantic relationships.
- Keep at most 5–8 moving targets regardless of soundtrack length; draw at 30fps only
  during playback/visible document; cancel RAF and close capture on teardown. All
  100 pills may stay DOM (cheap, keyboard reachable); avoid 100 animated nodes, extra
  canvases, Three.js, neural/Tesla effects or per-frame React state.

### Verification / limitations
- Focused frontend: 24 tests passed; backend editorial/sampler/access: 13 passed.
- TypeScript passed; changed TypeScript lint: no errors, existing raw-image warning.
- Browser: actual staging public song measured after scoped CORS fix, pause stills
  visuals. Fictional shared-provider overflow selection, track switching measurement,
  keyboard seeking, MiniPlayer pause; sampler count matrix; full count matrix; 390px
  sampler/full layouts; simulated unsupported/reduced-motion paths.
- No authenticated placement writes, multi-track staging selection, OS preference
  change, Safari capture support, or physical mobile audio testing is claimed.
- Isolated-copy production build remains blocked fetching Geist / Geist Mono from
  fonts.googleapis.com. Staging servers and their build artifacts were not restarted
  or overwritten. Production build success is not claimed.
