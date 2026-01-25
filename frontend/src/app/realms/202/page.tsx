'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import RealmBackground from '@/components/realm/RealmBackground';
import '@/styles/realmShared.css';
import '@/styles/realm202.css';
import RealmMusicPlayer from '@/components/realm/RealmMusicPlayer';

/**
 * 🕯️ REALM 202: THE VEIL
 * Theme: Dreams & Longing
 * Color: Purple/Blue/Silver dreamcore aesthetic
 * Inspiration: Bleach's Soul Society, Demon Slayer's dream sequences
 */

export default function Realm202() {
    const { data: session, status } = useSession();
    const [realmProgress, setRealmProgress] = useState(0);

    if (status === 'loading') {
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
                videoSrc="/the-veil_CityScape1.mp4"
                realmName="The Veil"
                overlayOpacity={0.45}
            />

            <div className="min-h-screen pb-32">
                <div className="container mx-auto px-4 py-8 max-w-6xl">

                    {/* Header */}
                    <header className="text-center mb-12 fade-in">
                        <div className="text-6xl mb-4 neon-glow">🕯️</div>
                        <h1 className="text-5xl md:text-6xl font-display neon-glow mb-2 realm-202-title">
                            THE VEIL
                        </h1>
                        <p className="text-xl text-secondary mb-2">
                            [ REALM 202 ]
                        </p>
                        <p className="text-lg text-muted">
                            Dreams & Longing • Between Sleep and Waking
                        </p>
                    </header>

                    {/* Realm Description Card */}
                    <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-3xl font-display mb-4">🌙 THE REALM OF DREAMS 🌙</h2>
                        <p className="text-lg text-secondary mb-4">
                            The Veil is a liminal space between waking and sleeping, where dreams take form and memories become tangible. This is the realm of artists, dreamers, and those who seek what cannot be touched in the waking world.
                        </p>
                        <p className="text-secondary mb-6">
                            Here, you'll develop Clairvoyance: the ability to see beyond the material, to perceive hidden truths, and to navigate the subtle realms of intuition and psychic awareness.
                        </p>

                        {/* Realm Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="glass-card p-4 text-center">
                                <div className="text-2xl font-display text-glow realm-202-glow">
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
                                    <div className="text-4xl">🌫️</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-display mb-2">Trial of Dreamwalking</h3>
                                        <p className="text-sm text-secondary mb-3">
                                            Navigate the dreamscape. Remember what others have forgotten.
                                        </p>
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Progress</span>
                                                <span>0 / 3 Steps</span>
                                            </div>
                                            <div className="stat-bar">
                                                <div className="stat-bar-fill realm-202-bar" style={{ width: '0%' }} />
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
                                    <div className="text-4xl">👁️</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-display mb-2">Trial of Clairvoyance</h3>
                                        <p className="text-sm text-muted italic">
                                            🔒 Complete Trial of Dreamwalking to unlock
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Trial 3 - Locked */}
                            <div className="quest-card opacity-50 fade-in" style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">✨</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-display mb-2">Trial of Longing's End</h3>
                                        <p className="text-sm text-muted italic">
                                            🔒 Complete Trial of Clairvoyance to unlock
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
                                    <div className="text-4xl">🌌</div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-display mb-2">The Mist Gardens</h3>
                                        <p className="text-sm text-secondary mb-3">
                                            Ethereal gardens where memories bloom as flowers.
                                        </p>
                                        <button className="btn-secondary w-full">
                                            EXPLORE →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="realm-portal unlocked fade-in" style={{ animationDelay: '0.6s' }}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">🕯️</div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-display mb-2">The Lantern Archive</h3>
                                        <p className="text-sm text-secondary mb-3">
                                            A library of dreams, where lost wishes are kept in glass.
                                        </p>
                                        <button className="btn-secondary w-full">
                                            EXPLORE →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Music Section - Mysterious Way */}
                    <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.7s' }}>
                        <h2 className="text-2xl font-display mb-4">
                            🎵 REALM SOUNDTRACK
                        </h2>
                        <p className="text-secondary mb-4">
                            The Veil pulses with dreamy, ethereal beats that drift between worlds.
                        </p>
                        <RealmMusicPlayer
                            trackUrl="/music/realms/202/mysteriousWay.mp3"
                            trackTitle="Mysterious Way"
                            artist="Cosmic 888"
                            realmName="The Veil"
                            realmColor="#9D84B7"
                            realmId={202}
                        />
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center fade-in" style={{ animationDelay: '0.8s' }}>
                        <Link href="/nexus">
                            <button className="btn-secondary">
                                ← BACK TO NEXUS
                            </button>
                        </Link>
                        <div className="text-sm text-muted">
                            Next Realm: 🌙 Moonlit Roads (Locked)
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}