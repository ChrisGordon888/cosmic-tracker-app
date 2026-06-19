import SunCalc from 'suncalc';

/**
 * 🌙 COSMIC - Moon Phase System
 *
 * Dynamic moon phase calculation using SunCalc.
 * This file controls the daily Moon Alignment card and any date-based moon lookup.
 */

export interface MoonPhase {
  phase: string;
  icon: string;
  illumination: number;
  age: number;
  distance: number;
  energy: string;
  ritualFocus: string;
  date: Date;
}

export interface RealmAlignment {
  primaryRealm: string;
  secondaryRealm: string;
  primaryRealmId: 303 | 202 | 101 | 55 | 44 | 0;
  secondaryRealmId: 303 | 202 | 101 | 55 | 44 | 0 | null;
  moonPhase: string;
  energy: string;
  ritualFocus: string;
}

/**
 * Convert SunCalc's phase number into the Cosmic moon phase language.
 */
function getMoonPhaseContext(phase: number) {
  if (phase < 0.033) {
    return {
      phaseName: 'New Moon',
      icon: '🌑',
      energy: 'Rest, reflection, hidden seed, new beginning',
      ritualFocus: 'Set intentions quietly and listen for the signal beneath the noise.',
    };
  }

  if (phase < 0.216) {
    return {
      phaseName: 'Waxing Crescent',
      icon: '🌒',
      energy: 'Growth, activation, first movement, building trust',
      ritualFocus: 'Take one small action that proves the intention is alive.',
    };
  }

  if (phase < 0.283) {
    return {
      phaseName: 'First Quarter',
      icon: '🌓',
      energy: 'Decision, commitment, pressure, obstacle breaking',
      ritualFocus: 'Choose the path and push through the first resistance.',
    };
  }

  if (phase < 0.466) {
    return {
      phaseName: 'Waxing Gibbous',
      icon: '🌔',
      energy: 'Refinement, discipline, adjustment, momentum',
      ritualFocus: 'Refine the plan, strengthen the system, and keep building.',
    };
  }

  if (phase < 0.533) {
    return {
      phaseName: 'Full Moon',
      icon: '🌕',
      energy: 'Culmination, visibility, gratitude, release',
      ritualFocus: 'Celebrate what has become visible and release what cannot come forward.',
    };
  }

  if (phase < 0.716) {
    return {
      phaseName: 'Waning Gibbous',
      icon: '🌖',
      energy: 'Gratitude, sharing, evaluation, wisdom',
      ritualFocus: 'Name what the cycle taught you and decide what is truly valuable.',
    };
  }

  if (phase < 0.783) {
    return {
      phaseName: 'Third Quarter',
      icon: '🌗',
      energy: 'Forgiveness, letting go, integration, honest reflection',
      ritualFocus: 'Release old patterns and make space for what is emotionally true.',
    };
  }

  if (phase < 0.966) {
    return {
      phaseName: 'Waning Crescent',
      icon: '🌘',
      energy: 'Surrender, rest, stillness, return to center',
      ritualFocus: 'Rest deeply, integrate the lesson, and reconnect with source.',
    };
  }

  return {
    phaseName: 'New Moon',
    icon: '🌑',
    energy: 'Rest, reflection, hidden seed, new beginning',
    ritualFocus: 'Set intentions quietly and listen for the signal beneath the noise.',
  };
}

/**
 * Get today's moon phase with Cosmic context.
 */
export function getTodayMoonPhase(): MoonPhase {
  const today = new Date();
  const moonIllumination = SunCalc.getMoonIllumination(today);
  const phase = moonIllumination.phase;
  const fraction = moonIllumination.fraction;
  const phaseContext = getMoonPhaseContext(phase);

  return {
    phase: phaseContext.phaseName,
    icon: phaseContext.icon,
    illumination: fraction,
    age: phase * 29.53,
    distance: SunCalc.getMoonPosition(today, 0, 0).distance,
    energy: phaseContext.energy,
    ritualFocus: phaseContext.ritualFocus,
    date: today,
  };
}

