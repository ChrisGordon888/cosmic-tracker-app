# COSMIC V3.6 manual development handoff

## Current checkpoint: 2026-10-19 — V3.8/V3.9 connections and experiment memory

Started from clean V3.7 `6a57df2` on `feat/cosmic-intelligence-v3`. No commit, merge, deployment or real catalog mutations. V3.7 scene/camera/Realm layout remains unchanged.

Direct workflow: select A → Connect → select B in scene/lightweight cards/search → Hear connection → Save/Update Path (optional reason) → Experiment with pair. The contextual ConnectionComposer reuses existing Path mutations and shows authored intent separately from supported/ tentative catalog edges. Source support, supplied meaning, Realm and moment counts appear under Why these two. Full lyric citations/reflections remain in the existing Song Lab; measured RMS comparisons remain in experiment transitions. No new audio/model analysis.

CreativeCompass remains the only sequence editor and uses the same shared audition hook. It now saves/resumes up to six ordered songs, optional title/note and timestamps. A small Saved experiments disclosure and saved count in the existing workspace navigation provide return access. New pairs add to the current draft; replacing a dirty draft asks before discarding. Explicit Save persists; Close only hides the editor. Save failures preserve edits. Deletion has a separate confirm/cancel step.

Persistence: new owner-indexed CreativeExperiment is a private draft, never a ReleaseWorld. `myCreativeExperiments`, `saveCreativeExperiment`, `deleteCreativeExperiment` require creator authentication. Save validates every song against current ownership, non-archived/non-vault/test eligibility and Intelligence inclusion. Update/delete filter both draft ID and owner. Missing/hidden/inaccessible tracks are returned as anonymous unavailable slots (no foreign title/ID), while original references remain stored. The editor retains those places and blocks save until restored/reopened or explicitly removed. No catalog/publication writes exist in this service. Ordinary last-write-wins editing; no collaborative conflict resolution or revision history.

Provenance: inferred edges retain existing evidence; unordered Paths retain explicit creator intent; successfully requested auditions have session-local `SESSION_AUDITION` metadata, never preference inference; saved ordered drafts have `CREATOR_SAVED_SEQUENCE`. Audition history is not durable, and nothing claims behavioral learning. V4 can evaluate explicit Paths, sequence intent/order and existing hypothesis feedback without conflating these sources.

Verification: 56-song isolated browser fixture exercised direct search pairing, Path edit/remove/recreate, hearing through the real MiniPlayer, adding C, reorder, save, refresh/reopen, revised save, injected save failure/retry, fixture owner remount, deletion cancellation, and 390px keyboard reorder/save plus direct lightweight pairing. Mobile dock clipping was found and corrected; recheck showed scrollWidth equal to clientWidth. A temporary JSX compilation error during contextual evidence editing was corrected before final checks. Browser persistence is fixture-local storage; production Mongo services are tested with mocks, not a live authenticated database. Missing-track slots/ownership denial are automated service tests, not live account tests. No production build requested/run.

Manual acceptance on a disposable test account:
1. Choose A in Universe; Connect then choose B directly or by search. Hear, save a reason, edit it, remove/recreate the Path.
2. Experiment with pair; add C, reorder, audition and use Next. Save a title/note.
3. Refresh; open Experiments → Saved experiments; reopen, edit and save again.
4. Hide a member from Intelligence, refresh/reopen: unnamed unavailable place survives; save is disabled until restoration/reopen or explicit removal. Confirm Library/project/public state unchanged.
5. Sign out/switch accounts: prior drafts/selection must disappear. Attempts to update/delete another account's draft must fail.
6. At 390px and with keyboard, repeat pairing/save. Check offline save preserves edits; cancel deletion, then delete only a disposable draft.

Remaining limits: real authenticated Mongo round-trip and real-account switching still need manual acceptance; no conflict-resolution/history UI, durable audition log, automatic learning, or expanded lyric/audio comparison panel. Next improvement should follow creator testing of the connection-to-experiment handoff, not change the Universe.

V3.8/V3.9 files:
- `backend/resolvers/index.js`
- `backend/schemas/index.js`
- `frontend/src/app/creator/intelligence/page.tsx`
- `frontend/src/components/intelligence/CreativeCompass.tsx`
- `frontend/src/components/intelligence/IntelligenceWorkbench.tsx`
- `frontend/src/components/intelligence/LivingIntelligence.tsx`
- `frontend/src/components/intelligence/useIntelligenceAudition.ts`
- `frontend/src/graphql/intelligence.ts`
- `frontend/src/styles/intelligenceWorkbench.css`
- `backend/lib/creativeExperiments.js`
- `backend/models/CreativeExperiment.js`
- `backend/tests/creativeExperiments.test.js`
- `frontend/src/components/intelligence/ConnectionComposer.tsx`
- `frontend/src/lib/creativeExperiments.ts`
- `frontend/tests/creativeExperiments.test.cjs`
- This existing handoff document.

