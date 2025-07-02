"use client";

import { getTodayMoonPhase } from "@/utils/moonPhases";
import "@/styles/moonPhaseCard.css";

export default function MoonPhaseCard() {
    const todayMoon = getTodayMoonPhase();
    let dynamicTitle = "🌘 Moon Phase — Align with the Cosmos";

    if (todayMoon) {
        switch (todayMoon.phase) {
            case "New Moon":
                dynamicTitle = "🌑 New Moon — Fresh Beginnings";
                break;
            case "First Quarter":
                dynamicTitle = "🌓 First Quarter — Building Momentum";
                break;
            case "Full Moon":
                dynamicTitle = "🌕 Full Moon — Peak Illumination";
                break;
            case "Third Quarter":
                dynamicTitle = "🌗 Third Quarter — Reflect & Release";
                break;
            default:
                dynamicTitle = `🌘 ${todayMoon.phase} — Embrace the Transition`;
        }
    }

    return (
        <div className="moon-phase-card">
            {todayMoon ? (
                <>
                    <h2>{dynamicTitle}</h2>
                    <div className="moon-phase-content">
                        <span className="moon-icon">{todayMoon.icon}</span>
                        <p className="moon-date">{todayMoon.readableDate}</p>
                    </div>
                </>
            ) : (
                <p>Unable to load today's moon phase.</p>
            )}
        </div>
    );
}