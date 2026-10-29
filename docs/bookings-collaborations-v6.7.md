# V6.7 — bookings, attribution and commercial UX

Stacked on clean V6.6 `79d7d0d`, branch `feat/bookings-collaborations-v67`. V6.6 remains independently reviewable. Owner reports authenticated navigation/count/filter/search acceptance; this is not independently repeated here. No production data, provider settings or live payments changed.

## What is usable
- `/creator/engagements`: lifecycle-derived primary action, original operator note retained inside details, one editable booking state. The old disabled Scheduling select is now an explanatory readout. Native booking selects use dark native controls; no replacement select widget. The reported new-selector mouse/keyboard failure was not reproducible without the authenticated session, so its resolution is NOT claimed from CSS changes alone.
- Local date/time plus IANA zone converts to a UTC instant. Chicago winter/summer tests pass; nonexistent spring-forward and ambiguous fall-back times are explicitly rejected. Choose another unambiguous time and confirm with the client. No silent timezone assumptions.
- Upcoming sessions: next20 future confirmed bookings across the authorized payment-mode scope, independent of latest100 inquiry search. Repeated manual saves update the same nested booking, cancellation/rescheduling clears active date. Provider owns conflicts across engagements.
- Separate hosted discovery/paid actions. `POST /api/engagements/:id/schedule` uses existing authenticated proxy/backend operator checks. Paid action independently reconciles Stripe; discovery requires owned engagement only. Opening a provider page does not confirm a booking; manual provider confirmation still required. No customer data appended to booking URLs.
- Release World → Signal Board → Studio Board → select/add a Note → Release page placement → Collaborator credit or Process. Existing name/title, role, context and HTTPS link fields remain canonical. Permission checkbox records owner attestation for exact content; edit identifying content to reset/hide, or uncheck and save to withdraw. Save to Cloud persists it. No project access/ownership conferred.
- Public `/releases/[slug]?world=...` People & process displays consented public cards and safe HTTPS profile/reference links. Empty state is explicit. Work together with COSMIC goes to existing Services inquiry with an editable public World reference; it contacts Christopher, not credited contributors. No inquiry is submitted automatically.

## Consent compatibility / release gate
Public Credit/Process cards without recorded permission now fail closed, including legacy public cards. No record is migrated or rewritten. Owners must review and explicitly confirm permission before restoring visibility. This is an intentional public-content behavior change and needs staging review before release. Private credits never imply consent. Consent fingerprint/timestamp are stored privately on BoardArtifact and not exposed by GraphQL. Existing owner mutation authenticates before reads; validates all consent before its existing replacement write. Other fragments and Nexus editorial authorities retain existing behavior.

The existing board save replaces its artifact collection and is not transactional; this inherited limitation remains. No new collection, rights grant, consent-email system or collaborator authentication was introduced. An owner's recorded permission is an attestation, not legal verification. Already-downloaded public media cannot be revoked by withdrawing a card.

## Cal.com setup (not activated)
1. Owner selects the Cal.com account and connects the intended calendar. Create separate discovery and paid-client event types, with approved duration, availability, timezone, meeting location and cancellation rules. Turn OFF provider payment collection; Stripe stays payment authority.
2. Copy HTTPS event links. Backend variables: `SERVICES_DISCOVERY_SCHEDULING_URL` for discovery, existing `SERVICES_SCHEDULING_URL` for paid sessions. No frontend public secret or Cal API credential is required. Existing non-Cal HTTPS links remain compatible. Missing links disable only the relevant action with explicit copy.
3. Configure isolated staging first and restart its backend under owner control. On a disposable inquiry prepare discovery; on an approved independently paid sandbox engagement prepare paid scheduling. Do not create a real booking or send invitations without separate authorization.
4. After an authorized provider test, record its confirmed time/reference/meeting link, refresh and compare provider timezone, then test cancellation/reschedule manually. Hosted links can be forwarded; provider availability is NOT a payment authorization boundary. COSMIC independently guards paid confirmation.

Official references reviewed: https://cal.com/embed and https://github.com/calcom/help/blob/main/webhooks.mdx . Hosted link chosen over optional embed to avoid third-party loading/customer prefill and additional dependencies.

### Event synchronization prepared, not implemented
No webhook route exists and no automatic synchronization is claimed. A subsequent bounded integration needs a configured provider account/test event, raw-body HMAC-SHA256 verification against X-Cal-Signature-256 using a server secret, server-issued unguessable engagement correlation (never email or an arbitrary client ID alone), durable booking UID/event deduplication, replay/out-of-order safeguards and explicit cancellation/reschedule handling. Verify provider account/event ownership, independently reconcile payment before paid confirmation and test actual signed create/reschedule/cancel/replay. Do not configure a webhook pointing at an invented endpoint. Browser redirect/embed callbacks are not trusted booking evidence.

## Collaboration scope deliberately deferred
The repository has a private `/profile` and creator CreativeProfile records, but no existing public creator-profile route to safely aggregate onto. This pass delivers the authorized minimum: owner-controlled population and public World surface. Public profile identity association/approved-project aggregation remains a separate bounded implementation; external approved HTTPS profile references already render. Nexus continues existing World discovery rather than a new feed. No chat, shared editing, ownership, payouts, Stripe Connect or marketplace.

## Verification and manual acceptance
Automated: 151 backend regressions passed before two additional resolver/GraphQL consent tests; those two plus the original three consent tests passed (5/5). Focused frontend16/16 passed; TypeScript passed; changed-source lint no errors, one existing release-page image warning. Backend syntax and diff checks passed. Normal Next production build passed in an isolated copy of the same route tree to avoid disrupting staging, without adding fixture routes.

Browser available to the agent still shows Creator authentication required. Therefore authenticated desktop/390px, pointer/keyboard dropdown, actual Mongo save/refresh and provider booking tests are outstanding. No bypass, fixture route, real booking/email/payment, staging seed or production edit was performed.

Manual staging checklist, fictional records only:
1. Creator Home badge → Engagements; compare counts and filters/search. Paid record's primary label must not request another payment; saved operator note remains visible.
2. Mouse and keyboard change Record booking → state; old Scheduling is read-only text. At390px verify all fields/buttons/focus visible without horizontal overflow.
3. Free discovery on unapproved inquiry: future local date + America/Chicago, save/refresh. Cancel/reschedule clears date. Test spring gap and fall repeated time error. Re-confirm an unambiguous time.
4. Unpaid paid-session confirmation and hosted paid action must fail; already-approved sandbox-paid record independently reconciles then saves. No new charge needed. Upcoming list reflects saved future date. No provider configured shows explicit unavailable state.
5. Disposable World: Credit draft without consent cannot publish; grant permission, Show, Save to Cloud; public eligible World shows role/link. Edit name → hides/requires permission. Withdraw/save → disappears on fresh public read. Private/archived parent, hidden card and unrelated owner remain inaccessible. Check legacy credit review messaging.
6. Work together opens existing inquiry with only public World reference and no submission. Verify the action clearly goes to COSMIC, not a credited artist.

Release only after these checks and legacy credit review. Backend GraphQL additions must be deployed before frontend documents request consentConfirmed. Keep V6.6 release separate if desired; V6.7 is stacked, not merged. Live billing activation remains separately authorized.
