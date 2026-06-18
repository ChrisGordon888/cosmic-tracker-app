'use client';

import RealmOrbitCard from '@/components/music/RealmOrbitCard';
import { MUSIC_REGISTRY } from '@/lib/musicRegistry';
import type { RealmId } from '@/lib/realmStateMap';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';

interface RealmSoundstageProps {
    realmId: RealmId;
    realmName: string;
    realmIcon: string;
    realmColor: string;
    intro?: string;
    supportText?: string;

    progress?: number;
    isUnlocked?: boolean;
    realmRoute?: string;
    isCurrentRealm?: boolean;
    isRecommended?: boolean;

    /**
     * Uses the compact mini-orbit card on mobile while keeping
     * the full signature orbit card on desktop.
     */
    compactOnMobile?: boolean;
}

const RELEASE_UNLOCKS: Record<string, string> = {
    'sin-do-over': '2026-06-29T00:00:00',
    'sin-running-from-the-plug': '2026-07-14T00:00:00',
    '101-hold-my-hand': '2026-07-29T00:00:00',
    '303-in-the-deep': '2026-07-29T00:00:00',
    '202-her-fantasy': '2026-07-29T00:00:00',
    '202-siren': '2026-07-29T00:00:00',
};

function formatUnlockDate(dateString?: string | null) {
    if (!dateString) return null;

    try {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString));
    } catch {
        return null;
    }
}

function isTrackLocked(track: { id: string; visibility?: string }) {
    if (track.visibility === 'premium') return true;

    const unlockDate = RELEASE_UNLOCKS[track.id];
    if (!unlockDate) return false;

    return new Date() < new Date(unlockDate);
}

function getTrackLockLabel(track: { id: string; visibility?: string }) {
    if (track.visibility === 'premium') return 'Premium';

    const unlockDate = RELEASE_UNLOCKS[track.id];
    const unlockLabel = formatUnlockDate(unlockDate);

    return unlockLabel ? `Opens ${unlockLabel}` : null;
}

export default function RealmSoundstage({
    realmId,
    realmName,
    realmIcon,
    realmColor,
    intro,
    supportText,
    progress = 0,
    isUnlocked = true,
    realmRoute,
    isCurrentRealm = false,
    isRecommended = false,
    compactOnMobile = false,
}: RealmSoundstageProps) {
    const { playOrToggleTrack, currentTrack, isPlaying } = useMusicPlayer();

    const realmTracks = MUSIC_REGISTRY
        .filter((track) => track.realmId === realmId)
        .filter(
            (track) =>
                track.visibility === 'public' ||
                track.visibility === 'signup' ||
                track.visibility === 'premium'
        )
        .sort((a, b) => {
            const aOrder = a.sortOrder ?? 999;
            const bOrder = b.sortOrder ?? 999;

            if (aOrder !== bOrder) return aOrder - bOrder;

            return a.trackTitle.localeCompare(b.trackTitle);
        });

    if (realmTracks.length === 0) {
        return (
            <div className="glass-card p-4 md:p-6 mb-8">
                <h2 className="text-2xl font-display mb-3">🎵 Realm Soundstage</h2>
                <p className="text-secondary">No tracks loaded for this realm yet.</p>
            </div>
        );
    }

    const featuredTrack =
        realmTracks.find((track) => !isTrackLocked(track) && track.isRealmAnchor) ??
        realmTracks.find((track) => !isTrackLocked(track) && track.isPublicPick) ??
        realmTracks.find((track) => !isTrackLocked(track)) ??
        realmTracks[0];

    const featuredTrackLocked = isTrackLocked(featuredTrack);
    const featuredTrackLockLabel = getTrackLockLabel(featuredTrack);
    const isFeaturedSelected = currentTrack?.id === featuredTrack.id;

    const handlePlayOrbitTrack = (track: { id: string }) => {
        const fullTrack = MUSIC_REGISTRY.find((musicTrack) => musicTrack.id === track.id);

        if (!fullTrack) {
            console.warn('Track not found in music registry:', track.id);
            return;
        }

        if (isTrackLocked(fullTrack)) {
            return;
        }

        void playOrToggleTrack(fullTrack);
    };

    const handlePlayFeaturedTrack = () => {
        if (featuredTrackLocked) return;

        void playOrToggleTrack(featuredTrack);
    };

    return (
        <div className="glass-card p-4 md:p-6 mb-8">
            <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-2">
                    Realm Soundstage
                </p>

                <h2
                    className="text-2xl md:text-3xl font-display mb-3"
                    style={{ color: realmColor }}
                >
                    {realmName}
                </h2>

                {intro && <p className="text-secondary mb-3 max-w-3xl">{intro}</p>}
                {supportText && <p className="text-sm text-muted max-w-3xl">{supportText}</p>}
            </div>

            <RealmOrbitCard
                realmId={realmId}
                realmName={realmName}
                realmIcon={realmIcon}
                realmColor={realmColor}
                tracks={realmTracks}
                currentTrackId={currentTrack?.id ?? null}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayOrbitTrack}
                progress={progress}
                isUnlocked={isUnlocked}
                realmRoute={realmRoute}
                isCurrentRealm={isCurrentRealm}
                isRecommended={isRecommended}
                compactOnMobile={compactOnMobile}
                isTrackLocked={isTrackLocked}
                getTrackLockLabel={getTrackLockLabel}
            />

            <div
                className="mt-5 rounded-2xl border p-4 md:p-5"
                style={{
                    borderColor: `${realmColor}33`,
                    background: `linear-gradient(135deg, ${realmColor}10, rgba(255,255,255,0.02))`,
                    boxShadow: `0 0 18px ${realmColor}10`,
                }}
            >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                                Featured Entry
                            </p>

                            {featuredTrackLocked && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] bg-white/5 border border-white/10 text-white/55">
                                    {featuredTrackLockLabel ?? 'Locked'}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                                style={{
                                    background: `radial-gradient(circle, ${realmColor}66, ${realmColor}22)`,
                                    border: `1px solid ${realmColor}55`,
                                    boxShadow: `0 0 12px ${realmColor}22`,
                                    opacity: featuredTrackLocked ? 0.52 : 1,
                                }}
                            >
                                {featuredTrackLocked ? '🔒' : '✦'}
                            </div>

                            <div className="min-w-0">
                                <p
                                    className="font-display text-lg truncate"
                                    style={{
                                        color: featuredTrackLocked
                                            ? 'rgba(255,255,255,0.55)'
                                            : realmColor,
                                    }}
                                >
                                    {featuredTrack.trackTitle}
                                </p>
                                <p className="text-sm text-secondary truncate">
                                    {featuredTrack.artist}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-secondary max-w-2xl">
                            Start here for the clearest first entry into{' '}
                            <span style={{ color: realmColor }}>{realmName}</span>. The full
                            realm soundtrack can still be explored through the tracklist.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <button
                            className="btn-secondary"
                            onClick={handlePlayFeaturedTrack}
                            disabled={featuredTrackLocked}
                            style={{
                                opacity: featuredTrackLocked ? 0.55 : 1,
                                cursor: featuredTrackLocked ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {featuredTrackLocked
                                ? featuredTrackLockLabel ?? 'Locked'
                                : isFeaturedSelected
                                  ? isPlaying
                                      ? 'Pause Track'
                                      : 'Resume Track'
                                  : '▶ Play Track'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="quest-card mt-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-2">
                    Listening Intention
                </p>
                <p className="text-sm text-secondary">
                    Let the music tell you whether this realm matches your current inner state
                    before going deeper.
                </p>
            </div>
        </div>
    );
}