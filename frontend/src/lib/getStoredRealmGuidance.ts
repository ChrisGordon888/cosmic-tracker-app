import type { ExperienceMode, RealmId } from '@/lib/realmStateMap';

export interface StoredRealmGuidance {
  realmId: RealmId;
  mode: ExperienceMode;
  recommendedTrack: string;
  reflectionPrompt: string;
  savedAt?: string;
}

export function getStoredRealmGuidance(): StoredRealmGuidance | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('cosmic:lastRealmAlignment');
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredRealmGuidance;

    if (parsed?.realmId === undefined || !parsed?.mode) return null;

    return parsed;
  } catch (error) {
    console.warn('Failed to read stored realm guidance:', error);
    return null;
  }
}