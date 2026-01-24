'use client';

interface RealmBackgroundProps {
  videoSrc: string;
  realmName?: string;
  overlayOpacity?: number;
}

export default function RealmBackground({ 
  videoSrc, 
  realmName = 'Cosmic Realm',
  overlayOpacity = 0.3 
}: RealmBackgroundProps) {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      <video
        autoPlay
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
  );
}