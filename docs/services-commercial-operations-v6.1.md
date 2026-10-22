# V6.1 Services and Commercial Operations handoff

Branch: `feat/cosmic-creative-economy-v6`. Uncommitted; no deployment or real customer submissions.

## Completed

Four visible services share one definition across discovery, intake, validation and operator email: Creative Development pilot (~$150), Songwriting / Production, Lessons / Workshops, Artist-World / Digital Work. Other services are scoped separately. Existing service slugs, atmospheric presentation and fictional/artist-owned work examples remain.

Each card preselects the existing inquiry form. Submission disables duplicate actions; unchanged retries retain the same UUID and stable provider request. Success requires provider acceptance and returns a reference, explicitly not a booking/payment confirmation. Failure retains fields. No client information is persisted in browser storage.

## Operations and external configuration

Verify `RESEND_API_KEY`, `SERVICES_INQUIRY_FROM` (verified sender) and `SERVICES_INQUIRY_TO` (monitored inbox) in the intended environment. Credentials were not printed or live delivery claimed. Use a disposable mailbox for an authorized delivery/reply test before inviting customers.

Scheduling, availability, invoices and hosted payment links are not integrated. Christopher must agree scope, timing, price and terms, then arrange these externally. No payment details are collected. Existing Opportunities can be used manually for follow-up; inquiry submissions do not create CRM records.

Resend supports idempotency keys for 24 hours: https://resend.com/changelog/idempotency-keys . Retry identity is retained only while this form is mounted; a reload/new submission can send again. The reference is a correlation identifier, not a durable booking ledger. Provider acceptance does not prove inbox delivery. Existing origin, body-size, validation and honeypot protections remain; distributed/edge rate limiting is still advisable before broad public promotion.

## Verification

- Six focused service inquiry tests passed: validation, provider success/failure, configuration, stable retry payload/key/reference, changed payload, malformed UUID, all service offers and transport failure.
- TypeScript passed.
- Changed-file lint passed with one existing Services image warning.
- Production build passed (39 static pages); repository warnings remain for images, hooks, unused variables, multiple lockfiles and Node 19/npm 11 compatibility.
- Browser used actual Services/form source in an isolated local fixture with mock delivery only. Desktop 1365px and mobile 390px layouts inspected. Songwriting and artist-world selection checked. Failure retained entries; success displayed receipt and disabled resubmission. Mobile form and service discovery had no horizontal overflow.
- No live customer email, database, booking or payment verification performed.

## Manual acceptance

1. Open `/services` on desktop and at 390px. Confirm the four service choices, pilot pricing and custom-scope caveat.
2. Follow each card; verify selected offer, summary and price agree. Change the dropdown and verify summary updates. Test the Not sure route.
3. In an isolated fixture or staging environment using a disposable recipient, test required fields, failure, unchanged retry, and success. Verify failure preserves entries and success shows a reference without promising a booking.
4. For separately authorized real email acceptance, check recipient delivery and reply-to behavior. Do not use real customer information.
5. Confirm inquiry follow-up can lead to an agreed external schedule and hosted invoice/payment link before claiming bookings/payments are operational.

## File inventory

- frontend/src/lib/serviceOffers.ts (new)
- frontend/src/app/services/page.tsx
- frontend/src/app/services/inquire/page.tsx
- frontend/src/pages/api/services-inquiry.ts
- frontend/src/server/servicesInquiry.ts
- frontend/src/styles/servicesPage.css
- frontend/tests/servicesInquiry.test.cjs
- docs/services-commercial-operations-v6.1.md (this handoff)

## Safe checkpoint (owner executes after review)

Run `git status --short`, `git diff --check`, and review `git diff` plus both new files. Stage only the eight files listed above with explicit paths. Review `git diff --cached --check` and `git diff --cached`. Then commit with `git commit -m "feat(services): establish V6.1 studio inquiry workflow"` and confirm `git status --short`. Do not merge or deploy as part of this checkpoint.
