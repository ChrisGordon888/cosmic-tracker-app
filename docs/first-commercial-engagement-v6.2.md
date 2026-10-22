# V6.2 — First commercial engagement

For ordered account setup, environment locations, webhook configuration, diagnostics and the fictional $150 acceptance test, use [the manual activation playbook](v6.2-manual-activation-playbook.md). The subsequent readiness review found no confirmed code blocker and changed documentation only; live provider/database acceptance remains pending.

Branch: `feat/cosmic-creative-economy-v6`. No commit, deployment, real customer message, live charge, database connection or real creator-data mutation was performed.

## Implemented transaction path

Configured inquiry → durable private Opportunity with engagement subdocument → existing Resend notification → operator records client agreement, scope and exact USD total → immutable approved quote → hosted Stripe TEST Checkout → server reconciliation / signed webhook → separate scheduling, delivery and next-action recording.

The operator uses `/creator/engagements`, linked from Creator Home. This is one view of existing Opportunities, not a second CRM database. Existing Today’s 3 and owner-scoped GraphQL operations remain. Engagement details have no public GraphQL fields. All commercial endpoints require the configured business operator's database identity and active creator/admin/owner access. Other creators and administrators cannot access these records through the commercial endpoint merely by role.

Public intake passes only through the existing validated form and a server-to-server secret. A unique owner/inquiry index prevents retry duplicates; changed content under the same reference is rejected. Intake waits for indexes before accepting records. If storage fails, email is not attempted. If email fails after storage, the UI explicitly says the inquiry is saved but notification is unconfirmed. Notification acknowledgement can remain pending after an outage without discarding the inquiry or falsely failing an already accepted email.

No old email inquiries are imported. With neither new frontend intake setting configured, V6.1 email-only behavior remains; partial configuration fails closed. Do not call this mode durable commercial intake.

## Payment boundary

- Uses Stripe REST API version `2025-03-31.basil`, hosted Checkout in payment mode, card-only, USD, with post-purchase invoice creation. This is not a pre-payment net-terms invoice engine.
- Operator explicitly records agreement and total (50 cents–$10,000); the pilot form suggests $150 but never silently approves it. Scope/amount are locked after approval. Taxes, cancellation terms and deliverables must be agreed outside the software; no tax calculation is implemented.
- Prices come from the stored approved quote; public clients cannot choose payment amounts. COSMIC stores references/status only, never card details.
- Stable per-engagement Stripe idempotency key and persisted attempt time protect session creation retries. Existing sessions are reused. An uncertain attempt older than 23 hours is blocked rather than risking a second charge after key expiry.
- Raw-body webhook verification uses Stripe's HMAC SHA-256 scheme, timing-safe signature comparison and a five-minute timestamp tolerance. Subscribe to checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired, charge.refunded, charge.dispute.created and charge.dispute.closed.
- Every relevant event re-retrieves current session/payment-intent/charge evidence, checking test mode, exact session/reference, metadata, amount and currency. Paid requires a succeeded payment intent, received total and paid charge. Refund/dispute states are distinguished. An optimistic revision prevents stale concurrent retrievals overwriting newer reconciliations.
- Duplicate/out-of-order events have no email, delivery or fulfillment side effects. They re-read current provider state. Events arriving before local session persistence receive a retryable error. No event ledger is needed for this side-effect-free update, but one would be needed before adding external fulfillment automation.
- Operator reconciliation recovers missed webhooks. Delivery changes re-reconcile payment before proceeding. Scheduling is manually recorded and does not imply payment; payment does not imply scheduling or delivery.
- `/services/payment-return` never confirms payment from browser parameters.
- **Live keys and live webhook events are intentionally rejected. This pass cannot accept real money.** A separately authorized live-readiness pass must follow successful Stripe test-account acceptance.

## Configuration (not changed)

Backend:
- `SERVICES_OPERATOR_ID`: database User `_id` of the single COSMIC business operator, not OAuth subject or client-supplied ID.
- `SERVICES_INTAKE_SECRET`: random server-only shared secret, at least 32 characters.
- `STRIPE_SECRET_KEY`: Stripe sandbox/test `sk_test_…` key.
- `STRIPE_WEBHOOK_SECRET`: signing secret for backend `/services/webhook`.
- `SERVICES_PUBLIC_URL`: canonical frontend origin, HTTPS outside localhost.
- `SERVICES_SCHEDULING_URL`: optional established HTTPS hosted scheduling page.

Frontend server environment:
- `SERVICES_BACKEND_URL`: backend origin (without `/graphql`).
- `SERVICES_INTAKE_SECRET`: same secret as backend.
- Existing `RESEND_API_KEY`, `SERVICES_INQUIRY_FROM`, `SERVICES_INQUIRY_TO`.

Existing NextAuth secret and database settings remain authoritative. New variables must never use NEXT_PUBLIC. Their names were absent from inspected backend/.env and frontend/.env.local; deployed settings were not inspected. No credentials were printed. Preserve real production configuration; set up isolated staging separately.

