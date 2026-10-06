'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePlatformAccess } from '@/context/PlatformAccessProvider';
import { creatorHomeTourKey } from '@/lib/creatorNavigation';
import { CREATOR_TOUR_TITLES, creatorTourAtLocation, creatorTourDestination, creatorTourSessionKey, creatorTourTarget, isCreatorTourRoute, readCreatorTour, type CreatorTourState } from '@/lib/creatorTour';
import { useTourHighlight } from './useTourHighlight';
import '@/styles/creatorTour.css';

const dismissedThisSession = new Set<string>();
type TourContext = {
  tour: CreatorTourState | null;
  ready: boolean;
  guidanceVisible: boolean;
  seen: boolean;
  begin: (step?: number, projectSlug?: string) => void;
  finish: () => void;
  setWorkshopOpen: (open: boolean) => void;
};
const Context = createContext<TourContext | null>(null);
export function useCreatorTour() { return useContext(Context); }

export default function CreatorTourProvider({ children }: { children: ReactNode }) {
  const { user, canAccessCreatorOS, loading } = usePlatformAccess();
  const ownerId = canAccessCreatorOS && !loading ? user?.id : undefined;
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [state, setState] = useState<{ ownerId: string; tour: CreatorTourState | null; seen: boolean } | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [workshopOpen, setWorkshopOpen] = useState(false);
  const current = useRef<CreatorTourState | null>(null);
  const identity = useRef(ownerId);
  const tour = ownerId && state?.ownerId === ownerId ? state.tour : null;
  const ready = Boolean(ownerId && state?.ownerId === ownerId);

  const save = useCallback((next: CreatorTourState | null) => {
    if (!ownerId) return;
    current.current = next;
    setState(previous => ({ ownerId, seen: previous?.ownerId === ownerId ? previous.seen : true, tour: next }));
    try {
      if (next) sessionStorage.setItem(creatorTourSessionKey(ownerId), JSON.stringify(next));
      else sessionStorage.removeItem(creatorTourSessionKey(ownerId));
    } catch { /* Route continuity remains in memory when browser storage is unavailable. */ }
  }, [ownerId]);

  useEffect(() => {
    identity.current = ownerId;
    current.current = null;
    setMinimized(false);
    setWorkshopOpen(false);
    if (!ownerId) { setState(null); return; }
    let restored: CreatorTourState | null = null;
    let seen = dismissedThisSession.has(creatorHomeTourKey(ownerId));
    try { restored = readCreatorTour(sessionStorage.getItem(creatorTourSessionKey(ownerId))); } catch { /* Private storage may be disabled. */ }
    try { seen ||= localStorage.getItem(creatorHomeTourKey(ownerId)) === 'seen'; } catch { /* Session fallback. */ }
    if (restored) restored = creatorTourAtLocation(restored, window.location.pathname, window.location.hash);
    current.current = restored;
    setState({ ownerId, tour: restored, seen });
  }, [ownerId]);

  useEffect(() => {
    function followLocation(path = window.location.pathname, hash = window.location.hash) {
      if (identity.current !== ownerId || !current.current) return;
      save(creatorTourAtLocation(current.current, path, hash));
    }
    function changed() { followLocation(); }
    function clicked(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin === window.location.origin) followLocation(destination.pathname, destination.hash);
    }
    changed();
    window.addEventListener('hashchange', changed);
    window.addEventListener('popstate', changed);
    document.addEventListener('click', clicked, true);
    return () => {
      window.removeEventListener('hashchange', changed);
      window.removeEventListener('popstate', changed);
      document.removeEventListener('click', clicked, true);
    };
  }, [pathname, ownerId, save]);

  const finish = useCallback(() => {
    if (!ownerId) return;
    save(null);
    const key = creatorHomeTourKey(ownerId);
    dismissedThisSession.add(key);
    try { localStorage.setItem(key, 'seen'); } catch { /* Session fallback. */ }
    setState(previous => previous?.ownerId === ownerId ? { ...previous, seen: true } : previous);
    setMinimized(false);
  }, [ownerId, save]);

  const begin = useCallback((step = 0, projectSlug?: string) => {
    save({ step, ...(projectSlug ? { projectSlug } : {}) });
    setMinimized(false);
  }, [save]);
  function navigate(step: number) {
    if (!tour) return;
    const next = { ...tour, step };
    save(next);
    setMinimized(false);
    router.push(creatorTourDestination(next));
  }
  const visible = Boolean(tour && isCreatorTourRoute(pathname) && !workshopOpen);
  const selector = visible && !minimized && tour ? creatorTourTarget(tour, pathname) : null;
  useTourHighlight(selector);
  const destination = tour ? creatorTourDestination(tour) : '/creator';
  const missingProject = Boolean(tour && !tour.projectSlug && (tour.step === 4 || tour.step === 5));
  const descriptions = [
    pathname === '/creator' ? 'New music enters COSMIC here. Click the highlighted Add Music control to open Capture.' : 'This is Capture: upload a rough idea, demo or finished song. You can continue without uploading anything.',
    'This is your catalog. Browse tracks and use the existing filters to find what you need.',
    'Organize Library holds Cleanup, Smart Sort, Vault / Rights and Public Exposure. Open the disclosure to explore; nothing is changed by the tour.',
    'Create a Single, EP or Album when the music has a direction. Active projects stay in view; archived work remains recoverable.',
    missingProject ? 'Choose an existing project and open its Workshop, or create one when ready. The tour will pick up that project. You can also continue without creating anything.' : 'Workshop develops the music, Realm, artwork, story and listener settings. Use its workspace tour for a closer look; Studio Board is optional.',
    missingProject ? 'Prepare Release belongs to a project. Choose one in Projects to review it, or continue the tour without publishing anything.' : 'Prepare Release verifies the listener experience and publication requirements. Review freely; the tour never publishes for you.',
    'Nexus is curated discovery. Submit eligible tracks through Realm & Nexus in Workshop. Publishing a world and editorial placement are separate decisions.',
  ];

  return <Context.Provider value={{ tour, ready, guidanceVisible: visible || workshopOpen, seen: ready ? Boolean(state?.seen) : true, begin, finish, setWorkshopOpen }}>
    {children}
    {visible && tour && <aside className={`creator-guided-tour${minimized ? ' is-minimized' : ''}`} aria-label="Creator OS guided tour" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); finish(); } }}>
      {minimized ? <>
        <button type="button" onClick={() => setMinimized(false)}>Continue tour · {tour.step + 1}/7 · {CREATOR_TOUR_TITLES[tour.step]}</button>
        <button type="button" onClick={finish} aria-label="Close creator tour">×</button>
      </> : <>
        <div className="creator-guided-tour-topline"><span>Creator OS · {tour.step + 1}/7</span><button type="button" onClick={() => setMinimized(true)}>Minimize</button><button type="button" onClick={finish}>Close</button></div>
        <h2>{CREATOR_TOUR_TITLES[tour.step]}</h2>
        <p aria-live="polite">{selector ? descriptions[tour.step] : `Your ${CREATOR_TOUR_TITLES[tour.step]} step is saved. Return to that stop to continue, or use Next to move on.`}</p>
        <div className="creator-guided-tour-actions">
          {pathname !== destination.split('#')[0] && <Link href={destination}>{selector ? 'Go to this step' : 'Return to tour step'} →</Link>}
          {tour.step > 0 && <button type="button" onClick={() => navigate(tour.step - 1)}>Back</button>}
          <button type="button" onClick={finish}>Skip tour</button>
          <button type="button" className="is-primary" onClick={() => tour.step === 6 ? finish() : navigate(tour.step + 1)}>{tour.step === 6 ? 'Finish tour' : `Next: ${CREATOR_TOUR_TITLES[tour.step + 1]}`}</button>
          {tour.step === 6 && tour.projectSlug && <Link href={`/releases/${tour.projectSlug}/board`}>Open Workshop for submission →</Link>}
        </div>
      </>}
    </aside>}
  </Context.Provider>;
}
