export type PuzzleType = 'riddle' | 'multiple-choice' | 'text-clue';

export interface PuzzleConfig {
  id: string;
  trialId: string;
  type: PuzzleType;
  prompt: string;
  acceptedAnswers?: string[];
  options?: string[];
  correctOption?: string;
  hint?: string;
}

export interface TrialPuzzleSet {
  trialId: string;
  steps: PuzzleConfig[];
}

export const REALM_303_PUZZLES: Record<string, TrialPuzzleSet> = {
  'trial-creation': {
    trialId: 'trial-creation',
    steps: [
      {
        id: 'creation-step-1',
        trialId: 'trial-creation',
        type: 'text-clue',
        prompt:
          'When broken pieces stop fighting and start fitting, what begins to appear?',
        acceptedAnswers: ['pattern', 'a pattern'],
        hint: 'Chaos becomes this before it becomes creation.',
      },
      {
        id: 'creation-step-2',
        trialId: 'trial-creation',
        type: 'multiple-choice',
        prompt: 'Which of these best represents creation emerging from chaos?',
        options: [
          'Chaos → Pattern → Creation',
          'Creation → Silence → Collapse',
          'Pattern → Chaos → Forgetting',
        ],
        correctOption: 'Chaos → Pattern → Creation',
        hint: 'The path moves from disorder toward form.',
      },
    ],
  },

  'trial-transformation': {
    trialId: 'trial-transformation',
    steps: [
      {
        id: 'transformation-step-1',
        trialId: 'trial-transformation',
        type: 'text-clue',
        prompt:
          'Creative Alchemy turns chaos into what, and destruction into what?',
        acceptedAnswers: [
          'order and creation',
          'order, creation',
          'order creation',
        ],
        hint: 'The answer is written in the realm description above.',
      },
      {
        id: 'transformation-step-2',
        trialId: 'trial-transformation',
        type: 'riddle',
        prompt:
          'I do not erase chaos. I shape it. I do not fear fragments. I arrange them. What am I?',
        acceptedAnswers: ['transformation', 'alchemy', 'creative alchemy'],
        hint: 'Think about the core power of this realm.',
      },
    ],
  },

  'trial-chaos-mastery': {
    trialId: 'trial-chaos-mastery',
    steps: [
      {
        id: 'chaos-step-1',
        trialId: 'trial-chaos-mastery',
        type: 'text-clue',
        prompt: 'The realm description says every fracture is a what?',
        acceptedAnswers: ['doorway', 'a doorway'],
        hint: 'Look closely at the final sentence of the description card.',
      },
      {
        id: 'chaos-step-2',
        trialId: 'trial-chaos-mastery',
        type: 'riddle',
        prompt:
          'I can destroy the careless, sharpen the bold, and open paths for the disciplined. What am I?',
        acceptedAnswers: ['chaos'],
        hint: 'This realm is not about escaping it, but mastering it.',
      },
    ],
  },
};


export const REALM_202_PUZZLES: Record<string, TrialPuzzleSet> = {
  'trial-dreamwalking': {
    trialId: 'trial-dreamwalking',
    steps: [
      {
        id: 'dreamwalking-step-1',
        trialId: 'trial-dreamwalking',
        type: 'text-clue',
        prompt:
          'In The Veil, memories do not vanish. They bloom into what?',
        acceptedAnswers: ['flowers', 'flower', 'memories as flowers'],
        hint: 'Read the Mist Gardens description carefully.',
      },
      {
        id: 'dreamwalking-step-2',
        trialId: 'trial-dreamwalking',
        type: 'riddle',
        prompt:
          'I am walked without feet, remembered without hands, and entered without doors. What am I?',
        acceptedAnswers: ['dream', 'a dream', 'dreams'],
        hint: 'This realm lives between sleep and waking.',
      },
    ],
  },

  'trial-clairvoyance': {
    trialId: 'trial-clairvoyance',
    steps: [
      {
        id: 'clairvoyance-step-1',
        trialId: 'trial-clairvoyance',
        type: 'text-clue',
        prompt:
          'Clairvoyance is the ability to see beyond what kind of world?',
        acceptedAnswers: ['material', 'the material', 'the material world'],
        hint: 'The answer is in the realm description above.',
      },
      {
        id: 'clairvoyance-step-2',
        trialId: 'trial-clairvoyance',
        type: 'multiple-choice',
        prompt: 'Which choice best reflects clairvoyance?',
        options: [
          'Seeing only what is directly in front of you',
          'Perceiving hidden truths beyond ordinary sight',
          'Forgetting symbols and trusting noise',
        ],
        correctOption: 'Perceiving hidden truths beyond ordinary sight',
        hint: 'Think intuition, subtle perception, hidden truth.',
      },
    ],
  },

  'trial-longings-end': {
    trialId: 'trial-longings-end',
    steps: [
      {
        id: 'longings-end-step-1',
        trialId: 'trial-longings-end',
        type: 'text-clue',
        prompt:
          'This trial asks you to release what you long for and find peace in what?',
        acceptedAnswers: ['the infinite now', 'infinite now', 'now'],
        hint: 'Read the trial description carefully.',
      },
      {
        id: 'longings-end-step-2',
        trialId: 'trial-longings-end',
        type: 'riddle',
        prompt:
          'I cannot be held by craving, but I arrive when grasping stops. What am I?',
        acceptedAnswers: ['peace', 'inner peace', 'stillness'],
        hint: 'This is what longing gives way to.',
      },
    ],
  },
};

