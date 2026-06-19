'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { GET_LEADERBOARD, GET_ME } from '@/graphql/realms';
import '@/styles/realmShared.css';
import '@/styles/nexus.css';
import '@/styles/leaderboard.css';

function getRankDisplay(rank: number): { symbol: string; label: string; color: string } {
  if (rank === 1) return { symbol: 'I', label: 'First', color: '#DCBA5C' };
  if (rank === 2) return { symbol: 'II', label: 'Second', color: '#DCE8F2' };
  if (rank === 3) return { symbol: 'III', label: 'Third', color: '#F4AB63' };
  return { symbol: `${rank}`, label: `Rank ${rank}`, color: '#BCDFFF' };
}

function getTravelerTitle(level: number): string {
  if (level <= 5) return 'Cosmic Initiate';
  if (level <= 10) return 'Astral Wanderer';
  if (level <= 20) return 'Realm Walker';
  if (level <= 30) return 'Void Sage';
  return 'Cosmic Master';
}

function Avatar({
  image,
  name,
  isMe,
}: {
  image?: string | null;
  name?: string | null;
  isMe?: boolean;
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? 'Traveler'}
        width={44}
        height={44}
        className="h-11 w-11 rounded-full border object-cover shrink-0"
        sizes="44px"
        style={{
          borderColor: isMe ? 'rgba(220,186,92,0.55)' : 'rgba(255,255,255,0.14)',
        }}
      />
    );
  }

  return (
    <div
      className="h-11 w-11 rounded-full border bg-white/[0.04] grid place-items-center shrink-0 text-[#DCBA5C]"
      style={{
        borderColor: isMe ? 'rgba(220,186,92,0.55)' : 'rgba(255,255,255,0.14)',
      }}
    >
      ✦
    </div>
  );
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();

  const { data: lbData, loading: lbLoading } = useQuery(GET_LEADERBOARD, {
    variables: { limit: 20 },
    skip: !session,
  });

  const { data: meData } = useQuery(GET_ME, { skip: !session });

  if (status === 'loading' || lbLoading) {
    return (
      <div className="min-h-screen grid place-items-center p-6 nexus-shell">
        <div className="glass-card nexus-panel max-w-md text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full border border-white/15 grid place-items-center text-[#DCBA5C]">
            ✦
          </div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
            Loading Rankings
          </p>
          <h1 className="text-3xl font-display mb-3">Syncing Leaderboard</h1>
          <p className="text-secondary">
            Gathering traveler levels, XP totals, and ranked progression.
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
            Leaderboard Locked
          </p>

          <h1 className="text-3xl font-display mb-3">Sign in to view rankings</h1>

          <p className="text-secondary mb-6">
            Compare traveler level, XP, and progression across the Cosmic Multiverse.
          </p>

          <Link href="/auth" className="btn-primary">
            Open Cosmic Access
          </Link>
        </div>
      </div>
    );
  }

  const entries: any[] = lbData?.getLeaderboard ?? [];
  const currentUserId = meData?.me?.id ?? null;
  const myEntry = entries.find((entry) => entry.user.id === currentUserId) ?? null;

  const maxXP =
    entries.length > 0 ? Math.max(...entries.map((entry) => entry.user.xp), 1) : 1;

  const topEntries = entries.slice(0, 3);

  return (
    <div className="min-h-screen pb-32 nexus-shell leaderboard-shell">
      <div className="container mx-auto px-4 py-8 max-w-5xl nexus-container">
        <header className="text-center mb-8 fade-in nexus-hero">
          <p className="text-xs uppercase tracking-[0.24em] text-muted mb-3">
            Traveler Rankings
          </p>
          <h1 className="text-4xl md:text-5xl font-display mb-3 text-primary">
            Cosmic Leaderboard
          </h1>
          <p className="text-secondary max-w-2xl mx-auto">
            Ranked progression across level, XP, and realm advancement.
          </p>
        </header>

        {myEntry && (
          <section
            className="glass-card nexus-panel p-5 md:p-6 mb-6 fade-in"
            style={{
              borderColor: 'rgba(220,186,92,0.28)',
              boxShadow: '0 12px 34px rgba(220,186,92,0.06)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className="h-14 w-14 rounded-full border grid place-items-center font-display"
                  style={{
                    color: getRankDisplay(myEntry.rank).color,
                    borderColor: `${getRankDisplay(myEntry.rank).color}55`,
                    background: 'rgba(255,255,255,0.035)',
                  }}
                >
                  {getRankDisplay(myEntry.rank).symbol}
                </div>

                <Avatar
                  image={myEntry.user.image}
                  name={myEntry.user.name}
                  isMe
                />

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted mb-1">
                    Your Rank
                  </p>
                  <h2 className="font-display text-xl truncate text-primary">
                    {myEntry.user.name ?? 'You'}
                  </h2>
                  <p className="text-sm text-muted">
                    {getTravelerTitle(myEntry.user.level)}
                  </p>
                </div>
              </div>

              <div className="md:text-right">
                <p className="font-display text-glow">LVL {myEntry.user.level}</p>
                <p className="text-sm text-secondary">
                  {myEntry.user.xp.toLocaleString()} XP
                </p>
              </div>
            </div>
          </section>
        )}

        {entries.length === 0 ? (
          <section className="glass-card nexus-panel p-8 md:p-12 text-center fade-in">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full border border-white/15 grid place-items-center text-[#DCBA5C]">
              ✦
            </div>
            <h2 className="text-3xl font-display mb-3">The Board Awaits</h2>
            <p className="text-secondary mb-6 max-w-xl mx-auto">
              No travelers have been ranked yet. Complete a trial, earn XP, and claim your place.
            </p>
            <Link href="/nexus">
              <button className="btn-primary">Enter the Nexus</button>
            </Link>
          </section>
        ) : (
          <>
            <section className="mb-6 fade-in">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                    Top Travelers
                  </p>
                  <h2 className="text-2xl md:text-3xl font-display text-primary">
                    Current Leaders
                  </h2>
                </div>
                <p className="text-sm text-secondary">
                  Top {entries.length} ranked
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topEntries.map((entry) => {
                  const isMe = entry.user.id === currentUserId;
                  const rankDisplay = getRankDisplay(entry.rank);

                  return (
                    <div
                      key={entry.user.id}
                      className="glass-card nexus-panel p-5 text-center"
                      style={{
                        borderColor: isMe
                          ? 'rgba(220,186,92,0.32)'
                          : 'rgba(255,255,255,0.14)',
                      }}
                    >
                      <div
                        className="mx-auto mb-4 h-14 w-14 rounded-full border grid place-items-center font-display text-lg"
                        style={{
                          color: rankDisplay.color,
                          borderColor: `${rankDisplay.color}55`,
                          background: 'rgba(255,255,255,0.035)',
                        }}
                      >
                        {rankDisplay.symbol}
                      </div>

                      <div className="flex justify-center mb-3">
                        <Avatar
                          image={entry.user.image}
                          name={entry.user.name}
                          isMe={isMe}
                        />
                      </div>

                      <p className="font-display text-primary truncate">
                        {entry.user.name ?? 'Unknown Traveler'}
                      </p>
                      <p className="text-xs text-muted mb-3">
                        {getTravelerTitle(entry.user.level)}
                      </p>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                        <p className="font-display text-glow">LVL {entry.user.level}</p>
                        <p className="text-xs text-secondary">
                          {entry.user.xp.toLocaleString()} XP
                        </p>
                      </div>

                      {isMe && (
                        <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#DCBA5C]">
                          You
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="glass-card nexus-panel p-5 md:p-7 fade-in">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">
                    Full Ranking
                  </p>
                  <h2 className="text-2xl md:text-3xl font-display text-primary">
                    All Travelers
                  </h2>
                </div>
                <Link href="/profile" className="text-glow text-sm hover:opacity-80">
                  View Profile →
                </Link>
              </div>

              <div className="space-y-3">
                {entries.map((entry, index) => {
                  const isMe = entry.user.id === currentUserId;
                  const rankDisplay = getRankDisplay(entry.rank);
                  const xpBarWidth = Math.max((entry.user.xp / maxXP) * 100, 2);

                  return (
                    <div
                      key={entry.user.id}
                      className="rounded-2xl border p-4 fade-in"
                      style={{
                        animationDelay: `${0.05 + index * 0.02}s`,
                        background: isMe
                          ? 'linear-gradient(135deg, rgba(220,186,92,0.10), rgba(255,255,255,0.035))'
                          : 'rgba(255,255,255,0.035)',
                        borderColor: isMe
                          ? 'rgba(220,186,92,0.34)'
                          : 'rgba(255,255,255,0.10)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full border grid place-items-center font-display shrink-0"
                          style={{
                            color: rankDisplay.color,
                            borderColor: `${rankDisplay.color}55`,
                          }}
                        >
                          {rankDisplay.symbol}
                        </div>

                        <Avatar
                          image={entry.user.image}
                          name={entry.user.name}
                          isMe={isMe}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 min-w-0">
                            <p className="font-display text-sm truncate text-primary">
                              {entry.user.name ?? 'Unknown Traveler'}
                            </p>
                            {isMe && (
                              <span className="text-[10px] uppercase tracking-[0.12em] text-[#DCBA5C] shrink-0">
                                You
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-muted mb-2">
                            {getTravelerTitle(entry.user.level)}
                          </p>

                          <div className="stat-bar" style={{ height: '4px' }}>
                            <div
                              className="stat-bar-fill"
                              style={{
                                width: `${xpBarWidth}%`,
                                background: isMe
                                  ? 'linear-gradient(90deg, rgba(220,186,92,0.92), #38BDF8)'
                                  : undefined,
                              }}
                            />
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-display text-glow">LVL {entry.user.level}</p>
                          <p className="text-xs text-secondary">
                            {entry.user.xp.toLocaleString()} XP
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}