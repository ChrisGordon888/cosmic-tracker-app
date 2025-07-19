// src/app/realms/fractured-frontier/page.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function FracturedFrontierPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-gray-100">
      {/* 🔥 Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
      >
        <source src="/fractured-frontier_CityScape1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 💫 Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-indigo-900/40 z-10" />

      {/* 🌌 Foreground Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-extrabold text-indigo-400 drop-shadow-md">🌌 Fractured Frontier (303)</h1>
          <p className="italic text-gray-300 text-lg drop-shadow">The Realm of Conflict & Survival</p>

          <p className="text-lg drop-shadow">
            This is where the journey begins—or shatters. A battlefield of betrayal, fire, and instinct.
            Cosmic is thrown into chaos, fighting for survival, clinging to power that slips through his fingers.
          </p>

          <p className="text-md space-y-1 drop-shadow">
            <span className="block font-bold text-red-400">Illusion:</span> Power = Domination  
            <br />
            <span className="block font-bold text-yellow-400">Shadow Aspect:</span> Rage, Scarcity, Control  
            <br />
            <span className="block font-bold text-green-400">Lesson:</span> Real power is within. Master your fire.  
            <br />
            <span className="block font-bold text-blue-400">Siddhi:</span> Resourcefulness & Adaptability
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/scroll">
              <button className="px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-full transition shadow-lg">
                🔮 Return to Scroll
              </button>
            </Link>

            <Link href="/realms/the-veil">
              <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition shadow-lg">
                ➡️ Enter The Veil
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}