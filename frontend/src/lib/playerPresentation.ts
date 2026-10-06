export type PlayerMode = 'expanded' | 'compact' | 'minimized';
export type PlayerPresentation = { mode: PlayerMode; tour: boolean; manual: boolean; previous: PlayerMode };
export function adaptPlayer(state: PlayerPresentation, tour: boolean): PlayerPresentation {
  if (state.tour === tour) return state;
  if (tour) return { mode: state.mode === 'minimized' ? 'minimized' : 'compact', previous: state.mode, tour, manual: false };
  return { ...state, tour, mode: state.manual ? state.mode : state.previous, manual: false };
}
export function choosePlayer(state: PlayerPresentation, mode: PlayerMode): PlayerPresentation {
  return { ...state, mode, manual: true };
}

export type PlayerDock = 'left' | 'right';
export const PLAYER_DOCK_KEY = 'cosmic:player-dock:v1';
export function readPlayerDock(value: string | null): PlayerDock {
  return value === 'left' ? 'left' : 'right';
}
// Both existing guided callouts occupy the right-hand dock. Never mutate preference.
export function playerDock(preferred: PlayerDock, guidanceVisible: boolean): PlayerDock {
  return guidanceVisible ? 'left' : preferred;
}
