export type ReleasePhase = 'era-reveal' | 'lead-single' | 'second-single' | 'ep-drop';

export interface SirensTrack {
  number: string;
  slug: string;
  title: string;
  displayTitle: string;
  role: string;
  realmId: 303 | 202 | 101 | 55 | 44 | 0;
  realmName: string;
  status: 'focus-single' | 'second-single' | 'ep-track' | 'post-drop-focus';
  note: string;
  contentAngle: string;
}

export interface SirensRolloutDate {
  date: string;
  label: string;
  phase: ReleasePhase;
  title: string;
  goal: string;
  publicAction: string;
  creatorAction: string;
}

export interface SirensClipPlan {
  id: string;
  title: string;
  purpose: string;
  visualDirection: string;
  timing: string;
}

export interface SirensBoardPin {
  id: string;
  kind: 'center' | 'realm' | 'track' | 'moon' | 'visual' | 'hook' | 'action' | 'portal';
  eyebrow: string;
  title: string;
  body: string;
  meta?: string;
  href?: string;
  x: number;
  y: number;
  rotate?: number;
}

export const sirensRelease = {
  title: 'SIRENS in Neverland',
  artist: 'COSMIC',
  subtitle: 'The first EP world in the Cosmic Nexus.',
  status: 'Rollout in progress',
  releaseType: 'EP1',
  trackCount: 6,
  currentFocus: 'DoOver',
  secondSingle: 'running from the plug',
  fullDrop: 'July 29',
  moonPhaseSource: 'https://www.timeanddate.com/moon/phases/',
  oneLineSummary:
    'Reveal the world on June 14, make DoOver the emotional front door on June 29, use running from the plug on July 14 to expand the energy and tension, then drop SIRENS in Neverland on July 29 as the full emotional universe.',
  story:
    'SIRENS in Neverland is a six-track oceanic scrapbook world about longing, do-overs, fantasy, motion, temptation, warning signs, and the strange pull of wanting another chance. It opens soft and hypnotic, then expands into urgency, edge, and myth.',
  emotionalTone: [
    'intimate',
    'mysterious',
    'hypnotic',
    'self-made',
    'oceanic',
    'reflective',
  ],
  visualLanguage: [
    'waves',
    'scrapbook notes',
    'reflective shimmer',
    'turned-away silhouette',
    'title fragments',
    'handwritten lyrics',
    'deep blue water',
    'cream paper',
    'warning rose',
  ],
  mainHookLines: [
    'I was tryna do this over, she told me do it over',
    'Like could you do this over, baby come get over this',
  ],
} as const;

export const sirensTracks: SirensTrack[] = [
  {
    number: '01',
    slug: 'doover',
    title: 'DoOver',
    displayTitle: 'DoOver',
    role: 'Lead single / emotional front door',
    realmId: 202,
    realmName: 'The Veil',
    status: 'focus-single',
    note: 'The clearest entry point into EP1: immediate, replayable, hypnotic, and emotionally direct.',
    contentAngle: 'Hero hook, do-over loop, opening door to the world.',
  },
  {
    number: '02',
    slug: 'holdmyhand',
    title: 'holdMyHand',
    displayTitle: 'holdMyHand',
    role: 'Post-drop intimacy lane',
    realmId: 101,
    realmName: 'Moonlit Roads',
    status: 'post-drop-focus',
    note: 'The soft emotional anchor for closeness, tenderness, trust, and memory.',
    contentAngle: 'Intimate performance, healing line, human presence.',
  },
  {
    number: '03',
    slug: 'in-the-deep',
    title: 'in the deep',
    displayTitle: 'in the deep',
    role: 'Oceanic immersion',
    realmId: 101,
    realmName: 'Moonlit Roads',
    status: 'ep-track',
    note: 'The listener sinks deeper into the emotional water of the EP world.',
    contentAngle: 'Water visuals, submerged feeling, late-night reflection.',
  },
  {
    number: '04',
    slug: 'her-fantasy',
    title: 'her fantasy',
    displayTitle: 'her fantasy',
    role: 'Dream fracture',
    realmId: 202,
    realmName: 'The Veil',
    status: 'ep-track',
    note: 'Fantasy, projection, desire, and the moment the mirror starts talking back.',
    contentAngle: 'Dream collage, torn notes, beauty with danger underneath.',
  },
  {
    number: '05',
    slug: 'running-from-the-plug',
    title: 'running from the plug',
    displayTitle: 'running from the plug',
    role: 'Second single / energy expansion',
    realmId: 303,
    realmName: 'Fractured Frontier',
    status: 'second-single',
    note: 'The second single widens the world with motion, urgency, contrast, and edge.',
    contentAngle: 'Movement, escape, nighttime tension, high-energy hook.',
  },
  {
    number: '06',
    slug: 'siren',
    title: 'siren',
    displayTitle: 'siren',
    role: 'Myth / title energy',
    realmId: 202,
    realmName: 'The Veil',
    status: 'post-drop-focus',
    note: 'The haunting signature identity of the EP — beautiful, dangerous, impossible to ignore.',
    contentAngle: 'Mythic warning, title symbolism, haunting post-drop lane.',
  },
];

