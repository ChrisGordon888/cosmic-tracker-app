# COSMIC V2.2 — final public coherence corrections

Branch: `feat/creative-intelligence-v2`. Baseline checkpoint: `741a444`.
All existing uncommitted V2.2 work was preserved. No commit, merge, deployment or V3 work.

## Publication semantics

- Canon: explicit current representative music; ranked ahead of Listed.
- Listed: public catalog/Realm discovery, direct links and contextual listening; no automatic flagship or editorial status.
- Private, Vault, Sandbox/test and archived: excluded. Public playback retains existing date, preview, member and premium gates.
- Standalone public tracks need no artificial project. Linked tracks require the exact same-owner public, nonarchived parent. Missing/foreign/private parents fail closed.
- `getPublicNexusTracks` now serves catalog discovery independent of `showInNexus` and track/project Canon. Existing editorial selection queries remain separate and unchanged.
- All persisted legacyRegistryId records suppress their shipped registry copies. Eligible live tracks replace them; hidden records cannot resurrect through static audio.
- Models/schema unchanged. Frontend selects existing publicCanon/catalogTreatment fields. No publication state was mutated.

## Read-only owner-scoped catalog audit — 2026-10-08

53 records total. Disjoint reporting categories prioritize Sandbox, then Archived, then protected/private status before Canon/Listed. Public records without an affirmative Canon decision are reported separately rather than invented as Canon.

| Category | Count |
| --- | ---: |
| Canon | 6 |
| Listed | 23 |
| Private | 21 |
| Sandbox | 0 |
| Archived | 0 |
| Legacy public, unreviewed | 3 |

Counts below apply actual public-parent ownership, lifecycle, catalog-treatment and playback/media eligibility. They include gated metadata; membership/unlock rules still determine what an anonymous listener can play.

| Realm | Canon | Listed | Member-gated within total | Quiet appropriate? |
| --- | ---: | ---: | ---: | --- |
| 303 Fractured Frontier | 2 | 4 | 2 | No |
| 202 The Veil | 2 | 5 | 2 | No |
| 101 Moonlit Roads | 1 | 4 | 0 | No |
| 55 Skybound City | 1 | 2 | 1 | No |
| 44 Astral Bazaar | 0 | 3 | 1 | No |
| 0 InterSiddhi | 0 | 3 | 0 | No |

All 23 Listed records qualify for Realm catalog metadata under the revised rules. None was promoted to Canon. The three unreviewed public records do not contribute to these eligible Realm counts. The audit read projected fields only; it did not invoke scheduled-publication resolvers or write data.

## Public hierarchy and routes

Home keeps its accepted hierarchy, current SIN feature and six cards. Individual cards enter `/realms/{id}/entry`; Explore All Realms remains `/nexus#realm-soundtracks`. Existing custom Home artwork is unchanged; CSS adds restrained edge/depth and a faint container halo.

The one shared public Realm entry is canonical for Home, Nexus and Scroll. Listener-path quiet/catalog fallbacks now use it too; direct project recommendations can still enter the project. Existing `/realms/303`, `/202`, `/101`, `/55`, `/44`, `/0` pages remain authenticated progression/trial rooms, with an explicit route to public listening from their sign-in gate. No progression functionality was deleted or duplicated. The focused public entry has one personal-path link and no duplicate orbit-to-auth navigation.

Nexus uses compact Canon World tiles before the main Realm soundtrack body; Selected Worlds follows it as a separate editorial shelf with a small empty state. No hardcoded EP runtime was restored. Canon cards show artwork, title, Realm, track count and Enter World. A sample tile measured about 162px tall at 390px width. Loading/errors are not mislabeled Realm Quiet.

ProjectCanonControl remains shared across Projects, Publish and Library curation. Current Canon projects sort first, other/hidden projects are labeled, and existing archived organization remains. Project Canon changes neither child track states nor editorial membership.

## Scroll / Practice / depth

Three Mirrors retain pairs 303/44, 101/55 and 202/0. Obsidian main copy uses experiential absorption while acknowledging reflection. Black-screen expansion/distortion is two sentences plus a question. Historical detail is collapsed; source links never dominate the visible cards. Four brief symbolic lenses sit inside one optional disclosure, not four essays.

Parts/Self is IFS-adjacent reflection, not therapy. Human Design and numerology are symbolic maps, not scientific identity or destiny. Witness ideas are philosophical. No new cultural claims were introduced.

Practice's unrelated Islamic-calendar note was removed without replacement trivia. PracticeShell unifies foyer, Today, Rituals, Cycles/History and reflection with a shared environment, navigation, typography and spacing. Public state/reflection remain temporary and optional; existing Sacred Yes, mood, quests, ritual and history persistence remain authenticated.

