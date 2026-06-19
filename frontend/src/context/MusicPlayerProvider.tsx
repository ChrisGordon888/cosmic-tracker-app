'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation } from '@apollo/client';
import { LOG_MUSIC_LISTEN } from '@/graphql/realms';
import { MUSIC_REGISTRY } from '@/lib/musicRegistry';

export interface MusicTrack {
  id: string;
  trackUrl: string;
  trackTitle: string;
  artist?: string;
  realmName: string;
  realmColor?: string;
  realmId: number;
  visibility?: string;
  sortOrder?: number;
}

interface MusicPlayerContextValue {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isExpanded: boolean;

  queue: MusicTrack[];
  queueLength: number;
  isShuffleEnabled: boolean;
  isContinuousEnabled: boolean;
  hasNextTrack: boolean;
  hasPreviousTrack: boolean;

  playTrack: (track: MusicTrack, queueOverride?: MusicTrack[]) => Promise<void>;
  playOrToggleTrack: (track: MusicTrack, queueOverride?: MusicTrack[]) => Promise<void>;
  playQueue: (tracks: MusicTrack[], startTrackId?: string) => Promise<void>;
  setQueue: (tracks: MusicTrack[]) => void;
  clearQueue: () => void;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  toggleShuffle: () => void;
  toggleContinuous: () => void;

  togglePlayPause: () => Promise<void>;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

function toMusicTrack(track: any): MusicTrack | null {
  if (!track?.id || !track?.trackUrl || !track?.trackTitle) return null;

  return {
    id: track.id,
    trackUrl: track.trackUrl,
    trackTitle: track.trackTitle,
    artist: track.artist,
    realmName: track.realmName,
    realmColor: track.realmColor,
    realmId: track.realmId,
    visibility: track.visibility,
    sortOrder: track.sortOrder,
  };
}

function dedupeTracks(tracks: MusicTrack[]) {
  const seen = new Set<string>();

  return tracks.filter((track) => {
    if (!track?.id || !track.trackUrl || seen.has(track.id)) return false;

    seen.add(track.id);
    return true;
  });
}

function getPlayableCatalogQueue() {
  return dedupeTracks(
    MUSIC_REGISTRY
      .map(toMusicTrack)
      .filter((track): track is MusicTrack => Boolean(track))
      .filter((track) => track.visibility !== 'premium')
      .sort((a, b) => {
        const aOrder = a.sortOrder ?? 999;
        const bOrder = b.sortOrder ?? 999;

        if (aOrder !== bOrder) return aOrder - bOrder;

        return a.trackTitle.localeCompare(b.trackTitle);
      })
  );
}

function getSequentialNextTrack(queue: MusicTrack[], currentTrackId?: string | null) {
  if (queue.length === 0) return null;
  if (queue.length === 1) return queue[0];

  const currentIndex = queue.findIndex((track) => track.id === currentTrackId);

  if (currentIndex === -1) return queue[0];

  return queue[(currentIndex + 1) % queue.length];
}

function getSequentialPreviousTrack(queue: MusicTrack[], currentTrackId?: string | null) {
  if (queue.length === 0) return null;
  if (queue.length === 1) return queue[0];

  const currentIndex = queue.findIndex((track) => track.id === currentTrackId);

  if (currentIndex === -1) return queue[0];

  return queue[(currentIndex - 1 + queue.length) % queue.length];
}

function getShuffleTrack(
  queue: MusicTrack[],
  currentTrackId?: string | null,
  recentlyPlayedIds: string[] = []
) {
  if (queue.length === 0) return null;
  if (queue.length === 1) return queue[0];

  const recentSet = new Set(recentlyPlayedIds);

  const freshCandidates = queue.filter(
    (track) => track.id !== currentTrackId && !recentSet.has(track.id)
  );

  const candidates =
    freshCandidates.length > 0
      ? freshCandidates
      : queue.filter((track) => track.id !== currentTrackId);

  if (candidates.length === 0) return queue[0];

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

export function MusicPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumeState, setVolumeState] = useState(0.7);
  const [isExpanded, setIsExpanded] = useState(false);

  const [queue, setQueueState] = useState<MusicTrack[]>([]);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [isContinuousEnabled, setIsContinuousEnabled] = useState(true);

