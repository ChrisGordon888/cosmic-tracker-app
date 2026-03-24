'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOG_MUSIC_LISTEN, GET_ME } from '@/graphql/realms';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';

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
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playTrack,
    togglePlayPause,
    setExpanded,
  } = useMusicPlayer();

  const [totalListenedTime, setTotalListenedTime] = useState(0);
  const [hasLoggedListen, setHasLoggedListen] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const listeningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: userData, loading: meLoading, refetch } = useQuery(GET_ME, {
    fetchPolicy: 'network-only',
  });

  const [logMusicListen] = useMutation(LOG_MUSIC_LISTEN, {
    refetchQueries: [{ query: GET_ME }],
  });

  const tracks = userData?.me?.musicStats?.tracksListened || [];
  const existingTrack = tracks.find(
    (t: any) => Number(t.realmId) === Number(realmId) && t.trackTitle === trackTitle
  );
  const hasEverListened = !!existingTrack;
  const rewardLabel = hasEverListened ? '+30 XP' : '+50 XP';

  const isCurrentTrack = currentTrack?.id === `realm-${realmId}-${trackTitle}`;
  const activeDuration = isCurrentTrack ? duration : 0;
  const activeCurrentTime = isCurrentTrack ? currentTime : 0;

  const requiredTime = activeDuration * 0.8;
  const safeRequiredTime = Math.max(requiredTime, 1);

  const progressToReward =
    activeDuration > 0 ? Math.min((totalListenedTime / safeRequiredTime) * 100, 100) : 0;

  const listenedPercentOfTrack =
    activeDuration > 0 ? Math.min((totalListenedTime / activeDuration) * 100, 100) : 0;

  useEffect(() => {
    setTotalListenedTime(0);
    setHasLoggedListen(false);
    setXpAwarded(false);

    if (listeningIntervalRef.current) {
      clearInterval(listeningIntervalRef.current);
      listeningIntervalRef.current = null;
    }
  }, [trackUrl, trackTitle, realmId]);

  useEffect(() => {
    if (isCurrentTrack && isPlaying && !hasLoggedListen) {
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
  }, [isCurrentTrack, isPlaying, hasLoggedListen]);

  useEffect(() => {
    if (activeDuration <= 0) return;
    if (hasLoggedListen) return;
    if (totalListenedTime < requiredTime) return;

    setHasLoggedListen(true);

    logMusicListen({
      variables: {
        realmId,
        trackTitle,
        duration: Math.floor(activeDuration),
      },
    })
      .then((response) => {
        alert(response.data.logMusicListen.message);
        setXpAwarded(true);
        refetch();
      })
      .catch((err) => {
        console.error('Music listen logging failed:', err);
        setHasLoggedListen(false);
      });
  }, [
    totalListenedTime,
    requiredTime,
    activeDuration,
    hasLoggedListen,
    logMusicListen,
    realmId,
    trackTitle,
    refetch,
  ]);

  const handlePrimaryAction = async () => {
    if (isCurrentTrack) {
      await togglePlayPause();
      setExpanded(true);
      return;
    }

    await playTrack({
      id: `realm-${realmId}-${trackTitle}`,
      trackUrl,
      trackTitle,
      artist,
      realmName,
      realmColor,
      realmId,
    });
    setExpanded(true);
  };

  const progress =
    activeDuration > 0 ? (activeCurrentTime / activeDuration) * 100 : 0;

  const actionLabel = isCurrentTrack ? (isPlaying ? 'Pause' : 'Resume') : 'Play in Global Player';

  return (
    <div className="glass-card p-6">
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

      <div className="flex justify-center mb-4">
        <button
          onClick={handlePrimaryAction}
          className="w-full rounded-xl px-5 py-4 text-lg font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: `linear-gradient(135deg, ${realmColor}, ${realmColor}dd)`,
            boxShadow: `0 8px 32px ${realmColor}44`,
          }}
        >
          {isCurrentTrack && isPlaying ? '⏸ Pause' : '▶️ ' + actionLabel}
        </button>
      </div>

      <div className="h-3 bg-black/40 rounded-full mb-3 overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${realmColor}, ${realmColor}cc)`,
          }}
        />
      </div>

      <div className="flex justify-between text-sm text-muted mb-6">
        <span className="font-mono">
          {Math.floor(activeCurrentTime / 60)}:{Math.floor(activeCurrentTime % 60)
            .toString()
            .padStart(2, '0')}
        </span>
        <span className="font-mono">
          {Math.floor(activeDuration / 60)}:{Math.floor(activeDuration % 60)
            .toString()
            .padStart(2, '0')}
        </span>
      </div>

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
                }}
              />
            </div>

            <p className="text-xs text-center text-muted">
              ✨ Earn XP after listening to{' '}
              <span style={{ color: realmColor, fontWeight: 'bold' }}>80%</span> of the track •
              You’ve listened to{' '}
              <span style={{ color: realmColor, fontWeight: 'bold' }}>
                {Math.floor(listenedPercentOfTrack)}%
              </span>{' '}
              so far • Reward:{' '}
              {meLoading ? (
                <span className="text-muted">Syncing…</span>
              ) : (
                <span style={{ color: realmColor, fontWeight: 'bold' }}>
                  {rewardLabel}
                </span>
              )}{' '}
              • {hasEverListened ? 'Replay reward' : 'First listen bonus!'}
            </p>
          </>
        ) : (
          <div className="text-center">
            <p className="text-lg font-display mb-1" style={{ color: realmColor }}>
              ✅ XP Earned!
            </p>
            <p className="text-xs text-muted">Replay anytime for +30 XP</p>
          </div>
        )}
      </div>
    </div>
  );
}