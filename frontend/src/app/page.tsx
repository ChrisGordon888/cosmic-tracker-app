// src/app/page.tsx
"use client";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">🌌 Welcome to Cosmic Tracker</h1>
      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-8">
        Align your energy, rituals, and intentions with the rhythm of the moon. Start your sacred journey today.
      </p>
      <div className="flex gap-4">
        <a
          href="/onboarding"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full transition"
        >
          Begin Ritual Flow
        </a>
        <a
          href="/home"
          className="border border-gray-300 dark:border-gray-700 px-6 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Explore Dashboard
        </a>
      </div>
    </main>
  );
}