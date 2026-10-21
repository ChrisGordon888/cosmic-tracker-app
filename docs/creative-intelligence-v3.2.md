# COSMIC V3.2 — grounded creative reasoning

Branch: `feat/cosmic-intelligence-v3`. No commit, deployment, real catalog mutation, or external model request was performed in this pass.

## Reuse and ownership

V3.1 remains the foundation: Creator Context, canonical hook/notes, Song Moments, HypothesisFeedback identity, fingerprint/catalog relationships, project order/roles, Constellation, WaveSurfer and the shared player. Publishing, public discovery, Nexus, Practice, Opportunities and COSMIC noticed rules outside this Workbench were not changed.

`ReleaseTrack.lyrics` contains verbatim `text` (30,000 characters), `status` (DRAFT/PARTIAL/COMPLETE), and an update timestamp. Save, edit and clear use the same owner-scoped mutation. Lyrics and their timestamp have explicit owner-only field resolvers, including when a public track is queried. The catalog query fetches the timestamp, not full lyrics. The selected-song query fetches the text. Song Moments gain a verbatim, creator-linked `lyricExcerpt` (1,000 characters), not automatic alignment.

## Evidence and claims

The runtime evidence ledger distinguishes CREATOR, STORED_FACT and DERIVED sources, with stable IDs, source paths, version/hash provenance and optional line/time references. Types implemented: meaning, context, role, lyric, moment, hook, fingerprint signal, Realm, relationship, project position/story. PUBLICATION_STATE is reserved in the contract but not currently emitted. Clusters and bridges retain their existing explainable V3.1 readings; they are not invented as new ledger nodes.

Claims include subject, type, statement, confidence, evidence references, unknowns, source mode, engine version, input hash and generation time. Zod rejects malformed claims and unknown references. New rule-based and model-assisted claims use the same UI/wire contract. Browser deterministic evidence and server model snapshots have independently stable IDs; a reference is valid only inside its own snapshot, not across the two constructors.

SUPPORTED means a directly inspectable relationship (such as matching creator endpoints or repeated lines), not objective artistic truth. Metadata transition hypotheses remain TENTATIVE. Insufficient transitions are LOW_EVIDENCE/UNKNOWN. Model confidence is assigned by the server: two evidence categories permit TENTATIVE, otherwise LOW_EVIDENCE; a provider cannot assign its own confidence.

Literal repetition ignores surrounding spaces/case and examines up to 200 nonempty lines. It makes no claim about meaning. Lyrics in storage are untouched. Long evidence excerpts are bounded to 2,000 characters. A manually linked lyric excerpt can outlive the lyric draft it originally described; the UI states this limitation.

## Project transitions and arc

Adjacent tracks retain existing project order. Rules inspect emotional end/start, motion vocabulary, shared signals, Realm and position. Matching normalized creator endpoints support continuity. A sufficiently evidenced disjoint motion vocabulary supports possible contrast. A strong shared-signal edge supports possible continuity. Realm changes alone never determine a narrative pivot.

A partial structural reading requires at least two supported transition candidates and two creator emotional-state items. It quotes recorded states and counts inspectable boundaries rather than imposing opening/build/turn/release. Otherwise: ARC STILL EMERGING. Repeated motifs and roles remain visible through existing project signals/role readings. Project/transition model actions are deferred; only song reflection is implemented.

## Read-only SIN audit — 2026-10-15

53 current eligible songs, 8 projects, 30 catalog relationships, 3 clusters and 3 bridge candidates. Deterministic catalog analysis took about 247 ms in the local audit (single observation, not a benchmark).

SIRENS in Neverland remains:

1. Do Over — Realm 101
2. Hold My Hand — Realm 101
3. In The Deep — Realm 202
4. Her Fantasy — Realm 101
5. Running From The Plug — Realm 202
6. Siren — Realm 202

No supplied lyrics, deeper meanings or marked moments were found for these six tracks. All five adjacent transitions remain UNKNOWN; ARC STILL EMERGING. Hold My Hand ↔ Her Fantasy retains a strong nonadjacent relationship. Her Fantasy remains a catalog bridge candidate, not a proven narrative pivot. Three tracks have fewer than three recognized signals. No missing narrative was invented. Audit used projected reads with autoIndex/autoCreate disabled, never a model.

## Provider/package decision

| Package/approach | Decision | Reason / feature | Lock-in |
| --- | --- | --- | --- |
| Backend Zod 4.6.7 | Add (one runtime dependency) | Strict output validation and JSON Schema generation; same library already used by frontend | Low |
| Native fetch / OpenAI Responses | Choose | One bounded explicit song reflection; small server adapter | Provider-specific wire format contained in one module |
| Official OpenAI SDK | Defer | Native HTTP covers this single endpoint | Could replace adapter later |
| Provider-neutral AI SDK | Defer | No multi-provider routing or streaming requirement | Avoid another abstraction now |
| Agent frameworks, vector clients | Reject for this pass | Deterministic retrieval is sufficient | None added |

