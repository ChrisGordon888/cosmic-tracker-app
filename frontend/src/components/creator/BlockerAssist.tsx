'use client';

import Link from 'next/link';
import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlatformAccess } from '@/context/PlatformAccessProvider';
import { BLOCKER_ASSIST_WORKSPACE } from '@/graphql/blockerAssist';
import { GET_RELEASE_PUBLISHING_READINESS, type ReleasePublishingReadinessData } from '@/graphql/onboarding';
import { assistStorageKey, BLOCKER_SNOOZE_MS, evaluateBlockerAssist, explicitlyFeaturedRelease, readAssistMemory, type AssistMemory, type FeaturedRelease, type FeaturedWorkspace } from '@/lib/blockerAssist';

type Observation = { ownerId: string; release: FeaturedRelease; kind: 'noticed' | 'cleared' };

export default function BlockerAssist({ featuredSelection }: { featuredSelection: string | null }) {
  const client = useApolloClient();
  const { user, canAccessCreatorOS } = usePlatformAccess();
  const ownerId = user?.id;
  const [observation, setObservation] = useState<Observation | null>(null);
  const fallbackMemory = useRef(new Map<string, AssistMemory>());
  const generation = useRef(0);

  const readMemory = useCallback((key: string) => {
    try { return readAssistMemory(window.localStorage.getItem(key)); }
    catch { return fallbackMemory.current.get(key) ?? readAssistMemory(null); }
  }, []);
  const writeMemory = useCallback((key: string, memory: AssistMemory) => {
    fallbackMemory.current.set(key, memory);
    try { window.localStorage.setItem(key, JSON.stringify(memory)); } catch { /* Keep this visit quiet even if storage is disabled. */ }
  }, []);

  useEffect(() => {
    let disposed = false;
    async function verify() {
      const request = ++generation.current;
      setObservation(null);
      if (!ownerId || !canAccessCreatorOS) return;
      try {
        // Refresh the selection as well as readiness: another tab may have changed the featured release.
        const workspace = await client.query<FeaturedWorkspace>({ query: BLOCKER_ASSIST_WORKSPACE, fetchPolicy: 'no-cache' });
        if (disposed || request !== generation.current) return;
        const release = explicitlyFeaturedRelease(workspace.data);
        if (!release) return;
        const result = await client.query<ReleasePublishingReadinessData>({
          query: GET_RELEASE_PUBLISHING_READINESS,
          variables: { releaseWorldId: release.id },
          fetchPolicy: 'no-cache',
        });
        if (disposed || request !== generation.current) return;
        const key = assistStorageKey(ownerId, release.id);
        const decision = evaluateBlockerAssist(release.id, result.data.getReleasePublishingReadiness, readMemory(key), Date.now());
        writeMemory(key, decision.memory);
        if (decision.view) setObservation({ ownerId, release, kind: decision.view });
      } catch {
        // No evidence means no observation; never infer clearance from an error.
      }
    }
    const onVisible = () => { if (document.visibilityState === 'visible') void verify(); };
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith(`cosmic:blocker-assist:v1:${ownerId}:`)) void verify();
    };
    void verify();
    window.addEventListener('focus', onVisible);
    window.addEventListener('pageshow', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('storage', onStorage);
    return () => {
      disposed = true;
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('pageshow', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('storage', onStorage);
    };
  }, [client, ownerId, canAccessCreatorOS, featuredSelection, readMemory, writeMemory]);

  if (!observation || !ownerId || observation.ownerId !== ownerId || !canAccessCreatorOS) return null;

  function dismiss() {
    if (!observation || !ownerId) return;
    ++generation.current;
    const key = assistStorageKey(ownerId, observation.release.id);
    const memory = readMemory(key);
    writeMemory(key, observation.kind === 'noticed'
      ? { ...memory, suppressedUntil: Date.now() + BLOCKER_SNOOZE_MS }
      : { ...memory, observed: false });
    setObservation(null);
  }

  return <aside className="creator-blocker-assist" aria-label="COSMIC noticed">
    <p className="creator-blocker-assist-label">COSMIC noticed</p>
    <h2>{observation.release.title}</h2>
    {observation.kind === 'cleared' ? <>
      <p role="status">Blocker cleared</p>
      <p>The publishing check now finds cover artwork for this release.</p>
      <button type="button" onClick={dismiss}>Dismiss</button>
    </> : <>
      <p>One publishing condition is unresolved: cover artwork is missing.</p>
      <p>Register cover artwork in the Signal Board’s Assets tab to satisfy this publishing condition.</p>
      <div className="creator-blocker-assist-actions">
        <Link href={`/releases/${observation.release.slug}/board`}>Open Signal Board</Link>
        <button type="button" onClick={dismiss}>Not now</button>
      </div>
      <p className="creator-blocker-assist-reason">Shown because this is your featured release and this is the only remaining supported publishing blocker.</p>
    </>}
  </aside>;
}