export const sirensRolloutDates: SirensRolloutDate[] = [
  {
    date: 'June 14',
    label: 'Era reveal',
    phase: 'era-reveal',
    title: 'Open the world',
    goal: 'Make people feel the world before the single lands.',
    publicAction: 'Title fragments, cover crops, lyric scraps, oceanic textures, and subtle teaser posts.',
    creatorAction: 'Lock visual language, organize assets, define the 3 strongest DoOver clip concepts.',
  },
  {
    date: 'June 29',
    label: 'Lead single',
    phase: 'lead-single',
    title: 'DoOver drops',
    goal: 'Make DoOver feel like the song that defines EP1.',
    publicAction: 'Main cover post, streaming link, hero hook clip, and the strongest repeatable lyric section.',
    creatorAction: 'DoOver master, single cover, final clip selects, captions, and link assets locked.',
  },
  {
    date: 'July 14',
    label: 'Second single',
    phase: 'second-single',
    title: 'running from the plug drops',
    goal: 'Show EP1 has edge, motion, and tension, not just softness.',
    publicAction: 'High-energy hook clip, motion/escape visual, performance clip, and EP bridge teaser.',
    creatorAction: 'Lock second single master, visual contrast, and EP teaser assets.',
  },
  {
    date: 'July 29',
    label: 'EP drop',
    phase: 'ep-drop',
    title: 'Full EP opens',
    goal: 'Turn the two singles into a complete emotional universe.',
    publicAction: 'EP cover, tracklist, streaming link, trailer/visualizer, and one focus-track content piece.',
    creatorAction: 'Full EP sequence, post-drop plan, trailer, visualizer, and tracklist graphic locked.',
  },
];

export const sirensDoOverClips: SirensClipPlan[] = [
  {
    id: 'doover-hero-hook',
    title: 'Hero hook visual',
    purpose: 'Release-day lead visual and main trailer moment.',
    visualDirection: 'Strongest hook section, ocean shimmer, scrapbook title fragments, cleanest visual identity.',
    timing: 'Release day and pinned repost.',
  },
  {
    id: 'doover-performance',
    title: 'Performance / silhouette',
    purpose: 'Artist presence and emotional delivery.',
    visualDirection: 'Close-up or turned-away silhouette, intimate framing, less promo and more feeling.',
    timing: '2–4 days after release.',
  },
  {
    id: 'doover-lyric-scrapbook',
    title: 'Lyric scrapbook reel',
    purpose: 'Push the SIN world visually.',
    visualDirection: 'Handwritten words, torn notes, repeated phrases, crossed-out lines, wave textures.',
    timing: '5–7 days after release.',
  },
  {
    id: 'doover-alt-emotional',
    title: 'Alt emotional scene',
    purpose: 'Softer cinematic connection.',
    visualDirection: 'A quieter visual, less clutter, more reflective and human.',
    timing: 'Week two support.',
  },
  {
    id: 'doover-replay',
    title: 'Post-drop replay clip',
    purpose: 'Short, punchy repost asset.',
    visualDirection: 'The most repeatable section in a tighter edit.',
    timing: 'After the song has a few days to breathe.',
  },
];

