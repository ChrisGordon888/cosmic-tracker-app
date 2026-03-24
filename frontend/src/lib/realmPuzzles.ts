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

// ─── REALM 303 ─────────────────────────────────────────────────────────────
export const REALM_303_PUZZLES: Record<string, TrialPuzzleSet> = {
    'trial-creation': {
        trialId: 'trial-creation',
        steps: [
            {
                id: 'creation-step-1',
                trialId: 'trial-creation',
                type: 'text-clue',
                prompt: 'When broken pieces stop fighting and start fitting, what begins to appear?',
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
                prompt: 'Creative Alchemy turns chaos into what, and destruction into what?',
                acceptedAnswers: ['order and creation', 'order, creation', 'order creation'],
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

// ─── REALM 202 ─────────────────────────────────────────────────────────────
export const REALM_202_PUZZLES: Record<string, TrialPuzzleSet> = {
    'trial-dreamwalking': {
        trialId: 'trial-dreamwalking',
        steps: [
            {
                id: 'dreamwalking-step-1',
                trialId: 'trial-dreamwalking',
                type: 'text-clue',
                prompt: 'In The Veil, memories do not vanish. They bloom into what?',
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
                prompt: 'Clairvoyance is the ability to see beyond what kind of world?',
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
                prompt: 'This trial asks you to release what you long for and find peace in what?',
                acceptedAnswers: ['the infinite now', 'infinite now', 'now'],
                hint: 'Read the trial description carefully.',
            },
            {
                id: 'longings-end-step-2',
                trialId: 'trial-longings-end',
                type: 'riddle',
                prompt: 'I cannot be held by craving, but I arrive when grasping stops. What am I?',
                acceptedAnswers: ['peace', 'inner peace', 'stillness'],
                hint: 'This is what longing gives way to.',
            },
        ],
    },
};

// ─── REALM 101 ─────────────────────────────────────────────────────────────
export const REALM_101_PUZZLES: Record<string, TrialPuzzleSet> = {
    'trial-shadow-integration': {
        trialId: 'trial-shadow-integration',
        steps: [
            {
                id: 'shadow-integration-step-1',
                trialId: 'trial-shadow-integration',
                type: 'text-clue',
                prompt: 'This trial asks you to accept what you have what?',
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
                prompt: 'The trial says truth shines brightest at what time?',
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
                prompt: 'This trial asks you to become the what that walks through shadow?',
                acceptedAnswers: ['light', 'the light'],
                hint: 'The answer is directly in the trial description.',
            },
            {
                id: 'illuminated-darkness-step-2',
                trialId: 'trial-illuminated-darkness',
                type: 'riddle',
                prompt: 'I do not erase the dark, but reveal what it hides. What am I?',
                acceptedAnswers: ['light', 'illumination', 'awareness'],
                hint: 'Think revelation, not destruction.',
            },
        ],
    },
};

// ─── REALM 55 — Skybound City ────────────────────────────────────────────────
// Trials 1 & 2 each have a location step (step 0) then 2 puzzles (steps 1 & 2).
// Trial 3 is pure puzzle: 2 puzzles here + 1 inline final puzzle in the page.
export const REALM_55_PUZZLES: Record<string, { steps: PuzzleConfig[] }> = {
    'trial-sovereignty': {
        steps: [
            {
                id: 'sovereignty-step-2',
                trialId: 'trial-sovereignty',
                type: 'multiple-choice',
                prompt: 'The Tower has been climbed. Now answer: true sovereignty comes from…',
                options: [
                    'Physical domination and outward force',
                    'External validation and the approval of others',
                    'Complete mastery of self — ruling the inner world first',
                    'The size of your empire',
                ],
                correctOption: 'Complete mastery of self — ruling the inner world first',
                hint: 'The king who cannot rule himself cannot rule a kingdom.',
            },
            {
                id: 'sovereignty-step-3',
                trialId: 'trial-sovereignty',
                type: 'multiple-choice',
                prompt: 'A sovereign\'s word is law because it is backed by…',
                options: [
                    'An army large enough to enforce it',
                    'Absolute certainty, integrity, and follow-through',
                    'Wealth and material power',
                    'Fear and punishment',
                ],
                correctOption: 'Absolute certainty, integrity, and follow-through',
                hint: 'Power without integrity collapses. Integrity without power merely waits.',
            },
        ],
    },
    'trial-power-manifestation': {
        steps: [
            {
                id: 'manifestation-step-2',
                trialId: 'trial-power-manifestation',
                type: 'multiple-choice',
                prompt: 'The Arena proved your strength. Manifestation requires aligned thought, emotion, and…',
                options: [
                    'Perfect timing and ideal circumstances',
                    'Consistent, aligned action taken daily',
                    'Permission from those above you',
                    'Waiting until everything is ready',
                ],
                correctOption: 'Consistent, aligned action taken daily',
                hint: 'Vision without action is daydreaming. Action without vision is chaos.',
            },
            {
                id: 'manifestation-step-3',
                trialId: 'trial-power-manifestation',
                type: 'multiple-choice',
                prompt: 'Which statement best describes true power manifestation?',
                options: [
                    'Forcing outcomes through sheer willpower alone',
                    'Aligning inner state with outer action until reality shifts',
                    'Waiting for the right moment to act',
                    'Accumulating enough resources before beginning',
                ],
                correctOption: 'Aligning inner state with outer action until reality shifts',
                hint: 'The manifest world is always a reflection of the internal world first.',
            },
        ],
    },
    'trial-divine-authority': {
        steps: [
            {
                id: 'authority-step-1',
                trialId: 'trial-divine-authority',
                type: 'multiple-choice',
                prompt: 'Divine authority is most powerfully expressed through…',
                options: [
                    'Raising your voice and displaying force',
                    'Calm, commanding presence and absolute clarity of purpose',
                    'Accumulating titles, symbols, and status',
                    'Eliminating all who oppose you',
                ],
                correctOption: 'Calm, commanding presence and absolute clarity of purpose',
                hint: 'The most powerful rulers in history spoke softly — and were heard across centuries.',
            },
            {
                id: 'authority-step-2',
                trialId: 'trial-divine-authority',
                type: 'multiple-choice',
                prompt: 'What is the hidden foundation beneath all lasting power?',
                options: [
                    'Wealth and resource accumulation',
                    'A loyal network of allies',
                    'Discipline — the invisible law that structures all authority',
                    'The right bloodline or birthright',
                ],
                correctOption: 'Discipline — the invisible law that structures all authority',
                hint: 'No empire rose without it. No throne held without it. It is the first quality of every great ruler.',
            },
            {
                id: 'authority-step-3',
                trialId: 'trial-divine-authority',
                type: 'multiple-choice',
                prompt: 'When divine authority is fully embodied, power becomes…',
                options: [
                    'A performance meant to impress others',
                    'A quiet force aligned with truth, discipline, and purpose',
                    'A weapon to dominate the weak',
                    'A title granted by outside approval',
                ],
                correctOption: 'A quiet force aligned with truth, discipline, and purpose',
                hint: 'This final step is about integrated authority, not display.',
            },
        ],
    },
};

// ─── REALM 44 ──────────────────────────────────────────────────────────────
// Step model:
//   trial-barter-of-truth : location (0→1) + step-1 (1→2) + step-2 (2→3)
//   trial-discernment     : location (0→1) + step-1 (1→2) + step-2 (2→3)
//   trial-sacred-exchange : step-1 (0→1) + step-2 (1→2) + step-3 (2→3)
export const REALM_44_PUZZLES: Record<string, TrialPuzzleSet> = {
    'trial-barter-of-truth': {
        trialId: 'trial-barter-of-truth',
        steps: [
            {
                id: 'barter-truth-step-1',
                trialId: 'trial-barter-of-truth',
                type: 'text-clue',
                prompt: 'Astral Bazaar is a realm of hustle and what?',
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
                prompt: 'What allows you to tell glitter from genuine worth?',
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
                prompt: 'A sacred exchange requires value, presence, and what else?',
                acceptedAnswers: ['integrity', 'truth', 'honesty'],
                hint: 'Think about what keeps exchange clean.',
            },
            {
                id: 'sacred-exchange-step-2',
                trialId: 'trial-sacred-exchange',
                type: 'riddle',
                prompt: 'When both sides leave more whole, I have occurred. What am I?',
                acceptedAnswers: ['exchange', 'sacred exchange', 'fair exchange'],
                hint: 'This final trial is about reciprocity with wisdom.',
            },
            // Step 2 → 3 (added for 3-step consistency)
            {
                id: 'sacred-exchange-step-3',
                trialId: 'trial-sacred-exchange',
                type: 'multiple-choice',
                prompt: 'Which of these best describes a sacred exchange?',
                options: [
                    'Extracting the most value from every transaction',
                    'Giving and receiving in alignment with truth and integrity',
                    'Trading only when profit is guaranteed',
                ],
                correctOption: 'Giving and receiving in alignment with truth and integrity',
                hint: 'Sacred exchange is not commerce — it is covenant.',
            },
        ],
    },
};

// ─── REALM 0 ───────────────────────────────────────────────────────────────
// Step model:
//   trial-remembrance      : location (0→1) + step-1 (1→2) + step-2 (2→3)
//   trial-unity            : location (0→1) + step-1 (1→2) + step-2 (2→3)
//   trial-return-to-source : step-1 (0→1) + step-2 (1→2) + step-3 (2→3)
export const REALM_0_PUZZLES: Record<string, TrialPuzzleSet> = {
    'trial-remembrance': {
        trialId: 'trial-remembrance',
        steps: [
            {
                id: 'remembrance-step-1',
                trialId: 'trial-remembrance',
                type: 'text-clue',
                prompt: 'At the source, what returns before striving can continue?',
                acceptedAnswers: ['remembrance', 'memory', 'remembering'],
                hint: 'The trial title is the first key.',
            },
            {
                id: 'remembrance-step-2',
                trialId: 'trial-remembrance',
                type: 'riddle',
                prompt: 'I am never truly lost, only obscured until recognized. What am I?',
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
                prompt: 'What must dissolve for unity to be experienced directly?',
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
                prompt: 'The final movement is not forward but where?',
                acceptedAnswers: ['back', 'within', 'to source', 'home'],
                hint: 'This realm resolves the whole journey.',
            },
            {
                id: 'return-source-step-2',
                trialId: 'trial-return-to-source',
                type: 'riddle',
                prompt: 'I am the beginning hidden inside the end. What am I?',
                acceptedAnswers: ['source', 'origin', 'home'],
                hint: 'The last trial loops the entire path.',
            },
            // Step 2 → 3 (added for 3-step consistency)
            {
                id: 'return-source-step-3',
                trialId: 'trial-return-to-source',
                type: 'multiple-choice',
                prompt: 'What does returning to source ultimately reveal?',
                options: [
                    'That the journey was always leading outward',
                    'That you were the source all along',
                    'That striving must continue without end',
                ],
                correctOption: 'That you were the source all along',
                hint: 'The final realm closes the circle.',
            },
        ],
    },
};