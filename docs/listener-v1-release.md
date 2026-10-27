# Listener V1 release candidate — 2026-10-27

Approved listener changes: public navigation across six Realms; optional progression preserved; ordered eligible Featured World queue independent of Spotlight; typed browser-local latest guidance; separate full Soundstage/sampler counts. No editorial or private-catalog mutations.

Validation: 228 frontend tests, TypeScript and changed-file ESLint pass (five warnings). An isolated normal production build passed with real Google Fonts downloads, no mocked fonts and no production credentials. Local runtime was Node 24; Vercel project runtime is Node 22, so cloud build acceptance is still required. Prior fictional browser acceptance covered desktop Realm navigation, Finder retake/refresh, EP queue and independent Spotlight; narrow 390px layout was inspected, touch acceptance remains manual.

Actual Vercel target: `cosmic-tracker-app` in `cosmics-projects-8132b981`, root `frontend`, production branch `main`, Next.js default build/install commands. On inspection production was Ready at `f9c29de90b3847c7722e8304a272228e1e8e05a7`.

The ignored local `frontend/.vercel/project.json` points at an old `frontend` project, not the production project. Do not deploy using that stale link. Explicitly verify project identity before any deployment; do not create another project.

Preview and Production currently share GraphQL/auth/Blob variable scopes. Confirm an isolated backend/database and safe Preview auth/Blob configuration before uploading. Public World reads may execute scheduled-publication logic; anonymous browsing is not a guarantee of no database writes.

Acceptance gates: preview build succeeds; 33 full tracks versus 19 sampler tracks; four selected Worlds and four Discovery placements; SIRENS World queue and independent Siren Spotlight; all six signed-out Realms; Finder latest result; artwork/audio; real mobile navigation; optional signed-in progression/private boundaries. These counts are expectations, never constants.

Production merge/domain changes require owner approval after Preview acceptance. Record prior deployment ID and promote/rollback only the reviewed frontend deployment. Commercial backend changes are outside this listener release.
