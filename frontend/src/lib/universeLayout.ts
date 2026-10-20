import { REALM_COLORS, REALM_NAMES, type RealmId } from './musicRegistry';
export type SpatialAnchor = { position: [number, number, number]; spread: [number, number, number] };
// Art direction only: these coordinates carry no taxonomy, rank or sonic-distance meaning.
export const REALM_ANCHORS: Record<RealmId, SpatialAnchor> = {
    303: { position: [-18, -4, 8], spread: [7, 3, 5] },
    202: { position: [-6, 10, -9], spread: [5, 5, 6] },
    101: { position: [12, 3, 10], spread: [7, 3, 4] },
    55: { position: [19, 14, -8], spread: [5, 4, 5] },
    44: { position: [-20, 5, -16], spread: [6, 4, 7] },
    0: { position: [2, -10, -5], spread: [8, 3, 5] },
};
export const UNASSIGNED_ANCHOR: SpatialAnchor = { position: [26, -9, 15], spread: [5, 3, 4] };
export function realmAnchor(realmId: number | null | undefined) {
    return realmId != null && realmId in REALM_ANCHORS ? REALM_ANCHORS[realmId as RealmId] : UNASSIGNED_ANCHOR;
}
export function songPosition(id: string, realmId: number | null | undefined): [number, number, number] {
    let hash = 2166136261;
    for (const c of id) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
    const sample = () => { hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b) >>> 0; hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35) >>> 0; hash = (hash ^ (hash >>> 16)) >>> 0; return hash / 0xffffffff * 2 - 1; };
    const anchor = realmAnchor(realmId);
    return anchor.position.map((coordinate, i) => coordinate + sample() * anchor.spread[i]) as [number, number, number];
}
export function realmRegion(id: number | null) {
    const known = id != null && id in REALM_ANCHORS;
    return { id: known ? id : null, name: known ? REALM_NAMES[id as RealmId] : 'Unassigned', color: known ? REALM_COLORS[id as RealmId] : '#889099', ...realmAnchor(id) };
}
