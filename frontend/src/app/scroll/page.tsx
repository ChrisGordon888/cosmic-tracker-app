// src/app/scroll/page.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function CosmicScroll() {
  return (
    <main className="min-h-screen bg-black text-gray-200 px-6 py-12 flex flex-col items-center justify-start">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-4xl font-bold text-white">🌌 Reflections of the Traveler</h1>
        <h2 className="text-xl italic text-gray-400">The Three Mirrors of Becoming</h2>

        <p className="text-lg">
          Before there were Realms... there were Reflections.
          In the beginning, you were not a name, not a story, not even a seeker.
          You were a witness — watching, reacting, surviving.
          Then something cracked. Something <em>called</em>. And the journey began…
        </p>

        {/* Mirror I */}
        <section className="border-l-4 border-indigo-400 pl-4">
          <h3 className="text-2xl font-semibold">🪞 Mirror I: The Mirror of the World</h3>
          <p className="text-md text-gray-300 mt-2 italic">The Mirror of Matter</p>
          <p className="mt-2">
            This is what the eyes see. The battlefield of 303. The market mirage of 44.
            It reflects what <em>is happening</em> around you — but not who you truly are.
          </p>
        </section>

        {/* Mirror II */}
        <section className="border-l-4 border-purple-400 pl-4">
          <h3 className="text-2xl font-semibold">🪞 Mirror II: The Silver Mirror</h3>
          <p className="text-md text-gray-300 mt-2 italic">The Mirror of Identity</p>
          <p className="mt-2">
            This is the mirror you hold to yourself — crafted from memory, story, and survival.
            In 101, the past calls you. In 55, the image seduces you. But who are you without the echo?
          </p>
        </section>

        {/* Mirror III */}
        <section className="border-l-4 border-rose-400 pl-4">
          <h3 className="text-2xl font-semibold">🪞 Mirror III: The Obsidian Mirror</h3>
          <p className="text-md text-gray-300 mt-2 italic">The Mirror of Source</p>
          <p className="mt-2">
            No light. No reflection. Only absorption.
            This is the black screen, the void, the portal. It holds every version of you… and none.
            To look into it is to forget… and then remember.
          </p>
        </section>

        <div className="mt-12">
          <p className="text-lg font-medium text-white">Choose your mirror. Choose your realm. Begin your initiation.</p>
          <Link href="/realms/fractured-frontier">
            <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition">
              🌀 Enter Fractured Frontier
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}