## Previous checkpoint: 2026-10-19 — V3.7 Whole Universe

Started from clean committed V3.6 `065a0e2` on `feat/cosmic-intelligence-v3`. All changes remain uncommitted. No real catalog mutations, new dependencies, model calls, publishing changes or player replacement.

Universe is now the default without an arbitrary selected song. Valid `?song=ID` / `?trackId=ID` and `?realm=ID` / `?realm=unassigned` retain intentional navigation. All eligible, non-hidden nodes coexist in every 3D view; Realm selection changes camera framing and emphasis, not membership. Six unequal anchors/spreads live in `frontend/src/lib/universeLayout.ts`; adjust this file for later art direction. Track-ID hashing keeps positions stable across selection, refresh and hide/restore. Realm 0 and the neutral unassigned holding area are distinct.

Collection inclusion reuses owner-scoped CreativeDirection preferences under `inclusion:<trackId>` with value `HIDDEN`. New `myIntelligenceHiddenTrackIds` query and `setIntelligenceInclusion` mutation require a creator. Both hide and restore prove track ownership. Ordinary creative-direction list/reset exclude this namespace. No ReleaseTrack writes occur. Manage collection restores hidden songs; active analysis and server related-song candidate queries omit hidden IDs. Explicit Library/Song Lab access remains available.

V3.7 verification: 51 frontend tests, 12 backend tests, TypeScript, changed-file lint and backend syntax pass; lint retains one image-optimization warning plus tool/workspace warnings. Browser fixture expanded to 56 fictional songs (eight in each Realm plus eight unassigned), actual shared player and a cross-Realm authored Path. Verified default Universe, 56 mounted song objects, orbit/zoom, Realm 0 versus unassigned, selection, Hear together and next-track handoff, hide → refresh (55) → restore (56), and 390px lightweight Realm/song/back navigation with no horizontal document overflow. Browser inclusion persistence uses fixture-only owner-keyed localStorage; production Mongo persistence is service-tested with mocks, not against a real account/database. No FPS benchmark or production build was run for this pass.

Next manual improvement: tune anchor spread and distance-based artwork/title sizing against the creator's real collection. At full-Universe distance records are deliberately small, and overlapping labels are culled; zoom/Realm focus/search reveals details. Keep all nodes and the renderer lifecycle intact.

### V3.7 file inventory

- `backend/lib/creativeDirection.js`
- `backend/lib/songReasoning.js`
- `backend/models/CreativeDirection.js`
- `backend/resolvers/index.js`
- `backend/schemas/index.js`
- `backend/tests/groundedReasoning.test.js`
- `frontend/src/app/creator/intelligence/page.tsx`
- `frontend/src/components/intelligence/IntelligenceWorkbench.tsx`
- `frontend/src/components/intelligence/LivingIntelligence.tsx`
- `frontend/src/components/intelligence/UniverseScene.tsx`
- `frontend/src/graphql/intelligence.ts`
- `frontend/src/lib/intelligenceWorkbench.ts`
- `frontend/src/lib/livingUniverse.ts`
- `frontend/src/styles/intelligenceWorkbench.css`
- `frontend/tests/livingUniverse.test.cjs`
- `backend/lib/intelligenceCollection.js`
- `backend/tests/intelligenceCollection.test.js`
- `frontend/src/components/intelligence/IntelligenceCollection.tsx`
- `frontend/src/lib/intelligenceNavigation.ts`
- `frontend/src/lib/universeLayout.ts`
- This existing handoff document.

### Historical V3.6 checkpoint (superseded where noted above)

## Checkpoint: 2026-10-18 — final weekly pass

Branch: `feat/cosmic-intelligence-v3`. Nothing committed, merged or deployed in this pass. The starting tree already contained 17 modified tracked files and extensive untracked V3.3–V3.6 source, tests, documentation and approved environment media. Preserve all of it. `git status --short` is the authoritative current inventory; untracked does not mean disposable.

Manual Patch 01 is preserved: toolbar below the scene, compact contextual dock, deeper information in disclosure. The weekly pass adds true orbit/zoom, stable 3D Realm neighborhoods, physical song emergence, wider camera return, visible/selectable relationship geometry and transient-search dismissal. No backend, media, Realm configuration, publishing, player or experiment contracts changed.

