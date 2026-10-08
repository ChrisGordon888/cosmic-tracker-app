# Public Canon / Catalog Curation V1

## Decision and migration

Track public/listed/private visibility is access, not deliberate artistic selection. isPublicPick is legacy editorial metadata, not a dependable creator decision. Add nullable publicCanon to ReleaseTrack and ReleaseWorld. True is explicit selection, false is explicit discovery exclusion, absent/null means unreviewed legacy exposure. No migration, default selection, or real catalog mutation is performed. Existing exposure stays until review; unreviewed does not count as Canon. This intentionally avoids silently bulk-hiding the website.

## Controls and authority

Library organizer → Curate public music shows summary, exposure reasons, unreviewed-first queue, and four individually confirmed actions. Each save has owner and updatedAt compare-and-swap checks. Errors do not optimistically change the choice. A new shareable track page reuses the player and backend audio gates so standalone Listed music has a route independent of discovery.

Canon sets publicCanon=true and public visibility, preserving access tiers/dates/playback gates. It never submits, approves, features or Spotlights. Listed sets false + listed; Private false + private without lifecycle archival or moving Current into Vault. Sandbox reuses test treatment. Non-Canon choices explicitly confirm removing Nexus inclusion/resetting review/editorial placement. They preserve audio, rights, project references, Realm, tags and lifecycle. Re-selecting Canon does not restore editorial placement. Protected/archived tracks must be restored through existing workflows before sharing.

World presentation control changes only publicCanon. Hidden worlds stop supplying discovery/Spotlight music, including mapped registry fallback; their public URL and publication status survive. No automatic unpublishing or project restructuring. Restoring eligibility preserves pre-existing editorial selection rather than creating a new one.

## Surface audit

- Home: static presentation; no catalog feed to redesign. Public featured-signal/world resolvers exclude explicit non-Canon selections.
- Nexus, RealmSoundstage, Realm guidance, Find Your Realm: shared getPublicNexusTracks filters track/world selection. unavailableRegistryTrackIds suppresses explicit non-Canon registry counterparts and hidden-world associations, alongside existing Vault/test/archive protections.
- Shuffle: uses the resulting runtime discovery catalog. Existing queues already held in memory are not retroactively revoked.
- Release World direct URLs: existing public visibility rules remain. Listed tracks retain existing public-world presentation semantics; Private and Sandbox are filtered. Removing a track can reduce listener playback/readiness but does not unpublish the world.
- /listen/[id]: current public/listed tracks only; associated tracks require an owned public active parent World, Vault/test/archive excluded, existing audio/date/access-tier gates apply. This route does not enroll content in discovery.
- Registry: shipped media URLs remain public assets. Catalog exclusion is not URL revocation or DRM. Unmapped legacy registry content cannot be curated by claiming another owner's identity.
- Creator profile page is an account surface, not another public music directory. No new search or artist platform added.
- Prepare Release still controls publication. It cannot set publicCanon=true; an explicitly excluded song must be intentionally selected again for discovery.
- Private Current tracks remain in existing Catalog Intelligence. Vault/test/lifecycle-archive exclusions unchanged.

## Read-only development audit

Main owner: 53 tracks; 27 Public,16 Listed,7 Private,3 legacy. No Canon field values. Five Nexus-published, zero submitted; 13 project-associated,40 standalone. Nine exposed in public Release Worlds, three qualify for database Nexus discovery,40 map to actual shipped registry IDs. Union of registry representation and public-world tracks:43. Three public-world tracks have no Nexus/registry discovery route. Four public active worlds. No Sandbox or archived tracks.

Second owner: two tracks; one Public,one Private; both project-associated to private draft worlds; zero public representation through existing discovery/world routes. No Canon/Nexus/Sandbox/archive selections. Counts describe presentation eligibility, not anonymous full-audio rights. Access tiers can gate playback. The newly added direct route supports explicitly shareable tracks independently.

## Acceptance

Use disposable fixtures first. Open review at desktop and390px, cancel a choice, save Listed, inspect direct link, ensure discovery exclusion. Choose Private and verify anonymous link unavailable; owner retains history and intelligence. Test Sandbox then recover through existing Vault controls. Choose Canon and verify Nexus is not auto-submitted. Test stale timestamp and other-owner mutation rejection. With a disposable published world, confirm warnings and unchanged project links/publication. Hide world presentation, inspect retained direct URL and removed discovery. Re-open signed-out views to avoid stale client queues.

No real records changed during implementation. Do not test privacy transitions on a real published release until reviewing consequences. Fixture browser uses simulated mutations; backend resolver tests cover database-boundary behavior, not a live production end-to-end run.

## Verification

49 backend tests and 89 frontend tests passed, including GraphQL document validation, ownership, stale state, confirmation/cancellation, direct-link parent protection and discovery filters. TypeScript and relevant lint pass (two existing image warnings). Syntax and diff checks pass. Production build encounters existing Google Fonts DNS fetch failure. An isolated desktop/390px browser fixture verified a saved Listed state and zero horizontal overflow (390px client and scroll width). No authenticated real-data mutations or production deployment were tested.
