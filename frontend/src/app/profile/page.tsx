'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { GET_ME } from '@/graphql/realms';
import '@/styles/realmShared.css';

// ─── Realm metadata ────────────────────────────────────────────────────────────
const REALM_META: Record<number, { name: string; icon: string; color: string }> = {
  303: { name: 'Fractured Frontier', icon: '🌪️', color: '#FF0040' },
  202: { name: 'The Veil',           icon: '🕯️', color: '#9D84B7' },
  101: { name: 'Moonlit Roads',      icon: '🌙', color: '#00D4FF' },
  55:  { name: 'Skybound City',      icon: '⛰️', color: '#FFD700' },
  44:  { name: 'Astral Bazaar',      icon: '🛍️', color: '#FF6B35' },
  0:   { name: 'InterSiddhi',        icon: '🌌', color: '#9D4EDD' },
};
const REALM_ORDER = [303, 202, 101, 55, 44, 0];

// ─── Helper functions ──────────────────────────────────────────────────────────
function getTravelerTitle(level: number): string {
  if (level <= 5)  return 'Cosmic Initiate';
  if (level <= 10) return 'Astral Wanderer';
  if (level <= 20) return 'Realm Walker';
  if (level <= 30) return 'Void Sage';
  return 'Cosmic Master';
}

function getStreakLabel(streak: number): string {
  if (streak === 0)  return 'Not Yet Started';
  if (streak <= 3)   return 'Igniting ✨';
  if (streak <= 7)   return 'Building Momentum 🔥';
  if (streak <= 14)  return 'On Fire 🔥🔥';
  if (streak <= 30)  return 'Unstoppable 🌟';
  return 'Cosmic Force ⚡';
}

