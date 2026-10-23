# Flagship Wave A — security, collaboration proof, founding creators

## Scope and release topology

Continued clean `feat/cosmic-creative-economy-v6` at `44524c2`; local main remains `1acd783`. Neither remote deployment state nor provider configuration was changed. No commit, push, deployment, real records, messages or charges. Existing V5/V6 handoffs and the preceding conversation audit informed this bounded pass. V6.2 manual staging evidence is user-reported, not re-tested here; matched-event and duplicate-event acceptance remains pending.

## Implemented

- Public leaderboard uses PublicLeaderboardIdentity (id/name/image/level/xp), DB projection and explicit mapping. Positive integer limits cap at 100; zero, negative and null reject. Existing frontend query remains compatible. Matching backend release is required to close exposure.
- Invited creators can obtain only existing `release-covers/onboarding/<file>` image capabilities. Existing constraints, server-derived identity, signed callback and suspension checks remain. General catalog/audio/other-project uploads stay denied until active. This is an onboarding-purpose capability, not a claim that Blob path establishes project ownership; metadata mutations still resolve owned records. Existing public Blob caveat remains.
- NextAuth renews missing/invalid/near-expiry backend bearer tokens using its authenticated identity, never old bearer claims. No roles are copied into JWTs. Session polling every 240 seconds and focus refresh feed the existing Apollo token dependency. Backend continues resolving current DB roles. Offline/background-tab recovery still requires real-session staging acceptance.
- Published BoardArtifacts labeled Credit or Process become People & process cards on the existing public World. Title/body/meta/href/order/isPublic are reused; no model or additional publishing contract. Studio Board's existing placement inspector edits these fields and provides approval/privacy guidance. Hidden remains hidden; approved cards are shown only by the existing public-parent query.
- Exact HTTPS YouTube hosts/IDs support opt-in privacy-enhanced embeds; other HTTPS profile/reference links remain external links. No remote HTML injection, arbitrary embeds, autoplay, new player, media upload or automatic publication. Closing removes the iframe. Real licensed/approved videos are not supplied; fixtures are explicitly fictional. Independent video playback is manual; it does not become part of the shared music queue.
- Proof cards do not repeat among ordinary fragments. World afterglow links explicitly to services with COSMIC, not an unimplemented seller booking page. No invented credits or real media was seeded.

## Repeatable two-creator staging acceptance

1. Use isolated staging frontend/backend/MongoDB/Blob and disposable OAuth accounts A and B plus authorized administrator. Confirm environment identity privately before writes. Never use a production cookie, real song or confidential upload.
2. Have A/B sign in once. Admin uses existing `/admin` to Invite each existing user. Verify creator/invited and admin activation policy. There is no invitation-email/token system added.
3. In separate browser profiles, complete `/creator/onboarding`: distinct fictional artist identities, first private World, first track, tiny original cover image. Cover uploads must succeed while invited; catalog-audio and other release upload requests must fail. Self-activation of administrator invitations must fail. Admin activates after reviewing completed setup. The existing self-service onboarding route remains available; this release does not turn COSMIC into invite-only registration.
4. Listener, signed-out and suspended accounts must fail uploads; active creator uploads succeed. Use a small original disposable recording after activation. Verify track/profile/world owner IDs derive from signed-in account, not request-supplied IDs.
5. A must not read or mutate B's private track, assets, board, experiment or World. Check direct GraphQL as well as navigation. Anonymous leaderboard query may select id/name/image/level/xp, but querying email, permissions or history must fail GraphQL validation. Default ranking still renders.
6. Follow Library → selected song Intelligence → save/reopen/audition experiment → project placement → non-first track Workbench → Prepare Release. Test Realm 0 and Unassigned, refresh and browser Back at desktop and 390px. Private experiment does not publish a project.
7. In Studio Board create fictional notes, select a card, open Release page placement, choose Collaborator credit or Process/session reference. Enter title, role, short context and an authorized HTTPS reference. Keep one private; explicitly show one. Save Studio Board. Refresh to prove persistence. Existing save replaces the board snapshot; avoid simultaneous editing.
8. Publish two Worlds sharing a slug under A/B using manual Publish. Include public and private children. Open each ID-qualified Share link signed out: correct World, correct track order, no private child or hidden proof. World Canon, Nexus selection and Spotlight must not change. Public child playback keeps its Realm and queue.
9. Confirm People & process appears only when published cards exist; unsafe links never render. Before Load video there must be no iframe. Load/Close with an approved disposable/public video; test denied embedding/network failure using the always-available external link. Check keyboard focus, screen reader names, narrow layout and shared MiniPlayer clearance in the full shell.
10. In disposable staging verify token refresh across the five-minute renewal boundary and expired-token recovery, including tab focus/offline recovery. Suspending the creator must still deny backend mutations despite a renewed token. Never paste cookies or tokens into logs/chat.
11. Unpublish a World and verify anonymous resolution/proof disappears. Archive fixtures using existing controls; no mass Blob deletion. Record acceptance results separately from this fixture-only report.

