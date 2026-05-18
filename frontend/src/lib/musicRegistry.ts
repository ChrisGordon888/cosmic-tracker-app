/**
 * COSMIC MULTIVERSE — MUSIC REGISTRY
 *
 * PURPOSE:
 * This file is the single source of truth for realm soundtrack metadata.
 *
 * It powers:
 * - Nexus realm soundtrack cards
 * - RealmSoundstage components
 * - Global mini player
 * - Music listening XP
 * - Future featured shelves, playlist lanes, vaults, and premium unlocks
 *
 * FILE ORGANIZATION:
 * Store audio by realm:
 *
 * /public/music/realms/303/track-name.mp3
 * /public/music/realms/202/track-name.mp3
 * /public/music/realms/101/track-name.mp3
 * /public/music/realms/55/track-name.mp3
 * /public/music/realms/44/track-name.mp3
 * /public/music/realms/0/track-name.mp3
 *
 * BEST PRACTICE:
 * - Keep folders organized by realm.
 * - Keep filenames clean and stable.
 * - Track batch/date/status inside metadata, not always in the filename.
 * - Only add dates to filenames if there are multiple versions.
 *
 * FEATURED SYSTEM:
 * - role: 'anchor' is the original/main realm identity track.
 * - role: 'featured' is a top/current track you may want to highlight.
 * - role: 'expansion' is a normal added track.
 * - role: 'vault' is a demo/rough draft/private-candidate track.
 *
 * FUTURE:
 * We can later create UI shelves from this metadata:
 * - Featured Tracks
 * - April–May Vault
 * - Realm Anchors
 * - Demo Vault
 * - Premium / Supporter Previews
 */

export type RealmId = 303 | 202 | 101 | 55 | 44 | 0;

export type TrackRole = 'anchor' | 'featured' | 'expansion' | 'vault';

export type TrackStatus =
    | 'finished'
    | 'demo'
    | 'rough-draft'
    | 'needs-mix'
    | 'needs-writing'
    | 'clip-only';

export interface MusicTrack {
    id: string;
    realmId: RealmId;
    realmName: string;
    trackTitle: string;
    artist: string;
    trackUrl: string;
    realmColor: string;

    /**
     * Optional metadata for future UI/features.
     * These fields will not break the current player.
     */
    role?: TrackRole;
    status?: TrackStatus;
    releaseBatch?: string;
    key?: string;
    bpm?: number;
    vibe?: string[];
    bestUse?: string[];
    isFeatured?: boolean;
    sortOrder?: number;
    notes?: string;
}

export const REALM_COLORS: Record<RealmId, string> = {
    303: '#FF4D6D',
    202: '#8B5CF6',
    101: '#38BDF8',
    55: '#FACC15',
    44: '#10B981',
    0: '#E5E7EB',
};

export const REALM_NAMES: Record<RealmId, string> = {
    303: 'Fractured Frontier',
    202: 'The Veil',
    101: 'Moonlit Roads',
    55: 'Skybound City',
    44: 'Astral Bazaar',
    0: 'InterSiddhi',
};

const ARTIST = 'COSMIC';

function createTrack(track: Omit<MusicTrack, 'artist' | 'realmName' | 'realmColor'>): MusicTrack {
    return {
        ...track,
        artist: ARTIST,
        realmName: REALM_NAMES[track.realmId],
        realmColor: REALM_COLORS[track.realmId],
    };
}

