# Navigation and creative commerce refinement — November 6, 2026

Branch `feat/media-originals-v1`, based on `def9484`. Frontend-only; no database,
publication, payment, provider or authentication authority changes.

## Changes

- Shared Creator navigation configuration groups Overview, Create & Publish,
  Business and Workspace. Nested Marketplace routes highlight their parent.
- A single layout-scoped request to the existing authorized engagement summary
  controls operator-only Media Studio, Marketplace and Engagements links. Failure
  or denied access hides those choices; no counts are invented. Backend gates remain
  authoritative. Creator Home uses this same result for its compact business entry.
- Mobile Creator navigation is an expandable, labeled two-column menu with Escape
  and trigger focus restoration. Creator pages no longer compete with BottomNav.
- Public header and mobile bottom bar show four principal destinations; Creator,
  Home and secondary experiences remain available in the existing global menu.
  Signed-out account action leads to `/auth`, signed-in action to `/profile`.
- Marketplace uses scannable rows and explicit status labels. Public Shop, Activity
  and provider settings are contextual tools. Private product preparation is secondary.
- Offering Studio uses Identity, Commercial Details, Product Details, and Review &
  Publish. Product details are collapsible; technical requirements remain open by
  default. Preview is optional rather than dominating the editor. Saved/unsaved
  indication is shown; publication checks and all existing content fields remain.
- Media Studio is a first-class publishing route with a Creator Home breadcrumb,
  provider/status labels, empty guidance and collapsible related-content controls.
- Scoped commerce styles refine spacing, controls, cards, focus, responsive layout
  and reduced-motion behavior. No music/Realm renderer was changed.

## Evidence

- Eight focused frontend tests passed: two navigation configuration tests and six
  existing commerce presentation tests. No unrelated backend suites rerun.
- TypeScript and changed-file ESLint passed (zero lint errors/warnings).
- Normal production build passed in an isolated copy with installed dependencies;
  existing repository-wide image/hook warnings remain. No dependencies installed.
- `git diff --check` passed.
- Browser tested public Shop/Media at 390, 768 and 1366px. Measured document widths
  matched viewport widths. Mobile menu, Escape/focus restoration, navigation closing,
  active Media route and public-to-Creator sign-in gate were exercised.
- Isolated frontend had no backend environment: displayed configuration/API errors
  honestly. This was NOT authenticated staging, catalog persistence or a populated
  private editor acceptance test. No auth bypass or fixture route was introduced.
- Private responsive layout is source/type/SSR verified, not browser accepted.

## Owner review

After loading the branch in existing staging, sign in normally:
1. `/creator`: Library and Projects; authorized Media Studio and Marketplace entry.
2. Shared rail: verify groups and active destination; at 390px open Workspace,
   select a destination, and test Escape. Ordinary creators must not see operator links.
3. `/creator/marketplace`: inspect status rows; New Offering; edit existing draft;
   show preview; expand Product Details; check saved/unsaved indication. Do not
   publish genuine work merely for UI testing.
4. Open Commercial Activity and return; Provider settings should open and scroll
   into view; Private product concepts stays secondary.
5. `/creator/media`: inspect existing media or empty guidance, edit/preview, expand
   related links. Confirm no publication occurs without an explicit action.
6. Public Shop/Media and an existing offer: artwork, disclosures, technical details,
   CTA and keyboard focus at 390/768/1366px. Verify authenticated account action.

No routes renamed. No merge, push or deploy performed.
