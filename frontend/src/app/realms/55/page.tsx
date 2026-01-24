'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import '@/styles/realmShared.css';
import '@/styles/realm55.css';

/**
 * ⛰️ REALM 55: SKYBOUND CITY
 * Theme: Power & Manifestation
 * Color: Gold/White/Deep Blue divine aesthetic
 * Inspiration: Solo Leveling's power system, JoJo's Stand battles
 */

export default function Realm55() {
  const { data: session, status } = useSession();
  const [realmProgress, setRealmProgress] = useState(0);
  
  if (status === 'loading') {
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
        videoSrc="/skybound-city_CityScape1.mp4" 
        realmName="Skybound City"
        overlayOpacity={0.4}
      />
      
      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          
          {/* Header */}
          <header className="text-center mb-12 fade-in">
            <div className="text-6xl mb-4 neon-glow">⛰️</div>
            <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-55-title">
              SKYBOUND CITY
            </h1>
            <p className="text-xl text-secondary mb-2">
              [ REALM 55 ]
            </p>
            <p className="text-lg text-muted">
              Power & Manifestation • Where Will Becomes Reality
            </p>
          </header>

          {/* Realm Description Card */}
          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-display mb-4">⚡ THE CITADEL OF WILL ⚡</h2>
            <p className="text-lg text-secondary mb-4">
              Skybound City floats above the clouds, a gleaming metropolis where thought becomes form and intention shapes reality. This is the realm of kings, warriors, and those who command their destiny. Here, the strong rise and the weak are forged into strength.
            </p>
            <p className="text-secondary mb-6">
              Here, you'll unlock Manifestation Mastery: the power to bend reality to your will, to materialize your visions, and to command energy with absolute authority. Your thoughts are law. Your will is sovereign.
            </p>
            
            {/* Realm Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow realm-55-glow">
                  {realmProgress}%
                </div>
                <div className="text-xs text-muted">Progress</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow">0 / 5</div>
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
              {/* Trial 1 */}
              <div className="quest-card fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">👑</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Sovereignty</h3>
                    <p className="text-sm text-secondary mb-3">
                      Claim your throne. Command your domain with absolute authority.
                    </p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>0 / 3 Steps</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-bar-fill realm-55-bar" style={{ width: '0%' }} />
                      </div>
                    </div>
                    <button className="btn-primary">
                      BEGIN TRIAL →
                    </button>
                  </div>
                </div>
              </div>

              {/* Trial 2 - Locked */}
              <div className="quest-card opacity-50 fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚔️</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Power Manifestation</h3>
                    <p className="text-sm text-muted italic">
                      🔒 Complete Trial of Sovereignty to unlock
                    </p>
                  </div>
                </div>
              </div>

              {/* Trial 3 - Locked */}
              <div className="quest-card opacity-50 fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚡</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Divine Authority</h3>
                    <p className="text-sm text-muted italic">
                      🔒 Complete Trial of Power Manifestation to unlock
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Locations Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
              <span className="text-glow">📍</span>
              LOCATIONS
              <span className="text-glow">📍</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="realm-portal unlocked fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏛️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Tower of Ascension</h3>
                    <p className="text-sm text-secondary mb-3">
                      Climb higher. Each floor tests your will and strength.
                    </p>
                    <button className="btn-secondary w-full">
                      EXPLORE →
                    </button>
                  </div>
                </div>
              </div>

              <div className="realm-portal unlocked fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚔️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Arena of Kings</h3>
                    <p className="text-sm text-secondary mb-3">
                      Where warriors test their might and prove their worth.
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
          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.7s' }}>
            <h2 className="text-2xl font-display mb-4">
              🎵 REALM SOUNDTRACK
            </h2>
            <p className="text-secondary mb-4">
              Skybound City thunders with triumphant anthems of power and glory.
            </p>
            <div className="glass-card p-6 text-center bg-black/40">
              <div className="text-4xl mb-2">🎧</div>
              <p className="text-muted">Music player coming soon...</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.8s' }}>
            <Link href="/nexus">
              <button className="btn-secondary">
                ← BACK TO NEXUS
              </button>
            </Link>
            <div className="text-sm text-muted">
              Next Realm: 🛍️ Astral Bazaar (Locked)
            </div>
          </div>

        </div>
      </div>
    </>
  );
}