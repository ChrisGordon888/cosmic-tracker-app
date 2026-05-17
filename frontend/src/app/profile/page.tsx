'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { GET_ME } from '@/graphql/realms';
import '@/styles/realmShared.css';
import '@/styles/nexus.css';

const REALM_META: Record<number, { name: string; mark: string; color: string }> = {
    303: { name: 'Fractured Frontier', mark: '∴', color: '#FF4D6D' },
    202: { name: 'The Veil', mark: '◐', color: '#8B5CF6' },
    101: { name: 'Moonlit Roads', mark: '☾', color: '#38BDF8' },
    55: { name: 'Skybound City', mark: '△', color: '#FACC15' },
    44: { name: 'Astral Bazaar', mark: '◇', color: '#10B981' },
    0: { name: 'InterSiddhi', mark: '∞', color: '#F5F5F5' },
};

const REALM_ORDER = [303, 202, 101, 55, 44, 0];

function getTravelerTitle(level: number): string {
    if (level <= 5) return 'Cosmic Initiate';
    if (level <= 10) return 'Astral Wanderer';
    if (level <= 20) return 'Realm Walker';
    if (level <= 30) return 'Void Sage';
    return 'Cosmic Master';
}

function getStreakLabel(streak: number): string {
    if (streak === 0) return 'Not Yet Started';
    if (streak <= 3) return 'Igniting';
    if (streak <= 7) return 'Building Momentum';
    if (streak <= 14) return 'Consistent';
    if (streak <= 30) return 'Locked In';
    return 'Cosmic Force';
}

