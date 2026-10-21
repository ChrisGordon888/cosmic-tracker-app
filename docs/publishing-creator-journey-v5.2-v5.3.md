# V5.2–V5.3 Publishing and creator journey

Branch: `feat/cosmic-creator-os-v5`. Starting checkpoint: `35259d5` (V5.1). No real creator records or media were changed.

## Delivered

- ReleaseWorld validates its existing scheduled lifecycle state.
- Due schedules publish the World page using the ordinary publish path. They no longer invoke Drop or promote private child tracks. Existing publication still exposes the creator profile and selected cover as before.
- A public World must be explicitly unpublished before it can be scheduled. Invalid/past dates, archived Worlds and ownership guards remain enforced.
- Schedule copy explains that the current processor is request-driven, not a punctual job scheduler.
- Public routes remain `/releases/[slug]`. New links add `?world=<id>`; the server matches ID, slug, public visibility and non-archived state. Unique legacy slug URLs continue to work. Ambiguous legacy URLs return an actionable error rather than choosing another creator.
- Owner preview cannot override an explicitly requested foreign World with the same slug.
- Share, discovery, creator preview and MiniPlayer World links carry identity where known. Existing playback records lacking World ID retain legacy fallback links.
- Library rows link to the existing Intelligence song view. Library and Intelligence open a project's Workbench with `?track=<id>`, selecting only a track returned by the owner-scoped query. Workbench links back to Intelligence with the selected song. Returning to Library from a standalone song prefills its existing search from the authorized catalog record.
- Compass project navigation also retains the selected song. Existing Realm discovery, onboarding, saved experiments and preparation workflow are reused.

## Preservation

No new product subsystem, dependencies, player, experimental-project conversion or publishing authority. No changes to Realm definitions, Intelligence analysis, Canon eligibility or Nexus selection. The explicit Drop mutation remains distinct and unchanged: it can deliberately promote eligible child tracks. Schedule now follows Publish semantics instead.

## Verification (fictional / mocked only)

- Backend: 29 focused tests passed: publishingLifecycleV5, releaseFlow, publicProjects, creativeExperiments, catalogProjectIntegrity, trackVault. The new lifecycle fixture calls actual resolvers and Mongoose validation, but database methods are mocked. After additional anonymous/inactive and invalid-date assertions, the two new tests passed again.
- Frontend: 41 tests passed: releaseSharing, listenerDiscovery, releaseWorldQueue, creativeExperiments, livingUniverse, publicProjects. Includes rendered foreign-World/owner-preview separation and queue/Realm preservation.
- TypeScript passed; full lint passed with warnings (primarily existing image and hooks warnings). Changed-file lint also run after final edits.
- Backend syntax and diff integrity passed.
- Production build attempted: blocked by ENOTFOUND fonts.googleapis.com for existing Geist and Geist Mono fonts. No font changes made.
- Browser fixture at 390×844: 56-song Mini Universe, selected-song connection, pairing playback through shared MiniPlayer; document width 390, no horizontal overflow. Context-aware project URL observed.
- Desktop fixture at 1365×900: saved experiment reopened with original order and audition reached shared MiniPlayer. Experiment persistence in this browser fixture is localStorage/mock-only, not database verification.
- No authenticated database, upload-to-publication browser journey, live scheduling, or deployed public-link verification claimed. Workbench/Library arrival behavior and publishing forms still need the staging acceptance below.

## Remaining risks / infrastructure

Request-triggered due processing does not guarantee exact publication time. A dedicated authenticated scheduler with atomic claiming, cancellation-safe concurrency, retry/audit reporting and a shared tested publication service is needed before advertising punctual scheduled releases. Existing request-based processing can race concurrent cancellation/editing; do not use it for the controlled demo. A full transaction across profile, cover and World writes is not introduced here.

Old ambiguous bare-slug links cannot identify which creator was intended; generate a new Share Release link. New frontend query arguments require the matching backend release. Private metadata remains distinct from private storage: existing public media URLs retain the V5.1 exposure caveat.

## Smallest controlled-demo acceptance (disposable staging accounts only)

