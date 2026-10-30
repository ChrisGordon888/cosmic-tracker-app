# COSMIC Commerce V1 — implementation and owner acceptance

Branch: `feat/commerce-integrations-v1`, stacked on V6.7 `f17995e`.
This implementation is local only. No products, provider accounts, customer
records, payments, notifications or editorial placements were created by this pass.

## Routes

| Route | Purpose |
| --- | --- |
| `/shop` | Public persisted catalog; four category filters |
| `/shop/{slug}` | Public eligible offering and primary action |
| `/creator/marketplace` | Private operator catalog and provider settings |
| `/creator/marketplace#providers` | Exact-host approval, destinations, optional Blaze configuration |
| `/creator/marketplace/preview?id={id}` | Authenticated draft presentation; never publishes |
| `/creator/marketplace/report` | Consented activity and persisted service referrals, last 90 days |
| `/creator/engagements` | Existing agreement, verified billing, booking and delivery workflow |

Public reads omit drafts and offerings whose provider is disabled or whose
delivery configuration is no longer eligible. Missing infrastructure and API
failures display errors rather than fabricated zero counts. Incomplete drafts
can be saved; preview requires complete delivery fields and reports missing
configuration until supplied. Preview can display a disabled provider without
enabling it publicly. Slug edits change the public URL; there is no redirect history.

## Configuration and owner setup

Reuse existing backend MongoDB, `NEXTAUTH_SECRET`, `SERVICES_OPERATOR_ID`, and
frontend `NEXTAUTH_SECRET` / `SERVICES_BACKEND_URL`. The configured operator must
pass existing Services authorization and normal Creator authentication. No new
provider credentials are required or accepted in catalog fields. Never paste
tokens, signed private-file URLs or credentials into public artwork/destinations.

1. Sign in normally at staging frontend `http://localhost:3001`; backend remains
   `http://localhost:4001` against the isolated staging database.
2. Open Marketplace from Creator Home. Configure the relevant provider and save.
   Affiliate and hosted-product hosts are exact hostnames, without wildcards.
3. Create a draft with a unique lowercase hyphenated slug, approved public artwork,
   description, pricing explanation, provider, presentation and CTA. Add included
   content, evidence, FAQ and a positive featured position as appropriate (0 means
   not featured). Publication requires complete configuration.
4. Preview privately, verify the destination manually, then publish only an
   owner-approved offering. URL validation checks the destination shape/allowlist;
   it does not establish merchant approval, availability or successful fulfillment.
5. Confirm the public page in a signed-out browser. Unpublish to withdraw it;
   disabling a provider withdraws all its offerings from subsequent public reads.
   Saves use revisions: a stale editor receives 409 and must reload.

### BeatStars