## Verification

Backend command from repository root:
`node --test backend/tests/leaderboardPrivacy.test.js backend/tests/foundingCreatorAccess.test.js backend/tests/publishingLifecycleV5.test.js backend/tests/releaseFlow.test.js backend/tests/serviceEngagements.test.js backend/tests/creativeExperiments.test.js backend/tests/catalogProjectIntegrity.test.js`

Frontend command from frontend:
`node --test tests/backendAccessToken.test.cjs tests/creatorUpload.test.cjs tests/worldProof.test.cjs tests/worldExperience.test.cjs tests/releaseSharing.test.cjs tests/servicesInquiry.test.cjs tests/engagementIntake.test.cjs`

Backend tests use actual resolvers/schema with fictional Mongoose adapters; frontend tests use actual policy/SDK/session decoding and rendered components with fixtures. No MongoDB, OAuth-provider, actual Blob upload or Stripe transaction acceptance is claimed. Browser preview compiled the actual WorldProof React component with fictional props, not the full authenticated app. Desktop and 390px frame inspected; load/close transitions verified. Synthetic video ID cannot prove playable approved media. No real collaborator data was used.

Type check: `npx tsc --noEmit --incremental false`.
Changed-file lint: `npx eslint src/server/backendAccessToken.ts src/server/creatorUpload.ts src/app/api/upload/route.ts 'src/pages/api/auth/[...nextauth].ts' src/lib/worldProof.ts src/components/world/WorldProof.tsx src/components/signal-board/StudioBoardWorkspace.tsx src/components/SessionWrapper.tsx 'src/app/releases/[slug]/page.tsx'`.
Backend syntax: `node --check backend/resolvers/index.js` and `node --check backend/schemas/index.js`. Integrity: `git diff --check`. Production: `npm run build` (includes repository lint/type checks).

Final results: **29 backend tests passed; 32 frontend tests passed; TypeScript passed; changed-file ESLint passed with one existing Release World image warning; backend syntax and diff check passed; production build passed after the final session-polling change.** Build retained existing repository hooks/image/unused-variable warnings and multiple-lockfile/runtime warnings. Local Node 19/npm 11 compatibility warning remains; use a supported runtime for release checks. Full authenticated staging, real media playback, actual Blob upload, matched Stripe processing and provider replay were not performed.

## Wave B — acceptance and operational gates, no activation yet

1. Finish existing activation playbook with a new fictional $150 engagement and matching Checkout Session. Use the current snapshot endpoint `/services/webhook`. Before pressing Reconcile, receive the matching signed event and reload: paid, correct session/amount/currency, no automatic scheduling/delivery. Resend the same provider event twice: one Opportunity/session, unchanged financial outcome, no duplicate effects. Exercise concurrent reconciliation, delayed event, refund/dispute, abandoned session and foreign operator denial. Success requires provider delivery evidence and MongoDB persistence, not just an unmatched HTTP 200.
2. Add bounded distributed inquiry protection at the existing public handler: deployment-aware IP treatment, short-lived counters, retry-safe behavior, no raw email/IP logging and no lost submitted fields. Acceptance: abusive new UUIDs are throttled across instances, ordinary retries remain safe, shared-network users have an understandable recovery path, storage failure cannot trigger email.
3. Add deployment checks/monitoring: supported runtime, deterministic install/build/tests, frontend/backend schema compatibility, DB/index readiness, redacted error correlation, webhook failure alerts, pending-notification inspection and tested backup recovery. Define expired/uncertain Checkout recovery without blind second charges. Acceptance: simulated outage is detectable and recoverable, preserving immutable approved quote and owner scope.
4. Separate explicit live-readiness change: business verification, approved cancellation/refund/tax/retention terms, controlled secrets/endpoints, environment guards and live event reconciliation tests. Current keys/events remain test-only. Do not simply replace the test key. Any real charge needs owner authorization and a controlled customer-facing acceptance plan.