This pass changed exactly:
- `frontend/src/components/intelligence/UniverseScene.tsx`
- `frontend/src/components/intelligence/LivingIntelligence.tsx`
- `frontend/src/lib/livingUniverse.ts`
- `frontend/src/styles/intelligenceWorkbench.css`
- `frontend/tests/livingUniverse.test.cjs`
- this handoff document.

Before-patch copies of the five implementation/test/style files are in `/tmp/cosmic-v36-weekly-before/`. This is temporary local backup storage, not a durable checkpoint.

## Share these first / minimal refinement inventory

Paths below are relative to the repository root. Share this document and these four files first:

1. `frontend/src/components/intelligence/LivingIntelligence.tsx` — navigation, search, selected connection, inspector, environment and scene composition.
2. `frontend/src/lib/livingUniverse.ts` — pure scene model, membership, positioning, pagination and relationship selection.
3. `frontend/src/components/intelligence/UniverseScene.tsx` — Three.js objects, camera, paths, hit testing and rendering.
4. `frontend/src/styles/intelligenceWorkbench.css` — stage, overlays, labels, controls and responsive rules. Later Stage A/B blocks intentionally override older rules; inspect the cascade before editing.

Supporting files, only when the patch needs them:

- `frontend/src/components/intelligence/ImpossibleEnvironment.tsx`: video/poster lifecycle.
- `frontend/src/components/intelligence/IntelligenceWorkbench.tsx`: authoritative UI song selection and desk/experiment integration.
- `frontend/src/components/intelligence/CreatorPaths.tsx`: authored connection editing.
- `frontend/src/components/intelligence/CreativeCompass.tsx`: session experiment sequence and direction feedback.
- `frontend/src/components/intelligence/useIntelligenceAudition.ts` and `frontend/src/lib/creativeAudition.ts`: authorized source resolution and shared playback.
- `frontend/src/app/creator/intelligence/page.tsx`: authenticated owner boundary, queries and mutation callbacks.
- `frontend/src/graphql/intelligence.ts`: existing operation contracts.
- `frontend/src/lib/intelligenceWorkbench.ts`: underlying analysis; presentation changes must not rewrite its evidence logic.
- `frontend/src/lib/musicRegistry.ts`: authoritative Realm names/colors, including ID 0.
- `frontend/tests/livingUniverse.test.cjs`: scene membership, density, owner-eligible inputs, Realm zero, paging and nonmutation regressions.
- `frontend/public/intelligence/escher_cosmic_loop.mp4` and `escher-poster.jpg`: approved visual assets, not required when reviewing code alone.

## Hierarchy and state

`creator/intelligence/page.tsx` → owner-keyed `IntelligenceWorkbench` → `LivingIntelligence` → `ImpossibleEnvironment` + dynamically loaded `UniverseScene` (or lightweight cards) + connection inspector / `CreatorPaths`.

Workbench also retains the optional deeper desk, Song Lab and `CreativeCompass`. A shape/try callback seeds an existing session experiment; it does not change project membership.

Workbench owns the selected song ID. LivingIntelligence owns `UniverseView`, search, motion/fallback and selected connection. A Song view retains its originating Realm/Universe page in `view.context`; the Back button restores it. Search and record selection close transient results. Escape closes search, connection and Path editor; clicking outside search closes results. Inspect and Experiment reuse the existing deeper workspace; Connect still uses the existing Path editor below the scene rather than adding another relationship form.

`livingUniverse` computes owner-eligible scene data only. V3.7 retains every eligible node in all 3D modes; Song mode emphasizes selected/connected records while keeping the surrounding collection. Realm 0 remains explicitly valid; unassigned songs have a separate neutral neighborhood. Search matches title substrings and shows up to eight results with project/Realm context.

## Scene and camera ownership

UniverseScene owns a single renderer/camera/OrbitControls per mount. `current` receives fresh props. `reconcile()` adds/removes records and updates path resources; changing selection does not destroy the renderer or camera. `draw(time)` reads current selection/scale, transitions objects and camera, updates curves/labels and renders. Cleanup disposes all owned resources and observers. Lightweight mode intentionally unmounts Three.js; returning from lightweight creates a new camera session.

Orbit has full azimuth, bounded polar angle (.3 to PI-.3), no panning, and zoom distance 9–110. Drag/zoom cancels an automatic camera transition. `cameras` stores wider-view position/target by context key (scale, Realm). Entering Song saves the outgoing wider camera; Back restores it. Reframe deliberately fits the current context again. There is no database/local-storage camera persistence. Resizing updates aspect, not the user's angle; use Reframe after a large viewport change.

