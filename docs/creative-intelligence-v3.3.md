# COSMIC V3.3 — implementation and acceptance

Branch: `feat/cosmic-intelligence-v3`. No commit, merge, deployment, real-catalog mutation, real-audio analysis, or external model call was performed.

## Experience audit and decisions

V3.2 already hid several editors. The problem was equal visual weight across observations, project sequence/mechanics, graph, context, reasoning and provenance—not five initially visible forms.

- KEEP VISIBLE: 2–3 observations, one project signal, Constellation doorway, selected song identity and concise reading.
- MOVE BEHIND DEPTH: full project sequence/transitions, hypothesis feedback, context/lyrics/model controls, detailed measurements.
- MERGE: graph/list/observation selection into the same inspector; graph relationship and Connections evidence share a renderer.
- REMOVE: normal-facing version/hash/source-path clutter, not persisted evidence or capabilities.
- AUTOMATE: metadata-first reading and cached audio retrieval. Audio computation still requires explicit Listen.

Useful metadata reading takes zero actions after selection. Context remains one opening action plus Save; Song Lab and Why remain one action away. Listen requires one action. No enrichment completion meter or prerequisite.

## Architecture/package decisions

- Motion package: DEFER. Existing CSS is sufficient for 180ms selection/arrival and progressive expansion. No new runtime dependencies.
- Audio stack: ADD native Web Audio decode plus native Worker PCM measurement; zero package additions. Selected-song processing stays in the owner's browser.
- Node DSP/Python: DEFER. Avoid codec/service deployment infrastructure for this bounded first measurement set.
- Durable background jobs: DEFER. Explicit browser work has cancellation and timeouts; it is not a durable job and stops when leaving the selected song.
- Sonic similarity/embeddings, tempo/key/spectral/onset inference: DEFER. RMS alone cannot support those claims.

## Measurement contract

Owner-scoped AudioFeatureProfile stores track/source identity, SHA-256 audio hash, `pcm-level-v1`, generated time/toolchain and OWNER_BROWSER origin. Measurements: decoded duration; 16kHz resampled mono/stereo PCM RMS and sample peak; one-second RMS envelope; P90–P10 envelope spread; 256 amplitude peaks; up to five level-change candidates. Values are bounded to -120..12 dBFS. They are not LUFS, true peak, perceived loudness or standardized loudness range.

Candidates compare adjacent two-second power windows, require >=6dB change, reject near-silence and are separated by >=5s. A manually marked TURN within ±3s supports temporal alignment, not causation or narrative validation. First/last-third mean power can describe a >=3dB rise/fall. Context is paired with measurement without automatic semantic agreement/disagreement.

Project depth compares measured RMS in existing sequence order, preserves unmeasured gaps and reports adjacent >=3dB contrasts. It does not replace the existing contextual transition engine or invent an emotional arc.

## Security, caching and limits

Source resolution uses an owned current track and existing ReleaseTrack audio access resolver. Save accepts structured measurements plus source identity, not a URL. Backend never fetches client-supplied media. Profile reads/writes are owner-scoped. Browser-origin measurements are validated but not server-attested; an owner could submit fabricated measurements to their own private profile.

Identity includes track ID, audio URL, known content hash and file size. Changed identity/version hides stale measurements. Save rechecks identity. Known hashes must match downloaded bytes. A remote file overwritten at the same URL without metadata changes cannot be detected until another Listen; if the stored hash remains old, analysis fails safely until source metadata is refreshed.

Caps: 16MiB downloaded input, 10 minutes, two channels, 16kHz resampling, 120s overall timeout and 30s worker timeout. Browser decoding allocates before duration/channel validation, so this is not a hard decoded-memory cap. Native decode cannot physically be cancelled; late completion is ignored. Codec/CORS support depends on the browser and media host. No automatic catalog batch.

READY/STALE/NOT_ANALYZED come from saved state. Listening/failure are local states, not durable jobs. Cached peaks are displayed in the audio detail outline; reuse by WaveSurfer is deferred. Existing player remains unchanged.

Explicit model reflection may receive bounded structured audio evidence, never raw audio or its URL. New audio participates in snapshot freshness. Prompt version changes make older reflections stale; no automatic regeneration occurs.

