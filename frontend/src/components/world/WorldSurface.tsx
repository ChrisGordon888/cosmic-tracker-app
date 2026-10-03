'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { focusedWorldTrack, fragmentsForTrack, type WorldTrack, type WorldFragmentData } from '@/lib/worldExperience';
import WorldFragment from './WorldFragment';
import '@/styles/worldSurface.css';

export default function WorldSurface({ title, summary, coverArtUrl, tracks, fragments, playingTrackId, isPlaying, onPlay, navigation, renderArtwork, label = 'Release World' }: {
  title: string;
  summary?: string | null;
  coverArtUrl?: string | null;
  tracks: WorldTrack[];
  fragments: WorldFragmentData[];
  playingTrackId: string | null;
  isPlaying: boolean;
  onPlay: (id: string) => void;
  navigation?: ReactNode;
  label?: string;
  renderArtwork?: (state: { motionPaused: boolean; focusedTrackId: string | null }) => ReactNode;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [motionPaused, setMotionPaused] = useState(false);
  const [failedArtwork, setFailedArtwork] = useState<string | null>(null);
  const playingTrack = tracks.find((track) => track.id === playingTrackId);
  const activeId = playingTrack?.id ?? null;
  const awake = Boolean(activeId && isPlaying);
  const focused = focusedWorldTrack(tracks, selectedId);
  const context = fragmentsForTrack(fragments, focused?.slug);
  const image = focused?.artworkUrl?.trim() || coverArtUrl?.trim();
  const sectionId = useId();

  useEffect(() => {
    // Follow real playback changes, including queue navigation. Manual exploration stays
    // independent until another track starts or playback resumes.
    if (isPlaying && activeId) setSelectedId(activeId);
  }, [activeId, isPlaying]);

  return <section className={`world-surface${awake ? ' is-awake' : ''}${motionPaused ? ' is-still' : ''}`} aria-labelledby={sectionId}>
    <header className="world-heading">
      <div><p className="world-eyebrow">{label}</p><h1 id={sectionId}>{title}</h1>
        {summary?.trim() && <p className="world-summary">{summary}</p>}
      </div>
      {navigation && <nav className="world-navigation" aria-label="Release navigation">{navigation}</nav>}
    </header>

    <div className="world-scene">
      <div className="world-contours" aria-hidden="true"><i /><i /><i /></div>
      <div className="world-art-position">
        {renderArtwork ? renderArtwork({ motionPaused, focusedTrackId: focused?.id ?? null }) : <>
        <figure className="world-art" key={focused?.id ?? 'cover'}>
          {image && image !== failedArtwork ? <img src={image} alt={`${focused?.title || title} artwork`} onError={() => setFailedArtwork(image)} />
            : <div className="world-art-empty"><span aria-hidden="true">◒</span><strong>{title}</strong></div>}
          <figcaption><span>{focused ? `${String(tracks.indexOf(focused) + 1).padStart(2, '0')} / ${String(tracks.length).padStart(2, '0')}` : 'World Seed'}</span>
            <span>{focused?.title || 'A space taking shape'}</span></figcaption>
        </figure>
        <div className="world-art-shadow" aria-hidden="true" />
        </>}
      </div>
      <div className="world-destination" key={`context-${focused?.id ?? 'release'}`}>
        <p className="world-eyebrow">{focused ? 'Inside this song' : 'Inside this world'}</p>
        <h2>{focused?.title || title}</h2>
        {focused?.mood && <p className="world-mood">{focused.mood}</p>}
        {focused?.hook && <blockquote>{focused.hook}</blockquote>}
        {focused && <button type="button" className="world-listen" disabled={!focused.playable} onClick={() => onPlay(focused.id)}>
          <span aria-hidden="true">{awake && activeId === focused.id ? 'Ⅱ' : '▶'}</span>
          {awake && activeId === focused.id ? 'Pause' : focused.actionLabel}
        </button>}
        {!focused && <p className="world-quiet">This world is still quiet. Music will appear here when it is available.</p>}
        <div className="world-fragments" aria-label="Fragments at this destination">
          {context.slice(0, 3).map((fragment) => <WorldFragment key={fragment.id} fragment={fragment} />)}
        </div>
      </div>
    </div>

    <footer className="world-journey">
      {tracks.length > 1 && <nav className="world-stops" aria-label="Explore songs without changing playback">
        {tracks.map((track, index) => <button key={track.id} type="button" aria-pressed={focused?.id === track.id} onClick={() => setSelectedId(track.id)}>
          <span>{String(index + 1).padStart(2, '0')}</span>{track.title}
          {awake && activeId === track.id && <i aria-label="Playing" className="world-playing-mark" />}
        </button>)}
      </nav>}
      <div className="world-listening-state">
        <p role="status">{awake ? `Playing · ${playingTrack?.title}` : playingTrack ? `Paused · ${playingTrack.title}` : 'Press play to wake this world.'}
          {awake && focused?.id !== activeId && <span>Viewing · {focused?.title}</span>}</p>
        <div>
          {awake && focused?.id !== activeId && <button type="button" onClick={() => setSelectedId(activeId)}>Return to playing song</button>}
          <button type="button" aria-pressed={motionPaused} onClick={() => setMotionPaused(!motionPaused)}>{motionPaused ? 'Allow motion' : 'Pause motion'}</button>
        </div>
      </div>
    </footer>
  </section>;
}