Selected records move four world units toward the viewing direction plus .8 elevation, grow to 1.7×, and gain their existing Realm halo. Camera focuses at distance 25. Other records keep their base coordinates. Returning interpolates the record home and restores the wider camera. Reduced/paused motion applies final transforms immediately and disables highlight animation. User orbit is still available because it is deliberate input.

## Placement and relationship geometry

`songPosition()` in `universeLayout.ts` hashes immutable track ID with avalanche mixing, giving stable offsets around authoritative Realm centers. X/Y/Z all vary. Positions do not depend on selected song or page order. These are navigation coordinates, NOT measured acoustic distance or creative confidence. Realm configuration itself is unchanged.

Broad views select up to 12 supported edges with a maximum degree of three per node; Song view prioritizes edges incident to selection. Up to six authored Paths are added, suppressing duplicate inferred lines for a pair. All endpoints must be in the eligible visible model.

QuadraticBezierCurve3 paths track the actual moving record positions. Curves call `updateArcLengths()` before rebuilding TubeGeometry; omitting that invalidates moving geometry. Authored tubes are white (.085 radius); strong supported tubes .065; tentative .03. Opacity and labels also distinguish these classes. Authored intention is not a claim of measured strength. Invisible line hit targets use a .45 world-unit raycast tolerance; visible DOM connection buttons are the keyboard alternative. At most two active highlights move, for five seconds. Label projection suppresses colliding secondary labels and tries three positions along a path while avoiding record faces; search remains available for hidden titles.

Adjust appearance safely in this order: CSS dock/toolbar spacing → pure position/radius constants with tests → camera distances and movement coefficients → curve thickness/labels. Preserve disposal, owner-filtered inputs, source callbacks, motion checks and stable IDs. Do not infer relationships from proximity.

## Environment

The original eight-second portrait MP4 is unchanged; source SHA256:
`1ec093b5a382f99e8287b03d66929231aa82c49efe7f6b5339b9b41b0bbc1d0a`.

CSS crops it to the whole stage with `object-fit: cover`, soft opacity and gradients. Do not restore the rejected portrait-poster plus side-column layout.

ImpossibleEnvironment sets defaultPlaybackRate/playbackRate to 1, muted/playsInline/loop. After first playback the video stays mounted while paused, hidden behind the poster, retaining currentTime. Initial reduced-motion/lightweight mode can stay poster-only. Visibility and intersection observers suspend playback. Playback failure retains the poster. Original first/last frames were inspected; they are close, but perfect frame-level seamlessness is not guaranteed. No artificial speed increase was found.

## Playback and persistence boundaries

`useIntelligenceAudition` fetches fresh `SONG_LAB_SOURCE` per song, uses `creativeAudition` authorization/source checks and a cancellation token, then invokes MusicPlayerProvider's existing queue. Do not add another audio element/player or coerce missing Realm to 0. Scene selection itself need not interrupt currently playing music; explicit audition updates the shared queue.

Existing operations in `graphql/intelligence.ts`: `INTELLIGENCE_SOURCES`, `SONG_LAB_SOURCE`, `SAVE_CREATIVE_PATH`, `REMOVE_CREATIVE_PATH`, `SAVE_CREATIVE_DIRECTION`, `RESET_CREATIVE_DIRECTIONS`. Paths use `myCreativePaths`, `saveCreativePath(input)`, `removeCreativePath(id)`. Directions/preferences remain separate from authored Paths and existing hypothesis feedback.

Backend reference files: `backend/models/CreativePath.js`, `backend/lib/creativePaths.js`, existing schemas/resolvers. Owner authorization, eligible endpoints, normalized undirected pair and uniqueness protection remain authoritative. Browser fixtures do not prove database persistence. Session experiments are not saved projects. There is no new persistent hide/archive preference in Stage B.

## Validation at this checkpoint

Passed: 49 focused frontend tests, TypeScript, changed-file lint (existing img warning remains), `git diff --check`. No backend behavior changed in Stage B, so backend tests were not rerun. No production build performed in this bounded pass.

From `frontend`:

```sh
node --test tests/livingUniverse.test.cjs tests/creativeCompass.test.cjs tests/audioFeatures.test.cjs tests/intelligenceWorkbench.test.cjs tests/catalogIntelligence.test.cjs tests/creativeFingerprint.test.cjs
./node_modules/.bin/tsc --noEmit --incremental false
./node_modules/.bin/next lint --file src/components/intelligence/UniverseScene.tsx --file src/components/intelligence/LivingIntelligence.tsx --file src/lib/livingUniverse.ts
```

