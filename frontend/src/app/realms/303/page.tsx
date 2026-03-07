'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import '@/styles/realmShared.css';
import '@/styles/realm303.css';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, COMPLETE_TRIAL_STEP, START_TRIAL, VISIT_LOCATION } from '@/graphql/realms';

/**
 * 🌪️ REALM 303: FRACTURED FRONTIER
 * Theme: Chaos & Creation
 * Color: Red/Purple/Cyan glitch aesthetic
 * Inspiration: JJK's Shibuya, Batman Beyond's Gotham
 */

export default function Realm303() {
  const { data: session, status } = useSession();

  // 🆕 FETCH USER DATA FROM BACKEND
  const { data: userData, loading: userLoading, refetch } = useQuery(GET_ME);
  const [completeTrialStep] = useMutation(COMPLETE_TRIAL_STEP);
  const [startTrial] = useMutation(START_TRIAL);
  const [visitLocation] = useMutation(VISIT_LOCATION);

  // 🆕 GET REAL USER DATA
  const user = userData?.me;
  const userLevel = user?.level || 1;
  const userXP = user?.xp || 0;
  const xpToNext = user?.xpToNextLevel || 100;

  // ✅ SAFETY (avoid divide-by-0 and cap at 100%)
  const safeXpToNext = Math.max(xpToNext || 100, 1);
  const xpPercent = Math.min((userXP / safeXpToNext) * 100, 100);

  // Calculate realm-specific progress
  const realm303Trials = user?.completedTrials?.filter((t: any) => t.realmId === 303) || [];
  const completedTrialsCount = realm303Trials.filter((t: any) => t.isComplete).length;
  const realmProgress = Math.floor((completedTrialsCount / 3) * 100);

  // Get specific trial progress
  const getTrial = (trialId: string) => {
    return realm303Trials.find((t: any) => t.trialId === trialId);
  };

  // Check if User Visited specific Location and log location ID
  const realm303Locations = user?.visitedLocations?.filter((l: any) => l.realmId === 303) || [];

  const hasVisited = (locationId: string) => {
    return realm303Locations.some((l: any) => l.locationId === locationId);
  };

  // Check if User has listened to specific track
  const hasListenedToTrack = (realmId: number, trackTitle: string) => {
    return (
      user?.musicStats?.tracksListened?.some(
        (t: any) => t.realmId === realmId && t.trackTitle === trackTitle
      ) || false
    );
  };

  const hasListenedNotEnough = hasListenedToTrack(303, 'Not Enough');

  // ✅ Split “start trial” vs “claim step”
  const ensureTrialStarted = async (trialId: string, trialName: string) => {
    await startTrial({
      variables: { realmId: 303, trialId, trialName },
    });
  };

  const claimTrialStep = async (trialId: string) => {
    const result = await completeTrialStep({
      variables: { realmId: 303, trialId },
    });

    alert(result.data.completeTrialStep.message);
    refetch();
  };

  // 🆕 HANDLE LOCATION VISIT
  const handleLocationVisit = async (locationId: string, locationName: string) => {
    try {
      const result = await visitLocation({
        variables: { realmId: 303, locationId, locationName },
      });

      alert(result.data.visitLocation.message);
      refetch();
    } catch (error: any) {
      console.error('Location visit error:', error);
      alert('Error: ' + (error.message || 'Something went wrong'));
    }
  };

  // 🆕 LOADING STATE
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

  // Trial data
  const trial1 = getTrial('trial-creation');
  const trial1Steps = trial1?.stepsCompleted || 0;

  // Requirements for Trial 1 steps:
  // Step 1: Explore Glitch District
  const trial1NeedsLocation = trial1Steps === 0 && !hasVisited('glitch-district');
  // Step 2: Listen to 80% of Not Enough (persisted from backend via tracksListened)
  const trial1NeedsMusic = trial1Steps === 1 && !hasListenedNotEnough;

  // Can claim step only if requirements are met
  const canClaimTrial1Step = !trial1NeedsLocation && !trial1NeedsMusic;

  const trial2 = getTrial('trial-transformation');
  const trial3 = getTrial('trial-chaos-mastery');

  return (
    <>
      {/* Animated Background Video */}
      <RealmBackground
        videoSrc="/fractured-frontier_CityScape1.mp4"
        realmName="Fractured Frontier"
        overlayOpacity={0.5}
      />

      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
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

            {/* 🆕 USER LEVEL DISPLAY */}
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

          {/* Realm Description Card */}
          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
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

            {/* 🆕 REAL REALM STATS */}
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
                <div className="text-2xl font-display text-glow">Locked</div>
                <div className="text-xs text-muted">Next Realm</div>
              </div>
            </div>
          </div>

          {/* Trials Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">🎯</span>
              REALM TRIALS
              <span className="text-glow">🎯</span>
            </h2>

            <div className="space-y-4">
              {/* 🆕 TRIAL 1 - REAL GATED FLOW */}
              <div className="quest-card fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔥</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Creation</h3>
                    <p className="text-sm text-secondary mb-3">
                      Create something from nothing. Channel chaos into form.
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

                    {trial1?.isComplete ? (
                      <div className="text-green-400 font-bold">✓ COMPLETE</div>
                    ) : (
                      <>
                        <button
                          className="btn-primary"
                          onClick={async () => {
                            try {
                              await ensureTrialStarted('trial-creation', 'Trial of Creation');

                              // If requirement not met, guide user (no XP claimed)
                              if (trial1NeedsLocation) {
                                document
                                  .getElementById('locations-section')
                                  ?.scrollIntoView({ behavior: 'smooth' });
                                return;
                              }

                              if (trial1NeedsMusic) {
                                document
                                  .getElementById('music-section')
                                  ?.scrollIntoView({ behavior: 'smooth' });
                                return;
                              }

                              // ✅ Claim XP + step progression
                              await claimTrialStep('trial-creation');
                            } catch (err: any) {
                              console.error(err);
                              alert('Error: ' + (err.message || 'Something went wrong'));
                            }
                          }}
                          title={
                            trial1NeedsLocation
                              ? 'Explore The Glitch District first'
                              : trial1NeedsMusic
                                ? 'Listen to 80% of "Not Enough" first'
                                : 'Claim this step (+XP)'
                          }
                        >
                          {trial1NeedsLocation
                            ? 'GO TO GLITCH DISTRICT →'
                            : trial1NeedsMusic
                              ? 'GO TO MUSIC →'
                              : trial1
                                ? 'CLAIM STEP (+XP) →'
                                : 'BEGIN TRIAL →'}
                        </button>

                        {(trial1NeedsLocation || trial1NeedsMusic) && (
                          <p className="text-xs text-muted mt-2">
                            {trial1NeedsLocation &&
                              '🔒 Step 1: Explore The Glitch District to stabilize the realm.'}
                            {trial1NeedsMusic &&
                              ' 🔒 Step 2: Listen to 80% of "Not Enough" to charge the forge.'}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 🆕 TRIAL 2 - UNLOCKS AFTER TRIAL 1 */}
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
                          Transform chaos into order, destruction into creation.
                        </p>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{trial2?.stepsCompleted || 0} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div
                              className="stat-bar-fill"
                              style={{
                                width: `${(((trial2?.stepsCompleted || 0) as number) / 3) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        {trial2?.isComplete ? (
                          <div className="text-green-400 font-bold">✓ COMPLETE</div>
                        ) : (
                          <button
                            className="btn-primary"
                            onClick={async () => {
                              try {
                                await ensureTrialStarted(
                                  'trial-transformation',
                                  'Trial of Transformation'
                                );
                                await claimTrialStep('trial-transformation');
                              } catch (err: any) {
                                console.error(err);
                                alert('Error: ' + (err.message || 'Something went wrong'));
                              }
                            }}
                          >
                            {trial2 ? 'CLAIM STEP (+XP) →' : 'BEGIN TRIAL →'}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">🔒 Complete Trial of Creation to unlock</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 🆕 TRIAL 3 - UNLOCKS AFTER TRIAL 2 */}
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
                          Master the art of controlled chaos. Become the glitch.
                        </p>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{trial3?.stepsCompleted || 0} / 3 Steps</span>
                          </div>
                          <div className="stat-bar">
                            <div
                              className="stat-bar-fill"
                              style={{
                                width: `${(((trial3?.stepsCompleted || 0) as number) / 3) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        {trial3?.isComplete ? (
                          <div className="text-green-400 font-bold">✓ COMPLETE</div>
                        ) : (
                          <button
                            className="btn-primary"
                            onClick={async () => {
                              try {
                                await ensureTrialStarted(
                                  'trial-chaos-mastery',
                                  'Trial of Chaos Mastery'
                                );
                                await claimTrialStep('trial-chaos-mastery');
                              } catch (err: any) {
                                console.error(err);
                                alert('Error: ' + (err.message || 'Something went wrong'));
                              }
                            }}
                          >
                            {trial3 ? 'CLAIM STEP (+XP) →' : 'BEGIN TRIAL →'}
                          </button>
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

          {/* Locations Section */}
          <div id="locations-section" className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">📍</span>
              LOCATIONS
              <span className="text-glow">📍</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="realm-portal unlocked fade-in" style={{ animationDelay: '0.5s' }}>
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
                      disabled={hasVisited('glitch-district')}
                    >
                      {hasVisited('glitch-district') ? '✅ EXPLORED' : 'EXPLORE →'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="realm-portal unlocked fade-in" style={{ animationDelay: '0.6s' }}>
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
                      disabled={hasVisited('creation-forge')}
                    >
                      {hasVisited('creation-forge') ? '✅ EXPLORED' : 'EXPLORE →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Music Section */}
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

          {/* Navigation */}
          <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.8s' }}>
            <Link href="/nexus">
              <button className="btn-secondary">← BACK TO NEXUS</button>
            </Link>
            <div className="text-sm text-muted">Next Realm: 🕯️ The Veil (Locked)</div>
          </div>
        </div>
      </div>
    </>
  );
}