## Communication, presentation and privacy

The four offers, atmospheric Services page and existing selected SIRENS/music and fictional demo examples remain. No portfolio application or dependencies added. Intake label now explicitly invites project references, music and social/profile links; privacy copy discloses the optional private engagement record.

Existing Resend intake remains the notification boundary. Scope agreement, sending payment links, scheduling invitations and client follow-up remain deliberate human actions in the existing email thread. The configured scheduling URL is an operator link; no availability is invented and no invitations are sent automatically. Stripe receipt/invoice email preferences require account configuration and test acceptance.

Client files remain links-first. No upload capability or confidential-storage claim is added: existing Blob media remains publicly retrievable by URL. Private intake needs owner/client authorization, truly private object storage, upload provenance, limits/scanning, expiring authorized delivery, retention/deletion policy and failure recovery before implementation. Do not attach confidential masters or documents to the current public upload flow.

## Verification completed

- Backend: 18 tests passed (14 service lifecycle/security tests and 4 existing Opportunity regressions). Uses actual service functions, Mongoose schema and fictional in-memory database/provider adapters; no MongoDB durability or real Stripe transaction claim.
- Frontend: 9 inquiry/intake tests passed, including V6.1 compatibility, partial configuration, persistence-before-email, storage failure and notification acknowledgement failure.
- TypeScript and changed-file lint passed; existing Creator Home image warning remains.
- Backend syntax and git diff check passed.
- Production build passed, including the new routes; existing repository image/hooks/unused-variable, multiple-lockfile and Node/npm compatibility warnings remain.
- Browser: actual new frontend rendered in isolated fixture at 390×844 and 1365×900; approval transition, quote display, unconfigured payment failure, separate scheduling/delivery controls and no horizontal mobile overflow verified. Fixture data is ephemeral/mock-only; no account authorization or database persistence was proven by the browser.

## Required staging acceptance

1. Use an isolated database, fictional operator and unrelated creator. Verify MongoDB unique indexes; configure only test-mode settings and a disposable notification inbox.
2. Submit each service via the real form. Reload the operator view; verify durable context and exactly one record on unchanged retry. Block other creators, listeners and anonymous clients. Simulate database/email failure separately.
3. Record fictional scope/approval and $150 total. Create Checkout. Repeat the action/concurrently retry: one Stripe session. Confirm amount, description, customer email and post-payment invoice behavior in Stripe test Dashboard.
4. Complete a Stripe test payment using Stripe's current documented testing workflow. Never use real card details. Check server webhook verification, paid status, invoice reference and manually reconcile after a missed webhook. A browser redirect alone must leave status unchanged.
5. Replay signed events, tamper a signature, test expired timestamps, altered totals/references and a live-mode event. All failures must preserve the prior trustworthy state. Reconcile test refund/dispute and ensure delivery cannot proceed on an unpaid/refunded record.
6. Send no real customer messages. Manually test a disposable scheduling invitation through the chosen provider and record invitation versus confirmed separately. Save next action and delivery evidence; reload.
7. Recheck desktop/mobile in the full authenticated Creator shell with MiniPlayer, not only the isolated fixture.

## Remaining limits / deferred

No live billing, quote revision/cancellation UI, expired-session replacement, automated refunds, multi-currency, deposits, installments, automatic tax, invoice-before-payment/net terms, customer portal, file fulfillment or scheduling webhooks. An expired session or an uncertain attempt past 23 hours requires reviewed Stripe reconciliation; there is intentionally no blind replacement/recharge button. Business retention terms, account setup, monitoring and distributed abuse protection are required before broad public promotion. Operator list is capped at the newest 100 records for this first-engagement scope. No customer-facing booking status is asserted.

Official references:
- https://docs.stripe.com/api/checkout/sessions/create
- https://docs.stripe.com/events/manage-webhook-endpoints

## File inventory / safe checkpoint

Modified:
- backend/index.js
- backend/models/Opportunity.js
- frontend/src/app/creator/page.tsx
- frontend/src/app/services/inquire/page.tsx
- frontend/src/pages/api/services-inquiry.ts
- frontend/tests/servicesInquiry.test.cjs

Added:
- backend/lib/serviceEngagements.js
- backend/routes/services.js
- backend/tests/serviceEngagements.test.js
- frontend/src/app/creator/engagements/page.tsx
- frontend/src/app/services/payment-return/page.tsx
- frontend/src/pages/api/engagements/[[...path]].ts
- frontend/src/server/engagementIntake.ts
- frontend/src/styles/serviceEngagements.css
- frontend/tests/engagementIntake.test.cjs
- docs/first-commercial-engagement-v6.2.md

After review: `git status --short`, `git diff --check`, inspect tracked diff plus every new file; stage only these 16 paths. Inspect `git diff --cached --check` and `git diff --cached`; commit locally only after approval with `git commit -m "feat(services): add test-mode engagement billing workflow"`. No merge or deployment. Authenticated Stripe staging acceptance is still required before claiming a verified test purchase, and a separate live-readiness decision is required before accepting real payment.
