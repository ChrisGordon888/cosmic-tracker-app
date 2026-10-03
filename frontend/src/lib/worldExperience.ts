/** Presentation inputs only. Availability stays with the existing release/player authority. */
export type WorldTrack = {
  id: string;
  slug: string;
  title: string;
  artworkUrl?: string | null;
  hook?: string | null;
  mood?: string | null;
  playable: boolean;
  actionLabel: string;
};

export type WorldFragmentData = {
  id: string;
  title: string;
  body?: string | null;
  eyebrow?: string | null;
  href?: string | null;
  connectedTrackSlug?: string | null;
  isPublic: boolean;
};

export function focusedWorldTrack(tracks: WorldTrack[], selectedId: string | null) {
  return tracks.find((track) => track.id === selectedId) ?? tracks[0] ?? null;
}

export function fragmentsForTrack(fragments: WorldFragmentData[], slug?: string) {
  return fragments.filter((fragment) => fragment.isPublic &&
    (!fragment.connectedTrackSlug || fragment.connectedTrackSlug === slug));
}

export function safeWorldLink(href?: string | null) {
  if (!href) return undefined;
  const value = href.trim();
  if (/^\/(?![/\\])/.test(value) && !value.includes('\\')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return undefined;
}
