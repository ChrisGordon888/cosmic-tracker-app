'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';
import TrialPuzzle from '@/components/realm/TrialPuzzle';
import { REALM_55_PUZZLES, type PuzzleConfig } from '@/lib/realmPuzzles';
import '@/styles/realmShared.css';
import '@/styles/realm55.css';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ME,
  COMPLETE_TRIAL_STEP,
  START_TRIAL,
  VISIT_LOCATION,
  UNLOCK_REALM,
} from '@/graphql/realms';

/**
 * ⛰️ REALM 55: SKYBOUND CITY
 * Theme: Power & Manifestation
 * Unlocks: Realm 44 (Astral Bazaar) on full trial completion
 *
 * Trial flow (mirrors Realm 101):
 *   Trial 1 — Sovereignty:        location (Tower) → puzzle → puzzle
 *   Trial 2 — Power Manifestation: location (Arena) → puzzle → puzzle
 *   Trial 3 — Divine Authority:    puzzle → puzzle → puzzle (no location)
 */

const REALM_ID = 55;
const NEXT_REALM_ID = 44;

// Inline final puzzle for Trial 3 Step 3 (same pattern as Realm 101)
const DIVINE_AUTHORITY_FINAL_PUZZLE: PuzzleConfig = {
  id: 'divine-authority-step-3',
  trialId: 'trial-divine-authority',
  type: 'multiple-choice',
  prompt: 'A king\'s divine authority is ultimately proven by…',
  options: [
    'The size of their army and accumulated wealth',
    'Their ability to impose fear and absolute obedience',
    'The harmony, growth, and flourishing of all within their domain',
  ],
  correctOption: 'The harmony, growth, and flourishing of all within their domain',
  hint: 'True divine authority serves and elevates — it does not merely dominate.',
};

