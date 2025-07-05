"use client";

import { useSession } from "next-auth/react";
import MoonPhaseCard from "@/components/MoonPhaseCard";
import AddPracticeQuestForm from "@/components/AddPracticeQuestForm";
import RitualPracticeSection from "@/components/RitualPracticeSection";
import "@/styles/trackerPage.css";
import CosmicBackground from "@/components/CosmicBackground"; // ✅ moving cosmic background



export default function TrackerPage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <main className="tracker-page flex flex-col items-center justify-center min-h-screen p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">⏳ Loading...</h1>
                <p className="max-w-md">Please wait while we load your cosmic data.</p>
            </main>
        );
    }

    if (!session) {
        return (
            <main className="tracker-page min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">🔒 Access Restricted</h1>
                <p className="max-w-md">Please sign in to view your tracker.</p>
            </main>
        );
    }

    return (
        <main className="tracker-page min-h-screen flex flex-col items-center justify-start p-6 relative overflow-hidden">
            <CosmicBackground /> {/* 🔮 background at the back */}

            <h1 className="text-3xl sm:text-4xl font-bold mb-8">📿 Ritual Discipline Tracker</h1>

            <div className="flex justify-center w-full max-w-3xl mb-10">
                <MoonPhaseCard />
            </div>

            <div className="flex justify-center w-full max-w-3xl mb-10">
                <AddPracticeQuestForm />
            </div>

            <div className="flex flex-col items-center w-full max-w-3xl mb-10">
            <h2 className="text-2xl font-bold mb-4">🧘 Today&apos;s Ritual Practices</h2>
                <RitualPracticeSection />
            </div>

            <p className="tracker-note">
                Strengthen your discipline by aligning daily quests with your core rituals 🌟
            </p>
        </main>
    );
}