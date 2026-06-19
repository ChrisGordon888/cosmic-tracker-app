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
 * - Featured release / rollout modules
 * - Future playlist lanes, vaults, premium unlocks, and seasonal projects
 *
 * CORE IDEA:
 * MUSIC_REGISTRY = every track and its metadata.
 * MUSIC_COLLECTIONS = curated experiences made from those tracks.
 * FEATURED_RELEASES = the current release campaign layer.
 *
 * This lets the app support:
 * - 1 app-wide flagship song
 * - 6 realm anchors
 * - public realm listening
 * - signed-in vault tracks
 * - current release campaigns (ex: SIRENS in Neverland)
 * - artwork and story-based EP/group concepts
 */

export type RealmId = 303 | 202 | 101 | 55 | 44 | 0;

export type TrackRole =
    | 'flagship'
    | 'anchor'
    | 'public'
    | 'featured'
    | 'expansion'
    | 'vault'
    | 'premium';

export type TrackVisibility = 'public' | 'signup' | 'premium';

export type TrackStatus =
    | 'finished'
    | 'demo'
    | 'rough-draft'
    | 'needs-mix'
    | 'needs-writing'
    | 'clip-only';

export type TrackEnergy = 'low' | 'medium' | 'high';

export type ReleaseProjectId = 'sirens-in-neverland';

export type ReleasePhase =
    | 'teaser'
    | 'lead-single'
    | 'second-single'
    | 'ep-focus'
    | 'ep-track'
    | 'released';

export type ReleaseStatus = 'building' | 'upcoming' | 'live' | 'archived';

export type MusicCollectionType =
    | 'flagship'
    | 'realm-anchor-set'
    | 'public-three-piece'
    | 'vault'
    | 'premium'
    | 'season'
    | 'episode'
    | 'release-project';

export interface MusicTrack {
    id: string;
    realmId: RealmId;
    realmName: string;
    trackTitle: string;
    artist: string;
    trackUrl: string;
    realmColor: string;

    /**
     * Catalog metadata.
     * These fields are designed so the Nexus can evolve without rewriting
     * the entire music system every time the catalog changes.
     */
    role?: TrackRole;
    visibility?: TrackVisibility;
    status?: TrackStatus;
    releaseBatch?: string;
    key?: string;
    bpm?: number;
    energy?: TrackEnergy;
    vibe?: string[];
    bestUse?: string[];
    isFeatured?: boolean;
    isFlagship?: boolean;
    isRealmAnchor?: boolean;
    isPublicPick?: boolean;
    sortOrder?: number;
    notes?: string;

    /**
     * Release-layer metadata.
     * Lets a track belong to both the realm system and a release campaign.
     */
    releaseProjectId?: ReleaseProjectId;
    releasePhase?: ReleasePhase;
    releasePriority?: number;
    isUpcomingRelease?: boolean;
    isCurrentReleaseFocus?: boolean;
}

export interface MusicCollection {
    id: string;
    title: string;
    type: MusicCollectionType;
    realmId?: RealmId;
    releaseProjectId?: ReleaseProjectId;
    description: string;
    story: string;
    trackIds: string[];
    artworkUrl?: string;
    youtubeEpisodeTitle?: string;
    isActive: boolean;
    sortOrder: number;
}

export interface FeaturedReleaseConfig {
    id: ReleaseProjectId;
    title: string;
    status: ReleaseStatus;
    type: 'single' | 'ep';
    description: string;
    story: string;
    coverArtUrl?: string;
    primaryTrackId?: string;
    collectionId?: string;
    releaseWindow?: string;
    ctaLabel: string;
    ctaHref: string;
    isCurrent: boolean;
    timeline: {
        label: string;
        dateLabel: string;
        status: 'done' | 'now' | 'next' | 'later';
    }[];
}

export const REALM_COLORS: Record<RealmId, string> = {
    303: '#FF5D7A',
    202: '#A884FF',
    101: '#7ED3FF',
    55: '#ECC973',
    44: '#F4AB63',
    0: '#EEF3FA',
};

export const REALM_NAMES: Record<RealmId, string> = {
    303: 'Fractured Frontier',
    202: 'The Veil',
    101: 'Moonlit Roads',
    55: 'Skybound City',
    44: 'Astral Bazaar',
    0: 'InterSiddhi',
};

export const REALM_ORDER: RealmId[] = [303, 202, 101, 55, 44, 0];

const ARTIST = 'COSMIC';

function createTrack(track: Omit<MusicTrack, 'artist' | 'realmName' | 'realmColor'>): MusicTrack {
    return {
        visibility: 'public',
        ...track,
        artist: ARTIST,
        realmName: REALM_NAMES[track.realmId],
        realmColor: REALM_COLORS[track.realmId],
    };
}

