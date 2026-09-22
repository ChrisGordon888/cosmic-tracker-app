'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_OPPORTUNITY, MY_OPPORTUNITIES, RECORD_OPPORTUNITY_RESULT, UPDATE_OPPORTUNITY, type Opportunity } from '@/graphql/opportunities';
import { localOpportunityDate, opportunityReason, todaysOpportunities, tractionLabels } from '@/lib/opportunityPriority';

type Release = { id: string; title: string; slug: string };
type Editor = { mode: 'create' } | { mode: 'edit' | 'result'; record: Opportunity };

export default function OpportunitySection({ releases }: { releases: Release[] }) {
  const { data, loading, error, refetch } = useQuery<{ myOpportunities: Opportunity[] }>(MY_OPPORTUNITIES, { fetchPolicy: 'cache-and-network' });
  const [editor, setEditor] = useState<Editor | null>(null);
  const [today, setToday] = useState(localOpportunityDate);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const refreshDate = () => setToday(localOpportunityDate());
    const timer = window.setInterval(refreshDate, 30000);
    window.addEventListener('focus', refreshDate);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refreshDate); };
  }, []);
  const opportunities = data?.myOpportunities ?? [];
  const selected = todaysOpportunities(opportunities, today);

  async function reload() {
    try { await refetch(); setEditor(null); setNotice('Opportunities reloaded. Open the action again to edit the latest version.'); }
    catch { setNotice('Could not reload. Please try again.'); }
  }

  function card(item: Opportunity, recommended: boolean) {
    const release = releases.find((entry) => entry.id === item.releaseWorldId);
    return <article className="creator-opportunity-card" key={item.id}>
      <p className="creator-console-kicker">{recommended ? opportunityReason(item, today) : `${item.status} · ${item.followUpOn || 'No date set'}`}</p>
      <h3>{item.title}</h3>
      <p><strong>Outcome:</strong> {item.desiredOutcome}</p>
      {item.status === 'open' && <p className="creator-opportunity-action">{item.nextAction}</p>}
      {item.context && <p className="creator-opportunity-context">{item.context}</p>}
      {release && <Link href={`/releases/${release.slug}/board`}>Open {release.title} Signal Board →</Link>}
      <div className="creator-opportunity-actions">
        {item.status === 'open' && <>
          <button type="button" onClick={() => { setNotice(''); setEditor({ mode: 'result', record: item }); }}>Record result</button>
          <button type="button" onClick={() => { setNotice(''); setEditor({ mode: 'edit', record: item }); }}>Edit / defer</button>
        </>}
      </div>
      {item.results.length > 0 && <details>
        <summary>Result history ({item.results.length})</summary>
        <ol className="creator-opportunity-history">{[...item.results].reverse().map((result) => <li key={result.id}>
          <p><strong>{result.action}</strong></p>
          <p>{result.note}</p>
          <small>{result.classification.replaceAll('-', ' ')} · {new Date(result.recordedAt).toLocaleString()}</small>
        </li>)}</ol>
      </details>}
    </article>;
  }

  return <section className="creator-console-panel creator-opportunities" aria-labelledby="opportunities-heading">
    <div className="creator-panel-title-row">
      <div><p className="creator-console-kicker">COSMIC Intelligence · Private creator workspace</p><h2 id="opportunities-heading">Today’s 3</h2></div>
      <button type="button" onClick={() => { setNotice(''); setEditor({ mode: 'create' }); }}>Add opportunity</button>
    </div>
    <p className="creator-console-note">Move your music, collaborations, creator services, coaching, creative/web work or COSMIC forward. Choose a concrete outcome and one next action.</p>
    <p className="creator-console-note">Due actions first, then agreed next steps, expressed interest and exploration. These are suggestions, not a daily quota. Dates use your local day ({today}).</p>
    {notice && <p role="status">{notice}</p>}
    {error && <p role="alert">Could not load opportunities: {error.message}</p>}
    <button type="button" onClick={() => void reload()} disabled={loading}>Reload opportunities</button>
    {editor && <OpportunityEditor key={editor.mode === 'create' ? 'create' : `${editor.mode}-${editor.record.id}`} editor={editor} releases={releases}
      onCancel={() => setEditor(null)} onSaved={async () => {
        setEditor(null);
        setNotice('Saved. Your opportunity and result history are private.');
        try { await refetch(); } catch { setNotice('Saved, but the list could not refresh. Reload opportunities.'); }
      }} />}
    {loading && !data && <p role="status">Loading opportunities…</p>}
    {!loading && !error && selected.length === 0 && <p>{opportunities.length ? 'No actions due now. Future follow-ups remain in All opportunities.' : 'Start with one real creator opportunity. What could move forward today?'}</p>}
    <div className="creator-opportunity-grid">{selected.map((item) => card(item, true))}</div>
    <details className="creator-opportunity-all"><summary>All opportunities ({opportunities.length})</summary>
      <div className="creator-opportunity-grid">{opportunities.map((item) => card(item, false))}</div>
    </details>
  </section>;
}

