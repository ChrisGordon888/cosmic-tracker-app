import { REALM_COLORS, REALM_NAMES, REALM_ORDER, type RealmId } from './musicRegistry';
import { songPosition, realmRegion } from './universeLayout';
import type { CreatorPath } from '../components/intelligence/CreatorPaths';
import type { Workbench } from './intelligenceWorkbench';
export type UniverseView = { scale: 'song' | 'realm' | 'universe'; realmId?: number | null; context?: { scale: 'realm' | 'universe'; realmId?: number | null } };
export function livingUniverse(analysis: Workbench, selectedId: string, paths: CreatorPath[] = [], view: UniverseView = { scale: 'universe' }) {
    const ordered = analysis.songs.slice().sort((a, b) => a.trackId.localeCompare(b.trackId));
    const selected = ordered.find(s => s.trackId === selectedId);
    const supported = analysis.catalog.edges.filter(e => e.a === selected?.trackId || e.b === selected?.trackId).sort((a, b) => b.score - a.score);
    const wanted = [supported[0] && (supported[0].a === selected?.trackId ? supported[0].b : supported[0].a), ...paths.filter(p => p.a === selected?.trackId || p.b === selected?.trackId).map(p => p.a === selected?.trackId ? p.b : p.a), ...supported.map(e => e.a === selected?.trackId ? e.b : e.a)];
    const neighborhood = selected ? [selected, ...[...new Set(wanted)].filter(id => id && id !== selected.trackId).map(id => ordered.find(s => s.trackId === id)).filter((s): s is typeof selected => Boolean(s)).slice(0, 3)] : [];
    const context = view.scale === 'song' ? view.context ?? { scale: 'universe' as const } : view;
    const scope = context.scale === 'realm' ? ordered.filter(s => (s.sourceFacts.realmId ?? null) === (context.realmId ?? null)) : ordered;
    const visible = ordered;
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
        return { id: song.trackId, title: song.sourceFacts.title, artwork: song.sourceFacts.artworkUrl, groupId: group.id, realmId, realmName: known ? REALM_NAMES[realmId as RealmId] : 'Realm undecided', color: known ? REALM_COLORS[realmId as RealmId] : '#889099', position: songPosition(song.trackId, realmId) };
    });
    const ids = new Set(nodes.map(n => n.id));
    const degree = new Map<string, number>();
    const scopeIds = new Set(scope.map(song => song.trackId));
    const edges = analysis.catalog.edges.filter(e => ids.has(e.a) && ids.has(e.b)).sort((a, b) =>
        (view.scale === 'song' ? Number(b.a === selectedId || b.b === selectedId) - Number(a.a === selectedId || a.b === selectedId) : view.scale === 'realm' ? Number(scopeIds.has(b.a) || scopeIds.has(b.b)) - Number(scopeIds.has(a.a) || scopeIds.has(a.b)) : 0) || b.score - a.score || `${a.a}:${a.b}`.localeCompare(`${b.a}:${b.b}`)
    ).filter(e => {
        if (view.scale !== 'song' && ((degree.get(e.a) ?? 0) >= 3 || (degree.get(e.b) ?? 0) >= 3)) return false;
        degree.set(e.a, (degree.get(e.a) ?? 0) + 1); degree.set(e.b, (degree.get(e.b) ?? 0) + 1); return true;
    }).slice(0, 12).map(e => ({ ...e, kind: 'supported' as const }));
    const authored = paths.filter(p => ids.has(p.a) && ids.has(p.b)).sort((a,b) => Number(b.a === selectedId || b.b === selectedId) - Number(a.a === selectedId || a.b === selectedId)).slice(0, 6).map(p => ({ ...p, kind: 'authored' as const, strong: true, meaningful: true, score: 0, shared: [], note: p.note }));
    return { nodes, edges: [...edges.filter(e => !authored.some(p => (p.a === e.a && p.b === e.b) || (p.a === e.b && p.b === e.a))), ...authored], groups, total: ordered.length, scopeCount: scope.length, scale: view.scale, realmId: view.realmId, contextKey: `${context.scale}:${context.scale === 'universe' ? 'all' : context.realmId ?? 'unassigned'}`, focusIds: view.scale === 'realm' ? scope.map(s => s.trackId) : neighborhood.map(s => s.trackId), regions: [...REALM_ORDER, null].map(id => ({ ...realmRegion(id), count: ordered.filter(s => (s.sourceFacts.realmId ?? null) === id).length })) };
}
