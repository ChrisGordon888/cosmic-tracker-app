# COSMIC V3.4 — Creative Compass + Living Constellation

## Baseline and scope

Branch: `feat/cosmic-intelligence-v3`. The supplied V3.3 implementation was still uncommitted at the start, rather than a Git checkpoint. It was preserved. This document identifies V3.4 additions separately. No commit, merge, deployment, real-catalog write or real-audio analysis was performed.

## First 30 seconds

The prior surface required inspecting a relationship, selecting its song and opening Song Lab before audition. Creative Compass now defaults to a song on the strongest available supported relationship (or an honest sparse result), shows one recurring signature thread, and offers immediate Listen / Connect / Shape actions. Two additional signature categories, limitations, more observations, project mechanics and feedback history remain in contextual depth. No enrichment is required.

Desktop uses a signature / song pairing composition. Mobile stacks the same content; it requires scrolling but not opening multiple tools. Pairing is one audition action, and its explanation is visible. Existing COSMIC Read, context, lyrics, moments, audio measurement, hypotheses and project evidence remain available below.

## Signature and direction

Initial signature is intentionally conservative: a known explicit creator tag must recur on at least three distinct eligible owned tracks. At most three categories are represented; one thread appears by default. Supporting songs can be inspected or auditioned. This describes repeated supplied signals, not uniqueness, vocal technique or production style. Lyrics and context remain inspectable but are not promoted into signature claims by keyword matching. Audio does not establish identity.

Emerging direction currently means a creator-stated aspiration toward a song example. Edit timestamps are not treated as evidence that an artistic direction is new.

CreativeDirection is a separate owner-scoped preference record, unique by owner + target. It deliberately does not overload RESONATES / INTERESTING / NOT_REALLY hypothesis usefulness feedback.

- ME: “This feels like me.” Adds .12 in Recognize, .04 otherwise.
- ASPIRE: “I want to explore this direction.” Adds .03 in Recognize, .12 otherwise.
- NOT_NOW: “Not where I’m going.” Subtracts .08 from this example only; does not remove it or suppress its tags.
- STRETCH additionally adds .06 to already meaningful, non-strong relationships.

All candidates must first pass the existing relationship threshold. Maximum positive adjustment is .18. Stable ID tie-breaking preserves reproducibility. Preferences can be changed, individually cleared or reset; no fingerprints, meaning, Realm or membership updates occur. Unknown / deleted song preferences remain clearable.

A separate optional contrast compares at least three differing explicit tags on sufficiently tagged songs. Copy calls this vocabulary contrast, never sonic similarity. Audio level differences remain supporting transition evidence, not a similarity score.

## Pairing and World Seed

The shared MusicPlayerProvider is reused. Every queue member is resolved through the existing owner-authorized Song Lab query immediately before playback. All sources must resolve before queue replacement; failure does not silently play a partial sequence. Latest Compass/map request wins within this shared audition hook. Actual child Realm is preserved, including 0 and null.

A World Seed is session-local React state, scoped by the owner's mounted Workbench. It holds at most six unique eligible track references, supports add/remove/reorder and ordered audition. It does not create a ReleaseWorld or mutate any track. Refresh/navigation clears the idea; the UI says so. Closing the experiment preserves it within the current mounted page; Discard clears the idea. Playback may continue through the existing queue. Existing shuffle/continuous settings apply and are not silently changed.

Transition depth reuses catalog relationships and creator-authored end/start context. Where both current profiles exist, it shows the measured RMS difference. “Hear the change” routes existing audio candidates into the existing Song Lab seek path. No new acoustic algorithms or audio/model calls were added.

Future persistence boundary: owner + bounded ordered track IDs + optional name, revalidated on every load/audition. No persistence model for seeds was added in V3.4.

## Spatial technology decision

- ADD: an enhanced existing React Flow 2D prototype with CSS perspective, cover artwork or monogram objects, blue/silver depth, Realm neighborhoods, project-adjacent ordering and project labels, supported relationship lines, selected-neighborhood camera framing and direct audition.
- DEFER Three.js / React Three Fiber: no capability here requires a WebGL renderer; it would add bundle/runtime and a second interaction/accessibility implementation.
- DEFER hybrid WebGL: CSS depth preserves native controls without a second render pipeline.

This is 2D with dimensional styling, not a 3D engine or physical simulation. Layout is categorical and deterministic, not acoustic distance. Line strength retains the existing relationship evidence. Project grouping is within Realm neighborhoods, not a separate force-directed project simulation.

