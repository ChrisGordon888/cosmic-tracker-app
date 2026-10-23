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
