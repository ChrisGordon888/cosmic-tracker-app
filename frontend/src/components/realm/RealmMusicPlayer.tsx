'use client';

import { useState, useRef, useEffect } from 'react';

interface RealmMusicPlayerProps {
  trackUrl: string;
  trackTitle: string;
  artist?: string;
  realmName: string;
  realmColor?: string;
}

/**
 * 🎵 Realm Music Player
 * Integrated music player for each realm
 */
export default function RealmMusicPlayer({ 
  trackUrl, 
  trackTitle, 
  artist = "Cosmic 888",
  realmName,
  realmColor = "#00D4FF"
}: RealmMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="realm-music-player glass-card p-6 fade-in" style={{ animationDelay: '0.7s' }}>
      <audio ref={audioRef} src={trackUrl} />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl animate-pulse">{isPlaying ? '🎵' : '🎧'}</div>
        <div className="flex-1">
          <h3 className="text-xl font-display mb-1" style={{ color: realmColor }}>
            {trackTitle}
          </h3>
          <p className="text-sm text-secondary">
            {artist} • {realmName}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${realmColor} 0%, ${realmColor} ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-12 h-12 rounded-full transition-all"
          style={{
            background: isPlaying 
              ? `linear-gradient(135deg, ${realmColor}, #9D4EDD)`
              : 'rgba(255,255,255,0.1)',
            boxShadow: isPlaying ? `0 0 20px ${realmColor}40` : 'none'
          }}
        >
          <span className="text-2xl">{isPlaying ? '⏸️' : '▶️'}</span>
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${realmColor} 0%, ${realmColor} ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>
      </div>

      {/* Unlock Message */}
      <div className="mt-4 p-3 rounded-lg bg-black/30 border border-white/10">
        <p className="text-xs text-secondary text-center">
          ✨ Listening grants +10 XP • Unlocks realm lore
        </p>
      </div>
    </div>
  );
}