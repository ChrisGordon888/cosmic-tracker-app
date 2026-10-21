# Intelligence Workbench V1

Branch: feat/cosmic-intelligence-v3. Private, read-only, deterministic creator reflection. No model calls, persisted analysis, audio downloads or creative-data mutations.

## Reused architecture

- `backend/models/ReleaseTrack.js`: canonical ownership, project membership, sequence, Realm, creativeSignals, mood/hook/notes, BPM/key, publication and lifecycle state. These are supplied metadata, not acoustic measurements. No dedicated lyrics or deep-context schema was added.
- `backend/models/ReleaseWorld.js`: project identity, ownership, story, summary and lifecycle.
- `backend/schemas/index.js`: existing owner-scoped `myCatalogTracks` and `myReleaseWorlds` queries; existing creator authorization. New frontend document selects metadata only. No API/schema/resolver changes.
- `frontend/src/lib/creativeFingerprint.ts`: provenance-aware vocabulary and Realm ontology/calibration. Explicit creator signals outrank vocabulary matches. Existing confidence is evidence quality, not artistic quality.
- `frontend/src/lib/catalogIntelligence.ts`: weighted relationships, complete-link clusters, bridge candidates and project hypotheses. Reused unchanged.
- `frontend/src/components/creator/CatalogIntelligencePanel.tsx`: existing Library intelligence remains intact.
- `frontend/src/components/signal-board/TrackWorkspace.tsx`: existing progressive context editing through Workshop; Library remains standalone intake/edit surface.
- Creator layout/access gate and CreatorRail reused. Creator Home, Today’s 3, publishing/Nexus authority and MusicPlayerProvider/MiniPlayer unchanged.
- No existing dedicated waveform, provider or durable intelligence jobs found. Existing request-driven scheduled publication processing is not a general job system.

## Package decisions

| Package | Previously direct dependency? | Decision | Feature / rationale | Cost / risk |
| --- | --- | --- | --- | --- |
| Zod 4.6.7 | No | Add | Runtime validated source/profile contract, TypeScript inference | Additional client code; contract version discipline |
| @xyflow/react 12.12.0 | No | Add | Selection, edges, pan/zoom, accessible graph controls | Client graph weight; lazy load, desktop only, capped graph |
| wavesurfer.js | No | Defer | Optional Song Lab | Full audio decoding, CORS/memory and shared playback synchronization deserve a separate slice |
| Inngest | No | Defer | Future durable expensive analysis | Endpoint/service/retry/authorization setup adds no value to current deterministic work |

Compatibility: Next 15.5.18, React 19.1.0, TypeScript 5.8.3. React Flow peer range supports React 19; no new app state manager. Two direct runtime additions (21 transitive installs). Type and focused build-time checks passed; no dependency security audit claim.

References: [Zod](https://zod.dev/v4), [React Flow](https://reactflow.dev/learn), [WaveSurfer](https://wavesurfer.xyz/docs/), [Inngest serving boundary](https://www.inngest.com/docs/learn/serving-inngest-functions).

## Contract and freshness

`SongIntelligenceProfileSchema` separates canonical sourceFacts, creatorContext, derived evidence/relationships/clusters, confidence and provenance. Profile/source identities must agree. Hypotheses (roles, bridge/cluster observations) remain separate from creator-authored roles. Creator notes are displayed verbatim; vocabulary extraction is labeled as text matching, not semantic interpretation.

Version + owner-scoped input hash + generatedAt identify each analysis. Realm, signals, notes, membership or project context changes invalidate an old profile. Hash is a change detector, not encryption. Analysis is memoized for the current query snapshot, not stored. Refresh sources retrieves fresh server data. Changes in another tab are not pushed automatically. All-catalog hashing conservatively invalidates all profiles. Future engine edits require a version bump.

## Privacy and execution

Queries enforce creator access/owner filtering. The client additionally validates and filters owner identity, current treatment and nonarchived status; malformed records fail closed. Keyed account boundary and no-cache query avoid reusing a previous account’s workbench. Private current songs are intentionally included for their owner; Canon-only graph filtering additionally requires public visibility. Vault/test/archived songs are excluded. This does not change or strengthen object-storage security.

No model or job service is introduced. A future service should accept an authorized owner-scoped snapshot plus version/hash, validate structured outputs, retain model-derived hypotheses separately, and discard stale job results. Authorization must be checked before reading sources and before storing a result. Do not send private notes/audio to a provider without explicit configuration and policy. Only expensive decoding/model work needs durable retry/idempotency later.

## Audio boundary

- Known without audio: supplied tempo/key/Realm, signals, context, membership, sequence and metadata relationships.
- Possible with browser audio: explicitly selected waveform/duration/seeking and creator markers, synchronized to the existing player; not automatic meaning.
- Better server-side: peaks for large files, loudness/tempo estimates, sections and embeddings with versioned real audio-derived provenance.
- Not yet justified: speculative DSP, similarity claims from titles, automatic hook/lyric detection or a second player.

## Read-only SIN evaluation

53 current songs, 8 projects, 30 supported relationships, 3 clusters and 3 bridge candidates in the inspected owner snapshot. SIN sequence remains DoOver → Hold My Hand → In The Deep → Her Fantasy → Running From The Plug → Siren. Hold My Hand / Her Fantasy is its strongest supported pair. Her Fantasy bridges catalog clusters (not proof of an internal narrative transition). Dreamy and reflective recur on 3/6 songs. Three songs have fewer than three recognized signals; no adjacent supported motion contrast surfaced. The complete narrative arc, acoustic energy, lyrics and redundancy remain unknown. No data was changed.

## Validation and manual acceptance

Focused frontend tests cover validation, source separation, owner isolation, stale analysis, roles/sequence, missing evidence, Realm 0/null, graph caps/filters and metadata-only boundaries. Backend tests validate the actual GraphQL document and existing creator/owner resolvers. Browser preview used fictional data, the real components and no backend mutation: project filtering and 390px list-to-inspector selection work, content width equals viewport width. Production authenticated end-to-end review remains manual. Reduced-motion CSS removes transitions/animations; no automated OS-preference simulation was performed.

1. Sign in as creator; open `/creator/intelligence` from the rail. Inspect observations and Why explanations.
2. Select SIN; confirm the accepted six-track order, restrained hypotheses and explicit unknowns.
3. Select a song; compare your context to derived vocabulary and inspect related songs.
4. Open Constellation, pan/zoom, select nodes/edges and inspect evidence. Filter project, Realm and public Canon. InterSiddhi (0) must remain distinct from undecided.
5. At 390px, use the map’s song list and inspector without horizontal scrolling.
6. On an isolated test song, edit context in the existing editor, return and Refresh sources; verify evidence changes. Do not edit SIN for this test.
7. Sign out / switch creator accounts: prior private intelligence must disappear. Confirm public pages and shared player are unchanged.

Limits: no Song Lab, semantic model, saved analysis, hypothesis feedback or automatic refresh. Relationship calculation remains quadratic; graph rendering is capped at 80 songs with maximum degree 3 and analysis is memoized. Larger catalogs need profiling and likely an explicit compute/cache boundary before scaling.