export const MUSIC_REGISTRY: MusicTrack[] = [
    // =========================================================
    // ACTIVE RELEASE LAYER — SIRENS IN NEVERLAND
    // Tracks remain mapped to realms, but also belong to the
    // current release project for Nexus / rollout surfacing.
    // =========================================================

    createTrack({
        id: 'sin-do-over',
        realmId: 202,
        trackTitle: 'Do Over',
        trackUrl: '/music/realms/202/doOver.mp3',
        role: 'featured',
        visibility: 'public',
        status: 'needs-mix',
        releaseBatch: 'sin-2026',
        key: 'C#min',
        bpm: 140,
        energy: 'medium',
        isFeatured: true,
        isPublicPick: true,
        sortOrder: 0,
        vibe: ['hypnotic', 'oceanic', 'romantic', 'looping', 'haunted', 'melodic'],
        bestUse: ['lead single', 'EP opener', 'release-world entry point'],
        notes: 'Lead single and opening chapter for SIRENS in Neverland.',
        releaseProjectId: 'sirens-in-neverland',
        releasePhase: 'lead-single',
        releasePriority: 1,
        isUpcomingRelease: true,
        isCurrentReleaseFocus: true,
    }),

    createTrack({
        id: 'sin-running-from-the-plug',
        realmId: 202,
        trackTitle: 'Running From The Plug',
        trackUrl: '/music/realms/202/runningFromThePlug.mp3',
        role: 'featured',
        visibility: 'public',
        status: 'needs-mix',
        releaseBatch: 'sin-2026',
        key: 'Bmin',
        bpm: 150,
        energy: 'high',
        isFeatured: true,
        isPublicPick: true,
        sortOrder: 1,
        vibe: ['urgent', 'electric', 'dark', 'fast', 'melodic', 'dangerous'],
        bestUse: ['second single', 'motion clip', 'contrast record'],
        notes: 'Second single and energy-expansion chapter for SIRENS in Neverland.',
        releaseProjectId: 'sirens-in-neverland',
        releasePhase: 'second-single',
        releasePriority: 2,
        isUpcomingRelease: true,
    }),

    // =========================================================
    // REALM 303 — FRACTURED FRONTIER
    // Chaos, pressure, rupture, survival, self-overcoming.
    // =========================================================

    createTrack({
        id: 'realm-303-not-enough',
        realmId: 303,
        trackTitle: 'Not Enough',
        trackUrl: '/music/realms/303/notEnough.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 40,
        vibe: ['pressure', 'conflict', 'survival'],
        bestUse: ['original Nexus track', 'vault archive'],
    }),

    createTrack({
        id: 'realm-303-war-ready',
        realmId: 303,
        trackTitle: 'War Ready',
        trackUrl: '/music/realms/303/warReady.mp3',
        role: 'public',
        visibility: 'public',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 30,
        isPublicPick: true,
        vibe: ['battle', 'activation', 'pressure'],
        bestUse: ['activation track', 'realm opener'],
    }),

    createTrack({
        id: 'realm-303-space-king',
        realmId: 303,
        trackTitle: 'Space King',
        trackUrl: '/music/realms/303/spaceKing.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 50,
        vibe: ['cosmic', 'power', 'fracture'],
        bestUse: ['realm expansion', 'vault archive'],
    }),

    createTrack({
        id: '303-hardcoded',
        realmId: 303,
        trackTitle: 'hardcoded',
        trackUrl: '/music/realms/303/hardcoded.mp3',
        role: 'anchor',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Bmin',
        bpm: 133,
        energy: 'medium',
        isFeatured: true,
        isRealmAnchor: true,
        isPublicPick: true,
        sortOrder: 1,
        vibe: ['bouncy', 'spacious', 'hypnotic', 'wounded', 'self-overcoming'],
        bestUse: ['realm anchor', 'dark playlist opener', 'transition into freeFall'],
        notes: 'Confronts programmed emotional patterns, clones, pain, healing, and surrender.',
    }),

    createTrack({
        id: '303-losing-my-mind',
        realmId: 303,
        trackTitle: 'losing my mind',
        trackUrl: '/music/realms/303/losing-my-mind.mp3',
        role: 'public',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'G#min',
        bpm: 118,
        energy: 'medium',
        isFeatured: true,
        isPublicPick: true,
        sortOrder: 2,
        vibe: ['dark', 'emotional', 'haunted', 'urgent', 'truth-seeking'],
        bestUse: ['Fractured Frontier featured track', 'dark visual teaser'],
        notes: 'Fighting death, demons, distractions, self-sabotage, and searching for truth.',
    }),

    createTrack({
        id: '303-hardway',
        realmId: 303,
        trackTitle: 'HardWay',
        trackUrl: '/music/realms/303/hardway.mp3',
        role: 'public',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'A#min',
        bpm: 156,
        energy: 'high',
        isFeatured: true,
        isPublicPick: true,
        sortOrder: 3,
        vibe: ['emotional', 'hard', 'powerful', 'traumatic', 'magical'],
        bestUse: ['high-energy social clip', 'performance record', 'realm anthem'],
        notes: 'Turns trauma, opposition, rage, and violence into strength and self-trust.',
    }),

    createTrack({
        id: '303-outcome',
        realmId: 303,
        trackTitle: 'outcome',
        trackUrl: '/music/realms/303/outcome.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'D#min',
        bpm: 85,
        energy: 'high',
        sortOrder: 60,
        vibe: ['witty', 'arcade', 'combative', 'loop-breaking'],
        bestUse: ['game-coded realm track', 'trial-theme track', 'social clip'],
        notes: 'High-energy battle/exploration feeling despite slower BPM. Arcade and loop-breaking themes.',
    }),

    createTrack({
        id: '303-in-the-deep',
        realmId: 303,
        trackTitle: 'In The Deep',
        trackUrl: '/music/realms/303/in-the-deep.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'C#min',
        bpm: 80,
        energy: 'high',
        sortOrder: 70,
        vibe: ['dark', 'submerged', 'hard', 'heated', 'volatile'],
        bestUse: ['dark realm track', 'underground clip', 'intensity track'],
        notes: 'Dark trap beat with submarine/deep pressure imagery, money/energy, and volatile magic.',
        releaseProjectId: 'sirens-in-neverland',
        releasePhase: 'ep-track',
        releasePriority: 4,
        isUpcomingRelease: true,
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
        role: 'vault',
        visibility: 'signup',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 40,
        vibe: ['dream', 'night', 'mystery'],
        bestUse: ['original Nexus track', 'vault archive'],
    }),

    createTrack({
        id: 'realm-202-what-it-take',
        realmId: 202,
        trackTitle: 'What it Take',
        trackUrl: '/music/realms/202/whatItTake.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 50,
        vibe: ['mystery', 'desire', 'pressure'],
        bestUse: ['realm expansion', 'vault archive'],
    }),

    createTrack({
        id: 'realm-202-jus-because',
        realmId: 202,
        trackTitle: 'Jus Because',
        trackUrl: '/music/realms/202/jusBecause.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 60,
        vibe: ['dreamy', 'relationship', 'veil'],
        bestUse: ['realm expansion', 'vault archive'],
    }),

    createTrack({
        id: 'realm-202-blame-on-me',
        realmId: 202,
        trackTitle: 'Blame On Me',
        trackUrl: '/music/realms/202/blameOnMe.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 70,
        vibe: ['emotional', 'shadow', 'blame'],
        bestUse: ['realm expansion', 'vault archive'],
    }),

    createTrack({
        id: '202-siren',
        realmId: 202,
        trackTitle: 'Siren',
        trackUrl: '/music/realms/202/siren.mp3',
        role: 'flagship',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Gmin',
        bpm: 155,
        energy: 'high',
        isFeatured: true,
        isFlagship: true,
        isPublicPick: true,
        sortOrder: 2,
        vibe: ['mysterious', 'dark', 'elegant', 'dangerous', 'dreamlike', 'cinematic'],
        bestUse: ['app flagship', 'visual teaser', 'music video candidate'],
        notes: 'Siren warning energy, dreamlike danger, fake labels, water imagery, and money focus.',
        releaseProjectId: 'sirens-in-neverland',
        releasePhase: 'ep-track',
        releasePriority: 6,
        isUpcomingRelease: true,
    }),

    createTrack({
        id: '202-her-fantasy',
        realmId: 202,
        trackTitle: 'Her Fantasy',
        trackUrl: '/music/realms/202/her-fantasy.mp3',
        role: 'anchor',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'D#min',
        bpm: 144,
        energy: 'medium',
        isFeatured: true,
        isRealmAnchor: true,
        isPublicPick: true,
        sortOrder: 3,
        vibe: ['dreamy', 'romantic', 'numb', 'guitar-driven', 'emotional'],
        bestUse: ['Veil realm anchor', 'melodic trap playlist', 'social clip'],
        notes: 'Fantasy vs reality, numb love, emotional overload, and romantic projection.',
        releaseProjectId: 'sirens-in-neverland',
        releasePhase: 'ep-track',
        releasePriority: 5,
        isUpcomingRelease: true,
    }),

    createTrack({
        id: '202-voices',
        realmId: 202,
        trackTitle: 'voices',
        trackUrl: '/music/realms/202/voices.mp3',
        role: 'public',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'F#min',
        bpm: 94,
        energy: 'low',
        isPublicPick: true,
        sortOrder: 4,
        vibe: ['soft', 'melodic', 'futuristic', 'summery', 'romantic', 'mentally hazy'],
        bestUse: ['Veil playlist track', 'soft social clip', 'melodic mood-setter'],
        notes: 'A million voices hook over a smooth futuristic summer/love atmosphere.',
    }),

    createTrack({
        id: '202-personal',
        realmId: 202,
        trackTitle: 'Personal',
        trackUrl: '/music/realms/202/personal.mp3',
        role: 'public',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'D#min',
        bpm: 136,
        energy: 'medium',
        isPublicPick: true,
        sortOrder: 5,
        vibe: ['intimate', 'melodic', 'emotional', 'shadowy', 'reflective'],
        bestUse: ['Veil playlist track', 'emotional bridge', 'late-night listener entry'],
        notes: 'An intimate Veil record for emotional projection, desire, memory, and the line between fantasy and truth.',
    }),

    createTrack({
        id: '202-airplane-mode',
        realmId: 202,
        trackTitle: 'airplane mode',
        trackUrl: '/music/realms/202/airplane-mode.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'needs-writing',
        releaseBatch: 'april-may-2026',
        key: 'C#min',
        bpm: 120,
        energy: 'medium',
        sortOrder: 80,
        vibe: ['pluggnb', 'spacious', 'floating', 'reflective', 'disconnected'],
        bestUse: ['future hook polish', 'Veil demo', 'playlist candidate'],
        notes: 'Airplane mode as disconnect/reconnect metaphor. Needs lyric refinement.',
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
        role: 'vault',
        visibility: 'signup',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 40,
        vibe: ['reflection', 'night', 'mystery'],
        bestUse: ['original Nexus track', 'vault archive'],
    }),

    createTrack({
        id: 'realm-101-hopscotch',
        realmId: 101,
        trackTitle: 'Hopscotch',
        trackUrl: '/music/realms/101/hopscotch.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 50,
        vibe: ['movement', 'memory', 'playful'],
        bestUse: ['realm expansion', 'vault archive'],
    }),

    createTrack({
        id: 'realm-101-so-far-off',
        realmId: 101,
        trackTitle: 'So Far Off',
        trackUrl: '/music/realms/101/soFarOff.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'finished',
        releaseBatch: 'original-v1',
        sortOrder: 60,
        vibe: ['distance', 'emotion', 'reflection'],
        bestUse: ['realm expansion', 'vault archive'],
    }),

    createTrack({
        id: '101-hold-my-hand',
        realmId: 101,
        trackTitle: 'Hold My Hand',
        trackUrl: '/music/realms/101/holdMyHand.mp3',
        role: 'anchor',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Cmaj',
        bpm: 143,
        energy: 'medium',
        isFeatured: true,
        isRealmAnchor: true,
        isPublicPick: true,
        sortOrder: 1,
        vibe: ['tender', 'dreamy', 'smooth', 'healing', 'lush', 'grounding'],
        bestUse: ['Moonlit realm anchor', 'emotional entry point', 'fan-favorite candidate'],
        notes: 'Healing and dreamy connection. Feels more Moonlit if grounding is central.',
        releaseProjectId: 'sirens-in-neverland',
        releasePhase: 'ep-track',
        releasePriority: 3,
        isUpcomingRelease: true,
    }),

    createTrack({
        id: '101-little-further',
        realmId: 101,
        trackTitle: 'little further',
        trackUrl: '/music/realms/101/little-further.mp3',
        role: 'public',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'F#min',
        bpm: 96,
        energy: 'low',
        isFeatured: true,
        isPublicPick: true,
        sortOrder: 2,
        vibe: ['hopeful', 'emotional', 'soft', 'loving', 'guitar-driven', 'resilient'],
        bestUse: ['Moonlit featured track', 'reflective playlist anchor', 'motivational soft clip'],
        notes: 'Pushing oneself a little further, trusting oneself, and keeping going.',
    }),

    createTrack({
        id: '101-freefall',
        realmId: 101,
        trackTitle: 'freeFall',
        trackUrl: '/music/realms/101/freeFall.mp3',
        role: 'public',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Dmin',
        bpm: 144,
        energy: 'medium',
        isFeatured: true,
        isPublicPick: true,
        sortOrder: 3,
        vibe: ['atmospheric', 'spacious', 'reflective', 'surrendering', 'drifting'],
        bestUse: ['emotional entry point', 'late-night playlist', 'transition track'],
        notes: 'Surrendering into uncertainty and drifting with the current. Smooth transition from hardcoded.',
    }),

    createTrack({
        id: '101-through-da-forest',
        realmId: 101,
        trackTitle: 'through da forest',
        trackUrl: '/music/realms/101/through-da-forest.mp3',
        role: 'public',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'G#min',
        bpm: 81,
        energy: 'medium',
        isPublicPick: true,
        sortOrder: 4,
        vibe: ['playful', 'mystical', 'arcade', 'forested', 'smooth', 'reflective'],
        bestUse: ['worldbuilding track', 'game-inspired clip', 'Moonlit side-path track'],
        notes: 'Legend of Zelda / forest quest energy with sword-ogre imagery and reflective second verse.',
    }),

    createTrack({
        id: '101-paranoid',
        realmId: 101,
        trackTitle: 'paranoid',
        trackUrl: '/music/realms/101/paranoid.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'needs-writing',
        releaseBatch: 'april-may-2026',
        key: 'Cmaj',
        bpm: 137,
        energy: 'medium',
        sortOrder: 70,
        vibe: ['drifting', 'redemptive', 'summery', 'anxious', 'reflective'],
        bestUse: ['rewrite candidate', 'late-night playlist', 'private vault'],
        notes: 'Trying to get home and kicking out paranoia. Needs refinement.',
    }),

    createTrack({
        id: '101-wondering',
        realmId: 101,
        trackTitle: 'wondering',
        trackUrl: '/music/realms/101/wondering.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'rough-draft',
        releaseBatch: 'april-may-2026',
        key: 'Bmin',
        bpm: 150,
        energy: 'medium',
        sortOrder: 80,
        vibe: ['raw', 'reflective', 'nostalgic', 'upbeat', 'wandering'],
        bestUse: ['private vault', 'future rewrite candidate', 'late-night demo'],
        notes: 'Trauma awareness, outside wars, wandering, and SoundCloud-era energy. Needs work.',
    }),

    createTrack({
        id: '101-felt-it',
        realmId: 101,
        trackTitle: 'felt it',
        trackUrl: '/music/realms/101/feltIt.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'needs-writing',
        releaseBatch: 'april-may-2026',
        key: 'Dmaj',
        bpm: 81,
        energy: 'low',
        sortOrder: 90,
        vibe: ['nostalgic', 'soft', 'wavey', 'romantic', 'summery', 'imaginative'],
        bestUse: ['future emotional track', 'late-night playlist', 'private vault'],
        notes: 'Soft guitar, summer night imagination, love, and overcoming doubt. Needs topic focus.',
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
        role: 'public',
        visibility: 'public',
        status: 'finished',
        releaseBatch: 'original-v1',
        energy: 'high',
        sortOrder: 2,
        isPublicPick: true,
        vibe: ['money', 'motion', 'power'],
        bestUse: ['original Nexus track', 'Skybound public pick'],
    }),

    createTrack({
        id: 'realm-55-bank',
        realmId: 55,
        trackTitle: 'Bank',
        trackUrl: '/music/realms/55/bank.mp3',
        role: 'public',
        visibility: 'public',
        status: 'finished',
        releaseBatch: 'original-v1',
        energy: 'high',
        sortOrder: 3,
        isPublicPick: true,
        vibe: ['power', 'wealth', 'command'],
        bestUse: ['Skybound public pick', 'realm expansion'],
    }),

    createTrack({
        id: 'realm-55-stacked',
        realmId: 55,
        trackTitle: 'Stacked',
        trackUrl: '/music/realms/55/stacked.mp3',
        role: 'vault',
        visibility: 'signup',
        status: 'finished',
        releaseBatch: 'original-v1',
        energy: 'medium',
        sortOrder: 40,
        vibe: ['stacking', 'power', 'manifestation'],
        bestUse: ['realm expansion', 'vault archive'],
    }),

    createTrack({
        id: '55-glory-n-power',
        realmId: 55,
        trackTitle: 'Glory n Power',
        trackUrl: '/music/realms/55/Glory-n-Power.mp3',
        role: 'anchor',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'C#min',
        bpm: 152,
        energy: 'high',
        isFeatured: true,
        isRealmAnchor: true,
        isPublicPick: true,
        sortOrder: 1,
        vibe: ['anthemic', 'victorious', 'messy', 'human', 'celebratory', 'powerful'],
        bestUse: ['Skybound realm anchor', 'motivational clip', 'performance track'],
        notes: 'Glory and power vs money/powder. Enjoying the moment while recognizing the energy behind things.',
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
        role: 'vault',
        visibility: 'signup',
        status: 'finished',
        releaseBatch: 'original-v1',
        energy: 'medium',
        sortOrder: 40,
        vibe: ['market', 'watchful', 'value'],
        bestUse: ['original Nexus track', 'vault archive'],
    }),

    createTrack({
        id: 'realm-44-golden-tickets',
        realmId: 44,
        trackTitle: 'Golden Tickets',
        trackUrl: '/music/realms/44/goldenTickets.mp3',
        role: 'public',
        visibility: 'public',
        status: 'finished',
        releaseBatch: 'original-v1',
        energy: 'medium',
        sortOrder: 3,
        isPublicPick: true,
        vibe: ['access', 'tickets', 'rarity'],
        bestUse: ['Astral public pick', 'realm expansion'],
    }),

    createTrack({
        id: '44-13933',
        realmId: 44,
        trackTitle: '13933',
        trackUrl: '/music/realms/44/13933.mp3',
        role: 'anchor',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Dmin',
        bpm: 148,
        energy: 'medium',
        isFeatured: true,
        isRealmAnchor: true,
        isPublicPick: true,
        sortOrder: 1,
        vibe: ['smooth', 'mysterious', 'suave', 'ambitious', 'coded', 'elegant'],
        bestUse: ['Astral realm anchor', 'playlist anchor', 'social clip'],
        notes: 'Beautiful distraction / bot concept. Focus, rank, ambition, and temptation.',
    }),

    createTrack({
        id: '44-new-jazz',
        realmId: 44,
        trackTitle: 'new jazz',
        trackUrl: '/music/realms/44/new-jazz.mp3',
        role: 'public',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Dmin',
        bpm: 96,
        energy: 'medium',
        isFeatured: true,
        isPublicPick: true,
        sortOrder: 2,
        vibe: ['bouncy', 'exotic', 'stylish', 'youthful', 'playful', 'smooth'],
        bestUse: ['Astral playlist track', 'lifestyle clip', 'stylish interlude'],
        notes: 'Money, beautiful life, women, letting go of the past, and enjoying the moment.',
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
        role: 'public',
        visibility: 'public',
        status: 'finished',
        releaseBatch: 'original-v1',
        energy: 'low',
        sortOrder: 2,
        isPublicPick: true,
        vibe: ['forward', 'source', 'completion'],
        bestUse: ['InterSiddhi public pick', 'original Nexus track'],
    }),

    createTrack({
        id: 'realm-0-feel-blessed',
        realmId: 0,
        trackTitle: 'Feel Blessed',
        trackUrl: '/music/realms/0/feelBlessed.mp3',
        role: 'public',
        visibility: 'public',
        status: 'finished',
        releaseBatch: 'original-v1',
        energy: 'low',
        sortOrder: 3,
        isPublicPick: true,
        vibe: ['blessing', 'gratitude', 'alignment'],
        bestUse: ['InterSiddhi public pick', 'realm expansion'],
    }),

    createTrack({
        id: '0-same-person',
        realmId: 0,
        trackTitle: 'same person',
        trackUrl: '/music/realms/0/same-person.mp3',
        role: 'anchor',
        visibility: 'public',
        status: 'demo',
        releaseBatch: 'april-may-2026',
        key: 'Bmin',
        bpm: 122,
        energy: 'medium',
        isFeatured: true,
        isRealmAnchor: true,
        isPublicPick: true,
        sortOrder: 1,
        vibe: ['hypnotic', 'clean', 'nostalgic', 'self-aware', 'grounded', 'evolving'],
        bestUse: ['InterSiddhi realm anchor', 'introspective playlist', 'future polished fan favorite'],
        notes: 'Same core self while upgrading, solving self, receiving blessings, and becoming more integrated.',
    }),
];

