import type { RealmFinderRealmId, RealmFinderQuestion } from "@/components/signal-board/types";

export const realmFinderRealms: Record<
    RealmFinderRealmId,
    { name: string; core: string; summary: string; signals: string[] }
> = {
    303: {
        name: "Fractured Frontier",
        core: "Creation / Rupture",
        summary: "Raw creation under instability — experimentation, survival, disruption, freedom, and turning chaos into intentional form.",
        signals: ["experimental", "disruptive", "adaptive"],
    },
    202: {
        name: "The Veil",
        core: "Perception / Illusion",
        summary: "Perception, desire, dream, projection, narrative, and learning to see what is shaping what feels real.",
        signals: ["perceptive", "dreamlike", "ambiguous"],
    },
    101: {
        name: "Moonlit Roads",
        core: "Reflection / Identity",
        summary: "Self-reflection through lived experience — memory, relationships, emotional patterns, acceptance, and choosing what comes next.",
        signals: ["reflective", "personal", "integrative"],
    },
    55: {
        name: "Skybound City",
        core: "Construction / Power",
        summary: "Directed aspiration made visible — ambition, leadership, achievement, purpose, responsibility, and what we choose to build.",
        signals: ["driven", "expansive", "purposeful"],
    },
    44: {
        name: "Astral Bazaar",
        core: "Exchange / Value",
        summary: "Value moving through relationship — timing, opportunity, resources, reciprocity, negotiation, and wise exchange.",
        signals: ["resourceful", "relational", "flowing"],
    },
    0: {
        name: "InterSiddhi",
        core: "Integration / Authenticity",
        summary: "Integrated awareness — authenticity, presence, integrity, coherence, and truth beyond the need to perform an identity.",
        signals: ["authentic", "coherent", "aware"],
    },
};

export const realmFinderQuestions: RealmFinderQuestion[] = [
    {
        id: "dominant-signal",
        eyebrow: "01 · Dominant signal",
        prompt: "What is this signal really about?",
        options: [
            { id: "create", label: "Break, survive, invent", detail: "Creating through instability, rupture, risk, rebellion, or raw possibility.", realms: [303, 55] },
            { id: "perceive", label: "Question what is real", detail: "Dream, desire, projection, hidden influence, ambiguity, or perception itself.", realms: [202, 101] },
            { id: "reflect", label: "Understand what shaped me", detail: "Memory, relationships, regret, healing, identity, or emotional patterns.", realms: [101, 202] },
            { id: "build", label: "Build, rise, lead", detail: "Ambition, purpose, achievement, leadership, influence, or legacy.", realms: [55, 44] },
            { id: "exchange", label: "Understand value and exchange", detail: "Money, time, opportunity, reciprocity, resources, relationships, or timing.", realms: [44, 55] },
            { id: "integrate", label: "Speak from what feels true", detail: "Authenticity, awareness, coherence, integrity, or identity beyond performance.", realms: [0, 101] },
        ],
    },
    {
        id: "movement",
        eyebrow: "02 · Movement",
        prompt: "What kind of movement drives the signal?",
        options: [
            { id: "rupture", label: "Rupture", detail: "Breaking structure, improvising, surviving, transforming.", realms: [303, 202] },
            { id: "drift", label: "Drift", detail: "Floating through desire, uncertainty, memory, or altered perception.", realms: [202, 101] },
            { id: "return", label: "Return", detail: "Revisiting experience to understand, accept, or choose differently.", realms: [101, 0] },
            { id: "ascent", label: "Ascent", detail: "Building momentum, growing influence, pursuing a vision.", realms: [55, 303] },
            { id: "circulation", label: "Circulation", detail: "Trading energy, resources, attention, opportunity, or connection.", realms: [44, 55] },
            { id: "center", label: "Centering", detail: "Moving toward congruence, presence, honesty, or coherence.", realms: [0, 101] },
        ],
    },
    {
        id: "world",
        eyebrow: "03 · World",
        prompt: "Which world naturally appears around it?",
        options: [
            { id: "frontier", label: "A fractured frontier", detail: "Unfinished structures, sparks, broken rules, unstable terrain.", realms: [303, 55] },
            { id: "veil", label: "A dream behind glass", detail: "Fog, screens, reflections, lanterns, hidden narratives.", realms: [202, 101] },
            { id: "roads", label: "A road through memory", detail: "Rain, mirrors, trains, old places, different versions of self.", realms: [101, 202] },
            { id: "skybound", label: "A city above the clouds", detail: "Towers, rooftops, scale, construction, visibility, achievement.", realms: [55, 44] },
            { id: "bazaar", label: "A living marketplace", detail: "Doors, clocks, contracts, conversations, trade, opportunity.", realms: [44, 55] },
            { id: "center", label: "An open center", detail: "Space, sunlight, transparent forms, presence, nothing to prove.", realms: [0, 101] },
        ],
    },
    {
        id: "tension",
        eyebrow: "04 · Creative tension",
        prompt: "Which tension feels closest to the work?",
        options: [
            { id: "freedom-form", label: "Freedom ↔ form", detail: "How much structure can exist without killing possibility?", realms: [303, 55] },
            { id: "imagination-reality", label: "Imagination ↔ reality", detail: "What is felt, desired, projected, or actually known?", realms: [202, 0] },
            { id: "repetition-integration", label: "Repetition ↔ integration", detail: "Will the past repeat, or become something understood?", realms: [101, 0] },
            { id: "ambition-stewardship", label: "Ambition ↔ stewardship", detail: "What is power for, and what responsibility comes with it?", realms: [55, 44] },
            { id: "value-timing", label: "Value ↔ timing", detail: "What is worth pursuing, exchanging, keeping, or releasing?", realms: [44, 202] },
            { id: "persona-authenticity", label: "Persona ↔ authenticity", detail: "Who remains when performance, proof, or identity falls away?", realms: [0, 101] },
        ],
    },
    {
        id: "texture",
        eyebrow: "05 · Texture",
        prompt: "What texture best carries the signal?",
        options: [
            { id: "raw", label: "Raw + fractured", detail: "Friction, distortion, exposed edges, volatile contrast.", realms: [303, 55] },
            { id: "haze", label: "Haze + reflection", detail: "Soft focus, shimmer, concealment, dreamlike detail.", realms: [202, 101] },
            { id: "rain", label: "Rain + memory", detail: "Intimacy, repetition, late-night movement, emotional residue.", realms: [101, 202] },
            { id: "scale", label: "Scale + polish", detail: "Height, momentum, precision, cinematic or commanding space.", realms: [55, 44] },
            { id: "groove", label: "Groove + exchange", detail: "Rhythm, dialogue, movement between elements, social energy.", realms: [44, 55] },
            { id: "clarity", label: "Clarity + space", detail: "Breath, cohesion, directness, openness, unforced presence.", realms: [0, 101] },
        ],
    },
    {
        id: "aftertaste",
        eyebrow: "06 · Aftertaste",
        prompt: "What should remain after the signal ends?",
        options: [
            { id: "possibility", label: "Possibility", detail: "Something broke open; a new form could emerge.", realms: [303, 55] },
            { id: "question", label: "A question", detail: "Reality feels layered, uncertain, seductive, or newly visible.", realms: [202, 101] },
            { id: "understanding", label: "Understanding", detail: "The experience means something different now.", realms: [101, 0] },
            { id: "momentum", label: "Momentum", detail: "A desire to build, lead, rise, or carry responsibility forward.", realms: [55, 303] },
            { id: "discernment", label: "Discernment about value", detail: "A clearer sense of what deserves time, trust, energy, or exchange.", realms: [44, 202] },
            { id: "truth", label: "A sense of truth", detail: "Less performance, more coherence, presence, or honest being.", realms: [0, 101] },
        ],
    },
];

