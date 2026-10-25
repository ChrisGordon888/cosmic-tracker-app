'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { publicWorldHref } from '@/lib/releaseSharing';
import OrbitStage, { type ChamberMeasurement } from './OrbitStage';
import type { MusicTrack } from '@/context/MusicPlayerProvider';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { openResonanceAnalysis, measuredEnergy, analysisFailureMessage } from '@/lib/resonanceAnalysis';
import './realmResonance.css';

const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

/** One Realm's visual stage, always following the shared player's selected song. */
export default function RealmResonance({ tracks, color, realmName, realmIcon, isTrackLocked = () => false }: {
    tracks: MusicTrack[]; color: string; realmName: string; realmIcon: string;
    isTrackLocked?: (track: MusicTrack) => boolean;
}) {
    const player = useMusicPlayer();
    const { getAudioElement, isPlaying, currentTrack } = player;
    const active = Boolean(currentTrack && tracks.some(t => t.id === currentTrack.id));
    const [chosen, setChosen] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const selected = tracks.find(t => t.id === (active ? currentTrack?.id : chosen)) ?? tracks[0];
    const visibleTracks = tracks.filter(t => `${t.trackTitle} ${t.artist ?? ''}`.toLowerCase().includes(search.toLowerCase()));
    const pages = Math.max(1, Math.ceil(visibleTracks.length / 8));
    const safePage = Math.min(page, pages - 1);
    const orbitTracks = visibleTracks.slice(safePage * 8, safePage * 8 + 8);
    const selectedVisibleIndex = visibleTracks.findIndex(t => t.id === selected?.id);
    useEffect(() => {
        if (selectedVisibleIndex >= 0) setPage(Math.floor(selectedVisibleIndex / 8));
    }, [selected?.id, selectedVisibleIndex]);
    const queue = tracks.filter(t => !isTrackLocked(t) && t.trackUrl);
    function choose(track: MusicTrack) {
        setChosen(track.id);
        if (track.trackUrl && !isTrackLocked(track)) void player.playOrToggleTrack(track, queue, {source:'realm',label:`${realmName} soundtrack`});
    }
    function step(delta:number) {
        const index = queue.findIndex(t => t.id === selected?.id);
        const next = queue[(Math.max(0,index) + delta + queue.length) % queue.length];
        if(next) choose(next);
    }
    const measurement = useRef<ChamberMeasurement>({ energy: 0, high: 0 });
    const [enabled, setEnabled] = useState(false);
    const [reduced, setReduced] = useState(false);
    const [status, setStatus] = useState('Visuals off');
    useEffect(() => {
        const preference = matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(preference.matches);
        update(); preference.addEventListener('change', update);
        return () => preference.removeEventListener('change', update);
    }, []);
    useEffect(() => {
        measurement.current = { energy: 0, high: 0 };
        if (!enabled || reduced || !active || !isPlaying) {
            setStatus(reduced ? 'Reduced motion · static atmosphere' : !enabled ? 'Visuals off' : active ? 'Paused · visuals still' : 'Choose a soundtrack song');
            return;
        }
        let cancelled = false, frame = 0;
        let tap: Awaited<ReturnType<typeof openResonanceAnalysis>> | undefined;
        const audio = getAudioElement();
        if (!audio) return;
        setStatus('Connecting audio analysis…');
        void openResonanceAnalysis(audio).then(connection => {
            if (cancelled) { connection.close(); return; }
            tap = connection;
            const spectrum = new Uint8Array(connection.analyser.frequencyBinCount);
            const wave = new Uint8Array(connection.analyser.fftSize);
            let last = 0, audible = false;
            const draw = (now: number) => {
                if (cancelled) return;
                frame = requestAnimationFrame(draw);
                if (now - last < 33 || document.hidden) return;
                last = now;
                connection.analyser.getByteFrequencyData(spectrum);
                connection.analyser.getByteTimeDomainData(wave);
                const energy = measuredEnergy(wave);
                measurement.current = { energy: Math.min(1, energy * 3), high: spectrum[48] / 255, bands: Array.from({length:7},(_,i)=>{
                    let sum=0;for(let bin=0;bin<8;bin++)sum+=spectrum[i*8+bin];return sum/(8*255);
                }) };
                const signal = energy > 0.0001;
                if (signal !== audible) { audible = signal; setStatus(signal ? 'Live spectrum · measured audio' : 'No measurable signal · silence or restricted capture'); }

            };
            setStatus('No measurable signal · silence or restricted capture');
            frame = requestAnimationFrame(draw);
        }).catch(error => { if (!cancelled) setStatus(analysisFailureMessage(error)); });
        return () => { cancelled = true; cancelAnimationFrame(frame); tap?.close(); measurement.current = { energy: 0, high: 0 }; };
    }, [enabled, reduced, active, isPlaying, currentTrack?.id, currentTrack?.trackUrl, getAudioElement, color]);


    const locked = !selected || !selected.trackUrl || isTrackLocked(selected);
    return <section className="realm-resonance resonance-v2" style={{ '--resonance': color } as React.CSSProperties} aria-label={`${realmName} resonance player`}>
        <div className="resonance-stage">
            <header className="resonance-heading"><small>OFFICIAL REALM SOUNDTRACK</small><p>{tracks.length} {tracks.length === 1 ? 'signal' : 'signals'}</p></header>
            <OrbitStage tracks={orbitTracks} selectedId={selected?.id} playingId={active && isPlaying ? currentTrack?.id : undefined}
                realmName={realmName} realmIcon={realmIcon} color={color} reduced={reduced} measurement={measurement}
                onChoose={choose} isTrackLocked={isTrackLocked} />
            <div className="resonance-selected">
                <small>{locked?'Listening unavailable':'SELECTED SIGNAL'}</small>
                <h3 title={selected?.trackTitle}>{selected?.trackTitle ?? 'No matching signals'}</h3><p>{selected?.artist ?? 'Independent creator'}</p>
                {selected?.releaseSlug&&<Link href={publicWorldHref(selected.releaseSlug,selected.releaseWorldId??undefined)}>Explore this World ↗</Link>}
            </div>
        </div>
        <div className="resonance-console">
            <div className="resonance-transport">
                <button aria-label="Previous song" disabled={queue.length<2} onClick={()=>step(-1)}>←</button>
                <button disabled={locked} onClick={()=>selected&&choose(selected)}>{active && isPlaying ? 'Pause' : active ? 'Resume' : 'Play signal'}</button>
                <button aria-label="Next song" disabled={queue.length<2} onClick={()=>step(1)}>→</button>
            </div>
            <label className="resonance-seek"><span className="sr-only">Seek in {selected?.trackTitle ?? 'selected song'}</span>
                <input aria-label={`Seek in ${selected?.trackTitle??'selected song'}`} type="range" min={0} max={Math.max(1, player.duration)} step={0.1} value={active ? Math.min(player.currentTime, player.duration || 0) : 0} disabled={!active || !player.duration} onChange={event => player.seekTo(Number(event.target.value))} />
                <span>{time(active ? player.currentTime : 0)} / {time(active ? player.duration : 0)}</span>
            </label>
            <div className="resonance-options"><button aria-pressed={enabled} disabled={reduced} onClick={() => setEnabled(value => !value)}>{enabled ? 'Turn live visuals off' : 'Enable live visuals'}</button><p role="status">{status}</p></div>
        </div>
        <nav className="resonance-song-path" aria-label="Ordered soundtrack songs">
            {tracks.map((track, index) => <button key={track.id} aria-pressed={selected?.id === track.id}
                title={track.trackTitle} disabled={!track.trackUrl || isTrackLocked(track)} onClick={() => choose(track)}>
                <span aria-hidden="true">{index + 1}</span> {track.trackTitle}
            </button>)}
        </nav>
        <details className="resonance-search"><summary>Search soundtrack / browse orbit pages</summary>
        <div className="resonance-library">
            <label>Find a signal <input type="search" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} placeholder="Song or creator" /></label>
            <nav aria-label="Soundtrack pages"><button disabled={safePage===0} onClick={()=>setPage(safePage-1)}>←</button><span>{safePage+1} / {pages}</span><button disabled={safePage>=pages-1} onClick={()=>setPage(safePage+1)}>→</button></nav>
            <div className="resonance-tracklist">{orbitTracks.map(track=><button key={track.id} aria-pressed={selected?.id===track.id} disabled={!track.trackUrl || isTrackLocked(track)} onClick={()=>choose(track)}><span>{track.trackTitle}</span><small>{track.artist}{isTrackLocked(track)?' · unavailable':''}</small></button>)}</div>
            {!orbitTracks.length&&<p>No songs match your search.</p>}
        </div></details>
    </section>;
}
