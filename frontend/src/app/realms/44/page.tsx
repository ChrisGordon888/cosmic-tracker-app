'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';
import TrialPuzzle from '@/components/realm/TrialPuzzle';
import { REALM_44_PUZZLES, type PuzzleConfig } from '@/lib/realmPuzzles';
import '@/styles/realmShared.css';
import '@/styles/realm44.css';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ME,
  COMPLETE_TRIAL_STEP,
  START_TRIAL,
  VISIT_LOCATION,
  UNLOCK_REALM,
} from '@/graphql/realms';

/**
 * 🛍️ REALM 44: ASTRAL BAZAAR
 * Theme: Hustle & Wisdom
 * Unlocks: Realm 0 (InterSiddhi) on full trial completion
 */

const REALM_ID = 44;
const NEXT_REALM_ID = 0;

const INFINITE_EXCHANGE_FINAL_PUZZLE: PuzzleConfig = {
  id: 'infinite-exchange-step-3',
  trialId: 'trial-infinite-exchange',
  type: 'multiple-choice',
  prompt: 'What defines a true infinite exchange?',
  options: [
    'Taking more than you give',
    'Giving and receiving in conscious balance',
    'Winning every trade at any cost',
  ],
  correctOption: 'Giving and receiving in conscious balance',
  hint: 'The final mastery is flow, not domination.',
};

