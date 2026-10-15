# Applied restoration — 2026-10-12

The publication decision was explicitly resolved by the creator: restore the four independent concepts as public, non-Canon Worlds. The prior audit below is retained as historical evidence; its deferred/no-write decision is superseded by this section.

| World | Created ID | Public route | Public / private children |
|---|---|---|---|
| Break the Code | 6acd013ccb845569f645539e | /releases/realm-303-break-the-code | 3 / 0 |
| Glory & Command | 6acd013ccb845569f645539f | /releases/realm-55-glory-and-command | 2 / 1 |
| The Price of Focus | 6acd013ccb845569f64553a0 | /releases/realm-44-price-of-focus | 2 / 1 |
| Same Self, Higher Form | 6acd013dcb845569f64553a1 | /releases/realm-0-same-self-higher-form | 3 / 0 |

All four use `visibility: public`, `publicCanon: false`, `isFeatured: false`, `status: draft` (creative progress remains draft, independently of visibility). No editorial configuration was changed. Exact historical title, cover, story, description and owner-side three-track order were restored using the IDs below.

## Applied writes and protections

`backend/scripts/restorePublicLegacyWorlds.cjs` defaults to dry-run; `--apply` is the explicit bounded public restoration, and `--verify` is read-only. It pins owner/profile and all 12 IDs from this audit, checks global public-slug collisions and existing unique owner/slug index, and runs all four creations in one transaction. The older private/local migration remains restricted.

Actual writes: four ReleaseWorld inserts, twelve existing-track updates limited to releaseWorldId, trackNumber and updatedAt. No replacement tracks or audio. Transactional comparisons confirmed all projected child curation/access/Realm/lifecycle/editorial/date fields, unrelated tracks, existing Worlds and editorial config unchanged. SIN's six exact IDs and sequence were checked before and after. A read-only rerun found four existing Worlds and zero creations.

Mula and new jazz remain private. The real getPublicReleaseTracks resolver returned only 3/2/2/3 public children in historical relative order. All ten public audio sources passed anonymous URL authorization and media-byte readability checks. Full audio decoding/end-to-end playback of every song was not tested.

## Validation after apply

21 backend and 15 frontend focused tests passed. TypeScript passed. Changed backend syntax and changed-file ESLint passed; the shared frontend lint configuration emitted React/pages detection warnings from the repo root, with CommonJS imports explicitly permitted. No build retry.

Browser: Glory & Command and The Price of Focus rendered their correct public-only sequences and historical text. Glory n Power activated the shared MiniPlayer with Skybound City. The running local backend subsequently produced MongoDB AggregateError/connection-pool errors on Break the Code, including after reload; its direct database/resolver checks passed. Break the Code recovered on the final retry without code changes and displayed all three songs. Same Self, Higher Form also rendered all three songs and activated MiniPlayer with InterSiddhi (genuine Realm 0). All four public pages were visually verified; full listening acceptance remains for the creator. No unrelated connection code changed.

The two overlapping concepts below remain uncreated. No commit, merge, deploy, or new sequence architecture.

---

# Legacy EP restoration audit — 2026-10-11

Checkpoint: 67b54ac; branch: feat/creative-intelligence-v2.

## Decision

All 18 historical IDs resolve uniquely for owner 6a07c846d22cce3a5b753a8d, profile 6a374e14d57265c6788eaff0. No equivalent title/slug exists among the owner's six Worlds. No database writes were made. All six concepts are skipped. Four have no membership conflict but cannot be restored privately without restricting public children. Two additionally overlap SIN. Do not run the old private-parent plan on public tracks.

A public non-Canon parent would preserve soundtrack eligibility but expose a new project URL; this requires an explicit publication decision. It is not silently substituted for the requested private restoration. No empty shell Worlds are created.

## Sources and membership

- frontend/src/lib/musicRegistry.ts: MUSIC_COLLECTIONS, public-three-piece definitions, orders 10–60; exact titles/story/description/Realm/historical IDs and episode labels survive.
- Git 4b9bb5f:frontend/src/app/nexus/page.tsx: CURATED_PLAYLIST_ART_OVERRIDES supplies the actual displayed cover paths. The older registry JPG paths are absent on disk; all six displayed PNG overrides exist. No artwork is invented.
- backend/migrations/curatedWorlds.v1.json preserves these definitions and displayed artwork.
- ReleaseTrack.releaseWorldId is a single ObjectId. Normal attachment rejects already-linked tracks. No secondary membership exists.
- getPublicNexusTracks accepts standalone public/Listed tracks or children of same-owner public, nonarchived Worlds. A private/unlisted parent therefore changes eligibility without changing any child flags.
- myReleaseWorlds lists owner-scoped Worlds, including private drafts. Existing Creator Projects needs no new UI.

## Historical concepts and exact current resolution

### Break the Code

Historical Realm: 303; presentation: public-three-piece, active true, sort 10.

Description: Three tracks for pressure, fracture, and self-overcoming.

