import type { RealmId } from './realmStateMap';

export interface RealmAnswerOption {
  label: string;
  description?: string;
  realmWeights: Partial<Record<RealmId, number>>;
}

export interface RealmAlignmentQuestion {
  id: string;
  prompt: string;
  options: RealmAnswerOption[];
}

/**
 * Realm Alignment v1
 * Simple weighted scoring:
 * - each answer gives points to one or more realms
 * - highest score wins
 * - ties are resolved by display order on the page logic side
 */
export const REALM_ALIGNMENT_QUESTIONS: RealmAlignmentQuestion[] = [
  {
    id: 'current_feeling',
    prompt: 'What feels closest right now?',
    options: [
      {
        label: 'Pressure / chaos',
        description: 'Everything feels sharp, unstable, or demanding.',
        realmWeights: { 303: 3, 55: 1 },
      },
      {
        label: 'Longing / confusion',
        description: 'You feel pulled, uncertain, or emotionally foggy.',
        realmWeights: { 202: 3, 101: 1 },
      },
      {
        label: 'Reflection / heaviness',
        description: 'You need room to process, grieve, or understand.',
        realmWeights: { 101: 3, 202: 1 },
      },
      {
        label: 'Ambition / readiness',
        description: 'You want to rise, act, and direct your energy.',
        realmWeights: { 55: 3, 303: 1 },
      },
      {
        label: 'Discernment / decision-making',
        description: 'You are evaluating what deserves your energy.',
        realmWeights: { 44: 3, 101: 1 },
      },
      {
        label: 'Alignment / gratitude',
        description: 'You want to return to center and what is essential.',
        realmWeights: { 0: 3, 101: 1 },
      },
    ],
  },

  {
    id: 'need_most',
    prompt: 'What do you need most right now?',
    options: [
      {
        label: 'Strength',
        realmWeights: { 303: 2, 55: 2 },
      },
      {
        label: 'Clarity',
        realmWeights: { 202: 1, 44: 3 },
      },
      {
        label: 'Space',
        realmWeights: { 101: 3, 0: 1 },
      },
      {
        label: 'Power',
        realmWeights: { 55: 3, 303: 1 },
      },
      {
        label: 'Discernment',
        realmWeights: { 44: 3, 202: 1 },
      },
      {
        label: 'Return to center',
        realmWeights: { 0: 3, 101: 1 },
      },
    ],
  },

  {
    id: 'inner_world',
    prompt: 'How does your inner world feel today?',
    options: [
      {
        label: 'Fractured',
        realmWeights: { 303: 3 },
      },
      {
        label: 'Foggy',
        realmWeights: { 202: 3 },
      },
      {
        label: 'Quiet',
        realmWeights: { 101: 2, 0: 1 },
      },
      {
        label: 'Rising',
        realmWeights: { 55: 3 },
      },
      {
        label: 'Evaluating',
        realmWeights: { 44: 3 },
      },
      {
        label: 'Whole',
        realmWeights: { 0: 3 },
      },
    ],
  },

  {
    id: 'sound_need',
    prompt: 'What kind of sound do you need?',
    options: [
      {
        label: 'Raw and activating',
        realmWeights: { 303: 3, 55: 1 },
      },
      {
        label: 'Hypnotic and mysterious',
        realmWeights: { 202: 3 },
      },
      {
        label: 'Reflective and spacious',
        realmWeights: { 101: 3, 0: 1 },
      },
      {
        label: 'Commanding and elevated',
        realmWeights: { 55: 3 },
      },
      {
        label: 'Rich and selective',
        realmWeights: { 44: 3 },
      },
      {
        label: 'Peaceful and luminous',
        realmWeights: { 0: 3 },
      },
    ],
  },

  {
    id: 'current_intention',
    prompt: 'What are you trying to do right now?',
    options: [
      {
        label: 'Survive / face it',
        realmWeights: { 303: 3 },
      },
      {
        label: 'Understand what is true',
        realmWeights: { 202: 2, 44: 2 },
      },
      {
        label: 'Process and integrate',
        realmWeights: { 101: 3, 0: 1 },
      },
      {
        label: 'Rise and act',
        realmWeights: { 55: 3 },
      },
      {
        label: 'Choose wisely',
        realmWeights: { 44: 3 },
      },
      {
        label: 'Reconnect and align',
        realmWeights: { 0: 3 },
      },
    ],
  },
];