'use client';

import { useMusicPlayer } from '@/hooks/useMusicPlayer';

function formatTime(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isExpanded,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleExpanded,
  } = useMusicPlayer();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const realmColor = currentTrack.realmColor || '#00D4FF';

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border backdrop-blur-xl shadow-2xl"
      style={{
        background: 'rgba(8, 10, 20, 0.9)',
        borderColor: `${realmColor}55`,
        boxShadow: `0 12px 40px ${realmColor}33`,
      }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayPause}
            className="w-12 h-12 rounded-full text-xl flex items-center justify-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${realmColor}, ${realmColor}cc)`,
            }}
          >
            {isPlaying ? '⏸' : '▶️'}
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: realmColor }}>
              {currentTrack.trackTitle}
            </p>
            <p className="text-xs text-white/70 truncate">
              {currentTrack.artist || 'Cosmic 888'} • {currentTrack.realmName}
            </p>
          </div>

          <button
            onClick={toggleExpanded}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            {isExpanded ? '▾' : '▴'}
          </button>
        </div>

        <div
          className="mt-3 h-2 rounded-full bg-white/10 cursor-pointer overflow-hidden"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = rect.width > 0 ? clickX / rect.width : 0;
            seekTo((duration || 0) * pct);
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${realmColor}, ${realmColor}cc)`,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[11px] text-white/60">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {isExpanded && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wide text-white/50 mb-1">
                Now Playing
              </p>
              <p className="text-sm text-white/90">
                Realm {currentTrack.realmId} • {currentTrack.realmName}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm">🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-white/60 w-10 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}