Current Practice and MoonPhaseCard use the existing SunCalc helper; Calendar uses the same library for principal-phase crossings. Dates/illumination are approximate and local, with no health or mood claims. The old 2025 table is no longer imported by current Practice views. Realm engine weighting remains untouched.

The custom healing-chamber / ethereal-apothecary environment image is still pending. Set `--practice-environment-image` on the shared `.practice-family.practice-chamber` when approved art is ready; preserve contrast layers and review mobile cropping. No stock art or new media dependency.

No suitable Three.js/WebGL system was present. Targeted CSS perspective/bloom stays limited to Home/current art and Realm glyphs; reduced-motion rules disable decorative transforms/transitions.

## Legacy EP preservation / migration

| Historical concept | Dry-run result |
| --- | --- |
| Break the Code | Ready: same-owner sequence, artwork and Realm resolved |
| Don't Follow the Siren | Skipped: Siren and Her Fantasy already belong to SIN; current Realm/focus also differs |
| Hold On While You Drift | Skipped: Hold My Hand already belongs to SIN |
| Glory & Command | Ready |
| The Price of Focus | Ready |
| Same Self, Higher Form | Ready |

All six titles, summaries, stories, artwork paths and ordered registry identities remain in the migration manifest. No matching existing World identity was found. The two overlapping concepts require future multi-project/curated-sequence relationship design; that is future architecture debt, not permission to detach or duplicate SIN tracks.

The configured database is remote. **No migration was executed locally or remotely. Production was not mutated.** Four candidates remain ready for a future local-development inspection.

Default script invocation is read-only:

```sh
node backend/scripts/migrateCuratedWorlds.cjs --owner OWNER_ID --profile PROFILE_ID --database DATABASE_NAME
```

The previously implemented optional `--apply` accepts only loopback MongoDB and explicitly dev/development/local/test database names, requires the existing owner/slug unique index and replica-set transactions, and rechecks state inside each transaction. It never falls back to nontransactional writes. New Worlds default private/draft/non-Canon/non-featured. Only previously unlinked tracks receive the parent link and sequence; visibility/Canon/files/rights/editorial state are preserved. Private parent access can restrict children even though their visibility fields are unchanged. No apply is authorized against the current remote database.

## Services setup checklist

Application endpoint: `frontend/src/pages/api/services-inquiry.ts`; transport: `frontend/src/server/servicesInquiry.ts`. Current blocker is external configuration, not frontend delivery logic.