function OpportunityEditor({ editor, releases, onCancel, onSaved }: { editor: Editor; releases: Release[]; onCancel: () => void; onSaved: () => Promise<void> }) {
  const record = editor.mode === 'create' ? null : editor.record;
  const isResult = editor.mode === 'result';
  const [title, setTitle] = useState(record?.title || '');
  const [desiredOutcome, setDesiredOutcome] = useState(record?.desiredOutcome || '');
  const [context, setContext] = useState(record?.context || '');
  const [traction, setTraction] = useState(record?.traction || 'exploring');
  const [releaseWorldId, setReleaseWorldId] = useState(record?.releaseWorldId || '');
  const [nextAction, setNextAction] = useState(isResult ? '' : record?.nextAction || '');
  const [followUpOn, setFollowUpOn] = useState(isResult ? '' : record?.followUpOn || '');
  const [note, setNote] = useState('');
  const [classification, setClassification] = useState('action-completed');
  const [failure, setFailure] = useState('');
  const [saving, setSaving] = useState(false);
  const [create] = useMutation(CREATE_OPPORTUNITY);
  const [update] = useMutation(UPDATE_OPPORTUNITY);
  const [recordResult] = useMutation(RECORD_OPPORTUNITY_RESULT);
  const needsNext = !isResult || classification === 'action-completed';

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setFailure('');
    try {
      if (isResult && record) {
        await recordResult({ variables: { id: record.id, expectedUpdatedAt: record.updatedAt,
          input: { note, classification, nextAction: needsNext ? nextAction : null, followUpOn: needsNext ? followUpOn || null : null } } });
      } else {
        const input = { title, desiredOutcome, context, traction, releaseWorldId: releaseWorldId || null, nextAction, followUpOn: followUpOn || null };
        if (record) await update({ variables: { id: record.id, expectedUpdatedAt: record.updatedAt, input } });
        else await create({ variables: { input } });
      }
      await onSaved();
    } catch (error) { setFailure(error instanceof Error ? error.message : 'Could not save opportunity.'); }
    finally { setSaving(false); }
  }

  return <form className="creator-opportunity-form" onSubmit={submit}>
    <h3>{isResult ? `Record result: ${record?.title}` : record ? 'Edit creator opportunity' : 'Capture creator opportunity'}</h3>
    <fieldset disabled={saving}>
      {!isResult ? <>
        <label>Opportunity<input autoFocus required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Alex — creative direction session" /></label>
        <label>Desired outcome<input required maxLength={500} value={desiredOutcome} onChange={(event) => setDesiredOutcome(event.target.value)} placeholder="Book one paid creative direction session" /></label>
        <label>Context / evidence<textarea maxLength={5000} value={context} onChange={(event) => setContext(event.target.value)} placeholder="What happened? Why is this a genuine opportunity? Include useful references or links." /></label>
        <label>Evidence of interest<select value={traction} onChange={(event) => setTraction(event.target.value as Opportunity['traction'])}>
          {Object.entries(tractionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <label>Release World (optional)<select value={releaseWorldId} onChange={(event) => setReleaseWorldId(event.target.value)}>
          <option value="">No release link — creator work beyond a release</option>
          {releaseWorldId && !releases.some((release) => release.id === releaseWorldId) && <option value={releaseWorldId}>Linked release unavailable — clear to unlink</option>}
          {releases.map((release) => <option key={release.id} value={release.id}>{release.title}</option>)}
        </select></label>
      </> : <>
        <p><strong>Action:</strong> {record?.nextAction}</p>
        <label>What happened?<textarea autoFocus required maxLength={5000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Record the actual result. Sending a message is different from booking a session." /></label>
        <label>Result<select value={classification} onChange={(event) => setClassification(event.target.value)}>
          <option value="action-completed">Action completed — set the next step</option>
          <option value="outcome-achieved">Desired outcome achieved</option>
          <option value="closed-without-outcome">Close without achieving the outcome</option>
        </select></label>
      </>}
      {needsNext && <>
        <label>{isResult ? 'Next action after this result' : 'One next action'}<input required maxLength={500} value={nextAction} onChange={(event) => setNextAction(event.target.value)} placeholder="Send Alex two available times" /></label>
        <label>Follow-up / revisit date (optional)<input type="date" value={followUpOn} onChange={(event) => setFollowUpOn(event.target.value)} /></label>
        <p className="creator-console-note">A future date keeps this out of Today’s 3 until then. Without a date, it remains eligible.</p>
      </>}
      {failure && <p role="alert">{failure}</p>}
      <div className="creator-opportunity-actions"><button type="submit">{saving ? 'Saving…' : 'Save'}</button><button type="button" onClick={onCancel}>Cancel</button></div>
    </fieldset>
  </form>;
}