export default function Realm55() {
  const { data: session, status } = useSession();

  const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME);
  const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
  const [startTrial] = useMutation(START_TRIAL);
  const [visitLocation] = useMutation(VISIT_LOCATION);
  const [unlockNextRealm] = useMutation(UNLOCK_REALM);
  const hasUnlockedRef = useRef(false);

  // ── Puzzle-solved guards (prevent double-fire on re-render) ──────────────
  const [trial1Puzzle1Solved, setTrial1Puzzle1Solved] = useState(false);
  const [trial1Puzzle2Solved, setTrial1Puzzle2Solved] = useState(false);

  const [trial2Puzzle1Solved, setTrial2Puzzle1Solved] = useState(false);
  const [trial2Puzzle2Solved, setTrial2Puzzle2Solved] = useState(false);

  const [trial3Puzzle1Solved, setTrial3Puzzle1Solved] = useState(false);
  const [trial3Puzzle2Solved, setTrial3Puzzle2Solved] = useState(false);
  const [trial3Puzzle3Solved, setTrial3Puzzle3Solved] = useState(false);

  // ── User / realm data ────────────────────────────────────────────────────
  const user = userData?.me;
  const userLevel = user?.level ?? 1;
  const userXP = user?.xp ?? 0;
  const xpToNext = user?.xpToNextLevel ?? 100;
  const safeXpToNext = Math.max(xpToNext, 1);
  const xpPercent = Math.min((userXP / safeXpToNext) * 100, 100);

  const realmTrials = user?.completedTrials?.filter((t: any) => t.realmId === REALM_ID) ?? [];
  const completedTrialsCount = realmTrials.filter((t: any) => t.isComplete).length;
  const realmProgress = Math.floor((completedTrialsCount / 3) * 100);

  const getTrial = (trialId: string) => realmTrials.find((t: any) => t.trialId === trialId);

  const realmLocations = user?.visitedLocations?.filter((l: any) => l.realmId === REALM_ID) ?? [];
  const hasVisited = (locationId: string) => realmLocations.some((l: any) => l.locationId === locationId);

  const isAstralBazaarUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);

  // ── Trial refs ────────────────────────────────────────────────────────────
  const trial1 = getTrial('trial-sovereignty');
  const trial2 = getTrial('trial-power-manifestation');
  const trial3 = getTrial('trial-divine-authority');

  const trial1Started = !!trial1;
  const trial2Started = !!trial2;
  const trial3Started = !!trial3;

  const trial1Steps = trial1?.stepsCompleted || 0;
  const trial2Steps = trial2?.stepsCompleted || 0;
  const trial3Steps = trial3?.stepsCompleted || 0;

  // ── Puzzle steps from config ──────────────────────────────────────────────
  const sovereigntyPuzzles   = REALM_55_PUZZLES['trial-sovereignty'].steps;
  const manifestationPuzzles = REALM_55_PUZZLES['trial-power-manifestation'].steps;
  const authorityPuzzles     = REALM_55_PUZZLES['trial-divine-authority'].steps;

  // ── Location gate flags ───────────────────────────────────────────────────
  // Mirror of Realm 101: location is explorable only during its trial's step-0 window
  const canExploreTower = trial1Started && trial1Steps === 0;
  const canExploreArena = trial2Started && trial2Steps === 0;

  // ── Auto-unlock Realm 44 ──────────────────────────────────────────────────
  useEffect(() => {
    if (completedTrialsCount >= 3 && !hasUnlockedRef.current && user) {
      const alreadyUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);
      if (!alreadyUnlocked) {
        hasUnlockedRef.current = true;
        unlockNextRealm({ variables: { realmId: NEXT_REALM_ID } })
          .then(() => { refetch(); })
          .catch((err) => console.error('Unlock error:', err));
      } else {
        hasUnlockedRef.current = true;
      }
    }
  }, [completedTrialsCount, user, unlockNextRealm, refetch]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const ensureTrialStarted = async (trialId: string, trialName: string) => {
    await startTrial({ variables: { realmId: REALM_ID, trialId, trialName } });
    await refetch();
  };

  const advanceTrialStep = async (trialId: string, prefixMessage?: string) => {
    const result = await completeTrialStep({ variables: { realmId: REALM_ID, trialId } });
    const msg = result.data.completeTrialStep.message;
    alert(prefixMessage ? `${prefixMessage}\n${msg}` : msg);
    await refetch();
  };

  const handleLocationVisit = async (locationId: string, locationName: string) => {
    try {
      const result = await visitLocation({
        variables: { realmId: REALM_ID, locationId, locationName },
      });
      const visitMessage = result.data.visitLocation.message;

      // Auto-advance trial step when visiting the gated location
      if (locationId === 'tower-of-ascension' && trial1Started && trial1Steps === 0) {
        await advanceTrialStep('trial-sovereignty', visitMessage);
        return;
      }
      if (locationId === 'arena-of-kings' && trial2Started && trial2Steps === 0) {
        await advanceTrialStep('trial-power-manifestation', visitMessage);
        return;
      }

      alert(visitMessage);
      await refetch();
    } catch (error: any) {
      console.error('Location error:', error);
      alert('Error: ' + (error.message ?? 'Something went wrong'));
    }
  };

  // ── Loading / auth guards ─────────────────────────────────────────────────
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
          <p className="text-lg text-secondary mb-8">You must be logged in to enter this realm.</p>
          <Link href="/auth" className="btn-primary">SIGN IN</Link>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <RealmBackground videoSrc="/skybound-city_CityScape1.mp4" realmName="Skybound City" overlayOpacity={0.4} />

      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8 max-w-6xl">

          {/* Header */}
          <header className="text-center mb-12 fade-in">
            <div className="text-6xl mb-4 neon-glow">⛰️</div>
            <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-55-title">SKYBOUND CITY</h1>
            <p className="text-xl text-secondary mb-2">[ REALM 55 ]</p>
            <p className="text-lg text-muted">Power & Manifestation • Where Will Becomes Reality</p>
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

          {/* Realm overview */}
          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-display mb-4">⚡ THE CITADEL OF WILL ⚡</h2>
            <p className="text-lg text-secondary mb-4">
              Skybound City floats above the clouds, a gleaming metropolis where thought becomes form and intention shapes reality. This is the realm of kings, warriors, and those who command their destiny.
            </p>
            <p className="text-secondary mb-6">
              Here, you'll unlock Manifestation Mastery: the power to bend reality to your will, to materialize your visions, and to command energy with absolute authority.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow realm-55-glow">{realmProgress}%</div>
                <div className="text-xs text-muted">Progress</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow">{completedTrialsCount} / 3</div>
                <div className="text-xs text-muted">Trials Complete</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow">0</div>
                <div className="text-xs text-muted">Siddhis Unlocked</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow">
                  {isAstralBazaarUnlocked ? 'Unlocked' : 'Locked'}
                </div>
                <div className="text-xs text-muted">Next Realm</div>
              </div>
            </div>
          </div>

          {/* ── TRIALS ─────────────────────────────────────────────────────── */}
          <div className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">🎯</span> REALM TRIALS <span className="text-glow">🎯</span>
            </h2>
            <div className="space-y-4">

              {/* ── Trial 1: Sovereignty ── */}
              <div className="quest-card fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">👑</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Sovereignty</h3>
                    <p className="text-sm text-secondary mb-3">
                      Ascend the Tower of Ascension, claim your throne, and answer the call of true authority.
                    </p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{trial1Steps} / 3 Steps</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-bar-fill realm-55-bar" style={{ width: `${(trial1Steps / 3) * 100}%` }} />
                      </div>
                    </div>

                    {/* Not started */}
                    {!trial1Started && (
                      <>
                        <button
                          className="btn-primary mt-4"
                          onClick={() => ensureTrialStarted('trial-sovereignty', 'Trial of Sovereignty')}
                        >
                          BEGIN TRIAL OF SOVEREIGNTY →
                        </button>
                        <p className="text-xs text-muted mt-2">🔒 Start the trial to ascend the tower path.</p>
                      </>
                    )}

                    {/* Step 0 — needs location visit */}
                    {trial1Started && trial1Steps === 0 && (
                      <>
                        <button
                          className="btn-primary mt-4"
                          onClick={() =>
                            document.getElementById('locations-section')?.scrollIntoView({ behavior: 'smooth' })
                          }
                        >
                          STEP 1: ASCEND THE TOWER →
                        </button>
                        <p className="text-xs text-muted mt-2">
                          🔒 Visit The Tower of Ascension to auto-complete the first step.
                        </p>
                      </>
                    )}

                    {/* Step 1 — puzzle */}
                    {trial1Started && trial1Steps === 1 && (
                      <>
                        <TrialPuzzle
                          puzzle={sovereigntyPuzzles[0]}
                          onSolved={async () => {
                            if (trial1Puzzle1Solved) return;
                            setTrial1Puzzle1Solved(true);
                            await advanceTrialStep('trial-sovereignty');
                          }}
                        />
                        <p className="text-xs text-muted mt-2">🔒 Prove your understanding of sovereignty.</p>
                      </>
                    )}

                    {/* Step 2 — puzzle */}
                    {trial1Started && trial1Steps === 2 && (
                      <>
                        <TrialPuzzle
                          puzzle={sovereigntyPuzzles[1]}
                          onSolved={async () => {
                            if (trial1Puzzle2Solved) return;
                            setTrial1Puzzle2Solved(true);
                            await advanceTrialStep('trial-sovereignty');
                          }}
                        />
                        <p className="text-xs text-muted mt-2">🔒 One final test to claim the crown.</p>
                      </>
                    )}

                    {trial1?.isComplete && <div className="text-green-400 font-bold">✓ COMPLETE</div>}
                  </div>
                </div>
              </div>

              {/* ── Trial 2: Power Manifestation ── */}
              <div className={`quest-card fade-in ${!trial1?.isComplete ? 'opacity-50' : ''}`} style={{ animationDelay: '0.3s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚔️</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Power Manifestation</h3>
                    {trial1?.isComplete ? (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Enter the Arena of Kings, prove your strength, and manifest your power into reality.
                        </p>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span><span>{trial2Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div className="stat-bar-fill realm-55-bar" style={{ width: `${(trial2Steps / 3) * 100}%` }} />
                          </div>
                        </div>

                        {!trial2Started && (
                          <>
                            <button
                              className="btn-primary mt-4"
                              onClick={() => ensureTrialStarted('trial-power-manifestation', 'Trial of Power Manifestation')}
                            >
                              BEGIN TRIAL OF POWER MANIFESTATION →
                            </button>
                            <p className="text-xs text-muted mt-2">🔒 Start the trial to enter the arena.</p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 0 && (
                          <>
                            <button
                              className="btn-primary mt-4"
                              onClick={() =>
                                document.getElementById('locations-section')?.scrollIntoView({ behavior: 'smooth' })
                              }
                            >
                              STEP 1: ENTER THE ARENA OF KINGS →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Visit The Arena of Kings to auto-complete the first step.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 1 && (
                          <>
                            <TrialPuzzle
                              puzzle={manifestationPuzzles[0]}
                              onSolved={async () => {
                                if (trial2Puzzle1Solved) return;
                                setTrial2Puzzle1Solved(true);
                                await advanceTrialStep('trial-power-manifestation');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">🔒 Solve the manifestation trial.</p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 2 && (
                          <>
                            <TrialPuzzle
                              puzzle={manifestationPuzzles[1]}
                              onSolved={async () => {
                                if (trial2Puzzle2Solved) return;
                                setTrial2Puzzle2Solved(true);
                                await advanceTrialStep('trial-power-manifestation');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">🔒 Complete the power manifestation trial.</p>
                          </>
                        )}

                        {trial2?.isComplete && <div className="text-green-400 font-bold">✓ COMPLETE</div>}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">🔒 Complete Trial of Sovereignty to unlock</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Trial 3: Divine Authority ── */}
              <div className={`quest-card fade-in ${!trial2?.isComplete ? 'opacity-50' : ''}`} style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚡</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Divine Authority</h3>
                    {trial2?.isComplete ? (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Claim divine authority. Your will is sovereign. Your word is law. Three final tests await.
                        </p>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span><span>{trial3Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div className="stat-bar-fill realm-55-bar" style={{ width: `${(trial3Steps / 3) * 100}%` }} />
                          </div>
                        </div>

                        {/* Not started — no location step, begin goes straight to puzzles */}
                        {!trial3Started && (
                          <>
                            <button
                              className="btn-primary mt-4"
                              onClick={() => ensureTrialStarted('trial-divine-authority', 'Trial of Divine Authority')}
                            >
                              BEGIN TRIAL OF DIVINE AUTHORITY →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Start the trial to enter the divine path.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 0 && (
                          <>
                            <TrialPuzzle
                              puzzle={authorityPuzzles[0]}
                              onSolved={async () => {
                                if (trial3Puzzle1Solved) return;
                                setTrial3Puzzle1Solved(true);
                                await advanceTrialStep('trial-divine-authority');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">🔒 Answer the first call of divine authority.</p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 1 && (
                          <>
                            <TrialPuzzle
                              puzzle={authorityPuzzles[1]}
                              onSolved={async () => {
                                if (trial3Puzzle2Solved) return;
                                setTrial3Puzzle2Solved(true);
                                await advanceTrialStep('trial-divine-authority');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">🔒 The second law of authority awaits.</p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 2 && (
                          <>
                            <TrialPuzzle
                              puzzle={DIVINE_AUTHORITY_FINAL_PUZZLE}
                              onSolved={async () => {
                                if (trial3Puzzle3Solved) return;
                                setTrial3Puzzle3Solved(true);
                                await advanceTrialStep('trial-divine-authority');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 One final choice — complete your claim to divine authority.
                            </p>
                          </>
                        )}

                        {trial3?.isComplete && <div className="text-green-400 font-bold">✓ COMPLETE</div>}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">🔒 Complete Trial of Power Manifestation to unlock</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── LOCATIONS ──────────────────────────────────────────────────── */}
          <div id="locations-section" className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">📍</span> LOCATIONS <span className="text-glow">📍</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Tower of Ascension — locked until Trial 1 step 0 */}
              <div
                className={`realm-portal ${canExploreTower || hasVisited('tower-of-ascension') ? 'unlocked' : 'locked'} fade-in`}
                style={{ animationDelay: '0.5s' }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏛️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Tower of Ascension</h3>
                    <p className="text-sm text-secondary mb-3">Climb higher. Each floor tests your will and strength.</p>
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('tower-of-ascension', 'The Tower of Ascension')}
                      disabled={!canExploreTower || hasVisited('tower-of-ascension')}
                    >
                      {hasVisited('tower-of-ascension')
                        ? '✅ EXPLORED'
                        : canExploreTower
                          ? 'EXPLORE →'
                          : 'LOCKED UNTIL TRIAL 1 STARTS'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Arena of Kings — locked until Trial 2 step 0 */}
              <div
                className={`realm-portal ${canExploreArena || hasVisited('arena-of-kings') ? 'unlocked' : 'locked'} fade-in`}
                style={{ animationDelay: '0.6s' }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚔️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Arena of Kings</h3>
                    <p className="text-sm text-secondary mb-3">Where warriors test their might and prove their worth.</p>
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('arena-of-kings', 'The Arena of Kings')}
                      disabled={!canExploreArena || hasVisited('arena-of-kings')}
                    >
                      {hasVisited('arena-of-kings')
                        ? '✅ EXPLORED'
                        : canExploreArena
                          ? 'EXPLORE →'
                          : 'LOCKED UNTIL TRIAL 2 LOCATION STEP'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Music */}
          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.7s' }}>
            <h2 className="text-2xl font-display mb-4">🎵 REALM SOUNDTRACK</h2>
            <p className="text-secondary mb-4">Skybound City thunders with triumphant anthems of power and glory.</p>
            <RealmMusicPlayer
              trackUrl="/music/realms/55/mula.mp3"
              trackTitle="Mula"
              artist="Cosmic 888"
              realmName="Skybound City"
              realmColor="#FFD700"
              realmId={55}
            />
          </div>

          {/* Footer nav — button appears when Astral Bazaar is unlocked */}
          <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.8s' }}>
            <Link href="/nexus"><button className="btn-secondary">← BACK TO NEXUS</button></Link>
            {isAstralBazaarUnlocked ? (
              <Link href="/realms/44">
                <button className="btn-primary">ENTER ASTRAL BAZAAR →</button>
              </Link>
            ) : (
              <div className="text-sm text-muted">
                Next Realm: 🛍️ Astral Bazaar (Locked)
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}