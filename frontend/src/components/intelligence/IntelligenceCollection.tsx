'use client';
import { useState } from 'react';
import type { Workbench } from '@/lib/intelligenceWorkbench';
export default function IntelligenceCollection({ catalog, hiddenIds, onChange, busy }: { catalog: Workbench; hiddenIds: string[]; onChange: (id: string, included: boolean) => Promise<void>; busy: boolean }) {
    const [search, setSearch] = useState('');
    const hidden = new Set(hiddenIds);
    return <details className="intelligence-collection universe-depth"><summary>Manage collection · {catalog.songs.filter(s => hidden.has(s.trackId)).length} hidden</summary>
        <div className="intelligence-collection-body"><p>Choose what appears in Intelligence. Hiding is reversible. Songs, files, projects and public settings stay unchanged.</p>
            <label>Find in your collection<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Song title…" /></label>
            <ul>{catalog.songs.filter(s => s.sourceFacts.title.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b) => Number(hidden.has(b.trackId))-Number(hidden.has(a.trackId)) || a.sourceFacts.title.localeCompare(b.sourceFacts.title)).map(s => <li key={s.trackId}><span>{s.sourceFacts.title}<small>{hidden.has(s.trackId) ? 'Hidden from Intelligence' : 'In Intelligence'}</small></span><button disabled={busy} onClick={() => void onChange(s.trackId, hidden.has(s.trackId))}>{hidden.has(s.trackId) ? 'Show in Intelligence' : 'Hide from Intelligence'}</button></li>)}</ul>
            {!catalog.songs.length && <p>No eligible Library songs yet.</p>}
        </div></details>;
}
