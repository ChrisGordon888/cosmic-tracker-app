import moonData from "@/data/moonPhases2025.json";
import dayjs from "dayjs";

/**
 * 📅 parseDate
 * Parses full ISO datetime string into Date object.
 * Handles timestamps like "2025-07-02T13:30:00" correctly.
 */
function parseDate(dateStr) {
    if (!dateStr || typeof dateStr !== "string") {
        console.error("🚨 parseDate received invalid dateStr:", dateStr);
        return new Date(NaN);
    }
    const parsed = new Date(dateStr); // Let Date handle the ISO string
    if (isNaN(parsed)) {
        console.error("🚨 parseDate could not parse:", dateStr);
    }
    return parsed;
}

/**
 * 🌕 getMoonPhaseForDate
 * Finds the most recent past moon phase relative to targetDate.
 * Returns phase info for UI, or null if none found.
 */
export function getMoonPhaseForDate(targetDate) {
    if (!targetDate || !(targetDate instanceof Date)) {
        console.error("🚨 getMoonPhaseForDate received invalid Date:", targetDate);
        throw new Error("getMoonPhaseForDate requires a valid Date object.");
    }

    let latestPastPhase = null;

    console.log("🔎 Target date:", targetDate.toISOString());

    for (const entry of moonData) {
        if (!entry?.date || !entry.phase) continue;

        const entryDate = parseDate(entry.date);
        if (isNaN(entryDate)) continue;

        console.log(`📅 Checking phase: ${entry.phase} at ${entryDate.toISOString()} → entryDate <= targetDate:`, entryDate <= targetDate);

        if (entryDate <= targetDate) {
            // This entry happened before or at target date → candidate for latest phase
            latestPastPhase = entry;
        } else {
            // As soon as we hit a future entry (assuming data is sorted), stop searching
            break;
        }
    }

    if (!latestPastPhase && moonData.length > 0) {
        console.warn("🚨 Target date is before first moon phase entry; using first available phase.");
        latestPastPhase = moonData[0];
    }

    if (!latestPastPhase) {
        console.error("🚨 No valid moon phase found for date:", targetDate);
        return null;
    }

    console.log("✅ Closest past phase selected:", latestPastPhase);

    return {
        ...latestPastPhase,
        icon: getPhaseIcon(latestPastPhase.phase),
        readableDate: dayjs(latestPastPhase.date).format("dddd, MMMM D, YYYY [at] h:mm A"),
    };
}

/**
 * 🌟 getPhaseIcon
 * Returns a unicode icon for the moon phase type.
 */
function getPhaseIcon(phase) {
    switch (phase) {
        case "New Moon": return "🌑";
        case "First Quarter": return "🌓";
        case "Full Moon": return "🌕";
        case "Third Quarter": return "🌗";
        default: return "🌘"; // fallback for waxing/waning phases
    }
}

/**
 * 🌌 getTodayMoonPhase
 * Shortcut to get moon phase info for current date.
 */
export function getTodayMoonPhase() {
    try {
        const result = getMoonPhaseForDate(new Date());
        if (!result) {
            console.warn("🚨 getTodayMoonPhase could not determine today's phase.");
        }
        return result;
    } catch (error) {
        console.error("🚨 getTodayMoonPhase error:", error);
        return null;
    }
}