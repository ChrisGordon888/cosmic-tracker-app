export type RealmPlaylistLink = {
  label: string;
  url: string;
};

export type RealmPlaylistCard = {
  realmId: number;
  mark: string;
  name: string;
  tagline: string;
  listenerCue: string;
  color: string;
  links: RealmPlaylistLink[];
};

export const REALM_PLAYLIST_LINKS: RealmPlaylistCard[] = [
  {
    realmId: 303,
    mark: '∴',
    name: 'Fractured Frontier',
    tagline: 'Pressure, chaos, creation, comeback energy.',
    listenerCue:
      'Start here when life feels fractured and you need to turn pressure into form.',
    color: '#FF4D6D',
    links: [
      { label: 'YouTube', url: '' },
      { label: 'SoundCloud', url: '' },
      { label: 'Deezer', url: '' },
    ],
  },
  {
    realmId: 202,
    mark: '◐',
    name: 'The Veil',
    tagline: 'Mystery, longing, dreams, hidden truth.',
    listenerCue:
      'Enter here for desire, projection, atmosphere, and emotional mystery.',
    color: '#8B5CF6',
    links: [
      { label: 'YouTube', url: '' },
      { label: 'SoundCloud', url: '' },
      { label: 'Deezer', url: '' },
    ],
  },
  {
    realmId: 101,
    mark: '☾',
    name: 'Moonlit Roads',
    tagline: 'Reflection, memory, night drives, integration.',
    listenerCue:
      'Enter here for heartbreak, distance, shadow work, and late-night clarity.',
    color: '#38BDF8',
    links: [
      { label: 'YouTube', url: '' },
      { label: 'SoundCloud', url: '' },
      { label: 'Deezer', url: '' },
    ],
  },
  {
    realmId: 55,
    mark: '△',
    name: 'Skybound City',
    tagline: 'Ambition, command, power, elevation.',
    listenerCue:
      'Enter here for confidence, momentum, focus, and upward movement.',
    color: '#FACC15',
    links: [
      { label: 'YouTube', url: '' },
      { label: 'SoundCloud', url: '' },
      { label: 'Deezer', url: '' },
    ],
  },
  {
    realmId: 44,
    mark: '◇',
    name: 'Astral Bazaar',
    tagline: 'Value, exchange, temptation, discernment.',
    listenerCue:
      'Enter here for money energy, choices, temptation, and knowing what is worth your time.',
    color: '#F59E0B',
    links: [
      { label: 'YouTube', url: '' },
      { label: 'SoundCloud', url: '' },
      { label: 'Deezer', url: '' },
    ],
  },
  {
    realmId: 0,
    mark: '∞',
    name: 'InterSiddhi',
    tagline: 'Source, stillness, unity, return.',
    listenerCue:
      'Enter here for peace, integration, spiritual reset, and completion.',
    color: '#E5E7EB',
    links: [
      { label: 'YouTube', url: '' },
      { label: 'SoundCloud', url: '' },
      { label: 'Deezer', url: '' },
    ],
  },
];