# COSMIC Editorial Studio V1

Implementation branch: `feat/editorial-studio-v6`; baseline `ce23b96`.

## Delivered

`/admin/editorial` consolidates existing editorial operations without replacing their authorities. The existing admin gate and server capability checks remain authoritative. URL parameters preserve Realm and tab selection, including Realm 0 and a separate unassigned category.

- Overview: authorized inventory, stored placement counts, effective server eligibility, prerequisites and recent placement history.
- Signals / Review: authorized published evidence, approve or request changes, explicit publish/withdraw, review notes and timestamps. Existing operations do not have a separate rejection state.
- Official Soundtrack: eligible Realm candidates, effective versus stale references, selection/withdrawal and destination-specific batches.
- Worlds / Discovery: independent Discovery admission and creator-Canon Nexus World selection; cross-Realm/mixed-World browsing is explicit.
- Nexus Sampler: independent ordered 0–9 selections, accessible move controls, stale-reference explanations and existing revision checks. Concurrent changes preserve the draft and require reloading saved state.
- Global controls: Spotlight, Realm anchors, published Signal order, selected Worlds and stored configuration.
- Guided operations: select → fresh authorization/eligibility → exact preview → confirmation → existing mutation → fresh stored-state verification. Batches stop after a failure and distinguish succeeded, failed, unattempted and uncertain results. No cross-item atomicity is claimed. Lost responses are not offered as blind retries.
- Explicit anonymous metadata verification uses credential-free fetch and actual public filters without scheduled-publication side effects. It does not prove audio-byte access or rendered public-page parity. Results are invalidated when known editorial state changes.

Legacy `/admin/nexus` and `/admin/nexus/editorial` remain operational and unchanged.

## Backend boundaries

Added metadata-only `editorialStudioAssessment`, nullable/read-only `editorialStudioConfig`, and `publicEditorialDelivery`. Assessments reuse source readiness, creator eligibility, public filters and existing capability checks. They return reasons and IDs, never private media or account details. Arbitrary IDs do not reveal unrelated private metadata. The assessment request limit is 500 references; exceeding it produces an explicit error rather than invented eligibility.

An internal Symbol suppresses scheduled-publication processing only for Studio eligibility/public verification and sampler mutation validation. Ordinary public queries retain their existing behavior. No database models, migrations, permission grants or new publication mechanisms were introduced. Review, publication and placement mutations retain server-side enforcement and existing audit behavior.

Existing placement history is bounded to 200 records. Review/publication history remains on tracks. Legacy Spotlight/anchor/order mutations do not all append placement-history events; this pass does not claim a new comprehensive audit log.

## Verification and evidence

- Full backend suite: **132 passed**.
- Full frontend suite: **224 passed** (includes seven action-layer and six Studio tests).
- TypeScript: passed with incremental output disabled.
- Changed application-file ESLint: no errors; one `no-img-element` warning for lazy public World artwork.
- Backend syntax and Git diff checks: passed.
- Normal isolated production build: blocked by DNS resolution of `fonts.googleapis.com` for Geist/Geist Mono.
- Isolated production build with temporary Next font-response fixtures: passed compilation, type/lint validation, page generation and route output. This verifies application build correctness, not real font downloading. No application fonts, environment files or running app servers were changed.
- Browser: actual Studio components/hooks with an in-memory Apollo substitute, not real authentication/MongoDB. Verified approval without publication, separate publication, sampler add/reorder/save, independent Discovery, a two-item soundtrack withdrawal batch, mobile Spotlight confirmation, keyboard sampler activation and confirmation focus. Desktop viewport 1280px and 390px iframe inspected, including long-title wrapping.
- Automated fixtures cover capabilities/revocation, unauthorized and suspended identities, missing references, private/protected eligibility, Realm 0, unavailable-versus-empty data, sampler conflicts, partial failures and uncertain post-write results. Existing backend regressions cover actual editorial mutation contracts with mocked models.

**No staging or production data was queried or mutated for acceptance.** A fixture success message means the mock server state was verified, not MongoDB persistence. Authenticated cross-account acceptance and real anonymous audio/page checks remain release gates.