export const MUSIC_COLLECTIONS: MusicCollection[] = [
    // =========================================================
    // CURRENT RELEASE PROJECT
    // =========================================================

    {
        id: 'sin-sirens-in-neverland',
        title: 'SIRENS in Neverland',
        type: 'release-project',
        releaseProjectId: 'sirens-in-neverland',
        description: 'A handmade oceanic scrapbook world of longing, repetition, fantasy, and fate.',
        story:
            'A six-song release arc where handwritten notes, paper fragments, and emotional memory slowly come to life — moving from repetition and intimacy into depth, fantasy, urgency, and siren-like pull.',
        trackIds: [
            'sin-do-over',
            '101-hold-my-hand',
            '303-in-the-deep',
            '202-her-fantasy',
            'sin-running-from-the-plug',
            '202-siren',
        ],
        artworkUrl: '/sirensInNeverland.jpg',
        youtubeEpisodeTitle: 'Building SIRENS in Neverland: the first COSMIC release world',
        isActive: true,
        sortOrder: 5,
    },

    // =========================================================
    // APP-WIDE FLAGSHIP
    // =========================================================

    {
        id: 'cosmic-featured-signal',
        title: 'Featured Signal',
        type: 'flagship',
        description: 'The clearest entry point into the Cosmic Multiverse.',
        story:
            'A single track chosen to introduce the sound, visual world, and emotional signal of the app.',
        trackIds: ['202-siren'],
        artworkUrl: '/images/music/collections/featured-signal.jpg',
        youtubeEpisodeTitle: 'Why siren became the first COSMIC flagship signal',
        isActive: true,
        sortOrder: 1,
    },

    // =========================================================
    // REALM ANCHOR SET
    // =========================================================

    {
        id: 'cosmic-realm-anchors',
        title: 'Realm Anchors',
        type: 'realm-anchor-set',
        description: 'Six tracks that define the emotional identity of each world.',
        story:
            'These are the current anchor songs for each realm. They can be swapped as the catalog grows, but each one explains the world it belongs to.',
        trackIds: [
            '303-hardcoded',
            '202-her-fantasy',
            '101-hold-my-hand',
            '55-glory-n-power',
            '44-13933',
            '0-same-person',
        ],
        artworkUrl: '/images/music/collections/realm-anchors.jpg',
        youtubeEpisodeTitle: 'Choosing the six realm anchor songs',
        isActive: true,
        sortOrder: 2,
    },

    // =========================================================
    // PUBLIC THREE-PIECE REALM COLLECTIONS
    // =========================================================

    {
        id: 'realm-303-break-the-code',
        title: 'Break the Code',
        type: 'public-three-piece',
        realmId: 303,
        description: 'Three tracks for pressure, fracture, and self-overcoming.',
        story:
            'A sequence about recognizing the code, surviving mental pressure, and turning pain into force.',
        trackIds: ['303-hardcoded', '303-losing-my-mind', '303-hardway'],
        artworkUrl: '/images/music/collections/303-break-the-code.jpg',
        youtubeEpisodeTitle: 'Fractured Frontier: songs for pressure and survival',
        isActive: true,
        sortOrder: 10,
    },

    {
        id: 'realm-202-dont-follow-the-siren',
        title: "Don’t Follow the Siren",
        type: 'public-three-piece',
        realmId: 202,
        description: 'Three tracks for mystery, fantasy, warning, and emotional fog.',
        story:
            'A sequence about hearing the warning, seeing the fantasy, and recognizing the voices inside the haze.',
        trackIds: ['202-siren', '202-her-fantasy', '202-voices'],
        artworkUrl: '/images/music/collections/202-dont-follow-the-siren.jpg',
        youtubeEpisodeTitle: 'The Veil: songs for fantasy, warning, and emotional fog',
        isActive: true,
        sortOrder: 20,
    },

    {
        id: 'realm-101-hold-on-while-you-drift',
        title: 'Hold On While You Drift',
        type: 'public-three-piece',
        realmId: 101,
        description: 'Three tracks for healing, surrender, and night-road reflection.',
        story:
            'A sequence about being held, pushing a little further, and surrendering into the unknown.',
        trackIds: ['101-hold-my-hand', '101-little-further', '101-freefall'],
        artworkUrl: '/images/music/collections/101-hold-on-while-you-drift.jpg',
        youtubeEpisodeTitle: 'Moonlit Roads: songs for healing, drift, and night drives',
        isActive: true,
        sortOrder: 30,
    },

    {
        id: 'realm-55-glory-and-command',
        title: 'Glory & Command',
        type: 'public-three-piece',
        realmId: 55,
        description: 'Three tracks for ambition, power, money motion, and command.',
        story:
            'A sequence about stepping into glory, moving resources, and claiming the city of self-command.',
        trackIds: ['55-glory-n-power', 'realm-55-bank', 'realm-55-mula'],
        artworkUrl: '/images/music/collections/55-glory-and-command.jpg',
        youtubeEpisodeTitle: 'Skybound City: songs for glory, power, and command',
        isActive: true,
        sortOrder: 40,
    },

    {
        id: 'realm-44-price-of-focus',
        title: 'The Price of Focus',
        type: 'public-three-piece',
        realmId: 44,
        description: 'Three tracks for value, temptation, taste, and discernment.',
        story:
            'A sequence about distraction, style, access, and deciding what is actually worth your energy.',
        trackIds: ['44-13933', '44-new-jazz', 'realm-44-golden-tickets'],
        artworkUrl: '/images/music/collections/44-price-of-focus.jpg',
        youtubeEpisodeTitle: 'Astral Bazaar: songs for value, temptation, and focus',
        isActive: true,
        sortOrder: 50,
    },

    {
        id: 'realm-0-same-self-higher-form',
        title: 'Same Self, Higher Form',
        type: 'public-three-piece',
        realmId: 0,
        description: 'Three tracks for source, self-recognition, blessing, and integration.',
        story:
            'A sequence about remaining the same core person while walking forward into blessing and integration.',
        trackIds: ['0-same-person', 'realm-0-walking-forward', 'realm-0-feel-blessed'],
        artworkUrl: '/images/music/collections/0-same-self-higher-form.jpg',
        youtubeEpisodeTitle: 'InterSiddhi: songs for source, self-recognition, and integration',
        isActive: true,
        sortOrder: 60,
    },

    // =========================================================
    // SIGNED-IN VAULT
    // =========================================================

    {
        id: 'april-may-vault',
        title: 'April–May Vault',
        type: 'vault',
        description: 'A deeper batch of demos, experiments, and private-candidate tracks.',
        story:
            'This vault captures the creative jump where the recordings became more intentional, layered, hypnotic, and cleaner in vocal direction.',
        trackIds: [
            '303-outcome',
            '303-in-the-deep',
            '202-airplane-mode',
            '101-through-da-forest',
            '101-paranoid',
            '101-wondering',
            '101-felt-it',
        ],
        artworkUrl: '/images/music/collections/april-may-vault.jpg',
        youtubeEpisodeTitle: 'Inside the April–May vault and the sound shift',
        isActive: true,
        sortOrder: 100,
    },
];

