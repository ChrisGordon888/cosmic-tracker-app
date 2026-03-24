'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';
import TrialPuzzle from '@/components/realm/TrialPuzzle';
import { REALM_101_PUZZLES, type PuzzleConfig } from '@/lib/realmPuzzles';
import '@/styles/realmShared.css';
import '@/styles/realm101.css';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ME,
  COMPLETE_TRIAL_STEP,
  START_TRIAL,
  VISIT_LOCATION,
  UNLOCK_REALM,
} from '@/graphql/realms';

const REALM_ID = 101;
const NEXT_REALM_ID = 55;

const ILLUMINATED_FINAL_PUZZLE: PuzzleConfig = {
  id: 'illuminated-darkness-step-3',
  trialId: 'trial-illuminated-darkness',
  type: 'multiple-choice',
  prompt: 'Which path reflects illuminated darkness?',
  options: [
    'Destroy every shadow until nothing remains',
    'Walk consciously through shadow with light',
    'Hide inside the night and refuse to see',
  ],
  correctOption: 'Walk consciously through shadow with light',
  hint: 'This realm is about integration, awareness, and presence.',
};

export default function Realm101() {
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
  const hasVisited = (locationId: string) => realmLocations.some((l: any) => l.locationId === locationId);

  const isSkyboundUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);

  const trial1 = getTrial('trial-shadow-integration');
  const trial2 = getTrial('trial-midnight-clarity');
  const trial3 = getTrial('trial-illuminated-darkness');

  const trial1Started = !!trial1;
  const trial2Started = !!trial2;
  const trial3Started = !!trial3;

  const trial1Steps = trial1?.stepsCompleted || 0;
  const trial2Steps = trial2?.stepsCompleted || 0;
  const trial3Steps = trial3?.stepsCompleted || 0;

  const shadowPuzzles = REALM_101_PUZZLES['trial-shadow-integration'].steps;
  const midnightPuzzles = REALM_101_PUZZLES['trial-midnight-clarity'].steps;
  const illuminatedPuzzles = REALM_101_PUZZLES['trial-illuminated-darkness'].steps;

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

      if (locationId === 'rainfall-train' && trial1Started && trial1Steps === 0) {
        await advanceTrialStep('trial-shadow-integration', visitMessage);
        return;
      }

      if (locationId === 'noir-district' && trial2Started && trial2Steps === 0) {
        await advanceTrialStep('trial-midnight-clarity', visitMessage);
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
          <div className="neon-glow text-4xl mb-4">🌙</div>
          <p className="text-xl">Walking The Moonlit Roads...</p>
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

  const canExploreRainfallTrain = trial1Started && trial1Steps === 0;
  const canExploreNoirDistrict = trial2Started && trial2Steps === 0;

  return (
    <>
      <RealmBackground videoSrc="/moonlit-roads.mp4" realmName="Moonlit Roads" overlayOpacity={0.5} />

      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="text-center mb-12 fade-in">
            <div className="text-6xl mb-4 neon-glow">🌙</div>
            <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-101-title">
              MOONLIT ROADS
            </h1>
            <p className="text-xl text-secondary mb-2">[ REALM 101 ]</p>
            <p className="text-lg text-muted">Reflection & Shadows • Where Memory Meets Mystery</p>
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

          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-display mb-4">🌑 THE PATH OF SHADOWS 🌑</h2>
            <p className="text-lg text-secondary mb-4">
              Moonlit Roads is a realm of introspection and confrontation with one's shadow self. Neon rain falls on endless midnight streets where past and present converge.
            </p>
            <p className="text-secondary mb-6">
              Here, you'll master Lucid Awareness: the ability to remain conscious in the unconscious, to navigate your inner landscape, and to integrate shadow aspects of the self into wholeness.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow realm-101-glow">{realmProgress}%</div>
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
                  {isSkyboundUnlocked ? 'Unlocked' : 'Locked'}
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
                  <div className="text-4xl">🌑</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Shadow Integration</h3>
                    <p className="text-sm text-secondary mb-3">
                      Enter the shadow path, ride the Rainfall Train, confront what was denied, and integrate what follows you in silence.
                    </p>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{trial1Steps} / 3 Steps</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-bar-fill realm-101-bar" style={{ width: `${(trial1Steps / 3) * 100}%` }} />
                      </div>
                    </div>

                    {!trial1Started && (
                      <>
                        <button
                          className="btn-primary mt-4"
                          onClick={() => ensureTrialStarted('trial-shadow-integration', 'Trial of Shadow Integration')}
                        >
                          BEGIN TRIAL OF SHADOW INTEGRATION →
                        </button>
                        <p className="text-xs text-muted mt-2">
                          🔒 Start the trial to enter the shadow path.
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
                          STEP 1: BOARD THE RAINFALL TRAIN →
                        </button>
                        <p className="text-xs text-muted mt-2">
                          🔒 Visit The Rainfall Train to auto-complete the first step.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 1 && (
                      <>
                        <TrialPuzzle
                          puzzle={shadowPuzzles[0]}
                          onSolved={async () => {
                            if (trial1Puzzle1Solved) return;
                            setTrial1Puzzle1Solved(true);
                            await advanceTrialStep('trial-shadow-integration');
                          }}
                        />
                        <p className="text-xs text-muted mt-2">
                          🔒 Solve the first shadow-clue.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 2 && (
                      <>
                        <TrialPuzzle
                          puzzle={shadowPuzzles[1]}
                          onSolved={async () => {
                            if (trial1Puzzle2Solved) return;
                            setTrial1Puzzle2Solved(true);
                            await advanceTrialStep('trial-shadow-integration');
                          }}
                        />
                        <p className="text-xs text-muted mt-2">
                          🔒 Face what follows in silence and complete the trial.
                        </p>
                      </>
                    )}

                    {trial1?.isComplete && <div className="text-green-400 font-bold">✓ COMPLETE</div>}
                  </div>
                </div>
              </div>

              {/* Trial 2 */}
              <div className={`quest-card fade-in ${!trial1?.isComplete ? 'opacity-50' : ''}`} style={{ animationDelay: '0.3s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🌓</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Midnight Clarity</h3>
                    {trial1?.isComplete ? (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Walk into the Noir District, sharpen perception, and discover what midnight reveals.
                        </p>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span><span>{trial2Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div className="stat-bar-fill realm-101-bar" style={{ width: `${(trial2Steps / 3) * 100}%` }} />
                          </div>
                        </div>

                        {!trial2Started && (
                          <>
                            <button
                              className="btn-primary mt-4"
                              onClick={() => ensureTrialStarted('trial-midnight-clarity', 'Trial of Midnight Clarity')}
                            >
                              BEGIN TRIAL OF MIDNIGHT CLARITY →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Start the trial to open the noir path.
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
                              STEP 1: VISIT NOIR DISTRICT →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Visit The Noir District to auto-complete the first step.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 1 && (
                          <>
                            <TrialPuzzle
                              puzzle={midnightPuzzles[0]}
                              onSolved={async () => {
                                if (trial2Puzzle1Solved) return;
                                setTrial2Puzzle1Solved(true);
                                await advanceTrialStep('trial-midnight-clarity');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the first midnight clue.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 2 && (
                          <>
                            <TrialPuzzle
                              puzzle={midnightPuzzles[1]}
                              onSolved={async () => {
                                if (trial2Puzzle2Solved) return;
                                setTrial2Puzzle2Solved(true);
                                await advanceTrialStep('trial-midnight-clarity');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Complete the final clarity test.
                            </p>
                          </>
                        )}

                        {trial2?.isComplete && <div className="text-green-400 font-bold">✓ COMPLETE</div>}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">🔒 Complete Trial of Shadow Integration to unlock</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Trial 3 */}
              <div className={`quest-card fade-in ${!trial2?.isComplete ? 'opacity-50' : ''}`} style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🌕</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Illuminated Darkness</h3>
                    {trial2?.isComplete ? (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Reveal the hidden, solve the light-clue, and prove you can walk with awareness through shadow.
                        </p>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span><span>{trial3Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div className="stat-bar-fill realm-101-bar" style={{ width: `${(trial3Steps / 3) * 100}%` }} />
                          </div>
                        </div>

                        {!trial3Started && (
                          <>
                            <button
                              className="btn-primary mt-4"
                              onClick={() => ensureTrialStarted('trial-illuminated-darkness', 'Trial of Illuminated Darkness')}
                            >
                              BEGIN TRIAL OF ILLUMINATED DARKNESS →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Start the trial to enter the illuminated path.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 0 && (
                          <>
                            <TrialPuzzle
                              puzzle={illuminatedPuzzles[0]}
                              onSolved={async () => {
                                if (trial3Puzzle1Solved) return;
                                setTrial3Puzzle1Solved(true);
                                await advanceTrialStep('trial-illuminated-darkness');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the first illumination clue.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 1 && (
                          <>
                            <TrialPuzzle
                              puzzle={illuminatedPuzzles[1]}
                              onSolved={async () => {
                                if (trial3Puzzle2Solved) return;
                                setTrial3Puzzle2Solved(true);
                                await advanceTrialStep('trial-illuminated-darkness');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the second illumination riddle.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 2 && (
                          <>
                            <TrialPuzzle
                              puzzle={ILLUMINATED_FINAL_PUZZLE}
                              onSolved={async () => {
                                if (trial3Puzzle3Solved) return;
                                setTrial3Puzzle3Solved(true);
                                await advanceTrialStep('trial-illuminated-darkness');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 One final choice completes the moonlit path.
                            </p>
                          </>
                        )}

                        {trial3?.isComplete && <div className="text-green-400 font-bold">✓ COMPLETE</div>}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">🔒 Complete Trial of Midnight Clarity to unlock</p>
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
              <div className={`realm-portal ${canExploreRainfallTrain || hasVisited('rainfall-train') ? 'unlocked' : 'locked'} fade-in`} style={{ animationDelay: '0.5s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🚇</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Rainfall Train</h3>
                    <p className="text-sm text-secondary mb-3">An endless train through neon-lit streets in perpetual rain.</p>
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('rainfall-train', 'The Rainfall Train')}
                      disabled={!canExploreRainfallTrain || hasVisited('rainfall-train')}
                    >
                      {hasVisited('rainfall-train')
                        ? '✅ EXPLORED'
                        : canExploreRainfallTrain
                          ? 'EXPLORE →'
                          : 'LOCKED UNTIL TRIAL 1 STARTS'}
                    </button>
                  </div>
                </div>
              </div>

              <div className={`realm-portal ${canExploreNoirDistrict || hasVisited('noir-district') ? 'unlocked' : 'locked'} fade-in`} style={{ animationDelay: '0.6s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏙️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Noir District</h3>
                    <p className="text-sm text-secondary mb-3">Where secrets hide in shadows and truth walks in moonlight.</p>
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('noir-district', 'The Noir District')}
                      disabled={!canExploreNoirDistrict || hasVisited('noir-district')}
                    >
                      {hasVisited('noir-district')
                        ? '✅ EXPLORED'
                        : canExploreNoirDistrict
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
              Moonlit Roads pulses with moody, atmospheric beats that echo through rain-soaked streets.
            </p>
            <RealmMusicPlayer
              trackUrl="/music/realms/101/nightLight.mp3"
              trackTitle="NightLight"
              artist="Cosmic 888"
              realmName="Moonlit Roads"
              realmColor="#00D4FF"
              realmId={101}
            />
          </div>

          <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.8s' }}>
            <Link href="/nexus"><button className="btn-secondary">← BACK TO NEXUS</button></Link>
            {isSkyboundUnlocked ? (
              <Link href="/realms/55">
                <button className="btn-primary">ENTER SKYBOUND CITY →</button>
              </Link>
            ) : (
              <div className="text-sm text-muted">
                Next Realm: ⛰️ Skybound City (Locked)
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}