"use client";

import { useSession } from "next-auth/react";
import MoonPhaseCard from "@/components/MoonPhaseCard";
import AddPracticeQuestForm from "@/components/AddPracticeQuestForm";
import RitualPracticeSection from "@/components/RitualPracticeSection";

export default function TrackerPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">⏳ Loading...</h1>
        <p className="text-gray-500 max-w-md">Please wait while we load your cosmic data.</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">🔒 Access Restricted</h1>
        <p className="text-gray-500 max-w-md">Please sign in to view your tracker.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-6">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">📿 Ritual Discipline Tracker</h1>

      <div className="flex justify-center w-full max-w-3xl mb-10">
        <MoonPhaseCard />
      </div>

      <div className="flex justify-center w-full max-w-3xl mb-10">
        <AddPracticeQuestForm />
      </div>

      <div className="flex flex-col items-center w-full max-w-3xl mb-10">
        <h2 className="text-2xl font-bold mb-4 text-center">🧘 Today's Ritual Practices</h2>
        <RitualPracticeSection />
      </div>

      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mt-12 text-center">
        Strengthen your discipline by aligning daily quests with your core rituals 🌟
      </p>
    </main>
  );
}