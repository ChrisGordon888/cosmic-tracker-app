'use client';

import Link from 'next/link';
import { useState } from 'react';
import WorldSurface from '@/components/world/WorldSurface';
import LowTideScene from '@/components/demo/LowTideScene';
import { demoWorld, demoProcess } from '@/lib/demo/lowTide';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import type { MusicTrack } from '@/context/MusicPlayerProvider';
import '@/styles/demoWorld.css';

const demoQueue: MusicTrack[] = demoWorld.tracks.map((track) => ({
  id: track.id, trackTitle: track.title, trackUrl: track.audioUrl, audioUrl: track.audioUrl,
  artist: 'COSMIC · fictional sound study', realmId: 0, realmName: 'Demo World',
  realmColor: '#d5c4a1', visibility: 'public', isPublic: true, playbackStatus: 'playable',
  source: 'demo',
}));

export default function DemoWorldPage() {
  const { currentTrack, currentTime, isPlaying, playOrToggleTrack, setQueue, pause } = useMusicPlayer();
  const [singleTrack, setSingleTrack] = useState(true);
  const tracks = singleTrack ? demoWorld.tracks.slice(0, 1) : demoWorld.tracks;

  function play(id: string) {
    const track = demoQueue.find((item) => item.id === id);
    if (track) void playOrToggleTrack(track, singleTrack ? demoQueue.slice(0, 1) : demoQueue, { source: 'release', label: 'Low Tide · demo sound studies' });
  }

  return <main className="demo-world-page">
    <div className="demo-world-banner"><span>Experiment 001 · fictional · read-only</span><a href="#world-seed-session">From song to world</a><Link href="/services">The creative session</Link><Link href="/nexus">Discover more →</Link></div>
    <WorldSurface title={demoWorld.title} summary={demoWorld.summary} coverArtUrl={demoWorld.coverArtUrl}
      label="Low Tide / An authored experiment" tracks={tracks} fragments={demoWorld.fragments}
      playingTrackId={currentTrack?.id ?? null} isPlaying={isPlaying} onPlay={play}
      renderArtwork={({ motionPaused, focusedTrackId }) => <LowTideScene currentTime={currentTime} playingTrackId={currentTrack?.id ?? null} isPlaying={isPlaying} motionPaused={motionPaused} focusedTrackId={focusedTrackId} />} />
    <section id="world-seed-session" className="demo-world-context" aria-labelledby="demo-seed-title">
      <div><p className="world-eyebrow">Song → direction → world</p><h2 id="demo-seed-title">First, find what the song wants to become.</h2>
        <p>Bring Christopher a beat, demo, hook, verse, voice memo or lyrics. Leave clearer on what to protect, deepen, cut and do next.</p>
        <p>When the song is ready, COSMIC can give its identity an initial expression beyond the music. If it needs more development, the song comes first.</p>
        <p className="demo-seed-boundary">Pilot session · ~$150. Additional production, engineering, mix/master and custom world development can be scoped separately.</p>
        <p className="demo-world-caption">Low Tide is one deeply authored fictional example, not a promised session deliverable or a template for every artist. A larger world could grow across an EP, album or visual era.</p>
        <Link className="demo-service-link" href="/services">Inside the creative-development session →</Link>
        <button type="button" aria-pressed={!singleTrack} onClick={() => {
          const nextSingle = !singleTrack;
          if (currentTrack?.source === 'demo') {
            if (nextSingle && currentTrack.id !== demoQueue[0].id) pause();
            setQueue(nextSingle ? demoQueue.slice(0, 1) : demoQueue, { source: 'release', label: 'Low Tide · demo sound studies' });
          }
          setSingleTrack(nextSingle);
        }}>{singleTrack ? 'Explore the two-track version' : 'Return to one song'}</button>
        <p className="demo-world-caption">Original 24-second synthesized sound studies, not artist recordings. Nothing here is added to your account. Reload to reset the view.</p>
      </div>
      <div className="demo-studio-study">
        <p className="world-eyebrow">From the Studio Board</p>
        <div className="demo-study-cards"><article><span>Sound</span><p>Keep the room tone.<br />Leave the hook unhurried.</p></article><article><span>Image</span><p>One window.<br />The light stays after the room is empty.</p></article></div>
        <p className="demo-world-caption">An example of optional visual thinking, translated into the artwork and fragments above.</p>
      </div>
    </section>
    <details className="demo-world-process"><summary>See how this world was built</summary>
      <p>Read-only fictional project · illustrative choices, no account data or live readiness status.</p>
      <div className="demo-process-assets">{demoWorld.tracks.map((track, index) => <figure key={track.id}>
        <img src={track.artworkUrl} alt={`${track.title} original artwork asset`} width="160" height="160" loading="lazy" />
        <figcaption><span>0{index + 1} / Track + canonical media</span><strong>{track.title}</strong><p>{track.hook}</p><small>Original SVG cover · 24-second WAV study</small></figcaption>
      </figure>)}</div>
      <div className="demo-process-grid">{demoProcess.map(step => <article key={step.title}><h3>{step.title}</h3><p>{step.detail}</p></article>)}</div>
      <p>The interactive room is authored for Low Tide. Your world starts with your music and your identity.</p>
    </details>
  </main>;
}
