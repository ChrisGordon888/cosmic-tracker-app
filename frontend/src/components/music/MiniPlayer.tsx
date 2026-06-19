'use client';

import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { getRealmTheme } from '@/lib/realmTheme';

function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatQueueCount(queueLength: number) {
    return `${queueLength} ${queueLength === 1 ? 'track' : 'tracks'}`;
}

export default function MiniPlayer() {
    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isExpanded,
        isShuffleEnabled,
        isContinuousEnabled,
        queueLength,
        queueLabel,
        hasNextTrack,
        hasPreviousTrack,
        togglePlayPause,
        playNext,
        playPrevious,
        toggleShuffle,
        toggleContinuous,
        seekTo,
        setVolume,
        toggleExpanded,
    } = useMusicPlayer();

    if (!currentTrack) return null;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const realmTheme = getRealmTheme(currentTrack.realmId);
    const realmColor = realmTheme.accent;
    const realmSoft = realmTheme.soft;
    const realmBorder = realmTheme.border;
    const realmGlow = realmTheme.glow;
    const flowLabel = queueLabel || 'Track flow';
    const queueCopy = formatQueueCount(queueLength);

    return (
        <div
            className={`cosmic-mini-player ${isExpanded ? 'is-expanded' : 'is-collapsed'} fixed z-[9999] rounded-2xl border backdrop-blur-xl shadow-2xl right-4 w-[340px] max-w-[calc(100vw-2rem)] max-[640px]:w-auto max-[640px]:rounded-2xl`}
            style={{
                background: `radial-gradient(circle at top left, ${realmSoft}, transparent 42%), rgba(8, 10, 20, 0.9)`,
                borderColor: realmBorder,
                boxShadow: `0 12px 40px ${realmGlow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
        >
            <div className="cosmic-mini-player-inner p-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={togglePlayPause}
                        className="mini-player-play-button w-12 h-12 rounded-full text-xl flex items-center justify-center shrink-0"
                        style={{
                            background: `linear-gradient(135deg, ${realmColor}, ${realmSoft})`,
                            border: `1px solid ${realmBorder}`,
                            boxShadow: `0 0 18px ${realmGlow}`,
                        }}
                        aria-label={isPlaying ? 'Pause current track' : 'Play current track'}
                    >
                        {isPlaying ? '⏸' : '▶️'}
                    </button>

                    <div className="mini-player-copy flex-1 min-w-0">
                        <p
                            className="text-sm font-semibold truncate"
                            style={{
                                color: realmColor,
                                textShadow: realmTheme.textShadow,
                            }}
                        >
                            {currentTrack.trackTitle}
                        </p>

                        <p className="text-xs text-white/70 truncate">
                            {currentTrack.artist || 'Cosmic 888'} • {currentTrack.realmName}
                        </p>
                    </div>

                    <button
                        onClick={toggleExpanded}
                        className="mini-player-toggle text-sm text-white/70 hover:text-white transition-colors"
                        aria-label={isExpanded ? 'Minimize player' : 'Expand player'}
                    >
                        {isExpanded ? '▾' : '▴'}
                    </button>
                </div>

                <div className="mini-player-progress">
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
                                background: `linear-gradient(90deg, ${realmColor}, ${realmSoft})`,
                                boxShadow: `0 0 12px ${realmGlow}`,
                            }}
                        />
                    </div>

                    <div className="mt-2 flex justify-between text-[11px] text-white/60">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                        onClick={playPrevious}
                        disabled={!hasPreviousTrack}
                        className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-white/75 transition-all hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed"
                        aria-label="Play previous track"
                        title={hasPreviousTrack ? 'Previous track' : 'No previous track in this flow yet'}
                    >
                        ‹‹
                    </button>

                    <button
                        onClick={toggleShuffle}
                        disabled={queueLength <= 1}
                        className="rounded-full border px-3 py-2 text-xs transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                        style={{
                            borderColor: isShuffleEnabled ? realmBorder : 'rgba(255,255,255,0.10)',
                            background: isShuffleEnabled ? realmSoft : 'rgba(255,255,255,0.045)',
                            color: isShuffleEnabled ? realmColor : 'rgba(255,255,255,0.72)',
                            boxShadow: isShuffleEnabled ? `0 0 12px ${realmGlow}` : 'none',
                        }}
                        aria-pressed={isShuffleEnabled}
                        aria-label={isShuffleEnabled ? 'Turn shuffle off' : 'Turn shuffle on'}
                        title={queueLength > 1 ? 'Shuffle this flow' : 'Shuffle needs a flow with multiple tracks'}
                    >
                        Shuffle
                    </button>

                    <button
                        onClick={toggleContinuous}
                        disabled={queueLength <= 1}
                        className="rounded-full border px-3 py-2 text-xs transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                        style={{
                            borderColor: isContinuousEnabled ? realmBorder : 'rgba(255,255,255,0.10)',
                            background: isContinuousEnabled ? realmSoft : 'rgba(255,255,255,0.045)',
                            color: isContinuousEnabled ? realmColor : 'rgba(255,255,255,0.72)',
                            boxShadow: isContinuousEnabled ? `0 0 12px ${realmGlow}` : 'none',
                        }}
                        aria-pressed={isContinuousEnabled}
                        aria-label={isContinuousEnabled ? 'Turn continuous play off' : 'Turn continuous play on'}
                        title={queueLength > 1 ? 'Continuous play for this flow' : 'Flow needs multiple tracks'}
                    >
                        Flow
                    </button>

                    <button
                        onClick={playNext}
                        disabled={!hasNextTrack}
                        className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-white/75 transition-all hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed"
                        aria-label="Play next track"
                        title={hasNextTrack ? 'Next track' : 'No next track in this flow yet'}
                    >
                        ››
                    </button>
                </div>

                {isExpanded && (
                    <div className="mini-player-expanded mt-4 border-t border-white/10 pt-4">
                        <div className="mb-3">
                            <p className="text-xs uppercase tracking-wide text-white/50 mb-1">
                                Now Playing
                            </p>

                            <p className="text-sm text-white/90">
                                Realm {currentTrack.realmId} • {currentTrack.realmName}
                            </p>

                            <p className="text-xs text-white/45 mt-1">
                                {flowLabel} • {queueCopy} • Shuffle {isShuffleEnabled ? 'on' : 'off'} • Flow {isContinuousEnabled ? 'on' : 'off'}
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
