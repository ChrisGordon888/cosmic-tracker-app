# Catalog Intelligence V1

Private, deterministic observations in Library → Organize Library → Catalog Intelligence. No database/schema changes, audio analysis, AI, persistent grouping or project creation. Creator Realm decisions remain authoritative.

## Model

Require an authenticated owner identifier; filter exact owner, current catalog treatment and non-archived lifecycle before computing any statistics. Missing identity fails closed. Explicit curated tags are full-strength evidence, recognized descriptions half-strength. Comparison eligibility requires three concepts across two categories. Frequency-weighted Jaccard (1 + log((eligible + 1)/(frequency + 1))) reduces dominance of common signals. A meaningful edge requires two shared concepts across two categories and overlap >= .28. Strong requires three shared concepts and overlap >= .55. Same/neighbor Realm, same project, nearby stated tempo and same stated key only refine ordering after qualification; they cannot create a relationship.

Greedy complete-link cores require meaningful edges between every pair. This prevents a bridge chain merging unrelated groups. Stable IDs break ties. Core identity means at least 60% of members share a concept, not every member. Three-member cores with two recurring concepts across two categories qualify as read-only project hypotheses. Pairs remain exploratory. Bridges have two meaningful links into each of at least two cores. An own orbit requires enough evidence, no meaningful edges, and at least four eligible catalog tracks. This is a provisional fingerprint distinction, never a claim of audible uniqueness. Sparse tracks remain Needs more signals.

## Signal health and vocabulary

All 26 tags remain unchanged. Counts use explicit tags and tagged-track denominators, with Realm distributions and co-occurrence counts. At least eight tagged tracks and three uses are required for positive usage classification. Broad means >=60% prevalence; overlapping means >=80% intersection relative to the larger tag count; distinctive means <=35% prevalence after those checks. These are descriptive heuristics, not validated quality ratings.

Current main-owner sample: 53 current tracks, 12 explicitly tagged (all at least three tags), 13 comparison-ready, 30 meaningful edges, three cores, two hypotheses, three bridges, one own orbit and 40 insufficient-evidence tracks. Separate owner: two tracks, no explicit tags, no eligible comparisons. No data writes performed.

Memory (11/12) and Dreamy (10/12) are broad. Dark (4/12) is not broad under this rule. Hazy, Still and Exchange are unused; rarity does not justify deletion. Nostalgic/Floating, Reflective/Floating and Intimate/Floating deserve creator review for intentional distinctions, not automatic merging. Ask whether Hazy describes obscured/blurred atmosphere while Dreamy describes imaginative atmosphere; whether Still means little perceived forward motion. Clarify definitions only after creator acceptance. No rename was made.

Main hypotheses: a six-song nostalgic/reflective/floating/dreamy/intimate/memory shape; a four-song powerful/driving/dreamy/breakthrough/memory/authenticity shape. A two-song pair is exploratory, not another project recommendation. These are possibilities to hear together, not project assignments.

## Cleanup safety

Row Catalog actions call the existing updateTrackVault mutation, with expectedUpdatedAt and explicit confirmation. Test sends only catalogTreatment=test; Archive only archive=true. Existing backend owner checks, concurrency checks, private visibility, Nexus removal/review reset and public-selection exclusions remain intact. Files, Realm decisions and project membership remain. Linked public projects may lose playback/readiness. Existing copied media URLs cannot be revoked. No automatic cleanup occurs.

Recover Test tracks through Test / Sandbox filter and existing Vault / rights review. Find archived tracks in Vault or All music; use existing lifecycle controls for restoration where permitted. The existing Library (without Sandbox) view still includes archived/private material; Current is the active-only filter. Intelligence always excludes Vault, Sandbox and archived tracks regardless of view.

## Future boundaries

Quick Fingerprint could rank 3–5 candidate signals from same-owner co-occurrence conditioned on selected signals, minimum sample support and category diversity, discounting ubiquitous tags. Display why; require individual creator confirmation. Do not infer meaning from song titles or auto-tag. This UI is not built.

Keep TypeScript at current size. Consider a worker/service when measured main-thread latency or matrices become costly, or audio/section analysis genuinely requires a separate toolchain. Future versioned contract: owner-authorized catalog revision + opaque track IDs + fingerprint evidence/provenance + permitted context → versioned edges/explanations, cores, bridges, own-orbits, sparse IDs and signal counts. Enforce ownership server-side, validate revisions, exclude protected tracks before analysis, return no cross-owner statistics, and keep publication/mutation authority in COSMIC. Python is an implementation option, not a new source of business authority.

## Limits and manual acceptance

Greedy groups depend on tie ordering; thresholds are deliberately transparent but not statistically calibrated. Twelve tagged songs cannot establish vocabulary redundancy or outcome value. Text evidence is not listening. Larger catalogs need performance measurement; work is currently computed only when the disclosure opens. No live cleanup mutations were used for verification.

Open Library organizer; expand Intelligence; inspect two project shapes, bridges, own orbit and Needs more signals. View signals should focus the correct row. Confirm descriptions fit listening experience. Use a disposable track for cleanup: cancel each action first; then Test, recover via filter; Archive another disposable track. Confirm original file and project reference remain, private/Nexus protections apply, and analysis excludes it. Do not use a real published release for destructive acceptance experiments.

