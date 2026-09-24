export const COVER_BLOCKER = 'RELEASE_ARTWORK_REQUIRED';
export const COVER_COMPLETE = 'RELEASE_ARTWORK';
export const BLOCKER_SNOOZE_MS = 24 * 60 * 60 * 1000;

export type FeaturedRelease = { id: string; title: string; slug: string; isFeatured: boolean; status: string };
export type FeaturedWorkspace = {
  myCreativeProfiles: { featuredReleaseWorldId?: string | null }[];
  myReleaseWorlds: FeaturedRelease[];
};
export type AssistMemory = { observed: boolean; suppressedUntil: number };
export type AssistReadiness = { releaseWorldId: string; blockingIssues: { code: string }[]; completedChecks: string[] };
export type AssistView = 'noticed' | 'cleared' | null;

// Match Creator Home's explicit choices, excluding its most-recent-project fallback.
export function explicitlyFeaturedRelease(workspace: FeaturedWorkspace): FeaturedRelease | null {
  const profileId = workspace.myCreativeProfiles[0]?.featuredReleaseWorldId;
  const release = workspace.myReleaseWorlds.find((item) => item.id === profileId)
    ?? workspace.myReleaseWorlds.find((item) => item.isFeatured);
  return release && release.status !== 'archived' ? release : null;
}

export function assistStorageKey(ownerId: string, releaseId: string): string {
  return `cosmic:blocker-assist:v1:${ownerId}:${releaseId}`;
}

export function readAssistMemory(raw: string | null): AssistMemory {
  try {
    const value = JSON.parse(raw || 'null');
    if (typeof value?.observed === 'boolean' && Number.isFinite(value?.suppressedUntil) && value.suppressedUntil >= 0) return value;
  } catch { /* Browser-local state is optional; ignore malformed storage. */ }
  return { observed: false, suppressedUntil: 0 };
}

export function evaluateBlockerAssist(releaseId: string, readiness: AssistReadiness, memory: AssistMemory, now: number): { view: AssistView; memory: AssistMemory } {
  if (readiness.releaseWorldId !== releaseId) return { view: null, memory };
  const coverMissing = readiness.blockingIssues.some((issue) => issue.code === COVER_BLOCKER);
  const suppressed = memory.suppressedUntil > now;
  // Require affirmative verification, not a missing response or disappearance from an allowlist.
  if (!coverMissing && readiness.completedChecks.includes(COVER_COMPLETE)) {
    return { view: memory.observed && !suppressed ? 'cleared' : null, memory: { ...memory, observed: false } };
  }
  if (!suppressed && readiness.blockingIssues.length === 1 && coverMissing) {
    return { view: 'noticed', memory: { ...memory, observed: true } };
  }
  return { view: null, memory };
}
