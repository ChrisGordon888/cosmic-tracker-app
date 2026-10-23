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

## Player checkpoint / verification (October 23)
Editorial checkpoint: 3169f8b. Player changes are a separate descendant commit.

The existing Realm orbit is wrapped by RealmResonance. MusicPlayerProvider still owns the only audio element; the visualizer reads a capture stream, never routes the audible element through a MediaElementSource. It measures frequency bins and waveform RMS, caps painting at ~30fps, and renders static atmosphere when disabled/paused/reduced-motion. It waits for the capture stream's delayed addtrack event (bounded 1.5s) on source changes. Capture resources close on pause, selection changes, disabling and unmount; tests cover idempotent close and delayed capture. Public artwork uses existing authorized artworkUrl/releaseCoverArtUrl fields.

Player inventory:
- frontend/src/components/music/RealmResonance.tsx (new)
- frontend/src/components/music/realmResonance.css (new)
- frontend/src/lib/resonanceAnalysis.ts (new)
- frontend/tests/resonanceAnalysis.test.cjs (new)
- frontend/src/components/realm/RealmSoundstage.tsx
- frontend/src/context/MusicPlayerProvider.tsx
- frontend/src/graphql/realms.ts
- frontend/src/lib/publicMusicCatalog.ts
- frontend/tests/playerPresentation.test.cjs (existing harness now resolves existing releaseSharing helper)
- this handoff

Browser verification used actual orbit, resonance, provider and MiniPlayer components with two generated WAV tones in a separate localhost fixture. Apollo/auth were mocked, telemetry disabled; no catalog data or public media URLs were used. Verified measured spectrum, explicit track switch, pause via MiniPlayer, 30-second seek reflected in both sliders, capture-unavailable playback fallback, and 390px scroll clearance. Reduced-motion preference was simulated in the fixture; browser rendering confirmed static state and disabled visuals. This is not authenticated staging or Safari/iOS verification.

Remaining limitations before acceptance:
- captureStream support/CORS varies by browser and media host. Unsupported or restricted audio remains playable with explicit fallback; silent capture cannot be distinguished from genuine silence.
- Isolated production build failed fetching Geist/Geist Mono from Google Fonts (network restriction). The running staging .next output was untouched.
- Desktop/mobile full application shell, actual authorized artwork delivery, real streaming hosts, and OS-level reduced-motion still require staging acceptance.
- No production/staging records were modified.

Manual player acceptance:
1. On staging :3001, open a Realm with two explicitly selected disposable public tracks, backend :4001. Confirm no automatic playback.
2. Select A, enable visuals; confirm measured response (or honest browser/media fallback). Select B from orbit, then Next/Previous from MiniPlayer. Titles, pause state and audio must agree.
3. Pause in MiniPlayer; visuals stop. Seek to midpoint in resonance; both progress controls agree. Resume from either surface.
4. Disable visuals, navigate away/back and repeatedly switch; no duplicate sound, lingering motion or capture errors.
5. At 390px, scroll seek and visual controls above the dock; check compact/expanded/minimized MiniPlayer. Enable OS reduced motion and reload; static atmosphere, working playback.
6. Recheck public/private/editorial boundaries separately using the earlier disposable-creator checklist. Jello staging data was not inspected or changed.
