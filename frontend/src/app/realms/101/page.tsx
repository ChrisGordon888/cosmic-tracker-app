'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import '@/styles/realmShared.css';
import '@/styles/realm101.css';

/**
 * 🌙 REALM 101: MOONLIT ROADS
 * Theme: Reflection & Shadows
 * Color: Deep Purple/Blue/Silver noir aesthetic
 * Inspiration: Batman Beyond's Gotham nights, Bleach's Hueco Mundo
 */

export default function Realm101() {
  const { data: session, status } = useSession();
  const [realmProgress, setRealmProgress] = useState(0);
  
  if (status === 'loading') {
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
        videoSrc="/moonlit-roads.mp4" 
        realmName="Moonlit Roads"
        overlayOpacity={0.5}
      />
      
      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          
          {/* Header */}
          <header className="text-center mb-12 fade-in">
            <div className="text-6xl mb-4 neon-glow">🌙</div>
            <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-101-title">
              MOONLIT ROADS
            </h1>
            <p className="text-xl text-secondary mb-2">
              [ REALM 101 ]
            </p>
            <p className="text-lg text-muted">
              Reflection & Shadows • Where Memory Meets Mystery
            </p>
          </header>

          {/* Realm Description Card */}
          <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-display mb-4">🌑 THE PATH OF SHADOWS 🌑</h2>
            <p className="text-lg text-secondary mb-4">
              Moonlit Roads is a realm of introspection and confrontation with one's shadow self. Neon rain falls on endless midnight streets where past and present converge. This is the domain of seekers, investigators, and those brave enough to face their darkest truths.
            </p>
            <p className="text-secondary mb-6">
              Here, you'll master Lucid Awareness: the ability to remain conscious in the unconscious, to navigate your inner landscape, and to integrate shadow aspects of the self into wholeness.
            </p>
            
            {/* Realm Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-display text-glow realm-101-glow">
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
                  <div className="text-4xl">🌑</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Shadow Integration</h3>
                    <p className="text-sm text-secondary mb-3">
                      Confront your shadow self. Accept what you've denied.
                    </p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>0 / 3 Steps</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-bar-fill realm-101-bar" style={{ width: '0%' }} />
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
                  <div className="text-4xl">🌓</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Midnight Clarity</h3>
                    <p className="text-sm text-muted italic">
                      🔒 Complete Trial of Shadow Integration to unlock
                    </p>
                  </div>
                </div>
              </div>

              {/* Trial 3 - Locked */}
              <div className="quest-card opacity-50 fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🌕</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display mb-2">Trial of Illuminated Darkness</h3>
                    <p className="text-sm text-muted italic">
                      🔒 Complete Trial of Midnight Clarity to unlock
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
                  <div className="text-4xl">🚇</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Rainfall Train</h3>
                    <p className="text-sm text-secondary mb-3">
                      An endless train through neon-lit streets in perpetual rain.
                    </p>
                    <button className="btn-secondary w-full">
                      EXPLORE →
                    </button>
                  </div>
                </div>
              </div>

              <div className="realm-portal unlocked fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏙️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display mb-2">The Noir District</h3>
                    <p className="text-sm text-secondary mb-3">
                      Where secrets hide in shadows and truth walks in moonlight.
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
              Moonlit Roads pulses with moody, atmospheric beats that echo through rain-soaked streets.
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
              Next Realm: ⛰️ Skybound City (Locked)
            </div>
          </div>

        </div>
      </div>
    </>
  );
}