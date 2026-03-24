'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';
import TrialPuzzle from '@/components/realm/TrialPuzzle';
import { REALM_0_PUZZLES, type PuzzleConfig } from '@/lib/realmPuzzles';
import '@/styles/realmShared.css';
import '@/styles/realm0.css';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ME,
  COMPLETE_TRIAL_STEP,
  START_TRIAL,
  VISIT_LOCATION,
} from '@/graphql/realms';

/**
 * 🌌 REALM 0: INTERSIDDHI
 * Theme: Source & Transcendence
 * Final realm — no unlock trigger needed
 */

const REALM_ID = 0;

const TRANSCENDENCE_FINAL_PUZZLE: PuzzleConfig = {
  id: 'transcendence-step-3',
  trialId: 'trial-transcendence',
  type: 'multiple-choice',
  prompt: 'What is transcendence in InterSiddhi?',
  options: [
    'Escaping reality forever',
    'Realizing the source is within and beyond all realms',
    'Winning the final realm through force alone',
  ],
  correctOption: 'Realizing the source is within and beyond all realms',
  hint: 'This realm is about unity, not escape or domination.',
};

export default function Realm0() {
  const { data: session, status } = useSession();

  const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME);
  const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
  const [startTrial] = useMutation(START_TRIAL);
  const [visitLocation] = useMutation(VISIT_LOCATION);

  const [trial1Puzzle1Solved, setTrial1Puzzle1Solved] = useState(false);
  const [trial1Puzzle2Solved, setTrial1Puzzle2Solved] = useState(false);

  const [trial2Puzzle1Solved, setTrial2Puzzle1Solved] = useState(false);
  const [trial2Puzzle2Solved, setTrial2Puzzle2Solved] = useState(false);

  const [trial3Puzzle1Solved, setTrial3Puzzle1Solved] = useState(false);
  const [trial3Puzzle2Solved, setTrial3Puzzle2Solved] = useState(false);
  const [trial3Puzzle3Solved, setTrial3Puzzle3Solved] = useState(false);

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
  const hasVisited = (locationId: string) =>
    realmLocations.some((l: any) => l.locationId === locationId);

  const trial1 = getTrial('trial-unity-consciousness');
  const trial2 = getTrial('trial-perfect-balance');
  const trial3 = getTrial('trial-transcendence');

  const trial1Started = !!trial1;
  const trial2Started = !!trial2;
  const trial3Started = !!trial3;

  const trial1Steps = trial1?.stepsCompleted || 0;
  const trial2Steps = trial2?.stepsCompleted || 0;
  const trial3Steps = trial3?.stepsCompleted || 0;

  const unityPuzzles = REALM_0_PUZZLES['trial-unity-consciousness'].steps;
  const balancePuzzles = REALM_0_PUZZLES['trial-perfect-balance'].steps;
  const transcendencePuzzles = REALM_0_PUZZLES['trial-transcendence'].steps;

  const ensureTrialStarted = async (trialId: string, trialName: string) => {
    await startTrial({ variables: { realmId: REALM_ID, trialId, trialName } });
    await refetch();
  };

  const advanceTrialStep = async (trialId: string, prefixMessage?: string) => {
    const result = await completeTrialStep({
      variables: { realmId: REALM_ID, trialId },
    });

    const trialMessage = result.data.completeTrialStep.message;

    if (prefixMessage) {
      alert(`${prefixMessage}\n${trialMessage}`);
    } else {
      alert(trialMessage);
    }

    await refetch();
  };

  const handleLocationVisit = async (locationId: string, locationName: string) => {
    try {
      const result = await visitLocation({
        variables: { realmId: REALM_ID, locationId, locationName },
      });

      const visitMessage = result.data.visitLocation.message;

      if (locationId === 'void-temple' && trial1Started && trial1Steps === 0) {
        await advanceTrialStep('trial-unity-consciousness', visitMessage);
        return;
      }

      if (locationId === 'eternal-observatory' && trial2Started && trial2Steps === 0) {
        await advanceTrialStep('trial-perfect-balance', visitMessage);
        return;
      }

      alert(visitMessage);
      await refetch();
    } catch (error: any) {
      console.error('Location error:', error);
      alert('Error: ' + (error.message ?? 'Something went wrong'));
    }
  };

  if (status === 'loading' || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="neon-glow text-4xl mb-4">🌌</div>
          <p className="text-xl">Entering InterSiddhi...</p>
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

  const canExploreVoidTemple = trial1Started && trial1Steps === 0;
  const canExploreEternalObservatory = trial2Started && trial2Steps === 0;

  return (
    <>
      <RealmBackground
        videoSrc="/inter-siddhi_CityScape1.mp4"
        realmName="InterSiddhi"
        overlayOpacity={0.35}
      />

      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="text-center mb-12 fade-in">
            <div className="text-6xl mb-4 neon-glow prismatic-glow">🌌</div>
            <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-0-title">
              INTERSIDDHI
            </h1>
            <p className="text-xl text-secondary mb-2">[ REALM 0 • THE SOURCE ]</p>
            <p className="text-lg text-muted">Source & Balance • Where All Paths Converge</p>
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

          <div className="glass-card p-8 mb-8 fade-in prismatic-border" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-display mb-4">∞ THE ULTIMATE REALM ∞</h2>
            <p className="text-lg text-secondary mb-4">
              InterSiddhi is the realm beyond realms, the source from which all consciousness flows. Here, you achieve Ultimate Equanimity: perfect balance, transcendent awareness, and mastery over all Siddhis.
            </p>
            <p className="text-secondary mb-6">
              You are no longer the traveler — you are the journey itself.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="glass-card p-4 text-center prismatic-card">
                <div className="text-2xl font-display text-glow realm-0-glow">{realmProgress}%</div>
                <div className="text-xs text-muted">Transcendence</div>
              </div>
              <div className="glass-card p-4 text-center prismatic-card">
                <div className="text-2xl font-display text-glow">{completedTrialsCount} / 3</div>
                <div className="text-xs text-muted">Trials Complete</div>
              </div>
              <div className="glass-card p-4 text-center prismatic-card">
                <div className="text-2xl font-display text-glow">All</div>
                <div className="text-xs text-muted">Siddhis Mastered</div>
              </div>
              <div className="glass-card p-4 text-center prismatic-card">
                <div className="text-2xl font-display text-glow">
                  {completedTrialsCount >= 3 ? '✨ MASTERED' : '∞'}
                </div>
                <div className="text-xs text-muted">Status</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow prismatic-glow">∞</span>
              THE FINAL TRIALS
              <span className="text-glow prismatic-glow">∞</span>
            </h2>
            <div className="space-y-4">
              {/* Trial 1 */}
              <div className="quest-card fade-in prismatic-border" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl prismatic-glow">🕉️</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Unity Consciousness</h3>
                    <p className="text-sm text-secondary mb-3">
                      Enter the Void Temple, dissolve separation, and prove that the One lives within the Many.
                    </p>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span><span>{trial1Steps} / 3 Steps</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-bar-fill realm-0-bar" style={{ width: `${(trial1Steps / 3) * 100}%` }} />
                      </div>
                    </div>

                    {!trial1Started && (
                      <>
                        <button
                          className="btn-primary prismatic-btn mt-4"
                          onClick={() => ensureTrialStarted('trial-unity-consciousness', 'Trial of Unity Consciousness')}
                        >
                          BEGIN TRIAL OF UNITY CONSCIOUSNESS →
                        </button>
                        <p className="text-xs text-muted mt-2">
                          🔒 Start the trial to enter the temple path.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 0 && (
                      <>
                        <button
                          className="btn-primary prismatic-btn mt-4"
                          onClick={() =>
                            document.getElementById('locations-section')?.scrollIntoView({ behavior: 'smooth' })
                          }
                        >
                          STEP 1: ENTER THE VOID TEMPLE →
                        </button>
                        <p className="text-xs text-muted mt-2">
                          🔒 Visit The Void Temple to auto-complete the first step.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 1 && (
                      <>
                        <TrialPuzzle
                          puzzle={unityPuzzles[0]}
                          onSolved={async () => {
                            if (trial1Puzzle1Solved) return;
                            setTrial1Puzzle1Solved(true);
                            await advanceTrialStep('trial-unity-consciousness');
                          }}
                        />
                        <p className="text-xs text-muted mt-2">
                          🔒 Solve the first unity clue.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 2 && (
                      <>
                        <TrialPuzzle
                          puzzle={unityPuzzles[1]}
                          onSolved={async () => {
                            if (trial1Puzzle2Solved) return;
                            setTrial1Puzzle2Solved(true);
                            await advanceTrialStep('trial-unity-consciousness');
                          }}
                        />
                        <p className="text-xs text-muted mt-2">
                          🔒 Complete the final unity riddle.
                        </p>
                      </>
                    )}

                    {trial1?.isComplete && (
                      <div className="text-green-400 font-bold">✓ COMPLETE</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trial 2 */}
              <div className={`quest-card fade-in ${!trial1?.isComplete ? 'opacity-50' : ''}`} style={{ animationDelay: '0.3s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">☯️</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Perfect Balance</h3>
                    {trial1?.isComplete ? (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Enter the Eternal Observatory, hold all opposites in equilibrium, and prove that balance is living awareness.
                        </p>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span><span>{trial2Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div className="stat-bar-fill realm-0-bar" style={{ width: `${(trial2Steps / 3) * 100}%` }} />
                          </div>
                        </div>

                        {!trial2Started && (
                          <>
                            <button
                              className="btn-primary prismatic-btn mt-4"
                              onClick={() => ensureTrialStarted('trial-perfect-balance', 'Trial of Perfect Balance')}
                            >
                              BEGIN TRIAL OF PERFECT BALANCE →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Start the trial to open the observatory path.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 0 && (
                          <>
                            <button
                              className="btn-primary prismatic-btn mt-4"
                              onClick={() =>
                                document.getElementById('locations-section')?.scrollIntoView({ behavior: 'smooth' })
                              }
                            >
                              STEP 1: ENTER THE ETERNAL OBSERVATORY →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Visit The Eternal Observatory to auto-complete the first step.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 1 && (
                          <>
                            <TrialPuzzle
                              puzzle={balancePuzzles[0]}
                              onSolved={async () => {
                                if (trial2Puzzle1Solved) return;
                                setTrial2Puzzle1Solved(true);
                                await advanceTrialStep('trial-perfect-balance');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the first balance clue.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 2 && (
                          <>
                            <TrialPuzzle
                              puzzle={balancePuzzles[1]}
                              onSolved={async () => {
                                if (trial2Puzzle2Solved) return;
                                setTrial2Puzzle2Solved(true);
                                await advanceTrialStep('trial-perfect-balance');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Complete the final balance test.
                            </p>
                          </>
                        )}

                        {trial2?.isComplete && (
                          <div className="text-green-400 font-bold">✓ COMPLETE</div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">🔒 Complete Trial of Unity Consciousness to unlock</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Trial 3 */}
              <div className={`quest-card fade-in ${!trial2?.isComplete ? 'opacity-50' : ''}`} style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">✨</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Transcendence</h3>
                    {trial2?.isComplete ? (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Complete the final sequence of realization, balance, and source-recognition. You are not reaching the end — you are remembering it.
                        </p>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span><span>{trial3Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div className="stat-bar-fill realm-0-bar" style={{ width: `${(trial3Steps / 3) * 100}%` }} />
                          </div>
                        </div>

                        {!trial3Started && (
                          <>
                            <button
                              className="btn-primary prismatic-btn mt-4"
                              onClick={() => ensureTrialStarted('trial-transcendence', 'Trial of Transcendence')}
                            >
                              BEGIN TRIAL OF TRANSCENDENCE →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Start the final trial to enter the transcendence path.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 0 && (
                          <>
                            <TrialPuzzle
                              puzzle={transcendencePuzzles[0]}
                              onSolved={async () => {
                                if (trial3Puzzle1Solved) return;
                                setTrial3Puzzle1Solved(true);
                                await advanceTrialStep('trial-transcendence');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the first transcendence clue.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 1 && (
                          <>
                            <TrialPuzzle
                              puzzle={transcendencePuzzles[1]}
                              onSolved={async () => {
                                if (trial3Puzzle2Solved) return;
                                setTrial3Puzzle2Solved(true);
                                await advanceTrialStep('trial-transcendence');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the second transcendence riddle.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 2 && (
                          <>
                            <TrialPuzzle
                              puzzle={TRANSCENDENCE_FINAL_PUZZLE}
                              onSolved={async () => {
                                if (trial3Puzzle3Solved) return;
                                setTrial3Puzzle3Solved(true);
                                await advanceTrialStep('trial-transcendence');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 One final realization completes transcendence.
                            </p>
                          </>
                        )}

                        {trial3?.isComplete ? (
                          <div className="text-green-400 font-bold">✨ TRANSCENDENCE ACHIEVED</div>
                        ) : null}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">🔒 Complete Trial of Perfect Balance to unlock</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="locations-section" className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow prismatic-glow">📍</span> SACRED LOCATIONS <span className="text-glow prismatic-glow">📍</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`realm-portal ${canExploreVoidTemple || hasVisited('void-temple') ? 'unlocked' : 'locked'} fade-in prismatic-border`} style={{ animationDelay: '0.5s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl prismatic-glow">🌀</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Void Temple</h3>
                    <p className="text-sm text-secondary mb-3">Where form and formlessness dance in eternal balance.</p>
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('void-temple', 'The Void Temple')}
                      disabled={!canExploreVoidTemple || hasVisited('void-temple')}
                    >
                      {hasVisited('void-temple')
                        ? '✅ EXPLORED'
                        : canExploreVoidTemple
                          ? 'EXPLORE →'
                          : 'LOCKED UNTIL TRIAL 1 STARTS'}
                    </button>
                  </div>
                </div>
              </div>

              <div className={`realm-portal ${canExploreEternalObservatory || hasVisited('eternal-observatory') ? 'unlocked' : 'locked'} fade-in prismatic-border`} style={{ animationDelay: '0.6s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl prismatic-glow">💫</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Eternal Observatory</h3>
                    <p className="text-sm text-secondary mb-3">Witness all timelines, all possibilities, all realities at once.</p>
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('eternal-observatory', 'The Eternal Observatory')}
                      disabled={!canExploreEternalObservatory || hasVisited('eternal-observatory')}
                    >
                      {hasVisited('eternal-observatory')
                        ? '✅ EXPLORED'
                        : canExploreEternalObservatory
                          ? 'EXPLORE →'
                          : 'LOCKED UNTIL TRIAL 2 LOCATION STEP'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.7s' }}>
            <h2 className="text-2xl font-display mb-4">🎵 REALM SOUNDTRACK</h2>
            <p className="text-secondary mb-4">
              InterSiddhi resonates with transcendent frequencies of cosmic mastery and unity.
            </p>
            <RealmMusicPlayer
              trackUrl="/music/realms/0/walkingForward.mp3"
              trackTitle="Walking Forward"
              artist="Cosmic 888"
              realmName="InterSiddhi"
              realmColor="#E0E0E0"
              realmId={0}
            />
          </div>

          {completedTrialsCount >= 3 && (
            <div className="glass-card p-8 mb-8 text-center fade-in prismatic-border">
              <h3 className="text-2xl font-display mb-4 prismatic-glow">
                ✨ YOU HAVE MASTERED THE COSMOS ✨
              </h3>
              <p className="text-secondary mb-4 max-w-2xl mx-auto">
                All realms have been explored. All trials conquered. The journey never ends — it only transforms.
              </p>
              <Link href="/nexus">
                <button className="btn-primary">RETURN TO THE NEXUS →</button>
              </Link>
            </div>
          )}

          <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.9s' }}>
            <Link href="/nexus"><button className="btn-secondary">← BACK TO NEXUS</button></Link>
            <div className="text-sm text-glow prismatic-glow">∞ The Final Realm ∞</div>
          </div>
        </div>
      </div>
    </>
  );
}