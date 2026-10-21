'use client';
import { useState } from 'react';
import type { Feedback, HypothesisIdentity } from '@/lib/creatorContext';
export type FeedbackSave = (identity: HypothesisIdentity, response: Feedback['response'] | null, note: string) => Promise<void>;
export default function HypothesisResponse({ identity, feedback, onRespond }: { identity: HypothesisIdentity; feedback?: Feedback; onRespond: FeedbackSave }) {
  const [note, setNote] = useState(feedback?.note || ''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function respond(response: Feedback['response'] | null) { setBusy(true); setError(''); try { await onRespond(identity, response, note); } catch { setError('Response could not be saved. Please retry.'); } finally { setBusy(false); } }
  return <div className="intelligence-feedback"><small>{feedback?.response === 'RESONATES' ? 'Resonates with you · still a hypothesis' : feedback?.response === 'NOT_REALLY' ? 'Not really · kept out of the main observations' : feedback?.response === 'INTERESTING' ? 'Marked interesting by you' : 'Does this resonate?'}</small><fieldset disabled={busy}>
  <div className="intelligence-chips">{([['RESONATES', '✓ Resonates'], ['INTERESTING', '○ Interesting'], ['NOT_REALLY', '× Not really']] as const).map(([response, label]) => <button key={response} aria-pressed={feedback?.response === response} onClick={() => void respond(response)}>{label}</button>)}</div>
  <details><summary>Optional note / change response</summary><textarea aria-label="Feedback note" maxLength={2000} value={note} onChange={e => setNote(e.target.value)}/>{feedback && <><button onClick={() => void respond(feedback.response)}>Save note</button><button onClick={() => void respond(null)}>Clear response</button></>}</details></fieldset>{error && <p role="alert">{error}</p>}</div>;
}
