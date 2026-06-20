import {
  createReleaseWorldPacket,
  type ReleaseWorldPacket,
} from './releaseWorld.types';

export const exampleCreativeReleasePacket: ReleaseWorldPacket = createReleaseWorldPacket({
  world: {
    id: 'artist-release-id',
    slug: 'artist-release-slug',
    title: 'Release Title',
    subtitle: 'A short public-facing subtitle.',
    artist: {
      artistId: 'artist-id',
      artistSlug: 'artist-slug',
      artistName: 'Artist Name',
      displayName: 'ARTIST',
      tagline: 'Short artist tagline.',
    },
    releaseType: 'EP',
    status: 'Draft',
    trackCount: 0,
    currentFocus: 'Focus Track',
    secondFocus: 'Second Focus Track',
    fullDrop: 'Date TBD',
    themeId: 'artist-release-theme',
    coverAssetId: 'release-cover',
    boardHeroAssetId: 'signal-board-texture',
    focusSingleCoverAssetId: 'focus-single-cover',
    secondSingleCoverAssetId: 'second-single-cover',
    oneLineSummary:
      'One sentence explaining the release rollout and emotional promise.',
    story:
      'A short paragraph describing the world, feeling, and why this release matters.',
    emotionalTone: ['intimate', 'mysterious', 'cinematic'],
    visualLanguage: ['texture', 'symbol', 'color', 'movement'],
    mainHookLines: ['Main memorable lyric or phrase.'],
  },

  theme: {
    id: 'artist-release-theme',
    name: 'Release Theme Name',
    description: 'Short description of the visual system.',
    palette: {
      background: '#05070D',
      surface: '#11161F',
      primary: '#7ED3FF',
      secondary: '#A884FF',
      accent: '#DCBA5C',
      text: '#EEF3FA',
      muted: '#9CA8B8',
    },
    visualKeywords: ['cosmic', 'sleek', 'tactile'],
  },

  tracks: [],

  rolloutDates: [],

  primaryClips: [],

  secondaryClips: [],

  assets: [],

  links: [],

  boardPins: [],

  minimumViableRollout: [
    'Final audio',
    'Final cover',
    'Three strong clips',
    'Release caption',
    'Streaming link',
  ],
});
