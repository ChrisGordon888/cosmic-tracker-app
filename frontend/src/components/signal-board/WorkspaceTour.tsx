'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlatformAccess } from '@/context/PlatformAccessProvider';
import { WORKSPACE_TOUR_STEPS, workspaceTourKey } from '@/lib/workspaceTour';
import '@/styles/workspaceTour.css';

type Panel = 'tracks' | 'assets' | 'signals' | 'portal';
// Keep this browser session quiet even when storage is unavailable.
const seenThisSession = new Set<string>();

export default function WorkspaceTour({ ready, activePanel, onSelectPanel }: {
  ready: boolean;
  activePanel: Panel;
  onSelectPanel: (panel: Panel) => void;
}) {
  const { user, canAccessCreatorOS } = usePlatformAccess();
  const ownerId = user?.id;
  const [step, setStep] = useState<number | null>(null); // -1 welcome, 0–3 stops, 4 finish
  const dialog = useRef<HTMLDialogElement>(null);
  const replay = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const originalPanel = useRef<Panel>(activePanel);
  const latestPanel = useRef(activePanel);
  latestPanel.current = activePanel;
  const identity = useRef(ownerId);

  const remember = useCallback(() => {
    if (!ownerId) return;
    const key = workspaceTourKey(ownerId);
    seenThisSession.add(key);
    try { localStorage.setItem(key, 'seen'); } catch { /* Session fallback above. */ }
  }, [ownerId]);

  const close = useCallback(() => {
    remember();
    // Close the modal before returning focus; background controls are inert while open.
    dialog.current?.close();
    setStep(null);
    onSelectPanel(originalPanel.current);
    replay.current?.focus();
  }, [onSelectPanel, remember]);

  useEffect(() => {
    if (identity.current !== ownerId) {
      identity.current = ownerId;
      setStep(null);
    }
    if (!ready || !ownerId || !canAccessCreatorOS) return;
    const key = workspaceTourKey(ownerId);
    let seen = seenThisSession.has(key);
    try { seen = seen || localStorage.getItem(key) === 'seen'; } catch { /* Session fallback. */ }
    if (!seen) {
      originalPanel.current = latestPanel.current;
      remember();
      setStep(-1);
    }
  }, [ready, ownerId, canAccessCreatorOS, remember]);

  useEffect(() => {
    const element = dialog.current;
    if (step === null || !ready || !canAccessCreatorOS) { element?.close(); return; }
    if (element && !element.open) element.showModal();
    heading.current?.focus();
    const stop = WORKSPACE_TOUR_STEPS[step];
    if (!stop) return;
    if (stop.target !== 'prepare') onSelectPanel(stop.target);
    const target = document.querySelector<HTMLElement>(`[data-workspace-tour="${stop.target}"]`);
    // The explanation and navigation remain usable if a target is absent.
    target?.classList.add('workspace-tour-target');
    target?.scrollIntoView({ block: 'center', behavior: 'instant' });
    return () => target?.classList.remove('workspace-tour-target');
  }, [step, ready, canAccessCreatorOS, onSelectPanel]);

  const stop = step === null ? undefined : WORKSPACE_TOUR_STEPS[step];
  return <>
    <div className="workspace-help">
      <button ref={replay} type="button" disabled={!ready} onClick={() => {
        originalPanel.current = activePanel;
        setStep(-1);
      }}>? Tour this workspace</button>
      <Link href="/demo/world" target="_blank" rel="noreferrer">Explore the Demo World ↗</Link>
    </div>
    <dialog ref={dialog} className="workspace-tour" aria-labelledby="workspace-tour-title" aria-describedby="workspace-tour-copy"
      onCancel={(event) => { event.preventDefault(); close(); }}>
      <p className="workspace-tour-count">{stop ? `${(step ?? 0) + 1} / 4` : 'Your creative workbench'}</p>
      <h2 ref={heading} tabIndex={-1} id="workspace-tour-title">
        {step === -1 ? 'Welcome to your Signal Board' : stop?.title ?? 'That’s it.'}
      </h2>
      <p id="workspace-tour-copy">{step === -1
        ? 'This is the workbench where a Release World takes shape.'
        : stop?.body ?? 'Build freely — COSMIC will stay out of the way until you need more depth.'}</p>
      <p className="workspace-tour-reassurance">Nothing is published just by working here.</p>
      <div className="workspace-tour-actions">
        {step !== null && step > -1 && step < 4 && <button type="button" onClick={() => setStep(step - 1)}>Back</button>}
        {step !== 4 && <button type="button" onClick={close}>Skip</button>}
        <button type="button" className="workspace-tour-primary" onClick={() => step === 4 ? close() : setStep((step ?? -1) + 1)}>
          {step === -1 ? 'Show me around' : step === 4 ? 'Start shaping' : step === 3 ? 'Finish' : 'Next'}
        </button>
      </div>
      <Link href="/demo/world" target="_blank" rel="noreferrer">See a developed Demo World ↗</Link>
    </dialog>
  </>;
}
