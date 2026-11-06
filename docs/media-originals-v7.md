# V7 — Media, Originals & Creator Commerce

Branch: `feat/media-originals-v1`, based on `main` at `68237d3`.
Local implementation only; no deployment, publication, real account application or database seeding performed.

## Owner workflow

- Public collection: `/media` (also in public navigation).
- Private management: `/creator/media`, linked from Marketplace.
- Originals: `/creator/marketplace`, existing Offering Studio.

Sign in with the existing Services/Marketplace operator. In Media Studio, create a
record with a title, hyphenated identifier, description, topic, source URL and
optional approved thumbnail. Existing authenticated artwork infrastructure supplies
uploads; thumbnails are public Blob media even for drafts. Set numeric display
order (lower first), preview, then explicitly publish. Save draft withdraws the
item. Stale revisions fail with 409; reload rather than overwriting another edit.

YouTube video/Shorts URLs and playlist URLs are normalized. Player frames load only
on visitor action, use youtube-nocookie.com, and retain a direct link. No autoplay,
extra audio player, scraping, API key or arbitrary HTML. Origin referrer is retained
for provider identification, without disclosing the full page URL. See
[YouTube's official embedding guidance](https://support.google.com/youtube/answer/171780?expand=PrivacyEnhancedMode&hl=en).
Instagram posts/Reels have a deliberate external-link presentation. Official Meta
embedding documentation returned HTTP 429 during inspection; no undocumented iframe
endpoint or arbitrary embed script was substituted. Native Instagram embedding
remains a limitation; private/restricted/deleted media may require provider login.

Related World/song selectors list only the operator's currently public catalog
using existing public visibility and protected-catalog predicates. World links
preserve the `world` identity query parameter. Song links use `/listen/{id}`.
Offering connections use published, provider-eligible public catalog entries;
service selection uses existing canonical inquiry identifiers. These associations
are rechecked on public reads; withdrawn or private targets disappear without
changing their underlying records. No public GraphQL resolver is invoked, so no
scheduled-publication operation is triggered. Preview displays current eligible
links and labels stale saved references. External referrals are not recorded as sales.

## Vocal Studio — private preparation

Offering Studio has an explicit **Prepare Vocal Studio private review** action.
It creates the prepared draft only when the owner clicks; subsequent uses return
the existing slug without overwriting edits. The agent did not invoke this action.

The prepared concept uses `hosted_digital_product`, no checkout, no downloadable
files and a server-enforced private-review lock. Normal catalog edits cannot clear
that lock or publish it. A separately reviewed authorization/replacement decision
is required before any future release mechanism is added.

Technical fields support routing, plugins, processing alternatives, Pro Tools/system
compatibility, interface requirements, recording guidance and a demonstration URL.
Existing products remain compatible when these optional fields are absent.

Only vendor names were supplied: FabFilter, Soundtoys, Universal Audio, Apogee,
Antares, Nuro Audio, Cradle, Waves, Sonnox, D16 Group, iZotope, Slate Audio and Avid.
Exact plugin products/versions, formats, licensing, active/bypassed state, track and
bus topology, Pro Tools version, OS, sample rate, interface/DSP dependencies, input
gain practices and optional alternatives are unconfirmed. No detailed inventory
attachment was supplied. The draft explicitly records these unknowns.

The reference is derived from a commercial Fedarro template. No session file was
read, copied, packaged, uploaded or distributed. Obtain distribution authorization
or author an independent replacement. Plugin licenses and downloads are not implied.

## Three owner-actionable affiliate opportunities

Official routes checked November 5, 2026. No applications or agreements submitted;
no relationship, tracking URL, commission, endorsement or income is asserted.
Existing Unison Audio configuration and offerings were not changed.

| Opportunity | Official application route | Proposed COSMIC recommendation and content | Owner inputs and approval gate |
| --- | --- | --- | --- |
| Plugin Boutique | [Official help article → Sign-Up Form](https://help.pluginboutique.com/hc/en-us/articles/6232502500756-Do-you-have-an-affiliate-program) | A small software shortlist tied to a firsthand vocal-workflow demonstration; show what each actually used tool contributes, plus a stock-plugin alternative. | Confirm exact tools owned/used, audience/site channels, business/contact details and approved screenshots. Apply through the linked form; wait for approval and official tracking links before affiliate publication. |
| B&H Photo Video | [Official Affiliate Partner page → Apply Now](https://www.bhphotovideo.com/c/find/shared/affiliates.jsp) | Recording hardware Christopher actually uses: microphone/interface/monitoring setup, with an honest home-session walkthrough rather than a speculative shopping list. | Confirm exact hardware, region, intended audience and business/payment/tax details requested by the program. Owner reviews terms and submits application; only approved links and authorized imagery afterward. |
| Waves Audio | [Official Affiliate Program page](https://www.waves.com/affiliate-program) | A specific Waves processor demonstrated in context after confirming its actual name/version and role; show active versus bypassed results without promising universal outcomes. | Program describes an active engaged content audience. Supply channel/site links, truthful audience evidence and firsthand examples; use its application/contact route. Wait for approval and account-generated links. |

Do not use provisional recommendations as testimonials or approved endorsements.
After approval, create a COSMIC Selects draft through existing affiliate provider
settings, confirm the material relationship, check the approved destination and
review the disclosure before publishing. External providers alone report purchases.

## Verification and staging acceptance

Focused tests cover URL normalization/rejection, incomplete drafts, public DTOs,
stale/private associations, owner/foreign/anonymous route boundaries, publishing
and withdrawal, revision conflicts, opt-in embeds and the private product lock.
Fixture route tests use model stubs and a disposable local HTTP server, not MongoDB
acceptance. Provider playback, actual authenticated CRUD and thumbnails still need
normal staging-browser acceptance.

1. Load this branch in the existing isolated staging environment (3001/4001).
2. Normal operator login → Marketplace → Media Studio. Save an owner-approved draft,
   refresh, edit and verify preview. Public `/media` must not show the draft.
3. Publish a disposable approved video. Verify display order/topic, desktop and
   390px layout, keyboard access, click-to-load, close and direct fallback. Check
   a playlist and Instagram post link. Do not confuse frame load with playback.
4. Connect a public World/song, a published offering and a service. Verify exact
   destinations. Withdraw the disposable media item and confirm it disappears.
   Validate private/stale targets with fixtures or disposable records, not real music.
5. Foreign creator and anonymous requests must not access management or save media.
6. Prepare Vocal Studio review. Reload its draft, review vendor unknowns and edit
   specifications. Confirm publishing remains blocked and no public product appears.
7. Verify existing Unison offering and service inquiry route remain unchanged.

No payment keys, editorial records, creator content, production environment or
provider accounts were modified. Native product fulfillment, affiliate applications,
Instagram native embeds and real compatibility claims remain outside this release.

## Recorded implementation checks

- 12 backend tests passed (commerce catalog, media policy, privacy links, actual
  loopback router with mocked persistence, review-lock enforcement).
- 6 frontend SSR/rendering tests passed, including opt-in video and Instagram fallback.
- TypeScript passed; changed backend syntax and `git diff --check` passed.
- Changed-file ESLint: zero errors, three `no-img-element` warnings. Approved remote
  artwork remains direct-loaded; no arbitrary image optimization proxy introduced.
- One normal Next production build passed in an isolated source copy with the
  installed dependencies; all 48 static pages generated. Running staging build
  and environment files were not altered. No dependencies were installed.
- No authenticated browser, real provider playback, MongoDB CRUD or mobile visual
  acceptance is claimed from these fixture/SSR checks. Use the walkthrough above.
