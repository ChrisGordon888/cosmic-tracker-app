'use client';

import { publicWorldHref } from '@/lib/releaseSharing';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { PUBLIC_PROJECTS } from '@/graphql/publicProjects';
import { projectPlayback, type PublicProject } from '@/lib/publicProjects';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { usePlatformAccess } from '@/context/PlatformAccessProvider';
import { realmName } from '@/lib/creativeFingerprint';
import '@/styles/publicWorldShelf.css';

export function PublicWorlds({realmId, selectedOnly = false}:{realmId?:number;selectedOnly?:boolean}) {
    const {data,loading,error} = useQuery(PUBLIC_PROJECTS,{variables:{selectedOnly,discoveryOnly:realmId!=null,realmId},fetchPolicy:'network-only'});
    const {isAuthenticated} = usePlatformAccess();
    const {playOrToggleTrack,currentTrack,isPlaying} = useMusicPlayer();
    const projects: PublicProject[] = (data?.publicProjects ?? []).filter((p:PublicProject) => realmId == null || p.realmId === realmId);

    return <section id={realmId == null ? 'canon-worlds' : undefined} className="public-world-shelf">
        <header><h2>{realmId != null ? 'Realm Discovery' : 'Worlds'}</h2><p>{selectedOnly ? 'Worlds selected for Nexus.' : realmId != null ? 'Projects admitted by COSMIC editors. Soundtrack selection is separate.' : 'Current worlds, chosen by their creators.'}</p></header>
        {loading ? <p role="status">Loading worlds…</p> : error ? <p role="status">Worlds could not be loaded.</p> : !projects.length ? <p className="public-world-empty">No Worlds selected here yet.</p> : <div className="public-world-tiles">
            {projects.map(p => {
                const state = projectPlayback(p,isAuthenticated);
                return <article key={p.world.id} className={`public-world-tile${p.isSelected ? ' public-world-tile-selected' : ''}`}>
                    {p.world.coverArtUrl && <Link href={publicWorldHref(p.world.slug, p.world.id)} tabIndex={-1} aria-hidden="true"><img src={p.world.coverArtUrl} alt="" loading="lazy" width={160} height={160}/></Link>}
                    <div className="public-world-tile-copy">
                        {p.isSelected && <span className="public-world-label">Nexus selected</span>}
                        <h3>{p.world.title}</h3>
                        <p>{p.creatorName}</p>
                        <p>{p.realmId == null ? 'Mixed / undecided Realm' : realmName(p.realmId)} · {state.total} tracks</p>
                        <p>{state.available} playable now{state.member ? ` · ${state.member} require sign-in` : ''}</p>
                        <div className="public-world-actions">
                            <Link href={publicWorldHref(p.world.slug, p.world.id)}>Enter World →</Link>
                            {state.lead && <button type="button" onClick={() => playOrToggleTrack(state.lead!, state.queue, {source: 'release', label: `${p.world.title} release`})} aria-label={`Play or pause ${state.lead.trackTitle}`}>{currentTrack?.id === state.lead.id && isPlaying ? 'Pause' : 'Play'}</button>}
                        </div>
                    </div>
                </article>;
            })}
        </div>}
    </section>;
}

export default function SelectedWorlds(){return <PublicWorlds />;}
