'use client';

import { useEffect, useRef, useState } from 'react';

interface RealmBackgroundProps {
  videoSrc: string;
  realmName?: string;
  overlayOpacity?: number;
  motionControls?: boolean;
}

export default function RealmBackground({ 
  videoSrc, 
  realmName = 'Cosmic Realm',
  motionControls = false,
  overlayOpacity = 0.3 
}: RealmBackgroundProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    if (!motionControls) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const media = video.current;
    const sync = () => {
      setReduced(preference.matches);
      if (preference.matches || paused || document.hidden) media?.pause();
      else void media?.play().catch(() => {});
    };
    sync();
    preference.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      media?.pause();
      preference.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [motionControls, paused]);

  return (
    <>
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      <video
        ref={video}
        autoPlay={!motionControls}
        preload="auto"
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-label={`${realmName} background video`}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"
        style={{ opacity: overlayOpacity }}
      />
    </div>
    {motionControls && !reduced && <button type="button" className="public-atmosphere-control" style={{ position: 'relative', top: 'auto', right: 'auto', display: 'block', margin: '.5rem 1rem .5rem auto' }} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume atmosphere' : 'Pause atmosphere'}</button>}
    </>
  );
}
