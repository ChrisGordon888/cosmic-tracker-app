import { fingerprint, interpretFingerprint, type FingerprintTrack } from './creativeFingerprint';
import { realmFinderRealms } from './creatorRealmFinder';
import type { RealmFinderRealmId } from '@/components/signal-board/types';
import type { CleanupTrack } from './libraryCleanup';

export type CatalogTrack = CleanupTrack & FingerprintTrack & {
  mood?: string | null;
  realmFinderScores?: Record<string, number | null> | null;
  realmFinderSuggestedRealmId?: number | null;
  realmFinderSecondaryRealmId?: number | null;
  realmFinderSignals?: string[] | null;
  audioUrl?: string | null;
  previewAudioUrl?: string | null;
};
export const catalogRealms = Object.entries(realmFinderRealms).map(([id, meta]) => ({ id: Number(id), ...meta }));
const ids = catalogRealms.map(r => r.id);
const words = (text: string) => new Set((text.toLowerCase().match(/[a-z]+/g) ?? []).filter(w => w.length > 3));
const common = new Set(['through','under','into','what','with','from','beyond','made','moving','toward','learning','feels','intentional']);
const vector = (track: CatalogTrack) => ids.map(id => Math.max(0, Math.min(100, track.realmFinderScores?.[`realm${id}`] ?? 0)));
const hasVector = (values: number[]) => values.some(v => v > 0);
function cosine(a: number[], b: number[]) {
  const denominator = Math.hypot(...a) * Math.hypot(...b);
  return denominator ? a.reduce((sum,v,i) => sum + v*b[i],0)/denominator : 0;
}
const key = (value?: string | null) => value?.trim().toLowerCase().replace(/\s+/g,' ') ?? '';
export function similarCatalogTracks(track: CatalogTrack, catalog: CatalogTrack[]) {
  const mood = words(track.mood ?? '');
  return catalog.filter(t => t.id !== track.id && t.status !== 'archived' && (!track.ownerId || t.ownerId === track.ownerId)).map(candidate => {
    let score = 0; const reasons: string[] = [];
    if (track.realmId != null && ids.includes(track.realmId) && track.realmId === candidate.realmId) {score += 1; reasons.push('Same assigned Realm (weak context only)');}
    const shared=fingerprint(track).evidence.filter(e=>fingerprint(candidate).evidence.some(other=>other.signal===e.signal));
    if(shared.length) {score+=shared.length*2;reasons.push(`Shared signals: ${shared.map(e=>e.signal).join(' · ')}`);}
    const a=vector(track), b=vector(candidate);
    if (hasVector(a) && hasVector(b)) {const similarity=cosine(a,b); if(similarity>=.75){score+=4*similarity;reasons.push('Similar saved Realm Finder scores');}}
    const otherMood=words(candidate.mood ?? '');
    const overlap=[...mood].filter(w=>otherMood.has(w));
    if(overlap.length){score+=4*overlap.length/new Set([...mood,...otherMood]).size;reasons.push(`Shared mood: ${overlap.join(', ')}`);}
    // Tempo/key alone are not evidence of creative similarity or Realm placement.
    if(!reasons.length) return null;
    if(track.bpm && candidate.bpm && Math.abs(track.bpm-candidate.bpm)<=12){score+=1-Math.abs(track.bpm-candidate.bpm)/24;reasons.push('Nearby BPM');}
    if(key(track.keySignature) && key(track.keySignature)===key(candidate.keySignature)){score+=.5;reasons.push('Same stated key');}
    return {track:candidate,score,reasons};
  }).filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a,b)=>b.score-a.score || a.track.id.localeCompare(b.track.id)).slice(0,5);
}
export function suggestCatalogRealm(track: CatalogTrack, catalog: CatalogTrack[] = []) {
  const interpreted=interpretFingerprint(track,catalog);
  if ((track.creativeSignals?.length ?? 0)>0 || interpreted.fingerprint.evidence.length>=2) return interpreted;
  const saved = vector(track);
  const hasSnapshot=hasVector(saved);
  const mood=words([track.mood,...(track.realmFinderSignals ?? [])].filter(Boolean).join(' '));
  const ranking=catalogRealms.map((realm,index)=>{
    const vocabulary=words([realm.core,realm.summary,...realm.signals].join(' '));
    const matches=[...mood].filter(w=>!common.has(w)&&vocabulary.has(w));
    return {id:realm.id,score:hasSnapshot?saved[index]:matches.length,matches};
  }).sort((a,b)=>b.score-a.score||a.id-b.id);
  const [first,second]=ranking;
  if(!first.score || first.score===second.score) return {home:null,secondary:null,strength:'Insufficient evidence',reasons:['No clear lead in existing Realm Finder scores or creator-provided mood. Choose a Realm manually or add context on the Signal Board.']};
  return {
    home:first.id as RealmFinderRealmId,
    secondary:second.score>0 && second.score>=first.score*.6 ? second.id as RealmFinderRealmId : null,
    strength:hasSnapshot?'Saved Realm Finder lead':'Tentative metadata suggestion',
    reasons:hasSnapshot?['Highest existing Signal Board Realm Finder score. This is creative context, not a probability.']:[`Creator-provided mood/signal matches existing Realm Finder language: ${first.matches.join(', ')}.`],
  };
}

export function catalogProjectLabel(track: { releaseWorldId?: string | null }, releases: ReadonlyMap<string, unknown>) {
  if (!track.releaseWorldId) return 'Standalone Catalog';
  return releases.has(track.releaseWorldId) ? 'Release track' : 'Project link needs repair';
}
