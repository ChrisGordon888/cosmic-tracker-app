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
 * Realm Alignment v2
 *
 * Weighted scoring model:
 * - each answer gives a primary realm strong weight
 * - most answers also give secondary / tertiary weights for nuance
 * - the page resolves the highest score into a recommended realm
 * - ties are resolved by REALM_DISPLAY_ORDER in the page logic
 *
 * Realm meanings:
 * - 303: pressure, rupture, activation, survival, raw motion
 * - 202: desire, fog, mystery, attachment, hidden truth
 * - 101: reflection, grief, memory, spaciousness, integration
 * - 55: ambition, command, power, elevation, disciplined action
 * - 44: discernment, value, decision, exchange, what deserves energy
 * - 0: center, gratitude, wholeness, blessing, reconnection, alignment
 */
export const REALM_ALIGNMENT_QUESTIONS: RealmAlignmentQuestion[] = [
  {
    id: 'current_feeling',
    prompt: 'What feels closest right now?',
    options: [
      {
        label: 'Pressure / chaos',
        description: 'Everything feels sharp, unstable, or demanding.',
        realmWeights: { 303: 4, 55: 2, 202: 1 },
      },
      {
        label: 'Longing / confusion',
        description: 'You feel pulled, uncertain, or emotionally foggy.',
        realmWeights: { 202: 4, 101: 2, 44: 1 },
      },
      {
        label: 'Reflection / heaviness',
        description: 'You need room to process, grieve, or understand.',
        realmWeights: { 101: 4, 202: 2, 0: 1 },
      },
      {
        label: 'Ambition / readiness',
        description: 'You want to rise, act, and direct your energy.',
        realmWeights: { 55: 4, 303: 2, 44: 1 },
      },
      {
        label: 'Discernment / decision-making',
        description: 'You are evaluating what deserves your energy.',
        realmWeights: { 44: 4, 202: 2, 101: 1 },
      },
      {
        label: 'Alignment / gratitude',
        description: 'You want to return to center and what is essential.',
        realmWeights: { 0: 4, 101: 2, 44: 1 },
      },
    ],
  },

  {
    id: 'need_most',
    prompt: 'What do you need most right now?',
    options: [
      {
        label: 'Strength',
        description: 'You need backbone, resilience, and the force to keep moving.',
        realmWeights: { 303: 3, 55: 3, 0: 1 },
      },
      {
        label: 'Clarity',
        description: 'You need to separate signal from noise and see what is true.',
        realmWeights: { 44: 4, 202: 2, 101: 1 },
      },
      {
        label: 'Space',
        description: 'You need quiet, breath, and emotional room.',
        realmWeights: { 101: 4, 0: 2, 202: 1 },
      },
      {
        label: 'Power',
        description: 'You need confidence, command, and forward charge.',
        realmWeights: { 55: 4, 303: 2, 44: 1 },
      },
      {
        label: 'Discernment',
        description: 'You need to choose what is worthy and stop leaking energy.',
        realmWeights: { 44: 4, 202: 2, 55: 1 },
      },
      {
        label: 'Return to center',
        description: 'You need to remember who you are beneath the noise.',
        realmWeights: { 0: 4, 101: 2, 44: 1 },
      },
    ],
  },

  {
    id: 'inner_world',
    prompt: 'How does your inner world feel today?',
    options: [
      {
        label: 'Fractured',
        description: 'Parts of you feel scattered, pressured, or on edge.',
        realmWeights: { 303: 4, 202: 1, 101: 1 },
      },
      {
        label: 'Foggy',
        description: 'You can feel something, but the meaning is not fully clear.',
        realmWeights: { 202: 4, 101: 2, 44: 1 },
      },
      {
        label: 'Quiet',
        description: 'You feel inward, soft, and in need of gentler pacing.',
        realmWeights: { 101: 4, 0: 2, 202: 1 },
      },
      {
        label: 'Rising',
        description: 'Something in you wants to build, move, lead, or be seen.',
        realmWeights: { 55: 4, 303: 2, 44: 1 },
      },
      {
        label: 'Evaluating',
        description: 'You are reviewing options, patterns, worth, and direction.',
        realmWeights: { 44: 4, 202: 2, 101: 1 },
      },
      {
        label: 'Whole',
        description: 'You feel connected to gratitude, faith, or a deeper center.',
        realmWeights: { 0: 4, 101: 2, 55: 1 },
      },
    ],
  },

  {
    id: 'sound_need',
    prompt: 'What kind of sound do you need?',
    options: [
      {
        label: 'Raw and activating',
        description: 'Something intense enough to move pressure through the body.',
        realmWeights: { 303: 4, 55: 2, 202: 1 },
      },
      {
        label: 'Hypnotic and mysterious',
        description: 'Something nocturnal, seductive, strange, or emotionally magnetic.',
        realmWeights: { 202: 4, 101: 1, 44: 1 },
      },
      {
        label: 'Reflective and spacious',
        description: 'Something wide enough to think, feel, remember, and breathe.',
        realmWeights: { 101: 4, 0: 2, 202: 1 },
      },
      {
        label: 'Commanding and elevated',
        description: 'Something that makes you stand taller and move with authority.',
        realmWeights: { 55: 4, 303: 1, 44: 1 },
      },
      {
        label: 'Rich and selective',
        description: 'Something focused, refined, valuable, and intentional.',
        realmWeights: { 44: 4, 55: 1, 202: 1 },
      },
      {
        label: 'Peaceful and luminous',
        description: 'Something that clears the field and reconnects you to center.',
        realmWeights: { 0: 4, 101: 2, 44: 1 },
      },
    ],
  },

  {
    id: 'current_intention',
    prompt: 'What are you trying to do right now?',
    options: [
      {
        label: 'Survive / face it',
        description: 'Meet the pressure directly and get through the moment.',
        realmWeights: { 303: 4, 55: 1, 0: 1 },
      },
      {
        label: 'Understand what is true',
        description: 'Look beneath the surface and name what is actually happening.',
        realmWeights: { 202: 3, 44: 3, 101: 1 },
      },
      {
        label: 'Process and integrate',
        description: 'Give the experience somewhere to land inside you.',
        realmWeights: { 101: 4, 0: 2, 202: 1 },
      },
      {
        label: 'Rise and act',
        description: 'Turn intention into motion, discipline, and visible action.',
        realmWeights: { 55: 4, 303: 2, 44: 1 },
      },
      {
        label: 'Choose wisely',
        description: 'Protect your energy and select the path with real value.',
        realmWeights: { 44: 4, 202: 1, 55: 1 },
      },
      {
        label: 'Reconnect and align',
        description: 'Come back to your center, your gratitude, and your highest signal.',
        realmWeights: { 0: 4, 101: 2, 44: 1 },
      },
    ],
  },
];