/**
 * Get realm alignment based on moon phase.
 *
 * This is intentionally separate from the personal Find Your Realm result.
 * Moon Alignment = today's sky signal.
 * Personal Path = the user's quiz alignment.
 */
export function getRealmMoonAlignment(moonPhase: string): RealmAlignment {
  const alignments: Record<string, RealmAlignment> = {
    'New Moon': {
      primaryRealm: 'The Veil (202)',
      secondaryRealm: 'InterSiddhi (0)',
      primaryRealmId: 202,
      secondaryRealmId: 0,
      moonPhase: 'New Moon',
      energy: 'Hidden signal, mystery, seed intention',
      ritualFocus: 'Listen before acting. Name the desire beneath the desire.',
    },
    'Waxing Crescent': {
      primaryRealm: 'Fractured Frontier (303)',
      secondaryRealm: 'The Veil (202)',
      primaryRealmId: 303,
      secondaryRealmId: 202,
      moonPhase: 'Waxing Crescent',
      energy: 'Activation, first movement, pressure becoming motion',
      ritualFocus: 'Take the first honest action, even if the path is not fully clear.',
    },
    'First Quarter': {
      primaryRealm: 'Skybound City (55)',
      secondaryRealm: 'Fractured Frontier (303)',
      primaryRealmId: 55,
      secondaryRealmId: 303,
      moonPhase: 'First Quarter',
      energy: 'Decision, command, obstacle breaking',
      ritualFocus: 'Choose the move and direct the force instead of scattering it.',
    },
    'Waxing Gibbous': {
      primaryRealm: 'Skybound City (55)',
      secondaryRealm: 'Astral Bazaar (44)',
      primaryRealmId: 55,
      secondaryRealmId: 44,
      moonPhase: 'Waxing Gibbous',
      energy: 'Refinement, discipline, value testing',
      ritualFocus: 'Improve the system and protect your energy from distractions.',
    },
    'Full Moon': {
      primaryRealm: 'InterSiddhi (0)',
      secondaryRealm: 'All Realms',
      primaryRealmId: 0,
      secondaryRealmId: null,
      moonPhase: 'Full Moon',
      energy: 'Visibility, gratitude, completion, release',
      ritualFocus: 'Receive what has become visible and release what cannot continue.',
    },
    'Waning Gibbous': {
      primaryRealm: 'Astral Bazaar (44)',
      secondaryRealm: 'Moonlit Roads (101)',
      primaryRealmId: 44,
      secondaryRealmId: 101,
      moonPhase: 'Waning Gibbous',
      energy: 'Gratitude, evaluation, wisdom, discernment',
      ritualFocus: 'Decide what was valuable and what only looked valuable.',
    },
    'Third Quarter': {
      primaryRealm: 'Moonlit Roads (101)',
      secondaryRealm: 'The Veil (202)',
      primaryRealmId: 101,
      secondaryRealmId: 202,
      moonPhase: 'Third Quarter',
      energy: 'Letting go, reflection, emotional truth',
      ritualFocus: 'Forgive, process, and let the inner world tell the truth.',
    },
    'Waning Crescent': {
      primaryRealm: 'InterSiddhi (0)',
      secondaryRealm: 'Moonlit Roads (101)',
      primaryRealmId: 0,
      secondaryRealmId: 101,
      moonPhase: 'Waning Crescent',
      energy: 'Surrender, rest, integration, return to center',
      ritualFocus: 'Rest deeply and let the cycle complete before reaching again.',
    },
  };

  return alignments[moonPhase] || alignments['New Moon'];
}

/**
 * Calculate moon phase for any date.
 */
export function getMoonPhaseForDate(date: Date): MoonPhase {
  const moonIllumination = SunCalc.getMoonIllumination(date);
  const phase = moonIllumination.phase;
  const fraction = moonIllumination.fraction;
  const phaseContext = getMoonPhaseContext(phase);

  return {
    phase: phaseContext.phaseName,
    icon: phaseContext.icon,
    illumination: fraction,
    age: phase * 29.53,
    distance: SunCalc.getMoonPosition(date, 0, 0).distance,
    energy: phaseContext.energy,
    ritualFocus: phaseContext.ritualFocus,
    date,
  };
}
