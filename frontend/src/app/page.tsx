// src/app/page.tsx
"use client";

import CosmicBackground from "@/components/CosmicBackground";
import "@/styles/landingPage.css";
import Link from "next/link";

export default function LandingPage() {
    return (
        <main className="landing-page min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden">
            <CosmicBackground /> {/* 🌌 Your animated or static cosmic backdrop */}

            <div className="relative z-10 p-6 max-w-2xl">
                <h1 className="landing-title text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                    🌌 Welcome to The Cosmic Multiverse
                </h1>

                <p className="landing-description text-lg sm:text-xl text-gray-200 mb-8">
                    Track your rituals, explore six interconnected realms, and align your energy with the cosmos.
                    Your journey through consciousness begins here.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/nexus"
                        className="landing-button-primary px-8 py-4 rounded-full font-bold transition transform hover:scale-105 inline-block"
                    >
                        🌀 Enter The Nexus
                    </Link>

                    <Link
                        href="/home"
                        className="landing-button-secondary px-8 py-4 rounded-full font-bold transition transform hover:scale-105 inline-block"
                    >
                        🪐 Ritual Dashboard
                    </Link>
                </div>

                {/* Optional: Realm Preview */}
                <div className="mt-12 grid grid-cols-3 md:grid-cols-6 gap-4 text-4xl opacity-70">
                    <div className="hover:scale-125 transition cursor-pointer" title="Realm 303 - Fractured Frontier">🌪️</div>
                    <div className="hover:scale-125 transition cursor-pointer" title="Realm 202 - The Veil">🕯️</div>
                    <div className="hover:scale-125 transition cursor-pointer" title="Realm 101 - Moonlit Roads">🌙</div>
                    <div className="hover:scale-125 transition cursor-pointer" title="Realm 55 - Skybound City">⛰️</div>
                    <div className="hover:scale-125 transition cursor-pointer" title="Realm 44 - Astral Bazaar">🛍️</div>
                    <div className="hover:scale-125 transition cursor-pointer" title="Realm 0 - InterSiddhi">🌌</div>
                </div>

                <p className="mt-8 text-sm text-gray-400">
                    New here? <Link href="/auth" className="text-blue-400 hover:text-blue-300 underline">Sign in</Link> to begin
                </p>
            </div>
        </main>
    );
}