/** Public exploration is independent of saved trial/progression unlocks. */
export const PUBLIC_REALM_IDS = [303, 202, 101, 55, 44, 0] as const;
export function canExplorePublicRealm(id: number) {
  return PUBLIC_REALM_IDS.some(realm => realm === id);
}
export function orderedPlayableRelease<T extends {trackNumber?: number | null}>(tracks: readonly T[], playable: (track:T)=>boolean):T[] {
  return tracks.map((track,index)=>({track,index})).filter(({track})=>playable(track))
    .sort((a,b)=>(a.track.trackNumber??Infinity)-(b.track.trackNumber??Infinity)||a.index-b.index).map(({track})=>track);
}
