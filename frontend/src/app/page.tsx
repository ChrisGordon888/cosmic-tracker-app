// src/app/page.tsx
"use client";

import CosmicBackground from "@/components/CosmicBackground";
import "@/styles/landingPage.css";
import Link from "next/link";

export default function LandingPage() {
    return (
        <main className="landing-page min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* NEW: Custom Cinematic Background Video */}
            <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/cosmic-landing-intro.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
            </div>

            <div className="relative z-10 p-6 max-w-2xl">
                <h1 className="landing-title text-4xl sm:text-5xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
                    🌌 THE COSMIC MULTIVERSE 🌌
                </h1>

                <p className="landing-description text-lg sm:text-xl text-gray-200 mb-4 drop-shadow-lg">
                    Six interconnected realms. Your music. Your journey.
                </p>

                <p className="text-md text-gray-300 mb-8 drop-shadow-lg">
                    Explore sonic landscapes, unlock Siddhis, and align your consciousness with the cosmos.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Link
                        href="/nexus"
                        className="landing-button-primary px-10 py-4 rounded-full font-bold text-lg transition transform hover:scale-105 inline-block shadow-2xl"
                    >
                        🌀 ENTER THE NEXUS
                    </Link>

                    <Link
                        href="/auth"
                        className="landing-button-secondary px-10 py-4 rounded-full font-bold text-lg transition transform hover:scale-105 inline-block shadow-2xl"
                    >
                        🪐 SIGN IN
                    </Link>
                </div>

                {/* Realm Preview Icons */}
                <div className="mt-12 grid grid-cols-3 md:grid-cols-6 gap-4 text-4xl opacity-70">
                    <div className="hover:scale-125 transition cursor-pointer drop-shadow-lg" title="Realm 303 - Fractured Frontier">🌪️</div>
                    <div className="hover:scale-125 transition cursor-pointer drop-shadow-lg" title="Realm 202 - The Veil">🕯️</div>
                    <div className="hover:scale-125 transition cursor-pointer drop-shadow-lg" title="Realm 101 - Moonlit Roads">🌙</div>
                    <div className="hover:scale-125 transition cursor-pointer drop-shadow-lg" title="Realm 55 - Skybound City">⛰️</div>
                    <div className="hover:scale-125 transition cursor-pointer drop-shadow-lg" title="Realm 44 - Astral Bazaar">🛍️</div>
                    <div className="hover:scale-125 transition cursor-pointer drop-shadow-lg" title="Realm 0 - InterSiddhi">🌌</div>
                </div>

                {/* Locked Ritual Dashboard Notice */}
                <div className="mt-12 glass-card p-6 border border-gray-700/50 rounded-xl backdrop-blur-sm bg-black/30">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-3xl">🔒</span>
                        <h3 className="text-xl font-bold text-gray-300">Ritual Dashboard</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                        Sacred tracking & gamification coming soon.
                        <br />
                        <span className="text-xs text-gray-500">Currently in development</span>
                    </p>
                </div>

                <p className="mt-8 text-sm text-gray-400">
                    First time here? <Link href="/auth" className="text-blue-400 hover:text-blue-300 underline">Create your account</Link>
                </p>
            </div>
        </main>
    );
}