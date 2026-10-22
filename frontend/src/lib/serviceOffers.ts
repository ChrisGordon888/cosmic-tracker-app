type OfferOption = {
    slug: string;
    label: string;
    category: string;
    price: string;
    short: string;
    bestFor: string;
    outcome?: string;
    sendPrompt?: string;
    messagePrompt?: string;
};

export const SERVICE_OFFERS: OfferOption[] = [
    {
        slug: "not-sure", label: "Not sure yet / help me choose", category: "Question", price: "Open inquiry",
        short: "Share the music and context you have. We’ll identify a useful next step.",
        bestFor: "Artists who want to discuss where to begin.",
    },
    {
        slug: "creative-direction-session", label: "Creative-development pilot session", category: "Session", price: "Pilot session · ~$150",
        short: "A focused session with Christopher to develop one song and sharpen its next direction.",
        bestFor: "One song in any shape: a beat, rough demo, hook, verse, voice memo or lyrics.",
        sendPrompt: "Share your song, lyrics, visual references or creative notes, if you have them.",
        messagePrompt: "What do you want to develop in this song, and what would you like to leave with?",
    },
    {
        slug: "song-project-development-pack", label: "Songwriting / Production", category: "Project inquiry", price: "Scoped separately",
        short: "Discuss writing, arrangement and production support for the material you already have.",
        bestFor: "Artists who want to develop unfinished work over several sessions.",
    },
    {
        slug: "music-daw-workflow-lesson", label: "Lessons / Workshops", category: "Workflow", price: "Scoped separately",
        short: "Discuss a focused lesson or workshop around your recording, DAW or creative workflow.",
        bestFor: "Artists who want help working with their sessions.",
    },
    {
        slug: "artist-world-audit", label: "Artist-World / Digital Work", category: "Release", price: "Scoped separately",
        short: "Discuss a Release World, artist website or digital presentation grounded in your music.",
        bestFor: "Artists ready to explore a separately scoped extension of their music.",
    },
];