1. Use two authorized fictional creators in an isolated staging database. Never repurpose a real release. Upload original disposable audio through the existing Library intake; keep it private. Verify standalone placement and owner isolation.
2. Select a Realm manually (including Realm 0 or Unassigned), open Explore connections, select the same song and save a two-song experiment. Reload; reopen and audition. This must not create/publish a project or alter Canon.
3. Create a World using normal placement. Open a non-first song in Library → Workshop; verify it remains selected. Follow Explore song connections → Intelligence → Compass project link; verify the same track returns. Test standalone Intelligence → Library search. Repeat at 390px and desktop, including browser Back.
4. Prepare two same-slug Worlds under different creators with fictional cover/story. Include one intentionally public/List child and one private child. Verify readiness blockers before supplying missing requirements. Publish explicitly; the private child must remain hidden to signed-out and other-creator views.
5. Copy Share Release links. Verify distinct `world` IDs, correct creator/content, MiniPlayer Enter World and Nexus/project links. Unique old bare-slug links still work; duplicate bare slugs report ambiguity. A foreign identity cannot open the signed-in creator's private same-slug preview.
6. Unpublish: public link stops resolving. Schedule a future private World; cancel and verify draft/private. Reject past/invalid dates, foreign owner and scheduling an already-public World. In staging only, allow a due schedule and request a public catalog page; verify page publication without child promotion. Treat timing as best-effort, never a demo guarantee.
7. Confirm Canon, Nexus selection, featured selection, child Realm/access settings and playback order are unchanged. Archive disposable fixtures via normal owner workflows when finished. Do not delete/migrate real assets.

Smallest next step: run this single staging rehearsal, using manual Publish for the demonstration, then verify the copied link in a separate signed-out browser. This pass is ready for code review, not live/demo acceptance sign-off.

## Complete file inventory

- `backend/models/ReleaseWorld.js`
- `backend/resolvers/index.js`
- `backend/schemas/index.js`
- `frontend/src/app/admin/nexus/page.tsx`
- `frontend/src/app/creator/library/page.tsx`
- `frontend/src/app/creator/onboarding/review/page.tsx`
- `frontend/src/app/creator/page.tsx`
- `frontend/src/app/creator/projects/page.tsx`
- `frontend/src/app/creator/releases/[slug]/publish/page.tsx`
- `frontend/src/app/nexus/page.tsx`
- `frontend/src/app/releases/[slug]/board/page.tsx`
- `frontend/src/app/releases/[slug]/page.tsx`
- `frontend/src/components/creator/SelectedWorlds.tsx`
- `frontend/src/components/intelligence/CreativeCompass.tsx`
- `frontend/src/components/intelligence/IntelligenceWorkbench.tsx`
- `frontend/src/components/music/MiniPlayer.tsx`
- `frontend/src/components/public/ReleaseShareButton.tsx`
- `frontend/src/components/signal-board/ReleaseAssetsPanel.tsx`
- `frontend/src/context/MusicPlayerProvider.tsx`
- `frontend/src/lib/listenerPaths.ts`
- `frontend/src/lib/publicProjects.ts`
- `frontend/src/lib/releaseSharing.ts`
- `frontend/tests/listenerDiscovery.test.cjs`
- `frontend/tests/publicProjects.test.cjs`
- `frontend/tests/releaseSharing.test.cjs`
- `backend/tests/publishingLifecycleV5.test.js`
- `docs/publishing-creator-journey-v5.2-v5.3.md`


## V5 final acceptance / closeout — 2026-10-21

### Final correction

Verified with a failing fictional regression that an otherwise-ready archived World reported ready and could pass the ordinary Publish mutation. Added the `RELEASE_ARCHIVED` readiness blocker with a link to the existing publishing/Restore workflow. Publication now fails before profile/cover/World writes. Updated the existing route assertion to permit this valid Restore destination while still rejecting obsolete board routes.

Closeout changes only: `backend/resolvers/index.js`, `backend/tests/publishingLifecycleV5.test.js`, `backend/tests/releaseFlow.test.js`, and this handoff. All earlier uncommitted V5.2–V5.3 changes remain intact.

### Final verification supersedes earlier build status

- 31 backend tests passed across publishing lifecycle, release flow, public projects, experiments, catalog project integrity, track Vault and archive/feature permissions.
- 49 frontend tests passed across upload security, creator tour/journey, release sharing, listener discovery, World queues, experiments, Living Universe and project routing.
- Full lint completed with warnings, no errors. Existing image optimization, unused-variable and hooks warnings remain; no unrelated cleanup performed.
- Backend syntax and `git diff --check` passed.
- Production build PASSED with network access, including static generation. The restricted attempt failed to resolve Google Fonts; the network-enabled retry succeeded without font or product changes.
- TypeScript PASSED after build generation. An initial concurrent invocation saw `.next/types` files being regenerated by the build; this is why final validation must run sequentially.
- Browser results above are retained evidence from V5.2–V5.3, not a newly performed authenticated acceptance run. No production/staging accounts or real media were mutated.