The adapter follows the [official Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses). The OpenAI Docs skill was used to verify the request shape. Live provider compatibility/quality remains a manual acceptance item: development used only fictional responses and mocked fetch.

## Service boundary and configuration

Backend only:

```
COSMIC_INTELLIGENCE_ENABLED=true
COSMIC_INTELLIGENCE_MODEL=<a model supporting Responses structured outputs>
OPENAI_API_KEY=<server secret>
```

These are configuration instructions, not values added to the repository. No configured model is assumed and no existing secret was consumed. All three must be present to enable the action. Never use NEXT_PUBLIC variables for secrets.

`groundedProvider.reasonAboutSong` handles transport, prompt/version, refusal, timeout, and strict output validation. `songReasoning` authenticates through existing resolver entry points, resolves owned sources, selects evidence, hashes/persists runs and supplies conservative confidence. It accepts a track ID and expected hash; the browser cannot submit evidence as authorization.

Retrieval: owned current song, owned nonarchived project, and at most three related-song titles/shared explicit-signal summaries selected from at most 60 matching candidates. No related lyrics/meaning, other owners, Vault/test/archived content, audio, account metadata or secrets enter the prompt. Explicit tags are used for this first server retrieval; it does not claim to duplicate every frontend relationship weight.

Bounds: 240 evidence items, 36,000 summary characters total, 2,000 per item, 40 moments, first 300 lyric lines with a 16,000-character lyric budget. Context/moments/project evidence are selected before lyrics. The UI disclosure calls these selected lyric excerpts, not a promise that every line is processed. Output is at most three claims/three questions and 1,800 output tokens. Unknown references reject the entire response. This proves citation existence, not semantic correctness.

Request timeout: 25 seconds. Per-process owner throttle: 10 uncached attempts/hour. This is not a distributed quota and resets on process restart. A unique owner/subject record and lease ID prevent duplicate active writes/late completion from overwriting a newer lease. The production host must permit the request duration. A shared quota/job runner becomes appropriate before multi-instance growth or longer project analyses; no Inngest was added.

## Persistence / staleness

IntelligenceRun stores the latest owner/song snapshot, structured public-facing claims, bounded evidence excerpts, questions and provenance. No chain-of-thought. States: NOT_RUN, RUNNING, READY, STALE, FAILED. Current valid snapshots are reused, without a model request. Source/model/prompt changes hide stale claims. Evidence is re-read before and after reflection. Abandoned RUNNING records show failure after 90 seconds; retry replaces the lease. No automatic retries or model calls on render, playback, refresh, typing or graph interaction. Explicit Check freshness and source refresh use read-only queries.

Snapshot storage includes bounded source excerpts to preserve citation integrity; it is not a second full lyric store. Saving/clearing lyrics invalidates the visible reading but does not immediately purge a previous private snapshot from storage. A subsequent attempt replaces it. There is no analysis retention/deletion interface in this pass.

## Feedback and visibility

Current response plus up to 50 events per hypothesis retain response/note/date, statement, engine and evidence version. Earlier V3.1 records cannot retroactively recover wording. Clearing feedback retains V3.1 deletion semantics and removes that hypothesis's history. Not really sets aside identical model hypotheses and existing supported V3.1 hypotheses; it does not declare them false. No black-box personalization is added.

The subtle history section reports current rule-based hypothesis count, recorded response distribution, and earlier responses for which the current sample exposes a newer evidence/engine identity. This is not a lifetime impression counter or model accuracy. Model responses appear in history, but there is no global model-surfacing/impression instrumentation. Behavioral adaptation is deliberately deferred.

## UI and playback

Lyrics remain inside Song Understanding. Claims expose Why with verbatim evidence, types, line/time references, unknowns and provenance. Timed evidence offers Listen at…; it opens the existing Song Lab and seeks through the shared player. WaveSurfer remains muted. Constellation only adds the selected creator meaning; its existing edge evidence and list-first narrow layout remain. No new world, player, publishing or graph engine.

Browser acceptance used an isolated localhost fixture with in-memory Apollo, six fictional tracks and a generated test WAV. Verified lyric create/edit/clear, literal repetition, mock reflection/Why, feedback, stale claim hiding, timed seek to 4 seconds, and 390px width (no horizontal overflow). The fixture's reduced `me` response produces unrelated Apollo missing-field development warnings; no real account/server writes were used. Live database persistence is covered by owner-scoped resolver/mock tests and still needs a manual fictional-song save/reload check in the authenticated application.

