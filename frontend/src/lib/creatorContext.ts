import { z } from 'zod';
import { fingerprint, type FingerprintTrack } from './creativeFingerprint';
export const CreatorContextSchema = z.object({
  meaning: z.string().max(4000).nullish(),
  emotionalStart: z.string().max(500).nullish(),
  emotionalEnd: z.string().max(500).nullish(),
  referenceNotes: z.string().max(4000).nullish(),
  creatorRole: z.string().max(500).nullish(),
});
export type CreatorContext = z.infer<typeof CreatorContextSchema>;
export type ContextTrack = FingerprintTrack & { creatorContext?: CreatorContext | null };
export function contextText(track: ContextTrack) {
  // Reference works are not treated as claims about the song's own meaning.
  const c = track.creatorContext;
  return [c?.meaning, c?.emotionalStart, c?.emotionalEnd].filter(Boolean).join('\n');
}
export function contextFingerprint(track: ContextTrack) {
  const original = fingerprint(track);
  const contextual = fingerprint({ ...track, notes: contextText(track), mood: '', hook: '', creativeSignals: [], realmFinderSignals: [] });
  return { ...original, evidence: [...original.evidence, ...contextual.evidence.filter(e => !original.evidence.some(o => o.signal === e.signal)).map(e => ({ ...e, source: 'CREATOR_CONTEXT' as const }))] };
}
export type HypothesisIdentity = { subjectType: 'track' | 'world'; subjectId: string; hypothesisType: string; engineVersion: string; evidenceHash: string; hypothesisKey: string };
export type Feedback = { hypothesisKey: string; response: 'RESONATES' | 'INTERESTING' | 'NOT_REALLY'; note?: string | null };
export function hypothesisIdentity(subjectType: 'track' | 'world', subjectId: string, hypothesisType: string, engineVersion: string, evidenceHash: string): HypothesisIdentity {
  return { subjectType, subjectId, hypothesisType, engineVersion, evidenceHash, hypothesisKey: [subjectType, subjectId, hypothesisType, engineVersion, evidenceHash].join('|') };
}

export const SongMomentSchema=z.object({id:z.string(),timeSeconds:z.number().min(0).max(86400),endTimeSeconds:z.number().min(0).max(86400).nullish(),type:z.enum(['HOOK','VERSE','TURN','DROP','MOMENT','NOTE','LYRIC','ENERGY','CUSTOM']),label:z.string().max(200).nullish(),note:z.string().max(2000).nullish(),createdAt:z.string().optional(),updatedAt:z.string().optional()});
export type SongMoment=z.infer<typeof SongMomentSchema>;
