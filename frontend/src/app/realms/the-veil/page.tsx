"use client";

import React from "react";
import Link from "next/link";

export default function TheVeilPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-gray-100">
      {/* 🔮 Video Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 sm:scale-100"
        >
          <source src="/the-veil_CityScape1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* 🌀 Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-indigo-800/40 to-black/50 z-10" />

      {/* 🌫️ Foreground Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-extrabold text-purple-400 drop-shadow-md">🔮 The Veil (202)</h1>
          <p className="italic text-gray-300 text-lg drop-shadow">The Realm of Illusion & Control</p>

          <p className="text-lg drop-shadow leading-relaxed">
            The deeper you look, the more you question. Nothing is what it seems.  
            Here, Cosmic faces the great deception—where lies dress as truth, and shadows whisper in trusted voices.
          </p>

          <p className="text-md space-y-1 drop-shadow">
            <span className="block font-bold text-red-400">Illusion:</span> Truth = What You Are Told  
            <br />
            <span className="block font-bold text-yellow-400">Shadow Aspect:</span> Fear, Doubt, Paranoia  
            <br />
            <span className="block font-bold text-green-400">Lesson:</span> Truth arises from within. Trust your inner eye.  
            <br />
            <span className="block font-bold text-blue-400">Siddhi:</span> Intuition & Discernment
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/realms/fractured-frontier">
              <button className="px-6 py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-full transition shadow-lg">
                ⬅️ Return to Fractured Frontier
              </button>
            </Link>

            <Link href="/realms/moonlit-roads">
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition shadow-lg">
                🌙 Enter Moonlit Roads
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}