# COSMIC — Product inventory and next commercial decision

Inventory date: 2026-11-06. Branch `feat/media-originals-v1`; inspected clean application checkpoint `61d7c99f0d508f6eccbfa808962d5eb8ea47a537`. This is a bounded source/document inventory, not a new security audit or acceptance run. Only this document is changed. No tests, builds, database queries, customer submissions, configuration changes or deployment were performed.

**Decision:** operate the existing Creative Development service first. The largest immediate gaps are owner access clarity, genuine offer content and verified provider operations—not another marketplace. Source implementation does not establish deployment, configured accounts or successful live transactions.

Evidence labels: **Implemented** = inspected source; **Reported** = Christopher/prior handoff acceptance, not repeated here; **Unverified** = runtime/configuration not examined; **Proposed** = not built.

## 1. Product Capability Map

All paths below are repository-relative. App routes map to `frontend/src/app/<route>/page.tsx` unless otherwise stated.

| System / routes | Implemented actions and dependencies | Permission / qualification |
|---|---|---|
| Public music: `/nexus`, `/realms/{0,44,55,101,202,303}`, `/listen/[id]`, `/releases/[slug]` | Realm navigation, official soundtracks, independent Nexus samplers, selected Worlds, Spotlight, public World playback and shared queue/MiniPlayer. Canon is not automatic editorial admission. | Public eligibility and editorial placements remain separate. Published availability requires real eligible records; source is not evidence of the current public inventory. See `docs/realm-music-v2.md`, `backend/resolvers/index.js`. |
| Creator Home `/creator` | Recent/featured project, catalog summaries, Today’s 3 Opportunities, release assistance, quick actions and tour. Grouped desktop/mobile navigation. | Creator gate and owner-scoped queries. Commercial navigation adds exact operator authorization; see `CommercialAccess.tsx` below. |
| Library `/creator/library` | Audio intake, standalone/project placement, Realm organization, catalog/rights metadata, private/vault treatment, playback and Intelligence entry. | Owner-authorized tracks. Private metadata is not equivalent to confidential storage of a public Blob URL. |
| Projects `/creator/projects`; Workshop `/releases/[slug]/board`; prepare `/creator/releases/[slug]/publish` | ReleaseWorld creation/organization, Track workspace, optional Studio Board canvas, canonical Assets, notes/fragments, readiness and explicit publication/scheduling. Workshop and Signal Board are existing presentation/workflow names, not duplicate project systems. | Owner checks; release/publication rules retained. `backend/resolvers/index.js:3340` begins explicit due-schedule operation; no schedule changes made here. |
| Onboarding `/creator/onboarding/*` | Invitation, profile/artist identity, first release, track/artwork, review and activation. | `inviteCreator` and `activateCreator` in `backend/resolvers/index.js:3682,3715`; invited upload exception is narrow, not general creator access. **Reported:** successful staging creator journey. A new invitee still needs actual acceptance. |
| Admin `/admin`, `/admin/editorial`, legacy `/admin/nexus` and `/admin/nexus/editorial` | Creator operations and Editorial Studio review/placement, independent Soundtrack/Discovery/sampler/World controls, ordering, audit and revision protection. | Capability/server authorization remains authoritative; no operator permission grants in this inventory. `docs/editorial-studio-v1.md`, `docs/editorial-operations.md`. |
| Media `/creator/media`, `/media` | Operator draft/publish/order, artwork, YouTube video/Shorts/playlist presentation, Instagram links, related eligible song/World/offer/service references. | `backend/models/CommerceMedia.js`, `backend/lib/commerceMedia.js`, `commerceMediaLinks.js`, `backend/routes/commerce.js`. Public reads recheck related eligibility. Instagram is link-first. This is not an MP4 social scheduler. |
| Commerce `/shop`, `/shop/[slug]`, `/creator/marketplace`, private preview and report | Offering Studio, incomplete-draft preview, approved artwork uploads, benefits/deliverables/FAQs/media, canonical service selection, provider configuration, Selects affiliate disclosure, external Originals. | Operator only; enabled provider and eligible published offer required publicly. `backend/lib/commerceCatalog.js:18–28`; `docs/commerce-v1.md`. No multi-seller payouts or native digital-product fulfillment. |
| Services `/services`, `/services/inquire`; `/creator/engagements` | Four service choices, durable inquiry/Opportunity, scope approval, hosted Checkout, server reconciliation/webhooks, lifecycle filters, follow-up, booking and delivery records. | Exact configured operator ID plus eligible role/status. Stripe mode/isolation gates; hosted scheduling is distinct from confirmed booking. `backend/lib/serviceEngagements.js`, `servicePaymentMode.js`, `hostedBookings.js`. |
| Intelligence `/creator/intelligence` | Real catalog analysis, spatial Universe/mobile view, song comparisons, creator context/fingerprints, audio summaries, Paths, saved experiments, hypotheses/feedback and project perspectives. | Owner data and existing shared audition player. `frontend/src/components/intelligence/IntelligenceWorkbench.tsx`, `LivingIntelligence.tsx`; `backend/lib/intelligenceResolvers.js`, `creativePaths.js`, `creativeExperiments.js`. Implemented tools are not proof of autonomous learning, reliable revenue prediction or a general AI agent. |
| Analytics / development | Marketplace consented visits/actions/referrals; engagement status; music activity/progression; Practice, Rituals and Calendar routes. | Commerce clicks are not merchant sales. No cross-provider revenue attribution or complete learning-product business is established. `docs/commerce-v1.md`; `/creator/marketplace/report`. |
| Collaborations | Public World People & process, owner-attested consented credits/process fragments, public references into Services. | No shared project ownership/editor access, collaborator marketplace or authenticated invitation collaboration system implied. `docs/bookings-collaborations-v6.7.md`. |

