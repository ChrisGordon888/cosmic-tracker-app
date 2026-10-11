# V2.2 mini acceptance pass

Continued the existing uncommitted work on `feat/creative-intelligence-v2`; no reset, commit, merge, deployment or real data writes.

## Corrections

- `/realms/{id}` is canonical. The six existing atmospheric Realm pages now admit signed-out listeners, reuse the public soundstage and Canon World context, and retain lore/guidance. Saved user queries skip signed-out sessions; optional trial/progression content requires a session. Existing progression handlers/backend authority are unchanged.
- `/realms/{id}/entry` is a thin compatibility redirect preserving query string and fragment. Home, Nexus, Scroll and listener Realm links target the canonical routes. Explicit World links still lead to Worlds.
- Named recommendation lookup resolves the exact registry identity/live migration identity. It never substitutes the first Canon song. Missing recommendations fail closed instead of playing another song. Canon ranking remains the default catalog/entry ranking.
- Guidance displays the actual resolved track title. Guidance state clears when changing to a different Realm.
- Orbit clicks still select and play. Hover no longer silently selects a different song while the MiniPlayer continues playing the previous one.
- Nexus order is Realm Soundtracks, compact Canon Worlds, editorial Selected Worlds, after its existing major feature. Shelf scale/semantics unchanged.

## Existing editorial workflow

No new editorial UI. `/admin/nexus/editorial` already renders `ProjectSelections` inside `OwnerAccessGate`. It offers checkboxes for real public Canon Worlds, saves through `setNexusProjectSelection`, then refetches `nexusEditorialConfig.selectedWorldIds`.

The backend's existing `requireNexusEditorial` blocks ordinary creators. Selection uses `$addToSet`/`$pull` on configuration references, not child/project edits. Public `publicProjects(selectedOnly:true)` filters by those references and public Canon eligibility. Existing owner/editorial permissions were preserved, not expanded.

Manual final check: with an authorized local owner account and a disposable public Canon World, select its checkbox, reload the editor to verify persistence, inspect Nexus Selected Worlds, then deselect and confirm removal. Normal creator access must be denied. No real editorial selection was made during this pass.

## Verification

- 58 relevant frontend tests passed: exact HardWay lookup versus Not Enough Canon ranking; actual shared-provider explicit switching from stale prior state; six signed-out Realm renders; route/redirect and Nexus ordering; public visibility; project/SIN contextual behavior; Services regression.
- 13 backend tests passed: publication filtering, parent ownership, contextual Listed access, Selected Worlds query, ordinary creator rejection and persisted configuration update shape.
- TypeScript passed. Mini-pass changed-file lint: zero errors, six existing warnings in Home/Nexus. `git diff --check` passed.
- Browser used an isolated fictional fixture, original demo audio, and the actual shared player/MiniPlayer. At 390px: Not Enough Canon action → MiniPlayer Not Enough; Play Suggested → MiniPlayer HardWay; orbit action → MiniPlayer Orbit fixture. Document width remained 390px. Redirect retained `?test=mini#music-section`.
- The fixture intentionally does not configure real NextAuth; its auth-fetch warning is not a successful OAuth test. Real signed-in progression and editorial persistence still need local manual acceptance.
- No Google Fonts build retry. No Services credential work/email. SIN data, Practice, Scroll content, Intelligence, weights and migration architecture unchanged.

## Files touched in this mini-pass

- `frontend/src/app/page.tsx`
- `frontend/src/app/nexus/page.tsx`
- `frontend/src/app/scroll/page.tsx` (Realm links only)
- `frontend/src/app/realms/303/page.tsx`
- `frontend/src/app/realms/202/page.tsx`
- `frontend/src/app/realms/101/page.tsx`
- `frontend/src/app/realms/55/page.tsx`
- `frontend/src/app/realms/44/page.tsx`
- `frontend/src/app/realms/0/page.tsx`
- `frontend/src/app/realms/[id]/entry/page.tsx`
- `frontend/src/components/realm/RealmEntryGuidanceBanner.tsx`
- `frontend/src/components/music/RealmOrbitCard.tsx`
- `frontend/src/lib/publicMusicCatalog.ts`
- `frontend/src/lib/listenerPaths.ts`
- `frontend/tests/listenerDiscovery.test.cjs`
- `frontend/tests/publicCoherence.test.cjs`
- `frontend/tests/publicProjects.test.cjs`
- `frontend/tests/playerPresentation.test.cjs`
- `docs/realm-convergence-v2.2.md`

This document supersedes the prior public-coherence report's `/entry` routing, Canon-before-Realm Nexus order, and recommendation-priority description. All unrelated prior work remains intact.
