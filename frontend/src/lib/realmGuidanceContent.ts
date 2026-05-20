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
      'Enter when life feels sharp, unstable, demanding, coded, or like something inside you is being forced to break open.',
    helpsWith: ['chaos', 'pressure', 'conflict', 'survival', 'self-overcoming'],
    suggestedMode: 'move-through',
    recommendedTrack: 'hardcoded',
    reflectionPrompt:
      'What pattern keeps repeating — and what strength is trying to emerge from the pressure?',
    whyThisRealmHelps:
      'Fractured Frontier does not ask you to pretend everything is calm. It helps you meet pressure honestly, recognize the code you are moving through, and turn fracture into force.',
  },

  202: {
    realmId: 202,
    whenToEnter:
      'Enter when you feel pulled by longing, confusion, projection, fantasy, desire, or hidden emotional truth.',
    helpsWith: ['desire', 'confusion', 'mystery', 'projection', 'emotional fog'],
    suggestedMode: 'move-through',
    recommendedTrack: 'her fantasy',
    reflectionPrompt:
      'What feels true beneath the fantasy — and what part of me is projecting instead of seeing clearly?',
    whyThisRealmHelps:
      'The Veil helps you sit with mystery, attraction, emotional fog, and fantasy without forcing false certainty too early.',
  },

  101: {
    realmId: 101,
    whenToEnter:
      'Enter when you need space to reflect, soften, process emotion, travel inward, or feel held while moving through uncertainty.',
    helpsWith: ['reflection', 'healing', 'distance', 'integration', 'soft movement'],
    suggestedMode: 'stay',
    recommendedTrack: 'holdMyHand',
    reflectionPrompt:
      'What am I still carrying that needs gentleness instead of speed?',
    whyThisRealmHelps:
      'Moonlit Roads offers movement without pressure. It gives your inner world space to breathe, process, and integrate without forcing the next answer too quickly.',
  },

  55: {
    realmId: 55,
    whenToEnter:
      'Enter when you need to reclaim your power, direct your energy, remember your ambition, and move with command.',
    helpsWith: ['ambition', 'discipline', 'command', 'manifestation', 'confidence'],
    suggestedMode: 'move-through',
    recommendedTrack: 'Glory n Power',
    reflectionPrompt:
      'Where is my energy leaking — and what would happen if I directed it fully?',
    whyThisRealmHelps:
      'Skybound City helps you turn rising energy into focused action, disciplined power, and visible movement.',
  },

  44: {
    realmId: 44,
    whenToEnter:
      'Enter when you are deciding what is worth your energy, attention, time, loyalty, or devotion.',
    helpsWith: ['discernment', 'value', 'boundaries', 'exchange', 'temptation'],
    suggestedMode: 'move-through',
    recommendedTrack: '13933',
    reflectionPrompt:
      'What is truly valuable here — and what only looks valuable because it is pulling my attention?',
    whyThisRealmHelps:
      'Astral Bazaar helps you clarify worth, recognize temptation, protect your focus, and choose more wisely what deserves your energy.',
  },

  0: {
    realmId: 0,
    whenToEnter:
      'Enter when you need to return to what is essential, whole, aligned, and already within you.',
    helpsWith: ['alignment', 'blessing', 'stillness', 'completion', 'source'],
    suggestedMode: 'stay',
    recommendedTrack: 'same person',
    reflectionPrompt:
      'What part of me is already whole, even while I am still becoming?',
    whyThisRealmHelps:
      'InterSiddhi helps you reconnect with the self beneath striving, confusion, and performance — the same core self, in a higher form.',
  },
};