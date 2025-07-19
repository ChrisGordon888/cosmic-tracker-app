"use client";

import React from "react";
import Link from "next/link";

export default function SkyboundCityPage() {
    return (
        <main className="relative min-h-screen overflow-hidden text-gray-100">
            {/* 🏙 Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
                style={{ objectPosition: "center 75%" }}
            >
                <source src="/skybound-city_CityScape1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* 🌫️ Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-indigo-800/30 to-black/40 z-10" />

            {/* 🌇 Foreground Content */}
            <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8 text-center">
                <div className="max-w-3xl space-y-6">
                    <h1 className="text-4xl font-extrabold text-yellow-300 drop-shadow-md">🏙 Skybound City (55)</h1>
                    <p className="italic text-gray-300 text-lg drop-shadow">The Realm of Success & The Mirage of Arrival</p>

                    <p className="text-lg drop-shadow">
                        Cosmic reaches the skyline of success—lights, validation, recognition. But beneath the glamour,
                        a deeper emptiness whispers: “Is this really it?” The ego is loud here. But the soul stays quiet, watching.
                    </p>

                    <p className="text-md space-y-1 drop-shadow">
                        <span className="block font-bold text-red-400">Illusion:</span> Success = Validation
                        <br />
                        <span className="block font-bold text-yellow-400">Shadow Aspect:</span> Ego, Image Attachment, Comparison
                        <br />
                        <span className="block font-bold text-green-400">Lesson:</span> Your purpose is deeper than performance.
                        <br />
                        <span className="block font-bold text-blue-400">Siddhi:</span> Vision & Purpose
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/realms/moonlit-roads">
                            <button className="px-6 py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-full transition shadow-lg">
                                🌙 Return to Moonlit Roads
                            </button>
                        </Link>

                        <Link href="/realms/astral-bazaar">
                            <button className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full transition shadow-lg">
                                🛍 Enter The Astral Bazaar
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}