export const sirensSecondSingleClips: SirensClipPlan[] = [
  {
    id: 'plug-high-energy',
    title: 'High-energy hook clip',
    purpose: 'Fastest, strongest entry point for the second single.',
    visualDirection: 'Movement-driven, urgent, nighttime, more edge than DoOver.',
    timing: 'Release day.',
  },
  {
    id: 'plug-motion-escape',
    title: 'Motion / escape visual',
    purpose: 'Translate the running energy into the visual world.',
    visualDirection: 'Drift, escape, streetlight, current, wire, and movement symbolism.',
    timing: '2–3 days after release.',
  },
  {
    id: 'plug-performance',
    title: 'Stylized performance clip',
    purpose: 'Bring more attitude and rhythm emphasis.',
    visualDirection: 'More direct performance, sharper edits, stronger contrast.',
    timing: 'First week after release.',
  },
  {
    id: 'plug-world-collage',
    title: 'World-expansion collage',
    purpose: 'Show the EP is bigger than two singles.',
    visualDirection: 'Scrapbook fragments from all of EP1, symbols from multiple tracks, broader mythology.',
    timing: 'Bridge into EP week.',
  },
  {
    id: 'plug-ep-trailer',
    title: 'EP trailer bridge',
    purpose: 'Transition from second single into the full EP identity.',
    visualDirection: 'Hint at unreleased songs and the completed emotional universe.',
    timing: 'Final week before EP.',
  },
];

export const sirensBoardPins: SirensBoardPin[] = [
  {
    id: 'sin-core',
    kind: 'center',
    eyebrow: 'EP1 Release World',
    title: 'SIRENS in Neverland',
    body: 'A six-track oceanic scrapbook world: longing, fantasy, motion, temptation, warning signs, and one more chance.',
    meta: 'July 29',
    href: '/releases/sirens-in-neverland',
    x: 50,
    y: 46,
    rotate: -1,
  },
  {
    id: 'doover',
    kind: 'track',
    eyebrow: 'Lead Single',
    title: 'DoOver',
    body: 'The emotional front door: “I was tryna do this over, she told me do it over.”',
    meta: 'June 29',
    x: 28,
    y: 48,
    rotate: 2,
  },
  {
    id: 'running-from-the-plug',
    kind: 'track',
    eyebrow: 'Second Single',
    title: 'running from the plug',
    body: 'The world gains urgency, edge, motion, and danger — contrast after the softness.',
    meta: 'July 14',
    x: 73,
    y: 48,
    rotate: -3,
  },
  {
    id: 'veil',
    kind: 'realm',
    eyebrow: 'Realm Link',
    title: 'The Veil',
    body: 'Fantasy, desire, hidden truth, and the warning beneath the siren signal.',
    meta: '202',
    href: '/realms/202',
    x: 20,
    y: 24,
    rotate: -4,
  },
  {
    id: 'moonlit',
    kind: 'realm',
    eyebrow: 'Realm Link',
    title: 'Moonlit Roads',
    body: 'Memory, healing, tenderness, and the path back to yourself.',
    meta: '101',
    href: '/realms/101',
    x: 80,
    y: 24,
    rotate: 3,
  },
  {
    id: 'frontier',
    kind: 'realm',
    eyebrow: 'Realm Link',
    title: 'Fractured Frontier',
    body: 'The rupture, the raw edge, and the moment the dream breaks open.',
    meta: '303',
    href: '/realms/303',
    x: 50,
    y: 13,
    rotate: 1,
  },
  {
    id: 'moon-rhythm',
    kind: 'moon',
    eyebrow: 'Moon Cycle Cadence',
    title: 'June 14 → July 29',
    body: 'Reveal the world, release DoOver, expand with running from the plug, then open the full EP.',
    meta: 'Natural rhythm',
    x: 50,
    y: 77,
    rotate: 1,
  },
  {
    id: 'visual-language',
    kind: 'visual',
    eyebrow: 'Visual Language',
    title: 'Ocean / Scrapbook / Shimmer',
    body: 'Waves, handwritten notes, title fragments, reflective shimmer, silhouettes, cream paper, warning rose.',
    meta: 'SIN palette',
    x: 18,
    y: 77,
    rotate: 4,
  },
  {
    id: 'content-hooks',
    kind: 'hook',
    eyebrow: 'Repeated Hook',
    title: 'Do it over',
    body: '“Like could you do this over, baby come get over this.” Keep this as the repeatable anchor.',
    meta: 'Clip anchor',
    x: 82,
    y: 77,
    rotate: -2,
  },
];

export const sirensMinimumViableRollout = [
  'Final DoOver version',
  'Final DoOver cover',
  'Three strong clips',
  'June 24 teaser',
  'June 26 hook preview',
  'June 29 release post',
] as const;

export function getSirensTrackBySlug(slug: string) {
  return sirensTracks.find((track) => track.slug === slug) ?? null;
}

export function getSirensTracksByRealm(realmId: SirensTrack['realmId']) {
  return sirensTracks.filter((track) => track.realmId === realmId);
}
