import type { ExperienceMode, RealmId } from './realmStateMap';

export interface RealmResultContent {
  recommendedTrack: string;
  whyMusicFits: string;
  recommendedMode: ExperienceMode;
  reflectionPrompt: string;
  resultStatement: string;
  whyRealmFits: string;
}

export const REALM_RESULT_CONTENT: Record<RealmId, RealmResultContent> = {
  303: {
    recommendedTrack: 'War Ready',
    whyMusicFits:
      'This track carries raw pressure, confrontation, and survival force. It helps you face the edge instead of denying it.',
    recommendedMode: 'move-through',
    reflectionPrompt:
      'What am I fighting right now — and what strength is this pressure trying to force out of me?',
    resultStatement:
      'This realm often appears when life feels sharp, unstable, demanding, or like something is breaking open.',
    whyRealmFits:
      'You may be carrying pressure, chaos, conflict, or survival energy. Fractured Frontier helps you find force inside the fracture.',
  },

  202: {
    recommendedTrack: 'Night Light',
    whyMusicFits:
      'This track holds tension, mystery, and emotional pull while keeping you close to what is underneath.',
    recommendedMode: 'move-through',
    reflectionPrompt:
      'What feels true beneath the fog — and what part of me is projecting instead of seeing clearly?',
    resultStatement:
      'This realm often appears when you feel pulled by longing, confusion, fantasy, or hidden emotional truth.',
    whyRealmFits:
      'The Veil helps you sit with mystery and desire without forcing false certainty.',
  },

  101: {
    recommendedTrack: 'Mysterious Way',
    whyMusicFits:
      'This track supports a reflective, spacious state and gives your inner world room to speak.',
    recommendedMode: 'stay',
    reflectionPrompt:
      'What am I still carrying that needs space instead of speed?',
    resultStatement:
      'This realm often appears when you need room for reflection, grief, memory, distance, or emotional integration.',
    whyRealmFits:
      'Moonlit Roads offers movement without pressure and helps you understand what is surfacing.',
  },

  55: {
    recommendedTrack: 'Bank',
    whyMusicFits:
      'This track embodies confidence, momentum, wealth-building energy, and intentional movement.',
    recommendedMode: 'move-through',
    reflectionPrompt:
      'Where is my energy leaking — and what would happen if I directed it fully?',
    resultStatement:
      'This realm often appears when you need ambition, discipline, command, manifestation, and upward movement.',
    whyRealmFits:
      'Skybound City helps you turn rising energy into focused, intentional power.',
  },

  44: {
    recommendedTrack: 'Golden Tickets',
    whyMusicFits:
      'This track carries access, rarity, temptation, and selective value — perfect for a realm of discernment.',
    recommendedMode: 'move-through',
    reflectionPrompt:
      'What in my life is truly valuable — and what only looks valuable from a distance?',
    resultStatement:
      'This realm often appears when you are deciding what is worth your energy, time, attention, or devotion.',
    whyRealmFits:
      'Astral Bazaar helps you clarify value, boundaries, and the quality of your exchanges.',
  },

  0: {
    recommendedTrack: 'Feel Blessed',
    whyMusicFits:
      'This track carries gratitude, deserving, and a sense of spiritual arrival.',
    recommendedMode: 'stay',
    reflectionPrompt:
      'What is already present in my life that I have not fully allowed myself to receive?',
    resultStatement:
      'This realm often appears when you need alignment, blessing, stillness, completion, and return to what is essential.',
    whyRealmFits:
      'InterSiddhi helps you reconnect with what is already whole beneath striving and confusion.',
  },
};