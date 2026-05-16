'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import RealmBackground from '@/components/realm/RealmBackground';
import RealmGuidanceCard from '@/components/realm/RealmGuidanceCard';
import RealmSoundstage from '@/components/realm/RealmSoundstage';
import RealmEntryGuidanceBanner from '@/components/realm/RealmEntryGuidanceBanner';
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

const REALM_ID = 303;
const NEXT_REALM_ID = 202;

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
  const [showProgression, setShowProgression] = useState(false);

  const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
  const [startTrial] = useMutation(START_TRIAL);
  const [visitLocation] = useMutation(VISIT_LOCATION);
  const [unlockRealm] = useMutation(UNLOCK_REALM);

  const hasUnlockedNextRealmRef = useRef(false);

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

  const realm303Trials =
    user?.completedTrials?.filter((t: any) => Number(t.realmId) === REALM_ID) ?? [];

  const completedTrialsCount = realm303Trials.filter(
    (t: any) => t.isComplete || (t.stepsCompleted ?? 0) >= 3
  ).length;

  const realmProgress = Math.floor((completedTrialsCount / 3) * 100);

  const getTrial = (trialId: string) =>
    realm303Trials.find((t: any) => t.trialId === trialId);

  const realm303Locations =
    user?.visitedLocations?.filter((l: any) => Number(l.realmId) === REALM_ID) ?? [];

  const hasVisited = (locationId: string) =>
    realm303Locations.some((l: any) => l.locationId === locationId);

  const hasListenedToTrack = (realmId: number, trackTitle: string) => {
    return (
      user?.musicStats?.tracksListened?.some(
        (t: any) =>
          Number(t.realmId) === Number(realmId) && t.trackTitle === trackTitle
      ) || false
    );
  };

  const hasListenedNotEnough = hasListenedToTrack(303, 'Not Enough');
  const isVeilUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);

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
    const alreadyUnlocked = user?.unlockedRealms?.includes(NEXT_REALM_ID);

    if (
      completedTrialsCount >= 3 &&
      user &&
      !alreadyUnlocked &&
      !hasUnlockedNextRealmRef.current
    ) {
      hasUnlockedNextRealmRef.current = true;

      unlockRealm({
        variables: { realmId: NEXT_REALM_ID },
      })
        .then(() => {
          refetch();
        })
        .catch((error) => {
          console.error('Realm unlock error:', error);
        });
    }
  }, [completedTrialsCount, user, unlockRealm, refetch, isVeilUnlocked]);

  const ensureTrialStarted = async (trialId: string, trialName: string) => {
    try {
      await startTrial({
        variables: { realmId: REALM_ID, trialId, trialName },
      });

      await refetch();
      alert(`${trialName} started.\nYour first realm path is now open.`);
    } catch (error: any) {
      console.error('Start trial error:', error);
      alert('Error starting trial: ' + (error.message || 'Something went wrong'));
    }
  };

  const advanceTrialStep = async (trialId: string, prefixMessage?: string) => {
    try {
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
    } catch (error: any) {
      console.error('Trial step error:', error);
      alert('Error advancing trial: ' + (error.message || 'Something went wrong'));
    }
  };

  const handleLocationVisit = async (locationId: string, locationName: string) => {
    try {
      const result = await visitLocation({
        variables: { realmId: REALM_ID, locationId, locationName },
      });

      const visitMessage = result.data.visitLocation.message;

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
      alert('Error visiting location: ' + (error.message || 'Something went wrong'));
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

      <div className="min-h-screen pb-32 realm-303-shell">
        <div className="container mx-auto px-4 py-8 max-w-6xl realm-303-container">
          <header className="text-center mb-10 fade-in realm-303-hero">
            <div className="text-6xl mb-4 neon-glow">🌪️</div>
            <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-303-title">
              FRACTURED FRONTIER
            </h1>
            <p className="text-xl text-secondary mb-2">[ REALM 303 ]</p>
            <p className="text-lg text-muted">Chaos &amp; Creation • Where Reality Breaks</p>

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

          <RealmEntryGuidanceBanner
            realmId={303}
            realmName="Fractured Frontier"
            realmColor="#FF4D6D"
          />

          <RealmGuidanceCard realmId={303} />

          <div id="music-section">
            <RealmSoundstage
              realmId={303}
              realmName="Fractured Frontier"
              realmIcon="🌪️"
              realmColor="#FF4D6D"
              intro="Fractured Frontier is where chaos, pressure, rupture, and raw activation become fuel for form. Let the soundtrack tell you whether this realm matches what you need to face right now."
              supportText="Start with the music first. If this realm feels true, open the optional Realm Path to explore trials, locations, and deeper world layers."
              progress={realmProgress}
              isUnlocked={true}
              isCurrentRealm={true}
            />
          </div>

          <div
            id="realm-description-card"
            className="glass-card realm-303-overview p-6 mb-8 fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-display mb-3">⚡ Realm Overview</h2>
                <p className="text-secondary mb-4">
                  The Fractured Frontier is the realm of rupture, creation under pressure,
                  and disciplined transformation. It is where disorder becomes material and
                  chaos is shaped into force.
                </p>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-secondary">Realm Path Progress</span>
                    <span className="text-stats">{realmProgress}%</span>
                  </div>

                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill realm-303-bar"
                      style={{ width: `${realmProgress}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm text-muted">
                  {completedTrialsCount} of 3 optional realm trials complete
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-[260px]">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-display text-glow realm-303-glow">
                    {completedTrialsCount} / 3
                  </div>
                  <div className="text-xs text-muted">Realm Path Trials</div>
                </div>

                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-display text-glow">
                    {isVeilUnlocked ? 'Unlocked' : 'Locked'}
                  </div>
                  <div className="text-xs text-muted">Next Realm</div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="glass-card p-4 mb-8 fade-in realm-303-progression-toggle"
            style={{ animationDelay: '0.15s' }}
          >
            <button
              onClick={() => setShowProgression((prev) => !prev)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-1">
                  Optional Realm Path
                </p>
                <h2 className="text-xl font-display">
                  Explore trials, locations, and unlocks
                </h2>
                <p className="text-sm text-muted mt-1">
                  The music is the entry point. Open the realm path when you want to go
                  deeper into the world and earn progression.
                </p>
              </div>

              <div className="text-2xl text-white/70 shrink-0 ml-4">
                {showProgression ? '▾' : '▸'}
              </div>
            </button>
          </div>

          {showProgression && (
            <>
              <div className="mb-8 fade-in">
                <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
                  <span className="text-glow">🎯</span>
                  REALM PATH
                  <span className="text-glow">🎯</span>
                </h2>

                <div className="space-y-4">
                  <div className="quest-card fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">🔥</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-display mb-2">Trial of Creation</h3>
                        <p className="text-sm text-secondary mb-3">
                          Begin the realm path, explore the district, solve the pattern,
                          then use the soundtrack to unlock the final creation sequence.
                        </p>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{trial1Steps} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div
                              className="stat-bar-fill realm-303-bar"
                              style={{ width: `${(trial1Steps / 3) * 100}%` }}
                            />
                          </div>
                        </div>

                        {!trial1Started && (
                          <>
                            <button
                              className="btn-primary mt-4"
                              onClick={() =>
                                ensureTrialStarted('trial-creation', 'Trial of Creation')
                              }
                            >
                              BEGIN REALM PATH →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              Start here to unlock the first location and begin earning realm XP.
                            </p>
                          </>
                        )}

                        {trial1Started && trial1Steps === 0 && (
                          <>
                            <button className="btn-primary mt-4" onClick={goToLocations}>
                              STEP 1: EXPLORE GLITCH DISTRICT →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              Visit The Glitch District to complete the first realm movement.
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
                              Solve the pattern challenge to stabilize creation.
                            </p>
                          </>
                        )}

                        {trial1Started && trial1Steps === 2 && !hasListenedNotEnough && (
                          <>
                            <button className="btn-primary mt-4" onClick={goToMusic}>
                              STEP 3: RETURN TO THE SOUNDTRACK →
                            </button>
                            <p className="text-xs text-muted mt-2">
                              Listen to &quot;Not Enough&quot; to unlock the final creation puzzle.
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

                        {trial1?.isComplete && (
                          <div className="text-green-400 font-bold">✓ COMPLETE</div>
                        )}
                      </div>
                    </div>
                  </div>

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
                                  className="stat-bar-fill realm-303-bar"
                                  style={{ width: `${(trial2Steps / 3) * 100}%` }}
                                />
                              </div>
                            </div>

                            {!trial2Started && (
                              <>
                                <button
                                  className="btn-primary mt-4"
                                  onClick={() =>
                                    ensureTrialStarted(
                                      'trial-transformation',
                                      'Trial of Transformation'
                                    )
                                  }
                                >
                                  BEGIN TRIAL OF TRANSFORMATION →
                                </button>
                                <p className="text-xs text-muted mt-2">
                                  Start the next movement to unlock the forge path.
                                </p>
                              </>
                            )}

                            {trial2Started && trial2Steps === 0 && (
                              <>
                                <button className="btn-primary mt-4" onClick={goToLocations}>
                                  STEP 1: VISIT CREATION FORGE →
                                </button>
                                <p className="text-xs text-muted mt-2">
                                  Visit The Creation Forge to complete this movement.
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
                                  Solve the first transformation puzzle to continue.
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
                                  Complete the final alchemy puzzle to finish the trial.
                                </p>
                              </>
                            )}

                            {trial2?.isComplete && (
                              <div className="text-green-400 font-bold">✓ COMPLETE</div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted italic">
                            🔒 Complete Trial of Creation to unlock
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

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
                              Read deeply, uncover the hidden clue, face chaos directly,
                              then prove you understand the law of mastery.
                            </p>

                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{trial3Steps} / 3 Steps</span>
                              </div>
                              <div className="stat-bar">
                                <div
                                  className="stat-bar-fill realm-303-bar"
                                  style={{ width: `${(trial3Steps / 3) * 100}%` }}
                                />
                              </div>
                            </div>

                            {!trial3Started && (
                              <>
                                <button
                                  className="btn-primary mt-4"
                                  onClick={() =>
                                    ensureTrialStarted(
                                      'trial-chaos-mastery',
                                      'Trial of Chaos Mastery'
                                    )
                                  }
                                >
                                  BEGIN TRIAL OF CHAOS MASTERY →
                                </button>
                                <p className="text-xs text-muted mt-2">
                                  Start the final path to enter the hidden clue sequence.
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
                                  The answer is hidden in the realm overview above.
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
                                  Face the deeper riddle of chaos directly.
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
                                  One final choice decides whether you understand mastery.
                                </p>
                              </>
                            )}

                            {trial3?.isComplete && (
                              <div className="text-green-400 font-bold">✓ COMPLETE</div>
                            )}
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

              <div id="locations-section" className="mb-8 fade-in">
                <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
                  <span className="text-glow">📍</span>
                  LOCATIONS
                  <span className="text-glow">📍</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`realm-portal ${
                      canExploreGlitchDistrict || hasVisited('glitch-district')
                        ? 'unlocked'
                        : 'locked'
                    } fade-in`}
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
                          onClick={() =>
                            handleLocationVisit('glitch-district', 'The Glitch District')
                          }
                          disabled={!canExploreGlitchDistrict || hasVisited('glitch-district')}
                        >
                          {hasVisited('glitch-district')
                            ? '✅ EXPLORED'
                            : canExploreGlitchDistrict
                              ? 'EXPLORE →'
                              : 'LOCKED UNTIL REALM PATH STARTS'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`realm-portal ${
                      canExploreCreationForge || hasVisited('creation-forge')
                        ? 'unlocked'
                        : 'locked'
                    } fade-in`}
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
                          onClick={() =>
                            handleLocationVisit('creation-forge', 'The Creation Forge')
                          }
                          disabled={!canExploreCreationForge || hasVisited('creation-forge')}
                        >
                          {hasVisited('creation-forge')
                            ? '✅ EXPLORED'
                            : canExploreCreationForge
                              ? 'EXPLORE →'
                              : 'LOCKED UNTIL TRANSFORMATION PATH'}
                        </button>
                        {!canExploreCreationForge && !hasVisited('creation-forge') && (
                          <p className="text-xs text-muted mt-2">
                            The Creation Forge opens during Trial of Transformation.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {completedTrialsCount >= 3 && (
            <div className="glass-card p-8 mb-8 text-center fade-in realm-303-complete-card">
              <h3 className="text-2xl font-display mb-4" style={{ color: '#FF4D6D' }}>
                🌪️ FRACTURED FRONTIER MASTERED 🌪️
              </h3>
              <p className="text-secondary mb-6 max-w-2xl mx-auto">
                Chaos has become your canvas. The Veil awaits — where dreams blur into
                reality and the unseen world speaks.
              </p>
              <Link href="/realms/202">
                <button
                  className="btn-primary"
                  style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}
                >
                  ENTER THE VEIL →
                </button>
              </Link>
            </div>
          )}

          <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.8s' }}>
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