export const FEATURED_RELEASES: FeaturedReleaseConfig[] = [
    {
        id: 'sirens-in-neverland',
        title: 'SIRENS in Neverland',
        status: 'building',
        type: 'ep',
        description:
            'The current COSMIC release world — an oceanic scrapbook EP built from longing, repetition, fantasy, and fate.',
        story:
            'This is the active release campaign for the current season, beginning with Do Over and expanding into a six-song world.',
        coverArtUrl: '/sirensInNeverland.jpg',
        primaryTrackId: 'sin-do-over',
        collectionId: 'sin-sirens-in-neverland',
        releaseWindow: 'June–July 2026',
        ctaLabel: 'Enter SIN',
        ctaHref: '/releases/sirens-in-neverland',
        isCurrent: true,
        timeline: [
            {
                label: 'Era Reveal',
                dateLabel: 'Jun 14',
                status: 'now',
            },
            {
                label: 'Do Over',
                dateLabel: 'Jun 29',
                status: 'next',
            },
            {
                label: 'Running From The Plug',
                dateLabel: 'Jul 14',
                status: 'later',
            },
            {
                label: 'EP Drop',
                dateLabel: 'Jul 29',
                status: 'later',
            },
        ],
    },
];

export const CURRENT_FEATURED_RELEASE =
    FEATURED_RELEASES.find((release) => release.isCurrent) ?? null;

