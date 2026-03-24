'use client';

import { useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import TrialPuzzle from '@/components/realm/TrialPuzzle';
import '@/styles/realmShared.css';
import '@/styles/realm44.css';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ME,
  COMPLETE_TRIAL_STEP,
  START_TRIAL,
  VISIT_LOCATION,
  UNLOCK_REALM,
} from '@/graphql/realms';
import { REALM_44_PUZZLES } from '@/lib/realmPuzzles';

/**
 * 🛍️ REALM 44: ASTRAL BAZAAR
 * Theme: Hustle & Wisdom
 * Trial IDs aligned with realmPuzzles.ts:
 *   trial-barter-of-truth — location (merchant-quarter) + 2 puzzles
 *   trial-discernment     — location (gamblers-den)     + 2 puzzles
 *   trial-sacred-exchange — 3 puzzles (no location gate)
 * Unlocks: Realm 0 (InterSiddhi)
 *
 * NOTE: NEXT_REALM_ID = 0. Array.includes(0) is safe since unlockedRealms
 * is typed as number[] on the backend.
 */

const REALM_ID      = 44;
const NEXT_REALM_ID = 0;

export default function Realm44() {
  const { data: session, status } = useSession();

  const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME);
  const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
  const [startTrial]        = useMutation(START_TRIAL);
  const [visitLocation]     = useMutation(VISIT_LOCATION);
  const [unlockNextRealm]   = useMutation(UNLOCK_REALM);

  const hasUnlockedRef      = useRef(false);
  const locationsSectionRef  = useRef<HTMLDivElement>(null);

  // ── Derived data ───────────────────────────────────────────────────────
  const user         = userData?.me;
  const userLevel    = user?.level    ?? 1;
  const userXP       = user?.xp       ?? 0;
  const xpToNext     = user?.xpToNextLevel ?? 100;
  const safeXpToNext = Math.max(xpToNext, 1);
  const xpPercent    = Math.min((userXP / safeXpToNext) * 100, 100);

  const realmTrials         = user?.completedTrials?.filter((t: any) => t.realmId === REALM_ID) ?? [];
  const completedTrialsCount = realmTrials.filter((t: any) => t.isComplete).length;
  const realmProgress       = Math.floor((completedTrialsCount / 3) * 100);

  const getTrial   = (trialId: string) => realmTrials.find((t: any) => t.trialId === trialId);
  const realmLocs  = user?.visitedLocations?.filter((l: any) => l.realmId === REALM_ID) ?? [];
  const hasVisited = (locationId: string) => realmLocs.some((l: any) => l.locationId === locationId);

  // ── Auto-unlock Realm 0 ────────────────────────────────────────────────
  useEffect(() => {
    if (completedTrialsCount >= 3 && !hasUnlockedRef.current && user) {
      const alreadyUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);
      if (!alreadyUnlocked) {
        hasUnlockedRef.current = true;
        unlockNextRealm({ variables: { realmId: NEXT_REALM_ID } })
          .then(() => {
            alert('🔓 REALM UNLOCKED! InterSiddhi (Realm 0) — The Final Realm is now accessible!');
            refetch();
          })
          .catch((err) => console.error('Unlock error:', err));
      } else {
        hasUnlockedRef.current = true;
      }
    }
  }, [completedTrialsCount, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleStartTrial = async (trialId: string, trialName: string) => {
    try {
      await startTrial({ variables: { realmId: REALM_ID, trialId, trialName } });
      await refetch();
    } catch (e: any) {
      console.error(e);
      alert('Error starting trial: ' + (e.message ?? 'Unknown error'));
    }
  };

  const claimTrialStep = async (trialId: string, trialName: string) => {
    try {
      if (!getTrial(trialId)) {
        await startTrial({ variables: { realmId: REALM_ID, trialId, trialName } });
      }
      const result = await completeTrialStep({ variables: { realmId: REALM_ID, trialId } });
      alert(result.data.completeTrialStep.message);
      await refetch();
    } catch (e: any) {
      console.error(e);
      alert('Error: ' + (e.message ?? 'Something went wrong'));
    }
  };

  const handleLocationVisit = async (locationId: string, locationName: string) => {
    try {
      const result = await visitLocation({
        variables: { realmId: REALM_ID, locationId, locationName },
      });
      alert(result.data.visitLocation.message);
      await refetch();
    } catch (e: any) {
      console.error(e);
      alert('Error: ' + (e.message ?? 'Something went wrong'));
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────
  if (status === 'loading' || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="neon-glow text-4xl mb-4">🛍️</div>
          <p className="text-xl">Entering The Astral Bazaar...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-12 max-w-md text-center">
          <h1 className="text-4xl font-display neon-glow mb-4">🔒 ACCESS DENIED</h1>
          <p className="text-lg text-secondary mb-8">You must be logged in to enter this realm.</p>
          <Link href="/auth" className="btn-primary">SIGN IN</Link>
        </div>
      </div>
    );
  }

  const trial1 = getTrial('trial-barter-of-truth');
  const trial2 = getTrial('trial-discernment');
  const trial3 = getTrial('trial-sacred-exchange');

  return (
    <>
      <RealmBackground
        videoSrc="/astral-bazaar_CityScape1.mp4"
        realmName="Astral Bazaar"
        overlayOpacity={0.45}
      />

      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8 max-w-6xl">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <header className="text-center mb-12 fade-in">
            <div className="text-6xl mb-4 neon-glow">🛍️</div>
            <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-44-title">
              ASTRAL BAZAAR
            </h1>
            <p className="text-xl text-secondary mb-2">[ REALM 44 ]</p>
            <p className="text-lg text-muted">Hustle &amp; Wisdom • Where Everything Has Its Price</p>
            <div className="mt-6 flex justify-center items-center gap-4">
              <div className="level-badge">LVL {userLevel}</div>
              <div className="flex-1 max-w-xs">
                <div className="stat-bar">
                  <div className="stat-bar-fill" style={{ width: `${xpPercent}%` }} />
                </div>
                <p className="text-sm text-secondary mt-1">{userXP} / {safeXpToNext} XP</p>
              </div>
            </div>
          </header>

          {/* ── Realm description ───────────────────────────────────────── */}
          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-display mb-4">💰 THE COSMIC MARKETPLACE 💰</h2>
            <p className="text-lg text-secondary mb-4">
              The Astral Bazaar is an infinite market outside linear time where souls trade knowledge,
              memories, and power. This is the domain of merchants, tricksters, and those who understand
              that everything can be negotiated — but not everything should be.
            </p>
            <p className="text-secondary mb-6">
              Here you develop <strong>Sacred Discernment</strong>: the ability to recognise true value,
              to exchange with integrity, and to master the art of the sacred deal.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow realm-44-glow">{realmProgress}%</div>
                <div className="text-xs text-muted">Progress</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow">{completedTrialsCount} / 3</div>
                <div className="text-xs text-muted">Trials Complete</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow">
                  {user?.completedTrials?.filter((t: any) => t.isComplete).length ?? 0}
                </div>
                <div className="text-xs text-muted">Siddhis</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow">
                  {completedTrialsCount >= 3 ? '🔓 Unlocked' : 'Locked'}
                </div>
                <div className="text-xs text-muted">Next Realm</div>
              </div>
            </div>
          </div>

          {/* ── Trials ──────────────────────────────────────────────────── */}
          <div className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">🎯</span> REALM TRIALS <span className="text-glow">🎯</span>
            </h2>
            <div className="space-y-6">

              {/* ── Trial 1: Barter of Truth (location + 2 puzzles) ─────── */}
              <div className="quest-card fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⏳</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of the Barter of Truth</h3>
                    <p className="text-sm text-secondary mb-3">
                      Learn what truth costs. Know what should never be traded away.
                    </p>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{trial1?.stepsCompleted ?? 0} / 3 Steps</span>
                      </div>
                      <div className="stat-bar">
                        <div
                          className="stat-bar-fill realm-44-bar"
                          style={{ width: `${((trial1?.stepsCompleted ?? 0) / 3) * 100}%` }}
                        />
                      </div>
                    </div>

                    {trial1?.isComplete ? (
                      <div className="text-green-400 font-bold">✓ COMPLETE</div>

                    ) : !trial1 ? (
                      <button
                        className="btn-primary"
                        onClick={() =>
                          handleStartTrial('trial-barter-of-truth', 'Trial of the Barter of Truth')
                        }
                      >
                        BEGIN TRIAL →
                      </button>

                    ) : trial1.stepsCompleted === 0 && !hasVisited('merchant-quarter') ? (
                      <>
                        <p className="text-sm text-muted italic mb-3">
                          📍 Visit <strong>The Merchant Quarter</strong> below to unlock Step 1.
                        </p>
                        <button
                          className="btn-secondary"
                          onClick={() =>
                            locationsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                          }
                        >
                          GO TO LOCATIONS ↓
                        </button>
                      </>

                    ) : trial1.stepsCompleted === 0 ? (
                      <button
                        className="btn-primary"
                        onClick={() =>
                          claimTrialStep('trial-barter-of-truth', 'Trial of the Barter of Truth')
                        }
                      >
                        CLAIM STEP (+XP)
                      </button>

                    ) : REALM_44_PUZZLES['trial-barter-of-truth']?.steps[trial1.stepsCompleted - 1] ? (
                      <TrialPuzzle
                        key={`trial-barter-of-truth-${trial1.stepsCompleted}`}
                        puzzle={
                          REALM_44_PUZZLES['trial-barter-of-truth'].steps[trial1.stepsCompleted - 1]
                        }
                        onSolved={() =>
                          claimTrialStep('trial-barter-of-truth', 'Trial of the Barter of Truth')
                        }
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* ── Trial 2: Discernment (location + 2 puzzles) ─────────── */}
              <div
                className={`quest-card fade-in ${!trial1?.isComplete ? 'opacity-50' : ''}`}
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔮</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Discernment</h3>

                    {!trial1?.isComplete ? (
                      <p className="text-sm text-muted italic">
                        🔒 Complete Trial of the Barter of Truth to unlock
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Glitter and gold look the same to the untrained eye. Learn to see the difference.
                        </p>
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{trial2?.stepsCompleted ?? 0} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div
                              className="stat-bar-fill realm-44-bar"
                              style={{ width: `${((trial2?.stepsCompleted ?? 0) / 3) * 100}%` }}
                            />
                          </div>
                        </div>

                        {trial2?.isComplete ? (
                          <div className="text-green-400 font-bold">✓ COMPLETE</div>

                        ) : !trial2 ? (
                          <button
                            className="btn-primary"
                            onClick={() =>
                              handleStartTrial('trial-discernment', 'Trial of Discernment')
                            }
                          >
                            BEGIN TRIAL →
                          </button>

                        ) : trial2.stepsCompleted === 0 && !hasVisited('gamblers-den') ? (
                          <>
                            <p className="text-sm text-muted italic mb-3">
                              📍 Visit <strong>The Gambler's Den</strong> below to unlock Step 1.
                            </p>
                            <button
                              className="btn-secondary"
                              onClick={() =>
                                locationsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                              }
                            >
                              GO TO LOCATIONS ↓
                            </button>
                          </>

                        ) : trial2.stepsCompleted === 0 ? (
                          <button
                            className="btn-primary"
                            onClick={() =>
                              claimTrialStep('trial-discernment', 'Trial of Discernment')
                            }
                          >
                            CLAIM STEP (+XP)
                          </button>

                        ) : REALM_44_PUZZLES['trial-discernment']?.steps[trial2.stepsCompleted - 1] ? (
                          <TrialPuzzle
                            key={`trial-discernment-${trial2.stepsCompleted}`}
                            puzzle={
                              REALM_44_PUZZLES['trial-discernment'].steps[trial2.stepsCompleted - 1]
                            }
                            onSolved={() =>
                              claimTrialStep('trial-discernment', 'Trial of Discernment')
                            }
                          />
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Trial 3: Sacred Exchange (3 puzzles, no location) ─── */}
              <div
                className={`quest-card fade-in ${!trial2?.isComplete ? 'opacity-50' : ''}`}
                style={{ animationDelay: '0.4s' }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">♾️</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Sacred Exchange</h3>

                    {!trial2?.isComplete ? (
                      <p className="text-sm text-muted italic">
                        🔒 Complete Trial of Discernment to unlock
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          A sacred exchange leaves both sides more whole. Master the art of giving
                          and receiving in perfect integrity.
                        </p>
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{trial3?.stepsCompleted ?? 0} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div
                              className="stat-bar-fill realm-44-bar"
                              style={{ width: `${((trial3?.stepsCompleted ?? 0) / 3) * 100}%` }}
                            />
                          </div>
                        </div>

                        {trial3?.isComplete ? (
                          <div className="text-green-400 font-bold">✓ COMPLETE</div>

                        ) : !trial3 ? (
                          <button
                            className="btn-primary"
                            onClick={() =>
                              handleStartTrial('trial-sacred-exchange', 'Trial of Sacred Exchange')
                            }
                          >
                            BEGIN TRIAL →
                          </button>

                        ) : REALM_44_PUZZLES['trial-sacred-exchange']?.steps[trial3.stepsCompleted] ? (
                          <TrialPuzzle
                            key={`trial-sacred-exchange-${trial3.stepsCompleted}`}
                            puzzle={
                              REALM_44_PUZZLES['trial-sacred-exchange'].steps[trial3.stepsCompleted]
                            }
                            onSolved={() =>
                              claimTrialStep('trial-sacred-exchange', 'Trial of Sacred Exchange')
                            }
                          />
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Locations ───────────────────────────────────────────────── */}
          <div ref={locationsSectionRef} id="locations-section" className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">📍</span> LOCATIONS <span className="text-glow">📍</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="realm-portal unlocked fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏪</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Merchant Quarter</h3>
                    <p className="text-sm text-secondary mb-1">
                      Endless stalls selling memories, skills, and impossible artefacts.
                    </p>
                    {!hasVisited('merchant-quarter') && (
                      <p className="text-xs text-glow mb-3">
                        ⚠️ Required for Trial of the Barter of Truth — Step 1
                      </p>
                    )}
                    <button
                      className="btn-secondary w-full"
                      onClick={() =>
                        handleLocationVisit('merchant-quarter', 'The Merchant Quarter')
                      }
                      disabled={hasVisited('merchant-quarter')}
                    >
                      {hasVisited('merchant-quarter') ? '✅ EXPLORED' : 'EXPLORE →'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="realm-portal unlocked fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🎲</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Gambler's Den</h3>
                    <p className="text-sm text-secondary mb-1">
                      Where fortunes shift with every roll and fate bends to the bold.
                    </p>
                    {!hasVisited('gamblers-den') && (
                      <p className="text-xs text-glow mb-3">
                        ⚠️ Required for Trial of Discernment — Step 1
                      </p>
                    )}
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('gamblers-den', "The Gambler's Den")}
                      disabled={hasVisited('gamblers-den')}
                    >
                      {hasVisited('gamblers-den') ? '✅ EXPLORED' : 'EXPLORE →'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Music ───────────────────────────────────────────────────── */}
          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.7s' }}>
            <h2 className="text-2xl font-display mb-4">🎵 REALM SOUNDTRACK</h2>
            <p className="text-secondary mb-4">
              The Astral Bazaar hums with mystic rhythms of ancient wisdom and cosmic commerce.
            </p>
            <RealmMusicPlayer
              trackUrl="/music/realms/44/dogWatch.mp3"
              trackTitle="Dog Watch"
              artist="Cosmic 888"
              realmName="Astral Bazaar"
              realmColor="#9B59B6"
              realmId={44}
            />
          </div>

          {/* ── ADDED: Completion card ───────────────────────────────────── */}
          {completedTrialsCount >= 3 && (
            <div
              className="glass-card p-8 mb-8 text-center fade-in"
              style={{ border: '1px solid rgba(155,89,182,0.6)' }}
            >
              <h3 className="text-2xl font-display mb-4" style={{ color: '#9B59B6' }}>
                🛍️ ASTRAL BAZAAR MASTERED 🛍️
              </h3>
              <p className="text-secondary mb-6 max-w-2xl mx-auto">
                You have mastered Sacred Discernment and the art of the Cosmic Exchange.
                The final realm awaits — InterSiddhi, where all paths converge at the Source.
              </p>
              <Link href="/realms/0">
                <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
                  ENTER INTERSIDDHI →
                </button>
              </Link>
            </div>
          )}

          {/* ── UPDATED: Navigation footer ───────────────────────────────── */}
          <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.8s' }}>
            <Link href="/nexus">
              <button className="btn-secondary">← BACK TO NEXUS</button>
            </Link>
            {completedTrialsCount >= 3 ? (
              <Link href="/realms/0">
                <button className="btn-primary">🌌 INTERSIDDHI →</button>
              </Link>
            ) : (
              <div className="text-sm text-muted">
                Next Realm: 🌌 InterSiddhi (🔒 Locked)
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}