  const currentTrackRef = useRef<MusicTrack | null>(null);
  const queueRef = useRef<MusicTrack[]>([]);
  const recentlyPlayedIdsRef = useRef<string[]>([]);
  const isShuffleEnabledRef = useRef(false);
  const isContinuousEnabledRef = useRef(true);
  const handleTrackEndedRef = useRef<(() => void) | null>(null);

  const [logMusicListen] = useMutation(LOG_MUSIC_LISTEN);

  // Prevent duplicate listen logs for the same track during a single page session.
  const loggedListenIdsRef = useRef<Set<string>>(new Set());

  const catalogQueue = useMemo(() => getPlayableCatalogQueue(), []);

  const activeQueue = queue.length > 0 ? queue : catalogQueue;
  const queueLength = activeQueue.length;
  const hasNextTrack = queueLength > 1 || Boolean(currentTrack && queueLength === 1);
  const hasPreviousTrack = hasNextTrack;

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    isShuffleEnabledRef.current = isShuffleEnabled;
  }, [isShuffleEnabled]);

  useEffect(() => {
    isContinuousEnabledRef.current = isContinuousEnabled;
  }, [isContinuousEnabled]);

  const markRecentlyPlayed = useCallback((trackId: string) => {
    const nextRecent = [
      trackId,
      ...recentlyPlayedIdsRef.current.filter((id) => id !== trackId),
    ].slice(0, 8);

    recentlyPlayedIdsRef.current = nextRecent;
  }, []);

  const getActiveQueue = useCallback(() => {
    return queueRef.current.length > 0 ? queueRef.current : catalogQueue;
  }, [catalogQueue]);

  const startTrack = useCallback(
    async (track: MusicTrack) => {
      const audio = audioRef.current;
      if (!audio || !track?.trackUrl) return;

      const isSameTrack = currentTrackRef.current?.id === track.id;

      try {
        if (!isSameTrack) {
          audio.pause();
          audio.src = track.trackUrl;
          audio.currentTime = 0;
          setCurrentTime(0);
          setDuration(0);
          setCurrentTrack(track);
          currentTrackRef.current = track;
        }

        markRecentlyPlayed(track.id);

        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to play track:', error);
        setIsPlaying(false);
      }
    },
    [markRecentlyPlayed]
  );

  const setQueue = useCallback((tracks: MusicTrack[]) => {
    setQueueState(dedupeTracks(tracks));
  }, []);

  const clearQueue = useCallback(() => {
    setQueueState([]);
  }, []);

  const playTrack = useCallback(
    async (track: MusicTrack, queueOverride?: MusicTrack[]) => {
      if (queueOverride && queueOverride.length > 0) {
        setQueueState(dedupeTracks(queueOverride));
      }

      await startTrack(track);
    },
    [startTrack]
  );

  const playQueue = useCallback(
    async (tracks: MusicTrack[], startTrackId?: string) => {
      const nextQueue = dedupeTracks(tracks);
      if (nextQueue.length === 0) return;

      setQueueState(nextQueue);
      queueRef.current = nextQueue;

      const firstTrack =
        nextQueue.find((track) => track.id === startTrackId) ?? nextQueue[0];

      await startTrack(firstTrack);
    },
    [startTrack]
  );

  const playNext = useCallback(async () => {
    const nextQueue = getActiveQueue();
    if (nextQueue.length === 0) return;

    const nextTrack = isShuffleEnabledRef.current
      ? getShuffleTrack(
          nextQueue,
          currentTrackRef.current?.id,
          recentlyPlayedIdsRef.current
        )
      : getSequentialNextTrack(nextQueue, currentTrackRef.current?.id);

    if (!nextTrack) return;

    await startTrack(nextTrack);
  }, [getActiveQueue, startTrack]);

  const playPrevious = useCallback(async () => {
    const audio = audioRef.current;

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const nextQueue = getActiveQueue();
    if (nextQueue.length === 0) return;

    const previousTrack = isShuffleEnabledRef.current
      ? getShuffleTrack(
          nextQueue,
          currentTrackRef.current?.id,
          recentlyPlayedIdsRef.current
        )
      : getSequentialPreviousTrack(nextQueue, currentTrackRef.current?.id);

    if (!previousTrack) return;

    await startTrack(previousTrack);
  }, [getActiveQueue, startTrack]);

  const playOrToggleTrack = useCallback(
    async (track: MusicTrack, queueOverride?: MusicTrack[]) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (queueOverride && queueOverride.length > 0) {
        const nextQueue = dedupeTracks(queueOverride);
        setQueueState(nextQueue);
        queueRef.current = nextQueue;
      }

      const isSameTrack = currentTrackRef.current?.id === track.id;

      try {
        if (isSameTrack) {
          if (audio.paused) {
            markRecentlyPlayed(track.id);
            await audio.play();
            setIsPlaying(true);
          } else {
            audio.pause();
            setIsPlaying(false);
          }
          return;
        }

        await startTrack(track);
      } catch (error) {
        console.error('Failed to play or toggle track:', error);
        setIsPlaying(false);
      }
    },
    [markRecentlyPlayed, startTrack]
  );

  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrackRef.current) return;

    try {
      if (audio.paused) {
        markRecentlyPlayed(currentTrackRef.current.id);
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
    }
  }, [markRecentlyPlayed]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
  }, []);

  const seekTo = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.currentTime = Math.max(0, Math.min(time, duration || 0));
      setCurrentTime(audio.currentTime);
    },
    [duration]
  );

  const setVolume = useCallback((nextVolume: number) => {
    const safe = Math.max(0, Math.min(nextVolume, 1));
    setVolumeState(safe);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffleEnabled((prev) => !prev);
  }, []);

  const toggleContinuous = useCallback(() => {
    setIsContinuousEnabled((prev) => !prev);
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  useEffect(() => {
    handleTrackEndedRef.current = () => {
      if (isContinuousEnabledRef.current) {
        void playNext();
        return;
      }

      const audio = audioRef.current;
      setIsPlaying(false);
      setCurrentTime(0);

      if (audio) {
        audio.currentTime = 0;
      }
    };
  }, [playNext]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volumeState;
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);

    const handleLoadedMetadata = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);

    const handleEnded = () => {
      handleTrackEndedRef.current?.();
    };

    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volumeState;
    }
  }, [volumeState]);

  useEffect(() => {
    if (!currentTrack || !isPlaying || currentTime < 1) return;

    const listenProgress = duration > 0 ? currentTime / duration : 0;
    const hasMetListenThreshold = currentTime >= 30 || listenProgress >= 0.8;
    const listenKey = `${currentTrack.id}:${currentTrack.realmId}`;

    if (!hasMetListenThreshold || loggedListenIdsRef.current.has(listenKey)) {
      return;
    }

    loggedListenIdsRef.current.add(listenKey);

    logMusicListen({
      variables: {
        realmId: currentTrack.realmId,
        trackTitle: currentTrack.trackTitle,
        duration: Math.round(duration || currentTime),
      },
    })
      .then((result) => {
        window.dispatchEvent(
          new CustomEvent('cosmic:music-listen-logged', {
            detail: {
              realmId: currentTrack.realmId,
              trackTitle: currentTrack.trackTitle,
              message: result.data?.logMusicListen?.message,
            },
          })
        );
      })
      .catch((error) => {
        loggedListenIdsRef.current.delete(listenKey);
        console.error('Failed to log music listen:', error);
      });
  }, [currentTrack, isPlaying, currentTime, duration, logMusicListen]);

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume: volumeState,
      isExpanded,

      queue: activeQueue,
      queueLength,
      isShuffleEnabled,
      isContinuousEnabled,
      hasNextTrack,
      hasPreviousTrack,

      playTrack,
      playOrToggleTrack,
      playQueue,
      setQueue,
      clearQueue,
      playNext,
      playPrevious,
      toggleShuffle,
      toggleContinuous,

      togglePlayPause,
      pause,
      seekTo,
      setVolume,
      setExpanded: setIsExpanded,
      toggleExpanded,
    }),
    [
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volumeState,
      isExpanded,
      activeQueue,
      queueLength,
      isShuffleEnabled,
      isContinuousEnabled,
      hasNextTrack,
      hasPreviousTrack,
      playTrack,
      playOrToggleTrack,
      playQueue,
      setQueue,
      clearQueue,
      playNext,
      playPrevious,
      toggleShuffle,
      toggleContinuous,
      togglePlayPause,
      pause,
      seekTo,
      setVolume,
      toggleExpanded,
    ]
  );

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayerContext() {
  const context = useContext(MusicPlayerContext);

  if (!context) {
    throw new Error('useMusicPlayerContext must be used within MusicPlayerProvider');
  }

  return context;
}
