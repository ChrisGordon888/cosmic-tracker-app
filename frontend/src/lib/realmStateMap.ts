export type RealmId = 303 | 202 | 101 | 55 | 44 | 0;

export type ExperienceMode = 'stay' | 'move-through' | 'shift';

export interface RealmStateInfo {
  realmId: RealmId;
  realmName: string;
  realmNumber: string;
  icon: string;
  color: string;
  route: string;
  journeyStage: 'fracture' | 'veil' | 'reflection' | 'power' | 'value' | 'source';
  helpsWith: string[];
  thisRealmIsFor: string;
  whyEnterIt: string;
  stayDescription: string;
  moveThroughDescription: string;
  shiftDescription: string;
}

/**
 * Realm State Map v2
 *
 * This file is the stable identity registry for each realm:
 * - name / number / icon / route
 * - color signature
 * - core state language
 * - mode descriptions used across realm guidance surfaces
 *
 * Keep this file broad and foundational.
 * The quiz scoring lives in realmAlignmentQuestions.ts.
 * The detailed result copy and recommended tracks live in realmResultContent.ts.
 */
export const REALM_STATE_MAP: Record<RealmId, RealmStateInfo> = {
  303: {
    realmId: 303,
    realmName: 'Fractured Frontier',
    realmNumber: '303',
    icon: '∴',
    color: '#FF5D7A',
    route: '/realms/303',
    journeyStage: 'fracture',
    helpsWith: [
      'pressure',
      'chaos',
      'survival energy',
      'raw activation',
      'conflict',
      'breaking patterns',
    ],
    thisRealmIsFor:
      'When life feels sharp, unstable, demanding, or like something inside you is being forced to break open.',
    whyEnterIt:
      'To meet pressure honestly, understand the code inside the chaos, and turn fracture into directed force.',
    stayDescription:
      'Stay here when the intensity needs to be witnessed before it can be redirected.',
    moveThroughDescription:
      'Move through this realm when you want to process pressure and convert raw charge into strength.',
    shiftDescription:
      'Shift through this realm when you are ready to move from survival mode into agency, command, or integration.',
  },

  202: {
    realmId: 202,
    realmName: 'The Veil',
    realmNumber: '202',
    icon: '◐',
    color: '#A884FF',
    route: '/realms/202',
    journeyStage: 'veil',
    helpsWith: [
      'desire',
      'confusion',
      'projection',
      'emotional fog',
      'intuition',
      'hidden truth',
    ],
    thisRealmIsFor:
      'When you feel pulled by longing, fantasy, mystery, attachment, or something emotionally true that has not fully revealed itself.',
    whyEnterIt:
      'To move through illusion without becoming numb, and listen for the truth beneath the pull.',
    stayDescription:
      'Stay here when the fog needs listening before it needs answers.',
    moveThroughDescription:
      'Move through this realm when you want to separate emotional truth from projection, fantasy, or fear.',
    shiftDescription:
      'Shift through this realm when you are ready to move from seduction or uncertainty toward clearer awareness.',
  },

  101: {
    realmId: 101,
    realmName: 'Moonlit Roads',
    realmNumber: '101',
    icon: '☾',
    color: '#7ED3FF',
    route: '/realms/101',
    journeyStage: 'reflection',
    helpsWith: [
      'reflection',
      'grief',
      'memory',
      'softness',
      'integration',
      'calm movement',
    ],
    thisRealmIsFor:
      'When you need space to think, feel, remember, heal, travel inward, or make peace with what has been.',
    whyEnterIt:
      'To slow down without stopping, give the inner world room to breathe, and let the road reveal what is ready to be understood.',
    stayDescription:
      'Stay here when the wisest next move is presence, softness, and emotional grounding.',
    moveThroughDescription:
      'Move through this realm when you want to process what you are carrying and keep going without abandoning your softness.',
    shiftDescription:
      'Shift through this realm when reflection is ready to become release, trust, or aligned motion.',
  },

  55: {
    realmId: 55,
    realmName: 'Skybound City',
    realmNumber: '55',
    icon: '△',
    color: '#ECC973',
    route: '/realms/55',
    journeyStage: 'power',
    helpsWith: [
      'ambition',
      'self-command',
      'discipline',
      'confidence',
      'manifestation',
      'upward movement',
    ],
    thisRealmIsFor:
      'When you need to reclaim your power, direct your energy, act with intention, and turn potential into visible motion.',
    whyEnterIt:
      'To remember that vision needs command, and power becomes real when it is structured into action.',
    stayDescription:
      'Stay here when confidence needs to stabilize and you need to remember the power you already hold.',
    moveThroughDescription:
      'Move through this realm when you want to turn scattered force into discipline, direction, and momentum.',
    shiftDescription:
      'Shift through this realm when inner power is ready to become output, structure, value, or aligned action.',
  },

  44: {
    realmId: 44,
    realmName: 'Astral Bazaar',
    realmNumber: '44',
    icon: '◇',
    color: '#F4AB63',
    route: '/realms/44',
    journeyStage: 'value',
    helpsWith: [
      'discernment',
      'value',
      'boundaries',
      'reciprocity',
      'temptation',
      'wise exchange',
    ],
    thisRealmIsFor:
      'When you are deciding what deserves your time, attention, loyalty, money, devotion, or energy.',
    whyEnterIt:
      'To learn the difference between glitter and value, transaction and sacred exchange, distraction and true opportunity.',
    stayDescription:
      'Stay here when discernment matters more than speed and you need to evaluate what is truly worth your energy.',
    moveThroughDescription:
      'Move through this realm when you want to clarify value, strengthen boundaries, and make wiser exchanges.',
    shiftDescription:
      'Shift through this realm when evaluation is ready to become chosen movement, taste, and integrity.',
  },

  0: {
    realmId: 0,
    realmName: 'InterSiddhi',
    realmNumber: '0',
    icon: '∞',
    color: '#EEF3FA',
    route: '/realms/0',
    journeyStage: 'source',
    helpsWith: [
      'alignment',
      'gratitude',
      'stillness',
      'integration',
      'completion',
      'source connection',
    ],
    thisRealmIsFor:
      'When you need to return to what is essential, whole, blessed, and already alive beneath the noise.',
    whyEnterIt:
      'To reconnect with the deeper self beneath striving, confusion, performance, and the feeling that you have to become worthy.',
    stayDescription:
      'Stay here when you need to receive, settle, and reconnect with what is already whole.',
    moveThroughDescription:
      'Move through this realm when you want stillness to become aligned motion.',
    shiftDescription:
      'Shift through this realm when recovery is ready to become gratitude, coherence, and blessed forward movement.',
  },
};

export const REALM_DISPLAY_ORDER: RealmId[] = [303, 202, 101, 55, 44, 0];
