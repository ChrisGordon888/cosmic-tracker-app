'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';
import TrialPuzzle from '@/components/realm/TrialPuzzle';
import { REALM_202_PUZZLES, type PuzzleConfig } from '@/lib/realmPuzzles';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ME,
  COMPLETE_TRIAL_STEP,
  START_TRIAL,
  VISIT_LOCATION,
  UNLOCK_REALM,
} from '@/graphql/realms';
import '@/styles/realmShared.css';
import '@/styles/realm202.css';

const REALM_ID = 202;
const NEXT_REALM_ID = 101;

const LONGINGS_FINAL_PUZZLE: PuzzleConfig = {
  id: 'longings-end-step-3',
  trialId: 'trial-longings-end',
  type: 'multiple-choice',
  prompt: 'Which path reflects the true lesson of longing’s end?',
  options: [
    'Cling tighter until the world yields',
    'Release grasping and rest in the present',
    'Chase every vision until none remain',
  ],
  correctOption: 'Release grasping and rest in the present',
  hint: 'This realm resolves longing through surrender, not control.',
};

export default function Realm202() {
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

  const getTrial = (trialId: string) =>
    realmTrials.find((t: any) => t.trialId === trialId);

  const realmLocations = user?.visitedLocations?.filter((l: any) => l.realmId === REALM_ID) ?? [];
  const hasVisited = (locationId: string) =>
    realmLocations.some((l: any) => l.locationId === locationId);

  const isMoonlitRoadsUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);

  const trial1 = getTrial('trial-dreamwalking');
  const trial2 = getTrial('trial-clairvoyance');
  const trial3 = getTrial('trial-longings-end');

  const trial1Started = !!trial1;
  const trial2Started = !!trial2;
  const trial3Started = !!trial3;

  const trial1Steps = trial1?.stepsCompleted || 0;
  const trial2Steps = trial2?.stepsCompleted || 0;
  const trial3Steps = trial3?.stepsCompleted || 0;

  const dreamwalkingPuzzles = REALM_202_PUZZLES['trial-dreamwalking'].steps;
  const clairvoyancePuzzles = REALM_202_PUZZLES['trial-clairvoyance'].steps;
  const longingsEndPuzzles = REALM_202_PUZZLES['trial-longings-end'].steps;

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
    await startTrial({
      variables: { realmId: REALM_ID, trialId, trialName },
    });
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

      if (locationId === 'mist-gardens' && trial1Started && trial1Steps === 0) {
        await advanceTrialStep('trial-dreamwalking', visitMessage);
        return;
      }

      if (locationId === 'lantern-archive' && trial2Started && trial2Steps === 0) {
        await advanceTrialStep('trial-clairvoyance', visitMessage);
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
          <div className="neon-glow text-4xl mb-4">🕯️</div>
          <p className="text-xl">Passing Through The Veil...</p>
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

  const canExploreMistGardens = trial1Started && trial1Steps === 0;
  const canExploreLanternArchive = trial2Started && trial2Steps === 0;

  const goToLocations = () => {
    document.getElementById('locations-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToMusic = () => {
    document.getElementById('music-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <RealmBackground
        videoSrc="/the-veil_CityScape1.mp4"
        realmName="The Veil"
        overlayOpacity={0.45}
      />

      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="text-center mb-12 fade-in">
            <div className="text-6xl mb-4 neon-glow">🕯️</div>
            <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-202-title">
              THE VEIL
            </h1>
            <p className="text-xl text-secondary mb-2">[ REALM 202 ]</p>
            <p className="text-lg text-muted">Dreams & Longing • Between Sleep and Waking</p>

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
            <h2 className="text-3xl font-display mb-4">🌙 THE REALM OF DREAMS 🌙</h2>
            <p className="text-lg text-secondary mb-4">
              The Veil is a liminal space between waking and sleeping, where dreams take form and memories become tangible. This is the realm of artists, dreamers, and those who seek what cannot be touched in the waking world.
            </p>
            <p className="text-secondary mb-6">
              Here, you'll develop Clairvoyance: the ability to see beyond the material, to perceive hidden truths, and to navigate the subtle realms of intuition and psychic awareness.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow realm-202-glow">{realmProgress}%</div>
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
                  {isMoonlitRoadsUnlocked ? 'Unlocked' : 'Locked'}
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
                  <div className="text-4xl">🌫️</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Dreamwalking</h3>
                    <p className="text-sm text-secondary mb-3">
                      Enter the dream path, walk the Mist Gardens, solve the first memory-clue, then use the realm soundtrack to unlock the final dream sequence.
                    </p>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{trial1Steps} / 3 Steps</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-bar-fill realm-202-bar" style={{ width: `${(trial1Steps / 3) * 100}%` }} />
                      </div>
                    </div>

                    {!trial1Started && (
                      <>
                        <button
                          className="btn-primary mt-4"
                          onClick={() => ensureTrialStarted('trial-dreamwalking', 'Trial of Dreamwalking')}
                        >
                          BEGIN TRIAL OF DREAMWALKING →
                        </button>
                        <p className="text-xs text-muted mt-2">
                          🔒 Start the trial to enter the dream path.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 0 && (
                      <>
                        <button className="btn-primary mt-4" onClick={goToLocations}>
                          STEP 1: VISIT MIST GARDENS →
                        </button>
                        <p className="text-xs text-muted mt-2">
                          🔒 Visit The Mist Gardens to auto-complete the first step.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 1 && (
                      <>
                        <TrialPuzzle
                          puzzle={dreamwalkingPuzzles[0]}
                          onSolved={async () => {
                            if (trial1Puzzle1Solved) return;
                            setTrial1Puzzle1Solved(true);
                            await advanceTrialStep('trial-dreamwalking');
                          }}
                        />
                        <p className="text-xs text-muted mt-2">
                          🔒 Recover the memory-clue to continue dreamwalking.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 2 && !hasVisited('mist-gardens') && (
                      <p className="text-xs text-muted mt-2">
                        🔒 The dream path is incomplete.
                      </p>
                    )}

                    {trial1Started && trial1Steps === 2 && (
                      <>
                        <button className="btn-primary mt-4" onClick={goToMusic}>
                          STEP 3: LISTEN TO THE SOUNDTRACK →
                        </button>
                        <TrialPuzzle
                          puzzle={dreamwalkingPuzzles[1]}
                          onSolved={async () => {
                            if (trial1Puzzle2Solved) return;
                            setTrial1Puzzle2Solved(true);
                            await advanceTrialStep('trial-dreamwalking');
                          }}
                        />
                        <p className="text-xs text-muted mt-2">
                          ✅ Enter the soundtrack and solve the final dream riddle to complete the trial.
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
                  <div className="text-4xl">👁️</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Clairvoyance</h3>
                    {trial1?.isComplete ? (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Enter the Lantern Archive, uncover hidden truth, and sharpen perception beyond ordinary sight.
                        </p>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{trial2Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div className="stat-bar-fill realm-202-bar" style={{ width: `${(trial2Steps / 3) * 100}%` }} />
                          </div>
                        </div>

                        {!trial2Started && (
                          <>
                            <button
                              className="btn-primary mt-4"
                              onClick={() => ensureTrialStarted('trial-clairvoyance', 'Trial of Clairvoyance')}
                            >
                              BEGIN TRIAL OF CLAIRVOYANCE →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Start the trial to open the archive path.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 0 && (
                          <>
                            <button className="btn-primary mt-4" onClick={goToLocations}>
                              STEP 1: VISIT LANTERN ARCHIVE →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Visit The Lantern Archive to auto-complete the first step.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 1 && (
                          <>
                            <TrialPuzzle
                              puzzle={clairvoyancePuzzles[0]}
                              onSolved={async () => {
                                if (trial2Puzzle1Solved) return;
                                setTrial2Puzzle1Solved(true);
                                await advanceTrialStep('trial-clairvoyance');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the first sight puzzle.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 2 && (
                          <>
                            <TrialPuzzle
                              puzzle={clairvoyancePuzzles[1]}
                              onSolved={async () => {
                                if (trial2Puzzle2Solved) return;
                                setTrial2Puzzle2Solved(true);
                                await advanceTrialStep('trial-clairvoyance');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Complete the final perception challenge.
                            </p>
                          </>
                        )}

                        {trial2?.isComplete && <div className="text-green-400 font-bold">✓ COMPLETE</div>}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">🔒 Complete Trial of Dreamwalking to unlock</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Trial 3 */}
              <div className={`quest-card fade-in ${!trial2?.isComplete ? 'opacity-50' : ''}`} style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">✨</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Longing&apos;s End</h3>
                    {trial2?.isComplete ? (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Release attachment, solve the longing-clue, then complete the final stillness test.
                        </p>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{trial3Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div className="stat-bar-fill realm-202-bar" style={{ width: `${(trial3Steps / 3) * 100}%` }} />
                          </div>
                        </div>

                        {!trial3Started && (
                          <>
                            <button
                              className="btn-primary mt-4"
                              onClick={() => ensureTrialStarted('trial-longings-end', "Trial of Longing's End")}
                            >
                              BEGIN TRIAL OF LONGING&apos;S END →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Start the trial to enter the release sequence.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 0 && (
                          <>
                            <TrialPuzzle
                              puzzle={longingsEndPuzzles[0]}
                              onSolved={async () => {
                                if (trial3Puzzle1Solved) return;
                                setTrial3Puzzle1Solved(true);
                                await advanceTrialStep('trial-longings-end');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the longing-clue.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 1 && (
                          <>
                            <TrialPuzzle
                              puzzle={longingsEndPuzzles[1]}
                              onSolved={async () => {
                                if (trial3Puzzle2Solved) return;
                                setTrial3Puzzle2Solved(true);
                                await advanceTrialStep('trial-longings-end');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the stillness riddle.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 2 && (
                          <>
                            <TrialPuzzle
                              puzzle={LONGINGS_FINAL_PUZZLE}
                              onSolved={async () => {
                                if (trial3Puzzle3Solved) return;
                                setTrial3Puzzle3Solved(true);
                                await advanceTrialStep('trial-longings-end');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 One final choice completes the release.
                            </p>
                          </>
                        )}

                        {trial3?.isComplete && <div className="text-green-400 font-bold">✓ COMPLETE</div>}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">🔒 Complete Trial of Clairvoyance to unlock</p>
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
              <div className={`realm-portal ${canExploreMistGardens || hasVisited('mist-gardens') ? 'unlocked' : 'locked'} fade-in`} style={{ animationDelay: '0.5s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🌌</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Mist Gardens</h3>
                    <p className="text-sm text-secondary mb-3">Ethereal gardens where memories bloom as flowers.</p>
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('mist-gardens', 'The Mist Gardens')}
                      disabled={!canExploreMistGardens || hasVisited('mist-gardens')}
                    >
                      {hasVisited('mist-gardens')
                        ? '✅ EXPLORED'
                        : canExploreMistGardens
                          ? 'EXPLORE →'
                          : 'LOCKED UNTIL TRIAL 1 STARTS'}
                    </button>
                  </div>
                </div>
              </div>

              <div className={`realm-portal ${canExploreLanternArchive || hasVisited('lantern-archive') ? 'unlocked' : 'locked'} fade-in`} style={{ animationDelay: '0.6s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🕯️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Lantern Archive</h3>
                    <p className="text-sm text-secondary mb-3">A library of dreams, where lost wishes are kept in glass.</p>
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('lantern-archive', 'The Lantern Archive')}
                      disabled={!canExploreLanternArchive || hasVisited('lantern-archive')}
                    >
                      {hasVisited('lantern-archive')
                        ? '✅ EXPLORED'
                        : canExploreLanternArchive
                          ? 'EXPLORE →'
                          : 'LOCKED UNTIL TRIAL 2 LOCATION STEP'}
                    </button>
                    {!canExploreLanternArchive && !hasVisited('lantern-archive') && (
                      <p className="text-xs text-muted mt-2">
                        🔒 The Lantern Archive opens during Trial of Clairvoyance.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="music-section" className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.7s' }}>
            <h2 className="text-2xl font-display mb-4">🎵 REALM SOUNDTRACK</h2>
            <p className="text-secondary mb-4">The Veil pulses with dreamy, ethereal beats that drift between worlds.</p>
            <RealmMusicPlayer
              trackUrl="/music/realms/202/mysteriousWay.mp3"
              trackTitle="Mysterious Way"
              artist="Cosmic 888"
              realmName="The Veil"
              realmColor="#9D84B7"
              realmId={202}
            />
          </div>

          {completedTrialsCount >= 3 && (
  <div className="glass-card p-8 mb-8 text-center fade-in"
    style={{ border: '1px solid rgba(147,112,219,0.5)' }}>
    <h3 className="text-2xl font-display mb-4" style={{ color: '#9370DB' }}>
      🕯️ THE VEIL TRANSCENDED 🕯️
    </h3>
    <p className="text-secondary mb-6 max-w-2xl mx-auto">
      You have released longing and found clarity. Moonlit Roads awaits — where shadow
      and light are finally reconciled.
    </p>
    <Link href="/realms/101">
      <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
        ENTER MOONLIT ROADS →
      </button>
    </Link>
  </div>
)}

          <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.8s' }}>
            <Link href="/nexus"><button className="btn-secondary">← BACK TO NEXUS</button></Link>

            {isMoonlitRoadsUnlocked ? (
              <Link href="/realms/101">
                <button className="btn-primary">ENTER MOONLIT ROADS →</button>
              </Link>
            ) : (
              <div className="text-sm text-muted">
                Next Realm: 🌙 Moonlit Roads (Locked)
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}