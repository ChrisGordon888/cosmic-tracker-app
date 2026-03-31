import type { ExperienceMode, RealmId } from './realmStateMap';

export interface ModeVariantContent {
  recommendedTrack: string;
  whyMusicFits: string;
  reflectionPrompt: string;
  modeDescription: string;
}

export interface RealmResultContent {
  defaultMode: ExperienceMode;
  resultStatement: string;
  whyRealmFits: string;
  modeVariants: Record<ExperienceMode, ModeVariantContent>;
}

export const REALM_RESULT_CONTENT: Record<RealmId, RealmResultContent> = {
  303: {
    defaultMode: 'move-through',
    resultStatement:
      'This realm often appears when life feels sharp, unstable, demanding, or like something is breaking open.',
    whyRealmFits:
      'You may be carrying pressure, chaos, conflict, or survival energy. Fractured Frontier helps you find force inside the fracture.',
    modeVariants: {
      stay: {
        recommendedTrack: 'War Ready',
        whyMusicFits:
          'This track validates raw pressure and confrontation without asking you to soften too early.',
        reflectionPrompt:
          'What part of me is under the most pressure right now?',
        modeDescription:
          'Stay with the intensity long enough to understand what it is revealing.',
      },
      'move-through': {
        recommendedTrack: 'War Ready',
        whyMusicFits:
          'This track carries survival force and momentum, helping you move through chaos instead of freezing inside it.',
        reflectionPrompt:
          'What am I fighting right now — and what strength is this pressure trying to force out of me?',
        modeDescription:
          'Use this realm to process pressure and begin directing it into movement.',
      },
      shift: {
        recommendedTrack: 'Space King',
        whyMusicFits:
          'This track keeps the edge but introduces more command and forward movement.',
        reflectionPrompt:
          'What would shift if I stopped reacting and started directing this energy?',
        modeDescription:
          'Shift from fracture into agency by turning raw force into intention.',
      },
    },
  },

  202: {
    defaultMode: 'move-through',
    resultStatement:
      'This realm often appears when you feel pulled by longing, confusion, fantasy, or hidden emotional truth.',
    whyRealmFits:
      'The Veil helps you sit with mystery and desire without forcing false certainty too early.',
    modeVariants: {
      stay: {
        recommendedTrack: 'Night Light',
        whyMusicFits:
          'This track supports mystery, emotional fog, and the quiet tension of not fully knowing yet.',
        reflectionPrompt:
          'What feeling am I being asked not to run from?',
        modeDescription:
          'Stay with the fog long enough to hear what it is trying to say.',
      },
      'move-through': {
        recommendedTrack: 'What It Take',
        whyMusicFits:
          'This track carries emotional yearning and forward motion, helping you move through confusion without collapsing into it.',
        reflectionPrompt:
          'What feels true beneath the fog — and what part of me is projecting instead of seeing clearly?',
        modeDescription:
          'Move through illusion by staying close to what feels emotionally true.',
      },
      shift: {
        recommendedTrack: 'Night Light',
        whyMusicFits:
          'This track holds mystery while gently guiding you toward clearer emotional awareness.',
        reflectionPrompt:
          'What am I ready to see more clearly now?',
        modeDescription:
          'Shift from seduction and projection toward emotional clarity.',
      },
    },
  },

  101: {
    defaultMode: 'stay',
    resultStatement:
      'This realm often appears when you need room for reflection, grief, memory, distance, or emotional integration.',
    whyRealmFits:
      'Moonlit Roads offers movement without pressure and helps you understand what is surfacing.',
    modeVariants: {
      stay: {
        recommendedTrack: 'Mysterious Way',
        whyMusicFits:
          'This track supports spacious reflection and lets your inner world speak without rushing it.',
        reflectionPrompt:
          'What am I still carrying that needs space instead of speed?',
        modeDescription:
          'Stay here when the wisest next step is reflection, not force.',
      },
      'move-through': {
        recommendedTrack: 'So Far Off',
        whyMusicFits:
          'This track carries distance, movement, and emotional travel, helping reflection become gentle motion.',
        reflectionPrompt:
          'What memory or emotion is asking to be integrated instead of avoided?',
        modeDescription:
          'Move through this realm by letting reflection become understanding.',
      },
      shift: {
        recommendedTrack: 'hopscotch',
        whyMusicFits:
          'This track introduces lift and motion while preserving the softer mood of the realm.',
        reflectionPrompt:
          'What would help me move forward without abandoning what I have learned?',
        modeDescription:
          'Shift from reflection toward re-entry, movement, and renewed lightness.',
      },
    },
  },

  55: {
    defaultMode: 'move-through',
    resultStatement:
      'This realm often appears when you need ambition, discipline, command, manifestation, and upward movement.',
    whyRealmFits:
      'Skybound City helps you turn rising energy into focused, intentional power.',
    modeVariants: {
      stay: {
        recommendedTrack: 'Bank',
        whyMusicFits:
          'This track locks into confidence and focused upward motion without diffusing your power.',
        reflectionPrompt:
          'What power am I already holding that I have not fully owned?',
        modeDescription:
          'Stay here when you need to stabilize your power before directing it.',
      },
      'move-through': {
        recommendedTrack: 'Bank',
        whyMusicFits:
          'This track embodies confidence, wealth-building momentum, and disciplined movement.',
        reflectionPrompt:
          'Where is my energy leaking — and what would happen if I directed it fully?',
        modeDescription:
          'Move through this realm by turning rising energy into deliberate action.',
      },
      shift: {
        recommendedTrack: 'Stacked',
        whyMusicFits:
          'This track keeps the ambition but adds a more active forward-driving push.',
        reflectionPrompt:
          'What is the next concrete move that would make this power real?',
        modeDescription:
          'Shift from inner power into visible manifestation and momentum.',
      },
    },
  },

  44: {
    defaultMode: 'move-through',
    resultStatement:
      'This realm often appears when you are deciding what is worth your energy, time, attention, or devotion.',
    whyRealmFits:
      'Astral Bazaar helps you clarify value, boundaries, and the quality of your exchanges.',
    modeVariants: {
      stay: {
        recommendedTrack: 'Golden Tickets',
        whyMusicFits:
          'This track holds access, rarity, and temptation, letting you study value before choosing.',
        reflectionPrompt:
          'What am I currently overvaluing — and why?',
        modeDescription:
          'Stay here when discernment matters more than speed.',
      },
      'move-through': {
        recommendedTrack: 'Golden Tickets',
        whyMusicFits:
          'This track supports active discernment, value-testing, and selective attention.',
        reflectionPrompt:
          'What in my life is truly valuable — and what only looks valuable from a distance?',
        modeDescription:
          'Move through this realm by clarifying worth and choosing more wisely.',
      },
      shift: {
        recommendedTrack: 'hopscotch',
        whyMusicFits:
          'This track introduces motion and lift after discernment has clarified what matters.',
        reflectionPrompt:
          'What deserves my energy next, now that I see more clearly?',
        modeDescription:
          'Shift from evaluation into aligned movement and chosen direction.',
      },
    },
  },

  0: {
    defaultMode: 'stay',
    resultStatement:
      'This realm often appears when you need alignment, blessing, stillness, completion, and return to what is essential.',
    whyRealmFits:
      'InterSiddhi helps you reconnect with what is already whole beneath striving and confusion.',
    modeVariants: {
      stay: {
        recommendedTrack: 'Feel Blessed',
        whyMusicFits:
          'This track carries gratitude, deserving, and spiritual arrival.',
        reflectionPrompt:
          'What is already present in my life that I have not fully allowed myself to receive?',
        modeDescription:
          'Stay here when you need to receive, settle, and reconnect with what is already whole.',
      },
      'move-through': {
        recommendedTrack: 'Feel Blessed',
        whyMusicFits:
          'This track helps you move through noise by re-centering in gratitude and alignment.',
        reflectionPrompt:
          'What returns me to myself most quickly when I drift away?',
        modeDescription:
          'Move through this realm by letting stillness become alignment in motion.',
      },
      shift: {
        recommendedTrack: 'Feel Blessed',
        whyMusicFits:
          'This track supports transition from striving into coherence and blessing.',
        reflectionPrompt:
          'What would I do next if I moved from wholeness instead of lack?',
        modeDescription:
          'Shift from recovery into aligned forward movement without losing center.',
      },
    },
  },
};