From root:

```sh
git diff --check
# Only if changing these backend behaviors:
node --test backend/tests/creativePaths.test.js backend/tests/creativeDirection.test.js
```

Browser acceptance used `/tmp/cosmic-weekly-fixture` on localhost:3107: actual Workbench, Creator rail, MiniPlayer, MusicPlayerProvider and audition hook, 12 fictional songs and generated tone audio. Apollo responses and Path writes are mocked/in memory. No real account/catalog mutation or live database check occurred. Temporary fixture setup required correcting its auth refetch and mocked telemetry response; these were fixture defects, not product changes.

Verified: Universe drag/orbit and wheel zoom; InterSiddhi → Return Address focus; visible catalog connections and paired playback; Back to Realm; disposable Return Address ↔ Little Orbit Path with custom meaning; scene Path audition; session-only experiment with those songs; 390px lightweight cards/search/actions and shared MiniPlayer; keyboard result activation; paused video at rate 1; simulated reduced-motion media preference (poster only, disabled motion control, immediate scene transitions). Real OS/device reduced-motion checks remain recommended. Final fixture screenshot: `/tmp/cosmic-v36-weekly-focus.png`.

Limitations / outstanding visual constraints:
- Close zoom and oblique orbit can overlap or clip records; Reframe and search recover navigation. Labels hide when colliding rather than displacing objects.
- Focus retains context, but some distant neighbors can lie outside the focused framing. This is a navigable 3D view, not a guarantee every node is always visible.
- No artwork-heavy large real catalog GPU benchmark, real-auth Mongo persistence verification or production build this pass.
- Path creation and deeper experiments still use their existing panels; no new inline editor/sequence system was built.
- No new backend behavior or dependencies; no backend tests needed for this frontend-only pass.

## Safe edit sequence and dependencies

1. Make a file backup; adjust CSS spacing only, check desktop and 390px.
2. For density/placement, edit livingUniverse + its test together. Both LivingIntelligence and UniverseScene consume its inferred return type.
3. For geometry/camera, edit UniverseScene; preserve cleanup, context fallback, labels and motion behavior.
4. For navigation/search, edit LivingIntelligence; preserve parent-owned selection and callback contracts.
5. For media behavior, edit ImpossibleEnvironment; retest pause, reduced-motion, offscreen and denied playback.
6. Only then touch Workbench/CreativeCompass/CreatorPaths when necessary. Player/auth/GraphQL/backend are outside routine frontend polish.

Change one concern at a time. Request complete replacement files only when needed; otherwise use small patches against the exact current file. Never apply a patch based on an older handoff's source snapshot.

## Safe rollback

HEAD is NOT the current accepted dirty baseline. Do not use reset, checkout, restore, clean or stash as a rollback shortcut. Before each manual patch, copy the exact target file to a dated backup outside the repository (preserve relative paths). Restore only that pre-patch copy if the patch fails. New files should be backed up too. `git diff --binary` captures tracked changes only, not untracked files; it is not a complete backup. A selected-source ZIP is a sharing snapshot, not a whole-repository backup. Never extract it over the working tree indiscriminately.

## Real-data manual acceptance (no destructive setup)

1. Sign in as the existing creator; open Intelligence. Confirm only authorized eligible songs appear and existing Creator shell remains.
2. Visit each Realm, especially InterSiddhi (0); verify titles against Library. An empty Realm should be honest, not filled with unassigned songs.
3. Orbit the complete Universe; search a distinctive title; Tab to its result and Enter. Confirm focused record plus meaningful neighbors and quieter page context.
4. Select a supported line and an authored Path; inspect their different meanings. Audition the pair and verify MiniPlayer title/order/actual Realm. Pause via the shared player.
5. If desired, explicitly create a disposable authored Path with a harmless note, reload to verify persistence, then remove only that test Path. Do not modify real projects or publication states. Check existing direction feedback separately.
6. Try a pair in the session experiment; ensure Library/project order is unchanged.
7. Pause/resume environment and enable OS reduced motion. Check mobile 390px, desktop, and lightweight mode. Search, listening and rail/player should remain reachable without horizontal overflow.
8. Verify empty/minimal catalog and failed artwork/video use safe fallbacks. Do not remove real songs to create this state; use fixtures.

Next manual patch: inspect a dense real Realm with artwork, then tune only label collision spacing and camera fit constants in UniverseScene. Keep the stable coordinates and shared player contracts intact; use Reframe after orbit/zoom. Review desktop and 390px before accepting the patch.
