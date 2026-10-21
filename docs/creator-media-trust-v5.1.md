# Creator media trust — V5.1

## Completed boundary

`/api/upload` validates bounded request bodies (16 KiB) and issues capabilities only after decoding a NextAuth session and asking the backend `me` query for current database role/status using that session's backend bearer token. The caller cannot nominate an owner. Active creators and non-suspended admins/owners may upload; listeners, invited/inactive/suspended creators and invalid sessions cannot. Invited onboarding accounts must be activated before uploading. Permission lookup failures fail closed. Token generation checks same-origin browser requests when Origin is present and fixes the callback to the current `/api/upload` origin/path.

The installed @vercel/blob 1.1.1 SDK puts exact pathname, extension-specific MIME allowlist, maximum byte size, random suffix, no-overwrite and ten-minute expiry into a signed upload capability. Supported existing families: catalog-audio; release-audio/covers/images/videos/documents/assets. Relative traversal, unsupported folders/extensions, extra segments and external callbacks are denied. Audio/video limit: 100 MiB; images/PDF: 20 MiB. These are upload limits, not the lower 16 MiB selected-recording Intelligence analysis limit. MIME restrictions are not malware scanning or reliable byte-level format detection. Per-account rate/quota enforcement is not added. An already issued token remains usable until expiry even if role changes.

Completion requests have no browser session. The SDK authenticates `x-vercel-signature` against the Blob store token before invoking onUploadCompleted. The callback performs no database writes and logs neither URLs nor client payloads. Old signed completion requests remain harmless and compatible. Token payload contains only server-resolved ownerId and purpose; user-supplied payloads are not echoed into it. Filename path segments remain organizational, not proof of project ownership.

## End-to-end access model

1. Authorized browser uploads directly to Blob using signed constraints. Existing clients still request public storage.
2. Library calls createReleaseTrack; assets use createReleaseAsset and owned project checks. Existing resolvers assign/filter owner identity independently of the upload client payload. Upload success followed by failed metadata save can leave an unassociated Blob; this pass adds no automatic deletion.
3. Library and owner playback obtain owned metadata. ReleaseTrack.audioUrl uses canAccessTrackAudio; private, archived, protected and access-gated records are filtered/redacted for non-owners. Public queries additionally enforce project and child-track eligibility.
4. MusicPlayerProvider consumes the resulting URL directly. Browser decoding/analysis also depends on fetching supported media URLs. None of these contracts was changed.
5. Blob itself currently serves public objects to holders of their URLs. Metadata privacy, Vault classification, unpublishing or a playback gate does not revoke direct file access. Existing external URLs inherit their external host's policies.

**New and existing uploads still have public file URLs. This is upload authorization hardening, not private recording storage.** Notices at Library intake, Workshop and artwork onboarding explain this. Do not upload confidential recordings or contracts. No existing object, URL, track or ReleaseWorld was migrated, rewritten or deleted.

## Incremental private-delivery migration (not implemented)

1. Decide which media must be private: original recordings/documents versus deliberately published previews/covers/masters. Inventory object references and duplicates using a redacted read-only audit; do not log URLs. Confirm installed SDK/storage plan supports private objects, signed delivery, streaming Range requests, CORS and browser decoding. An SDK upgrade may be necessary; verify rather than simply flipping access.
2. Add opaque storage identifiers and upload provenance to the existing asset relationship, with an explicit legacy-public classification. Do not infer confidentiality from `visibility`. Plan protection against attaching another owner's upload receipt, and against arbitrary-source proxy fetching.
3. Introduce owner-authorized short-lived delivery for private assets. Validate every request against live ownership/access; support seeking/Range, player expiry/retry, Web Audio fetch, cache isolation and revocation behavior. Retain legacy public URLs for compatibility during rollout. Never place storage credentials in clients.
4. Test only disposable private files first: owner playback succeeds, unrelated users fail, expired signatures fail, shared-player Next/seek work, analysis fetch works. Explicit publication should create/select intentionally public media rather than expose private originals by accident. No automatic child-track publication.
5. Obtain creator approval for a staged real-asset migration with backup/reference audit, checksum verification and rollback. Copy and verify before changing references. Remove old public copies only with explicit authorization and a reviewed retention plan. Old downloads and external caches cannot be recalled; a new private copy does not undo prior exposure.

## Verification and limits

Automated tests use fictional secrets, signed NextAuth cookies, mocked backend permission responses and the actual installed Blob SDK. They generate/inspect local signed capabilities and validate genuine/forged callback HMACs. No live Blob upload or paid/network API was invoked. Signed capability tests verify that restrictions reach the SDK; actual oversized/content-type rejection by the remote storage service still needs disposable staging acceptance.

Existing backend regression suites cover private rights/metadata GraphQL serialization, ownership, Vault/test exclusions, public tracks/projects and catalog membership. Frontend regressions cover availability, queues and MiniPlayer presentation. These do not replace authenticated browser/storage tests.

## Manual acceptance (disposable staging accounts/assets only)

- Anonymous/invalid session: request upload token, expect 401. Listener/invited/suspended account: expect 403. No clientToken should be returned. Activate the disposable invited creator before onboarding upload.
- Active creator: upload a tiny original WAV/MP3 and PNG through Library/Workshop/artwork onboarding. Confirm saved track/asset belongs to the authenticated backend user, never a client-provided owner. Check refresh and owner playback.
- With a disposable token/file, test wrong extension/MIME, path traversal, off-origin callback and sizes over the documented caps. Confirm rejection; check limits on the actual Blob service, not only the browser picker. No real files are required.
- Verify callback arrival with no browser cookie succeeds only with valid Blob signature. Do not log signatures, tokens or URLs.
- Another account cannot query private track/rights/asset details through COSMIC. A holder of a public fixture URL can still fetch it directly: this is the documented current limitation.
- Public fixture listening, MiniPlayer seek/Next, Realm identity and public World queues still work. Existing media access must remain unchanged.
- Check expired session, backend outage and missing storage configuration show failures without issuing capabilities or losing already selected files. Confirm deployment request origin/callback host agree behind the actual proxy.

Next: perform staging acceptance, then commission private delivery if confidentiality is required before external creator uploads. Publishing's scheduling/schema mismatch is a separate bounded follow-up, not fixed here.
