// src/app/page.tsx
"use client";

import CosmicBackground from "@/components/CosmicBackground"; // ✅ background video/image
import "@/styles/landingPage.css"; // ✅ custom landing styles (if desired)

export default function LandingPage() {
  return (
    <main className="landing-page min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden">
      <CosmicBackground /> {/* 🌌 Your animated or static cosmic backdrop */}

      <div className="relative z-10 p-6 max-w-2xl">
        <h1 className="landing-title text-4xl sm:text-5xl font-bold mb-6">
          🌌 Welcome to Cosmic Tracker
        </h1>

        <p className="landing-description text-lg sm:text-xl text-gray-200 mb-8">
          Align your energy, rituals, and intentions with the rhythm of the moon.
          Begin your sacred journey today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* <a
            href="/onboarding"
            className="landing-button-primary px-8 py-4 rounded-full font-bold transition transform hover:scale-105"
          >
            🌠 Begin Ritual Flow
          </a> */}
          <a
            href="/home"
            className="landing-button-secondary px-8 py-4 rounded-full font-bold transition transform hover:scale-105"
          >
            🪐 Explore Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}