export const MUSIC_REGISTRY: MusicTrack[] = [
    // =========================================================
    // REALM 303 — FRACTURED FRONTIER
    // Chaos, pressure, rupture, survival, self-overcoming.
    // =========================================================

    createTrack({
        id: 'realm-303-not-enough',
        realmId: 303,
        trackTitle: 'Not Enough',
        trackUrl: '/music/realms/303/notEnough.mp3',
        role: 'anchor',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 10,
        vibe: ['pressure', 'conflict', 'survival'],
        bestUse: ['realm anchor', 'original Nexus track'],
    }),

    createTrack({
        id: 'realm-303-war-ready',
        realmId: 303,
        trackTitle: 'War Ready',
        trackUrl: '/music/realms/303/warReady.mp3',
        role: 'anchor',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 20,
        vibe: ['battle', 'activation', 'pressure'],
        bestUse: ['activation track', 'realm opener'],
    }),

    createTrack({
        id: 'realm-303-space-king',
        realmId: 303,
        trackTitle: 'Space King',
        trackUrl: '/music/realms/303/spaceKing.mp3',
        role: 'expansion',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 30,
        vibe: ['cosmic', 'power', 'fracture'],
        bestUse: ['realm expansion'],
    }),

    createTrack({
        id: '303-hardcoded',
        realmId: 303,
        trackTitle: 'hardcoded',
        trackUrl: '/music/realms/303/hardcoded.mp3',
        role: 'featured',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Bmin',
        bpm: 133,
        isFeatured: true,
        sortOrder: 1,
        vibe: ['bouncy', 'spacious', 'hypnotic', 'wounded', 'self-overcoming'],
        bestUse: ['realm opener', 'dark playlist anchor', 'transition into freeFall'],
        notes:
            'Confronts programmed emotional patterns, clones, pain, healing, and surrender.',
    }),

    createTrack({
        id: '303-losing-my-mind',
        realmId: 303,
        trackTitle: 'losing my mind',
        trackUrl: '/music/realms/303/losing-my-mind.mp3',
        role: 'featured',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'G#min',
        bpm: 118,
        isFeatured: true,
        sortOrder: 2,
        vibe: ['dark', 'emotional', 'haunted', 'urgent', 'truth-seeking'],
        bestUse: ['Fractured Frontier featured track', 'dark visual teaser'],
        notes:
            'Fighting death, demons, distractions, self-sabotage, and searching for truth.',
    }),

    createTrack({
        id: '303-hardway',
        realmId: 303,
        trackTitle: 'HardWay',
        trackUrl: '/music/realms/303/hardway.mp3',
        role: 'featured',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'A#min',
        bpm: 156,
        isFeatured: true,
        sortOrder: 3,
        vibe: ['emotional', 'hard', 'powerful', 'traumatic', 'magical'],
        bestUse: ['high-energy social clip', 'performance record', 'realm anthem'],
        notes:
            'Turns trauma, opposition, rage, and violence into strength and self-trust.',
    }),

    createTrack({
        id: '303-outcome',
        realmId: 303,
        trackTitle: 'outcome',
        trackUrl: '/music/realms/303/outcome.mp3',
        role: 'expansion',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'D#min',
        bpm: 85,
        sortOrder: 40,
        vibe: ['witty', 'arcade', 'combative', 'loop-breaking'],
        bestUse: ['game-coded realm track', 'trial-theme track', 'social clip'],
        notes:
            'High-energy battle/exploration feeling despite slower BPM. Arcade and loop-breaking themes.',
    }),

    createTrack({
        id: '303-in-the-deep',
        realmId: 303,
        trackTitle: 'in the deep',
        trackUrl: '/music/realms/303/in-the-deep.mp3',
        role: 'expansion',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'C#min',
        bpm: 80,
        sortOrder: 50,
        vibe: ['dark', 'submerged', 'hard', 'heated', 'volatile'],
        bestUse: ['dark realm track', 'underground clip', 'intensity track'],
        notes:
            'Dark trap beat with submarine/deep pressure imagery, money/energy, and volatile magic.',
    }),

    // =========================================================
    // REALM 202 — THE VEIL
    // Mystery, longing, dream-state, fantasy, emotional haze.
    // =========================================================

    createTrack({
        id: 'realm-202-night-light',
        realmId: 202,
        trackTitle: 'Night Light',
        trackUrl: '/music/realms/202/nightLight.mp3',
        role: 'anchor',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 10,
        vibe: ['dream', 'night', 'mystery'],
        bestUse: ['original Nexus track', 'realm anchor'],
    }),

    createTrack({
        id: 'realm-202-what-it-take',
        realmId: 202,
        trackTitle: 'What it Take',
        trackUrl: '/music/realms/202/whatItTake.mp3',
        role: 'anchor',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 20,
        vibe: ['mystery', 'desire', 'pressure'],
        bestUse: ['realm expansion'],
    }),

    createTrack({
        id: 'realm-202-jus-because',
        realmId: 202,
        trackTitle: 'Jus Because',
        trackUrl: '/music/realms/202/jusBecause.mp3',
        role: 'expansion',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 30,
        vibe: ['dreamy', 'relationship', 'veil'],
        bestUse: ['realm expansion'],
    }),

    createTrack({
        id: 'realm-202-blame-on-me',
        realmId: 202,
        trackTitle: 'Blame On Me',
        trackUrl: '/music/realms/202/blameOnMe.mp3',
        role: 'expansion',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 40,
        vibe: ['emotional', 'shadow', 'blame'],
        bestUse: ['realm expansion'],
    }),

    createTrack({
        id: '202-siren',
        realmId: 202,
        trackTitle: 'siren',
        trackUrl: '/music/realms/202/siren.mp3',
        role: 'featured',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Gmin',
        bpm: 155,
        isFeatured: true,
        sortOrder: 1,
        vibe: ['mysterious', 'dark', 'elegant', 'dangerous', 'dreamlike', 'cinematic'],
        bestUse: ['Veil featured track', 'visual teaser', 'music video candidate'],
        notes:
            'Siren warning energy, dreamlike danger, fake labels, water imagery, and money focus.',
    }),

    createTrack({
        id: '202-her-fantasy',
        realmId: 202,
        trackTitle: 'her fantasy',
        trackUrl: '/music/realms/202/her-fantasy.mp3',
        role: 'featured',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'D#min',
        bpm: 144,
        isFeatured: true,
        sortOrder: 2,
        vibe: ['dreamy', 'romantic', 'numb', 'guitar-driven', 'emotional'],
        bestUse: ['Veil featured track', 'melodic trap playlist', 'social clip'],
        notes:
            'Fantasy vs reality, numb love, emotional overload, and romantic projection.',
    }),

    createTrack({
        id: '202-voices',
        realmId: 202,
        trackTitle: 'voices',
        trackUrl: '/music/realms/202/voices.mp3',
        role: 'expansion',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'F#min',
        bpm: 94,
        sortOrder: 50,
        vibe: ['soft', 'melodic', 'futuristic', 'summery', 'romantic', 'mentally hazy'],
        bestUse: ['Veil playlist track', 'soft social clip', 'melodic mood-setter'],
        notes:
            'A million voices hook over a smooth futuristic summer/love atmosphere.',
    }),

    createTrack({
        id: '202-airplane-mode',
        realmId: 202,
        trackTitle: 'airplane mode',
        trackUrl: '/music/realms/202/airplane-mode.mp3',
        role: 'vault',
        status: 'needs-writing',
        releaseBatch: 'april-may-2026',
        key: 'C#min',
        bpm: 120,
        sortOrder: 60,
        vibe: ['pluggnb', 'spacious', 'floating', 'reflective', 'disconnected'],
        bestUse: ['future hook polish', 'Veil demo', 'playlist candidate'],
        notes:
            'Airplane mode as disconnect/reconnect metaphor. Needs lyric refinement.',
    }),

    // =========================================================
    // REALM 101 — MOONLIT ROADS
    // Reflection, memory, emotional integration, night movement.
    // =========================================================

    createTrack({
        id: 'realm-101-mysterious-way',
        realmId: 101,
        trackTitle: 'Mysterious Way',
        trackUrl: '/music/realms/101/mysteriousWay.mp3',
        role: 'anchor',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 10,
        vibe: ['reflection', 'night', 'mystery'],
        bestUse: ['original Nexus track', 'realm anchor'],
    }),

    createTrack({
        id: 'realm-101-hopscotch',
        realmId: 101,
        trackTitle: 'Hopscotch',
        trackUrl: '/music/realms/101/hopscotch.mp3',
        role: 'expansion',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 20,
        vibe: ['movement', 'memory', 'playful'],
        bestUse: ['realm expansion'],
    }),

    createTrack({
        id: 'realm-101-so-far-off',
        realmId: 101,
        trackTitle: 'So Far Off',
        trackUrl: '/music/realms/101/soFarOff.mp3',
        role: 'anchor',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 30,
        vibe: ['distance', 'emotion', 'reflection'],
        bestUse: ['realm expansion'],
    }),

    createTrack({
        id: '101-hold-my-hand',
        realmId: 101,
        trackTitle: 'holdMyHand',
        trackUrl: '/music/realms/101/holdMyHand.mp3',
        role: 'featured',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Cmaj',
        bpm: 143,
        isFeatured: true,
        sortOrder: 1,
        vibe: ['tender', 'dreamy', 'smooth', 'healing', 'lush', 'grounding'],
        bestUse: ['emotional entry point', 'featured realm track', 'fan-favorite candidate'],
        notes:
            'Healing and dreamy connection. Feels more Moonlit if grounding is central.',
    }),

    createTrack({
        id: '101-little-further',
        realmId: 101,
        trackTitle: 'little further',
        trackUrl: '/music/realms/101/little-further.mp3',
        role: 'featured',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'F#min',
        bpm: 96,
        isFeatured: true,
        sortOrder: 2,
        vibe: ['hopeful', 'emotional', 'soft', 'loving', 'guitar-driven', 'resilient'],
        bestUse: ['Moonlit featured track', 'reflective playlist anchor', 'motivational soft clip'],
        notes:
            'Pushing oneself a little further, trusting oneself, and keeping going.',
    }),

    createTrack({
        id: '101-freefall',
        realmId: 101,
        trackTitle: 'freeFall',
        trackUrl: '/music/realms/101/freefall.mp3',
        role: 'featured',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Dmin',
        bpm: 144,
        isFeatured: true,
        sortOrder: 3,
        vibe: ['atmospheric', 'spacious', 'reflective', 'surrendering', 'drifting'],
        bestUse: ['emotional entry point', 'late-night playlist', 'transition track'],
        notes:
            'Surrendering into uncertainty and drifting with the current. Smooth transition from hardcoded.',
    }),

    createTrack({
        id: '101-through-da-forest',
        realmId: 101,
        trackTitle: 'through da forest',
        trackUrl: '/music/realms/101/through-da-forest.mp3',
        role: 'expansion',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'G#min',
        bpm: 81,
        sortOrder: 40,
        vibe: ['playful', 'mystical', 'arcade', 'forested', 'smooth', 'reflective'],
        bestUse: ['worldbuilding track', 'game-inspired clip', 'Moonlit side-path track'],
        notes:
            'Legend of Zelda / forest quest energy with sword-ogre imagery and reflective second verse.',
    }),

    createTrack({
        id: '101-paranoid',
        realmId: 101,
        trackTitle: 'paranoid',
        trackUrl: '/music/realms/101/paranoid.mp3',
        role: 'vault',
        status: 'needs-writing',
        releaseBatch: 'april-may-2026',
        key: 'Cmaj',
        bpm: 137,
        sortOrder: 50,
        vibe: ['drifting', 'redemptive', 'summery', 'anxious', 'reflective'],
        bestUse: ['rewrite candidate', 'late-night playlist', 'private vault'],
        notes:
            'Trying to get home and kicking out paranoia. Needs refinement.',
    }),

    createTrack({
        id: '101-wondering',
        realmId: 101,
        trackTitle: 'wondering',
        trackUrl: '/music/realms/101/wondering.mp3',
        role: 'vault',
        status: 'rough-draft',
        releaseBatch: 'april-may-2026',
        key: 'Bmin',
        bpm: 150,
        sortOrder: 60,
        vibe: ['raw', 'reflective', 'nostalgic', 'upbeat', 'wandering'],
        bestUse: ['private vault', 'future rewrite candidate', 'late-night demo'],
        notes:
            'Trauma awareness, outside wars, wandering, and SoundCloud-era energy. Needs work.',
    }),

    createTrack({
        id: '101-felt-it',
        realmId: 101,
        trackTitle: 'felt it',
        trackUrl: '/music/realms/101/feltIt.mp3',
        role: 'vault',
        status: 'needs-writing',
        releaseBatch: 'april-may-2026',
        key: 'Dmaj',
        bpm: 81,
        sortOrder: 70,
        vibe: ['nostalgic', 'soft', 'wavey', 'romantic', 'summery', 'imaginative'],
        bestUse: ['future emotional track', 'late-night playlist', 'private vault'],
        notes:
            'Soft guitar, summer night imagination, love, and overcoming doubt. Needs topic focus.',
    }),

    // =========================================================
    // REALM 55 — SKYBOUND CITY
    // Ambition, power, manifestation, victory, command.
    // =========================================================

    createTrack({
        id: 'realm-55-mula',
        realmId: 55,
        trackTitle: 'Mula',
        trackUrl: '/music/realms/55/mula.mp3',
        role: 'anchor',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 10,
        vibe: ['money', 'motion', 'power'],
        bestUse: ['original Nexus track', 'realm anchor'],
    }),

    createTrack({
        id: 'realm-55-bank',
        realmId: 55,
        trackTitle: 'Bank',
        trackUrl: '/music/realms/55/bank.mp3',
        role: 'anchor',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 20,
        vibe: ['power', 'wealth', 'command'],
        bestUse: ['realm expansion'],
    }),

    createTrack({
        id: 'realm-55-stacked',
        realmId: 55,
        trackTitle: 'Stacked',
        trackUrl: '/music/realms/55/stacked.mp3',
        role: 'expansion',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 30,
        vibe: ['stacking', 'power', 'manifestation'],
        bestUse: ['realm expansion'],
    }),

    createTrack({
        id: '55-glory-n-power',
        realmId: 55,
        trackTitle: 'Glory n Power',
        trackUrl: '/music/realms/55/glory-n-power.mp3',
        role: 'featured',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'C#min',
        bpm: 152,
        isFeatured: true,
        sortOrder: 1,
        vibe: ['anthemic', 'victorious', 'messy', 'human', 'celebratory', 'powerful'],
        bestUse: ['realm anthem', 'motivational clip', 'performance track'],
        notes:
            'Glory and power vs money/powder. Enjoying the moment while recognizing the energy behind things.',
    }),

    // =========================================================
    // REALM 44 — ASTRAL BAZAAR
    // Value, exchange, temptation, taste, discernment.
    // =========================================================

    createTrack({
        id: 'realm-44-dog-watch',
        realmId: 44,
        trackTitle: 'Dog Watch',
        trackUrl: '/music/realms/44/dogWatch.mp3',
        role: 'anchor',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 10,
        vibe: ['market', 'watchful', 'value'],
        bestUse: ['original Nexus track', 'realm anchor'],
    }),

    createTrack({
        id: 'realm-44-golden-tickets',
        realmId: 44,
        trackTitle: 'Golden Tickets',
        trackUrl: '/music/realms/44/goldenTickets.mp3',
        role: 'anchor',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 20,
        vibe: ['access', 'tickets', 'rarity'],
        bestUse: ['realm expansion'],
    }),

    createTrack({
        id: '44-13933',
        realmId: 44,
        trackTitle: '13933',
        trackUrl: '/music/realms/44/13933.mp3',
        role: 'featured',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Dmin',
        bpm: 148,
        isFeatured: true,
        sortOrder: 1,
        vibe: ['smooth', 'mysterious', 'suave', 'ambitious', 'coded', 'elegant'],
        bestUse: ['stylish realm track', 'playlist anchor', 'social clip'],
        notes:
            'Beautiful distraction / bot concept. Focus, rank, ambition, and temptation.',
    }),

    createTrack({
        id: '44-new-jazz',
        realmId: 44,
        trackTitle: 'new jazz',
        trackUrl: '/music/realms/44/new-jazz.mp3',
        role: 'featured',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Dmin',
        bpm: 96,
        isFeatured: true,
        sortOrder: 2,
        vibe: ['bouncy', 'exotic', 'stylish', 'youthful', 'playful', 'smooth'],
        bestUse: ['Astral playlist track', 'lifestyle clip', 'stylish interlude'],
        notes:
            'Money, beautiful life, women, letting go of the past, and enjoying the moment.',
    }),

    // =========================================================
    // REALM 0 — INTERSIDDHI
    // Source, integration, self-recognition, blessing, completion.
    // =========================================================

    createTrack({
        id: 'realm-0-walking-forward',
        realmId: 0,
        trackTitle: 'Walking Forward',
        trackUrl: '/music/realms/0/walkingForward.mp3',
        role: 'anchor',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 10,
        vibe: ['forward', 'source', 'completion'],
        bestUse: ['original Nexus track', 'realm anchor'],
    }),

    createTrack({
        id: 'realm-0-feel-blessed',
        realmId: 0,
        trackTitle: 'Feel Blessed',
        trackUrl: '/music/realms/0/feelBlessed.mp3',
        role: 'anchor',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 20,
        vibe: ['blessing', 'gratitude', 'alignment'],
        bestUse: ['realm expansion'],
    }),

    createTrack({
        id: '0-same-person',
        realmId: 0,
        trackTitle: 'same person',
        trackUrl: '/music/realms/0/same-person.mp3',
        role: 'featured',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Bmin',
        bpm: 122,
        isFeatured: true,
        sortOrder: 1,
        vibe: ['hypnotic', 'clean', 'nostalgic', 'self-aware', 'grounded', 'evolving'],
        bestUse: ['source-path track', 'introspective playlist', 'future polished fan favorite'],
        notes:
            'Same core self while upgrading, solving self, receiving blessings, and becoming more integrated.',
    }),
];

export const FEATURED_TRACKS = MUSIC_REGISTRY.filter((track) => track.isFeatured);

export const TOP_THREE_TRACKS = MUSIC_REGISTRY.filter((track) => track.isFeatured)
    .sort((a, b) => {
        const realmOrder: RealmId[] = [303, 202, 101, 55, 44, 0];
        const aRealmIndex = realmOrder.indexOf(a.realmId);
        const bRealmIndex = realmOrder.indexOf(b.realmId);

        if (aRealmIndex !== bRealmIndex) return aRealmIndex - bRealmIndex;

        return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
    })
    .slice(0, 3);

export const TRACKS_BY_REALM = MUSIC_REGISTRY.reduce<Record<RealmId, MusicTrack[]>>(
    (acc, track) => {
        acc[track.realmId].push(track);
        acc[track.realmId].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
        return acc;
    },
    {
        303: [],
        202: [],
        101: [],
        55: [],
        44: [],
        0: [],
    }
);