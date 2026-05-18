/**
 * COSMIC MULTIVERSE — MUSIC REGISTRY
 *
 * PURPOSE:
 * This file is the single source of truth for realm soundtrack metadata.
 *
 * It powers:
 * - the Nexus "Unlocked Soundtracks" section
 * - the global mini player
 * - future soundtrack shelves / playlists / hidden unlocks
 *
 * HOW TO USE:
 * 1. Put the mp3 file in the correct public folder:
 *    /public/music/realms/<realmId>/yourFileName.mp3
 *
 * 2. Add a new object to this array with:
 *    - a unique `id`
 *    - the correct `realmId`
 *    - the official `realmName`
 *    - the displayed `trackTitle`
 *    - the exact `trackUrl`
 *    - the `realmColor` for UI glow / player styling
 *
 * IMPORTANT:
 * - `realmId` must match the actual realm number used in the app
 * - `trackUrl` must match the real filename exactly
 * - `id` should stay unique across all tracks
 * - `realmColor` controls the track’s visual identity in the UI
 *
 * CURRENT MVP MODEL:
 * One main anchor track per realm.
 *
 * FUTURE EXPANSION:
 * Later we can add fields like:
 * - role: 'anchor' | 'expansion' | 'ritual' | 'hidden'
 * - mood
 * - bpm
 * - key
 * - productionEnhancement: 'none' | 'binaural' | 'isochronic' | 'both'
 */

