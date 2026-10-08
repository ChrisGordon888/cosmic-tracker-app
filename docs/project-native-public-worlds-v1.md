# Project-native Public Worlds V1

## Runtime and canonical contract

Nexus Selected Worlds replaces PUBLIC_THREE_PIECE_COLLECTIONS and its title/story/artwork override/filtered-tracklist runtime. Historical MUSIC_COLLECTIONS, RELEASE_PROJECT_COLLECTIONS, CURRENT_FEATURED_RELEASE and related exports remain reference data, not the runtime project-card source. No historical collections were materialized into database projects.

publicProjects(selectedOnly) → PublicProject { world: ReleaseWorld, tracks: ReleaseTrack[], realmId }.

| Old collection field | Authoritative source |
| --- | --- |
| title | ReleaseWorld.title |
| releaseProjectId / URL | ReleaseWorld.slug, /releases/[slug] |
| artworkUrl / page overrides | ReleaseWorld.coverArtUrl (existing coverAssetId workflow) |
| description / story | ReleaseWorld.oneLineSummary / story |
| trackIds / order | ReleaseTrack.releaseWorldId + same ownerId, trackNumber then createdAt/id |
| preview | first playable focus track, otherwise first playable ordered track |
| Realm | derived from included focus track's realmId; otherwise unanimous known child Realm; otherwise mixed/undecided |
| published/selected | ReleaseWorld.visibility, status, publicCanon; independent Nexus selectedWorldIds |

There is no stored ReleaseWorld Realm today. V1 derives a display context from canonical child data instead of inventing a duplicate Realm authority. Track counts are listener-visible project tracks, not a count of private internal material. Counts distinguish currently playable and sign-in-gated music; blocked content is not called playable. Existing audio field resolvers still enforce accessTier, dates, playback state and owner rules.

Future Song/Project Intelligence should consume owner-scoped ReleaseWorld ID/owner/title/slug/story/cover references/status/visibility/publicCanon/updatedAt plus ordered same-owner ReleaseTracks and provenance/versioned fingerprints. Private intelligence may read the owner's complete membership through existing private queries; public presentations must use the filtered contract. Do not analyze hardcoded pseudo-project collections as creator projects.

## Context and authority

- Direct public World URL: retains existing public-world rules; public/listed children allowed, private/Vault/test/archived excluded. Child publicCanon does not determine contextual membership.
- New public project discovery: requires publicCanon=true, visibility=public and non-archived World. Null is not consent for new project discovery; false excludes discovery without unpublishing the URL.
- Nexus Selected Worlds: additionally requires selectedWorldIds on NexusEditorialConfig. Existing nexus.editorial permission/owner authority controls this reference-only selection. Creator Canon never auto-selects or Spotlights. Track editorial and Spotlight workflows are preserved.
- Broad track discovery/Shuffle remain separate: project-query tracks are never merged into the standalone runtime catalog. Listed children do not become Canon or standalone Realm candidates.
- Every project track query joins both releaseWorldId and ownerId; no cross-creator child exposure.

## SIN and migration inventory

Read-only development inspection: SIRENS in Neverland, slug sirens-in-neverland, active/public, project publicCanon unset. Has canonical artwork, summary and story. Six tracks in order: Do Over, Hold My Hand, In The Deep, Her Fantasy, Running From The Plug, Siren. First five are Listed/publicCanon=false; Siren is Public/publicCanon=true. All six are released, playable, public access tier. No real data changed.

SIN's existing URL retains six tracks. To appear in Selected Worlds: creator explicitly selects project public presentation, then editorial selects the actual World. No automatic selection was performed. Browser verification used a labeled isolated snapshot fixture with synthetic audio, not real catalog mutations.

No ReleaseWorld counterpart was found for these historical three-track Realm collections:

- Break the Code (303)
- Don't Follow the Siren (202)
- Hold On While You Drift (101)
- Glory & Command (55)
- The Price of Focus (44)
- Same Self, Higher Form (0)

A future manual migration requires a creator to create a genuine World, intentionally decide membership/order and canonical artwork/story, resolve any tracks already belonging to another World through existing rules, publish it, select project Canon, and seek separate editorial placement. Do not copy/move tracks automatically. The historical SIN registry collection also remains reference-only; its actual World already exists.

## Listener paths

All six Nexus Realm anchors render. Empty Realms show quiet copy with no fake Play controls. Active/member cards reuse existing access handling. Quiet-path sign-in retains the intended Realm callback.

Find Your Realm: preferred eligible playable track/World → otherwise playable Canon project in that Realm → otherwise sign-in for member content with callback → otherwise stable Realm-specific quiet anchor. Static recommended titles no longer appear as available recommendations when removed from the discovery catalog. Nexus and Realm guidance likewise avoid stale title fallback. Project-only Listed music is offered through the World, never injected into standalone playlists.

Nexus, Practice and Tracker normal sign-in CTAs route through /auth with callbacks; Google is first there, GitHub remains available. Creator Projects retains its existing creator-specific direct GitHub button; authentication provider configuration is unchanged. Actual OAuth completion is not tested.

## Services transport and configuration

POST /api/services-inquiry (Next Pages API) → validateInquiry → sendInquiry → Resend HTTPS API using native fetch. No dependency added; no client credentials or hardcoded personal inbox. Required server environment:

- RESEND_API_KEY: transactional sending key.
- SERVICES_INQUIRY_FROM: sender authorized by the verified sending domain.
- SERVICES_INQUIRY_TO: business inbox, independently replaceable (including a Proton-hosted destination).

