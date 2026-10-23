# Realm editorial authority and resonance
## Editorial checkpoint
Base: Wave A 2aea44ae5bc2688e0a09b1f09acbaa64eb3dedea.
Recovery reference: backup/cosmic-wave-a-pre-realm-20261023.
Work branch: feat/realm-editorial-resonance.

The former default getPublicNexusTracks query admitted public Canon/Listed tracks without editorial publication. Nexus explicitly requested that broad mode. Realm soundtrack/guidance additionally merged the shipped registry as fallback. These paths explain unapproved soundtrack exposure. The current Nexus World shelf already requests selectedOnly; the reported unselected World exposure cannot be independently attributed to this source without checking the running staging version and selection configuration.

## Authority
- Active creators retain owner-authorized public World publishing; Canon and home Realm do not grant editorial placement.
- Existing Nexus editors manage Realm discovery and official soundtrack selections through the existing editorial console.
- Discovery uses explicit World/Realm pairs and accepts non-Canon public Worlds.
- Official soundtrack uses explicit track/World/Realm triples. Discovery does not imply soundtrack admission.
- Existing showInNexus + published tracks remain an evidenced legacy soundtrack source, unless explicitly withdrawn. No data is migrated or auto-approved.
- Nexus music requires published track editorial status. Nexus Worlds retain explicit selection and Canon eligibility. Spotlight remains separate.
- Unpublished, archived, protected, suspended-owner and stale World/Realm references do not qualify.
- Removing editorial placement does not unpublish the creator's personal World.

New config arrays default empty; no records were changed. A future legacy reclassification requires explicit approval.

## Verification (fixtures, not staging data)
Backend: 35 passing across realmEditorial, publicProjects, listenerNexus, publicCanon, releaseFlow, publishingLifecycleV5, foundingCreatorAccess, leaderboardPrivacy.
Frontend: 35 passing across nexusAdmission, worldCuration, publicCoherence, listenerDiscovery.
TypeScript passed; changed-file lint passed with existing warnings. Backend syntax and diff whitespace checks passed.

## Staging acceptance
Use existing isolated frontend :3001/backend :4001 and disposable creators only. Restart through the normal operator workflow if required; this pass does not stop servers.
1. Creator A publishes a fictional World with public and private children; marks Canon/home Realm. Personal public URL works and private children remain hidden. No automatic Realm discovery, soundtrack or Nexus appearance.
2. As editor, /admin/nexus/editorial: admit World to Realm Discovery. Discovery alone changes.
3. Select one eligible public track for official soundtrack in its actual Realm. Realm playback includes it; Nexus remains unchanged while track is in review.
4. Publish through existing Nexus review workflow and select Canon World separately. Verify each surface independently.
5. Withdraw soundtrack; personal World and Nexus publication remain independent. Unpublish World and verify all public placements disappear.
6. Creator B and anonymous callers must receive authorization errors for editorial mutations and cannot access A's private records.
7. Recheck the disposable Jello World against the deployed staging version/configuration. No actual account/data verification is claimed here.

## Recovery
Keep editorial and player commits separate. To inspect Wave A safely, use a separate detached checkout of the recorded base. To undo an accepted commit later, review and use git revert on a clean branch; do not reset or discard uncommitted work. No push/merge/deploy is performed.
