import SunCalc from 'suncalc';

/**
 * 🌙 COSMIC 888 - Moon Phase System
 * Dynamic moon phase calculation using suncalc
 * Replaces static 2025 JSON data
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
  moonPhase: string;
}

/**
 * Get today's moon phase with spiritual context
 */
export function getTodayMoonPhase(): MoonPhase {
  const today = new Date();
  const moonIllumination = SunCalc.getMoonIllumination(today);
  
  const phase = moonIllumination.phase;
  const fraction = moonIllumination.fraction;
  
  // Determine moon phase name
  let phaseName: string;
  let icon: string;
  let energy: string;
  let ritualFocus: string;
  
  if (phase < 0.033) {
    phaseName = 'New Moon';
    icon = '🌑';
    energy = 'Rest, Reflection, New Beginnings';
    ritualFocus = 'Set intentions, plant seeds of manifestation';
  } else if (phase < 0.216) {
    phaseName = 'Waxing Crescent';
    icon = '🌒';
    energy = 'Growth, Expansion, Action';
    ritualFocus = 'Take action on intentions, build momentum';
  } else if (phase < 0.283) {
    phaseName = 'First Quarter';
    icon = '🌓';
    energy = 'Decision, Commitment, Overcoming Obstacles';
    ritualFocus = 'Make crucial decisions, push through resistance';
  } else if (phase < 0.466) {
    phaseName = 'Waxing Gibbous';
    icon = '🌔';
    energy = 'Refinement, Adjustment, Patience';
    ritualFocus = 'Refine plans, trust the process';
  } else if (phase < 0.533) {
    phaseName = 'Full Moon';
    icon = '🌕';
    energy = 'Culmination, Celebration, Release';
    ritualFocus = 'Celebrate victories, release what no longer serves';
  } else if (phase < 0.716) {
    phaseName = 'Waning Gibbous';
    icon = '🌖';
    energy = 'Gratitude, Sharing, Teaching';
    ritualFocus = 'Share wisdom, express gratitude';
  } else if (phase < 0.783) {
    phaseName = 'Third Quarter';
    icon = '🌗';
    energy = 'Forgiveness, Letting Go, Cleansing';
    ritualFocus = 'Release old patterns, forgive yourself and others';
  } else if (phase < 0.966) {
    phaseName = 'Waning Crescent';
    icon = '🌘';
    energy = 'Surrender, Rest, Wisdom';
    ritualFocus = 'Rest deeply, integrate lessons learned';
  } else {
    phaseName = 'New Moon';
    icon = '🌑';
    energy = 'Rest, Reflection, New Beginnings';
    ritualFocus = 'Set intentions, plant seeds of manifestation';
  }
  
  return {
    phase: phaseName,
    icon,
    illumination: fraction,
    age: phase * 29.53,
    distance: SunCalc.getMoonPosition(today, 0, 0).distance,
    energy,
    ritualFocus,
    date: today,
  };
}

/**
 * Get realm alignment based on moon phase
 */
export function getRealmMoonAlignment(moonPhase: string): RealmAlignment {
  const alignments: Record<string, RealmAlignment> = {
    'New Moon': {
      primaryRealm: 'The Veil (202)',
      secondaryRealm: 'Cosmic Nexus (0)',
      moonPhase: 'New Moon',
    },
    'Waxing Crescent': {
      primaryRealm: 'Fractured Frontier (303)',
      secondaryRealm: 'The Veil (202)',
      moonPhase: 'Waxing Crescent',
    },
    'First Quarter': {
      primaryRealm: 'Skybound City (55)',
      secondaryRealm: 'Fractured Frontier (303)',
      moonPhase: 'First Quarter',
    },
    'Waxing Gibbous': {
      primaryRealm: 'Skybound City (55)',
      secondaryRealm: 'Astral Bazaar (44)',
      moonPhase: 'Waxing Gibbous',
    },
    'Full Moon': {
      primaryRealm: 'Cosmic Nexus (0)',
      secondaryRealm: 'All Realms',
      moonPhase: 'Full Moon',
    },
    'Waning Gibbous': {
      primaryRealm: 'Astral Bazaar (44)',
      secondaryRealm: 'Moonlit Roads (101)',
      moonPhase: 'Waning Gibbous',
    },
    'Third Quarter': {
      primaryRealm: 'Moonlit Roads (101)',
      secondaryRealm: 'The Veil (202)',
      moonPhase: 'Third Quarter',
    },
    'Waning Crescent': {
      primaryRealm: 'The Veil (202)',
      secondaryRealm: 'Cosmic Nexus (0)',
      moonPhase: 'Waning Crescent',
    },
  };
  
  return alignments[moonPhase] || alignments['New Moon'];
}

/**
 * Calculate moon phase for any date
 */
export function getMoonPhaseForDate(date: Date): MoonPhase {
  const moonIllumination = SunCalc.getMoonIllumination(date);
  const phase = moonIllumination.phase;
  const fraction = moonIllumination.fraction;
  
  let phaseName: string;
  let icon: string;
  
  if (phase < 0.033) {
    phaseName = 'New Moon';
    icon = '🌑';
  } else if (phase < 0.216) {
    phaseName = 'Waxing Crescent';
    icon = '🌒';
  } else if (phase < 0.283) {
    phaseName = 'First Quarter';
    icon = '🌓';
  } else if (phase < 0.466) {
    phaseName = 'Waxing Gibbous';
    icon = '🌔';
  } else if (phase < 0.533) {
    phaseName = 'Full Moon';
    icon = '🌕';
  } else if (phase < 0.716) {
    phaseName = 'Waning Gibbous';
    icon = '🌖';
  } else if (phase < 0.783) {
    phaseName = 'Third Quarter';
    icon = '🌗';
  } else if (phase < 0.966) {
    phaseName = 'Waning Crescent';
    icon = '🌘';
  } else {
    phaseName = 'New Moon';
    icon = '🌑';
  }
  
  return {
    phase: phaseName,
    icon,
    illumination: fraction,
    age: phase * 29.53,
    distance: SunCalc.getMoonPosition(date, 0, 0).distance,
    energy: 'Moon energy description',
    ritualFocus: 'Focus for this phase',
    date,
  };
}