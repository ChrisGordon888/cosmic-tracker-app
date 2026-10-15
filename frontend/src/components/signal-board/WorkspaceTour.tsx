'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlatformAccess } from '@/context/PlatformAccessProvider';
import { WORKSPACE_TOUR_STEPS, workspaceTourKey } from '@/lib/workspaceTour';
import '@/styles/workspaceTour.css';
import { useCreatorTour } from '@/components/creator/CreatorTourProvider';
import { useTourHighlight } from '@/components/creator/useTourHighlight';

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
  const journey = useCreatorTour();
  const journeyActive = Boolean(journey?.tour);
  const journeyReady = journey?.ready ?? true;
  const setWorkshopOpen = journey?.setWorkshopOpen;
  const beginJourney = journey?.begin;
  const [step, setStep] = useState<number | null>(null); // -1 welcome; steps.length is the finish screen
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
    // Restore the prior work panel and return keyboard focus to the replay control.
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
    if (!ready || !ownerId || !canAccessCreatorOS || journeyActive || !journeyReady) return;
    const key = workspaceTourKey(ownerId);
    let seen = seenThisSession.has(key);
    try { seen = seen || localStorage.getItem(key) === 'seen'; } catch { /* Session fallback. */ }
    if (!seen) {
      originalPanel.current = latestPanel.current;
      remember();
      setStep(-1);
    }
  }, [ready, ownerId, canAccessCreatorOS, remember, journeyActive, journeyReady]);

  useEffect(() => {
    const element = dialog.current;
    if (step === null || !ready || !canAccessCreatorOS) { element?.close(); return; }
    // Non-modal: highlighted controls retain their normal click/keyboard behavior.
    if (element && !element.open) element.show();
    heading.current?.focus();
    const stop = WORKSPACE_TOUR_STEPS[step];
    if (stop && stop.target !== 'prepare') onSelectPanel(stop.target);
  }, [step, ready, canAccessCreatorOS, onSelectPanel]);

  useEffect(() => {
    setWorkshopOpen?.(step !== null);
    return () => setWorkshopOpen?.(false);
  }, [step, setWorkshopOpen]);

  // Following the real Prepare Release link continues in the shared journey.
  useEffect(() => {
    if (step === null) return;
    function followPrepare(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('[data-workspace-tour="prepare"]') : null;
      if (!link || link.target === '_blank') return;
      const slug = new URL(link.href).pathname.match(/^\/creator\/releases\/([^/]+)\/publish$/)?.[1];
      if (slug) { close(); beginJourney?.(5, slug); }
    }
    document.addEventListener('click', followPrepare, true);
    return () => document.removeEventListener('click', followPrepare, true);
  }, [step, close, beginJourney]);

  const priorPanel = useRef(activePanel);
  useEffect(() => {
    if (priorPanel.current === activePanel) return;
    priorPanel.current = activePanel;
    if (step === null || !ready) return;
    const target = WORKSPACE_TOUR_STEPS[step]?.target;
    if (!target || target === 'prepare' || target === activePanel) return;
    const index = WORKSPACE_TOUR_STEPS.findIndex(item => item.target === activePanel);
    if (index >= 0) setStep(index);
  }, [activePanel, ready, step]);

  const stop = step === null ? undefined : WORKSPACE_TOUR_STEPS[step];
  // Wait for the chosen panel; never flash the target from the previous panel.
  const targetReady = ready && canAccessCreatorOS && stop && (stop.target === 'prepare' || activePanel === stop.target);
  useTourHighlight(targetReady ? `[data-workspace-tour="${stop.target}"]` : null, 'workspace-tour-target');
  return <>
    <div className="workspace-help">
      <button ref={replay} type="button" disabled={!ready} onClick={() => {
        originalPanel.current = activePanel;
        setStep(-1);
      }}>? Tour this workspace</button>
      <Link href="/demo/world" target="_blank" rel="noreferrer">Explore the Demo World ↗</Link>
    </div>
    <dialog ref={dialog} className="workspace-tour" aria-labelledby="workspace-tour-title" aria-describedby="workspace-tour-copy"
      onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}
      onCancel={(event) => { event.preventDefault(); close(); }}>
      <p className="workspace-tour-count">{stop ? `${(step ?? 0) + 1} / ${WORKSPACE_TOUR_STEPS.length}` : 'Your creative workbench'}</p>
      <h2 ref={heading} tabIndex={-1} id="workspace-tour-title">
        {step === -1 ? 'Welcome to your Workshop' : stop?.title ?? 'That’s it.'}
      </h2>
      <p id="workspace-tour-copy">{step === -1
        ? 'This is the workbench where a Release World takes shape.'
        : stop?.body ?? 'Build freely — COSMIC will stay out of the way until you need more depth.'}</p>
      <p className="workspace-tour-reassurance">Nothing is published just by working here.</p>
      <div className="workspace-tour-actions">
        {step !== null && step > -1 && step < WORKSPACE_TOUR_STEPS.length && <button type="button" onClick={() => setStep(step - 1)}>Back</button>}
        {step !== WORKSPACE_TOUR_STEPS.length && <button type="button" onClick={close}>Skip</button>}
        <button type="button" className="workspace-tour-primary" onClick={() => step === WORKSPACE_TOUR_STEPS.length ? close() : setStep((step ?? -1) + 1)}>
          {step === -1 ? 'Show me around' : step === WORKSPACE_TOUR_STEPS.length ? 'Start shaping' : step === WORKSPACE_TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
      <Link href="/demo/world" target="_blank" rel="noreferrer">See a developed Demo World ↗</Link>
    </dialog>
  </>;
}