export const MUSIC_REGISTRY = [
    /**
     * REALM 303 — FRACTURED FRONTIER
     * Journey Stage: fracture
     * Theme: conflict, fight, pressure, rupture, survival
     * Current anchor direction: War Ready
     * Current app track: Not Enough
     *
     * Notes:
     * - If you replace the anchor later, update:
     *   - id
     *   - trackTitle
     *   - trackUrl
     * - Keep realmId / realmName / color the same unless the realm identity changes.
     */
    {
        id: 'realm-303-not-enough',
        realmId: 303,
        realmName: 'Fractured Frontier',
        trackTitle: 'Not Enough',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/303/notEnough.mp3',
        realmColor: '#FF4D6D', // chaos crimson
    },
    {
        id: 'realm-303-war-ready',
        realmId: 303,
        realmName: 'Fractured Frontier',
        trackTitle: 'War Ready',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/303/warReady.mp3',
        realmColor: '#FF4D6D', // chaos crimson
    },
    {
        id: 'realm-303-space-king',
        realmId: 303,
        realmName: 'Fractured Frontier',
        trackTitle: 'Space King',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/303/spaceKing.mp3',
        realmColor: '#FF4D6D', // chaos crimson
    },

    /**
     * REALM 202 — THE VEIL
     * Journey Stage: veil
     * Theme: seduction, dream, confusion, hidden truth, feminine/mystical pull
     * Current anchor direction: Dont Run / What It Take / Night Light
     * Current app track: Night Light
     *
     * Notes:
     * - The Veil should feel darker, more mysterious, and more unstable than Moonlit Roads.
     * - Good home for dream-state, shadow-feminine, goddess, or “monsters in the night” tracks.
     */
    {
        id: 'realm-202-night-light',
        realmId: 202,
        realmName: 'The Veil',
        trackTitle: 'Night Light',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/202/nightLight.mp3',
        realmColor: '#8B5CF6', // veil violet
    },
    {
        id: 'realm-202-what-it-take',
        realmId: 202,
        realmName: 'The Veil',
        trackTitle: 'What it Take',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/202/whatItTake.mp3',
        realmColor: '#8B5CF6', // veil violet
    },
    {
        id: 'realm-202-jus-because',
        realmId: 202,
        realmName: 'The Veil',
        trackTitle: 'Jus Because',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/202/jusBecause.mp3',
        realmColor: '#8B5CF6', // veil violet
    },
    {
        id: 'realm-202-blame-on-me',
        realmId: 202,
        realmName: 'The Veil',
        trackTitle: 'Blame On Me',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/202/blameOnMe.mp3',
        realmColor: '#8B5CF6', // veil violet
    },

    /**
     * REALM 101 — MOONLIT ROADS
     * Journey Stage: reflection
     * Theme: road, distance, reflection, smoother emotional integration
     * Current anchor direction: So Far Off / Mysterious Way
     * Current app track: Mysterious Way
     *
     * Notes:
     * - Moonlit Roads should feel more laid back and curated than The Veil.
     * - Good home for reflective night-travel songs, smoother emotional motion, and cleaner melancholy.
     */
    {
        id: 'realm-101-mysterious-way',
        realmId: 101,
        realmName: 'Moonlit Roads',
        trackTitle: 'Mysterious Way',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/101/mysteriousWay.mp3',
        realmColor: '#38BDF8', // moonlit sky blue
    },
    {
        id: 'realm-101-hopscotch',
        realmId: 101,
        realmName: 'Moonlit Roads',
        trackTitle: 'Hopscotch',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/101/hopscotch.mp3',
        realmColor: '#38BDF8', // moonlit sky blue
    },
    {
        id: 'realm-101-so-far-off',
        realmId: 101,
        realmName: 'Moonlit Roads',
        trackTitle: 'So Far Off',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/101/soFarOff.mp3',
        realmColor: '#38BDF8', // moonlit sky blue
    },

    /**
     * REALM 55 — SKYBOUND CITY
     * Journey Stage: power
     * Theme: ambition, command, manifestation, ascent, sovereignty
     * Current anchor direction: Bank
     * Current app track: Mula
     *
     * Notes:
     * - Skybound should feel expensive, elevated, forceful, and gold-lit.
     * - Good home for power records, victory records, money motion, and command energy.
     */
    {
        id: 'realm-55-mula',
        realmId: 55,
        realmName: 'Skybound City',
        trackTitle: 'Mula',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/55/mula.mp3',
        realmColor: '#FACC15', // manifestation gold
    },
    {
        id: 'realm-55-bank',
        realmId: 55,
        realmName: 'Skybound City',
        trackTitle: 'Bank',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/55/bank.mp3',
        realmColor: '#FACC15', // manifestation gold
    },
    {
        id: 'realm-55-stacked',
        realmId: 55,
        realmName: 'Skybound City',
        trackTitle: 'Stacked',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/55/stacked.mp3',
        realmColor: '#FACC15', // manifestation gold
    },

    /**
     * REALM 44 — ASTRAL BAZAAR
     * Journey Stage: value
     * Theme: exchange, discernment, access, temptation, worth
     * Current anchor direction: Golden Tickets
     * Current app track: Dog Watch
     *
     * Notes:
     * - Bazaar should feel stylish, rare, selective, and cosmically valuable.
     * - Good home for luxury movement, exchange, tickets/access, market energy, and artifact vibes.
     */
    {
        id: 'realm-44-dog-watch',
        realmId: 44,
        realmName: 'Astral Bazaar',
        trackTitle: 'Dog Watch',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/44/dogWatch.mp3',
        realmColor: '#10B981', // emerald market glow
    },
    {
        id: 'realm-44-golden-tickets',
        realmId: 44,
        realmName: 'Astral Bazaar',
        trackTitle: 'Golden Tickets',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/44/goldenTickets.mp3',
        realmColor: '#10B981', // emerald market glow
    },

    /**
     * REALM 0 — INTERSIDDHI
     * Journey Stage: source
     * Theme: deserving, alignment, blessing, completion, integration
     * Current anchor direction: Feel Blessed
     * Current app track: Walking Forward
     *
     * Notes:
     * - InterSiddhi should feel like arrival, blessing, source light, and final integration.
     * - Good home for the most complete, aligned, luminous, or spiritually resolved material.
     */
    {
        id: 'realm-0-walking-forward',
        realmId: 0,
        realmName: 'InterSiddhi',
        trackTitle: 'Walking Forward',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/0/walkingForward.mp3',
        realmColor: '#F5F5F5', // source white
    },
    {
        id: 'realm-0-feel-blessed',
        realmId: 0,
        realmName: 'InterSiddhi',
        trackTitle: 'Feel Blessed',
        artist: 'Cosmic 888',
        trackUrl: '/music/realms/0/feelBlessed.mp3',
        realmColor: '#F5F5F5', // source white
    },
    // April–May Vault Expansion — 303 / Fractured Frontier
    {
        id: '303-hardcoded',
        realmId: 303,
        trackTitle: 'hardcoded',
        artist: 'COSMIC',
        realmName: 'Fractured Frontier',
        realmColor: '#FF4D6D',
        trackUrl: '/music/realms/303/hardcoded.mp3',
    },
    {
        id: '303-outcome',
        realmId: 303,
        trackTitle: 'outcome',
        artist: 'COSMIC',
        realmName: 'Fractured Frontier',
        realmColor: '#FF4D6D',
        trackUrl: '/music/realms/303/outcome.mp3',
    },
    {
        id: '303-in-the-deep',
        realmId: 303,
        trackTitle: 'in the deep',
        artist: 'COSMIC',
        realmName: 'Fractured Frontier',
        realmColor: '#FF4D6D',
        trackUrl: '/music/realms/303/in-the-deep.mp3',
    },
    {
        id: '303-losing-my-mind',
        realmId: 303,
        trackTitle: 'losing my mind',
        artist: 'COSMIC',
        realmName: 'Fractured Frontier',
        realmColor: '#FF4D6D',
        trackUrl: '/music/realms/303/losing-my-mind.mp3',
    },
    {
        id: '303-hardway',
        realmId: 303,
        trackTitle: 'HardWay',
        artist: 'COSMIC',
        realmName: 'Fractured Frontier',
        realmColor: '#FF4D6D',
        trackUrl: '/music/realms/303/hardway.mp3',
    },

    // April–May Vault Expansion — 202 / The Veil
    {
        id: '202-her-fantasy',
        realmId: 202,
        trackTitle: 'her fantasy',
        artist: 'COSMIC',
        realmName: 'The Veil',
        realmColor: '#8B5CF6',
        trackUrl: '/music/realms/202/her-fantasy.mp3',
    },
    {
        id: '202-siren',
        realmId: 202,
        trackTitle: 'siren',
        artist: 'COSMIC',
        realmName: 'The Veil',
        realmColor: '#8B5CF6',
        trackUrl: '/music/realms/202/siren.mp3',
    },
    {
        id: '202-voices',
        realmId: 202,
        trackTitle: 'voices',
        artist: 'COSMIC',
        realmName: 'The Veil',
        realmColor: '#8B5CF6',
        trackUrl: '/music/realms/202/voices.mp3',
    },
    {
        id: '202-airplane-mode',
        realmId: 202,
        trackTitle: 'airplane mode',
        artist: 'COSMIC',
        realmName: 'The Veil',
        realmColor: '#8B5CF6',
        trackUrl: '/music/realms/202/airplane-mode.mp3',
    },

    // April–May Vault Expansion — 101 / Moonlit Roads
    {
        id: '101-freefall',
        realmId: 101,
        trackTitle: 'freeFall',
        artist: 'COSMIC',
        realmName: 'Moonlit Roads',
        realmColor: '#38BDF8',
        trackUrl: '/music/realms/101/freefall.mp3',
    },
    {
        id: '101-hold-my-hand',
        realmId: 101,
        trackTitle: 'holdMyHand',
        artist: 'COSMIC',
        realmName: 'Moonlit Roads',
        realmColor: '#38BDF8',
        trackUrl: '/music/realms/101/holdMyHand.mp3',
    },
    {
        id: '101-wondering',
        realmId: 101,
        trackTitle: 'wondering',
        artist: 'COSMIC',
        realmName: 'Moonlit Roads',
        realmColor: '#38BDF8',
        trackUrl: '/music/realms/101/wondering.mp3',
    },
    {
        id: '101-felt-it',
        realmId: 101,
        trackTitle: 'felt it',
        artist: 'COSMIC',
        realmName: 'Moonlit Roads',
        realmColor: '#38BDF8',
        trackUrl: '/music/realms/101/feltIt.mp3',
    },
    {
        id: '101-paranoid',
        realmId: 101,
        trackTitle: 'paranoid',
        artist: 'COSMIC',
        realmName: 'Moonlit Roads',
        realmColor: '#38BDF8',
        trackUrl: '/music/realms/101/paranoid.mp3',
    },
    {
        id: '101-little-further',
        realmId: 101,
        trackTitle: 'little further',
        artist: 'COSMIC',
        realmName: 'Moonlit Roads',
        realmColor: '#38BDF8',
        trackUrl: '/music/realms/101/little-further.mp3',
    },
    {
        id: '101-through-da-forest',
        realmId: 101,
        trackTitle: 'through da forest',
        artist: 'COSMIC',
        realmName: 'Moonlit Roads',
        realmColor: '#38BDF8',
        trackUrl: '/music/realms/101/through-da-forest.mp3',
    },

    // April–May Vault Expansion — 55 / Skybound City
    {
        id: '55-glory-n-power',
        realmId: 55,
        trackTitle: 'Glory n Power',
        artist: 'COSMIC',
        realmName: 'Skybound City',
        realmColor: '#FACC15',
        trackUrl: '/music/realms/55/glory-n-power.mp3',
    },

    // April–May Vault Expansion — 44 / Astral Bazaar
    {
        id: '44-13933',
        realmId: 44,
        trackTitle: '13933',
        artist: 'COSMIC',
        realmName: 'Astral Bazaar',
        realmColor: '#10B981', // emerald market glow
        trackUrl: '/music/realms/44/13933.mp3',
    },
    {
        id: '44-new-jazz',
        realmId: 44,
        trackTitle: 'new jazz',
        artist: 'COSMIC',
        realmName: 'Astral Bazaar',
        realmColor: '#10B981', // emerald market glow
        trackUrl: '/music/realms/44/new-jazz.mp3',
    },

    // April–May Vault Expansion — 0 / InterSiddhi
    {
        id: '0-same-person',
        realmId: 0,
        trackTitle: 'same person',
        artist: 'COSMIC',
        realmName: 'InterSiddhi',
        realmColor: '#E5E7EB',
        trackUrl: '/music/realms/0/same-person.mp3',
    },
];