### Sign-off decision

Code is suitable for review and a local checkpoint. Authenticated demonstration acceptance remains conditional on one disposable staging rehearsal. No new feature work is needed before that rehearsal.

True demonstration blockers: (1) successful real-session upload/callback and ownership isolation have not been verified against the deployment configuration; (2) the two-creator, private-child, exact-World-identity journey has not been verified end to end in authenticated staging. Build readiness is no longer blocked by fonts when network is available. Matching backend/frontend versions must be used because the query now accepts `worldId`.

Known limitations, not blockers for a fictional-data/manual-Publish demonstration: best-effort scheduling and cancellation concurrency, public Blob URL exposure, legacy ambiguous links, no automatic conversion of experiments into projects, existing lint warnings and the local Node 19/npm 11 compatibility warning (use a supported Node LTS in CI/staging). Scheduling must not be presented as punctual. Confidential real uploads remain out of scope until private delivery is implemented and accepted.

### Smallest final acceptance

Use two disposable creators and tiny original fixture files in isolated staging. Confirm active creator upload works and anonymous/listener/inactive token requests fail; reload and verify another creator cannot access private metadata. Follow Library → selected song in Intelligence → save/reopen/audition experiment → normal project placement → non-first track Workbench → Prepare Release → manual Publish. Repeat core navigation at 390px. Publish two identically slugged Worlds, keeping a private child in each. Check ID-qualified share and MiniPlayer return links signed out and as the other creator. Confirm private children stay hidden, Canon/editorial states unchanged, Unpublish removes public access, and Archived requires Restore. Record results and retain only disposable fixtures. The fuller schedule test above is separate from the demo path.

### Safe checkpoint commands (instructions only; not executed)

First review the current branch and every changed/untracked file. Stop if unexpected changes appear. The staging command below names only the known V5 files; it does not use `git add .` or `git add -A`.

```sh
cd /Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app
git branch --show-current
# Must be feat/cosmic-creator-os-v5
git status --short
git diff --check
git diff --stat
git diff
# Also review the two untracked files named below.
git add -- \
  backend/models/ReleaseWorld.js \
  backend/resolvers/index.js \
  backend/schemas/index.js \
  backend/tests/releaseFlow.test.js \
  frontend/src/app/admin/nexus/page.tsx \
  frontend/src/app/creator/library/page.tsx \
  frontend/src/app/creator/onboarding/review/page.tsx \
  frontend/src/app/creator/page.tsx \
  frontend/src/app/creator/projects/page.tsx \
  'frontend/src/app/creator/releases/[slug]/publish/page.tsx' \
  frontend/src/app/nexus/page.tsx \
  'frontend/src/app/releases/[slug]/board/page.tsx' \
  'frontend/src/app/releases/[slug]/page.tsx' \
  frontend/src/components/creator/SelectedWorlds.tsx \
  frontend/src/components/intelligence/CreativeCompass.tsx \
  frontend/src/components/intelligence/IntelligenceWorkbench.tsx \
  frontend/src/components/music/MiniPlayer.tsx \
  frontend/src/components/public/ReleaseShareButton.tsx \
  frontend/src/components/signal-board/ReleaseAssetsPanel.tsx \
  frontend/src/context/MusicPlayerProvider.tsx \
  frontend/src/lib/listenerPaths.ts \
  frontend/src/lib/publicProjects.ts \
  frontend/src/lib/releaseSharing.ts \
  frontend/tests/listenerDiscovery.test.cjs \
  frontend/tests/publicProjects.test.cjs \
  frontend/tests/releaseSharing.test.cjs \
  backend/tests/publishingLifecycleV5.test.js \
  docs/publishing-creator-journey-v5.2-v5.3.md
git diff --cached --check
git diff --cached --stat
git diff --cached
# Commit only after reviewing the staged contents.
git commit -m "fix(creator): stabilize V5 publishing and creator journey"
git status --short
# Expected: no output. Investigate remaining files; do not discard them.
git log -1 --oneline
```

A local checkpoint records reviewed code; it does not establish live acceptance. Record the staging result before closing the demo gate. No merge, tag, push or deployment is part of these steps. Continue the next phase only under a separate explicit scope.
