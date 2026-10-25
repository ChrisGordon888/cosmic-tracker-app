# Realm music foundation fixtures

From the repository root: `node frontend/dev/realm-music/preview.cjs`.
Open http://127.0.0.1:4321. Stop with Ctrl-C. Existing installed frontend dependencies suffice.

This standalone local server is **not a Next route**, not in `public`, not imported by
production code, binds only to loopback, and refuses `NODE_ENV=production`. Do not
include it in a public server configuration. It compiles the actual React components
and shared MusicPlayerProvider in memory. Apollo reads are fictional fixtures; writes
throw; authentication/telemetry hooks are mocked. No environment files, DB connection,
credentials, external media, or records are used. Generated 60-second tones are for
measurement/playback verification, not artistic audio examples. Enter links retain
production route destinations; the isolated harness does not implement those pages.

- `/?mode=sampler&count=1&realm=303` — compare 0,1,2,3,4,5,9 with the links.
- `/?mode=full&count=100&realm=303` — compare 1,5,9,30,100, including a long title.
- `/?mode=editorial` — actual RealmSelections component with fictional read-only data.
- `/mobile?mode=full&count=100&realm=202` — 390 × 844 iframe using the same components.
- `&reduced` — simulates the JS reduced-motion preference (does not change OS CSS media).
- `&fallback` — simulates unsupported capture. Playback remains functional.

Use real OS/browser reduced motion separately for final CSS acceptance. Realm colors
come from the existing theme. Progress is a fixed fixture Realm progress value (40%),
not a made-up audio measurement. Live analysis uses the generated audible samples.

Acceptance: select last pill, verify shared MiniPlayer, seek, pause there, switch songs,
enable visuals, open secondary search and query a song; all ordered pills remain.
No more than five sampler nodes or eight full-Realm nodes render. Verify keyboard
focus/Enter, long titles, scrollable pills, 390px clearance. Editorial buttons must not
write even when clicked in this harness. Authenticated editorial acceptance remains a
separate staging check.

## V3 chamber
Optional `FIXTURE_PORT=4322` avoids disturbing an existing preview server. The fixture
now includes original SVG artwork plus a missing-artwork song. `&nogl` disables only
fixture WebGL creation to verify the CSS heart. No browser security settings change.
The full stage now has a bounded DOM/SVG orbit and small WebGL core; sampler remains
unchanged. See `docs/realm-soundstage-v3.md` at repository root for acceptance and limits.