Story: A sequence about recognizing the code, surviving mental pressure, and turning pain into force.

Episode label: Fractured Frontier: songs for pressure and survival

Registry cover: /images/music/collections/303-break-the-code.jpg; displayed override: /break-the-code.png.

| Historical title | Historical ID | Current title | ReleaseTrack ID | Curation | Realm | Membership |
|---|---|---|---|---|---|---|
| hardcoded | 303-hardcoded | hardcoded | 6a834e19bf1fd9c09c19168b | Listed | 303 | Standalone |
| losing my mind | 303-losing-my-mind | losing my mind | 6a834e19bf1fd9c09c19168e | Listed | 303 | Standalone |
| HardWay | 303-hardway | HardWay | 6a834e19bf1fd9c09c191692 | Listed | 303 | Standalone |

Dry run: **skip**. 303-hardcoded: private restoration would restrict public track availability; publication decision required. 303-losing-my-mind: private restoration would restrict public track availability; publication decision required. 303-hardway: private restoration would restrict public track availability; publication decision required.

### Don’t Follow the Siren

Historical Realm: 202; presentation: public-three-piece, active true, sort 20.

Description: Three tracks for mystery, fantasy, warning, and emotional fog.

Story: A sequence about hearing the warning, seeing the fantasy, and recognizing the voices inside the haze.

Episode label: The Veil: songs for fantasy, warning, and emotional fog

Registry cover: /images/music/collections/202-dont-follow-the-siren.jpg; displayed override: /veil-signal.png.

| Historical title | Historical ID | Current title | ReleaseTrack ID | Curation | Realm | Membership |
|---|---|---|---|---|---|---|
| Siren | 202-siren | Siren | 6a3eb4ce9f7358347d6be401 | Canon | 202 | SIN (6a374e55d57265c6788eb357) |
| Her Fantasy | 202-her-fantasy | Her Fantasy | 6a3eb4299f7358347d6be33b | Listed | 101 | SIN (6a374e55d57265c6788eb357) |
| voices | 202-voices | voices | 6a834e1abf1fd9c09c1916a8 | Listed | 202 | Standalone |

Dry run: **skip**. 202-siren: already linked to World 6a374e55d57265c6788eb357; will not detach or duplicate. 202-siren: private restoration would restrict public track availability; publication decision required. 202-her-fantasy: already linked to World 6a374e55d57265c6788eb357; will not detach or duplicate. 202-her-fantasy: private restoration would restrict public track availability; publication decision required. 202-voices: private restoration would restrict public track availability; publication decision required. Current canonical track Realm/focus does not derive the historical Realm.

### Hold On While You Drift

Historical Realm: 101; presentation: public-three-piece, active true, sort 30.

Description: Three tracks for healing, surrender, and night-road reflection.

Story: A sequence about being held, pushing a little further, and surrendering into the unknown.

Episode label: Moonlit Roads: songs for healing, drift, and night drives

Registry cover: /images/music/collections/101-hold-on-while-you-drift.jpg; displayed override: /hold-on-while-you-drift.png.

| Historical title | Historical ID | Current title | ReleaseTrack ID | Curation | Realm | Membership |
|---|---|---|---|---|---|---|
| Hold My Hand | 101-hold-my-hand | Hold My Hand | 6a3eb2e59f7358347d6be1af | Listed | 101 | SIN (6a374e55d57265c6788eb357) |
| little further | 101-little-further | little further | 6a834e1bbf1fd9c09c1916bb | Private | 101 | Standalone |
| freeFall | 101-freefall | freeFall | 6a834e1bbf1fd9c09c1916bd | Listed | 101 | Standalone |

Dry run: **skip**. 101-hold-my-hand: already linked to World 6a374e55d57265c6788eb357; will not detach or duplicate. 101-hold-my-hand: private restoration would restrict public track availability; publication decision required. 101-freefall: private restoration would restrict public track availability; publication decision required.

### Glory & Command

Historical Realm: 55; presentation: public-three-piece, active true, sort 40.

Description: Three tracks for ambition, power, money motion, and command.

Story: A sequence about stepping into glory, moving resources, and claiming the city of self-command.

Episode label: Skybound City: songs for glory, power, and command

Registry cover: /images/music/collections/55-glory-and-command.jpg; displayed override: /glory-and-command.png.

| Historical title | Historical ID | Current title | ReleaseTrack ID | Curation | Realm | Membership |
|---|---|---|---|---|---|---|
| Glory n Power | 55-glory-n-power | Glory n Power | 6a834e1bbf1fd9c09c1916cf | Canon | 55 | Standalone |
| Bank | realm-55-bank | Bank | 6a834e1bbf1fd9c09c1916cb | Listed | 55 | Standalone |
| Mula | realm-55-mula | Mula | 6a834e1bbf1fd9c09c1916c9 | Private | 55 | Standalone |

Dry run: **skip**. 55-glory-n-power: private restoration would restrict public track availability; publication decision required. realm-55-bank: private restoration would restrict public track availability; publication decision required.