## Read-only signal audit — main owner

| Signal | Uses / 12 | Percent | Finding | Assigned Realms | Top co-occurrence |
|---|---:|---:|---|---|---|
| powerful | 4 | 33% | Distinctive | The Veil: 1, Skybound City: 1, InterSiddhi: 1, Fractured Frontier: 1 | authenticity: 4, driving: 4, breakthrough: 3 |
| defiant | 2 | 17% | Insufficient usage data | Moonlit Roads: 1, Fractured Frontier: 1 | authenticity: 2, dreamy: 2, driving: 2 |
| hazy | 0 | 0% | Insufficient usage data | None | None |
| nostalgic | 7 | 58% | Overlapping | Moonlit Roads: 4, Skybound City: 1, Astral Bazaar: 1, The Veil: 1 | memory: 7, dreamy: 6, floating: 6 |
| romantic | 1 | 8% | Insufficient usage data | Moonlit Roads: 1 | awareness: 1, dark: 1, dreamy: 1 |
| reflective | 6 | 50% | Overlapping | Moonlit Roads: 4, Astral Bazaar: 1, The Veil: 1 | floating: 6, memory: 6, nostalgic: 6 |
| playful | 3 | 25% | Distinctive | Moonlit Roads: 1, Astral Bazaar: 1, Fractured Frontier: 1 | dreamy: 3, driving: 3, memory: 3 |
| peaceful | 1 | 8% | Insufficient usage data | Moonlit Roads: 1 | authenticity: 1, dreamy: 1, floating: 1 |
| driving | 6 | 50% | Observed | The Veil: 1, Moonlit Roads: 1, Skybound City: 1, Astral Bazaar: 1, InterSiddhi: 1, Fractured Frontier: 1 | authenticity: 5, dreamy: 5, memory: 5 |
| floating | 6 | 50% | Overlapping | Moonlit Roads: 4, Astral Bazaar: 1, The Veil: 1 | memory: 6, nostalgic: 6, reflective: 6 |
| groovy | 2 | 17% | Insufficient usage data | Fractured Frontier: 1, Moonlit Roads: 1 | authenticity: 2, dreamy: 2, memory: 2 |
| still | 0 | 0% | Insufficient usage data | None | None |
| dark | 4 | 33% | Distinctive | The Veil: 2, Moonlit Roads: 1, Astral Bazaar: 1 | awareness: 3, dreamy: 3, floating: 3 |
| dreamy | 10 | 83% | Broad | Moonlit Roads: 5, The Veil: 1, Skybound City: 1, Astral Bazaar: 2, Fractured Frontier: 1 | memory: 9, authenticity: 6, nostalgic: 6 |
| raw | 6 | 50% | Observed | Moonlit Roads: 3, Skybound City: 1, InterSiddhi: 1, Fractured Frontier: 1 | memory: 6, dreamy: 5, authenticity: 4 |
| bright | 2 | 17% | Insufficient usage data | Moonlit Roads: 1, Skybound City: 1 | authenticity: 2, dreamy: 2, driving: 2 |
| intimate | 5 | 42% | Overlapping | Moonlit Roads: 3, Astral Bazaar: 1, The Veil: 1 | floating: 5, memory: 5, nostalgic: 5 |
| breakthrough | 5 | 42% | Observed | Moonlit Roads: 1, The Veil: 1, Skybound City: 1, Astral Bazaar: 1, InterSiddhi: 1 | dreamy: 4, driving: 4, memory: 4 |
| memory | 11 | 92% | Broad | Moonlit Roads: 5, Skybound City: 1, Astral Bazaar: 2, InterSiddhi: 1, The Veil: 1, Fractured Frontier: 1 | dreamy: 9, nostalgic: 7, authenticity: 6 |
| love | 5 | 42% | Observed | Moonlit Roads: 2, Astral Bazaar: 1, The Veil: 1, Fractured Frontier: 1 | memory: 5, dreamy: 4, floating: 3 |
| escape | 3 | 25% | Distinctive | Moonlit Roads: 3 | dreamy: 3, floating: 3, memory: 3 |
| ambition | 2 | 17% | Insufficient usage data | The Veil: 1, Moonlit Roads: 1 | authenticity: 2, dreamy: 2, driving: 2 |
| loyalty | 1 | 8% | Insufficient usage data | Astral Bazaar: 1 | authenticity: 1, awareness: 1, dark: 1 |
| exchange | 0 | 0% | Insufficient usage data | None | None |
| authenticity | 7 | 58% | Observed | The Veil: 1, Moonlit Roads: 2, Skybound City: 1, Astral Bazaar: 1, InterSiddhi: 1, Fractured Frontier: 1 | dreamy: 6, memory: 6, driving: 5 |
| awareness | 3 | 25% | Distinctive | Moonlit Roads: 1, Astral Bazaar: 1, The Veil: 1 | dark: 3, floating: 3, intimate: 3 |
