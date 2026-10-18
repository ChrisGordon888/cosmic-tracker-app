import { REALM_COLORS, REALM_NAMES, REALM_ORDER, type RealmId } from './musicRegistry';
import type { CreatorPath } from '../components/intelligence/CreatorPaths';
import type { Workbench } from './intelligenceWorkbench';
export type UniverseView = { scale: 'song' | 'realm' | 'universe'; realmId?: number; page?: number; context?: { scale: 'realm' | 'universe'; realmId?: number; page?: number } };
export function livingUniverse(analysis: Workbench, selectedId: string, paths: CreatorPath[] = [], view: UniverseView = { scale: 'song' }) {
    const ordered = analysis.songs.slice().sort((a, b) => a.trackId.localeCompare(b.trackId));
    const selected = ordered.find(s => s.trackId === selectedId) ?? ordered[0];
    const supported = analysis.catalog.edges.filter(e => e.a === selected?.trackId || e.b === selected?.trackId).sort((a, b) => b.score - a.score);
    const wanted = [supported[0] && (supported[0].a === selected?.trackId ? supported[0].b : supported[0].a), ...paths.filter(p => p.a === selected?.trackId || p.b === selected?.trackId).map(p => p.a === selected?.trackId ? p.b : p.a), ...supported.map(e => e.a === selected?.trackId ? e.b : e.a)];
    const neighborhood = selected ? [selected, ...[...new Set(wanted)].filter(id => id && id !== selected.trackId).map(id => ordered.find(s => s.trackId === id)).filter((s): s is typeof selected => Boolean(s)).slice(0, 3)] : [];
    const context = view.scale === 'song' ? view.context ?? { scale: 'universe' as const, page: Math.max(0, Math.floor(ordered.findIndex(s => s.trackId === selected?.trackId) / 12)) } : view;
    const scope = context.scale === 'realm' ? ordered.filter(s => s.sourceFacts.realmId === context.realmId) : ordered;
    const pageCount = Math.max(1, Math.ceil(scope.length / 12)), page = Math.max(0, Math.min(context.page ?? 0, pageCount - 1));
    const window = scope.slice(page * 12, page * 12 + 12);
    const visible = view.scale === 'song' ? [...neighborhood, ...window.filter(s => !neighborhood.some(n => n.trackId === s.trackId))] : window;
    // Identity-derived offsets retain orientation across pagination, focus and scale changes.
    const positionFor = (id: string, realmId: number | null | undefined): [number, number, number] => {
        let hash = 2166136261; for (const c of id) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
        hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b) >>> 0; hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35) >>> 0; hash = (hash ^ (hash >>> 16)) >>> 0;
        const realm = REALM_ORDER.indexOf(realmId as RealmId);
        const angle = (realm < 0 ? 6 : realm) / 7 * Math.PI * 2;
        const local = (hash % 10000) / 10000 * Math.PI * 2;
        const radius = 2.3 + ((hash >>> 12) % 100) / 32;
        return [Math.cos(angle) * 13 + Math.cos(local) * radius, Math.sin(angle * 2) * 2 + ((hash >>> 19) % 100) / 28 - 1.75, Math.sin(angle) * 6 + Math.sin(local) * radius];
    };
    const groupFor = (id: string) => {
        const project = analysis.projects.find(p => p.members.some(s => s.trackId === id));
        if (project) return { id: `world:${project.world.id}`, title: project.world.title };
        const cluster = analysis.catalog.clusters.find(c => c.trackIds.includes(id));
        return cluster ? { id: `cluster:${cluster.id}`, title: 'Shared signals' } : { id: 'independent', title: 'Independent voices' };
    };
    const keys = [...new Set(visible.map(s => groupFor(s.trackId).id))].sort();
    const groups = keys.map((id, i) => { const angle = i / keys.length * Math.PI * 2; const radius = keys.length > 1 ? Math.max(8, keys.length * 2.1) : 0; return { id, title: groupFor(visible.find(s => groupFor(s.trackId).id === id)!.trackId).title, position: [Math.cos(angle) * radius, Math.sin(angle * 2) * 1.4, Math.sin(angle) * radius * .65] as [number, number, number] }; });
    const nodes = visible.map((song) => {
        const group = groups.find(g => g.id === groupFor(song.trackId).id)!;
        const realmId = song.sourceFacts.realmId, known = realmId != null && realmId in REALM_COLORS;
        return { id: song.trackId, title: song.sourceFacts.title, artwork: song.sourceFacts.artworkUrl, groupId: group.id, realmId, realmName: known ? REALM_NAMES[realmId as RealmId] : 'Realm undecided', color: known ? REALM_COLORS[realmId as RealmId] : '#889099', position: positionFor(song.trackId, realmId) };
    });
    const ids = new Set(nodes.map(n => n.id));
    const degree = new Map<string, number>();
    const edges = analysis.catalog.edges.filter(e => ids.has(e.a) && ids.has(e.b)).sort((a, b) =>
        (view.scale === 'song' ? Number(b.a === selectedId || b.b === selectedId) - Number(a.a === selectedId || a.b === selectedId) : 0) || b.score - a.score || `${a.a}:${a.b}`.localeCompare(`${b.a}:${b.b}`)
    ).filter(e => {
        if (view.scale !== 'song' && ((degree.get(e.a) ?? 0) >= 3 || (degree.get(e.b) ?? 0) >= 3)) return false;
        degree.set(e.a, (degree.get(e.a) ?? 0) + 1); degree.set(e.b, (degree.get(e.b) ?? 0) + 1); return true;
    }).slice(0, 12).map(e => ({ ...e, kind: 'supported' as const }));
    const authored = paths.filter(p => ids.has(p.a) && ids.has(p.b)).slice(0, 6).map(p => ({ ...p, kind: 'authored' as const, strong: true, meaningful: true, score: 0, shared: [], note: p.note }));
    return { nodes, edges: [...edges.filter(e => !authored.some(p => (p.a === e.a && p.b === e.b) || (p.a === e.b && p.b === e.a))), ...authored], groups, total: ordered.length, scopeCount: scope.length, page, pageCount, scale: view.scale, contextKey: `${context.scale}:${context.realmId ?? 'all'}:${page}`, focusIds: neighborhood.map(s => s.trackId) };
}