## Validation

- 39 focused frontend tests passed, including five audio-engine/source/synthesis tests.
- 43 focused backend tests passed, including four audio tests and public Canon/project/access regressions.
- TypeScript and changed-file frontend lint passed.
- Browser fixture: generated 20-second WAV with a known 20dB rise; native decode/worker succeeded; TURN at 11s aligned with candidate at 10s.
- Fictional six-track project: two measured tracks, four explicit gaps, original order retained.
- Graph node selected the same inspector; graph edge opened shared Connections evidence.
- One fictional sentence saved without filling other context fields; cached measurements returned on song reselection.
- 390px selected-song view visually checked: no horizontal overflow; default reading and audio alignment remain readable.
- Reduced motion: CSS disables transitions/animations, selection scrolling checks preference; OS-level toggle not manually exercised.
- Browser preview uses isolated in-memory GraphQL fixtures, not MongoDB. Database behavior is covered with mocked backend tests; real-app reload persistence remains a manual acceptance check.
- No production build retry: known external font/network failures excluded as requested.
- SIN/publication state was not mutated or live re-audited; relevant public regressions passed.

## Manual acceptance on the real application

1. Restart backend/frontend for the new GraphQL contract. Open Intelligence with an ordinary zero-enrichment song: reading should already exist, with no form required.
2. Select songs via list, observation and graph; inspect a graph relationship. Selection and evidence should agree.
3. On a disposable fictional track, Enrich → one sentence → Save. Reopen/reload and confirm persistence. Existing lyrics/moments/model controls remain optional.
4. Choose an owned supported test audio file <=16MiB and <=10min. Listen once; inspect Why and measured details. Navigate away/back and reload: cached read should return without downloading/decoding again.
5. Mark TURN near a known level change. Check ±3s alignment and seek into existing Song Lab. Do not expect emotion/tempo/section labels.
6. Replace only the disposable source through existing media workflow. Confirm stale audio is hidden and explicit Listen refreshes it. Prior reflections must become stale rather than automatically rerun.
7. Test denied source, unsupported codec, oversized file, cancellation and another account. No foreign profile/source should be accessible.
8. Inspect fictional six-track project flow with partial analysis, desktop and 390px, keyboard navigation and OS reduced motion.

## Deliberately deferred / limitations

No durable analysis recovery, server-attested DSP, acoustic semantic agreement/disagreement, sonic graph, tempo/key/spectral features, embeddings, full project audio arc, or WaveSurfer cached-peak integration. Cross-browser codecs/CORS, real-app MongoDB reload persistence and OS reduced-motion visual acceptance need manual checks. Real artist data/audio were not used.

## Changed files

- `backend/lib/audioFeatures.js`
- `backend/models/AudioFeatureProfile.js`
- `backend/tests/audioFeatures.test.js`
- `frontend/src/components/intelligence/CosmicRead.tsx`
- `frontend/src/components/intelligence/ProjectAudioFlow.tsx`
- `frontend/src/lib/analyzeSongAudio.ts`
- `frontend/src/lib/audioFeatures.ts`
- `frontend/src/lib/cosmicRead.ts`
- `frontend/src/workers/audioAnalysis.worker.ts`
- `frontend/tests/audioFeatures.test.cjs`
- `backend/lib/groundedProvider.js`
- `backend/lib/songReasoning.js`
- `backend/resolvers/index.js`
- `backend/schemas/index.js`
- `backend/tests/groundedReasoning.test.js`
- `frontend/src/app/creator/intelligence/page.tsx`
- `frontend/src/components/intelligence/Constellation.tsx`
- `frontend/src/components/intelligence/CreatorContextEditor.tsx`
- `frontend/src/components/intelligence/EvidenceClaims.tsx`
- `frontend/src/components/intelligence/IntelligenceWorkbench.tsx`
- `frontend/src/components/intelligence/SongReasoningPanel.tsx`
- `frontend/src/graphql/intelligence.ts`
- `frontend/src/lib/groundedReasoning.ts`
- `frontend/src/styles/intelligenceWorkbench.css`
- `docs/creative-intelligence-v3.3.md` (this report)
