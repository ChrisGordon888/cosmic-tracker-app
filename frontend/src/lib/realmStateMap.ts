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

export const REALM_STATE_MAP: Record<RealmId, RealmStateInfo> = {
  303: {
    realmId: 303,
    realmName: 'Fractured Frontier',
    realmNumber: '303',
    icon: '🌪️',
    color: '#FF4D6D',
    route: '/realms/303',
    journeyStage: 'fracture',
    helpsWith: ['chaos', 'pressure', 'overwhelm', 'conflict', 'survival', 'raw activation'],
    thisRealmIsFor:
      'When life feels unstable, sharp, demanding, or like something is breaking open.',
    whyEnterIt:
      'To face pressure honestly and find force inside the fracture.',
    stayDescription:
      'Stay here if you need music and atmosphere that meet your chaos honestly.',
    moveThroughDescription:
      'Choose this if you want to work through pressure and find strength inside instability.',
    shiftDescription:
      'Choose this if you want to begin moving from fracture toward power, clarity, or integration.',
  },

  202: {
    realmId: 202,
    realmName: 'The Veil',
    realmNumber: '202',
    icon: '🕯️',
    color: '#8B5CF6',
    route: '/realms/202',
    journeyStage: 'veil',
    helpsWith: ['desire', 'confusion', 'seduction', 'projection', 'intuition', 'hidden truth'],
    thisRealmIsFor:
      'When you feel pulled by longing, illusion, fear, fantasy, or mystery.',
    whyEnterIt:
      'To move through emotional fog and listen for what is true beneath the pull.',
    stayDescription:
      'Stay here if you need to sit with mystery, longing, and what has not yet become clear.',
    moveThroughDescription:
      'Choose this if you want to move through confusion and listen for deeper truth.',
    shiftDescription:
      'Choose this if you want to move from emotional fog toward reflection, discernment, or source.',
  },

  101: {
    realmId: 101,
    realmName: 'Moonlit Roads',
    realmNumber: '101',
    icon: '🌙',
    color: '#38BDF8',
    route: '/realms/101',
    journeyStage: 'reflection',
    helpsWith: ['reflection', 'grief', 'late-night processing', 'integration', 'distance', 'calm movement'],
    thisRealmIsFor:
      'When you need space to think, feel, travel inward, or make peace with what has been.',
    whyEnterIt:
      'To slow down, reflect, and let the road reveal what is ready to be understood.',
    stayDescription:
      'Stay here if you need calm, reflection, and music that gives your inner world room.',
    moveThroughDescription:
      'Choose this if you want to process what you are carrying and integrate it gently.',
    shiftDescription:
      'Choose this if you want to move from reflection toward power, discernment, or alignment.',
  },

  55: {
    realmId: 55,
    realmName: 'Skybound City',
    realmNumber: '55',
    icon: '⛰️',
    color: '#FACC15',
    route: '/realms/55',
    journeyStage: 'power',
    helpsWith: ['ambition', 'self-command', 'discipline', 'manifestation', 'confidence', 'upward movement'],
    thisRealmIsFor:
      'When you need to reclaim your power, direct your energy, and act with intention.',
    whyEnterIt:
      'To remember that vision without command goes nowhere, and power begins within.',
    stayDescription:
      'Stay here if you want to amplify ambition, discipline, and command.',
    moveThroughDescription:
      'Choose this if you want to turn scattered force into directed power.',
    shiftDescription:
      'Choose this if you want to rise from activation into mastery, value, or aligned action.',
  },

  44: {
    realmId: 44,
    realmName: 'Astral Bazaar',
    realmNumber: '44',
    icon: '🛍️',
    color: '#10B981',
    route: '/realms/44',
    journeyStage: 'value',
    helpsWith: ['discernment', 'value', 'boundaries', 'reciprocity', 'wise exchange', 'temptation'],
    thisRealmIsFor:
      'When you are deciding what is worth your energy, attention, time, or devotion.',
    whyEnterIt:
      'To learn the difference between glitter and value, transaction and sacred exchange.',
    stayDescription:
      'Stay here if you need to evaluate, discern, and listen for what is truly worth your energy.',
    moveThroughDescription:
      'Choose this if you want to clarify boundaries and make wiser exchanges.',
    shiftDescription:
      'Choose this if you want to move from temptation or confusion toward value and integrity.',
  },

  0: {
    realmId: 0,
    realmName: 'InterSiddhi',
    realmNumber: '0',
    icon: '🌌',
    color: '#F5F5F5',
    route: '/realms/0',
    journeyStage: 'source',
    helpsWith: ['blessing', 'alignment', 'integration', 'stillness', 'completion', 'source connection'],
    thisRealmIsFor:
      'When you need to return to what is essential, whole, and already within.',
    whyEnterIt:
      'To reconnect with the deeper self beneath striving, confusion, and performance.',
    stayDescription:
      'Stay here if you need stillness, blessing, and reconnection to what is essential.',
    moveThroughDescription:
      'Choose this if you want to integrate what you have been moving through and return to center.',
    shiftDescription:
      'Choose this if you want to move toward alignment, wholeness, and source.',
  },
};

export const REALM_DISPLAY_ORDER: RealmId[] = [303, 202, 101, 55, 44, 0];