1. In Resend, add a domain you control, install the exact DNS records supplied there, and wait for verified sending status. [Official verified-domain documentation](https://resend.com/docs/dashboard/domains/introduction).
2. Create a sending API key for that domain. Do not paste it into source, browser code or chat.
3. Configure server-only `RESEND_API_KEY`, `SERVICES_INQUIRY_FROM` (sender at that verified domain), and `SERVICES_INQUIRY_TO` (the actual destination inbox).
4. Local: place values in the Next frontend's untracked `.env.local` or process environment; restart the frontend server. Backend-only env configuration does not configure this Next API route.
5. Hosted: configure these in the frontend Vercel project's intended Preview/Production environment. A subsequent separately authorized redeploy is required. No deployment occurred in this pass.
6. After configuration, manually submit one clearly labeled test using an inbox you control; verify API success, provider record, inbox receipt/spam folder and visitor Reply-To. Provider acceptance is not guaranteed inbox delivery.
7. In local testing, remove one required variable, restart, and confirm honest failure plus retained inputs; restore it afterward. Do not disable production configuration to test failure.

No real email was sent. The isolated browser fixture forced transport unconfigured and confirmed the exact failure text with retained pilot inquiry values.

## Validation

- 111 frontend tests and 61 backend tests passed, including public catalog parent/ownership/visibility filtering, Canon priority, Listed-only Realm eligibility, protected legacy suppression, project/Canon/editorial separation, Services and SIN/project-native regressions.
- TypeScript passed. Changed/new TypeScript lint passed with 0 errors and 9 warnings (existing hooks, unused helpers and image guidance).
- Backend resolver/migration syntax checks passed; whitespace checks passed after removing one trailing blank-space line.
- One earlier production build attempt failed on known fonts.googleapis.com DNS while fetching Geist/Geist Mono. It was not repeatedly retried or worked around in product code.
- Isolated browser fixture: compact desktop/mobile Nexus; mixed Canon/Listed ordering; Listed-only Astral Bazaar active; truly empty Realm quiet; canonical links; collapsed Scroll context/lenses; Practice public reset, signed-in rooms/calendar; Services honest failure; six-track SIN contextual playback. Fictional data and original demo audio only.
- 390px checks showed no document overflow on inspected Nexus, Realm entry, Scroll and Practice screens. Reduced-motion source guards are present; actual OS preference switching remains manual.
- Native confirmation automation stalled on Canon; mutation/cancel unit tests pass, but live authenticated cross-surface persistence remains manual. Real OAuth/email delivery and actual migrated-project UI were not exercised.

## Source discipline

The optional obsidian object claim is limited to an Aztec polished obsidian mirror held by the [British Museum](https://www.britishmuseum.org/collection/object/E_Am1825-1210-16), corroborated by [Antiquity research](https://www.cambridge.org/core/journals/antiquity/article/mirror-the-magus-and-more-reflections-on-john-dees-obsidian-mirror/38D4BFEA2CB9766973791029C2EE1289). No ancient Three Mirrors system, Toltec claim, therapeutic claim or prediction is asserted. The removed calendar note was sourced but product-irrelevant; it was not replaced with another tradition merely for decoration.

## Manual acceptance

1. Restart local backend/frontend. At desktop and 390px, use Home's individual Realm cards and broad Explore All Realms. Confirm distinct destinations and current-release depth.
2. Nexus: confirm compact Canon shelf before Realm music and separate small editorial empty state. Inspect all six Realms; audit predicts none is genuinely quiet. Verify Canon before Listed, especially 44 and 0 with Listed-only music.
3. Open `/realms/44/entry` signed out. Listen to an eligible public track. Member-only tracks must keep existing sign-in gates. Check personal-path link goes through `/auth` and no public music is labeled Canon merely because it is Listed.
4. On a disposable owned World, cancel Canon once, enable it in Projects, verify Publish and refreshed Nexus, then restore the original value. Confirm child states/editorial membership unchanged. Do not use SIN for state-change tests.
5. Scroll: compare all three Mirrors, expand optional context/lenses, follow Realm and Find Your Realm links. Practice: confirm no unrelated tradition note, clear/reload public reflection, then inspect Today/Rituals/History and existing saved data without editing real entries.
6. SIN: confirm all six songs in order and switch contextual playback. No project/track changes are needed.
7. Services: with local transport unconfigured, submit fictional data and confirm failure/retention. Use the separate controlled setup checklist for real delivery later.
8. Enable reduced motion and repeat Home/Realm/Practice at narrow width. Review keyboard focus and no clipping. Do not run migration apply, commit, merge, deploy or begin V3 as part of acceptance.

## Full changed-file manifest

- `backend/lib/curatedWorldMigration.js`
- `backend/migrations/curatedWorlds.v1.json`
- `backend/resolvers/index.js`
- `backend/scripts/migrateCuratedWorlds.cjs`
- `backend/tests/curatedWorldMigration.test.js`
- `backend/tests/publicCanon.test.js`
- `backend/tests/trackVault.test.js`
- `docs/public-coherence-v2.2.md`
- `frontend/src/app/calendar/page.tsx`
- `frontend/src/app/creator/projects/page.tsx`
- `frontend/src/app/creator/releases/[slug]/publish/page.tsx`
- `frontend/src/app/nexus/page.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/practice/page.tsx`
- `frontend/src/app/realms/0/page.tsx`
- `frontend/src/app/realms/101/page.tsx`
- `frontend/src/app/realms/202/page.tsx`
- `frontend/src/app/realms/303/page.tsx`
- `frontend/src/app/realms/44/page.tsx`
- `frontend/src/app/realms/55/page.tsx`
- `frontend/src/app/realms/[id]/entry/page.tsx`
- `frontend/src/app/rituals/page.tsx`
- `frontend/src/app/scroll/page.tsx`
- `frontend/src/app/services/inquire/page.tsx`
- `frontend/src/app/tracker/page.tsx`
- `frontend/src/components/MoonPhaseCard.tsx`
- `frontend/src/components/creator/ProjectCanonControl.tsx`
- `frontend/src/components/creator/PublicCurationReview.tsx`
- `frontend/src/components/creator/SelectedWorlds.tsx`
- `frontend/src/components/music/RealmOrbitCard.tsx`
- `frontend/src/components/practice/PracticeShell.tsx`
- `frontend/src/components/realm/RealmSoundstage.tsx`
- `frontend/src/graphql/realms.ts`
- `frontend/src/lib/listenerPaths.ts`
- `frontend/src/lib/moonPhases.ts`
- `frontend/src/lib/publicMusicCatalog.ts`
- `frontend/src/lib/trackVault.ts`
- `frontend/src/styles/landingPage.css`
- `frontend/src/styles/practiceFamily.css`
- `frontend/src/styles/practicePage.css`
- `frontend/src/styles/publicWorldShelf.css`
- `frontend/src/styles/realmDormant.css`
- `frontend/src/styles/scrollPage.css`
- `frontend/tests/listenerDiscovery.test.cjs`
- `frontend/tests/publicCoherence.test.cjs`
- `frontend/tests/publicCuration.test.cjs`
- `frontend/tests/publicProjects.test.cjs`
- `frontend/tests/trackVault.test.cjs`