In BeatStars Studio, use Features → Players and copy the official player URL or
iframe from the account. See the [official Blaze setup instructions](https://help.beatstars.com/hc/en-us/articles/28634906113563-How-Can-I-Create-a-Blaze-Player-for-my-Personal-Website).
Only `https://player.beatstars.com` is accepted for embedding. The server extracts
only the iframe URL; pasted scripts/attributes are not rendered. Provide an approved
BeatStars destination for the always-available direct fallback. Visitors explicitly
load the sandboxed, no-referrer player; it is not loaded automatically. Verify the
real account/player and checkout behavior before release. No genuine player was
configured or transacted with during this pass; fixture validation is not provider
acceptance. BeatStars owns licensing, checkout and file delivery.

### Services and Cal.com

Use internal presentation and an existing inquiry destination, for example
`/services/inquire?offer=creative-direction-session`. Both service provider types
enter the same existing workflow. Configure actual hosted calendar links through
`SERVICES_DISCOVERY_SCHEDULING_URL` and `SERVICES_SCHEDULING_URL` on the backend.
No public paid-calendar bypass or second payment flow was added. The existing
operator scheduling operation checks approval and verified payment for paid
sessions; discovery is separate. Opening a link is not booking confirmation.
Actual calendar booking, calendar synchronization and customer communication
remain provider/manual operations. Do not configure duplicate Cal.com charges.

### Selects and Originals

Affiliate publication requires merchant, recommendation and explicit attestation
of an established relationship. The commission disclosure appears next to the
offer and the link is marked sponsored. Supply a genuine approved merchant link;
none was invented for acceptance. Originals use an approved hosted HTTPS checkout.
The external provider must supply payment verification and protected fulfillment.
Native product orders/downloads are deliberately not implemented; existing
Services Stripe verification is preserved and live payment configuration unchanged.

## Measurement and trust boundaries

- Page measurement is off by default and enabled only by a per-page visitor
  checkbox. No cookies, fingerprinting, IP or customer identifiers are stored in
  commerce events. Closing the page does not persist measurement consent.
- Counts are events, not unique visitors. Only operator-approved `utm_source`
  campaign codes are retained; everything else becomes `direct`. Do not place
  personal data in approved campaign codes. Other campaign parameters are not kept.
- Random event IDs have a unique owner/event index; retries do not create duplicate
  events. MongoDB TTL removes events after approximately 90 days. The process-local
  300-event/minute cap is a basic guard, not distributed bot protection. Anonymous
  consent assertions and clicks can be forged; these are directional analytics.
- Optional service attribution is attached only after opt-in navigation and is
  checked against a currently published matching service listing. Persisted inquiry
  totals are grouped separately by payment mode. They are not purchases; campaign
  attribution is not carried through to engagement revenue.
- External sales and native product purchases explicitly remain unknown/unavailable.
  Existing verified service payments remain in Engagements. Test payments are never
  represented as live commerce revenue.
- Public DTOs exclude owner IDs, revisions, draft status, configuration and customer
  data. Operator API checks server-side Services authority. External images are
  approved public media loaded directly with no referrer, not protected fulfillment.
- No arbitrary provider script execution, public fixture route or auth bypass.

## Verification completed

- Backend commerce: 6/6 focused tests passed, including actual loopback Express
  requests with fictional JWT users and mocked models: owner/foreign/anonymous
  authorization, draft privacy, preview, publish/unpublish, stale revision,
  provider disable, URL rules, event consent/deduplication and campaign sanitization.
- Existing backend Services/booking/security regressions: 29/29 passed.
- Frontend commerce/intake/inquiry/booking-time tests: 14/14 passed.
- TypeScript (`tsc --noEmit --incremental false`) passed.
- Changed-source lint: 0 errors, 3 image warnings (Creator Home, Shop,
  OfferPresentation). Approved remote artwork uses plain images with no-referrer.
- Normal Next production build passed. Existing warnings include workspace-root
  inference from multiple lockfiles; no unrelated configuration was changed.
- Diff whitespace checks passed. No dependency was added.
- Built frontend browser: Shop loaded the genuine empty staging catalog, category
  filtering worked, and signed-out Marketplace showed the Creator login gate.
  At 390px, document width was 390px and categories remained usable. Existing
  mobile navigation wraps to two rows; content remains scrollable with bottom padding.

These results do NOT establish authenticated MongoDB CRUD, a genuine Blaze embed,
merchant checkout, or a newly submitted Services inquiry. Browser session available
to the agent was signed out. No database fixture products were seeded.

## Remaining manual acceptance

1. Normal operator login: create an approved draft, reload, edit, preview, publish,
   confirm anonymous visibility, unpublish and confirm 404. Repeat with another
   creator: private controls and API must reject access. Open two editor tabs and
   verify a stale save fails safely. Check forms at desktop and 390px.
2. Configure a genuine Blaze player and approved merchant/product destinations.
   Verify click-to-load, close, blocked-embed fallback, provider checkout navigation,
   disclosures, artwork and no unintended audio autoplay. Do not buy in this test.
3. Validate a service offer preselects its existing inquiry. Submit only a separately
   approved identifiable test inquiry with consented attribution; verify one durable
   engagement and accurate mode. No customer email was sent during this pass.
4. Existing Engagements → Record booking: use pointer and keyboard to change the
   Booking state selector on a disposable staging engagement. Save, reload and
   verify timezone/state. Verify unpaid paid-session rejection and discovery access.
   The reported selector issue was inspected but not reproduced without an
   authenticated session; no speculative selector fix was made.
5. Opt into measurement, visit/click an approved campaign link, then check Activity.
   Without opt-in there must be no new event. External click totals must never
   become confirmed purchases. Confirm owner-only report access.

## Release and first-revenue gate

No push/merge/deploy is authorized. The branch is stacked on unreleased V6.7;
review that dependency rather than cherry-picking blindly. Release backend commerce
routes/models with the frontend proxy and pages; confirm existing environment
targets, operator identity and database indexes in the authorized environment.
Do not automatically seed a production catalog. Provider and offering approval,
authenticated acceptance, real destination/fulfillment verification and a separate
release authorization remain before public launch. External provider revenue can
use an approved provider's existing checkout after release; native COSMIC digital
fulfillment and live Stripe activation are not prerequisites and are not completed.

No existing private media was migrated or made public. Existing public-URL privacy
limitations remain separate from commerce launch readiness.

## Changed-file inventory

- `backend/index.js`
- `backend/lib/commerceCatalog.js`
- `backend/lib/commerceMeasurement.js`
- `backend/lib/serviceEngagements.js`
- `backend/models/CommerceEvent.js`
- `backend/models/CommerceOffering.js`
- `backend/models/CommerceProvider.js`
- `backend/models/Opportunity.js`
- `backend/routes/commerce.js`
- `backend/routes/services.js`
- `backend/tests/commerceCatalog.test.js`
- `backend/tests/commerceRoutes.test.js`
- `frontend/src/app/creator/marketplace/page.tsx`
- `frontend/src/app/creator/marketplace/preview/page.tsx`
- `frontend/src/app/creator/marketplace/report/page.tsx`
- `frontend/src/app/creator/page.tsx`
- `frontend/src/app/services/inquire/page.tsx`
- `frontend/src/app/shop/[slug]/page.tsx`
- `frontend/src/app/shop/page.tsx`
- `frontend/src/components/commerce/OfferMeasurement.tsx`
- `frontend/src/components/commerce/OfferPresentation.tsx`
- `frontend/src/components/commerce/ProviderEmbed.tsx`
- `frontend/src/lib/commerce.ts`
- `frontend/src/lib/publicJourney.ts`
- `frontend/src/pages/api/commerce/[[...path]].ts`
- `frontend/src/server/servicesInquiry.ts`
- `frontend/src/styles/commerce.css`
- `frontend/tests/commercePresentation.test.cjs`
- `docs/commerce-v1.md`
