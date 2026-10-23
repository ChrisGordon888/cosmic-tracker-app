'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { openResonanceAnalysis, measuredEnergy } from '@/lib/resonanceAnalysis';
import './realmResonance.css';

const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

/** One Realm's visual stage, always following the shared player's selected song. */
export default function RealmResonance({ children, trackIds, color, realmName }: {
    children: ReactNode; trackIds: string[]; color: string; realmName: string;
}) {
    const player = useMusicPlayer();
    const { getAudioElement, isPlaying, currentTrack } = player;
    const active = Boolean(player.currentTrack && trackIds.includes(player.currentTrack.id));
    const [enabled, setEnabled] = useState(false);
    const [reduced, setReduced] = useState(false);
    const [status, setStatus] = useState('Visuals off');
    const canvas = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const preference = matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(preference.matches);
        update(); preference.addEventListener('change', update);
        return () => preference.removeEventListener('change', update);
    }, []);
    useEffect(() => {
        const surface = canvas.current;
        const paint = surface?.getContext('2d');
        if (!surface || !paint) return;
        paint.clearRect(0, 0, surface.width, surface.height);
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
                const signal = energy > 0.0001;
                if (signal !== audible) { audible = signal; setStatus(signal ? 'Live spectrum · measured audio' : 'No measurable signal · silence or restricted capture'); }
                paint.clearRect(0, 0, 800, 600);
                paint.strokeStyle = color; paint.fillStyle = color;
                paint.globalAlpha = 0.2 + Math.min(energy, 0.5);
                for (let ring = 0; ring < 3; ring++) {
                    paint.beginPath(); paint.ellipse(400, 300, 160 + ring * 35 + energy * 35, 190 + ring * 28, -0.35, 0, Math.PI * 2); paint.stroke();
                }
                for (let i = 0; i < 64; i++) {
                    const level = spectrum[i * 2] / 255;
                    const angle = i / 64 * Math.PI * 2;
                    const x = 400 + Math.cos(angle) * 245, y = 300 + Math.sin(angle) * 245;
                    paint.globalAlpha = 0.15 + level * 0.7;
                    paint.beginPath(); paint.moveTo(x, y);
                    paint.lineTo(x + Math.cos(angle) * level * 45, y + Math.sin(angle) * level * 45); paint.stroke();
                    if (level > 0.25) { paint.beginPath(); paint.arc(x, y, 1 + level * 2, 0, Math.PI * 2); paint.fill(); }
                }
                paint.globalAlpha = 0.65;
                paint.beginPath();
                wave.forEach((sample, i) => {
                    const x = 40 + i / (wave.length - 1) * 720, y = 300 + (sample - 128) * 0.8;
                    if (i === 0) paint.moveTo(x, y); else paint.lineTo(x, y);
                });
                paint.stroke();
            };
            setStatus('No measurable signal · silence or restricted capture');
            frame = requestAnimationFrame(draw);
        }).catch(() => { if (!cancelled) setStatus('Live analysis unavailable in this browser or for this media. Playback is unchanged.'); });
        return () => { cancelled = true; cancelAnimationFrame(frame); tap?.close(); paint.clearRect(0, 0, 800, 600); };
    }, [enabled, reduced, active, isPlaying, currentTrack?.id, currentTrack?.trackUrl, getAudioElement, color]);

    const track = active ? player.currentTrack : null;
    return <section className="realm-resonance" style={{ '--resonance': color } as React.CSSProperties} aria-label={`${realmName} resonance player`}>
        <div className="resonance-stage">
            <canvas ref={canvas} width={800} height={600} aria-hidden="true" />
            <div className="resonance-orbit">{children}</div>
        </div>
        <div className="resonance-console">
            <div className="resonance-identity">
                {track?.artworkUrl && <img src={track.artworkUrl} alt="" width={52} height={52} />}
                <div><small>REALM RESONANCE</small><h3>{track?.trackTitle ?? 'Choose a song in the orbit'}</h3><p>{track?.artist ?? 'Official soundtrack · shared listening'}</p></div>
            </div>
            <div className="resonance-transport">
                <button aria-label="Previous song" disabled={!track || !player.hasPreviousTrack} onClick={() => void player.playPrevious()}>←</button>
                <button disabled={!track} onClick={() => void player.togglePlayPause()}>{active && player.isPlaying ? 'Pause' : 'Resume'}</button>
                <button aria-label="Next song" disabled={!track || !player.hasNextTrack} onClick={() => void player.playNext()}>→</button>
            </div>
            <label className="resonance-seek">Seek in {track?.trackTitle ?? 'selected song'}
                <input type="range" min={0} max={Math.max(1, player.duration)} step={0.1} value={active ? Math.min(player.currentTime, player.duration || 0) : 0} disabled={!track || !player.duration} onChange={event => player.seekTo(Number(event.target.value))} />
                <span>{time(active ? player.currentTime : 0)} / {time(active ? player.duration : 0)}</span>
            </label>
            <div className="resonance-options"><button aria-pressed={enabled} disabled={reduced} onClick={() => setEnabled(value => !value)}>{enabled ? 'Turn live visuals off' : 'Enable live visuals'}</button><p role="status">{status}</p></div>
        </div>
    </section>;
}
