export const workingCoverStyles = ['minimal', 'atmospheric', 'signal', 'artifact', 'none'] as const;
export type WorkingCoverStyle = typeof workingCoverStyles[number];
export const realmIds = [303, 202, 101, 55, 44, 0];
export type CleanupTrack = { id: string; title: string; slug: string; releaseWorldId?: string | null; realmId?: number | null; bpm?: number | null; keySignature?: string | null; status: string; visibility: string; workingCoverStyle?: WorkingCoverStyle | null; artworkUrl?: string | null; releaseCoverArtUrl?: string | null; nexusReviewStatus?: string | null };
export function isOrganized(t: Pick<CleanupTrack, 'title' | 'realmId'>) {
  return Boolean(t.title.trim() && !/^untitled(?: track)?$/i.test(t.title.trim()) && t.realmId != null && realmIds.includes(t.realmId));
}
export function matchesCleanup(t: CleanupTrack, queue: string) {
  if (queue === 'cleanup') return !isOrganized(t);
  if (queue === 'realm') return t.realmId == null || !realmIds.includes(t.realmId);
  if (queue === 'standalone') return !t.releaseWorldId && isOrganized(t);
  if (queue === 'release') return Boolean(t.releaseWorldId);
  if (queue === 'ideas') return ['idea','demo'].includes(t.status);
  return true;
}
export function parseFilename(value: string) {
  const stem = value.replace(/\.(mp3|wav|flac|m4a|aac|mp4)$/i, '');
  const match = stem.match(/^(.+?)\s*\(([A-Ga-g])([#b]?)(min|maj)\s+(\d{2,3})\)$/);
  if (!match) return null;
  const bpm = Number(match[5]);
  if (bpm < 20 || bpm > 300) return null;
  return { title: match[1].trim(), bpm, keySignature: `${match[2].toUpperCase()}${match[3]} ${match[4] === 'min' ? 'minor' : 'major'}` };
}
export function cleanupChanges(original: CleanupTrack, draft: CleanupTrack) {
  const changes: Record<string, string | number | null> = {};
  for (const key of ['title','bpm','keySignature','realmId','status','visibility','workingCoverStyle'] as const) {
    const before = key === 'workingCoverStyle' ? original[key] ?? 'minimal' : original[key] ?? null;
    const after = key === 'workingCoverStyle' ? draft[key] ?? 'minimal' : draft[key] ?? null;
    if (before !== after) changes[key] = after;
  }
  if ('title' in changes) changes.slug = original.slug;
  return changes;
}
export function needsReviewWarning(track: CleanupTrack, changes: Record<string, unknown>) {
  return ['approved','published'].includes(track.nexusReviewStatus ?? '') && ['realmId','status','visibility'].some(key => key in changes);
}