## 2. Commercial Workflow Map

| Journey | Implemented | Owner/content activation | Missing / smallest practical route |
|---|---|---|---|
| A. Visitor → affiliate → merchant | Selects offer, disclosure, exact approved merchant host, external CTA, optional consented activity. | Actual affiliate approval and tracking URL; honest recommendation, artwork, pricing language; enable provider and publish. | External merchant owns sale/fulfillment. Validate landing/tracking with merchant tools; do not build checkout. No approved relationship inferred from an enabled provider. |
| B. Visitor → service → approval → payment → booking | Four-service intake → persistent Opportunity → operator approval → Checkout → verified payment → paid scheduling/manual booking → delivery. Failed persistence blocks completion; notification failure explicitly says inquiry saved/email unconfirmed (`frontend/src/pages/api/services-inquiry.ts`). | Operator mapping, backend URL/intake secret, Resend sender/inbox, chosen Stripe mode/account/webhook, real scope and calendar links; legal/customer terms and actual capacity. | **Reported:** earlier sandbox and owner workflow acceptance. Current live configuration/transaction readiness **unverified**. Use existing guarded workflow; provider booking confirmation remains manual. This is the shortest first direct customer route. |
| C. Visitor → Original → external checkout → fulfillment | Hosted-product offer and approved external URL, specs/FAQ/evidence. | Independently owned product, supported versions, license/support/refund terms, genuine hosted checkout and protected delivery configured at provider. | No COSMIC protected-download entitlement system. Use a hosted digital-product service. Vocal Studio concept is deliberately `privateReview` locked: Fedarro-derived provenance is unresolved; do not sell or unlock it as an owner setup shortcut. `backend/lib/vocalStudioDraft.js`, `commerceCatalog.js:18`. |
| D. Listener → World/music → service/offer | Nexus service CTA, World work-together reference into inquiry, Media related links and global Services/Shop navigation. | Relevant public examples and a truthful, scoped offer; verify actual destination context. | No automatic song-to-product targeting required. Select a small number of contextual links using existing controls. |
| E. Creator → invitation → music → World → discovery | Invitation/onboarding, owned uploads/catalog, Workshop/readiness/public World, then independent editorial admission. | Invite/activate appropriate creator, supply music/artwork/rights context, deliberately publish and curate. | Public World does not automatically join Nexus or soundtrack. Complete one real creator’s end-to-end walkthrough; reuse existing admin controls, not new architecture. |

## 3. Known Gaps and Navigation Findings

### Workshop: reported regression, runtime root cause not yet proven

`frontend/src/app/creator/page.tsx:39` requests `id`, `slug`, `status`; `:280–296` chooses the most recently active non-archived owned project, not necessarily the featured project. `:311` passes it to `creatorWorkshopAction`; `:424–428` renders the returned href directly. `backend/resolvers/index.js:1957` supplies owner-scoped Mongoose ReleaseWorld records.

