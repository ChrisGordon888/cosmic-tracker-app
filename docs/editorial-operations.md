# Editorial operations correction

## Checkpoints
Wave A 2aea44a; editorial separation 3169f8b; Resonance Player 51920ea.
This correction is a separate descendant commit on feat/realm-editorial-resonance.

## Diagnosed causes
- Review allowed administrators, while publishing required owner or nexus.publish. Both frontend and backend implemented that separation. The old “Awaiting publishing authority” label concealed the missing capability/next step. No staging account's grants were inspected. The likely account/configuration cause must be confirmed with the capability query below; it is not a missing publish mutation.
- getReleaseTracks/getReleaseAssets requireCreator and look up the World with the caller's owner ID. An administrator's Open Board link could not load another creator's owner-scoped workspace. That boundary is intentional and unchanged.
- A published Nexus track implicitly qualified for official soundtrack, and Nexus unpublish removed soundtrack selection. Both cross-destination couplings are now removed.

## Roles / operations
- Unsuspended administrator: read submitted review material, request changes, approve.
- Unsuspended owner, or administrator with nexus.publish: explicitly publish/unpublish Nexus music.
- Unsuspended owner, or administrator with nexus.editorial: admit/withdraw Realm discovery, select/withdraw approved soundtrack, select/withdraw public creator-Canon Nexus World.
- Creator/listener (including a malformed record carrying these permission strings): cannot perform editorial operations.
- No permission grants or creator records were changed by this pass.

Approval is not placement. A World selection is itself an explicit editorial acceptance, not a second Canon flag. A soundtrack needs approved/published submission status and its exact current World/Realm selection. A public World and active owner/profile remain required. Source withdrawal/unpublish/archive/suspension removes public eligibility.

## Review experience and privacy
/admin/nexus now reports backend capabilities, displays three independent placement controls alongside the existing separate Nexus publication action, and replaces Open Board with read-only editorial review.
Artwork/audio and submission metadata use the existing access-controlled fields. Private track notes are not requested by the console. Process evidence is restricted to creator-published, attachment-free text fragments in this World, either unconnected or connected to this submitted song. Private Board notes, attachment URLs, and other songs' fragments are not requested. No new private-evidence submission model was introduced.
Placement changes append actor/destination/source/Realm/action/time to the existing config's last 200 placementHistory entries; updatedBy/timestamps remain. Track review/publication uses existing actor/time/notes fields. This bounded operational history is not a compliance-grade permanent ledger.

## Important existing-content consequence
Nexus-published tracks without an explicit realmSoundtracks entry will no longer appear in official Realm soundtracks. They remain Nexus-published. An editor must intentionally select each desired approved track in the soundtrack controls. No content was migrated, approved, or selected automatically.

## Exact staging permission preparation
Keep isolated frontend :3001/backend :4001 and isolated DB/Blob settings. Restart through the normal operator workflow if backend schema hot reload is unavailable; do not change secrets.
1. Sign in as the intended administrator and execute in an authenticated GraphQL client:
   query { me { id role platformPermissions } nexusEditorialAccess { canReview canPublish canPlace } }
2. If canPublish/canPlace are false, an EXISTING OWNER must intentionally grant capabilities using the existing owner-only mutation. Read the administrator's existing permissions first; this replaces the array. Preserve any existing creator.support or other valid grants.
   mutation GrantEditorial($userId:ID!,$permissions:[String!]!) {
     setPlatformPermissions(userId:$userId,permissions:$permissions) { id role platformPermissions }
   }
   Use the administrator's real ID privately and the explicitly approved complete permission list, including nexus.publish and/or nexus.editorial as needed. Never paste tokens into reports. This agent did not execute this operation.
3. Reload /admin/nexus. Backend context loads permissions from the current DB user; the console fetches capabilities network-only. Verify true capabilities. Do not change a creator to administrator merely to approve their own work.

## JelloTheMan acceptance (manual, not performed by the agent)
1. In All/In Review, locate JelloTrack1 and its submitted song. Confirm creator/title/art/audio and public World link. Private workspace is not navigated; published text evidence only.
2. Approve. Confirm creator public page unchanged and all four destinations still unselected.
3. Admit Realm discovery. Check /realms/303 discovery only; official soundtrack and Nexus still absent.
4. Select soundtrack. Check Realm Resonance and shared MiniPlayer; Nexus remains absent.
5. Publish to Nexus using publishing-capable admin. Check Nexus music; World selection remains separate.
6. Select Nexus World (requires creator Canon). Check Nexus Worlds.
7. Withdraw each placement one at a time; verify other selections and direct creator World remain intact. Specifically unpublish Nexus music while soundtrack remains selected.
8. Ask the disposable creator to unpublish/re-publish the source and confirm hidden while unpublished. Suspension/foreign ownership are fixture-tested; do not suspend real creators for this check.
9. Creator A/B and anonymous GraphQL attempts must be rejected; no access to the other's getReleaseTracks/getReleaseAssets.
10. Verify saved selection/status after reload. Confirm the actor/time trail on test records if inspecting the isolated DB.

## Verification
Focused backend/frontend fixtures exercise permissions, source eligibility, exact Realm 0 selection, approval versus placement, independent withdrawal, cross-creator workspace isolation, public-only process queries and actual schema/document compatibility.
These are mocked model tests, not MongoDB transaction/persistence acceptance. Manual staging remains required.
Production build uses a separate temporary source copy, excludes .env and does not touch running .next output. Google Fonts network failure is reported separately.

Final automated results: 38 backend tests and 48 frontend tests passed. TypeScript, backend syntax and git diff --check passed. Changed-file lint: zero errors, two existing console warnings (memo dependency and image optimization). npm also warned that the current Node 19 shell is outside npm 11's supported range; align the local toolchain before release-build acceptance. Isolated build failed only at reported Geist/Geist Mono Google Fonts fetches; no successful production build is claimed.
