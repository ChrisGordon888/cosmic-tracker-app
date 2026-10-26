'use client';
import {useEffect,useRef} from 'react';
import type {useEditorialActions} from './useEditorialActions';
export default function EditorialActionReview({actions}:{actions:ReturnType<typeof useEditorialActions>}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{if(actions.plan.length||actions.results.length||actions.error)ref.current?.focus();},[actions.plan,actions.results,actions.error]);
 if(!actions.busy&&!actions.plan.length&&!actions.results.length&&!actions.error)return null;
 return <section ref={ref} tabIndex={-1} className="studio-panel studio-confirm" aria-label="Editorial change review">
  <h2>{actions.plan.length?'Review exact changes':'Operation results'}</h2>
  <p>No cross-item atomicity. Each destination remains independent. Confirmation revalidates current prerequisites.</p>
  {actions.error&&<p role="alert">{actions.error}</p>}
  {actions.busy&&<p role="status">Checking server state…</p>}
  {actions.plan.map(i=><article key={i.key}><h3>{i.label} · {i.action}</h3><p>Before: <code>{i.before||'none'}</code></p><p>After: <code>{i.after||'none'}</code></p>{i.notes&&<p>Review note: {i.notes}</p>}{i.action==='unpublish'&&<p>Existing withdrawal behavior also clears this Signal’s Spotlight/anchor/order references. Its official soundtrack and stored sampler membership are preserved.</p>}</article>)}
  {!!actions.plan.length&&<div className="studio-links"><button disabled={actions.busy} onClick={()=>void actions.confirm()}>Confirm {actions.plan.length} change{actions.plan.length===1?'':'s'}</button><button disabled={actions.busy} onClick={actions.cancel}>Cancel</button></div>}
  {actions.results.map(r=><p key={r.intent.key} role="status"><strong>{r.intent.label} · {r.status}</strong> — {r.message}</p>)}
  {actions.results.some(r=>r.status==='failed')&&<button disabled={actions.busy} onClick={()=>void actions.retryFailed()}>Revalidate failed items only</button>}
  {actions.results.some(r=>r.status==='unattempted')&&<button disabled={actions.busy} onClick={()=>void actions.prepareUnattempted()}>Prepare unattempted items</button>}
 </section>;
}
