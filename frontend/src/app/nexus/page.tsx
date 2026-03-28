'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { getTodayMoonPhase, getRealmMoonAlignment } from '@/lib/moonPhases';
import RealmBackground from '@/components/realm/RealmBackground';
import { GET_ME, LOG_DAILY_LOGIN } from '@/graphql/realms';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { MUSIC_REGISTRY } from '@/lib/musicRegistry';
import { REALM_STATE_MAP, type ExperienceMode, type RealmId } from '@/lib/realmStateMap';
import { REALM_RESULT_CONTENT } from '@/lib/realmResultContent';
import '@/styles/realmShared.css';
import '@/styles/nexus.css';

interface RealmPortalData {
  id: string;
  name: string;
  number: string;
  icon: string;
  status: 'unlocked' | 'locked' | 'current';
  progress: number;
  description: string;
  unlockRequirement?: string;
}

interface StoredRealmGuidance {
  realmId: RealmId;
  mode: ExperienceMode;
  recommendedTrack: string;
  reflectionPrompt: string;
  savedAt?: string;
}

const REALM_META = [
  {
    id: '303',
    name: 'FRACTURED FRONTIER',
    number: '303',
    icon: '🌪️',
    description: 'Chaos & Creation',
    unlockRequirement: undefined,
  },
  {
    id: '202',
    name: 'THE VEIL',
    number: '202',
    icon: '🕯️',
    description: 'Dreams & Longing',
    unlockRequirement: 'Complete Trials in Fractured Frontier',
  },
  {
    id: '101',
    name: 'MOONLIT ROADS',
    number: '101',
    icon: '🌙',
    description: 'Reflection & Shadows',
    unlockRequirement: 'Complete Trials in The Veil',
  },
  {
    id: '55',
    name: 'SKYBOUND CITY',
    number: '55',
    icon: '⛰️',
    description: 'Power & Manifestation',
    unlockRequirement: 'Complete Trials in Moonlit Roads',
  },
  {
    id: '44',
    name: 'ASTRAL BAZAAR',
    number: '44',
    icon: '🛍️',
    description: 'Hustle & Wisdom',
    unlockRequirement: 'Complete Trials in Skybound City',
  },
  {
    id: '0',
    name: 'INTERSIDDHI',
    number: '0',
    icon: '🌌',
    description: 'Source & Transcendence',
    unlockRequirement: 'Complete Trials in Astral Bazaar',
  },
];

function getModeLabel(mode: ExperienceMode) {
  if (mode === 'stay') return 'Stay with this state';
  if (mode === 'move-through') return 'Move through this state';
  return 'Shift toward another state';
}

