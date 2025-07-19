// src/app/realms/moonlit-roads/page.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function MoonlitRoadsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-gray-100">
      {/* 🌙 Video Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 sm:scale-100"
        >
          <source src="/moonlit-roads.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* 🌫️ Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-blue-900/40 to-black/60 z-10" />

      {/* 🧠 Foreground Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-extrabold text-blue-400 drop-shadow-md">🌙 Moonlit Roads (101)</h1>
          <p className="italic text-gray-300 text-lg drop-shadow">The Realm of Reflection & Emotional Echoes</p>

          <p className="text-lg drop-shadow leading-relaxed">
            Here, shadows aren't enemies—they're memories.  
            On Moonlit Roads, Cosmic wanders through dreams, regrets, and the fragments of past selves.  
            The pull of nostalgia tempts him to stay lost in what once was.
          </p>

          <p className="text-md space-y-1 drop-shadow">
            <span className="block font-bold text-red-400">Illusion:</span> The Past = Who You Are  
            <br />
            <span className="block font-bold text-yellow-400">Shadow Aspect:</span> Guilt, Shame, Emotional Loops  
            <br />
            <span className="block font-bold text-green-400">Lesson:</span> Honor your past—don’t live in it.  
            <br />
            <span className="block font-bold text-blue-400">Siddhi:</span> Lucid Awareness & Emotional Mastery
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/realms/the-veil">
              <button className="px-6 py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-full transition shadow-lg">
                ⬅️ Return to The Veil
              </button>
            </Link>

            <Link href="/realms/skybound-city">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition shadow-lg">
                🏙 Enter Skybound City
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}