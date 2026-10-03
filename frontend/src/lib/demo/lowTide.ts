/** Fictional, read-only reference project. Never inserted into the creator database. */
export const demoWorld = {
  title: 'Low Tide',
  summary: 'Two rooms. One light left on. A small study in the things a place remembers.',
  coverArtUrl: '/demo-world/low-tide.svg',
  tracks: [
    {
      id: 'demo-low-tide-threshold', slug: 'threshold', title: 'Threshold',
      artworkUrl: '/demo-world/low-tide.svg', audioUrl: '/demo-world/threshold.wav',
      mood: 'Warm keys · a slow pulse · room to breathe',
      hook: 'Leave the light where I can find it.',
      playable: true, actionLabel: 'Play sound study',
    },
    {
      id: 'demo-low-tide-return', slug: 'return-path', title: 'Return Path',
      artworkUrl: '/demo-world/return-path.svg', audioUrl: '/demo-world/return-path.wav',
      mood: 'A softer answer · the same room, changed',
      hook: 'The room was smaller. The feeling wasn’t.',
      playable: true, actionLabel: 'Play sound study',
    },
  ],
  fragments: [
    { id: 'threshold-note', title: 'Leave room after the hook', eyebrow: 'Arrangement note', body: 'The first version filled every pause. This one leaves a bar empty after the central phrase. The silence is part of the invitation.', connectedTrackSlug: 'threshold', isPublic: true },
    { id: 'return-note', title: 'Same window. Later light.', eyebrow: 'Visual direction', body: 'The second image uses the same shapes. Only their distance and the light change. A second song can extend a world without replacing its identity.', connectedTrackSlug: 'return-path', isPublic: true },
    { id: 'margin', title: 'A mark on the frame', eyebrow: 'Look closer', body: 'There are two small notches on the lower edge of the window. Someone measured the light twice. Neither mark is quite straight.', isPublic: true },
  ],
};

/** Illustrative project decisions, not calculated readiness or persisted creator state. */
export const demoProcess = [
  { title: 'Project context', detail: 'Low Tide: two rooms, one light left on. Protect the warmth; avoid a crowded arrangement or a glossy, distant image.' },
  { title: 'Tracks / sequence', detail: '01 Threshold — establish the invitation. 02 Return Path — return with a changed feeling. The central writing direction: “Leave the light where I can find it.”' },
  { title: 'Creative development', detail: 'Protect the unhurried melody. Deepen the low notes. Cut the extra fill. Next: develop a vocal response. These original instrumental studies illustrate direction, not a finished vocal record.' },
  { title: 'Assets', detail: 'Two original SVG covers and two 24-second original WAV studies. Each song has its own audio and artwork. The interactive room is an authored demo interpretation of those visual references.' },
  { title: 'Studio Board / fragments', detail: 'Sound: leave room after the hook. Image: one window, later light. The selected arrangement note and visual direction become listener-facing fragments; working notes need not become public.' },
  { title: 'Listener settings', detail: 'In this reference, both sound studies are playable and the selected fragments are visible. A real project chooses these settings explicitly; the demo does not publish anything.' },
  { title: 'Prepare Release', detail: 'A real release reviews canonical media, track visibility and actual blockers in Prepare Release, then explicitly publishes. This walkthrough illustrates the handoff; it is not a readiness result.' },
  { title: 'Public world', detail: 'Music leads. Artwork, fragments and sequence express the same identity. Low Tide’s enterable room is custom demo work—not a feature automatically generated for every artist.' },
];