function formatListenTime(seconds: number): string {
    if (!seconds || seconds < 60) return `${seconds ?? 0}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
}

function formatDate(raw: string | number | null | undefined): string {
    if (!raw) return '—';

    const date = new Date(raw);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function SystemIcon({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#DCBA5C]">
            {children}
        </span>
    );
}

export default function ProfilePage() {
    const { data: session, status } = useSession();

    const { data: userData, loading: userLoading } = useQuery(GET_ME, {
        skip: !session,
    });

    if (status === 'loading' || userLoading) {
        return (
            <div className="min-h-screen grid place-items-center p-6 nexus-shell">
                <div className="glass-card nexus-panel max-w-md text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full border border-white/15 grid place-items-center text-[#DCBA5C]">
                        ✦
                    </div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                        Loading Profile
                    </p>
                    <h1 className="text-3xl font-display mb-3">Syncing Traveler Data</h1>
                    <p className="text-secondary">
                        Pulling realm progress, XP, music history, and profile stats.
                    </p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen grid place-items-center p-6 nexus-shell">
                <div className="glass-card nexus-panel max-w-md text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full border border-white/15 grid place-items-center text-[#DCBA5C]">
                        ✦
                    </div>

                    <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                        Traveler Profile Locked
                    </p>

                    <h1 className="text-3xl font-display mb-3">Sign in to view profile</h1>

                    <p className="text-secondary mb-6">
                        Your profile stores realm progress, XP, music history, trials, and traveler stats.
                    </p>

                    <Link href="/auth" className="btn-primary">
                        Open Cosmic Access
                    </Link>
                </div>
            </div>
        );
    }

    const user = userData?.me;

    const userLevel = user?.level ?? 1;
    const userXP = user?.xp ?? 0;
    const xpToNext = user?.xpToNextLevel ?? 100;
    const safeXpToNext = Math.max(xpToNext, 1);
    const xpPercent = Math.min((userXP / safeXpToNext) * 100, 100);
    const travelerTitle = getTravelerTitle(userLevel);
    const avatarUrl = user?.image ?? null;

    const unlockedRealms: number[] = user?.unlockedRealms ?? [303];
    const completedTrials: any[] = user?.completedTrials ?? [];
    const visitedLocations: any[] = user?.visitedLocations ?? [];
    const tracksListened: any[] = user?.musicStats?.tracksListened ?? [];
    const totalListenTime: number = user?.musicStats?.totalListeningTime ?? 0;
    const favoriteRealmId: number | null = user?.musicStats?.favoriteRealm ?? null;

    const currentStreak = user?.streaks?.currentStreak ?? 0;
    const longestStreak = user?.streaks?.longestStreak ?? 0;
    const totalLogins = user?.streaks?.totalLogins ?? 0;
    const lastLoginDate = user?.streaks?.lastLoginDate ?? null;

    const completedTrialsList = completedTrials.filter((trial) => trial.isComplete);
    const totalTrialXP = completedTrialsList.reduce(
        (sum: number, trial: any) => sum + (trial.xpEarned ?? 0),
        0
    );
    const totalLocationXP = visitedLocations.reduce(
        (sum: number, location: any) => sum + (location.xpEarned ?? 0),
        0
    );
    const totalMusicXP = tracksListened.reduce(
        (sum: number, track: any) => sum + (track.xpEarned ?? 0),
        0
    );
    const totalXPEarned = totalTrialXP + totalLocationXP + totalMusicXP;

    const currentRealmMeta = REALM_META[user?.currentRealm as number] ?? REALM_META[303];
    const favoriteRealmMeta = favoriteRealmId ? REALM_META[favoriteRealmId] ?? null : null;

    const getRealmProgress = (realmId: number) => {
        const trials = completedTrials.filter((trial: any) => trial.realmId === realmId);
        const done = trials.filter((trial: any) => trial.isComplete).length;
        return {
            done,
            total: 3,
            percent: Math.floor((done / 3) * 100),
        };
    };

    const overviewStats = [
        {
            label: 'Realms Unlocked',
            value: unlockedRealms.length,
            sub: 'of 6',
            mark: '◇',
        },
        {
            label: 'Trials Complete',
            value: completedTrialsList.length,
            sub: 'of 18',
            mark: '✦',
        },
        {
            label: 'Locations Visited',
            value: visitedLocations.length,
            sub: 'explored',
            mark: '⌖',
        },
        {
            label: 'Music Time',
            value: formatListenTime(totalListenTime),
            sub: 'total',
            mark: '♪',
        },
        {
            label: 'XP Earned',
            value: totalXPEarned,
            sub: 'lifetime',
            mark: '∴',
        },
        {
            label: 'Total Logins',
            value: totalLogins,
            sub: 'sessions',
            mark: '◐',
        },
    ];

    return (
        <div className="min-h-screen pb-32 nexus-shell">
            <div className="container mx-auto px-4 py-8 max-w-5xl nexus-container">
                <header className="text-center mb-8 fade-in">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted mb-3">
                        Traveler System
                    </p>
                    <h1 className="text-4xl md:text-5xl font-display mb-3 text-primary">
                        Profile
                    </h1>
                    <p className="text-secondary max-w-2xl mx-auto">
                        Your realm progress, listening history, trials, XP, and traveler state in one place.
                    </p>
                </header>

                <section className="glass-card nexus-panel p-5 md:p-7 mb-6 fade-in">
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        <div className="relative shrink-0">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={user?.name ?? 'Traveler'}
                                    className="h-24 w-24 rounded-full border object-cover"
                                    style={{
                                        borderColor: 'rgba(220, 186, 92, 0.34)',
                                        boxShadow: '0 0 28px rgba(220, 186, 92, 0.10)',
                                    }}
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full border border-white/15 bg-white/[0.04] grid place-items-center text-3xl text-[#DCBA5C]">
                                    ✦
                                </div>
                            )}

                            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full grid place-items-center border border-white/15 bg-[#0B0F1A] text-sm font-bold text-[#DCBA5C]">
                                {userLevel}
                            </div>
                        </div>

                        <div className="flex-1 text-center lg:text-left min-w-0">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                                {travelerTitle}
                            </p>

                            <h2 className="text-3xl md:text-4xl font-display mb-2 truncate text-primary">
                                {user?.name ?? session.user?.name ?? 'Unknown Traveler'}
                            </h2>

                            <p className="text-secondary mb-4">
                                Current Realm:{' '}
                                <span style={{ color: currentRealmMeta.color }}>
                                    {currentRealmMeta.mark} {currentRealmMeta.name}
                                </span>
                            </p>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-secondary">Experience</span>
                                    <span className="text-stats text-glow">
                                        {userXP} / {safeXpToNext} XP
                                    </span>
                                </div>
                                <div className="stat-bar">
                                    <div className="stat-bar-fill" style={{ width: `${xpPercent}%` }} />
                                </div>
                                <p className="text-xs text-muted mt-2">
                                    Level {userLevel} → Level {userLevel + 1}
                                </p>
                            </div>
                        </div>

                        <div className="glass-card nexus-panel w-full lg:w-44 text-center">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted mb-3">
                                Streak
                            </p>
                            <div className="text-4xl font-display text-[#DCBA5C] mb-1">
                                {currentStreak}
                            </div>
                            <p className="text-secondary text-sm">Day Streak</p>
                            <p className="text-xs text-muted mt-2">{getStreakLabel(currentStreak)}</p>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                    {overviewStats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="glass-card nexus-panel text-center fade-in"
                            style={{ animationDelay: `${0.05 + index * 0.03}s` }}
                        >
                            <div className="mx-auto mb-3">
                                <SystemIcon>{stat.mark}</SystemIcon>
                            </div>
                            <div className="text-2xl font-display text-glow">{stat.value}</div>
                            <p className="text-xs text-muted mt-1">{stat.label}</p>
                            <p className="text-xs text-muted/70">{stat.sub}</p>
                        </div>
                    ))}
                </section>

                <section className="glass-card nexus-panel p-5 md:p-7 mb-6 fade-in">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-5">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                                Realm Map
                            </p>
                            <h2 className="text-2xl md:text-3xl font-display text-primary">
                                Realm Progress
                            </h2>
                        </div>
                        <p className="text-sm text-secondary">
                            {unlockedRealms.length} of 6 realms unlocked
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {REALM_ORDER.map((realmId) => {
                            const meta = REALM_META[realmId];
                            const unlocked = unlockedRealms.includes(realmId);
                            const progress = getRealmProgress(realmId);
                            const mastered = progress.done === 3;

                            return (
                                <div
                                    key={realmId}
                                    className="rounded-2xl border p-4 bg-white/[0.035]"
                                    style={{
                                        borderColor: unlocked ? `${meta.color}55` : 'rgba(255,255,255,0.10)',
                                        opacity: unlocked ? 1 : 0.48,
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div
                                            className="h-11 w-11 rounded-full border grid place-items-center text-lg"
                                            style={{
                                                borderColor: `${meta.color}55`,
                                                color: meta.color,
                                                background: `${meta.color}12`,
                                            }}
                                        >
                                            {meta.mark}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="font-display text-sm truncate"
                                                style={{ color: unlocked ? meta.color : undefined }}
                                            >
                                                {meta.name}
                                            </p>
                                            <p className="text-xs text-muted">
                                                {unlocked ? `${progress.done} / 3 trials` : 'Locked'}
                                            </p>
                                        </div>

                                        {mastered && (
                                            <span className="text-[10px] uppercase tracking-[0.14em] text-[#DCBA5C]">
                                                Mastered
                                            </span>
                                        )}
                                    </div>

                                    {unlocked && (
                                        <>
                                            <div className="stat-bar">
                                                <div
                                                    className="stat-bar-fill"
                                                    style={{
                                                        width: `${progress.percent}%`,
                                                        background: `linear-gradient(90deg, ${meta.color}, rgba(220,186,92,0.92))`,
                                                    }}
                                                />
                                            </div>

                                            <div className="flex justify-between text-xs text-muted mt-2">
                                                <span>{progress.percent}% complete</span>
                                                <Link href={`/realms/${realmId}`} className="text-glow hover:opacity-80">
                                                    Enter →
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                    <div className="glass-card nexus-panel p-5 md:p-7 fade-in">
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                                    Trials
                                </p>
                                <h2 className="text-2xl font-display text-primary">
                                    Achievements
                                </h2>
                            </div>
                            <span className="text-sm text-muted">{completedTrialsList.length} complete</span>
                        </div>

                        {completedTrialsList.length === 0 ? (
                            <div className="text-center py-8">
                                <SystemIcon>✦</SystemIcon>
                                <p className="text-secondary mt-4">No trials completed yet.</p>
                                <p className="text-muted text-sm mt-1">
                                    Enter a realm to begin your first trial.
                                </p>
                                <Link href="/nexus">
                                    <button className="btn-primary mt-5">Go to Nexus</button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                {completedTrialsList.map((trial: any) => {
                                    const realmMeta = REALM_META[trial.realmId as number] ?? REALM_META[303];

                                    return (
                                        <div
                                            key={`${trial.realmId}-${trial.trialId}`}
                                            className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-10 w-10 rounded-full border grid place-items-center"
                                                    style={{
                                                        color: realmMeta.color,
                                                        borderColor: `${realmMeta.color}55`,
                                                        background: `${realmMeta.color}12`,
                                                    }}
                                                >
                                                    {realmMeta.mark}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-display text-sm truncate">
                                                        {trial.trialName}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        {realmMeta.name} • {formatDate(trial.completedAt)}
                                                    </p>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <p className="text-glow text-sm font-display">
                                                        +{trial.xpEarned ?? 0} XP
                                                    </p>
                                                    <p className="text-[10px] text-[#DCBA5C] uppercase tracking-[0.12em]">
                                                        Done
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="glass-card nexus-panel p-5 md:p-7 fade-in">
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                                    Music
                                </p>
                                <h2 className="text-2xl font-display text-primary">Music Hall</h2>
                            </div>
                            <span className="text-sm text-muted">{tracksListened.length} tracks</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-5">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center">
                                <p className="text-xl font-display text-glow">{tracksListened.length}</p>
                                <p className="text-xs text-muted">Heard</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center">
                                <p className="text-xl font-display text-glow">
                                    {formatListenTime(totalListenTime)}
                                </p>
                                <p className="text-xs text-muted">Time</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center">
                                <p className="text-xl font-display text-glow">
                                    {favoriteRealmMeta ? favoriteRealmMeta.mark : '—'}
                                </p>
                                <p className="text-xs text-muted">Favorite</p>
                            </div>
                        </div>

                        {tracksListened.length === 0 ? (
                            <div className="text-center py-7">
                                <SystemIcon>♪</SystemIcon>
                                <p className="text-secondary mt-4">No tracks listened yet.</p>
                                <p className="text-muted text-sm mt-1">
                                    Play realm music to begin shaping your listening history.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                {tracksListened.map((track: any) => {
                                    const realmMeta = REALM_META[track.realmId as number] ?? REALM_META[303];

                                    return (
                                        <div
                                            key={`${track.realmId}-${track.trackTitle}`}
                                            className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-10 w-10 rounded-full border grid place-items-center"
                                                    style={{
                                                        color: realmMeta.color,
                                                        borderColor: `${realmMeta.color}55`,
                                                        background: `${realmMeta.color}12`,
                                                    }}
                                                >
                                                    ♪
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-display text-sm truncate">
                                                        {track.trackTitle}
                                                    </p>
                                                    <p className="text-xs text-muted truncate">
                                                        {track.artist ?? 'Cosmic 888'} • {realmMeta.name}
                                                    </p>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <p className="text-xs text-secondary">
                                                        {track.listenCount}×
                                                    </p>
                                                    <p className="text-xs text-glow">+{track.xpEarned ?? 0} XP</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                <section className="glass-card nexus-panel p-5 md:p-7 fade-in">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                                Streak Chronicle
                            </p>
                            <h2 className="text-2xl font-display text-primary">
                                Practice Rhythm
                            </h2>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/leaderboard" className="btn-secondary">
                                View Leaderboard
                            </Link>

                            <Link href="/nexus" className="btn-secondary">
                                Return to Nexus
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-center">
                            <p className="text-2xl font-display text-glow">{currentStreak}</p>
                            <p className="text-xs text-muted">Current Streak</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-center">
                            <p className="text-2xl font-display text-glow">{longestStreak}</p>
                            <p className="text-xs text-muted">Longest Streak</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-center">
                            <p className="text-2xl font-display text-glow">{totalLogins}</p>
                            <p className="text-xs text-muted">Total Logins</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-center">
                            <p className="text-sm font-display text-glow">{formatDate(lastLoginDate)}</p>
                            <p className="text-xs text-muted">Last Login</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}