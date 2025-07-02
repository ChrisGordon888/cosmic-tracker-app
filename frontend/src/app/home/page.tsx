"use client";

import { useSession } from "next-auth/react";
import "@/styles/homePage.css";
import CosmicClock from "@/components/CosmicClock";
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
    <main className="home-page min-h-screen flex flex-col items-center justify-center text-center">
    <h1 className="home-page-title text-3xl sm:text-4xl font-bold mb-6">
      🌙 Today's Cosmic Flow
    </h1>
  
    <CosmicClock className="cosmic-clock" />
  
    <section className="w-full max-w-3xl">
      <MoonPhaseCard />
    </section>
  
    <section className="w-full max-w-3xl">
      <SacredYesSection />
    </section>
  
    <section className="w-full max-w-3xl">
      <MoodSection />
    </section>
  
    <section className="w-full max-w-3xl">
      <PracticeQuestsSection />
    </section>
  
    <p className="text-base sm:text-lg max-w-xl mb-8">
      Align with your rituals, your rhythm, and the moon. Choose a path to begin:
    </p>
  </main>
  );
}