export function getRealmFinderResult(answers: Record<string, string>) {
    const scores: Record<RealmFinderRealmId, number> = {
        303: 0, 202: 0, 101: 0, 55: 0, 44: 0, 0: 0,
    };

    realmFinderQuestions.forEach((question) => {
        const answerId = answers[question.id];
        const option = question.options.find((candidate) => candidate.id === answerId);
        if (!option) return;

        const isDominantSignal = question.id === "dominant-signal";
        option.realms.forEach((realmId, index) => {
            const primaryWeight = isDominantSignal ? 5 : 3;
            const secondaryWeight = isDominantSignal ? 2 : 1;
            scores[realmId] += index === 0 ? primaryWeight : secondaryWeight;
        });
    });

    const ranked = (Object.entries(scores) as Array<[string, number]>)
        .map(([realmId, score]) => ({ realmId: Number(realmId) as RealmFinderRealmId, score }))
        .sort((a, b) => b.score - a.score || a.realmId - b.realmId);

    const winner = ranked[0];
    const runnerUp = ranked[1];
    const trace = ranked[2];
    const maxPossible = realmFinderQuestions.reduce(
        (total, question) => total + (question.id === "dominant-signal" ? 5 : 3),
        0,
    );
    const resonanceScores = Object.fromEntries(
        ranked.map((item) => [item.realmId, Math.round((item.score / maxPossible) * 100)]),
    ) as Record<RealmFinderRealmId, number>;

    const dominantAnswerId = answers["dominant-signal"];
    const dominantOption = realmFinderQuestions[0].options.find((option) => option.id === dominantAnswerId);
    const dominantSignal = realmFinderRealms[winner.realmId].core;
    const explanation = dominantOption
        ? `Your dominant answer points toward ${dominantOption.label.toLowerCase()}, while the supporting answers cluster most strongly around ${realmFinderRealms[winner.realmId].name}. ${realmFinderRealms[runnerUp.realmId].name} appears as a secondary influence, with ${realmFinderRealms[trace.realmId].name} present as a subtler trace.`
        : `Your answers cluster most strongly around ${realmFinderRealms[winner.realmId].name}, with ${realmFinderRealms[runnerUp.realmId].name} secondary and ${realmFinderRealms[trace.realmId].name} as a subtler trace.`;

    return {
        ...winner,
        runnerUp,
        trace,
        meta: realmFinderRealms[winner.realmId],
        runnerUpMeta: realmFinderRealms[runnerUp.realmId],
        traceMeta: realmFinderRealms[trace.realmId],
        dominantSignal,
        explanation,
        resonanceScores,
    };
}

