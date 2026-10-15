# Creative Fingerprint V2

## Audit and ownership

ReleaseTrack already stores mood, hook, notes, BPM, keySignature, assigned realmId,
Realm Finder signal labels/scores/suggestion/version, and releaseWorldId. ReleaseWorld
stores story and oneLineSummary. Creator Realm Finder uses six questions and saves a
snapshot; transient answers themselves are not a canonical song profile. Listener Find
Your Realm remains a separate experience. Catalog sorting previously compared a saved
six-score vector or words against the creator Realm definitions; same Realm alone could
rank a match highly. Cleanup remains catalog hygiene. No audio has been analyzed.

New persistence is only `creativeSignals` (curated IDs) and `creativeDecisions` (last 20
explicit Realm choices, suggested Realm, action, signal snapshot, engine version, time).
Realm, BPM/key, notes, and project identity are not duplicated. `fingerprint(track)` is the
versioned derived contract used by interpretation and similarity. New GraphQL fields
return null to anyone except the track owner, including on publicly visible tracks.
Tag mutation filters on ownerId and atomically adds/removes one signal. Realm decisions
use the normal owner-scoped update path, preserving publication/Nexus safeguards.

## Inputs and evidence

26 curated IDs across feelings, motion, atmosphere, and themes. They emphasize the
existing creation/rupture, perception, reflection, construction, exchange, and authenticity
mythology. No custom tags yet: unknown IDs are rejected, not silently scored.

Explicit tags carry weight 3; literal curated words/aliases in mood, hook, notes or saved
Finder labels carry weight 1. Duplicate evidence for the same concept does not compound.
Provenance is CREATOR_TAG, CREATOR_DESCRIPTION, STORY or LEGACY_FINDER. Text matching
is limited, not semantic understanding; negation and nuanced prose need creator review.
BPM/key and project identity are carried as context, not Realm votes. Project prose is
not automatically inherited by every song. Assigned Realm never votes for itself.

## Interpretation

The executable ontology is `frontend/src/lib/creativeFingerprint.ts`. It extends the
names and archetypes in creatorRealmFinder; it does not replace the listener quiz.
Each Realm has core (+3), secondary (+1), opposing (-2), neighbors, and a human
explanation distinguishing its nearest neighbors. Multiply these by evidence weight.
No song titles, genre rules, BPM thresholds, or minor-key shortcuts choose a Realm.

Insufficient evidence: fewer than 2 concepts or no positive lead.
Mixed: top gap <=3 points, or explicit core/opposing concepts coexist.
Low evidence: fewer than 3 concepts.
Strong fit: >=4 concepts across >=3 groups, a gap >=6, and no detected conflict.
Good fit: other supported leads. These are design heuristics, not probabilities.
Secondary influence needs a positive score >=45% of the lead (internal heuristic).
Legacy saved Finder scores remain a secondary fallback in Smart Sort when V2 evidence
is absent; they are identified as saved evidence, never fabricated fresh analysis.

Mistletoe-like powerful/defiant/driving/dark/breakthrough evidence selects Fractured
Frontier despite 81 BPM/B minor. Hazy/nostalgic/romantic/floating/dreamy/memory selects
Moonlit Roads with The Veil secondary. These are fixtures, not title rules.

## Decisions, calibration and similarity

Existing Realm assignments are authoritative and suppress repeated inline suggestion
prompts. The creator can explicitly choose another. Accept/override/manual records
preserve the suggested alternative: override records rejection without changing tags.
For an exact set of >=3 explicit tags only, the latest still-current decision on another
track from the SAME owner can provide a labeled creator precedent. Its current tag set,
current Realm, and engine version must still match that latest decision. It cannot retrain
universal weights, cross owners, or override the current song's assignment. No broader
learning claim is made. A future pass can evaluate whether exact precedent helps.

Similar Songs combines shared fingerprint concepts with existing mood/Finder evidence.
Shared Realm alone is only 1 point and never qualifies the inline Related list, which
requires shared fingerprint concepts. BPM/key only refine an already-supported match.
Known owners are explicitly isolated in addition to the owner-scoped query. Catalog scan
is pure review-only; confirmation is always explicit. Archived tracks are not similar
candidates. Scan currently inventories unresolved Realms across the loaded catalog,
including Vault/test material; it does not change exposure or publication.

## UI and persistence

+ Signals opens a compact chip selector on each song. One deliberate chip click is one
atomic mutation, optimistically reflected locally. Controls are briefly disabled while
saving to serialize a row's edits; failure rolls back and reports an error. Apollo merges
the authoritative response. Realm changes are never part of a tag mutation. Smart Sort
is optional batch review. Workshop Deep Realm Finder remains available. Related is
collapsed. No Creator Home, listener quiz, or MiniPlayer redesign.

## Future internal audio boundary (NOT implemented)

An internal Python service may return a versioned descriptor envelope:

```json
{"schemaVersion":"audio-descriptors/1","trackId":"opaque-id","assetRevision":"content-hash",
 "analyzerVersion":"name/version","measuredAt":"ISO-8601","descriptors":{
 "durationSeconds":0,"tempo":{"bpm":0,"confidence":0},"loudnessLufs":0,
 "dynamicRangeDb":0,"spectralBrightnessHz":0,"energyCurve":[],"sectionChanges":[]}}
```

Zeros above are shape examples, not measurements. Only authenticated owner-authorized
jobs may analyze a permitted asset. Reject stale asset revisions, nonfinite/out-of-range
values, oversized arrays, unknown units and unsupported versions. Missing measurements
remain absent, never zero-filled. COSMIC owns mapping descriptors to evidence, mythology,
confidence, and creator overrides. Python returns data, never assigned Realms. No audio
service, embeddings, model API, listener telemetry, or runtime was added here.

Fingerprints can later feed project clustering and Pulse, but neither is implemented.
Their consumers must preserve owner scope and distinguish observed data from suggestion.

## Read-only audit

`node frontend/scripts/auditCreativeFingerprint.cjs` reads projected records from the
configured database. It imports no models, creates no indexes, and performs no writes.
Reports are separated by owner and omit titles/raw notes. Counts of sufficient evidence
are eligibility counts, not proof that a matching partner exists. Run only with explicit
authorization for the configured database. Never infer real catalog counts from fixtures.

Similarity weights remain inspectable: each shared normalized concept +2, shared assigned
Realm +1, saved Finder cosine >=0.75 contributes 4×cosine, mood-word Jaccard contributes
4×overlap/union. Only after creative support, BPM distance <=12 adds 1-distance/24 and
same stated key +0.5. These are ranking points, not match probabilities. Shared concepts
are explained in the UI; the optional Related list requires at least one such concept.
Two or more concepts are counted as useful evidence in the audit, not as a guarantee of
quality or proof of a cluster. Catalog scan is memoized and Related comparisons are lazy.