## Safe local fixture

From repository root:

```sh
node frontend/dev/editorial-studio/preview.cjs
```

Open `http://127.0.0.1:4337/admin/editorial?realm=202&tab=signals`, `/mobile`, or `/desktop`. This standalone dev harness binds loopback, refuses `NODE_ENV=production`, is not an application route, uses fictional data and intercepts fetch. Reload resets all fixture state. Stop only this harness after testing; leave staging 3001/4001 alone.

## Authenticated acceptance before release

Use isolated, explicitly disposable staging records and current frontend/backend code, with configuration managed by Christopher. Do not test mutations on the real music catalog.

1. Sign in as a review-only admin. Open Studio → The Veil → Signals. Inspect candidate evidence; request changes with a note or approve. Confirm approval does not publish or place anything. Reload and verify the review record.
2. With `nexus.publish` authority, preview and publish an approved fictional Signal; reload. Confirm other placements remain unchanged. Test withdrawal and its documented Spotlight/anchor/order cleanup.
3. With `nexus.editorial` authority, select the same eligible Signal for Official Soundtrack. Independently select Discovery and a creator-Canon Nexus World. Verify each preview and persisted destination without cross-propagation.
4. Add/reorder sampler entries; save and reload. In a second editor session change the sampler, then attempt the stale first-session preview. Confirm revision rejection and preserved draft. Exercise empty and nine-item sequences.
5. Test soundtrack/Discovery/World batches with disposable records. Revoke eligibility between preview and confirmation; verify prior successes remain, failure stops subsequent operations, and retry excludes successes/uncertain writes.
6. Test Spotlight, Realm anchor and published ordering. Confirm normal public Realm/Nexus output using a signed-out window. The Studio's anonymous check must return current IDs; no audio URLs should appear in its payload.
7. Review-only admin, publisher-only grant, placement-only grant, owner, suspended admin and ordinary creator: verify each boundary. Ordinary creator forged permissions must not gain editorial authority. Retest Realm 0 and unassigned independently.
8. Check stale references, private/protected children, ineligible creators, API failure and missing config. No failed request should appear as zero; no read should create config or process due schedules.
9. At 390px, use keyboard/touch to open details, prepare/cancel/confirm, reorder and retry. Verify legacy admin routes still perform their original operations.

## Remaining limitations

No live authentication, MongoDB persistence, cross-session concurrency, browser CORS configuration or real public-media delivery was verified in this pass. The 500-reference assessment ceiling needs explicit pagination if inventory grows beyond it. Per-item batch mutations are sequential, not transactional. Other legacy destination mutations do not gain sampler-style database concurrency revisions; fresh preflight detects known changes but cannot make them atomic. Missing/private artwork gets a neutral placeholder. Production release still needs an unmocked network-capable build and authenticated staging acceptance.

## File inventory

Modified:
- `backend/resolvers/index.js`
- `backend/schemas/index.js`
- `frontend/src/app/admin/layout.tsx`

Added:
- `backend/lib/editorialAssessment.js`
- `backend/tests/editorialStudio.test.js`
- `frontend/src/app/admin/editorial/page.tsx`
- `frontend/src/components/admin/editorial/EditorialStudio.tsx`
- `frontend/src/components/admin/editorial/EditorialCandidate.tsx`
- `frontend/src/components/admin/editorial/EditorialSequence.tsx`
- `frontend/src/components/admin/editorial/EditorialActionReview.tsx`
- `frontend/src/components/admin/editorial/EditorialPublicCheck.tsx`
- `frontend/src/components/admin/editorial/useEditorialStudio.ts`
- `frontend/src/components/admin/editorial/useEditorialActions.ts`
- `frontend/src/components/admin/editorial/editorialStudio.css`
- `frontend/src/graphql/editorialStudio.ts`
- `frontend/src/lib/editorialStudio.ts`
- `frontend/tests/editorialStudio.test.cjs`
- `frontend/tests/editorialActions.test.cjs`
- `frontend/dev/editorial-studio/preview.cjs`
- `frontend/dev/editorial-studio/mock.cjs`
- `docs/editorial-studio-v1.md`
