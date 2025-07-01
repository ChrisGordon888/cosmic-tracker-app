"use client";

import { useSession } from "next-auth/react";
import MoonPhaseCard from "@/components/MoonPhaseCard"; // new modular moon phase
import SacredYesSection from "@/components/SacredYesSection";
import MoodSection from "@/components/MoodSection";
import PracticeQuestsSection from "@/components/PracticeQuestsSection";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">⏳ Loading...</h1>
        <p className="text-gray-500 max-w-md">Checking your authentication status. Please wait!</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">🔒 Please Sign In</h1>
        <p className="text-gray-500 max-w-md">You need to be logged in to access this feature.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">🌙 Today's Cosmic Flow</h1>

      <MoonPhaseCard />

      <SacredYesSection />

      <MoodSection />

      <PracticeQuestsSection />

      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-8">
        Align with your rituals, your rhythm, and the moon. Choose a path to begin:
      </p>
    </main>
  );
}