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
  realmId,
}: RealmMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // UI playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  // XP tracking (session-local)
  const [totalListenedTime, setTotalListenedTime] = useState(0); // seconds listened this session
  const [hasLoggedListen, setHasLoggedListen] = useState(false); // prevents duplicate mutation this session
  const [xpAwarded, setXpAwarded] = useState(false); // UI state: earned during this session

  const listeningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Always get the truth from backend (helps hard refresh)
  const { data: userData, loading: meLoading, refetch } = useQuery(GET_ME, {
    fetchPolicy: 'network-only',
  });

  const [logMusicListen] = useMutation(LOG_MUSIC_LISTEN, {
    refetchQueries: [{ query: GET_ME }],
  });

  // ----------------------------------------
  // Backend-derived truth: have they EVER listened?
  // (This fixes "refresh shows first time again")
  // ----------------------------------------
  const tracks = userData?.me?.musicStats?.tracksListened || [];
  const existingTrack = tracks.find(
    (t: any) => Number(t.realmId) === Number(realmId) && t.trackTitle === trackTitle
  );
  const hasEverListened = !!existingTrack;

  const rewardLabel = hasEverListened ? '+30 XP' : '+50 XP';

  // ----------------------------------------
  // Helpers
  // ----------------------------------------
  const requiredTime = duration * 0.8; // seconds needed to earn XP (80%)
  const safeRequiredTime = Math.max(requiredTime, 1);

  // Progress toward reward (0–100 means “0–100% of the 80% requirement”)
  const progressToReward =
    duration > 0 ? Math.min((totalListenedTime / safeRequiredTime) * 100, 100) : 0;

  // Actual percent-of-track listened (0–100 of the whole track)
  const listenedPercentOfTrack =
    duration > 0 ? Math.min((totalListenedTime / duration) * 100, 100) : 0;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // ----------------------------------------
  // Reset session state when track changes
  // ----------------------------------------
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setTotalListenedTime(0);
    setHasLoggedListen(false);
    setXpAwarded(false);

    if (listeningIntervalRef.current) {
      clearInterval(listeningIntervalRef.current);
      listeningIntervalRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [trackUrl, trackTitle, realmId]);

  // ----------------------------------------
  // Track listening time (1-second ticks)
  // Only counts while playing and until we log XP this session
  // ----------------------------------------
  useEffect(() => {
    if (isPlaying && !hasLoggedListen) {
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
        listeningIntervalRef.current = null;
      }
    };
  }, [isPlaying, hasLoggedListen]);

  // ----------------------------------------
  // Award XP once threshold hit (80%)
  // ----------------------------------------
  useEffect(() => {
    if (duration <= 0) return;
    if (hasLoggedListen) return;
    if (totalListenedTime < requiredTime) return;

    // mark immediately to prevent double-fire
    setHasLoggedListen(true);

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
        refetch();
      })
      .catch((err) => {
        console.error('Music listen logging failed:', err);
        // allow retry if mutation failed
        setHasLoggedListen(false);
      });
  }, [totalListenedTime, requiredTime, duration, hasLoggedListen, logMusicListen, realmId, trackTitle, refetch]);

  // ----------------------------------------
  // Audio event listeners
  // ----------------------------------------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

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
  }, [volume]);

  // ----------------------------------------
  // Playback controls
  // ----------------------------------------
  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error('Audio play failed:', e);
      setIsPlaying(false);
    }
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
    if (!audio || duration <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    audio.currentTime = percentage * duration;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass-card p-6">
      <audio ref={audioRef} src={trackUrl} />

      {/* Header with Track Info */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${realmColor}33, ${realmColor}66)`,
            boxShadow: `0 4px 20px ${realmColor}44`,
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

      {/* Play/Pause Button */}
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

      {/* Progress Bar */}
      <div
        className="h-3 bg-black/40 rounded-full mb-3 cursor-pointer overflow-hidden relative group"
        onClick={handleProgressClick}
      >
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${realmColor}, ${realmColor}cc)`,
            boxShadow: `0 0 10px ${realmColor}88`,
          }}
        />
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
            background: `linear-gradient(to right, ${realmColor} 0%, ${realmColor} ${
              volume * 100
            }%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`,
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
          boxShadow: xpAwarded ? `0 0 20px ${realmColor}44` : 'none',
        }}
      >
        {!xpAwarded ? (
          <>
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span>Progress to Reward</span>
              <span style={{ color: realmColor }}>
                {Math.floor(progressToReward)}%
              </span>
            </div>

            <div className="h-2 bg-black/40 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressToReward}%`,
                  background: `linear-gradient(90deg, ${realmColor}, ${realmColor}aa)`,
                  boxShadow: progressToReward > 50 ? `0 0 10px ${realmColor}` : 'none',
                }}
              />
            </div>

            <p className="text-xs text-center text-muted">
              ✨ Earn XP after listening to{' '}
              <span style={{ color: realmColor, fontWeight: 'bold' }}>80%</span> of the track •
              You’ve listened to{' '}
              <span style={{ color: realmColor, fontWeight: 'bold' }}>
                {Math.floor(listenedPercentOfTrack)}%
              </span>
              {' '}so far • Reward:{' '}
              {meLoading ? (
                <span className="text-muted">Syncing…</span>
              ) : (
                <span style={{ color: realmColor, fontWeight: 'bold' }}>
                  {rewardLabel}
                </span>
              )}
              {' '}• {hasEverListened ? 'Replay reward' : 'First listen bonus!'}
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