export default function CosmicNexusHub() {
  const { data: session, status } = useSession();
  const [moonPhase, setMoonPhase] = useState<any>(null);
  const [realmAlignment, setRealmAlignment] = useState<any>(null);
  const [storedGuidance, setStoredGuidance] = useState<StoredRealmGuidance | null>(null);

  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  const [expandedRealms, setExpandedRealms] = useState<Record<number, boolean>>({
    303: true,
  });
  const [showRealmMap, setShowRealmMap] = useState(false);

  const { data: userData, loading: userLoading } = useQuery(GET_ME, {
    skip: !session,
  });

  const [logDailyLogin] = useMutation(LOG_DAILY_LOGIN);

  useEffect(() => {
    if (session) {
      logDailyLogin().catch((err) =>
        console.warn('Daily login mutation skipped:', err.message)
      );
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const phase = getTodayMoonPhase();
    const alignment = getRealmMoonAlignment(phase.phase);
    setMoonPhase(phase);
    setRealmAlignment(alignment);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('cosmic:lastRealmAlignment');
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredRealmGuidance;
      if (parsed?.realmId !== undefined) {
        setStoredGuidance(parsed);
      }
    } catch (error) {
      console.warn('Failed to load stored realm guidance:', error);
    }
  }, []);

  const user = userData?.me;
  const userLevel = user?.level ?? 1;
  const userXP = user?.xp ?? 0;
  const xpToNext = user?.xpToNextLevel ?? 100;
  const safeXpToNext = Math.max(xpToNext, 1);
  const xpPercent = Math.min((userXP / safeXpToNext) * 100, 100);
  const currentStreak = user?.streaks?.currentStreak ?? 0;
  const unlockedRealms: number[] = user?.unlockedRealms ?? [303];

  const currentRealmName = (() => {
    const meta = REALM_META.find((r) => parseInt(r.id) === user?.currentRealm);
    return meta?.name ?? 'None';
  })();

  const getRealmProgress = (realmId: number): number => {
    const trials =
      user?.completedTrials?.filter((t: any) => t.realmId === realmId) ?? [];
    const completed = trials.filter((t: any) => t.isComplete).length;
    return Math.floor((completed / 3) * 100);
  };

  const isRealmUnlocked = (realmId: number): boolean =>
    unlockedRealms.includes(realmId);

  const realms: RealmPortalData[] = REALM_META.map((meta) => {
    const realmId = parseInt(meta.id);
    return {
      ...meta,
      status: isRealmUnlocked(realmId) ? 'unlocked' : 'locked',
      progress: getRealmProgress(realmId),
    };
  });

  const unlockedTracks = MUSIC_REGISTRY.filter((track) =>
    unlockedRealms.includes(track.realmId)
  );

  const groupedTracks = realms
    .filter((realm) => realm.status === 'unlocked')
    .map((realm) => {
      const realmId = parseInt(realm.id);
      return {
        ...realm,
        tracks: unlockedTracks.filter((track) => track.realmId === realmId),
      };
    })
    .filter((realmGroup) => realmGroup.tracks.length > 0);

  const toggleRealmExpanded = (realmId: number) => {
    setExpandedRealms((prev) => ({
      ...prev,
      [realmId]: !prev[realmId],
    }));
  };

  const guidanceRealmId = storedGuidance?.realmId ?? null;
  const guidanceRealm = guidanceRealmId !== null ? REALM_STATE_MAP[guidanceRealmId] : null;
  const guidanceContent =
    guidanceRealmId !== null ? REALM_RESULT_CONTENT[guidanceRealmId] : null;

  const guidanceTrack = useMemo(() => {
    if (!guidanceRealmId || !guidanceContent) return null;
    return (
      MUSIC_REGISTRY.find(
        (track) =>
          track.realmId === guidanceRealmId &&
          track.trackTitle === guidanceContent.recommendedTrack
      ) ?? null
    );
  }, [guidanceRealmId, guidanceContent]);

  if (status === 'loading' || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="neon-glow text-4xl mb-4">🌌</div>
          <p className="text-xl">Loading The Nexus...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-12 max-w-md text-center">
          <h1 className="text-4xl font-display neon-glow mb-4">
            🌌 THE COSMIC NEXUS 🌌
          </h1>
          <p className="text-lg text-secondary mb-8">
            You must sign in to enter the multiverse.
          </p>
          <button onClick={() => signIn('github')} className="btn-primary">
            ENTER THE NEXUS
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <RealmBackground
        videoSrc="/nexus-cockpit.mp4"
        realmName="The Cosmic Nexus"
        overlayOpacity={0.3}
      />

      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <header className="text-center mb-8 fade-in">
            <h1 className="text-5xl md:text-6xl font-display neon-glow mb-3">
              🌌 THE COSMIC NEXUS 🌌
            </h1>
            <p className="text-lg text-secondary">
              A music-based emotional navigation system
            </p>
          </header>

          {/* Compact identity */}
          <div className="glass-card p-5 mb-4 fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="level-badge">
                <div className="flex flex-col items-center">
                  <span className="text-xs opacity-70">LVL</span>
                  <span>{userLevel}</span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-display mb-2">
                  TRAVELER: {session.user?.name || 'Unknown'}
                </h2>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Experience</span>
                    <span className="text-stats">
                      {userXP} / {safeXpToNext} XP
                    </span>
                  </div>
                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted">
                  Current Realm: <span className="text-primary">{currentRealmName}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="glass-card p-3">
                  <div className="text-xl font-display text-glow">{currentStreak}</div>
                  <div className="text-xs text-muted">Streak</div>
                </div>
                <div className="glass-card p-3">
                  <div className="text-xl font-display text-glow">
                    {user?.completedTrials?.filter((t: any) => t.isComplete).length ?? 0}
                  </div>
                  <div className="text-xs text-muted">Siddhis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Compact top strip */}
          <div className="glass-card p-3 mb-4 fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm">
              <div className="flex items-center gap-3">
                {moonPhase && (
                  <>
                    <span className="text-2xl">{moonPhase.icon}</span>
                    <span className="text-secondary">{moonPhase.phase}</span>
                  </>
                )}
              </div>

              <div className="text-muted">
                {realmAlignment && (
                  <>
                    Aligned Realm:{' '}
                    <span className="text-glow font-medium">
                      {realmAlignment.primaryRealm}
                    </span>
                  </>
                )}
              </div>

              <div className="md:ml-auto">
                <Link href="/find-your-realm" className="text-glow hover:opacity-80 transition-opacity">
                  Find Your Realm →
                </Link>
              </div>
            </div>
          </div>

          {/* Guidance + today's realm in one compact row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
            <Link
              href="/find-your-realm"
              className="block fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <div
                className="glass-card p-5 h-full cursor-pointer transition-all hover:scale-[1.01] hover:border-color-electric-blue"
                style={{ boxShadow: '0 8px 28px rgba(120, 180, 255, 0.10)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl shrink-0">✨</div>

                  <div className="flex-1">
                    <p className="text-xs text-secondary uppercase tracking-[0.18em] mb-2">
                      Guided Entry
                    </p>
                    <h3 className="text-2xl font-display mb-2 text-glow">
                      Find Your Realm
                    </h3>
                    <p className="text-secondary text-sm mb-3">
                      Match your current inner state to the right realm and soundtrack.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {['chaos', 'desire', 'reflection', 'power', 'value', 'alignment'].map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 border border-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <div className="glass-card p-5 fade-in" style={{ animationDelay: '0.25s' }}>
              {guidanceRealm && guidanceContent ? (
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${guidanceRealm.color}22, ${guidanceRealm.color}55)`,
                      border: `1px solid ${guidanceRealm.color}55`,
                    }}
                  >
                    {guidanceRealm.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-secondary uppercase tracking-[0.18em] mb-2">
                      Today&apos;s Realm
                    </p>
                    <h3
                      className="text-2xl font-display mb-2 truncate"
                      style={{ color: guidanceRealm.color }}
                    >
                      {guidanceRealm.realmName}
                    </h3>
                    <p className="text-sm text-secondary mb-3 line-clamp-3">
                      {guidanceContent.whyRealmFits}
                    </p>

                    <div className="text-xs text-muted mb-3">
                      Track: <span className="text-secondary">{guidanceContent.recommendedTrack}</span> • Mode:{' '}
                      <span className="text-secondary">
                        {getModeLabel(storedGuidance?.mode || guidanceContent.recommendedMode)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {guidanceTrack && (
                        <button
                          className="btn-secondary"
                          onClick={() => playTrack(guidanceTrack)}
                        >
                          {currentTrack?.id === guidanceTrack.id && isPlaying
                            ? 'Playing'
                            : '▶ Play'}
                        </button>
                      )}

                      <Link href={guidanceRealm.route}>
                        <button className="btn-primary">
                          Enter →
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-secondary uppercase tracking-[0.18em] mb-2">
                    Today&apos;s Realm
                  </p>
                  <h3 className="text-2xl font-display mb-2 text-glow">
                    No guidance saved yet
                  </h3>
                  <p className="text-sm text-secondary mb-3">
                    Take realm alignment to get a suggested soundtrack, prompt, and realm.
                  </p>
                  <Link href="/find-your-realm">
                    <button className="btn-primary">Find My Realm →</button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* MUSIC FIRST */}
          <div className="glass-card p-6 mb-5 fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-3xl font-display">🎵 SOUNDTRACKS</h2>
                <p className="text-secondary text-sm mt-1">
                  Start here. Play the music first, then enter the realm if it fits.
                </p>
              </div>
            </div>

            {groupedTracks.length > 0 ? (
              <div className="space-y-4">
                {groupedTracks.map((realmGroup) => {
                  const realmId = parseInt(realmGroup.id);
                  const isExpanded = !!expandedRealms[realmId];
                  const realmTracks = realmGroup.tracks;
                  const accentColor = realmTracks[0]?.realmColor || '#7FDBFF';

                  return (
                    <div
                      key={realmGroup.id}
                      className="rounded-2xl border overflow-hidden"
                      style={{
                        borderColor: `${accentColor}55`,
                        background: 'rgba(255,255,255,0.03)',
                        boxShadow: `0 6px 24px ${accentColor}15`,
                      }}
                    >
                      <button
                        onClick={() => toggleRealmExpanded(realmId)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between transition-all hover:bg-white/5"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}66)`,
                            }}
                          >
                            {realmGroup.icon}
                          </div>

                          <div className="min-w-0">
                            <p
                              className="font-display text-lg truncate"
                              style={{ color: accentColor }}
                            >
                              {realmGroup.name}
                            </p>
                            <p className="text-sm text-secondary truncate">
                              {realmTracks.length} track{realmTracks.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <div className="text-xl text-white/70">
                          {isExpanded ? '▾' : '▸'}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5">
                          <div className="space-y-3">
                            {realmTracks.map((track) => {
                              const isCurrent = currentTrack?.id === track.id;

                              return (
                                <div
                                  key={track.id}
                                  className="quest-card"
                                  style={{
                                    borderColor: isCurrent ? `${track.realmColor}66` : undefined,
                                    boxShadow: isCurrent
                                      ? `0 0 18px ${track.realmColor}22`
                                      : undefined,
                                  }}
                                >
                                  <div className="flex items-center gap-4">
                                    <div
                                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                                      style={{
                                        background: `linear-gradient(135deg, ${track.realmColor}33, ${track.realmColor}66)`,
                                      }}
                                    >
                                      🎵
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p
                                        className="font-display truncate"
                                        style={{ color: track.realmColor }}
                                      >
                                        {track.trackTitle}
                                      </p>
                                      <p className="text-sm text-secondary truncate">
                                        {track.artist} • {track.realmName}
                                      </p>
                                    </div>

                                    <button
                                      className="btn-secondary"
                                      onClick={() => playTrack(track)}
                                    >
                                      {isCurrent && isPlaying ? 'Playing' : 'Play'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="quest-card opacity-70">
                <p className="text-sm text-muted text-center">
                  No realm tracks unlocked yet.
                </p>
              </div>
            )}
          </div>

          {/* Optional map lower down */}
          <div className="glass-card p-5 mb-4 fade-in" style={{ animationDelay: '0.35s' }}>
            <button
              onClick={() => setShowRealmMap((prev) => !prev)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h2 className="text-2xl font-display">🗺️ EXPLORE THE REALMS</h2>
                <p className="text-sm text-muted mt-1">
                  Direct realm entry and progression map
                </p>
              </div>
              <div className="text-xl text-white/70">
                {showRealmMap ? '▾' : '▸'}
              </div>
            </button>

            {showRealmMap && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {realms.map((realm, index) => (
                  <div
                    key={realm.id}
                    className={`realm-portal ${realm.status} fade-in`}
                    style={{ animationDelay: `${0.36 + index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{realm.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-stats text-glow">
                            [{realm.number}]
                          </span>
                          <h3 className="text-xl font-display">{realm.name}</h3>
                        </div>
                        <p className="text-sm text-secondary mb-3">
                          {realm.description}
                        </p>

                        {realm.status === 'unlocked' ? (
                          <>
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{realm.progress}%</span>
                              </div>
                              <div className="stat-bar">
                                <div
                                  className="stat-bar-fill"
                                  style={{ width: `${realm.progress}%` }}
                                />
                              </div>
                            </div>
                            <Link href={`/realms/${realm.id}`}>
                              <button className="btn-primary w-full">
                                ENTER REALM →
                              </button>
                            </Link>
                          </>
                        ) : (
                          <div className="text-sm text-muted italic">
                            🔒 {realm.unlockRequirement}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}