function formatListenTime(seconds: number): string {
  if (!seconds || seconds < 60) return `${seconds ?? 0}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatDate(raw: string | null | undefined): string {
  if (!raw) return '—';
  return new Date(raw).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session, status } = useSession();

  const { data: userData, loading: userLoading } = useQuery(GET_ME, {
    skip: !session,
  });

  // ── Loading state ────────────────────────────────────────────────────────────
  if (status === 'loading' || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="neon-glow text-4xl mb-4">👤</div>
          <p className="text-xl font-display">Loading Traveler Profile...</p>
        </div>
      </div>
    );
  }

  // ── Auth gate ────────────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-12 max-w-md text-center">
          <h1 className="text-4xl font-display neon-glow mb-4">🔒 ACCESS DENIED</h1>
          <p className="text-lg text-secondary mb-8">
            You must be signed in to view your profile.
          </p>
          <Link href="/auth" className="btn-primary">SIGN IN</Link>
        </div>
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────────
  const user = userData?.me;

  const userLevel         = user?.level          ?? 1;
  const userXP            = user?.xp             ?? 0;
  const xpToNext          = user?.xpToNextLevel  ?? 100;
  const safeXpToNext      = Math.max(xpToNext, 1);
  const xpPercent         = Math.min((userXP / safeXpToNext) * 100, 100);
  const travelerTitle     = getTravelerTitle(userLevel);
  const avatarUrl         = user?.image ?? null;

  const unlockedRealms: number[]    = user?.unlockedRealms ?? [303, 202];
  const completedTrials: any[]      = user?.completedTrials ?? [];
  const visitedLocations: any[]     = user?.visitedLocations ?? [];
  const tracksListened: any[]       = user?.musicStats?.tracksListened ?? [];
  const totalListenTime: number     = user?.musicStats?.totalListeningTime ?? 0;
  const favoriteRealmId: number | null = user?.musicStats?.favoriteRealm ?? null;

  const currentStreak   = user?.streaks?.currentStreak  ?? 0;
  const longestStreak   = user?.streaks?.longestStreak  ?? 0;
  const totalLogins     = user?.streaks?.totalLogins    ?? 0;
  const lastLoginDate   = user?.streaks?.lastLoginDate  ?? null;

  // Aggregate stats
  const completedTrialsList  = completedTrials.filter((t) => t.isComplete);
  const totalTrialXP         = completedTrialsList.reduce((s: number, t: any) => s + (t.xpEarned ?? 0), 0);
  const totalLocationXP      = visitedLocations.reduce((s: number, l: any) => s + (l.xpEarned ?? 0), 0);
  const totalMusicXP         = tracksListened.reduce((s: number, t: any) => s + (t.xpEarned ?? 0), 0);
  const totalXPEarned        = totalTrialXP + totalLocationXP + totalMusicXP;

  const currentRealmMeta     = REALM_META[user?.currentRealm as number] ?? REALM_META[303];
  const favoriteRealmMeta    = favoriteRealmId ? (REALM_META[favoriteRealmId] ?? null) : null;

  // Per-realm trial counts
  const getRealmTrials = (realmId: number) =>
    completedTrials.filter((t: any) => t.realmId === realmId);
  const getRealmProgress = (realmId: number) => {
    const trials = getRealmTrials(realmId);
    const done   = trials.filter((t: any) => t.isComplete).length;
    return { done, total: 3, percent: Math.floor((done / 3) * 100) };
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* ── HERO CARD ──────────────────────────────────────────────────────── */}
        <div className="glass-card p-8 mb-6 fade-in">
          <div className="flex flex-col md:flex-row items-center gap-8">

            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name ?? 'Traveler'}
                  width={100}
                  height={100}
                  className="rounded-full border-4"
                  style={{ borderColor: '#9D4EDD', boxShadow: '0 0 30px rgba(157,78,221,0.6)' }}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl border-4"
                  style={{
                    borderColor: '#9D4EDD',
                    background: 'linear-gradient(135deg, #FF006E, #9D4EDD)',
                    boxShadow: '0 0 30px rgba(157,78,221,0.6)',
                  }}
                >
                  🌌
                </div>
              )}
              {/* Level badge overlay */}
              <div
                className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #FF006E, #9D4EDD)', boxShadow: '0 0 12px rgba(157,78,221,0.8)' }}
              >
                {userLevel}
              </div>
            </div>

            {/* Name + title + XP */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-display neon-glow mb-1">
                {user?.name ?? session.user?.name ?? 'Unknown Traveler'}
              </h1>
              <p className="text-glow font-display text-sm mb-1">✦ {travelerTitle} ✦</p>
              <p className="text-secondary text-sm mb-4">
                Current Realm:{' '}
                <span className="text-glow">
                  {currentRealmMeta.icon} {currentRealmMeta.name}
                </span>
              </p>

              {/* XP bar */}
              <div className="mb-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-secondary">Experience Points</span>
                  <span className="text-stats text-glow">{userXP} / {safeXpToNext} XP</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-bar-fill" style={{ width: `${xpPercent}%` }} />
                </div>
              </div>
              <p className="text-xs text-muted">Level {userLevel} → Level {userLevel + 1}</p>
            </div>

            {/* Streak flame */}
            <div
              className="glass-card p-5 text-center flex-shrink-0"
              style={{ minWidth: '110px', borderColor: currentStreak > 0 ? '#FF6B35' : undefined }}
            >
              <div className="text-4xl mb-1">{currentStreak > 0 ? '🔥' : '💤'}</div>
              <div className="text-2xl font-display text-glow">{currentStreak}</div>
              <div className="text-xs text-muted">Day Streak</div>
              <div className="text-xs text-muted mt-1" style={{ color: '#FF6B35' }}>
                {getStreakLabel(currentStreak)}
              </div>
            </div>
          </div>
        </div>

        {/* ── OVERVIEW STATS ──────────────────────────────────────────────────── */}
        <div
          className="grid gap-4 mb-6 fade-in"
          style={{ animationDelay: '0.1s', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
        >
          {[
            { label: 'Realms Unlocked',   value: unlockedRealms.length,     icon: '🗺️', sub: 'of 6'         },
            { label: 'Trials Complete',   value: completedTrialsList.length, icon: '🎯', sub: 'of 18'        },
            { label: 'Locations Visited', value: visitedLocations.length,    icon: '📍', sub: 'explored'     },
            { label: 'Music Time',        value: formatListenTime(totalListenTime), icon: '🎵', sub: 'total' },
            { label: 'Total XP Earned',   value: totalXPEarned,              icon: '⚡', sub: 'lifetime'     },
            { label: 'Total Logins',      value: totalLogins,                icon: '📅', sub: 'sessions'     },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="glass-card p-4 text-center fade-in"
              style={{ animationDelay: `${0.1 + i * 0.05}s` }}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-display text-glow">{stat.value}</div>
              <div className="text-xs text-muted mt-1">{stat.label}</div>
              <div className="text-xs" style={{ color: '#6B6B7B' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ── REALM PROGRESS ─────────────────────────────────────────────────── */}
        <div className="glass-card p-8 mb-6 fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-display mb-6 flex items-center gap-3">
            <span className="text-glow">🗺️</span> REALM PROGRESS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REALM_ORDER.map((realmId) => {
              const meta      = REALM_META[realmId];
              const unlocked  = unlockedRealms.includes(realmId);
              const progress  = getRealmProgress(realmId);
              return (
                <div
                  key={realmId}
                  className={`realm-portal ${unlocked ? 'unlocked' : 'locked'}`}
                  style={{ opacity: unlocked ? 1 : 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{meta.icon}</span>
                    <div>
                      <div className="font-display text-sm" style={{ color: unlocked ? meta.color : undefined }}>
                        {meta.name}
                      </div>
                      <div className="text-xs text-muted">
                        {unlocked ? `${progress.done} / 3 Trials` : '🔒 Locked'}
                      </div>
                    </div>
                    {progress.done === 3 && (
                      <span className="ml-auto text-green-400 text-sm font-bold">✓ MASTERED</span>
                    )}
                  </div>
                  {unlocked && (
                    <>
                      <div className="stat-bar">
                        <div
                          className="stat-bar-fill"
                          style={{ width: `${progress.percent}%`, background: `linear-gradient(90deg, ${meta.color}, #9D4EDD)` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted mt-1">
                        <span>{progress.percent}% complete</span>
                        <Link href={`/realms/${realmId}`}>
                          <span className="text-glow cursor-pointer hover:underline">ENTER →</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── TRIAL ACHIEVEMENTS ─────────────────────────────────────────────── */}
        <div className="glass-card p-8 mb-6 fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-display mb-6 flex items-center gap-3">
            <span className="text-glow">🎯</span> TRIAL ACHIEVEMENTS
            <span className="text-sm text-muted font-normal ml-auto">
              {completedTrialsList.length} completed
            </span>
          </h2>

          {completedTrialsList.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">⚔️</div>
              <p className="text-secondary">No trials completed yet.</p>
              <p className="text-muted text-sm mt-1">Head to a realm to begin your first trial.</p>
              <Link href="/nexus">
                <button className="btn-primary mt-4">GO TO NEXUS →</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTrialsList.map((trial: any, i: number) => {
                const realmMeta = REALM_META[trial.realmId as number];
                return (
                  <div key={`${trial.realmId}-${trial.trialId}`} className="quest-card completed">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{realmMeta?.icon ?? '⚔️'}</span>
                      <div className="flex-1">
                        <div className="font-display text-sm">{trial.trialName}</div>
                        <div className="text-xs text-muted">
                          {realmMeta?.name ?? `Realm ${trial.realmId}`} • Completed {formatDate(trial.completedAt)}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-glow font-display text-sm">+{trial.xpEarned ?? 0} XP</div>
                        <div className="text-xs text-green-400">✓ DONE</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── LOCATIONS VISITED ──────────────────────────────────────────────── */}
        <div className="glass-card p-8 mb-6 fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-display mb-6 flex items-center gap-3">
            <span className="text-glow">📍</span> LOCATIONS EXPLORED
            <span className="text-sm text-muted font-normal ml-auto">
              {visitedLocations.length} visited
            </span>
          </h2>

          {visitedLocations.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">🗺️</div>
              <p className="text-secondary">No locations explored yet.</p>
              <p className="text-muted text-sm mt-1">Visit locations inside realm pages to earn XP.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visitedLocations.map((loc: any) => {
                const realmMeta = REALM_META[loc.realmId as number];
                return (
                  <div
                    key={`${loc.realmId}-${loc.locationId}`}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span className="text-2xl">{realmMeta?.icon ?? '📍'}</span>
                    <div className="flex-1">
                      <div className="text-sm font-display">{loc.locationName}</div>
                      <div className="text-xs text-muted">
                        {realmMeta?.name ?? `Realm ${loc.realmId}`} • {formatDate(loc.visitedAt)}
                      </div>
                    </div>
                    <div className="text-glow text-xs font-display">+{loc.xpEarned ?? 0} XP</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── MUSIC HALL ─────────────────────────────────────────────────────── */}
        <div className="glass-card p-8 mb-6 fade-in" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-2xl font-display mb-2 flex items-center gap-3">
            <span className="text-glow">🎵</span> MUSIC HALL
          </h2>
          <p className="text-secondary text-sm mb-6">
            Every realm has a sonic signature. Your listening history shapes your journey.
          </p>

          {/* Music quick-stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-display text-glow">{tracksListened.length}</div>
              <div className="text-xs text-muted">Tracks Heard</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-display text-glow">{formatListenTime(totalListenTime)}</div>
              <div className="text-xs text-muted">Total Time</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-xl font-display text-glow">
                {favoriteRealmMeta ? favoriteRealmMeta.icon : '—'}
              </div>
              <div className="text-xs text-muted">
                {favoriteRealmMeta ? favoriteRealmMeta.name : 'No favourite yet'}
              </div>
              <div className="text-xs" style={{ color: '#6B6B7B' }}>Fav. Realm</div>
            </div>
          </div>

          {tracksListened.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-secondary">No tracks listened yet.</p>
              <p className="text-muted text-sm mt-1">Enter a realm and listen to 80% of a track to earn music XP.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tracksListened.map((track: any) => {
                const realmMeta = REALM_META[track.realmId as number];
                return (
                  <div
                    key={`${track.realmId}-${track.trackTitle}`}
                    className="flex items-center gap-4 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span className="text-2xl">{realmMeta?.icon ?? '🎵'}</span>
                    <div className="flex-1">
                      <div className="text-sm font-display">{track.trackTitle}</div>
                      <div className="text-xs text-muted">
                        {track.artist ?? 'Cosmic 888'} •{' '}
                        {realmMeta?.name ?? `Realm ${track.realmId}`}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-secondary">
                        {track.listenCount}× played
                      </div>
                      <div className="text-xs text-glow">+{track.xpEarned ?? 0} XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── STREAK CHRONICLE ───────────────────────────────────────────────── */}
        <div className="glass-card p-8 mb-6 fade-in" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-2xl font-display mb-6 flex items-center gap-3">
            <span className="text-glow">🔥</span> STREAK CHRONICLE
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 text-center">
              <div className="text-3xl mb-1">🔥</div>
              <div className="text-2xl font-display text-glow">{currentStreak}</div>
              <div className="text-xs text-muted">Current Streak</div>
              <div className="text-xs mt-1" style={{ color: '#FF6B35' }}>
                {getStreakLabel(currentStreak)}
              </div>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-3xl mb-1">🏆</div>
              <div className="text-2xl font-display text-glow">{longestStreak}</div>
              <div className="text-xs text-muted">Best Streak</div>
              <div className="text-xs mt-1 text-secondary">Personal Record</div>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-3xl mb-1">📅</div>
              <div className="text-2xl font-display text-glow">{totalLogins}</div>
              <div className="text-xs text-muted">Total Sessions</div>
              <div className="text-xs mt-1 text-secondary">Lifetime</div>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-3xl mb-1">🌙</div>
              <div className="text-sm font-display text-glow">{formatDate(lastLoginDate)}</div>
              <div className="text-xs text-muted mt-1">Last Active</div>
            </div>
          </div>
        </div>

        {/* ── FOOTER NAV ─────────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.7s' }}>
          <Link href="/nexus">
            <button className="btn-secondary">← BACK TO NEXUS</button>
          </Link>
          <Link href="/leaderboard">
            <button className="btn-primary">VIEW LEADERBOARD 🏆</button>
          </Link>
        </div>

      </div>
    </div>
  );
}