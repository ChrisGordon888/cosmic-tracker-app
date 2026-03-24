'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import RealmBackground from '@/components/realm/RealmBackground';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';
import TrialPuzzle from '@/components/realm/TrialPuzzle';
import { REALM_303_PUZZLES, type PuzzleConfig } from '@/lib/realmPuzzles';
import {
  GET_ME,
  COMPLETE_TRIAL_STEP,
  START_TRIAL,
  VISIT_LOCATION,
  UNLOCK_REALM,
} from '@/graphql/realms';
import '@/styles/realmShared.css';
import '@/styles/realm303.css';

const CHAOS_FINAL_PUZZLE: PuzzleConfig = {
  id: 'chaos-step-3',
  trialId: 'trial-chaos-mastery',
  type: 'multiple-choice',
  prompt: 'Which path reflects mastery in the Fractured Frontier?',
  options: [
    'Avoid chaos completely and hide from it',
    'Control chaos and shape it into form',
    'Destroy every fragment before it spreads',
  ],
  correctOption: 'Control chaos and shape it into form',
  hint: 'Mastery here is not avoidance. It is disciplined transformation.',
};

export default function Realm303() {
  const { data: session, status } = useSession();

  const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME);
  const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
  const [startTrial] = useMutation(START_TRIAL);
  const [visitLocation] = useMutation(VISIT_LOCATION);
  const [unlockRealm] = useMutation(UNLOCK_REALM);

  const hasUnlockedNextRealmRef = useRef(false);

  // local puzzle state
  const [trial1Puzzle1Solved, setTrial1Puzzle1Solved] = useState(false);
  const [trial1Puzzle2Solved, setTrial1Puzzle2Solved] = useState(false);

  const [trial2Puzzle1Solved, setTrial2Puzzle1Solved] = useState(false);
  const [trial2Puzzle2Solved, setTrial2Puzzle2Solved] = useState(false);

  const [trial3Puzzle1Solved, setTrial3Puzzle1Solved] = useState(false);
  const [trial3Puzzle2Solved, setTrial3Puzzle2Solved] = useState(false);
  const [trial3Puzzle3Solved, setTrial3Puzzle3Solved] = useState(false);

  const user = userData?.me;
  const userLevel = user?.level || 1;
  const userXP = user?.xp || 0;
  const xpToNext = user?.xpToNextLevel || 100;

  const safeXpToNext = Math.max(xpToNext || 100, 1);
  const xpPercent = Math.min((userXP / safeXpToNext) * 100, 100);

  const realm303Trials = user?.completedTrials?.filter((t: any) => t.realmId === 303) || [];
  const completedTrialsCount = realm303Trials.filter((t: any) => t.isComplete).length;
  const realmProgress = Math.floor((completedTrialsCount / 3) * 100);

  const getTrial = (trialId: string) => {
    return realm303Trials.find((t: any) => t.trialId === trialId);
  };

  const realm303Locations = user?.visitedLocations?.filter((l: any) => l.realmId === 303) || [];

  const hasVisited = (locationId: string) => {
    return realm303Locations.some((l: any) => l.locationId === locationId);
  };

  const hasListenedToTrack = (realmId: number, trackTitle: string) => {
    return (
      user?.musicStats?.tracksListened?.some(
        (t: any) => t.realmId === realmId && t.trackTitle === trackTitle
      ) || false
    );
  };

  const hasListenedNotEnough = hasListenedToTrack(303, 'Not Enough');
  const isVeilUnlocked = user?.unlockedRealms?.includes(202);

  const trial1 = getTrial('trial-creation');
  const trial2 = getTrial('trial-transformation');
  const trial3 = getTrial('trial-chaos-mastery');

  const trial1Started = !!trial1;
  const trial2Started = !!trial2;
  const trial3Started = !!trial3;

  const trial1Steps = trial1?.stepsCompleted || 0;
  const trial2Steps = trial2?.stepsCompleted || 0;
  const trial3Steps = trial3?.stepsCompleted || 0;

  const creationPuzzles = REALM_303_PUZZLES['trial-creation'].steps;
  const transformationPuzzles = REALM_303_PUZZLES['trial-transformation'].steps;
  const chaosPuzzles = REALM_303_PUZZLES['trial-chaos-mastery'].steps;

  useEffect(() => {
    const nextRealmId = 202;
    const alreadyUnlocked = user?.unlockedRealms?.includes(nextRealmId);

    if (
      completedTrialsCount >= 3 &&
      user &&
      !alreadyUnlocked &&
      !hasUnlockedNextRealmRef.current
    ) {
      hasUnlockedNextRealmRef.current = true;

      unlockRealm({
        variables: { realmId: nextRealmId },
      })
        .then(() => {
          refetch();
        })
        .catch((error) => {
          console.error('Realm unlock error:', error);
        });
    }
  }, [completedTrialsCount, user, unlockRealm, refetch]);

  const ensureTrialStarted = async (trialId: string, trialName: string) => {
    await startTrial({
      variables: { realmId: 303, trialId, trialName },
    });
    await refetch();
  };

  const advanceTrialStep = async (trialId: string, prefixMessage?: string) => {
    const result = await completeTrialStep({
      variables: { realmId: 303, trialId },
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
        variables: { realmId: 303, locationId, locationName },
      });

      const visitMessage = result.data.visitLocation.message;

      // auto-advance trial steps from meaningful location actions
      if (locationId === 'glitch-district' && trial1Started && trial1Steps === 0) {
        await advanceTrialStep('trial-creation', visitMessage);
        return;
      }

      if (locationId === 'creation-forge' && trial2Started && trial2Steps === 0) {
        await advanceTrialStep('trial-transformation', visitMessage);
        return;
      }

      alert(visitMessage);
      await refetch();
    } catch (error: any) {
      console.error('Location visit error:', error);
      alert('Error: ' + (error.message || 'Something went wrong'));
    }
  };

  if (status === 'loading' || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="neon-glow text-4xl mb-4">🌪️</div>
          <p className="text-xl">Entering The Fractured Frontier...</p>
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
          <Link href="/auth" className="btn-primary">
            SIGN IN
          </Link>
        </div>
      </div>
    );
  }

  // location gating
  const canExploreGlitchDistrict = trial1Started && trial1Steps === 0;
  const canExploreCreationForge = trial2Started && trial2Steps === 0;

  const goToLocations = () => {
    document.getElementById('locations-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToMusic = () => {
    document.getElementById('music-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <RealmBackground
        videoSrc="/fractured-frontier_CityScape1.mp4"
        realmName="Fractured Frontier"
        overlayOpacity={0.5}
      />

      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="text-center mb-12 fade-in">
            <div className="text-6xl mb-4 neon-glow">🌪️</div>
            <h1
              className="text-5xl md:text-6xl font-display neon-glow mb-2"
              style={{ color: 'var(--realm-303-primary)' }}
            >
              FRACTURED FRONTIER
            </h1>
            <p className="text-xl text-secondary mb-2">[ REALM 303 ]</p>
            <p className="text-lg text-muted">Chaos & Creation • Where Reality Breaks</p>

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

          <div
            id="realm-description-card"
            className="glass-card p-8 mb-8 fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <h2 className="text-3xl font-display mb-4">⚡ WELCOME TO THE EDGE ⚡</h2>
            <p className="text-lg text-secondary mb-4">
              The Fractured Frontier is a realm of beautiful chaos—where glitches in reality become
              portals to new possibilities. This is the domain of creators, hackers, and rebels who
              reshape existence through sheer will.
            </p>
            <p className="text-secondary mb-6">
              Here, you'll learn to harness Creative Alchemy: the power to transmute chaos into
              order, destruction into creation. Every glitch is an opportunity. Every fracture, a
              doorway.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="glass-card p-4 text-center">
                <div
                  className="text-2xl font-display text-glow"
                  style={{ color: 'var(--realm-303-primary)' }}
                >
                  {realmProgress}%
                </div>
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
                  {isVeilUnlocked ? 'Unlocked' : 'Locked'}
                </div>
                <div className="text-xs text-muted">Next Realm</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">🎯</span>
              REALM TRIALS
              <span className="text-glow">🎯</span>
            </h2>

            <div className="space-y-4">
              {/* Trial 1 */}
              <div className="quest-card fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔥</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Creation</h3>
                    <p className="text-sm text-secondary mb-3">
                      Begin the trial, explore the district, solve the pattern, then use the soundtrack to unlock the final creation sequence.
                    </p>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{trial1Steps} / 3 Steps</span>
                      </div>
                      <div className="stat-bar">
                        <div
                          className="stat-bar-fill"
                          style={{ width: `${(trial1Steps / 3) * 100}%` }}
                        />
                      </div>
                    </div>

                    {!trial1Started && (
                      <>
                        <button
                          className="btn-primary mt-4"
                          onClick={() => ensureTrialStarted('trial-creation', 'Trial of Creation')}
                        >
                          BEGIN TRIAL OF CREATION →
                        </button>
                        <p className="text-xs text-muted mt-2">
                          🔒 Start the trial to unlock the first movement.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 0 && (
                      <>
                        <button className="btn-primary mt-4" onClick={goToLocations}>
                          STEP 1: EXPLORE GLITCH DISTRICT →
                        </button>
                        <p className="text-xs text-muted mt-2">
                          🔒 Visit The Glitch District to auto-complete the first step.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 1 && (
                      <>
                        <TrialPuzzle
                          puzzle={creationPuzzles[0]}
                          onSolved={async () => {
                            if (trial1Puzzle1Solved) return;
                            setTrial1Puzzle1Solved(true);
                            await advanceTrialStep('trial-creation');
                          }}
                        />
                        <p className="text-xs text-muted mt-2">
                          🔒 Solve the pattern challenge to stabilize creation.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 2 && !hasListenedNotEnough && (
                      <>
                        <button className="btn-primary mt-4" onClick={goToMusic}>
                          STEP 3: LISTEN TO THE SOUNDTRACK →
                        </button>
                        <p className="text-xs text-muted mt-2">
                          🔒 Listen to at least 80% of &quot;Not Enough&quot; to unlock the final creation puzzle.
                        </p>
                      </>
                    )}

                    {trial1Started && trial1Steps === 2 && hasListenedNotEnough && (
                      <>
                        <TrialPuzzle
                          puzzle={creationPuzzles[1]}
                          onSolved={async () => {
                            if (trial1Puzzle2Solved) return;
                            setTrial1Puzzle2Solved(true);
                            await advanceTrialStep('trial-creation');
                          }}
                        />
                        <p className="text-xs text-muted mt-2">
                          ✅ Soundtrack attuned. Solve the final creation sequence to complete the trial.
                        </p>
                      </>
                    )}

                    {trial1?.isComplete && <div className="text-green-400 font-bold">✓ COMPLETE</div>}
                  </div>
                </div>
              </div>

              {/* Trial 2 */}
              <div
                className={`quest-card fade-in ${!trial1?.isComplete ? 'opacity-50' : ''}`}
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚡</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Transformation</h3>

                    {trial1?.isComplete ? (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Enter the forge, decode its laws, then solve the deeper alchemy beneath transformation.
                        </p>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{trial2Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div
                              className="stat-bar-fill"
                              style={{ width: `${(trial2Steps / 3) * 100}%` }}
                            />
                          </div>
                        </div>

                        {!trial2Started && (
                          <>
                            <button
                              className="btn-primary mt-4"
                              onClick={() =>
                                ensureTrialStarted('trial-transformation', 'Trial of Transformation')
                              }
                            >
                              BEGIN TRIAL OF TRANSFORMATION →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Start the trial to unlock the forge path.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 0 && (
                          <>
                            <button className="btn-primary mt-4" onClick={goToLocations}>
                              STEP 1: VISIT CREATION FORGE →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Visit The Creation Forge to auto-complete the first step.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 1 && (
                          <>
                            <TrialPuzzle
                              puzzle={transformationPuzzles[0]}
                              onSolved={async () => {
                                if (trial2Puzzle1Solved) return;
                                setTrial2Puzzle1Solved(true);
                                await advanceTrialStep('trial-transformation');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Solve the first transformation puzzle to continue.
                            </p>
                          </>
                        )}

                        {trial2Started && trial2Steps === 2 && (
                          <>
                            <TrialPuzzle
                              puzzle={transformationPuzzles[1]}
                              onSolved={async () => {
                                if (trial2Puzzle2Solved) return;
                                setTrial2Puzzle2Solved(true);
                                await advanceTrialStep('trial-transformation');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Complete the final alchemy puzzle to finish the trial.
                            </p>
                          </>
                        )}

                        {trial2?.isComplete && <div className="text-green-400 font-bold">✓ COMPLETE</div>}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">
                        🔒 Complete Trial of Creation to unlock
                      </p>
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
                  <div className="text-4xl">🌀</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Chaos Mastery</h3>

                    {trial2?.isComplete ? (
                      <>
                        <p className="text-sm text-secondary mb-3">
                          Read deeply, uncover the hidden clue, face chaos directly, then prove you understand the law of mastery.
                        </p>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{trial3Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div
                              className="stat-bar-fill"
                              style={{ width: `${(trial3Steps / 3) * 100}%` }}
                            />
                          </div>
                        </div>

                        {!trial3Started && (
                          <>
                            <button
                              className="btn-primary mt-4"
                              onClick={() =>
                                ensureTrialStarted('trial-chaos-mastery', 'Trial of Chaos Mastery')
                              }
                            >
                              BEGIN TRIAL OF CHAOS MASTERY →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              🔒 Start the trial to enter the hidden clue sequence.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 0 && (
                          <>
                            <TrialPuzzle
                              puzzle={chaosPuzzles[0]}
                              onSolved={async () => {
                                if (trial3Puzzle1Solved) return;
                                setTrial3Puzzle1Solved(true);
                                await advanceTrialStep('trial-chaos-mastery');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 The answer is hidden in the realm description above.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 1 && (
                          <>
                            <TrialPuzzle
                              puzzle={chaosPuzzles[1]}
                              onSolved={async () => {
                                if (trial3Puzzle2Solved) return;
                                setTrial3Puzzle2Solved(true);
                                await advanceTrialStep('trial-chaos-mastery');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 Face the deeper riddle of chaos directly.
                            </p>
                          </>
                        )}

                        {trial3Started && trial3Steps === 2 && (
                          <>
                            <TrialPuzzle
                              puzzle={CHAOS_FINAL_PUZZLE}
                              onSolved={async () => {
                                if (trial3Puzzle3Solved) return;
                                setTrial3Puzzle3Solved(true);
                                await advanceTrialStep('trial-chaos-mastery');
                              }}
                            />
                            <p className="text-xs text-muted mt-2">
                              🔒 One final choice decides whether you understand mastery.
                            </p>
                          </>
                        )}

                        {trial3?.isComplete && <div className="text-green-400 font-bold">✓ COMPLETE</div>}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">
                        🔒 Complete Trial of Transformation to unlock
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="locations-section" className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">📍</span>
              LOCATIONS
              <span className="text-glow">📍</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`realm-portal ${canExploreGlitchDistrict || hasVisited('glitch-district') ? 'unlocked' : 'locked'} fade-in`}
                style={{ animationDelay: '0.5s' }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏙️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Glitch District</h3>
                    <p className="text-sm text-secondary mb-3">
                      Reality fragments here. Neon streets flicker between dimensions.
                    </p>
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('glitch-district', 'The Glitch District')}
                      disabled={!canExploreGlitchDistrict || hasVisited('glitch-district')}
                    >
                      {hasVisited('glitch-district')
                        ? '✅ EXPLORED'
                        : canExploreGlitchDistrict
                          ? 'EXPLORE →'
                          : 'LOCKED UNTIL TRIAL 1 STARTS'}
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`realm-portal ${canExploreCreationForge || hasVisited('creation-forge') ? 'unlocked' : 'locked'} fade-in`}
                style={{ animationDelay: '0.6s' }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🎨</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Creation Forge</h3>
                    <p className="text-sm text-secondary mb-3">
                      Where artists and hackers reshape reality itself.
                    </p>
                    <button
                      className="btn-secondary w-full"
                      onClick={() => handleLocationVisit('creation-forge', 'The Creation Forge')}
                      disabled={!canExploreCreationForge || hasVisited('creation-forge')}
                    >
                      {hasVisited('creation-forge')
                        ? '✅ EXPLORED'
                        : canExploreCreationForge
                          ? 'EXPLORE →'
                          : 'LOCKED UNTIL TRIAL 2 LOCATION STEP'}
                    </button>
                    {!canExploreCreationForge && !hasVisited('creation-forge') && (
                      <p className="text-xs text-muted mt-2">
                        🔒 The Creation Forge opens during Trial of Transformation.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="music-section" className="mb-8">
            <h2 className="text-2xl font-display mb-4">🎵 REALM SOUNDTRACK</h2>
            <p className="text-secondary mb-4">
              Every realm has its own sonic signature. Music unlocks hidden memories and pathways.
            </p>

            <RealmMusicPlayer
              trackUrl="/music/realms/303/notEnough.mp3"
              trackTitle="Not Enough"
              artist="Cosmic 888"
              realmName="Fractured Frontier"
              realmColor="#FF0040"
              realmId={303}
            />
          </div>

          <div
            className="flex justify-between items-center fade-in"
            style={{ animationDelay: '0.8s' }}
          >
            <Link href="/nexus">
              <button className="btn-secondary">← BACK TO NEXUS</button>
            </Link>

            {isVeilUnlocked ? (
              <Link href="/realms/202">
                <button className="btn-primary">ENTER THE VEIL →</button>
              </Link>
            ) : (
              <div className="text-sm text-muted">Next Realm: 🕯️ The Veil (Locked)</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}