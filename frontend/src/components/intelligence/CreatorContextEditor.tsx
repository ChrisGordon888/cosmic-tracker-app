'use client';
import { useState } from 'react';
import type { CreatorContext } from '@/lib/creatorContext';
export type ContextSave = (trackId: string, input: CreatorContext & { hook?: string }) => Promise<void>;
const fields = [
  ['emotionalStart', 'Where does it begin emotionally?', 500],
  ['emotionalEnd', 'Where does it land?', 500],
  ['creatorRole', 'Your creative role for this song', 500],
  ['referenceNotes', 'References / world', 4000],
] as const;
export default function CreatorContextEditor({ trackId, context, hook, onSave, inline=false }: { trackId: string; context: CreatorContext; hook: string; onSave: ContextSave; inline?:boolean }) {
  const [draft, setDraft] = useState({ ...context, hook });
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  async function save(clear = false) {
    setBusy(true); setMessage('');
    const initial = { ...context, hook };
    const input = clear ? { meaning: '', emotionalStart: '', emotionalEnd: '', referenceNotes: '', creatorRole: '' } : Object.fromEntries(Object.entries(draft).filter(([key, value]) => value !== initial[key as keyof typeof initial]));
    if (!Object.keys(input).length) { setMessage('No changes to save.'); setBusy(false); return; }
    try { await onSave(trackId, input); if (clear) setDraft({ meaning:'',emotionalStart:'',emotionalEnd:'',referenceNotes:'',creatorRole:'',hook: draft.hook }); setMessage(clear ? 'Context cleared. Existing hook and notes preserved.' : 'Saved. Intelligence refreshed.'); }
    catch { setMessage('Could not save or refresh. Your draft remains here; retry or refresh sources.'); }
    finally { setBusy(false); }
  }
  const form=<div className="intelligence-context"><p>Your words stay yours. Everything else is optional.</p>
    <fieldset disabled={busy}><label>What is this really about?<textarea maxLength={4000} rows={3} value={draft.meaning || ''} onChange={e => setDraft({ ...draft, meaning: e.target.value })}/></label>
    <details><summary>Hook, emotional movement & references</summary><label>Key line / hook<textarea maxLength={4000} rows={2} value={draft.hook} onChange={e => setDraft({ ...draft, hook: e.target.value })}/></label>
    {fields.map(([key, label, max]) => <label key={key}>{label}<textarea maxLength={max} rows={2} value={draft[key] || ''} onChange={e => setDraft({ ...draft, [key]: e.target.value })}/></label>)}</details>
    <button onClick={() => void save()}>{busy ? 'Saving…' : 'Save context'}</button><details><summary>Clear deeper context</summary><p>Removes the meaning, emotional movement, references and creative role entered here. Existing hook and notes remain editable in their own fields.</p><button onClick={() => void save(true)}>Clear my deeper context</button></details></fieldset><p role="status">{message}</p></div>;
  return inline?form:<details><summary>Add / edit your context</summary>{form}</details>;
}