export const REALM_101_PUZZLES: Record<string, TrialPuzzleSet> = {
  'trial-shadow-integration': {
    trialId: 'trial-shadow-integration',
    steps: [
      {
        id: 'shadow-integration-step-1',
        trialId: 'trial-shadow-integration',
        type: 'text-clue',
        prompt:
          'This trial asks you to accept what you have what?',
        acceptedAnswers: ['denied', 'denied in yourself', 'denied within yourself'],
        hint: 'Read the trial description closely.',
      },
      {
        id: 'shadow-integration-step-2',
        trialId: 'trial-shadow-integration',
        type: 'riddle',
        prompt:
          'I follow you in silence, deepen in moonlight, and disappear only when faced. What am I?',
        acceptedAnswers: ['shadow', 'your shadow', 'shadow self'],
        hint: 'This realm begins with confrontation, not avoidance.',
      },
    ],
  },

  'trial-midnight-clarity': {
    trialId: 'trial-midnight-clarity',
    steps: [
      {
        id: 'midnight-clarity-step-1',
        trialId: 'trial-midnight-clarity',
        type: 'text-clue',
        prompt:
          'The trial says truth shines brightest at what time?',
        acceptedAnswers: ['midnight', 'at midnight'],
        hint: 'The answer is in the trial description.',
      },
      {
        id: 'midnight-clarity-step-2',
        trialId: 'trial-midnight-clarity',
        type: 'multiple-choice',
        prompt: 'What does clarity in this realm require?',
        options: [
          'Escaping darkness entirely',
          'Seeing clearly within darkness',
          'Ignoring everything hidden',
        ],
        correctOption: 'Seeing clearly within darkness',
        hint: 'This realm is about lucid awareness, not avoidance.',
      },
    ],
  },

  'trial-illuminated-darkness': {
    trialId: 'trial-illuminated-darkness',
    steps: [
      {
        id: 'illuminated-darkness-step-1',
        trialId: 'trial-illuminated-darkness',
        type: 'text-clue',
        prompt:
          'This trial asks you to become the what that walks through shadow?',
        acceptedAnswers: ['light', 'the light'],
        hint: 'The answer is directly in the trial description.',
      },
      {
        id: 'illuminated-darkness-step-2',
        trialId: 'trial-illuminated-darkness',
        type: 'riddle',
        prompt:
          'I do not erase the dark, but reveal what it hides. What am I?',
        acceptedAnswers: ['light', 'illumination', 'awareness'],
        hint: 'Think revelation, not destruction.',
      },
    ],
  },
};

export const REALM_55_PUZZLES: Record<string, TrialPuzzleSet> = {
  'trial-ascent': {
    trialId: 'trial-ascent',
    steps: [
      {
        id: 'ascent-step-2',
        trialId: 'trial-ascent',
        type: 'riddle',
        prompt:
          'I rise when vision is steady, collapse when fear takes hold, and grow stronger the higher I am tested. What am I?',
        acceptedAnswers: ['ascent', 'rise', 'elevation'],
        hint: 'This first trial is about upward movement and earned height.',
      },
    ],
  },

  'trial-command': {
    trialId: 'trial-command',
    steps: [
      {
        id: 'command-step-2',
        trialId: 'trial-command',
        type: 'multiple-choice',
        prompt: 'What best reflects command in Skybound City?',
        options: [
          'Waiting for power to arrive on its own',
          'Directing power with clarity and intention',
          'Avoiding responsibility for what is created',
        ],
        correctOption: 'Directing power with clarity and intention',
        hint: 'True power here is disciplined, not passive.',
      },
    ],
  },

  'trial-summit-will': {
    trialId: 'trial-summit-will',
    steps: [
      {
        id: 'summit-will-step-1',
        trialId: 'trial-summit-will',
        type: 'text-clue',
        prompt:
          'What quality must remain steady when the climb becomes difficult?',
        acceptedAnswers: ['will', 'your will', 'steady will'],
        hint: 'The trial title points directly to it.',
      },
      {
        id: 'summit-will-step-2',
        trialId: 'trial-summit-will',
        type: 'riddle',
        prompt:
          'I am not height, yet I determine whether height can be held. What am I?',
        acceptedAnswers: ['will', 'discipline', 'resolve'],
        hint: 'Summits are reached by more than ambition.',
      },
    ],
  },
};