export default function Realm44() {
  const { data: session, status } = useSession();

  const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME);
  const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
  const [startTrial] = useMutation(START_TRIAL);
  const [visitLocation] = useMutation(VISIT_LOCATION);
  const [unlockNextRealm] = useMutation(UNLOCK_REALM);
  const hasUnlockedRef = useRef(false);

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

  const isInterSiddhiUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);

  const trial1 = getTrial('trial-merchants-path');
  const trial2 = getTrial('trial-temporal-sight');
  const trial3 = getTrial('trial-infinite-exchange');

  const trial1Started = !!trial1;
  const trial2Started = !!trial2;
  const trial3Started = !!trial3;

  const trial1Steps = trial1?.stepsCompleted || 0;
  const trial2Steps = trial2?.stepsCompleted || 0;
  const trial3Steps = trial3?.stepsCompleted || 0;

  const merchantsPathPuzzles = REALM_44_PUZZLES['trial-merchants-path'].steps;
  const temporalSightPuzzles = REALM_44_PUZZLES['trial-temporal-sight'].steps;
  const infiniteExchangePuzzles = REALM_44_PUZZLES['trial-infinite-exchange'].steps;

  useEffect(() => {
    if (completedTrialsCount >= 3 && !hasUnlockedRef.current && user) {
      const alreadyUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);
      if (!alreadyUnlocked) {
        hasUnlockedRef.current = true;
        unlockNextRealm({ variables: { realmId: NEXT_REALM_ID } })
          .then(() => {
            refetch();
          })
          .catch((err) => console.error('Unlock error:', err));
      } else {
        hasUnlockedRef.current = true;
      }
    }
  }, [completedTrialsCount, user, unlockNextRealm, refetch]);

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

      if (locationId === 'merchant-quarter' && trial1Started && trial1Steps === 0) {
        await advanceTrialStep('trial-merchants-path', visitMessage);
        return;
      }

      if (locationId === 'gamblers-den' && trial2Started && trial2Steps === 0) {
        await advanceTrialStep('trial-temporal-sight', visitMessage);
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

  const canExploreMerchantQuarter = trial1Started && trial1Steps === 0;
  const canExploreGamblersDen = trial2Started && trial2Steps === 0;

  return (
    <>
      <RealmBackground
        videoSrc="/astral-bazaar_CityScape1.mp4"
        realmName="Astral Bazaar"
        overlayOpacity={0.45}
      />

      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="text-center mb-12 fade-in">
            <div className="text-6xl mb-4 neon-glow">🛍️</div>
            <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-44-title">
              ASTRAL BAZAAR
            </h1>
            <p className="text-xl text-secondary mb-2">[ REALM 44 ]</p>
            <p className="text-lg text-muted">Hustle & Wisdom • Where Everything Has Its Price</p>
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

          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-display mb-4">💰 THE COSMIC MARKETPLACE 💰</h2>
            <p className="text-lg text-secondary mb-4">
              The Astral Bazaar is an infinite market that exists outside of linear time, where souls trade knowledge, memories, and power. This is the domain of merchants, tricksters, and those who understand that everything can be negotiated.
            </p>
            <p className="text-secondary mb-6">
              Here, you'll develop Time Manipulation: the ability to bend temporal flow, to see cause and effect across timelines, and to master the art of strategic exchange.
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
                <div className="text-2xl font-display text-glow">0</div>
                <div className="text-xs text-muted">Siddhis Unlocked</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow">
                  {isInterSiddhiUnlocked ? 'Unlocked' : 'Locked'}
                </div>
                <div className="text-xs text-muted">Next Realm</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">🎯</span> REALM TRIALS <span className="text-glow">🎯</span>
            </h2>
            <div className="space-y-4">
              {/* Trial 1 */}
              <div className="quest-card fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⏳</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of the Merchant&apos;s Path</h3>
                    <p className="text-sm text-secondary mb-3">
                      Enter the Merchant Quarter, learn the cost of exchange, and prove you can recognize value before price.
                    </p>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span><span>{trial1Steps} / 3 Steps</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-bar-fill realm-44-bar" style={{ width: `${(trial1Steps / 3) * 100}%` }} />
                      </div>
                    </div>

                    {!trial1Started && (
                      <>
                        <button
                          className="btn-primary mt-4"
                          onClick={() => ensureTrialStarted('trial-merchants-path', "Trial of the Merchant's Path")}
                        >
                          BEGIN TRIAL OF THE MERCHANT&apos;S PATH →
                        </button>
                        <p className="text-xs text-muted mt-2">
                          🔒 Start the trial to enter the marketplace path.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 0 && (
                      <>
                        <button
                          className="btn-primary mt-4"
                          onClick={() =>
                            document.getElementById('locations-section')?.scrollIntoView({ behavior: 'smooth' })
                          }
                        >
                          STEP 1: ENTER THE MERCHANT QUARTER →
                        </button>
                        <p className="text-xs text-muted mt-2">
                          🔒 Visit The Merchant Quarter to auto-complete the first step.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 1 && (
                      <>
                        <TrialPuzzle
                          puzzle={merchantsPathPuzzles[0]}
                          onSolved={async () => {
                            if (trial1Puzzle1Solved) return;
                            setTrial1Puzzle1Solved(true);
                            await advanceTrialStep('trial-merchants-path');
                          }}
                        />
                        <p className="text-xs text-muted mt-2">
                          🔒 Solve the first merchant clue.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 2 && (
                      <>
                        <TrialPuzzle
                          puzzle={merchantsPathPuzzles[1]}
                          onSolved={async () => {
                            if (trial1Puzzle2Solved) return;
                            setTrial1Puzzle2Solved(true);
                            await advanceTrialStep('trial-merchants-path');
                          }}
                        />
                        <p className="text-xs text-muted mt-2">
                          🔒 Complete the final merchant riddle.
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
                  <div className="text-4xl">🔮</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Temporal Sight</h3>
                    {trial1?.isComplete ? (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Enter the Gambler&apos;s Den, see across timelines, and prove you understand the hidden cost of every decision.
                        </p>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span><span>{trial2Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div className="stat-bar-fill realm-44-bar" style={{ width: `${(trial2Steps / 3) * 100}%` }} />
                          </div>
                        </div>

                        {!trial2Started && (
                          <>
                            <button
                              className="btn-primary mt-4"
                              onClick={() => ensureTrialStarted('trial-temporal-sight', 'Trial of Temporal Sight')}
                            >
                              BEGIN TRIAL OF TEMPORAL SIGHT →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Start the trial to open the timeline path.
                            </p>
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
                              STEP 1: ENTER THE GAMBLER&apos;S DEN →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Visit The Gambler&apos;s Den to auto-complete the first step.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 1 && (
                          <>
                            <TrialPuzzle
                              puzzle={temporalSightPuzzles[0]}
                              onSolved={async () => {
                                if (trial2Puzzle1Solved) return;
                                setTrial2Puzzle1Solved(true);
                                await advanceTrialStep('trial-temporal-sight');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the first temporal clue.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 2 && (
                          <>
                            <TrialPuzzle
                              puzzle={temporalSightPuzzles[1]}
                              onSolved={async () => {
                                if (trial2Puzzle2Solved) return;
                                setTrial2Puzzle2Solved(true);
                                await advanceTrialStep('trial-temporal-sight');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Complete the final temporal test.
                            </p>
                          </>
                        )}

                        {trial2?.isComplete && (
                          <div className="text-green-400 font-bold">✓ COMPLETE</div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">🔒 Complete Trial of the Merchant&apos;s Path to unlock</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Trial 3 */}
              <div className={`quest-card fade-in ${!trial2?.isComplete ? 'opacity-50' : ''}`} style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">♾️</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of the Infinite Exchange</h3>
                    {trial2?.isComplete ? (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Master reciprocity, solve the balance clues, and prove that the deepest exchange is conscious flow, not accumulation.
                        </p>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span><span>{trial3Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div className="stat-bar-fill realm-44-bar" style={{ width: `${(trial3Steps / 3) * 100}%` }} />
                          </div>
                        </div>

                        {!trial3Started && (
                          <>
                            <button
                              className="btn-primary mt-4"
                              onClick={() => ensureTrialStarted('trial-infinite-exchange', 'Trial of the Infinite Exchange')}
                            >
                              BEGIN TRIAL OF THE INFINITE EXCHANGE →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Start the trial to enter the exchange path.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 0 && (
                          <>
                            <TrialPuzzle
                              puzzle={infiniteExchangePuzzles[0]}
                              onSolved={async () => {
                                if (trial3Puzzle1Solved) return;
                                setTrial3Puzzle1Solved(true);
                                await advanceTrialStep('trial-infinite-exchange');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the first exchange clue.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 1 && (
                          <>
                            <TrialPuzzle
                              puzzle={infiniteExchangePuzzles[1]}
                              onSolved={async () => {
                                if (trial3Puzzle2Solved) return;
                                setTrial3Puzzle2Solved(true);
                                await advanceTrialStep('trial-infinite-exchange');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the second exchange riddle.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 2 && (
                          <>
                            <TrialPuzzle
                              puzzle={INFINITE_EXCHANGE_FINAL_PUZZLE}
                              onSolved={async () => {
                                if (trial3Puzzle3Solved) return;
                                setTrial3Puzzle3Solved(true);
                                await advanceTrialStep('trial-infinite-exchange');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 One final choice completes the infinite exchange.
                            </p>
                          </>
                        )}

                        {trial3?.isComplete && (
                          <div className="text-green-400 font-bold">✓ COMPLETE</div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">🔒 Complete Trial of Temporal Sight to unlock</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="locations-section" className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">📍</span> LOCATIONS <span className="text-glow">📍</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`realm-portal ${canExploreMerchantQuarter || hasVisited('merchant-quarter') ? 'unlocked' : 'locked'} fade-in`} style={{ animationDelay: '0.5s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏪</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Merchant Quarter</h3>
                    <p className="text-sm text-secondary mb-3">Endless stalls selling memories, skills, and impossible artifacts.</p>
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('merchant-quarter', 'The Merchant Quarter')}
                      disabled={!canExploreMerchantQuarter || hasVisited('merchant-quarter')}
                    >
                      {hasVisited('merchant-quarter')
                        ? '✅ EXPLORED'
                        : canExploreMerchantQuarter
                          ? 'EXPLORE →'
                          : 'LOCKED UNTIL TRIAL 1 STARTS'}
                    </button>
                  </div>
                </div>
              </div>

              <div className={`realm-portal ${canExploreGamblersDen || hasVisited('gamblers-den') ? 'unlocked' : 'locked'} fade-in`} style={{ animationDelay: '0.6s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🎲</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Gambler&apos;s Den</h3>
                    <p className="text-sm text-secondary mb-3">Where fortunes shift with every roll and fate bends to the bold.</p>
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('gamblers-den', "The Gambler's Den")}
                      disabled={!canExploreGamblersDen || hasVisited('gamblers-den')}
                    >
                      {hasVisited('gamblers-den')
                        ? '✅ EXPLORED'
                        : canExploreGamblersDen
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

          <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.8s' }}>
            <Link href="/nexus"><button className="btn-secondary">← BACK TO NEXUS</button></Link>
            {isInterSiddhiUnlocked ? (
              <Link href="/realms/0">
                <button className="btn-primary">ENTER INTERSIDDHI →</button>
              </Link>
            ) : (
              <div className="text-sm text-muted">
                Next Realm: 🌌 InterSiddhi (Locked)
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}