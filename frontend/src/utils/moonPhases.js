import moonData from "@/data/moonPhases2025.json";
import dayjs from "dayjs";


/**
 * 📅 parseDate
 * Parses YYYY-MM-DD into Date object.
 * Safely handles invalid or missing date strings.
 */
function parseDate(dateStr) {
    if (!dateStr || typeof dateStr !== "string") {
        console.error("🚨 parseDate received invalid dateStr:", dateStr);
        return new Date(NaN); // Return invalid Date
    }
    const [year, month, day] = dateStr.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
}

/**
 * 🌕 getMoonPhaseForDate
 * Finds the closest moon phase entry from your moon dataset.
 * Returns phase info for use in UI, or null if none found.
 */
export function getMoonPhaseForDate(targetDate) {
    if (!targetDate || !(targetDate instanceof Date)) {
        console.error("🚨 getMoonPhaseForDate received invalid Date:", targetDate);
        throw new Error("getMoonPhaseForDate requires a valid Date object.");
    }

    let closest = null;
    let minDiff = Infinity;

    for (const entry of moonData) {
        if (!entry || !entry.date || !entry.phase) continue;

        const entryDate = parseDate(entry.date);
        if (isNaN(entryDate)) continue;

        const diff = Math.abs(targetDate - entryDate);

        if (diff < minDiff) {
            minDiff = diff;
            closest = entry;
        }
    }

    // 🔥 New addition: fallback to first entry if targetDate is before the first moon date
    if (!closest && moonData.length > 0) {
        console.warn("🚨 Date before first moon phase entry; using first available phase.");
        closest = moonData[0];
    }

    if (!closest) {
        console.error("🚨 No closest moon phase found for date:", targetDate);
        return null;
    }

    return {
        ...closest,
        icon: getPhaseIcon(closest.phase),
        readableDate: dayjs(closest.date).format("dddd, MMMM D, YYYY [at] h:mm A"),
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
        default: return "🌘"; // Waxing/waning phases fallback
    }
}

/**
 * 🌌 getTodayMoonPhase
 * Shortcut to get moon phase info for the current day.
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