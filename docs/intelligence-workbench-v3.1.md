# V3.1 — Creator context, hypothesis feedback and Song Lab

Continues the accepted V3 workbench on `feat/cosmic-intelligence-v3`. No migration, backfill, real creative-data edits, model calls or publishing changes.

## Persistence decision

- Reuse ReleaseTrack `hook`, `mood`, `notes`, its metadata and existing ReleaseWorld story. Hook editing writes that original field; existing notes are not copied or overwritten.
- Extend ReleaseTrack with optional `creatorContext`: meaning, emotionalStart, emotionalEnd, referenceNotes, creatorRole. The free-text creative role expresses narrative intent; the original enum `role` remains the publication/workflow role. New creator role wins in the intelligence display but does not mutate that enum.
- Embed bounded Song Moments on ReleaseTrack. Track ownership is their ownership; no redundant ownerId or second annotation collection. Each moment has its own ID and timestamps. Up to 200 per track, 0–86400 seconds, optional end after start, type/label/note. Stored timestamps are creator annotations, not audio-derived claims.
- Add HypothesisFeedback with owner, subject, hypothesis type, engine version, evidence hash, response, note and timestamps. Unique owner/key index supports repeatable upserts. Null response deletes the matching response.

All new write resolvers require active creator access and match authenticated owner ID in the database filter. No client ownerId is accepted. Context/moment fields have owner-only GraphQL field resolvers, including when attached to a public track. Feedback reads are owner-scoped. Subjects must be owned tracks/Worlds. Text, IDs, timestamps and response vocabulary are validated server-side. Moment add count is checked atomically; update/delete match both track and moment.

No auto-migration is required. Existing records have empty context/moments. Mongoose manages the new feedback index under existing deployment conventions; no production index operation was run in this task.

## Intelligence and creator authority

Zod validates new inputs read into profiles. Meaning and emotional states enter existing vocabulary matching at text weight, never as explicit tags. Reference notes and free-form role are not interpreted as themes. Original creator text stays verbatim. Vocabulary matching is not semantic understanding and does not resolve negation or metaphor.

The workbench distinguishes You said, context vocabulary matches, project creator states and derived roles. Project emotional start/end are displayed in accepted sequence without inventing transitions or a three-act arc. Context-supported relationships explain that literal vocabulary contributed. Context-only evidence retains limited confidence.

Hypothesis identity includes subject/type/version and relevant source evidence, not generation time. Role evidence includes project members and relevant edges; observation evidence covers its participating songs. Unrelated sparse tracks and rerenders do not change tested keys. Feedback does not alter source fingerprints, Realm, membership or truth. Not really moves an identical observation to Set aside. Resonates remains explicitly a hypothesis. Facts have no feedback controls. Old evidence versions retain historical responses but do not inherit them into new identities.

Context and moments enter the profile source hash. Successful writes refetch sources without remounting the whole workbench; clearing removes evidence from the new profile. Saved analysis is not retained. Context editor sends changed fields only; clearing deeper context intentionally preserves the canonical hook and notes. Each can still be explicitly edited/cleared through its own field.

## Song Lab and audio authorization

One runtime dependency: wavesurfer.js v7, framework-independent TypeScript library. No new state manager, player provider, AI SDK or job service.

The lazy Song Lab queries only its selected song via an owner-only read with Vault/test/archive exclusion and no last-opened mutation. It uses the existing ReleaseTrack audio field authorization. No proxy, signed-URL bypass, CORS weakening or credentials forwarding is introduced. Same-origin requests retain normal credentials; remote signed/public URLs must permit browser fetching. Unsupported access/CORS failures are reported, not circumvented.

WaveSurfer is muted and never receives play commands. It decodes the selected source for a visual waveform. All Play/Pause/seek/marker actions use the existing MusicPlayerProvider. Source-specific playback IDs prevent a changed audio URL from inheriting an older active source. Opening/closing the view does not start/stop the global player. Switching/closing aborts the pending waveform fetch and destroys its instance. The cursor follows the shared player only when the matching source is active.

Downloads are capped at 32 MiB, including streamed responses without Content-Length. Known larger files skip waveform decoding; the global player remains available. Browser decoding can still be expensive for highly compressed/long files; this is not an unlimited-file solution. Future boundary: authorized file → server peaks/duration keyed to source identity → cached waveform. Do not introduce durable jobs until that work is needed.

Moments appear as waveform markers and a readable list. Clicking plays/seeks using the shared player. Moment type, timestamp, optional range, label and note can be edited or deleted. Ranges are retained/displayed as timestamps; the first pass uses point markers at their start, not draggable range editing. Out-of-duration annotations are retained for creator correction; seeking clamps through the player. There is no automatic section, energy or hook detection.

WaveSurfer documentation: https://wavesurfer.xyz/docs/ (browser decoding, CORS, typed API). V7 was chosen rather than adopting newer experimental APIs. No external AI or Inngest added.

## SIN read-only evaluation

Fresh metadata-only query: 53 current songs, 8 projects, 30 relationships, 3 clusters, 3 bridge candidates. SIN still has six tracks in accepted order: Do Over, Hold My Hand, In The Deep, Her Fantasy, Running From The Plug, Siren. All six currently have no new meaning and zero moments. Hold My Hand / Her Fantasy remains its strongest internal relationship; Her Fantasy remains a catalog bridge candidate. Three tracks have fewer than three recognized signals. Creator-supplied emotional endpoints could add an ordered arc foundation; current lyrical/narrative interpretation remains unknown. No SIN data was changed.

## Validation and acceptance boundaries

Backend fixtures exercise owner create/edit/clear, denial, input bounds, feedback upsert/delete, subject ownership, moment CRUD/order and GraphQL document validation. Frontend tests exercise source separation, stale snapshots/deletion, stable/changed hypothesis keys, context-supported relationships, project arc, audio mapping, Realm 0/null, waveform size/access failure and cancellation.

Isolated browser fixture uses real components, real MusicPlayerProvider and WaveSurfer, an in-memory Apollo link and a generated 10-second tone. Verified: one-sentence save → context-derived matches; all feedback responses; Not really → Set aside; moment create/edit/delete; marker → shared player at 4 seconds; switching song; clearing context removes evidence; 390px layout without overflow. Fixture Apollo warnings concern omitted unrelated account/statistics fields; this is not authenticated production end-to-end testing. No real writes were tested against MongoDB.

Manual acceptance on an isolated creator test song:
1. Restart backend and frontend to load the new schema/package. Open Creator → Intelligence.
2. Write one meaning sentence, save, confirm You said vs context matches. Reopen and edit; clear deeper context and confirm evidence is gone while hook/notes remain.
3. React to a genuine hypothesis, refresh and confirm persistence. Change relevant evidence; the old response must not label the new hypothesis. Clear a response using its disclosure.
4. Open Song Lab; verify no autoplay. Play/pause, seek and add a moment. Edit/delete it, then refresh. Click a marker and verify MiniPlayer/current time follow it.
5. Switch songs while playback is active. Confirm only the shared player is audible and the old waveform is removed. Try an inaccessible/CORS-blocked source: visible error without bypass.
6. At 390px verify waveform, marker/list, forms and context save. Switch accounts/sign out; private context/moments/feedback must disappear.
7. Inspect SIN read-only; verify sequence and unknowns. No real meaning or moments were prefilled.

Remaining limitations: no model interpretation, automatic adaptation, retained analysis cache, waveform peaks service, draggable regions or dedicated lyrics schema. Historical feedback can accumulate; no response-history browser/pruning policy is built. Concurrent same-field context edits follow existing last-write-wins conventions. Production build/font work is deliberately not part of this pass.
