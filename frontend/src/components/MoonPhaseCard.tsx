"use client";

import { getTodayMoonPhase } from "@/utils/moonPhases";

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
    <div className="mb-8 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 max-w-xl w-full">
      {todayMoon ? (
        <>
          <h2 className="text-xl font-semibold mb-3">{dynamicTitle}</h2>
          <div className="flex items-center gap-4">
            <span className="text-6xl">{todayMoon.icon}</span>
            <div className="text-left">
              <p className="text-sm text-gray-600 dark:text-gray-300">{todayMoon.readableDate}</p>
            </div>
          </div>
        </>
      ) : (
        <p>Unable to load today's moon phase.</p>
      )}
    </div>
  );
}