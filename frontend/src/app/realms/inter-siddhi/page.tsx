"use client";

import React from "react";
import Link from "next/link";

export default function InterSiddhiPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-gray-100">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/inter-siddhi_CityScape1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-slate-900/60 to-emerald-900/80 z-10" />

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="backdrop-blur-md bg-black/30 rounded-xl p-8 max-w-3xl text-center shadow-2xl border border-emerald-500/30 space-y-6">
          <h1 className="text-4xl font-extrabold text-emerald-400 drop-shadow-md">🔱 InterSiddhi (0)</h1>
          <p className="italic text-gray-300">The Realm of Absolute Presence & Union</p>

          <p className="text-lg leading-relaxed">
            There is no more battle. No more illusion to fight.  
            In this space, Cosmic drops all seeking, all striving—he simply is.  
            The journey was never to "get there"—it was to remember who he always was.
          </p>

          <div className="text-md space-y-1">
            <p>
              <span className="font-bold text-red-400">Illusion:</span> There is something to gain
            </p>
            <p>
              <span className="font-bold text-yellow-400">Shadow Aspect:</span> Endless seeking, identity addiction
            </p>
            <p>
              <span className="font-bold text-green-400">Lesson:</span> Freedom is not the end—it's the origin.
            </p>
            <p>
              <span className="font-bold text-blue-400">Siddhi:</span> Universal Awareness & Timeless Presence
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/realms/astral-bazaar">
              <button className="px-6 py-3 bg-pink-700 hover:bg-pink-600 text-white rounded-full transition">
                🛍 Return to Astral Bazaar
              </button>
            </Link>

            <Link href="/scroll">
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition">
                📜 Back to Scroll
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}