'use client';

import { useRef, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import TrialPuzzle from '@/components/realm/TrialPuzzle';
import '@/styles/realmShared.css';
import '@/styles/realm55.css';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ME,
  COMPLETE_TRIAL_STEP,
  START_TRIAL,
  VISIT_LOCATION,
  UNLOCK_REALM,
} from '@/graphql/realms';
import { REALM_55_PUZZLES } from '@/lib/realmPuzzles';

/**
 * ⛰️ REALM 55: SKYBOUND CITY
 * Theme: Power & Manifestation
 * Trial IDs aligned with realmPuzzles.ts:
 *   trial-sovereignty          — location (tower-of-ascension) + 2 puzzles
 *   trial-power-manifestation  — location (arena-of-kings)     + 2 puzzles
 *   trial-divine-authority     — 2 puzzles (no location gate)
 * Unlocks: Realm 44 (Astral Bazaar)
 */

const REALM_ID = 55;
const NEXT_REALM_ID = 44;

export default function Realm55() {
  const { data: session, status } = useSession();

  const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME);
  const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
  const [startTrial] = useMutation(START_TRIAL);
  const [visitLocation] = useMutation(VISIT_LOCATION);
  const [unlockNextRealm] = useMutation(UNLOCK_REALM);

  const hasUnlockedRef = useRef(false);
  const locationsSectionRef = useRef<HTMLDivElement>(null);
  const [isBusy, setIsBusy] = useState(false);

  // ── Derived data ──────────────────────────────────────────────────────
  const user = userData?.me;
  const userLevel = user?.level ?? 1;
  const userXP = user?.xp ?? 0;
  const xpToNext = user?.xpToNextLevel ?? 100;
  const safeXpToNext = Math.max(xpToNext, 1);
  const xpPercent = Math.min((userXP / safeXpToNext) * 100, 100);

  const realmTrials =
    user?.completedTrials?.filter((t: any) => t.realmId === REALM_ID) ?? [];
  const completedTrialsCount = realmTrials.filter((t: any) => t.isComplete).length;
  const realmProgress = Math.floor((completedTrialsCount / 3) * 100);

  const getTrial = (trialId: string) =>
    realmTrials.find((t: any) => t.trialId === trialId);

  const realmLocs =
    user?.visitedLocations?.filter((l: any) => l.realmId === REALM_ID) ?? [];
  const hasVisited = (locationId: string) =>
    realmLocs.some((l: any) => l.locationId === locationId);

  const trial1 = getTrial('trial-sovereignty');
  const trial2 = getTrial('trial-power-manifestation');
  const trial3 = getTrial('trial-divine-authority');

  // ── Auto-unlock Realm 44 ──────────────────────────────────────────────
  useEffect(() => {
    if (completedTrialsCount >= 3 && !hasUnlockedRef.current && user) {
      const alreadyUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);

      if (!alreadyUnlocked) {
        hasUnlockedRef.current = true;
        unlockNextRealm({ variables: { realmId: NEXT_REALM_ID } })
          .then(() => {
            alert('🔓 REALM UNLOCKED! Astral Bazaar (Realm 44) is now accessible!');
            refetch();
          })
          .catch((err) => {
            console.error('Unlock error:', err);
            hasUnlockedRef.current = false;
          });
      } else {
        hasUnlockedRef.current = true;
      }
    }
  }, [completedTrialsCount, user, unlockNextRealm, refetch]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleStartTrial = async (trialId: string, trialName: string) => {
    if (isBusy) return;

    try {
      setIsBusy(true);
      await startTrial({ variables: { realmId: REALM_ID, trialId, trialName } });
      await refetch();
    } catch (e: any) {
      console.error(e);
      alert('Error starting trial: ' + (e.message ?? 'Unknown error'));
    } finally {
      setIsBusy(false);
    }
  };

  const advanceTrialStep = async (trialId: string) => {
    if (isBusy) return;

    try {
      setIsBusy(true);
      const result = await completeTrialStep({
        variables: { realmId: REALM_ID, trialId },
      });
      alert(result.data.completeTrialStep.message);
      await refetch();
    } catch (e: any) {
      console.error(e);
      alert('Error: ' + (e.message ?? 'Something went wrong'));
    } finally {
      setIsBusy(false);
    }
  };

  const handleLocationVisit = async (locationId: string, locationName: string) => {
    if (isBusy) return;

    try {
      setIsBusy(true);

      const result = await visitLocation({
        variables: { realmId: REALM_ID, locationId, locationName },
      });

      const visitMessage = result.data.visitLocation.message;

      // Auto-advance the required step for Trial 1
      if (
        locationId === 'tower-of-ascension' &&
        trial1 &&
        !trial1.isComplete &&
        trial1.stepsCompleted === 0
      ) {
        const stepResult = await completeTrialStep({
          variables: { realmId: REALM_ID, trialId: 'trial-sovereignty' },
        });

        alert(`${visitMessage}\n${stepResult.data.completeTrialStep.message}`);
        await refetch();
        return;
      }

      // Auto-advance the required step for Trial 2
      if (
        locationId === 'arena-of-kings' &&
        trial2 &&
        !trial2.isComplete &&
        trial2.stepsCompleted === 0
      ) {
        const stepResult = await completeTrialStep({
          variables: { realmId: REALM_ID, trialId: 'trial-power-manifestation' },
        });

        alert(`${visitMessage}\n${stepResult.data.completeTrialStep.message}`);
        await refetch();
        return;
      }

      alert(visitMessage);
      await refetch();
    } catch (e: any) {
      console.error(e);
      alert('Error: ' + (e.message ?? 'Something went wrong'));
    } finally {
      setIsBusy(false);
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────
  if (status === 'loading' || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="neon-glow text-4xl mb-4">⛰️</div>
          <p className="text-xl">Ascending to Skybound City...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-12 max-w-md text-center">
          <h1 className="text-4xl font-display neon-glow mb-4">🔒 ACCESS DENIED</h1>
          <p className="text-lg text-secondary mb-8">
            You must be logged in to enter this realm.
          </p>
          <Link href="/auth" className="btn-primary">
            SIGN IN
          </Link>
        </div>
      </div>
    );
  }

  // ── Location lock conditions ──────────────────────────────────────────
  const towerUnlocked = !!trial1;
  const arenaUnlocked = !!trial2;

  // ── Active puzzles by backend step count ─────────────────────────────
  const trial1Puzzle =
    trial1 && !trial1.isComplete && trial1.stepsCompleted >= 1
      ? REALM_55_PUZZLES['trial-sovereignty']?.steps[trial1.stepsCompleted - 1]
      : null;

  const trial2Puzzle =
    trial2 && !trial2.isComplete && trial2.stepsCompleted >= 1
      ? REALM_55_PUZZLES['trial-power-manifestation']?.steps[trial2.stepsCompleted - 1]
      : null;

  const trial3Puzzle =
    trial3 && !trial3.isComplete
      ? REALM_55_PUZZLES['trial-divine-authority']?.steps[trial3.stepsCompleted]
      : null;

  return (
    <>
      <RealmBackground
        videoSrc="/skybound-city_CityScape1.mp4"
        realmName="Skybound City"
        overlayOpacity={0.4}
      />

      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* ── Header ────────────────────────────────────────────────── */}
          <header className="text-center mb-12 fade-in">
            <div className="text-6xl mb-4 neon-glow">⛰️</div>
            <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-55-title">
              SKYBOUND CITY
            </h1>
            <p className="text-xl text-secondary mb-2">[ REALM 55 ]</p>
            <p className="text-lg text-muted">
              Power &amp; Manifestation • Where Will Becomes Reality
            </p>
            <div className="mt-6 flex justify-center items-center gap-4">
              <div className="level-badge">LVL {userLevel}</div>
              <div className="flex-1 max-w-xs">
                <div className="stat-bar">
                  <div className="stat-bar-fill" style={{ width: `${xpPercent}%` }} />
                </div>
                <p className="text-sm text-secondary mt-1">
                  {userXP} / {safeXpToNext} XP
                </p>
              </div>
            </div>
          </header>

          {/* ── Realm description ─────────────────────────────────────── */}
          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-display mb-4">⚡ THE CITADEL OF WILL ⚡</h2>
            <p className="text-lg text-secondary mb-4">
              Skybound City floats above the clouds — a gleaming metropolis where thought
              becomes form and intention shapes reality. This is the realm of kings,
              warriors, and those who command their destiny.
            </p>
            <p className="text-secondary mb-6">
              Here you unlock <strong>Manifestation Mastery</strong>: the power to bend
              reality to your will, to materialise your visions, and to command energy
              with absolute authority.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow realm-55-glow">
                  {realmProgress}%
                </div>
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

          {/* ── Trials ────────────────────────────────────────────────── */}
          <div className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">🎯</span> REALM TRIALS <span className="text-glow">🎯</span>
            </h2>
            <div className="space-y-6">
              {/* Trial 1 */}
              <div className="quest-card fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">👑</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Sovereignty</h3>
                    <p className="text-sm text-secondary mb-3">
                      Claim your throne. Command your domain with absolute authority.
                    </p>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{trial1?.stepsCompleted ?? 0} / 3 Steps</span>
                      </div>
                      <div className="stat-bar">
                        <div
                          className="stat-bar-fill realm-55-bar"
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
                          handleStartTrial('trial-sovereignty', 'Trial of Sovereignty')
                        }
                        disabled={isBusy}
                      >
                        BEGIN TRIAL →
                      </button>
                    ) : trial1.stepsCompleted === 0 && !hasVisited('tower-of-ascension') ? (
                      <>
                        <p className="text-sm text-muted italic mb-3">
                          📍 Visit <strong>The Tower of Ascension</strong> below to unlock Step 1.
                        </p>
                        <button
                          className="btn-secondary"
                          onClick={() =>
                            locationsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                          }
                          disabled={isBusy}
                        >
                          GO TO LOCATIONS ↓
                        </button>
                      </>
                    ) : trial1Puzzle ? (
                      <TrialPuzzle
                        key={`trial-sovereignty-${trial1.stepsCompleted}`}
                        puzzle={trial1Puzzle}
                        onSolved={() => advanceTrialStep('trial-sovereignty')}
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Trial 2 */}
              <div
                className={`quest-card fade-in ${!trial1?.isComplete ? 'opacity-50' : ''}`}
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚔️</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">
                      Trial of Power Manifestation
                    </h3>

                    {!trial1?.isComplete ? (
                      <p className="text-sm text-muted italic">
                        🔒 Complete Trial of Sovereignty to unlock
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Manifest your power. Turn thought into unstoppable reality.
                        </p>

                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{trial2?.stepsCompleted ?? 0} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div
                              className="stat-bar-fill realm-55-bar"
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
                              handleStartTrial(
                                'trial-power-manifestation',
                                'Trial of Power Manifestation'
                              )
                            }
                            disabled={isBusy}
                          >
                            BEGIN TRIAL →
                          </button>
                        ) : trial2.stepsCompleted === 0 && !hasVisited('arena-of-kings') ? (
                          <>
                            <p className="text-sm text-muted italic mb-3">
                              📍 Visit <strong>The Arena of Kings</strong> below to unlock Step 1.
                            </p>
                            <button
                              className="btn-secondary"
                              onClick={() =>
                                locationsSectionRef.current?.scrollIntoView({
                                  behavior: 'smooth',
                                })
                              }
                              disabled={isBusy}
                            >
                              GO TO LOCATIONS ↓
                            </button>
                          </>
                        ) : trial2Puzzle ? (
                          <TrialPuzzle
                            key={`trial-power-manifestation-${trial2.stepsCompleted}`}
                            puzzle={trial2Puzzle}
                            onSolved={() => advanceTrialStep('trial-power-manifestation')}
                          />
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Trial 3 */}
              <div
                className={`quest-card fade-in ${!trial2?.isComplete ? 'opacity-50' : ''}`}
                style={{ animationDelay: '0.4s' }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚡</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Divine Authority</h3>

                    {!trial2?.isComplete ? (
                      <p className="text-sm text-muted italic">
                        🔒 Complete Trial of Power Manifestation to unlock
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Claim divine authority. Your will is sovereign. Your word is law.
                        </p>

                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{trial3?.stepsCompleted ?? 0} / 2 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div
                              className="stat-bar-fill realm-55-bar"
                              style={{ width: `${((trial3?.stepsCompleted ?? 0) / 2) * 100}%` }}
                            />
                          </div>
                        </div>

                        {trial3?.isComplete ? (
                          <div className="text-green-400 font-bold">✓ COMPLETE</div>
                        ) : !trial3 ? (
                          <button
                            className="btn-primary"
                            onClick={() =>
                              handleStartTrial(
                                'trial-divine-authority',
                                'Trial of Divine Authority'
                              )
                            }
                            disabled={isBusy}
                          >
                            BEGIN TRIAL →
                          </button>
                        ) : trial3Puzzle ? (
                          <TrialPuzzle
                            key={`trial-divine-authority-${trial3.stepsCompleted}`}
                            puzzle={trial3Puzzle}
                            onSolved={() => advanceTrialStep('trial-divine-authority')}
                          />
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Locations ─────────────────────────────────────────────── */}
          <div ref={locationsSectionRef} id="locations-section" className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">📍</span> LOCATIONS <span className="text-glow">📍</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tower */}
              <div
                className={`realm-portal fade-in ${towerUnlocked ? 'unlocked' : 'opacity-50'}`}
                style={{ animationDelay: '0.5s' }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏛️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Tower of Ascension</h3>
                    <p className="text-sm text-secondary mb-1">
                      Climb higher. Each floor tests your will and strength.
                    </p>

                    {!towerUnlocked ? (
                      <p className="text-xs text-muted italic mb-3">
                        🔒 Begin Trial of Sovereignty to unlock this location
                      </p>
                    ) : !hasVisited('tower-of-ascension') ? (
                      <p className="text-xs text-glow mb-3">
                        ⚠️ Required for Trial of Sovereignty — Step 1
                      </p>
                    ) : null}

                    <button
                      className="btn-secondary w-full"
                      onClick={() =>
                        handleLocationVisit('tower-of-ascension', 'The Tower of Ascension')
                      }
                      disabled={!towerUnlocked || hasVisited('tower-of-ascension') || isBusy}
                    >
                      {hasVisited('tower-of-ascension')
                        ? '✅ EXPLORED'
                        : !towerUnlocked
                          ? '🔒 LOCKED'
                          : 'EXPLORE →'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Arena */}
              <div
                className={`realm-portal fade-in ${arenaUnlocked ? 'unlocked' : 'opacity-50'}`}
                style={{ animationDelay: '0.6s' }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚔️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Arena of Kings</h3>
                    <p className="text-sm text-secondary mb-1">
                      Where warriors test their might and prove their worth.
                    </p>

                    {!arenaUnlocked ? (
                      <p className="text-xs text-muted italic mb-3">
                        🔒 Complete Trial of Sovereignty to unlock this location
                      </p>
                    ) : !hasVisited('arena-of-kings') ? (
                      <p className="text-xs text-glow mb-3">
                        ⚠️ Required for Trial of Power Manifestation — Step 1
                      </p>
                    ) : null}

                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('arena-of-kings', 'The Arena of Kings')}
                      disabled={!arenaUnlocked || hasVisited('arena-of-kings') || isBusy}
                    >
                      {hasVisited('arena-of-kings')
                        ? '✅ EXPLORED'
                        : !arenaUnlocked
                          ? '🔒 LOCKED'
                          : 'EXPLORE →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Music ─────────────────────────────────────────────────── */}
          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.7s' }}>
            <h2 className="text-2xl font-display mb-4">🎵 REALM SOUNDTRACK</h2>
            <p className="text-secondary mb-4">
              Skybound City thunders with triumphant anthems of power and glory.
            </p>
            <RealmMusicPlayer
              trackUrl="/music/realms/55/mula.mp3"
              trackTitle="Mula"
              artist="Cosmic 888"
              realmName="Skybound City"
              realmColor="#FFD700"
              realmId={55}
            />
          </div>

          {/* ── Completion card ───────────────────────────────────────── */}
          {completedTrialsCount >= 3 && (
            <div
              className="glass-card p-8 mb-8 text-center fade-in"
              style={{ border: '1px solid rgba(255,215,0,0.5)' }}
            >
              <h3 className="text-2xl font-display mb-4" style={{ color: '#FFD700' }}>
                ⚡ SKYBOUND CITY CONQUERED ⚡
              </h3>
              <p className="text-secondary mb-6 max-w-2xl mx-auto">
                You have mastered Power &amp; Manifestation. The Astral Bazaar awaits —
                where wisdom meets commerce and time bends to the bold.
              </p>
              <Link href="/realms/44">
                <button
                  className="btn-primary"
                  style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}
                >
                  ENTER ASTRAL BAZAAR →
                </button>
              </Link>
            </div>
          )}

          {/* ── Footer nav ────────────────────────────────────────────── */}
          <div
            className="flex justify-between items-center fade-in"
            style={{ animationDelay: '0.8s' }}
          >
            <Link href="/nexus">
              <button className="btn-secondary">← BACK TO NEXUS</button>
            </Link>

            {completedTrialsCount >= 3 ? (
              <Link href="/realms/44">
                <button className="btn-primary">🛍️ ASTRAL BAZAAR →</button>
              </Link>
            ) : (
              <div className="text-sm text-muted">Next Realm: 🛍️ Astral Bazaar (🔒 Locked)</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}