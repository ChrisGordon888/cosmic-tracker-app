"use client";

import React from "react";
import Link from "next/link";

export default function AstralBazaarPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-gray-100">
      {/* 🎥 Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/astral-bazaar_CityScape1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 🌌 Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/60 to-rose-800/80 z-10" />

      {/* ✨ Foreground Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="backdrop-blur-md bg-black/30 rounded-xl p-8 max-w-3xl text-center shadow-2xl border border-pink-500/30 space-y-6">
          <h1 className="text-4xl font-extrabold text-pink-300 drop-shadow-md">🛍 The Astral Bazaar (44)</h1>
          <p className="italic text-gray-300">The Realm of Hustle, Temptation & Inner Choice</p>

          <p className="text-lg leading-relaxed">
            Cosmic walks through a dazzling market of options—success, love, power, freedom, all for sale.
            But every deal comes with a price: his time, his soul, or his truth.  
            The final test isn’t about gain—it’s about letting go.
          </p>

          <div className="text-md space-y-1">
            <p>
              <span className="font-bold text-red-400">Illusion:</span> Hustle = Freedom
            </p>
            <p>
              <span className="font-bold text-yellow-400">Shadow Aspect:</span> Greed, Addiction to Progress, Overconsumption
            </p>
            <p>
              <span className="font-bold text-green-400">Lesson:</span> True wealth is inner stillness & clarity.
            </p>
            <p>
              <span className="font-bold text-blue-400">Siddhi:</span> Time Manipulation & Flow Mastery
            </p>
          </div>

          {/* 🧭 Navigation Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/realms/skybound-city">
              <button className="px-6 py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-full transition">
                🏙 Return to Skybound City
              </button>
            </Link>

            <Link href="/realms/inter-siddhi">
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition">
                🔱 Enter InterSiddhi
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}