export type ReleasePhase = 'era-reveal' | 'lead-single' | 'second-single' | 'ep-drop';

export type ReleaseAssetKind =
  | 'cover'
  | 'single-cover'
  | 'board-texture'
  | 'lyric-note'
  | 'clip-thumbnail'
  | 'photo'
  | 'trailer'
  | 'visualizer'
  | 'audio-preview'
  | 'logo'
  | 'background';

export type ReleaseAssetStatus = 'needed' | 'draft' | 'selected' | 'locked';

export type ReleaseLinkStatus = 'pending' | 'live';
export type ReleaseLinkUsage = 'streaming' | 'pre-save' | 'social' | 'internal' | 'external';

export type ReleaseSurface =
  | 'release-page'
  | 'signal-board'
  | 'creator-dashboard'
  | 'social-content'
  | 'nexus'
  | 'artist-profile';

export interface CreativeIdentity {
  artistId: string;
  artistSlug: string;
  artistName: string;
  displayName: string;
  tagline?: string;
  location?: string;
  avatarAssetId?: string;
  logoAssetId?: string;
}

export interface ReleaseTheme {
  id: string;
  name: string;
  description: string;
  palette: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    muted: string;
  };
  visualKeywords: string[];
}

export interface ReleaseWorld {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  artist: CreativeIdentity;
  releaseType: string;
  status: string;
  trackCount: number;
  currentFocus: string;
  secondFocus?: string;
  fullDrop?: string;
  oneLineSummary: string;
  story: string;
  themeId: string;
  coverAssetId?: string;
  boardHeroAssetId?: string;
  focusSingleCoverAssetId?: string;
  secondSingleCoverAssetId?: string;
  emotionalTone: string[];
  visualLanguage: string[];
  mainHookLines: string[];
}

export interface ReleaseTrack {
  number: string;
  slug: string;
  title: string;
  displayTitle: string;
  role: string;
  realmId?: number;
  realmName?: string;
  status: 'focus-single' | 'second-single' | 'ep-track' | 'post-drop-focus' | 'bonus' | 'draft';
  note: string;
  contentAngle: string;
  coverAssetId?: string;
  audioPreviewAssetId?: string;
  primaryClipAssetId?: string;
}

export interface ReleaseRolloutDate {
  date: string;
  label: string;
  phase: ReleasePhase;
  title: string;
  goal: string;
  publicAction: string;
  creatorAction: string;
}

export interface ReleaseClipPlan {
  id: string;
  title: string;
  purpose: string;
  visualDirection: string;
  timing: string;
  connectedTrackSlug?: string;
  assetId?: string;
  status?: ReleaseAssetStatus;
}

export interface ReleaseAsset {
  id: string;
  kind: ReleaseAssetKind;
  title: string;
  description: string;
  src?: string;
  alt: string;
  status: ReleaseAssetStatus;
  connectedTrackSlug?: string;
  usage: ReleaseSurface[];
}

export interface ReleaseLink {
  id: string;
  label: string;
  href: string;
  status: ReleaseLinkStatus;
  usage: ReleaseLinkUsage;
}

export interface ReleaseBoardPin {
  id: string;
  kind:
    | 'center'
    | 'realm'
    | 'track'
    | 'moon'
    | 'visual'
    | 'hook'
    | 'action'
    | 'portal'
    | 'image'
    | 'lyric'
    | 'audio'
    | 'note';
  eyebrow: string;
  title: string;
  body: string;
  meta?: string;
  href?: string;
  assetId?: string;
  connectedTrackSlug?: string;
  x: number;
  y: number;
  rotate?: number;
}

export interface ReleaseWorldPacket {
  world: ReleaseWorld;
  theme: ReleaseTheme;
  tracks: ReleaseTrack[];
  rolloutDates: ReleaseRolloutDate[];
  primaryClips: ReleaseClipPlan[];
  secondaryClips?: ReleaseClipPlan[];
  assets: ReleaseAsset[];
  links: ReleaseLink[];
  boardPins: ReleaseBoardPin[];
  minimumViableRollout: readonly string[];
}

export function createReleaseWorldPacket(packet: ReleaseWorldPacket) {
  return packet;
}

export function getReleaseTrackBySlug(packet: ReleaseWorldPacket, slug: string) {
  return packet.tracks.find((track) => track.slug === slug) ?? null;
}

export function getReleaseTracksByRealm(packet: ReleaseWorldPacket, realmId: number) {
  return packet.tracks.filter((track) => track.realmId === realmId);
}

export function getReleaseAssetById(packet: ReleaseWorldPacket, id?: string) {
  if (!id) return null;
  return packet.assets.find((asset) => asset.id === id) ?? null;
}

export function getReleaseAssetsByUsage(packet: ReleaseWorldPacket, usage: ReleaseSurface) {
  return packet.assets.filter((asset) => asset.usage.includes(usage));
}

export function getReleaseAssetsByTrack(packet: ReleaseWorldPacket, slug: string) {
  return packet.assets.filter((asset) => asset.connectedTrackSlug === slug);
}

export function getReleaseLinkById(packet: ReleaseWorldPacket, id: string) {
  return packet.links.find((link) => link.id === id) ?? null;
}

export function getLiveReleaseLinks(packet: ReleaseWorldPacket) {
  return packet.links.filter((link) => link.status === 'live' && link.href.length > 0);
}
