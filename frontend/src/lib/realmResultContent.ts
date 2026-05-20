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
      'This realm often appears when life feels sharp, unstable, demanding, coded, or like something inside you is being forced to break open.',
    whyRealmFits:
      'You may be carrying pressure, chaos, conflict, or survival energy. Fractured Frontier helps you recognize the pattern, meet the pressure, and find force inside the fracture.',
    modeVariants: {
      stay: {
        recommendedTrack: 'hardcoded',
        whyMusicFits:
          'This track sits inside the feeling of being programmed by pain, pressure, and old patterns without rushing the listener out of it too quickly.',
        reflectionPrompt:
          'What pattern keeps repeating — and what is it trying to teach me before I break it?',
        modeDescription:
          'Stay with the intensity long enough to understand the code behind the pressure.',
      },
      'move-through': {
        recommendedTrack: 'hardcoded',
        whyMusicFits:
          'This track carries the sound of recognizing internal programming, confronting pain, and beginning to move through it with awareness.',
        reflectionPrompt:
          'What am I fighting right now — and what strength is this pressure trying to force out of me?',
        modeDescription:
          'Use this realm to process pressure and begin turning fracture into directed movement.',
      },
      shift: {
        recommendedTrack: 'HardWay',
        whyMusicFits:
          'This track keeps the edge of Fractured Frontier but pushes the energy toward power, retaliation, self-trust, and momentum.',
        reflectionPrompt:
          'What would shift if I stopped reacting and started directing this energy?',
        modeDescription:
          'Shift from raw fracture into agency by turning pressure into command.',
      },
    },
  },

  202: {
    defaultMode: 'move-through',
    resultStatement:
      'This realm often appears when you feel pulled by longing, confusion, fantasy, projection, or hidden emotional truth.',
    whyRealmFits:
      'The Veil helps you sit with mystery, desire, emotional fog, and fantasy without forcing false certainty too early.',
    modeVariants: {
      stay: {
        recommendedTrack: 'voices',
        whyMusicFits:
          'This track supports the softer mental haze of The Veil — the feeling of many thoughts, signals, and emotions moving at once.',
        reflectionPrompt:
          'What feeling am I being asked not to run from?',
        modeDescription:
          'Stay with the fog long enough to hear what it is trying to say.',
      },
      'move-through': {
        recommendedTrack: 'her fantasy',
        whyMusicFits:
          'This track captures fantasy, projection, numbness, romance, and emotional overload while still keeping forward motion.',
        reflectionPrompt:
          'What feels true beneath the fantasy — and what part of me is projecting instead of seeing clearly?',
        modeDescription:
          'Move through illusion by staying close to what feels emotionally true.',
      },
      shift: {
        recommendedTrack: 'Night Light',
        whyMusicFits:
          'This track holds the mystery of The Veil while giving the listener a softer light to follow out of the fog.',
        reflectionPrompt:
          'What am I ready to see more clearly now?',
        modeDescription:
          'Shift from seduction, projection, and emotional fog toward clearer awareness.',
      },
    },
  },

  101: {
    defaultMode: 'stay',
    resultStatement:
      'This realm often appears when you need room for reflection, healing, memory, distance, softness, or emotional integration.',
    whyRealmFits:
      'Moonlit Roads offers movement without pressure and helps you understand what is surfacing at a gentler pace.',
    modeVariants: {
      stay: {
        recommendedTrack: 'holdMyHand',
        whyMusicFits:
          'This track carries tenderness, grounding, dreaminess, and the feeling of being held while the road keeps moving.',
        reflectionPrompt:
          'What am I still carrying that needs gentleness instead of speed?',
        modeDescription:
          'Stay here when the wisest next step is reflection, softness, and emotional grounding.',
      },
      'move-through': {
        recommendedTrack: 'little further',
        whyMusicFits:
          'This track supports resilience, hope, and the choice to keep going without becoming harsh with yourself.',
        reflectionPrompt:
          'What part of me is ready to go a little further without abandoning my softness?',
        modeDescription:
          'Move through this realm by letting reflection become trust and forward motion.',
      },
      shift: {
        recommendedTrack: 'freeFall',
        whyMusicFits:
          'This track captures surrender, spaciousness, drifting, and the emotional release of letting yourself fall into the unknown.',
        reflectionPrompt:
          'What would help me surrender without losing myself?',
        modeDescription:
          'Shift from reflection into release, trust, and motion through uncertainty.',
      },
    },
  },

  55: {
    defaultMode: 'move-through',
    resultStatement:
      'This realm often appears when you need ambition, discipline, confidence, command, manifestation, and upward movement.',
    whyRealmFits:
      'Skybound City helps you turn rising energy into focused, intentional power.',
    modeVariants: {
      stay: {
        recommendedTrack: 'Glory n Power',
        whyMusicFits:
          'This track locks into victory, embodiment, confidence, and the feeling of enjoying power while recognizing the energy behind it.',
        reflectionPrompt:
          'What power am I already holding that I have not fully owned?',
        modeDescription:
          'Stay here when you need to stabilize confidence, command, and upward energy.',
      },
      'move-through': {
        recommendedTrack: 'Glory n Power',
        whyMusicFits:
          'This track embodies momentum, celebration, ambition, and the messy human charge of stepping into power.',
        reflectionPrompt:
          'Where is my energy leaking — and what would happen if I directed it fully?',
        modeDescription:
          'Move through this realm by turning rising energy into deliberate action.',
      },
      shift: {
        recommendedTrack: 'Bank',
        whyMusicFits:
          'This track keeps the Skybound money-motion feeling and turns ambition into a more focused external move.',
        reflectionPrompt:
          'What is the next concrete move that would make this power real?',
        modeDescription:
          'Shift from inner power into visible manifestation and practical momentum.',
      },
    },
  },

  44: {
    defaultMode: 'move-through',
    resultStatement:
      'This realm often appears when you are deciding what is worth your energy, attention, time, loyalty, or devotion.',
    whyRealmFits:
      'Astral Bazaar helps you clarify value, boundaries, temptation, focus, and the quality of your exchanges.',
    modeVariants: {
      stay: {
        recommendedTrack: '13933',
        whyMusicFits:
          'This track captures the elegant temptation of distraction while still holding the ambition and focus needed to stay clean.',
        reflectionPrompt:
          'What am I currently overvaluing — and why?',
        modeDescription:
          'Stay here when discernment matters more than speed.',
      },
      'move-through': {
        recommendedTrack: 'Golden Tickets',
        whyMusicFits:
          'This track supports active discernment, access, value-testing, and the question of what is truly worth entry.',
        reflectionPrompt:
          'What in my life is truly valuable — and what only looks valuable from a distance?',
        modeDescription:
          'Move through this realm by clarifying worth and choosing more wisely.',
      },
      shift: {
        recommendedTrack: 'new jazz',
        whyMusicFits:
          'This track introduces style, motion, play, and life-force after discernment has clarified what deserves your energy.',
        reflectionPrompt:
          'What deserves my energy next, now that I see more clearly?',
        modeDescription:
          'Shift from evaluation into chosen movement, taste, and aligned enjoyment.',
      },
    },
  },

  0: {
    defaultMode: 'stay',
    resultStatement:
      'This realm often appears when you need alignment, blessing, stillness, completion, and return to what is essential.',
    whyRealmFits:
      'InterSiddhi helps you reconnect with what is already whole beneath striving, confusion, and performance.',
    modeVariants: {
      stay: {
        recommendedTrack: 'same person',
        whyMusicFits:
          'This track carries the feeling of remaining the same core self while becoming more aware, upgraded, and integrated.',
        reflectionPrompt:
          'What part of me is already whole, even while I am still becoming?',
        modeDescription:
          'Stay here when you need to receive, settle, and reconnect with what is already whole.',
      },
      'move-through': {
        recommendedTrack: 'Walking Forward',
        whyMusicFits:
          'This track supports quiet forward motion from center, helping stillness become movement without losing alignment.',
        reflectionPrompt:
          'What returns me to myself most quickly when I drift away?',
        modeDescription:
          'Move through this realm by letting stillness become alignment in motion.',
      },
      shift: {
        recommendedTrack: 'Feel Blessed',
        whyMusicFits:
          'This track supports the transition from striving into gratitude, coherence, and blessing.',
        reflectionPrompt:
          'What would I do next if I moved from wholeness instead of lack?',
        modeDescription:
          'Shift from recovery into aligned forward movement without losing center.',
      },
    },
  },
};