### The Price of Focus

Historical Realm: 44; presentation: public-three-piece, active true, sort 50.

Description: Three tracks for value, temptation, taste, and discernment.

Story: A sequence about distraction, style, access, and deciding what is actually worth your energy.

Episode label: Astral Bazaar: songs for value, temptation, and focus

Registry cover: /images/music/collections/44-price-of-focus.jpg; displayed override: /price-of-focus.png.

| Historical title | Historical ID | Current title | ReleaseTrack ID | Curation | Realm | Membership |
|---|---|---|---|---|---|---|
| 13933 | 44-13933 | 13933 | 6a834e1cbf1fd9c09c1916d5 | Listed | 44 | Standalone |
| new jazz | 44-new-jazz | new jazz | 6a834e1cbf1fd9c09c1916d7 | Private | 44 | Standalone |
| Golden Tickets | realm-44-golden-tickets | Golden Tickets | 6a834e1bbf1fd9c09c1916d3 | Listed | 44 | Standalone |

Dry run: **skip**. 44-13933: private restoration would restrict public track availability; publication decision required. realm-44-golden-tickets: private restoration would restrict public track availability; publication decision required.

### Same Self, Higher Form

Historical Realm: 0; presentation: public-three-piece, active true, sort 60.

Description: Three tracks for source, self-recognition, blessing, and integration.

Story: A sequence about remaining the same core person while walking forward into blessing and integration.

Episode label: InterSiddhi: songs for source, self-recognition, and integration

Registry cover: /images/music/collections/0-same-self-higher-form.jpg; displayed override: /same-self-higher-form.png.

| Historical title | Historical ID | Current title | ReleaseTrack ID | Curation | Realm | Membership |
|---|---|---|---|---|---|---|
| same person | 0-same-person | same person | 6a834e1cbf1fd9c09c1916dd | Listed | 0 | Standalone |
| Walking Forward | realm-0-walking-forward | Walking Forward | 6a834e1cbf1fd9c09c1916d9 | Listed | 0 | Standalone |
| Feel Blessed | realm-0-feel-blessed | Feel Blessed | 6a834e1cbf1fd9c09c1916db | Listed | 0 | Standalone |

Dry run: **skip**. 0-same-person: private restoration would restrict public track availability; publication decision required. realm-0-walking-forward: private restoration would restrict public track availability; publication decision required. realm-0-feel-blessed: private restoration would restrict public track availability; publication decision required.

## SIN regression

1. Do Over — 6a3e941a1dd57fdd0197c3a3; Realm 101; listed.
2. Hold My Hand — 6a3eb2e59f7358347d6be1af; Realm 101; listed.
3. In The Deep — 6a3ed590d84bc0637c420278; Realm 202; listed.
4. Her Fantasy — 6a3eb4299f7358347d6be33b; Realm 101; listed.
5. Running From The Plug — 6a3e99e077c5fa4246035080; Realm 202; listed.
6. Siren — 6a3eb4ce9f7358347d6be401; Realm 202; public.

Six tracks remain in their existing order. Her Fantasy's current Realm is 101, despite historical ID prefix 202; it is not rewritten. All 18 resolved tracks currently have public accessTier and playable playbackStatus, including private tracks whose visibility still protects them.

## Safe apply set and preservation

Empty. Zero Worlds created, zero tracks modified, zero editorial writes. Canon, visibility, catalog treatment, lifecycle/status, access, playback, Realm, Spotlight, Featured and SIN remain unchanged. Planner now refuses public/Listed or unknown-visibility children for its private-parent default. Apply remains local-only; no remote-write bypass was added.

A repeat dry run stays skipped. Existing-title/slug detection remains idempotent. New tests check source/manifest correspondence, access protection, exact ordering, ownership, duplicates and SIN membership protection. Runtime/public/GraphQL/UI code is unchanged.

## Remaining acceptance

No new Worlds exist to open or audition. To unblock the four independent concepts, decide whether their historical public presentation may be restored as explicit public non-Canon Worlds, accepting a directly accessible project page; private child songs would remain private. Otherwise defer until publication-independent membership is separately designed. The two SIN-overlapping concepts need a future secondary curated-sequence relationship if they must reuse the same records. Do not implement that relationship in this pass.

## Validation results

- Backend: 20 tests passed (curatedWorldMigration, publicProjects, publicAccessDefaults).
- Frontend: 15 tests passed (legacyWorldRestoration, publicProjects, nexusAdmission, playerPresentation).
- TypeScript: `tsc --noEmit --incremental false` passed.
- Backend syntax: all three changed JavaScript/CommonJS files passed `node --check`.
- Changed-file ESLint passed with CommonJS require imports permitted; the frontend Next config emitted root-directory React/pages detection warnings when applied from the repository root.
- `git diff --check` passed.
- Production build intentionally not retried, per instruction.
- Restored-world browser playback cannot be verified because no Worlds were created. Existing playback and null-versus-zero Realm behavior have focused automated coverage; no new live audio audition was performed.
