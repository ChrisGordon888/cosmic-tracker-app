'use client';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Fragment, useState } from 'react';
import { PUBLIC_PROJECTS } from '@/graphql/publicProjects';
import { projectPlayback, type PublicProject } from '@/lib/publicProjects';
import { realmName } from '@/lib/creativeFingerprint';

const CONFIG = gql`query ProjectSelections{nexusEditorialConfig{id selectedWorldIds}}`;
const SAVE = gql`mutation SetProjectSelection($worldId:ID!,$selected:Boolean!){setNexusProjectSelection(worldId:$worldId,selected:$selected){id selectedWorldIds}}`;

export default function ProjectSelections() {
    const worlds = useQuery(PUBLIC_PROJECTS, { fetchPolicy: 'network-only' });
    const config = useQuery(CONFIG, { fetchPolicy: 'network-only' });
    const [save] = useMutation(SAVE);
    const [working, setWorking] = useState(false);
    const [message, setMessage] = useState('');
    const selected: string[] = config.data?.nexusEditorialConfig.selectedWorldIds || [];
    const projects: PublicProject[] = worlds.data?.publicProjects || [];
    const stale = selected.filter(id => !projects.some(p => p.world.id === id));
    const ordered = [...projects].sort((a, b) => Number(selected.includes(b.world.id)) - Number(selected.includes(a.world.id)));

    async function update(worldId: string, value: boolean) {
        setWorking(true);
        setMessage('');
        try {
            await save({ variables: { worldId, selected: value } });
            await Promise.all([config.refetch(), worlds.refetch()]);
            setMessage(value ? 'Selected for Nexus. Project Canon and tracks are unchanged.' : 'Selection removed. Project Canon and tracks are unchanged.');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not save selection.');
        } finally { setWorking(false); }
    }

    return <section className="glass-card p-5 mb-6">
        <h2 className="text-xl">World curation</h2>
        <p className="text-sm text-white/65">Canon makes a World eligible. Select it to admit it to Nexus; deselect it to remove it from Nexus. Creator Canon and direct public access stay unchanged.</p>
        <p role="status" className="my-3">{message}</p>
        {worlds.loading || config.loading ? <p role="status">Loading World selections…</p> : worlds.error || config.error ? <p role="alert">World selections could not be loaded. <button type="button" onClick={() => { void worlds.refetch(); void config.refetch(); }}>Retry</button></p> : <>
            <p className="text-sm">Current Nexus Worlds: {selected.length - stale.length} selected{stale.length ? ` · ${stale.length} no longer eligible` : ''}</p>
            {!projects.length && <p>No eligible Canon Worlds yet.</p>}
            {ordered.map((p, index) => {
                const isSelected = selected.includes(p.world.id);
                const playback = projectPlayback(p, false);
                return <Fragment key={p.world.id}>
                    {(index === 0 || selected.includes(ordered[index - 1].world.id) !== isSelected) && <h3 className="mt-5 font-semibold">{isSelected ? 'Current Nexus Worlds' : 'Eligible Canon Worlds'}</h3>}
                    <article className="flex flex-wrap items-center gap-4 border-b border-white/10 py-4">
                    {p.world.coverArtUrl && <img src={p.world.coverArtUrl} alt="" width={64} height={64} className="h-16 w-16 rounded-lg object-cover" loading="lazy" />}
                    <div className="min-w-0 flex-1"><h3 className="break-words">{p.world.title}</h3><p className="text-sm text-white/65">{p.creatorName} · {p.realmId == null ? 'Mixed / undecided Realm' : realmName(p.realmId)}</p><p className="text-sm text-white/65">{playback.total} public tracks · {playback.available} playable signed out · Public Canon · {isSelected ? '✓ Selected' : 'Not selected'}</p></div>
                    <button type="button" className="min-h-11 rounded-lg border border-white/20 px-3 text-sm" disabled={working} onClick={() => update(p.world.id, !isSelected)}>{isSelected ? 'Deselect from Nexus' : 'Select for Nexus'}</button>
                </article></Fragment>;
            })}
            {stale.map(id => <div key={id} className="flex flex-wrap items-center gap-3 py-3"><span>No longer eligible · saved reference {id}</span><button type="button" disabled={working} onClick={() => update(id, false)}>Remove selection</button></div>)}
        </>}
    </section>;
}
