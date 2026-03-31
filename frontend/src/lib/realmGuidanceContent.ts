import type { ExperienceMode, RealmId } from './realmStateMap';

export interface RealmGuidanceContent {
  realmId: RealmId;
  whenToEnter: string;
  helpsWith: string[];
  suggestedMode: ExperienceMode;
  recommendedTrack: string;
  reflectionPrompt: string;
  whyThisRealmHelps: string;
}

export const REALM_GUIDANCE_CONTENT: Record<RealmId, RealmGuidanceContent> = {
  303: {
    realmId: 303,
    whenToEnter:
      'Enter when life feels sharp, unstable, demanding, or like something is breaking open.',
    helpsWith: ['chaos', 'pressure', 'conflict', 'survival', 'raw activation'],
    suggestedMode: 'move-through',
    recommendedTrack: 'War Ready',
    reflectionPrompt:
      'What am I fighting right now — and what strength is this pressure trying to force out of me?',
    whyThisRealmHelps:
      'Fractured Frontier does not ask you to pretend everything is calm. It helps you meet pressure honestly and find force inside the fracture.',
  },

  202: {
    realmId: 202,
    whenToEnter:
      'Enter when you feel pulled by longing, confusion, projection, fantasy, or hidden emotional truth.',
    helpsWith: ['desire', 'confusion', 'mystery', 'projection', 'hidden truth'],
    suggestedMode: 'move-through',
    recommendedTrack: 'Night Light',
    reflectionPrompt:
      'What feels true beneath the fog — and what part of me is projecting instead of seeing clearly?',
    whyThisRealmHelps:
      'The Veil helps you sit with emotional fog, mystery, and desire without forcing false certainty too early.',
  },

  101: {
    realmId: 101,
    whenToEnter:
      'Enter when you need space to reflect, process grief, travel inward, or make peace with what has been.',
    helpsWith: ['reflection', 'grief', 'distance', 'integration', 'calm movement'],
    suggestedMode: 'stay',
    recommendedTrack: 'Mysterious Way',
    reflectionPrompt:
      'What am I still carrying that needs space instead of speed?',
    whyThisRealmHelps:
      'Moonlit Roads offers movement without pressure and helps you understand what is surfacing at a gentler pace.',
  },

  55: {
    realmId: 55,
    whenToEnter:
      'Enter when you need to reclaim your power, direct your energy, and act with intention.',
    helpsWith: ['ambition', 'discipline', 'command', 'manifestation', 'confidence'],
    suggestedMode: 'move-through',
    recommendedTrack: 'Bank',
    reflectionPrompt:
      'Where is my energy leaking — and what would happen if I directed it fully?',
    whyThisRealmHelps:
      'Skybound City helps you turn rising energy into focused action, disciplined power, and intentional movement.',
  },

  44: {
    realmId: 44,
    whenToEnter:
      'Enter when you are deciding what is worth your energy, time, attention, or devotion.',
    helpsWith: ['discernment', 'value', 'boundaries', 'exchange', 'temptation'],
    suggestedMode: 'move-through',
    recommendedTrack: 'Golden Tickets',
    reflectionPrompt:
      'What in my life is truly valuable — and what only looks valuable from a distance?',
    whyThisRealmHelps:
      'Astral Bazaar helps you clarify worth, recognize illusion, and choose more wisely what deserves your attention.',
  },

  0: {
    realmId: 0,
    whenToEnter:
      'Enter when you need to return to what is essential, whole, and already within.',
    helpsWith: ['alignment', 'blessing', 'stillness', 'completion', 'source'],
    suggestedMode: 'stay',
    recommendedTrack: 'Feel Blessed',
    reflectionPrompt:
      'What is already present in my life that I have not fully allowed myself to receive?',
    whyThisRealmHelps:
      'InterSiddhi helps you reconnect with what is already whole beneath striving, confusion, and performance.',
  },
};