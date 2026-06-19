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

/**
 * Realm Result Content v2
 *
 * This file controls the language, recommended track, reflection prompt,
 * and mode guidance that appears after the Find Your Realm alignment flow.
 *
 * The quiz scoring lives in realmAlignmentQuestions.ts.
 * This file answers: “Now that a realm was selected, how should it speak?”
 */
export const REALM_RESULT_CONTENT: Record<RealmId, RealmResultContent> = {
  303: {
    defaultMode: 'move-through',
    resultStatement:
      'Fractured Frontier appears when pressure is no longer background noise — it is asking to become motion, strength, and direct contact with what is real.',
    whyRealmFits:
      'Your answers point toward activation, intensity, survival energy, or a sense that something is breaking open. This realm does not ask you to pretend you are calm. It helps you meet the pressure without being consumed by it, then turn the fracture into force.',
    modeVariants: {
      stay: {
        recommendedTrack: 'hardcoded',
        whyMusicFits:
          'This track holds the feeling of being shaped by pressure, pain, and old programming. It lets the listener stay close to the pattern long enough to recognize it.',
        reflectionPrompt:
          'What pattern keeps repeating — and what is it trying to show me before I break it?',
        modeDescription:
          'Stay with Fractured Frontier when the intensity needs to be witnessed before it can be redirected.',
      },
      'move-through': {
        recommendedTrack: 'hardcoded',
        whyMusicFits:
          'This track carries the sound of pressure becoming awareness. It gives the fracture a rhythm so the energy can move instead of staying trapped inside the body.',
        reflectionPrompt:
          'What am I fighting right now — and what strength is this pressure trying to force out of me?',
        modeDescription:
          'Move through Fractured Frontier by turning raw charge into conscious direction.',
      },
      shift: {
        recommendedTrack: 'HardWay',
        whyMusicFits:
          'This track keeps the edge of 303 but pushes it toward confidence, retaliation, self-trust, and momentum.',
        reflectionPrompt:
          'What would shift if I stopped reacting and started directing this energy?',
        modeDescription:
          'Shift through Fractured Frontier when you are ready to move from survival mode into agency.',
      },
    },
  },

  202: {
    defaultMode: 'move-through',
    resultStatement:
      'The Veil appears when desire, fantasy, confusion, or hidden truth is pulling your attention beneath the surface.',
    whyRealmFits:
      'Your answers point toward emotional fog, longing, mystery, projection, or the sense that something is true but not fully visible yet. The Veil helps you stay close to the feeling without mistaking every feeling for the final truth.',
    modeVariants: {
      stay: {
        recommendedTrack: 'voices',
        whyMusicFits:
          'This track supports the mental haze of The Veil — the feeling of many signals, thoughts, and emotional echoes moving at once.',
        reflectionPrompt:
          'What feeling am I being asked not to run from?',
        modeDescription:
          'Stay with The Veil when the fog needs listening before it needs answers.',
      },
      'move-through': {
        recommendedTrack: 'her fantasy',
        whyMusicFits:
          'This track captures fantasy, projection, desire, numbness, romance, and emotional overload while still keeping forward motion.',
        reflectionPrompt:
          'What feels true beneath the fantasy — and what part of me is projecting instead of seeing clearly?',
        modeDescription:
          'Move through The Veil by separating emotional truth from illusion without becoming cold or disconnected.',
      },
      shift: {
        recommendedTrack: 'siren',
        whyMusicFits:
          'This track keeps the hypnotic pull of The Veil while making the attraction itself visible. It helps the listener notice what is calling them and decide whether it is guidance or temptation.',
        reflectionPrompt:
          'What am I ready to see clearly now, even if part of me still wants the illusion?',
        modeDescription:
          'Shift through The Veil when you are ready to move from projection into clearer awareness.',
      },
    },
  },

  101: {
    defaultMode: 'stay',
    resultStatement:
      'Moonlit Roads appears when your system needs space, memory, softness, and a slower way back into motion.',
    whyRealmFits:
      'Your answers point toward reflection, heaviness, quiet, grief, tenderness, or the need to process without pressure. Moonlit Roads gives the inner world room to breathe so healing can move at a human pace.',
    modeVariants: {
      stay: {
        recommendedTrack: 'holdMyHand',
        whyMusicFits:
          'This track carries tenderness, grounding, dreaminess, and the feeling of being held while the road keeps moving.',
        reflectionPrompt:
          'What am I still carrying that needs gentleness instead of speed?',
        modeDescription:
          'Stay with Moonlit Roads when the wisest next move is not force, but presence.',
      },
      'move-through': {
        recommendedTrack: 'little further',
        whyMusicFits:
          'This track supports resilience, hope, and the choice to keep going without becoming harsh with yourself.',
        reflectionPrompt:
          'What part of me is ready to go a little further without abandoning my softness?',
        modeDescription:
          'Move through Moonlit Roads by letting reflection become trust, breath, and steady forward motion.',
      },
      shift: {
        recommendedTrack: 'freeFall',
        whyMusicFits:
          'This track captures surrender, spaciousness, drifting, and the emotional release of letting yourself fall into the unknown.',
        reflectionPrompt:
          'What would help me surrender without losing myself?',
        modeDescription:
          'Shift through Moonlit Roads when reflection is ready to become release.',
      },
    },
  },

  55: {
    defaultMode: 'move-through',
    resultStatement:
      'Skybound City appears when power, ambition, discipline, visibility, or command wants to become real action.',
    whyRealmFits:
      'Your answers point toward rising energy, confidence, strength, power, or the desire to act with more authority. Skybound City helps you turn that charge into structure, direction, and visible momentum.',
    modeVariants: {
      stay: {
        recommendedTrack: 'Glory n Power',
        whyMusicFits:
          'This track locks into victory, embodiment, confidence, and the feeling of owning power without apologizing for it.',
        reflectionPrompt:
          'What power am I already holding that I have not fully owned?',
        modeDescription:
          'Stay with Skybound City when confidence needs to stabilize before the next move.',
      },
      'move-through': {
        recommendedTrack: 'Glory n Power',
        whyMusicFits:
          'This track embodies momentum, celebration, ambition, and the human charge of stepping into power.',
        reflectionPrompt:
          'Where is my energy leaking — and what would happen if I directed it fully?',
        modeDescription:
          'Move through Skybound City by turning rising energy into deliberate action.',
      },
      shift: {
        recommendedTrack: 'Bank',
        whyMusicFits:
          'This track keeps the Skybound money-motion feeling and turns ambition into a more concrete external move.',
        reflectionPrompt:
          'What is the next concrete move that would make this power real?',
        modeDescription:
          'Shift through Skybound City when inner power is ready to become structure, output, and visible momentum.',
      },
    },
  },

  44: {
    defaultMode: 'move-through',
    resultStatement:
      'Astral Bazaar appears when you are weighing value — what deserves your time, attention, loyalty, money, devotion, or energy.',
    whyRealmFits:
      'Your answers point toward evaluation, clarity, discernment, boundaries, temptation, or decision-making. Astral Bazaar helps you see what is truly valuable and what only looks valuable from a distance.',
    modeVariants: {
      stay: {
        recommendedTrack: '13933',
        whyMusicFits:
          'This track captures the elegant tension of temptation and focus — the feeling of staying clean while distractions ask for your attention.',
        reflectionPrompt:
          'What am I currently overvaluing — and what is it costing me?',
        modeDescription:
          'Stay with Astral Bazaar when discernment matters more than speed.',
      },
      'move-through': {
        recommendedTrack: 'Golden Tickets',
        whyMusicFits:
          'This track supports active discernment, access, value-testing, and the question of what is truly worth entry.',
        reflectionPrompt:
          'What in my life is truly valuable — and what only looks valuable from a distance?',
        modeDescription:
          'Move through Astral Bazaar by clarifying worth and choosing with cleaner focus.',
      },
      shift: {
        recommendedTrack: 'new jazz',
        whyMusicFits:
          'This track introduces style, motion, play, and life-force after discernment has clarified what deserves your energy.',
        reflectionPrompt:
          'What deserves my energy next, now that I see more clearly?',
        modeDescription:
          'Shift through Astral Bazaar when evaluation is ready to become chosen movement.',
      },
    },
  },

  0: {
    defaultMode: 'stay',
    resultStatement:
      'InterSiddhi appears when the deepest signal is not to push harder, but to return to center, gratitude, wholeness, and what is already essential.',
    whyRealmFits:
      'Your answers point toward alignment, gratitude, peace, return, faith, wholeness, or reconnecting with your highest signal. InterSiddhi helps you remember the part of you that is already whole beneath striving, confusion, and performance.',
    modeVariants: {
      stay: {
        recommendedTrack: 'same person',
        whyMusicFits:
          'This track carries the feeling of remaining the same core self while becoming more aware, upgraded, and integrated.',
        reflectionPrompt:
          'What part of me is already whole, even while I am still becoming?',
        modeDescription:
          'Stay with InterSiddhi when you need to receive, settle, and reconnect with what is already whole.',
      },
      'move-through': {
        recommendedTrack: 'Walking Forward',
        whyMusicFits:
          'This track supports quiet forward motion from center, helping stillness become movement without losing alignment.',
        reflectionPrompt:
          'What returns me to myself most quickly when I drift away?',
        modeDescription:
          'Move through InterSiddhi by letting stillness become aligned motion.',
      },
      shift: {
        recommendedTrack: 'Feel Blessed',
        whyMusicFits:
          'This track supports the transition from striving into gratitude, coherence, and blessing.',
        reflectionPrompt:
          'What would I do next if I moved from wholeness instead of lack?',
        modeDescription:
          'Shift through InterSiddhi when recovery is ready to become blessed forward movement.',
      },
    },
  },
};
