'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { GET_LEADERBOARD, GET_ME } from '@/graphql/realms';
import '@/styles/realmShared.css';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getRankDisplay(rank: number): { symbol: string; color: string } {
  if (rank === 1) return { symbol: '🥇', color: '#FFD700' };
  if (rank === 2) return { symbol: '🥈', color: '#C0C0C0' };
  if (rank === 3) return { symbol: '🥉', color: '#CD7F32' };
  return { symbol: `#${rank}`, color: '#6B6B7B' };
}

function getTravelerTitle(level: number): string {
  if (level <= 5)  return 'Cosmic Initiate';
  if (level <= 10) return 'Astral Wanderer';
  if (level <= 20) return 'Realm Walker';
  if (level <= 30) return 'Void Sage';
  return 'Cosmic Master';
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const { data: session, status } = useSession();

  const { data: lbData, loading: lbLoading } = useQuery(GET_LEADERBOARD, {
    variables: { limit: 20 },
    skip: !session,
  });

  // GET_ME is already cached by Apollo from the Nexus page — zero extra network call in most cases
  const { data: meData } = useQuery(GET_ME, { skip: !session });

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (status === 'loading' || lbLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="neon-glow text-4xl mb-4">🏆</div>
          <p className="text-xl font-display">Loading Cosmic Rankings...</p>
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
            You must be signed in to view the leaderboard.
          </p>
          <Link href="/auth" className="btn-primary">SIGN IN</Link>
        </div>
      </div>
    );
  }

  // ── Data ─────────────────────────────────────────────────────────────────────
  const entries: any[]    = lbData?.getLeaderboard ?? [];
  const currentUserId     = meData?.me?.id ?? null;
  const myEntry           = entries.find((e) => e.user.id === currentUserId) ?? null;

  // Normalize XP bars relative to the top player
  const maxXP = entries.length > 0
    ? Math.max(...entries.map((e) => e.user.xp), 1)
    : 1;

  // Top 3 for podium
  const top3    = entries.slice(0, 3);
  const rest    = entries.slice(3);

  return (
    <div className="min-h-screen pb-32">
      <div className="container mx-auto px-4 py-8 max-w-3xl">

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <header className="text-center mb-10 fade-in">
          <div className="text-5xl mb-3 neon-glow">🏆</div>
          <h1 className="text-4xl md:text-5xl font-display neon-glow mb-2">
            COSMIC LEADERBOARD
          </h1>
          <p className="text-secondary">
            Top travelers across the multiverse • Top {entries.length} ranked
          </p>
        </header>

        {/* ── YOUR RANK CARD (if in top 20) ──────────────────────────────────── */}
        {myEntry && (
          <div
            className="glass-card p-5 mb-8 fade-in"
            style={{
              animationDelay: '0.05s',
              border: '2px solid #9D4EDD',
              boxShadow: '0 0 24px rgba(157,78,221,0.4)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl font-display" style={{ color: getRankDisplay(myEntry.rank).color, minWidth: '2.5rem', textAlign: 'center' }}>
                {getRankDisplay(myEntry.rank).symbol}
              </div>
              {myEntry.user.image ? (
                <img
                  src={myEntry.user.image}
                  alt={myEntry.user.name ?? 'You'}
                  width={48}
                  height={48}
                  className="rounded-full border-2"
                  style={{ borderColor: '#9D4EDD' }}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-2"
                  style={{ borderColor: '#9D4EDD', background: 'linear-gradient(135deg,#FF006E,#9D4EDD)' }}
                >
                  🌌
                </div>
              )}
              <div className="flex-1">
                <div className="font-display text-sm text-glow">
                  {myEntry.user.name ?? 'You'}
                  <span className="ml-2 text-xs text-secondary">— YOU</span>
                </div>
                <div className="text-xs text-muted">{getTravelerTitle(myEntry.user.level)}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-glow">LVL {myEntry.user.level}</div>
                <div className="text-xs text-secondary">{myEntry.user.xp.toLocaleString()} XP</div>
              </div>
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ─────────────────────────────────────────────────────── */}
        {entries.length === 0 && (
          <div className="glass-card p-12 text-center fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="text-5xl mb-4">🌌</div>
            <h3 className="text-2xl font-display mb-2">The Board Awaits</h3>
            <p className="text-secondary mb-6">
              No travelers have been ranked yet. Be the first to complete a trial and claim your place.
            </p>
            <Link href="/nexus">
              <button className="btn-primary">ENTER THE NEXUS →</button>
            </Link>
          </div>
        )}

        {/* ── TOP 3 PODIUM ────────────────────────────────────────────────────── */}
        {top3.length > 0 && (
          <div className="mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xl font-display mb-5 text-center text-glow">⚡ TOP TRAVELERS ⚡</h2>

            {/* Podium: reorder to 2-1-3 visually */}
            <div className="flex items-end justify-center gap-4">
              {/* 2nd place */}
              {top3[1] && (() => {
                const e = top3[1];
                const isMe = e.user.id === currentUserId;
                return (
                  <div className="flex flex-col items-center" style={{ order: 1 }}>
                    <div className="text-3xl mb-1">🥈</div>
                    {e.user.image ? (
                      <img src={e.user.image} alt={e.user.name} width={56} height={56}
                        className="rounded-full border-2 mb-2"
                        style={{ borderColor: isMe ? '#9D4EDD' : '#C0C0C0' }} />
                    ) : (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 mb-2"
                        style={{ borderColor: isMe ? '#9D4EDD' : '#C0C0C0', background: 'linear-gradient(135deg,#FF006E,#9D4EDD)' }}>
                        🌌
                      </div>
                    )}
                    <div className="font-display text-xs text-center max-w-20 truncate">
                      {e.user.name ?? '—'}{isMe && ' ✦'}
                    </div>
                    <div
                      className="w-24 mt-2 rounded-t-lg flex flex-col items-center justify-end pb-2"
                      style={{ height: '80px', background: 'linear-gradient(180deg,rgba(192,192,192,0.3),rgba(192,192,192,0.1))', border: '1px solid #C0C0C0' }}
                    >
                      <div className="font-display text-sm" style={{ color: '#C0C0C0' }}>LVL {e.user.level}</div>
                    </div>
                  </div>
                );
              })()}

              {/* 1st place */}
              {top3[0] && (() => {
                const e = top3[0];
                const isMe = e.user.id === currentUserId;
                return (
                  <div className="flex flex-col items-center" style={{ order: 2 }}>
                    <div className="text-4xl mb-1">🥇</div>
                    {e.user.image ? (
                      <img src={e.user.image} alt={e.user.name} width={72} height={72}
                        className="rounded-full border-4 mb-2"
                        style={{ borderColor: isMe ? '#9D4EDD' : '#FFD700', boxShadow: `0 0 20px ${isMe ? 'rgba(157,78,221,0.8)' : 'rgba(255,215,0,0.6)'}` }} />
                    ) : (
                      <div className="w-18 h-18 rounded-full flex items-center justify-center text-3xl border-4 mb-2"
                        style={{ width: '72px', height: '72px', borderColor: isMe ? '#9D4EDD' : '#FFD700', background: 'linear-gradient(135deg,#FF006E,#9D4EDD)' }}>
                        🌌
                      </div>
                    )}
                    <div className="font-display text-sm text-center max-w-24 truncate neon-glow">
                      {e.user.name ?? '—'}{isMe && ' ✦'}
                    </div>
                    <div
                      className="w-28 mt-2 rounded-t-lg flex flex-col items-center justify-end pb-2"
                      style={{ height: '110px', background: 'linear-gradient(180deg,rgba(255,215,0,0.25),rgba(255,215,0,0.05))', border: '1px solid #FFD700' }}
                    >
                      <div className="font-display text-sm text-glow">LVL {e.user.level}</div>
                      <div className="text-xs text-secondary">{e.user.xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                );
              })()}

              {/* 3rd place */}
              {top3[2] && (() => {
                const e = top3[2];
                const isMe = e.user.id === currentUserId;
                return (
                  <div className="flex flex-col items-center" style={{ order: 3 }}>
                    <div className="text-3xl mb-1">🥉</div>
                    {e.user.image ? (
                      <img src={e.user.image} alt={e.user.name} width={56} height={56}
                        className="rounded-full border-2 mb-2"
                        style={{ borderColor: isMe ? '#9D4EDD' : '#CD7F32' }} />
                    ) : (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 mb-2"
                        style={{ borderColor: isMe ? '#9D4EDD' : '#CD7F32', background: 'linear-gradient(135deg,#FF006E,#9D4EDD)' }}>
                        🌌
                      </div>
                    )}
                    <div className="font-display text-xs text-center max-w-20 truncate">
                      {e.user.name ?? '—'}{isMe && ' ✦'}
                    </div>
                    <div
                      className="w-24 mt-2 rounded-t-lg flex flex-col items-center justify-end pb-2"
                      style={{ height: '60px', background: 'linear-gradient(180deg,rgba(205,127,50,0.3),rgba(205,127,50,0.1))', border: '1px solid #CD7F32' }}
                    >
                      <div className="font-display text-sm" style={{ color: '#CD7F32' }}>LVL {e.user.level}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── FULL RANKINGS LIST ─────────────────────────────────────────────── */}
        {entries.length > 0 && (
          <div className="glass-card p-6 mb-8 fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-display mb-5 flex items-center gap-2">
              <span className="text-glow">📊</span> ALL RANKINGS
            </h2>
            <div className="space-y-3">
              {entries.map((entry, i) => {
                const isMe     = entry.user.id === currentUserId;
                const rankDisp = getRankDisplay(entry.rank);
                const xpBarW   = Math.max((entry.user.xp / maxXP) * 100, 2);

                return (
                  <div
                    key={entry.user.id}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all fade-in"
                    style={{
                      animationDelay: `${0.2 + i * 0.03}s`,
                      background: isMe
                        ? 'linear-gradient(135deg,rgba(157,78,221,0.2),rgba(255,0,110,0.1))'
                        : 'rgba(255,255,255,0.04)',
                      border: isMe
                        ? '2px solid rgba(157,78,221,0.7)'
                        : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {/* Rank */}
                    <div
                      className="text-center font-display flex-shrink-0"
                      style={{ width: '2.5rem', color: rankDisp.color, fontSize: entry.rank <= 3 ? '1.5rem' : '0.875rem' }}
                    >
                      {rankDisp.symbol}
                    </div>

                    {/* Avatar */}
                    {entry.user.image ? (
                      <img
                        src={entry.user.image}
                        alt={entry.user.name ?? 'Traveler'}
                        width={40}
                        height={40}
                        className="rounded-full border-2 flex-shrink-0"
                        style={{ borderColor: isMe ? '#9D4EDD' : 'rgba(255,255,255,0.15)' }}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 flex-shrink-0"
                        style={{ borderColor: isMe ? '#9D4EDD' : 'rgba(255,255,255,0.15)', background: 'linear-gradient(135deg,#FF006E,#9D4EDD)' }}
                      >
                        🌌
                      </div>
                    )}

                    {/* Name + title + XP bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-display text-sm truncate ${isMe ? 'text-glow' : ''}`}>
                          {entry.user.name ?? 'Unknown Traveler'}
                          {isMe && <span className="ml-1 text-xs" style={{ color: '#9D4EDD' }}>✦ YOU</span>}
                        </span>
                      </div>
                      <div className="text-xs text-muted mb-1">{getTravelerTitle(entry.user.level)}</div>
                      {/* XP bar relative to #1 */}
                      <div className="stat-bar" style={{ height: '4px' }}>
                        <div
                          className="stat-bar-fill"
                          style={{
                            width: `${xpBarW}%`,
                            background: isMe
                              ? 'linear-gradient(90deg,#9D4EDD,#FF006E)'
                              : 'linear-gradient(90deg,#00D4FF,#9D4EDD)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Level + XP */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-display text-sm text-glow">LVL {entry.user.level}</div>
                      <div className="text-xs text-secondary">{entry.user.xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FOOTER NAV ─────────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.4s' }}>
          <Link href="/nexus">
            <button className="btn-secondary">← BACK TO NEXUS</button>
          </Link>
          <Link href="/profile">
            <button className="btn-primary">MY PROFILE 👤</button>
          </Link>
        </div>

      </div>
    </div>
  );
}