Stripe references checked for design only: https://docs.stripe.com/webhooks and https://docs.stripe.com/connect. No integration or account settings changed.

## Wave C — future curated marketplace direction, not implemented

- Reuse User/CreativeProfile for creator identity and existing Worlds for evidence. Introduce versioned creator-owned Offer records only when launching seller offers; do not turn frontend static offer definitions into a payment authority.
- Preserve operator-only V6.2 engagements. A future commercial engagement must distinguish immutable sellerOwnerId, customer identity, platform operator, payment recipient/connected account, approved offer version, scope, price/currency and fee snapshot. Opportunity remains private creator follow-up; never give a seller all operator engagements. Existing ownerId cannot safely stand in for all these roles.
- Evaluate Stripe Connect hosted seller verification after deciding charge model, merchant responsibilities, supported countries and dispute liability. Server-side account status/capabilities gate selling; joining Creator OS must not imply payout eligibility. No arbitrary client-selected payment destination.
- Snapshot transparent fees before acceptance. Store provider payment, fee, transfer, refund, dispute and payout references separately; a payment is not a payout. Reconcile provider events idempotently with an event inbox/outbox before introducing external fulfillment side effects.
- Refund/dispute workflows require reason, authorization, immutable financial history, fee/transfer reversal policy and reconciliation. Seller suspension stops new offers/checkout without erasing existing obligations or automatically confiscating funds.
- Rights approval remains separate from artist claims. Digital products require versioned licenses, paid buyer entitlements, genuinely private authorized delivery, retention/revocation and atomic limited inventory. Service scheduling/delivery remains separate from those entitlements.
- Roll out to two or three curated sellers with fictional test transactions first; verify cross-seller/customer/operator isolation, fees, negative balances, refunds/disputes and payouts in sandbox before any live approval. No marketplace schema, Connect account or payout was created in Wave A.

## Owner decisions

Approved public collaborator names/roles, media permissions and profile URLs; first founding-creator cohort; live business/refund/cancellation/retention terms; whether confidential uploads are a launch requirement. Marketplace charge/fee/liability decisions belong to Wave C. None is needed to review current fictional functionality.

## File inventory

Security/access:
- backend/schemas/index.js
- backend/resolvers/index.js
- backend/tests/leaderboardPrivacy.test.js
- frontend/src/server/backendAccessToken.ts
- frontend/src/pages/api/auth/[...nextauth].ts
- frontend/src/components/SessionWrapper.tsx
- frontend/src/server/creatorUpload.ts
- frontend/src/app/api/upload/route.ts
- frontend/tests/backendAccessToken.test.cjs
- frontend/tests/creatorUpload.test.cjs

World proof:
- frontend/src/lib/worldProof.ts
- frontend/src/components/world/WorldProof.tsx
- frontend/src/styles/worldProof.css
- frontend/src/app/releases/[slug]/page.tsx
- frontend/src/components/signal-board/StudioBoardWorkspace.tsx
- frontend/tests/worldProof.test.cjs

Founding acceptance/handoff:
- backend/tests/foundingCreatorAccess.test.js
- docs/flagship-wave-a.md

Review git diff and untracked files, then stage only this inventory if approved. Do not use a broad add while other work may exist. Inspect staged diff/check before a separately authorized checkpoint. No migration is required. Rollback is a coordinated frontend/backend code rollback; rolling back the leaderboard fix restores the known exposure and is not an acceptable public fallback. Main and deployments remain unchanged.
