export const WORKSPACE_TOUR_STEPS = [
  { target: 'tracks', title: 'Tracks', body: 'Shape the music in this Release World.' },
  { target: 'assets', title: 'Assets', body: 'Keep artwork, audio and supporting media connected to the work.' },
  { target: 'signals', title: 'Studio Board', body: 'Optional visual space for ideas, notes and world-building. Use it when it helps.' },
  { target: 'prepare', title: 'Prepare Release', body: 'When the project feels coherent, move here to check what’s needed for public presentation.' },
] as const;

export function workspaceTourKey(ownerId: string) {
  return `cosmic:workspace-tour:v1:${encodeURIComponent(ownerId)}`;
}