React Flow remains lazy loaded and bounded to 80 nodes / three displayed edges per node. On <=640px, no canvas mounts and song buttons provide the same selected state and listening actions. Desktop also retains the accessible list. CSS and camera transitions honor reduced motion. No constant particles, new animation package, or runtime dependency was added.

## Safety

New preference resolvers require Creator access. Neither reads nor mutations accept an owner ID; authenticated identity supplies it. Non-orientation preference writes require an owned current non-Vault/non-test/non-archived track. Reset only deletes the caller's preferences. Analysis and seed admission reuse the current owner-filtered source contract. Real source authorization is checked again at audition time.

No publishing, Canon, Nexus, ReleaseWorld membership, player engine or telemetry behavior was changed. Existing SIN restoration documentation was used as the read-only structural reference; SIN was not live queried or re-audited. Fictional six-track data supplied browser mutations and playback.

## Validation and acceptance

- 44 focused frontend tests: signature thresholds, bounded preference ranking/reset behavior, sparse/owner/Vault exclusions, seed order/limits/non-mutation, authorized complete-queue resolution, Realm 0/null, existing audio/workbench/catalog/fingerprint regressions.
- 46 focused backend tests: preference validation/ownership/edit/clear/reset/authentication, every Intelligence GraphQL document against actual schema, inherited audio/reasoning/context/public Canon/project/access regressions.
- TypeScript, changed-file lint, backend syntax and whitespace checks. Lint has two native-image optimization advisories; artwork intentionally uses existing source URLs without adding an optimizer/source policy.
- Browser: pairing -> shared queue -> Next; reorder -> changed queue order; aspiration -> changed subsequent supported pairing with explanation; graph select -> same inspector -> shared playback; 390px pairing and keyboard fallback; no horizontal overflow; canvas absent at 390px.
- Generated fictional WAV only. Preview GraphQL is in-memory: no real backend/database/model calls. Fixture telemetry is mocked, not sent to a real endpoint.
- Real MongoDB preference reload persistence, multiple actual accounts, external media codec/CORS, OS reduced-motion toggle, and representative large-catalog hardware performance remain manual acceptance. No production build was requested/run in this pass.

## Manual acceptance

1. Restart backend/frontend for the new GraphQL fields. Open Intelligence; verify the first song has an immediate supported connection or honest limited result.
2. Inspect a signature's examples. Audition one; verify the global player and actual Realm.
3. Mark a disposable example as an aspiration, return to a related song and inspect the bounded ranking explanation. Reload to check persisted preference. Clear/reset and confirm original ranking returns.
4. Hear a pairing, use Next, then create a session World Seed. Add, reorder and remove tracks; audition and inspect transition evidence. Confirm original Library/project order is unchanged. Reload: the seed is gone.
5. Select graph nodes, audition, inspect a relationship and follow Pair / shape. Test 390px fallback and keyboard navigation. Enable OS reduced motion and repeat.
6. Test an inaccessible source and a second creator account. No partial queue or foreign preference/profile should appear.
7. Regression-check SIN, public Worlds, Nexus selection and existing player controls; no catalog mutation is needed.

## V3.4 file inventory

New:
- backend/models/CreativeDirection.js
- backend/lib/creativeDirection.js
- backend/tests/creativeDirection.test.js
- frontend/src/lib/creativeCompass.ts
- frontend/src/lib/creativeAudition.ts
- frontend/src/components/intelligence/CreativeCompass.tsx
- frontend/src/components/intelligence/useIntelligenceAudition.ts
- frontend/tests/creativeCompass.test.cjs
- docs/creative-intelligence-v3.4.md

Extended (some already contained uncommitted V3.3 work):
- backend/schemas/index.js
- backend/resolvers/index.js
- frontend/src/graphql/intelligence.ts
- frontend/src/app/creator/intelligence/page.tsx
- frontend/src/lib/intelligenceWorkbench.ts
- frontend/src/components/intelligence/IntelligenceWorkbench.tsx
- frontend/src/components/intelligence/Constellation.tsx
- frontend/src/components/intelligence/CosmicRead.tsx
- frontend/src/styles/intelligenceWorkbench.css

## Continuation boundary

Implementation is complete for the bounded V3.4 prototype. Optional saved seeds, true 3D, sonic similarity, lyrical/acoustic identity inference and additional polish are deferred. Continue with manual acceptance of this worktree, not a fresh implementation. Do not commit, merge, deploy or begin V3.5 automatically.
