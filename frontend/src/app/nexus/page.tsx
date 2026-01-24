'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTodayMoonPhase, getRealmMoonAlignment } from '@/lib/moonPhases';
import RealmBackground from '@/components/realm/RealmBackground';
import '@/styles/realmShared.css';  // ← ADD THIS
import '@/styles/nexus.css';        // ← ADD THIS

/**
 * 🌌 THE COSMIC NEXUS - HUB
 * Central dashboard where all travelers begin their journey
 * Inspired by: Solo Leveling system UI, Kingdom Hearts world map
 */

interface RealmPortalData {
    id: string;
    name: string;
    number: string;
    icon: string;
    status: 'unlocked' | 'locked' | 'current';
    progress: number;
    description: string;
    unlockRequirement?: string;
}

export default function CosmicNexusHub() {
    const { data: session, status } = useSession();
    const [moonPhase, setMoonPhase] = useState<any>(null);
    const [realmAlignment, setRealmAlignment] = useState<any>(null);
    const [userLevel, setUserLevel] = useState(1);
    const [currentXP, setCurrentXP] = useState(0);
    const [xpToNext, setXPToNext] = useState(100);

    // Initialize moon phase data
    useEffect(() => {
        const phase = getTodayMoonPhase();
        const alignment = getRealmMoonAlignment(phase.phase);
        setMoonPhase(phase);
        setRealmAlignment(alignment);
    }, []);

    // Realm data
    const realms: RealmPortalData[] = [
        {
            id: '303',
            name: 'FRACTURED FRONTIER',
            number: '303',
            icon: '🌪️',
            status: 'unlocked',
            progress: 0,
            description: 'Realm of Chaos & Creation',
        },
        {
            id: '202',
            name: 'THE VEIL',
            number: '202',
            icon: '🕯️',
            status: 'unlocked',
            progress: 0,
            description: 'Realm of Dreams & Longing',
        },
        {
            id: '101',
            name: 'MOONLIT ROADS',
            number: '101',
            icon: '🌙',
            status: 'locked',
            progress: 0,
            description: 'Realm of Reflection & Shadows',
            unlockRequirement: 'Complete Trial in The Veil',
        },
        {
            id: '55',
            name: 'SKYBOUND CITY',
            number: '55',
            icon: '⛰️',
            status: 'locked',
            progress: 0,
            description: 'Realm of Power & Manifestation',
            unlockRequirement: 'Complete Trial in Moonlit Roads',
        },
        {
            id: '44',
            name: 'ASTRAL BAZAAR',
            number: '44',
            icon: '🛍️',
            status: 'locked',
            progress: 0,
            description: 'Realm of Hustle & Wisdom',
            unlockRequirement: 'Complete Trial in Skybound City',
        },
        {
            id: '0',
            name: 'COSMIC NEXUS',
            number: '0',
            icon: '🌌',
            status: 'locked',
            progress: 0,
            description: 'Realm of Source & Transcendence',
            unlockRequirement: 'Master All Realms',
        },
    ];

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="neon-glow text-4xl mb-4">🌌</div>
                    <p className="text-xl">Loading The Nexus...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="glass-card p-12 max-w-md text-center">
                    <h1 className="text-4xl font-display neon-glow mb-4">
                        🌌 THE COSMIC NEXUS 🌌
                    </h1>
                    <p className="text-lg text-secondary mb-8">
                        You must sign in to enter the multiverse.
                    </p>
                    <Link href="/auth" className="btn-primary">
                        ENTER THE NEXUS
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Animated Background Video */}
            <RealmBackground
                videoSrc="/nexus-cockpit.mp4"
                realmName="The Cosmic Nexus"
                overlayOpacity={0.3}
            />

            <div className="min-h-screen pb-32">
                <div className="container mx-auto px-4 py-8 max-w-6xl">

                    {/* Header */}
                    <header className="text-center mb-12 fade-in">
                        <h1 className="text-5xl md:text-6xl font-display neon-glow mb-4">
                            🌌 THE COSMIC NEXUS 🌌
                        </h1>
                        <p className="text-xl text-secondary">
                            Central Hub • Your Journey Begins Here
                        </p>
                    </header>

                    {/* User Stats Card */}
                    <div className="glass-card p-8 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="flex flex-col md:flex-row items-center gap-6">

                            {/* Level Badge */}
                            <div className="level-badge">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs opacity-70">LVL</span>
                                    <span>{userLevel}</span>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-display mb-2">
                                    TRAVELER: {session.user?.name || 'Unknown'}
                                </h2>
                                <p className="text-secondary mb-4">
                                    Title: <span className="text-glow">Cosmic Initiate</span>
                                </p>

                                {/* XP Bar */}
                                <div className="mb-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Experience</span>
                                        <span className="text-stats">{currentXP} / {xpToNext} XP</span>
                                    </div>
                                    <div className="stat-bar">
                                        <div
                                            className="stat-bar-fill"
                                            style={{ width: `${(currentXP / xpToNext) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <p className="text-sm text-muted">
                                    Current Realm: <span className="text-primary">None</span> •
                                    Consciousness Level: <span className="text-glow">Awakening</span>
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="glass-card p-4">
                                    <div className="text-2xl font-display text-glow">0</div>
                                    <div className="text-xs text-muted">Streak</div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-2xl font-display text-glow">0</div>
                                    <div className="text-xs text-muted">Siddhis</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Moon Phase Card */}
                    {moonPhase && (
                        <div className="glass-card p-6 mb-8 fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-6">
                                <div className="text-6xl">{moonPhase.icon}</div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-display mb-2">
                                        {moonPhase.phase}
                                    </h3>
                                    <p className="text-secondary mb-2">{moonPhase.energy}</p>
                                    <p className="text-sm text-muted">{moonPhase.ritualFocus}</p>
                                </div>
                                {realmAlignment && (
                                    <div className="text-right">
                                        <p className="text-sm text-secondary mb-1">Aligned Realm</p>
                                        <p className="text-lg font-display text-glow">
                                            {realmAlignment.primaryRealm}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Realm Portals */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
                            <span className="text-glow">⚡</span>
                            REALM PORTALS
                            <span className="text-glow">⚡</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {realms.map((realm, index) => (
                                <div
                                    key={realm.id}
                                    className={`realm-portal ${realm.status} fade-in`}
                                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-5xl">{realm.icon}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-stats text-glow">
                                                    [{realm.number}]
                                                </span>
                                                <h3 className="text-xl font-display">{realm.name}</h3>
                                            </div>
                                            <p className="text-sm text-secondary mb-3">
                                                {realm.description}
                                            </p>

                                            {realm.status === 'unlocked' ? (
                                                <>
                                                    <div className="mb-3">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span>Progress</span>
                                                            <span>{realm.progress}%</span>
                                                        </div>
                                                        <div className="stat-bar">
                                                            <div
                                                                className="stat-bar-fill"
                                                                style={{ width: `${realm.progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <Link href={`/realms/${realm.id}`}>
                                                        <button className="btn-primary w-full">
                                                            ENTER REALM →
                                                        </button>
                                                    </Link>
                                                </>
                                            ) : (
                                                <div className="text-sm text-muted italic">
                                                    🔒 {realm.unlockRequirement}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Daily Rituals Section */}
                    <div className="glass-card p-6 mb-8 fade-in" style={{ animationDelay: '0.9s' }}>
                        <h2 className="text-2xl font-display mb-4">
                            📿 DAILY RITUALS
                        </h2>
                        <p className="text-secondary mb-4">
                            No rituals available yet. Complete your first realm to unlock daily quests.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="quest-card opacity-50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">⬜</span>
                                        <span className="text-sm">Locked Ritual {i}</span>
                                    </div>
                                    <p className="text-xs text-muted">Complete realm trials to unlock</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-in" style={{ animationDelay: '1s' }}>
                        <Link href="/profile">
                            <div className="glass-card p-6 text-center cursor-pointer hover:border-color-electric-blue transition-all">
                                <div className="text-4xl mb-2">👤</div>
                                <h3 className="font-display">PROFILE</h3>
                                <p className="text-sm text-muted">View Stats & Progress</p>
                            </div>
                        </Link>

                        <Link href="/leaderboard">
                            <div className="glass-card p-6 text-center cursor-pointer hover:border-color-electric-blue transition-all">
                                <div className="text-4xl mb-2">🏆</div>
                                <h3 className="font-display">LEADERBOARD</h3>
                                <p className="text-sm text-muted">Global Rankings</p>
                            </div>
                        </Link>

                        <Link href="/mysteries">
                            <div className="glass-card p-6 text-center cursor-pointer hover:border-color-electric-blue transition-all">
                                <div className="text-4xl mb-2">🧩</div>
                                <h3 className="font-display">MYSTERIES</h3>
                                <p className="text-sm text-muted">Solve Puzzles & Unlock Secrets</p>
                            </div>
                        </Link>
                    </div>

                    {/* Welcome Message for New Users */}
                    <div className="glass-card p-8 mt-8 text-center fade-in" style={{ animationDelay: '1.1s' }}>
                        <h3 className="text-2xl font-display mb-4 neon-glow">
                            WELCOME TO THE COSMIC MULTIVERSE
                        </h3>
                        <p className="text-secondary mb-4 max-w-2xl mx-auto">
                            You stand at the threshold of six interconnected realms, each representing a different aspect of consciousness and reality. Your journey is unique—where you begin depends on who you are right now.
                        </p>
                        <p className="text-sm text-muted mb-6">
                            Choose a realm above to begin your ascension, or let the moon guide your path.
                        </p>
                        <Link href="/onboarding">
                            <button className="btn-primary">
                                TAKE THE REALM ALIGNMENT QUESTIONNAIRE →
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}