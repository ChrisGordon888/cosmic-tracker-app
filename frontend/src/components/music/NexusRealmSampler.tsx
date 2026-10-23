'use client';

import Link from 'next/link';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import type { MusicTrack } from '@/context/MusicPlayerProvider';
import './nexusRealmSampler.css';

/** An editorial sequence, never re-ranked by Canon or listening history. */
export default function NexusRealmSampler({ realmId, realmName, realmIcon, color, tracks }: {
    realmId: string; realmName: string; realmIcon: string; color: string; tracks: MusicTrack[];
}) {
    const player = useMusicPlayer();
    const index = tracks.findIndex(track => track.id === player.currentTrack?.id);
    const selected = tracks[Math.max(0, index)];
    const play = (track: MusicTrack) => void player.playOrToggleTrack(track, tracks, { source: 'nexus', label: `${realmName} sampler` });
    const step = (delta: number) => {
        const next = tracks[(Math.max(0, index) + delta + tracks.length) % tracks.length];
        if (next) play(next);
    };
    return <article className="nexus-sampler" style={{ '--sampler': color } as React.CSSProperties} aria-label={`${realmName} curated sampler`}>
        <header><span aria-hidden="true">{realmIcon}</span><small>NEXUS SAMPLER · {tracks.length} / 9</small><h3>{realmName}</h3></header>
        <div className="nexus-sampler-signal">
            <span className="nexus-sampler-art" aria-hidden="true">{selected?.artworkUrl ? <img src={selected.artworkUrl} alt="" /> : '✦'}</span>
            <div><strong>{selected?.trackTitle}</strong><p>{selected?.artist}</p></div>
        </div>
        <div className="nexus-sampler-controls">
            <button aria-label={`Previous ${realmName} sampler song`} disabled={tracks.length < 2} onClick={() => step(-1)}>←</button>
            <button onClick={() => selected && play(selected)}>{index >= 0 && player.isPlaying ? 'Pause' : 'Play sampler'}</button>
            <button aria-label={`Next ${realmName} sampler song`} disabled={tracks.length < 2} onClick={() => step(1)}>→</button>
        </div>
        <ol>{tracks.map((track, i) => <li key={track.id}><button aria-pressed={index === i} onClick={() => play(track)}><small>{String(i + 1).padStart(2, '0')}</small><span>{track.trackTitle}</span></button></li>)}</ol>
        <Link href={`/realms/${realmId}`}>Explore the full Realm →</Link>
    </article>;
}