Configure a Resend account/key and verified sender domain in the frontend hosting project's server environment. Recipient mailbox hosting is independent of the sending transport. Follow https://resend.com/docs/api-reference/emails/send-email. Changing deployment environment may require a restart/redeployment by the hosting platform; no source-code edit is needed. No provider account, domain or real delivery was configured/tested by this pass.

Reply-To is visitor email. Plain-text content includes name/email/service/intent/context/links/timeline/contact preference and timestamp. Server validates required fields, email syntax, service allowlist, field lengths, honeypot; body limit16KB, POST-only and same-origin check when Origin is supplied. No persistent inquiry store/logging and no new rate-limit infrastructure. Honeypot is not comprehensive abuse prevention; configure provider/platform rate controls before public volume warrants more protection.

Missing configuration returns503; invalid input400; rejected/unconfirmed transport502. Provider acceptance with an ID is required for success (acceptance is not proof of inbox delivery). Failed submissions retain input; network timeout says sending could not be confirmed. No real email sent. A timeout may occur after provider acceptance; retries are not guaranteed deduplicated in V1.

## Verification boundaries

Regression suites cover contextual filtering/order, Canon isolation, editorial permission checks, reference-only selection, route matrix, schema compatibility, API validation and honest transport results. Browser fixture covers signed-out Nexus, provider-choice route, six quiet anchors, project preview Pause state, six-track SIN snapshot, Find Your Realm contextual World link, Services unconfigured failure with retained input, and390px overflow checks. Fixtures use synthetic data/media and no real writes. Live OAuth, real email delivery, and real editorial/creator writes remain manual acceptance tasks. Production build remains blocked by the existing Google Fonts DNS fetch failure; no font workaround added.

## Entire uncommitted worktree file manifest

Includes preserved Public Canon V1 and this continuation; no commit was made.

- [backend/lib/publicCanon.js](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/backend/lib/publicCanon.js)
- [backend/lib/publicProjects.js](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/backend/lib/publicProjects.js)
- [backend/models/NexusEditorialConfig.js](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/backend/models/NexusEditorialConfig.js)
- [backend/models/ReleaseTrack.js](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/backend/models/ReleaseTrack.js)
- [backend/models/ReleaseWorld.js](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/backend/models/ReleaseWorld.js)
- [backend/resolvers/index.js](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/backend/resolvers/index.js)
- [backend/schemas/index.js](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/backend/schemas/index.js)
- [backend/tests/publicCanon.test.js](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/backend/tests/publicCanon.test.js)
- [backend/tests/publicProjects.test.js](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/backend/tests/publicProjects.test.js)
- [backend/tests/trackVault.test.js](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/backend/tests/trackVault.test.js)
- [docs/project-native-public-worlds-v1.md](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/docs/project-native-public-worlds-v1.md)
- [docs/public-canon-v1.md](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/docs/public-canon-v1.md)
- [frontend/scripts/auditPublicExposure.cjs](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/scripts/auditPublicExposure.cjs)
- [frontend/src/app/admin/nexus/editorial/page.tsx](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/app/admin/nexus/editorial/page.tsx)
- [frontend/src/app/creator/library/page.tsx](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/app/creator/library/page.tsx)
- [frontend/src/app/find-your-realm/page.tsx](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/app/find-your-realm/page.tsx)
- [frontend/src/app/listen/[id]/page.tsx](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/app/listen/[id]/page.tsx)
- [frontend/src/app/nexus/page.tsx](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/app/nexus/page.tsx)
- [frontend/src/app/practice/page.tsx](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/app/practice/page.tsx)
- [frontend/src/app/services/inquire/page.tsx](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/app/services/inquire/page.tsx)
- [frontend/src/app/tracker/page.tsx](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/app/tracker/page.tsx)
- [frontend/src/components/admin/ProjectSelections.tsx](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/components/admin/ProjectSelections.tsx)
- [frontend/src/components/creator/PublicCurationReview.tsx](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/components/creator/PublicCurationReview.tsx)
- [frontend/src/components/creator/SelectedWorlds.tsx](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/components/creator/SelectedWorlds.tsx)
- [frontend/src/components/realm/RealmEntryGuidanceBanner.tsx](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/components/realm/RealmEntryGuidanceBanner.tsx)
- [frontend/src/graphql/publicProjects.ts](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/graphql/publicProjects.ts)
- [frontend/src/lib/listenerPaths.ts](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/lib/listenerPaths.ts)
- [frontend/src/lib/publicProjects.ts](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/lib/publicProjects.ts)
- [frontend/src/lib/trackVault.ts](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/lib/trackVault.ts)
- [frontend/src/pages/api/services-inquiry.ts](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/pages/api/services-inquiry.ts)
- [frontend/src/server/servicesInquiry.ts](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/server/servicesInquiry.ts)
- [frontend/src/styles/servicesInquiry.css](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/src/styles/servicesInquiry.css)
- [frontend/tests/listenerDiscovery.test.cjs](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/tests/listenerDiscovery.test.cjs)
- [frontend/tests/publicCuration.test.cjs](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/tests/publicCuration.test.cjs)
- [frontend/tests/publicProjects.test.cjs](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/tests/publicProjects.test.cjs)
- [frontend/tests/servicesInquiry.test.cjs](/Users/christophergordon/Desktop/CosmicApps/cosmic-tracker-app/frontend/tests/servicesInquiry.test.cjs)
