# V3.6 — Impossible Universe

Branch: feat/cosmic-intelligence-v3. Earlier uncommitted V3.3–V3.5 work preserved. No commit, merge or deployment.

## Composition

The approved original eight-second 768×960 video is copied byte-for-byte to public/intelligence/escher_cosmic_loop.mp4 (3.4 MB). A JPEG of its initial frame supports still presentation. First and 7.9-second frames were inspected and appear closely matched; browser playback showed no obvious loop discontinuity. This is not a guarantee of a mathematically seamless loop.

The portrait installation stays contained, monochrome and unstretched. A bounded 12-song scene frames it; selected supported neighbors and authored connections can enter that window. Wide screens place selected-song/discovery controls alongside the installation. Narrow screens use a still plus accessible song cards. The normal desktop 2D-map toggle is removed from the primary surface; existing deeper map access is retained.

Realm names, IDs and colors come from existing musicRegistry constants. Borders/halos and the six-Realm legend preserve identity, including Realm 0 vs unassigned. No lore, taxonomy, Realm assignment or project membership changes. The arrangement is a presentation, not a map of acoustic distances. Existing project information remains in the inspector.

Supported paths use Realm accents and comparable existing evidence strength. Authored paths are explicitly labeled white connections; duplicate underlying inferred lines are suppressed. Selectable path labels explain provenance and support audition / experiment handoff. Hypotheses retain their existing textual disclosure rather than gaining invented spatial certainty. No project/experiment lines are manufactured.

## Creator Paths

Private CreativePath collection, owner + normalized unordered pair unique index. Query myCreativePaths; mutations saveCreativePath and removeCreativePath. Creator authorization uses existing requireCreator. Both tracks must be current and owned, not archived/Vault/test. Reads also filter inaccessible endpoints. Notes are trimmed, max 1000 characters. Self/invalid IDs and extra input fields are rejected. Reversing endpoints updates the same pair. Delete is owner-scoped and touches only the Path.

UI: select song → Connect a song → choose another → optional note → Save Path. Inspect/edit/remove, audition through the existing authorized MusicPlayerProvider, or open the existing experiment. Authored intention is never represented as an acoustic claim. Song records are not modified.

Saved experiments and exploration-only hide/preferences are deferred. Experiments remain explicitly session-local. Missing-Realm records link to existing Library review; no unassigned songs are presumed unwanted and no automatic hiding/archive occurs. A follow-up could add an owner-scoped exploration preference, entirely separate from publication, if review proves necessary.

## Files in this pass

New:
- backend/models/CreativePath.js
- backend/lib/creativePaths.js
- backend/tests/creativePaths.test.js
- frontend/src/components/intelligence/CreatorPaths.tsx
- frontend/src/components/intelligence/ImpossibleEnvironment.tsx
- frontend/public/intelligence/escher_cosmic_loop.mp4
- frontend/public/intelligence/escher-poster.jpg
- docs/creative-intelligence-v3.6.md

Updated (some were already uncommitted before this pass):
- backend/schemas/index.js
- backend/resolvers/index.js
- frontend/src/graphql/intelligence.ts
- frontend/src/app/creator/intelligence/page.tsx
- frontend/src/components/intelligence/IntelligenceWorkbench.tsx
- frontend/src/components/intelligence/LivingIntelligence.tsx
- frontend/src/components/intelligence/UniverseScene.tsx
- frontend/src/lib/livingUniverse.ts
- frontend/src/styles/intelligenceWorkbench.css
- frontend/tests/livingUniverse.test.cjs

No packages added in V3.6. Earlier Three.js package changes belong to V3.5.

## Verification

47 focused frontend tests passed; five backend tests passed including schema/document validation, owner isolation, invalid/self IDs, eligibility filters, normalized pair updates and deletion. TypeScript, backend syntax and git diff --check pass. Lint passes with warnings (including plain image elements). No production build attempted due to the previously established external build limitation.

Browser fixture at /tmp/cosmic-v35-check uses fictional tracks, generated tone, in-memory Apollo/Path callbacks, and the actual Workbench, CreatorRail, MiniPlayer and MusicPlayerProvider. Checked 1440px desktop and 390px mobile. No horizontal overflow at 390px; bottom controls scroll clear of the existing compact player. Verified author/edit/remove, scene Path explanation, audition and ordered experiment handoff. Pausing removes the animation and keeps the extracted still. Simulated prefers-reduced-motion, rejected video play and WebGL-unavailable conditions preserve functionality; fallback audition works. Loop runs muted/inline with original dimensions. Browser fallback simulations were fixture-only, not changes to production browser preferences.

Corrected duplicate observation song-button keys and contrast pair keys exposed by the six-Realm synthetic fixture. No business/ranking behavior changed.

No real catalog, Path, publishing or user-account writes. Server persistence is implemented but browser verification used in-memory callbacks; real Mongo round-trip persistence is NOT claimed. No LLM requests. SIN untouched.

## Manual acceptance / exact continuation

1. Restart backend and frontend so the new GraphQL operations exist. Open /creator/intelligence as a creator.
2. Use two disposable, current owned songs. Connect them with a note. Reload; verify the Path returns. Reverse endpoints and edit; verify one Path rather than a duplicate.
3. Select its labeled scene connection, inspect the note, audition and open the experiment. Reorder and listen. Verify original Realm/project/publication fields stay unchanged.
4. Remove the Path, reload, and confirm removal. Another owner must not read/edit/remove it. Use disposable accounts/data for this persistence check.
5. Compare 390px and desktop with the real shell and player; test keyboard traversal and actual OS reduced motion. Verify unassigned and Realm 0 remain distinct.
6. Inspect artwork-rich and large catalogs; 12-song focus replacement can change slot placement. Multiple authored labels may need further collision handling for dense samples.

Next highest-value action: authenticated save → reload → edit → remove against disposable tracks, followed by visual acceptance with the real catalog read-only. Do not restart the implementation. No new version authorized.
