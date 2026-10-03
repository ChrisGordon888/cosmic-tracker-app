'use client';

import { useEffect, useRef, useState } from 'react';

/** Decorative, silent media only. Never connects to the music player. */
export default function PublicAtmosphere({ source, poster, tone = 'home' }: {
  source: string; poster?: string; tone?: 'home' | 'nexus' | 'services';
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const reveal = () => { if (!document.hidden) setHasBeenVisible(true); };
    reveal();
    document.addEventListener('visibilitychange', reveal);
    return () => document.removeEventListener('visibilitychange', reveal);
  }, []);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const media = video.current;
    if (!media) return;
    let active = true;
    const sync = () => {
      if (!active || paused || reduced || unavailable || document.hidden) {
        media.pause();
      } else {
        void media.play().then(() => {
          if (!active || document.hidden) media.pause();
        }).catch(() => { if (active) setUnavailable(true); });
      }
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { active = false; media.pause(); document.removeEventListener('visibilitychange', sync); };
  }, [paused, reduced, unavailable, hasBeenVisible]);

  return <>
    <div className={`public-atmosphere atmosphere-${tone}${poster ? ' has-artwork' : ''}`} style={poster ? { backgroundImage: `url("${poster}")` } : undefined} aria-hidden="true">
      {hasBeenVisible && !reduced && !unavailable && <video ref={video} src={source} poster={poster} muted loop playsInline preload="metadata" onError={() => setUnavailable(true)} />}
      <div className="public-atmosphere-shade" />
    </div>
    {hasBeenVisible && !reduced && !unavailable && <button type="button" className="public-atmosphere-control" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume atmosphere' : 'Pause atmosphere'}</button>}
  </>;
}