`frontend/src/lib/creatorNavigation.ts:29` falls back only if the project is absent, lacks a truthy id/slug, or is archived. A valid `realm-44-price-of-focus` project produces the requested `/releases/realm-44-price-of-focus/board`. Thus the reported populated screen/fallback is **not explained by the inspected source alone**. Featured card visibility does not prove the selected recent project is valid. A stale runtime/bundle, different project shape or displayed featured/current discrepancy must be distinguished in the authenticated browser; none is confirmed here. Do not hardcode this slug or weaken ownership.

Smallest next correction: capture only selected project id-presence/slug/status and actual href in the affected local session; compare served revision with `61d7c99`. If stale, refresh the correct runtime rather than patching correct code. If normalization/current-project choice is faulty, correct only that boundary and add the actual regression case. Also change quick-action keys from href to stable action identity: fallback Workshop and All Projects currently share `/creator/projects`, a confirmed duplicate React key—not established as the cause of the reported destination.

### Operator navigation: confirmed failure masking; account-specific cause unverified

`frontend/src/components/creator/CommercialAccess.tsx` makes one `/api/engagements/summary` request, defaulting to denied and silently ignoring non-OK/network responses. `creatorNavigation.ts` filters Marketplace, Media Studio and Engagements by that boolean. The proxy (`frontend/src/pages/api/engagements/[[...path]].ts:8–18`) requires a session token and `SERVICES_BACKEND_URL`; the backend (`backend/routes/services.js:30–40`, `backend/lib/serviceEngagements.js:10–12`) requires the exact `SERVICES_OPERATOR_ID`, eligible role and non-suspended status.

Therefore ordinary creator status is insufficient; staging/local may legitimately have different identities/operator mappings, or local may be unconfigured/unavailable. This inventory did not inspect secrets, authenticated responses or grant roles, so it cannot select one as the actual local cause. Next diagnosis: distinguish 401/session, 403/not operator, 503/configuration/upstream and 200; verify mapping privately. Do not show operator controls to all creators. Provide explicit loading/error/retry rather than disguising failure as authorization denial.

Other confirmed boundaries: public Blob artwork/audio URLs do not provide confidential delivery; Media stores provider references rather than finished-video scheduling jobs; hosted booking links do not automatically synchronize confirmation; affiliate revenue/fulfillment is external; draft product content does not establish distribution rights. Application source/development docs do not establish current deployed versions.

## 4. Third-Party Integration Status and Distribution Design

| Integration | Code status / operational evidence |
|---|---|
| MongoDB, NextAuth/backend JWT, Vercel Blob | Existing application infrastructure. Current environment mappings not inspected. Public Blob URL exposure remains distinct from metadata access controls (`frontend/src/server/creatorUpload.ts`). |
| Resend, Stripe | Existing intake/notification, guarded test/live modes, server payment confirmation. Prior sandbox acceptance **reported**; no current live configuration certified. `backend/lib/servicePaymentMode.js` explicitly supports gated live mode, so “test-only code” is now inaccurate. |
| Cal.com / hosted booking | HTTPS discovery/paid links supported; payment reconciled before paid scheduling. No automatic booking webhook sync (`backend/lib/hostedBookings.js`, `docs/bookings-collaborations-v6.7.md`). |
| BeatStars | Approved Blaze embed/direct destination integration exists. Genuine account/player/licensing checkout needs owner verification. |
| Affiliate merchants / hosted Originals | Provider allowlist and external handoff exist. Approvals, payouts, product rights and delivery are external operational requirements, not established connections. |
| YouTube / Instagram | Public Media embedding/link presentation exists; not social-account publishing authorization. |
| Buffer | **Possible, not connected in inspected commerce/media implementation.** No authorized account/channel or successful scheduled post demonstrated. |

### Minimal finished-video distribution proposal (research only)

Keep Pro Tools → OBS → CapCut → finished MP4. First prove one post inside Buffer itself; this saves work immediately without COSMIC code.

Current official Buffer documentation supports GraphQL video posts, custom UTC scheduling and retrieval of scheduled/sent/error states. Media is supplied as a public URL, not a direct API upload. API access is available across plans; owner-created credentials and connected channels are required. Account/platform support varies: Instagram personal uses notification publishing; do not promise universal auto-posting. YouTube support is Shorts, not a general long-form video pipeline. Validate the actual account and current file limits before scheduling.

Proposed later bounded adapter: extend the operator Media workflow with a finished MP4 and optional existing owned song/World/media reference; explicit consent that the publishing asset is public/provider-accessible; server-authorized bounded upload; editable per-channel captions derived from approved title/context/link templates; select only channels returned for the authorized owner; preview each caption/time; submit via server-held Buffer credentials. No model dependency is necessary for the first caption drafts.

