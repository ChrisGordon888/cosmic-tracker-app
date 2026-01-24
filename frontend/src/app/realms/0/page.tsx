'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import '@/styles/realmShared.css';
import '@/styles/realm0.css';

/**
 * 🌌 REALM 0: INTERSIDDHI (COSMIC NEXUS)
 * Theme: Source & Balance
 * Color: Prismatic/White/All Colors - transcendent aesthetic
 * Inspiration: Kingdom Hearts' World That Never Was, Bleach's Royal Palace
 */

export default function Realm0() {
  const { data: session, status } = useSession();
  const [realmProgress, setRealmProgress] = useState(0);
  
  if (status === 'loading') {
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
          <h1 className="text-4xl font-display neon-glow mb-4">
            🔒 ACCESS DENIED
          </h1>
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

  return (
    <>
      {/* Animated Background Video */}
      <RealmBackground 
        videoSrc="/inter-siddhi_CityScape1.mp4" 
        realmName="InterSiddhi"
        overlayOpacity={0.35}
      />
      
      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          
          {/* Header */}
          <header className="text-center mb-12 fade-in">
            <div className="text-6xl mb-4 neon-glow prismatic-glow">🌌</div>
            <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-0-title">
              INTERSIDDHI
            </h1>
            <p className="text-xl text-secondary mb-2">
              [ REALM 0 • THE SOURCE ]
            </p>
            <p className="text-lg text-muted">
              Source & Balance • Where All Paths Converge
            </p>
          </header>

          {/* Realm Description Card */}
          <div className="glass-card p-8 mb-8 fade-in prismatic-border" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-display mb-4">∞ THE ULTIMATE REALM ∞</h2>
            <p className="text-lg text-secondary mb-4">
              InterSiddhi is the realm beyond realms, the source from which all consciousness flows and to which all consciousness returns. This is not a place but a state of being—the cosmic nexus where all dualities dissolve, where chaos and order, creation and destruction, light and shadow become one.
            </p>
            <p className="text-secondary mb-6">
              Here, you achieve Ultimate Equanimity: perfect balance, transcendent awareness, and mastery over all Siddhis. You are no longer the traveler—you are the journey itself. You are no longer seeking enlightenment—you ARE enlightenment.
            </p>
            
            {/* Realm Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="glass-card p-4 text-center prismatic-card">
                <div className="text-2xl font-display text-glow realm-0-glow">
                  {realmProgress}%
                </div>
                <div className="text-xs text-muted">Transcendence</div>
              </div>
              <div className="glass-card p-4 text-center prismatic-card">
                <div className="text-2xl font-display text-glow">0 / ∞</div>
                <div className="text-xs text-muted">Realizations</div>
              </div>
              <div className="glass-card p-4 text-center prismatic-card">
                <div className="text-2xl font-display text-glow">All</div>
                <div className="text-xs text-muted">Siddhis Mastered</div>
              </div>
              <div className="glass-card p-4 text-center prismatic-card">
                <div className="text-2xl font-display text-glow">∞</div>
                <div className="text-xs text-muted">Beyond</div>
              </div>
            </div>
          </div>

          {/* Trials Section */}
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
                      Dissolve the illusion of separation. Realize the One within the Many.
                    </p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>0 / 7 Steps</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-bar-fill realm-0-bar" style={{ width: '0%' }} />
                      </div>
                    </div>
                    <button className="btn-primary prismatic-btn">
                      BEGIN TRIAL →
                    </button>
                  </div>
                </div>
              </div>

              {/* Trial 2 - Locked */}
              <div className="quest-card opacity-50 fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">☯️</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Perfect Balance</h3>
                    <p className="text-sm text-muted italic">
                      🔒 Complete Trial of Unity Consciousness to unlock
                    </p>
                  </div>
                </div>
              </div>

              {/* Trial 3 - Locked */}
              <div className="quest-card opacity-50 fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">✨</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Transcendence</h3>
                    <p className="text-sm text-muted italic">
                      🔒 Complete Trial of Perfect Balance to unlock
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Locations Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow prismatic-glow">📍</span>
              SACRED LOCATIONS
              <span className="text-glow prismatic-glow">📍</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="realm-portal unlocked fade-in prismatic-border" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl prismatic-glow">🌀</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Void Temple</h3>
                    <p className="text-sm text-secondary mb-3">
                      Where form and formlessness dance in eternal balance.
                    </p>
                    <button className="btn-secondary w-full">
                      EXPLORE →
                    </button>
                  </div>
                </div>
              </div>

              <div className="realm-portal unlocked fade-in prismatic-border" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl prismatic-glow">💫</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Eternal Observatory</h3>
                    <p className="text-sm text-secondary mb-3">
                      Witness all timelines, all possibilities, all realities at once.
                    </p>
                    <button className="btn-secondary w-full">
                      EXPLORE →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Music Section - Placeholder */}
          <div className="glass-card p-8 mb-8 fade-in prismatic-border" style={{ animationDelay: '0.7s' }}>
            <h2 className="text-2xl font-display mb-4">
              🎵 REALM SOUNDTRACK
            </h2>
            <p className="text-secondary mb-4">
              InterSiddhi vibrates with the frequency of pure consciousness—the cosmic OM.
            </p>
            <div className="glass-card p-6 text-center bg-black/40">
              <div className="text-4xl mb-2 prismatic-glow">🎧</div>
              <p className="text-muted">Music player coming soon...</p>
            </div>
          </div>

          {/* Special Message */}
          <div className="glass-card p-8 mb-8 text-center fade-in prismatic-border" style={{ animationDelay: '0.8s' }}>
            <h3 className="text-2xl font-display mb-4 prismatic-glow">
              YOU HAVE REACHED THE SOURCE
            </h3>
            <p className="text-secondary mb-4 max-w-2xl mx-auto">
              This is not the end—it is the beginning of infinite beginnings. From here, all realms are open to you. All paths are yours to walk. All mysteries are yours to explore.
            </p>
            <p className="text-sm text-muted">
              The journey never ends. It only transforms.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.9s' }}>
            <Link href="/nexus">
              <button className="btn-secondary">
                ← BACK TO NEXUS
              </button>
            </Link>
            <div className="text-sm text-glow prismatic-glow">
              ∞ All Realms Unlocked ∞
            </div>
          </div>

        </div>
      </div>
    </>
  );
}