export const FEATURED_TRACKS = MUSIC_REGISTRY.filter((track) => track.isFeatured);

export const FLAGSHIP_TRACKS = MUSIC_REGISTRY.filter((track) => track.isFlagship);

export const REALM_ANCHOR_TRACKS = MUSIC_REGISTRY.filter((track) => track.isRealmAnchor).sort(
    (a, b) => REALM_ORDER.indexOf(a.realmId) - REALM_ORDER.indexOf(b.realmId)
);

export const PUBLIC_TRACKS = MUSIC_REGISTRY.filter((track) => track.visibility === 'public');

export const VAULT_TRACKS = MUSIC_REGISTRY.filter((track) => track.visibility === 'signup');

export const PREMIUM_TRACKS = MUSIC_REGISTRY.filter((track) => track.visibility === 'premium');

export const TOP_THREE_TRACKS = MUSIC_REGISTRY.filter((track) => track.isFeatured)
    .sort((a, b) => {
        const aRealmIndex = REALM_ORDER.indexOf(a.realmId);
        const bRealmIndex = REALM_ORDER.indexOf(b.realmId);

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

export const ACTIVE_MUSIC_COLLECTIONS = MUSIC_COLLECTIONS.filter((collection) => collection.isActive).sort(
    (a, b) => a.sortOrder - b.sortOrder
);

export const PUBLIC_THREE_PIECE_COLLECTIONS = ACTIVE_MUSIC_COLLECTIONS.filter(
    (collection) => collection.type === 'public-three-piece'
);

export const RELEASE_PROJECT_COLLECTIONS = ACTIVE_MUSIC_COLLECTIONS.filter(
    (collection) => collection.type === 'release-project'
);

export function getTrackById(trackId: string): MusicTrack | undefined {
    return MUSIC_REGISTRY.find((track) => track.id === trackId);
}

export function getTracksByIds(trackIds: string[]): MusicTrack[] {
    return trackIds
        .map((trackId) => getTrackById(trackId))
        .filter((track): track is MusicTrack => Boolean(track));
}

export function getCollectionById(collectionId: string): MusicCollection | undefined {
    return MUSIC_COLLECTIONS.find((collection) => collection.id === collectionId);
}

export function getTracksByCollection(collectionId: string): MusicTrack[] {
    const collection = getCollectionById(collectionId);

    if (!collection) return [];

    return getTracksByIds(collection.trackIds);
}

export function getCollectionsByRealm(realmId: RealmId): MusicCollection[] {
    return ACTIVE_MUSIC_COLLECTIONS.filter((collection) => collection.realmId === realmId);
}

export function getPublicTracksByRealm(realmId: RealmId): MusicTrack[] {
    return TRACKS_BY_REALM[realmId].filter((track) => track.visibility === 'public');
}

export function getVaultTracksByRealm(realmId: RealmId): MusicTrack[] {
    return TRACKS_BY_REALM[realmId].filter((track) => track.visibility === 'signup');
}

export function getTracksByReleaseProject(projectId: ReleaseProjectId): MusicTrack[] {
    return MUSIC_REGISTRY.filter((track) => track.releaseProjectId === projectId).sort(
        (a, b) => (a.releasePriority ?? 999) - (b.releasePriority ?? 999)
    );
}

export function getCurrentReleaseTracks(): MusicTrack[] {
    if (!CURRENT_FEATURED_RELEASE) return [];
    return getTracksByReleaseProject(CURRENT_FEATURED_RELEASE.id);
}

export function getFeaturedReleaseById(
    releaseId: ReleaseProjectId
): FeaturedReleaseConfig | undefined {
    return FEATURED_RELEASES.find((release) => release.id === releaseId);
}