Persist a small distribution record only when implementing: owner, media reference, approved channel/caption/time, submission identity, provider post IDs, returned state and last checked time/error. One independent result per channel. Refresh/poll provider status with rate limits; never call API acceptance “published.” On ambiguous timeout, reconcile before retrying to avoid duplicate posts. Do not assume provider idempotency or webhooks without verifying them. Notification-required publishing remains “manual action required.” Reuse existing media/upload authorization, but do not pretend existing public `CommerceMedia.url` is a job queue or private storage. Keep credentials server-side; no arbitrary client channel IDs or automatic source-publication changes.

Start owner-only; no multi-tenant social OAuth service, video renderer, new editor or unified social analytics. Retention/provider fetch timing and quota/error handling need explicit acceptance. Buffer UI is the lower-cost alternative until actual posting volume justifies this adapter.

Official sources reviewed 2026-11-06:
- [API availability, credentials and public media links](https://support.buffer.com/en-us/articles/what-is-buffers-api-GtIYIQilz5)
- [Video post example](https://developers.buffer.com/examples/create-video-post.html)
- [Scheduling and delivery lifecycle](https://developers.buffer.com/guides/posts-and-scheduling.html)
- [Supported channels/account types](https://support.buffer.com/articles/supported-channels-LM3P7Y4zsp) (search result available; full-page fetch timed out)
- [Video constraints and Shorts scope](https://support.buffer.com/en-us/articles/troubleshooting-video-uploads-in-buffer-LK0CldlFNB)

## 5. Next Five Owner Actions — No New Code

1. In the already authorized operator environment, finish the Creative Development offer: accurate scope, original artwork, one approved example, deliverables/exclusions, FAQ and canonical service choice. Preview before deliberate publication.
2. Confirm the existing engagement workflow’s actual operational configuration with the account owner: Resend sender/inbox, correct operator, Stripe account/mode/webhook and separate free/paid scheduling URLs. Approve live activation separately; sandbox evidence is not a live sale.
3. Choose one genuine prospective client and a delivery process: scope approval, payment request only after agreement, confirmed appointment, deliverable and follow-up. Use current Engagements controls; do not classify inquiries as bookings or revenue.
4. Prepare one independently owned Original and one genuinely approved affiliate offer. For the Original, test external checkout/download/support with the chosen provider; keep Vocal Studio review-locked until provenance is resolved or an independent replacement exists.
5. Connect owner-controlled social accounts in Buffer and trial one finished MP4 with edited captions, correct channel types and schedule. Record actual delivered/manual-required outcomes. Separately complete one invited creator’s publish-and-editorial walkthrough using existing controls.

## 6. Next Three Development Priorities

1. **Owner workflow reliability:** reproduce/fix Workshop targeting and distinguish commercial access denial from missing configuration/API failure. Small, directly unblocks operation of already-built revenue tools.
2. **Evidence-driven first-sale closure:** after owner configuration, fix only an observed inquiry/payment/booking failure. No new CRM or checkout. If no defect exists, this is operational acceptance, not a development sprint.
3. **Finished-video Buffer handoff:** only after successful provider-side pilot and demonstrated repetitive posting need. One owner, finished media, editable captions, explicit scheduling and truthful provider status; no video production infrastructure.

## 7. Recommended Focused Codex Implementation

**Owner Navigation & Commercial Access Reliability** — one bounded pass.

Scope: reproduce the populated local Creator Home issue through normal authentication; verify current project vs featured project and rendered destination; make the smallest proven fix (or correct stale runtime with owner authorization). Use stable quick-action keys. Replace the commercial access boolean’s silent failure handling with loading/authorized/denied/unavailable states and safe retry. Keep backend operator identity and creator ownership unchanged; no blanket role grants, business schema changes or product publication.

Acceptance: (a) valid owned current project opens its existing board, including the reported Price of Focus example; (b) no/archived/invalid project guides to existing Projects without a broken link; (c) operator receives all three business entries; (d) non-operator remains excluded; (e) 401/403/503/network failure are correctly distinguished without disclosing secrets; (f) retry recovers after service restoration; (g) desktop/390px navigation and keyboard use remain intact; (h) focused tests cover actual reproduced cases. Do not claim resolution solely from synthetic helper tests.

This document leaves the two environment-specific causes explicitly unresolved rather than inventing runtime evidence. No application changes were made. Existing accepted tests were not repeated; no new production-readiness claim is made.