## Manual acceptance

1. Use a disposable fictional current song owned by your account; do not edit SIN. Open Creator → Intelligence and select it.
2. Expand Lyrics, paste text with spaces/line breaks, save, reopen the song and verify exact text/status. Edit and clear; confirm the rest of the track is unchanged.
3. In Song Lab, mark a short time and link a fictional lyric excerpt. Save; expand Why on the lyric-link claim. Listen at… must select this song in the shared player and seek to that time.
4. Use a fictional two/three-track project. Inspect Between tracks. Sparse evidence remains UNKNOWN. Matching supplied end/start states produce explainable continuity. Realm 0 stays distinct from missing Realm.
5. With no provider configuration, reflection is unavailable while all deterministic features work.
6. Only if you choose to enable and pay for a provider test, configure the server variables and use fictional content. Click Reflect with COSMIC once; check structured claims, exact evidence, unknowns and provenance. A repeat on unchanged input reuses the saved snapshot.
7. Edit lyrics/context or a moment. Check freshness: old claims must be hidden as STALE. Reflect again only by explicit action. A failed request must leave normal Intelligence usable and permit a manual retry.
8. Mark Resonates then Not really; inspect dated history and set-aside result. Change source evidence and verify old feedback is not treated as a vote on a new hypothesis. Check another account cannot read/write these lyrics, sources or runs.
9. At 390px, inspect lyrics, evidence, transition details and feedback. Verify public tracks/Worlds never reveal lyrics and existing public playback remains unchanged.

## Future boundaries

Browser: reuse decoded waveform/peaks, bounded visual measurements; do not label waveform height as meaning. Server JS: asset/version/hash validation, peak caching and orchestration. Python: independently validated loudness, tempo, spectral features and energy curves; section hypotheses must remain tentative and source/version linked. Embeddings become useful only when lexical retrieval demonstrably misses relevant relationships at catalog scale. None of these audio/vector systems was implemented.

Five next candidates: (1) real creator evaluation of evidence relevance, (2) better transition/arc readings after supplied context, (3) feedback-history retention and usefulness denominators, (4) shared quota/async jobs when deployment scale warrants them, (5) measured audio features with explicit uncertainty. No V3.3 work was started.

## Verification results

- 34 frontend focused tests passed (Workbench, grounded reasoning, fingerprint and catalog intelligence).
- 39 distinct backend focused tests passed across the regression run and added provider timeout/retrieval tests (context/lyrics/moments, feedback, GraphQL documents, provider/service, fingerprint, public Canon/projects/access).
- TypeScript `tsc --noEmit`: passed.
- Changed frontend TypeScript/TSX ESLint: passed without warnings.
- Changed backend JavaScript syntax: passed.
- `git diff --check`: passed.
- No production build attempted; this brief requested focused checks and explicitly disallowed spending time on known font/network retries.
- External model calls during development: **0**. Real data mutations: **0**.
- Remaining: authenticated fictional-song persistence/reload and an optional manually initiated live provider trial; multi-instance quota, long-running jobs, semantic citation quality and provider deployment limits are not proven by mocked tests.

## Changed-file inventory

- `backend/lib/groundedProvider.js`
- `backend/lib/lyricsContext.js`
- `backend/lib/songReasoning.js`
- `backend/models/IntelligenceRun.js`
- `backend/tests/groundedReasoning.test.js`
- `docs/creative-intelligence-v3.2.md`
- `frontend/src/components/intelligence/EvidenceClaims.tsx`
- `frontend/src/components/intelligence/SongReasoningPanel.tsx`
- `frontend/src/lib/groundedReasoning.ts`
- `backend/lib/intelligenceContext.js`
- `backend/lib/intelligenceResolvers.js`
- `backend/lib/songMoments.js`
- `backend/models/HypothesisFeedback.js`
- `backend/models/ReleaseTrack.js`
- `backend/package-lock.json`
- `backend/package.json`
- `backend/resolvers/index.js`
- `backend/schemas/index.js`
- `frontend/src/components/intelligence/Constellation.tsx`
- `frontend/src/components/intelligence/IntelligenceWorkbench.tsx`
- `frontend/src/components/intelligence/SongLab.tsx`
- `frontend/src/graphql/intelligence.ts`
- `frontend/src/lib/creatorContext.ts`
- `frontend/src/lib/intelligenceWorkbench.ts`
- `frontend/src/styles/intelligenceWorkbench.css`
- `frontend/tests/intelligenceWorkbench.test.cjs`
