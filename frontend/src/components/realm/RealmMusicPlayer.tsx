'use client';

import { useRef, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOG_MUSIC_LISTEN, GET_ME } from '@/graphql/realms';

interface RealmMusicPlayerProps {
  trackUrl: string;
  trackTitle: string;
  artist?: string;
  realmName: string;
  realmColor?: string;
  realmId: number;
}

export default function RealmMusicPlayer({
  trackUrl,
  trackTitle,
  artist = 'Cosmic 888',
  realmName,
  realmColor = '#00D4FF',
  realmId
}: RealmMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  // ========================================
  // XP TRACKING WITH ANTI-EXPLOIT + PERSISTENCE
  // ========================================
  const [totalListenedTime, setTotalListenedTime] = useState(0);
  const [hasLoggedListen, setHasLoggedListen] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [isFirstListen, setIsFirstListen] = useState(true);
  const listeningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [logMusicListen] = useMutation(LOG_MUSIC_LISTEN);
  const { data: userData, refetch } = useQuery(GET_ME);

  // Check if user already listened to this track
  useEffect(() => {
    if (userData?.me?.musicStats?.tracksListened) {
      const existingTrack = userData.me.musicStats.tracksListened.find(
        (track: any) => track.realmId === realmId && track.trackTitle === trackTitle
      );

      if (existingTrack) {
        setIsFirstListen(false);
      } else {
        setIsFirstListen(true);
      }
    }
  }, [userData, realmId, trackTitle]);

  // Track actual listening time (1-second intervals)
  useEffect(() => {
    if (isPlaying && !xpAwarded) {
      listeningIntervalRef.current = setInterval(() => {
        setTotalListenedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (listeningIntervalRef.current) {
        clearInterval(listeningIntervalRef.current);
        listeningIntervalRef.current = null;
      }
    }

    return () => {
      if (listeningIntervalRef.current) {
        clearInterval(listeningIntervalRef.current);
      }
    };
  }, [isPlaying, xpAwarded]);

  // Award XP when 80% listened
  useEffect(() => {
    if (duration > 0 && !xpAwarded && !hasLoggedListen) {
      const requiredTime = duration * 0.8;

      if (totalListenedTime >= requiredTime) {
        logMusicListen({
          variables: {
            realmId,
            trackTitle,
            duration: Math.floor(duration),
          },
        })
          .then((response) => {
            alert(response.data.logMusicListen.message);
            setXpAwarded(true);
            setHasLoggedListen(true);
            refetch();
          })
          .catch((err) => console.error('Music listen logging failed:', err));
      }
    }
  }, [totalListenedTime, duration, xpAwarded, hasLoggedListen, realmId, trackTitle, logMusicListen, isFirstListen, refetch]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    const handleEnded = () => {
      setIsPlaying(false);
      audio.pause();
      audio.currentTime = 0;
      if (listeningIntervalRef.current) {
        clearInterval(listeningIntervalRef.current);
        listeningIntervalRef.current = null;
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // ========================================
  // PLAYBACK CONTROLS
  // ========================================
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    audio.currentTime = percentage * duration;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const listenProgress = duration > 0 ? Math.min((totalListenedTime / (duration * 0.8)) * 100, 100) : 0;

  return (
    <div className="glass-card p-6">
      <audio ref={audioRef} src={trackUrl} />

      {/* Header with Track Info */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${realmColor}33, ${realmColor}66)`,
            boxShadow: `0 4px 20px ${realmColor}44`
          }}
        >
          🎵
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-display mb-1" style={{ color: realmColor }}>
            {trackTitle}
          </h3>
          <p className="text-secondary text-sm">
            {artist} • {realmName}
          </p>
        </div>
      </div>

      {/* Play/Pause Button (Large & Centered) */}
      <div className="flex justify-center mb-6">
        <button
          onClick={togglePlayPause}
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all hover:scale-110 active:scale-95 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${realmColor}, ${realmColor}dd)`,
            boxShadow: `0 8px 32px ${realmColor}66`,
          }}
        >
          {isPlaying ? '⏸' : '▶️'}
        </button>
      </div>

      {/* Progress Bar (Interactive) */}
      <div
        className="h-3 bg-black/40 rounded-full mb-3 cursor-pointer overflow-hidden relative group"
        onClick={handleProgressClick}
      >
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${realmColor}, ${realmColor}cc)`,
            boxShadow: `0 0 10px ${realmColor}88`
          }}
        />
        {/* Hover effect */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-sm text-muted mb-6">
        <span className="font-mono">{formatTime(currentTime)}</span>
        <span className="font-mono">{formatTime(duration)}</span>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-black/40 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${realmColor} 0%, ${realmColor} ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <span className="text-sm text-muted font-mono w-10 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* XP Progress & Message */}
      <div 
        className="mt-4 p-4 rounded-lg border transition-all"
        style={{
          background: 'rgba(0,0,0,0.3)',
          borderColor: `${realmColor}33`,
          boxShadow: xpAwarded ? `0 0 20px ${realmColor}44` : 'none'
        }}
      >
        {!xpAwarded ? (
          <>
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span>Listen Progress</span>
              <span style={{ color: realmColor }}>
                {Math.floor(listenProgress)}% / 80%
              </span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${listenProgress}%`,
                  background: `linear-gradient(90deg, ${realmColor}, ${realmColor}aa)`,
                  boxShadow: listenProgress > 50 ? `0 0 10px ${realmColor}` : 'none'
                }}
              />
            </div>
            <p className="text-xs text-center text-muted">
              ✨ Listen to 80% to earn{' '}
              <span style={{ color: realmColor, fontWeight: 'bold' }}>
                {isFirstListen ? '+50 XP' : '+30 XP'}
              </span>
              {' '}• {isFirstListen ? 'First listen bonus!' : 'Replay reward'}
            </p>
          </>
        ) : (
          <div className="text-center">
            <p className="text-lg font-display mb-1" style={{ color: realmColor }}>
              ✅ XP Earned!
            </p>
            <p className="text-xs text-muted">
              Replay anytime for +30 XP
            </p>
          </div>
        )}
      </div>
    </div>
  );
}