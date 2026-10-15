export const WORKSPACE_TOUR_STEPS = [
  { target: 'tracks', title: 'Music', body: 'Select a track to shape its title, audio, creative status and notes. Listener settings stay in their own disclosure.' },
  { target: 'tracks', title: 'Realm', body: 'Open Realm & Nexus in Tracks for a Realm assignment and the optional Find Your Realm guide. Choose where the music belongs; this does not grant Nexus placement.' },
  { target: 'assets', title: 'Artwork', body: 'Use Assets for artwork and supporting media. Choose the cover that gives this release its visual identity.' },
  { target: 'portal', title: 'Story', body: 'Release details holds the one-line summary and story: what should a listener understand about this world?' },
  { target: 'prepare', title: 'Release', body: 'Prepare Release is the handoff to readiness checks, visibility and publishing. Review the requirements there before publishing.' },
  { target: 'signals', title: 'Studio Board', body: 'Optional visual space for ideas, notes and world-building. Your music and release can develop without using the canvas.' },
] as const;

export function workspaceTourKey(ownerId: string) {
  return `cosmic:workspace-tour:v1:${encodeURIComponent(ownerId)}`;
}