export const REALM_44_PUZZLES: Record<string, TrialPuzzleSet> = {
  'trial-barter-of-truth': {
    trialId: 'trial-barter-of-truth',
    steps: [
      {
        id: 'barter-truth-step-1',
        trialId: 'trial-barter-of-truth',
        type: 'text-clue',
        prompt:
          'Astral Bazaar is a realm of hustle and what?',
        acceptedAnswers: ['wisdom', 'hustle and wisdom'],
        hint: 'Check the realm subtitle.',
      },
      {
        id: 'barter-truth-step-2',
        trialId: 'trial-barter-of-truth',
        type: 'riddle',
        prompt:
          'I can be sold cheaply by the careless, but only the wise know my true cost. What am I?',
        acceptedAnswers: ['truth', 'discernment', 'value'],
        hint: 'This trial is about what should never be traded lightly.',
      },
    ],
  },

  'trial-discernment': {
    trialId: 'trial-discernment',
    steps: [
      {
        id: 'discernment-step-1',
        trialId: 'trial-discernment',
        type: 'text-clue',
        prompt:
          'What allows you to tell glitter from genuine worth?',
        acceptedAnswers: ['discernment', 'wisdom', 'clear discernment'],
        hint: 'This is the core skill of the second trial.',
      },
      {
        id: 'discernment-step-2',
        trialId: 'trial-discernment',
        type: 'multiple-choice',
        prompt: 'Which choice best reflects discernment?',
        options: [
          'Choosing whatever shines the brightest',
          'Testing appearance against deeper value',
          'Trusting speed over wisdom',
        ],
        correctOption: 'Testing appearance against deeper value',
        hint: 'Discernment slows down the impulse to grab.',
      },
    ],
  },

  'trial-sacred-exchange': {
    trialId: 'trial-sacred-exchange',
    steps: [
      {
        id: 'sacred-exchange-step-1',
        trialId: 'trial-sacred-exchange',
        type: 'text-clue',
        prompt:
          'A sacred exchange requires value, presence, and what else?',
        acceptedAnswers: ['integrity', 'truth', 'honesty'],
        hint: 'Think about what keeps exchange clean.',
      },
      {
        id: 'sacred-exchange-step-2',
        trialId: 'trial-sacred-exchange',
        type: 'riddle',
        prompt:
          'When both sides leave more whole, I have occurred. What am I?',
        acceptedAnswers: ['exchange', 'sacred exchange', 'fair exchange'],
        hint: 'This final trial is about reciprocity with wisdom.',
      },
    ],
  },
};

export const REALM_0_PUZZLES: Record<string, TrialPuzzleSet> = {
  'trial-remembrance': {
    trialId: 'trial-remembrance',
    steps: [
      {
        id: 'remembrance-step-1',
        trialId: 'trial-remembrance',
        type: 'text-clue',
        prompt:
          'At the source, what returns before striving can continue?',
        acceptedAnswers: ['remembrance', 'memory', 'remembering'],
        hint: 'The trial title is the first key.',
      },
      {
        id: 'remembrance-step-2',
        trialId: 'trial-remembrance',
        type: 'riddle',
        prompt:
          'I am never truly lost, only obscured until recognized. What am I?',
        acceptedAnswers: ['source', 'self', 'truth'],
        hint: 'Realm 0 is about return, not acquisition.',
      },
    ],
  },

  'trial-unity': {
    trialId: 'trial-unity',
    steps: [
      {
        id: 'unity-step-1',
        trialId: 'trial-unity',
        type: 'text-clue',
        prompt:
          'What must dissolve for unity to be experienced directly?',
        acceptedAnswers: ['separation', 'division', 'the illusion of separation'],
        hint: 'Unity begins where fragmentation ends.',
      },
      {
        id: 'unity-step-2',
        trialId: 'trial-unity',
        type: 'multiple-choice',
        prompt: 'Which choice best reflects unity?',
        options: [
          'Dominating every separate part',
          'Recognizing the many within the one',
          'Refusing all difference entirely',
        ],
        correctOption: 'Recognizing the many within the one',
        hint: 'Unity is not sameness.',
      },
    ],
  },

  'trial-return-to-source': {
    trialId: 'trial-return-to-source',
    steps: [
      {
        id: 'return-source-step-1',
        trialId: 'trial-return-to-source',
        type: 'text-clue',
        prompt:
          'The final movement is not forward but where?',
        acceptedAnswers: ['back', 'within', 'to source', 'home'],
        hint: 'This realm resolves the whole journey.',
      },
      {
        id: 'return-source-step-2',
        trialId: 'trial-return-to-source',
        type: 'riddle',
        prompt:
          'I am the beginning hidden inside the end. What am I?',
        acceptedAnswers: ['source', 'origin', 'home'],
        hint: 'The last trial loops the entire path.',
      },
    ],
  },
};