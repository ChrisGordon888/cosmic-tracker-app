import { REALM_ANCHORS } from './universeLayout';
import type { UniverseView } from './livingUniverse';
export function intelligenceNavigation(search: string, allowedIds: string[]): { songId: string; view: UniverseView } {
    const params = new URLSearchParams(search);
    const songId = params.get('song') ?? params.get('trackId') ?? '';
    if (allowedIds.includes(songId)) return { songId, view: { scale: 'song', context: { scale: 'universe' } } };
    const realm = params.get('realm');
    if (realm === 'unassigned') return { songId: '', view: { scale: 'realm', realmId: null } };
    if (realm !== null && /^\d+$/.test(realm) && Number(realm) in REALM_ANCHORS) return { songId: '', view: { scale: 'realm', realmId: Number(realm) } };
    return { songId: '', view: { scale: 'universe' } };
}
