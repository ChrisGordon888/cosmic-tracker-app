import { CREATOR_LINKS } from './creatorNavigation';

export const CREATOR_TOUR_TITLES = ['Add Music', 'Creator Library', 'Organize', 'Projects', 'Workshop', 'Prepare / Publish', 'Nexus'] as const;
export type CreatorTourState = { step: number; projectSlug?: string };
export function creatorTourSessionKey(ownerId: string) { return `cosmic:creator-tour-session:v1:${encodeURIComponent(ownerId)}`; }
export function readCreatorTour(raw: string | null): CreatorTourState | null {
  try {
    const value = JSON.parse(raw || 'null');
    if (!value || !Number.isInteger(value.step) || value.step < 0 || value.step >= CREATOR_TOUR_TITLES.length) return null;
    return { step: value.step, ...(typeof value.projectSlug === 'string' && /^[a-zA-Z0-9_-]+$/.test(value.projectSlug) ? { projectSlug: value.projectSlug } : {}) };
  } catch { return null; }
}
export function isCreatorTourRoute(path: string) {
  return path === '/creator' || path === '/creator/library' || path === '/creator/projects' || path === '/creator/onboarding/profile' || /^\/releases\/[^/]+\/board$/.test(path) || /^\/creator\/releases\/[^/]+\/publish$/.test(path) || path === '/nexus';
}
/** Only explicit navigation changes the lesson. No content or publication state is inferred. */
export function creatorTourAtLocation(tour: CreatorTourState, pathname: string, hash = ''): CreatorTourState {
  const workshop = pathname.match(/^\/releases\/([a-zA-Z0-9_-]+)\/board$/);
  const publish = pathname.match(/^\/creator\/releases\/([a-zA-Z0-9_-]+)\/publish$/);
  if (workshop) return { step: tour.step === 6 ? 6 : 4, projectSlug: workshop[1] };
  if (publish) return { step: 5, projectSlug: publish[1] };
  if (pathname === '/nexus') return { ...tour, step: 6 };
  if (pathname === '/creator/library') {
    const step = hash === '#intake' ? 0 : hash === '#organize' ? 2 : 1;
    return { ...tour, step };
  }
  if (pathname === '/creator/projects' && !(tour.step >= 4 && tour.step <= 5 && !tour.projectSlug)) return { ...tour, step: 3 };
  return tour;
}
export function creatorTourDestination(tour: CreatorTourState) {
  const slug = tour.projectSlug;
  return [CREATOR_LINKS.capture, CREATOR_LINKS.catalog, '/creator/library#organize', CREATOR_LINKS.projects,
    slug ? `/releases/${slug}/board` : CREATOR_LINKS.projects,
    slug ? `/creator/releases/${slug}/publish` : CREATOR_LINKS.projects, '/nexus'][tour.step];
}
export function creatorTourTarget(tour: CreatorTourState, pathname: string): string | null {
  if (tour.step === 0 && pathname === '/creator') return '[data-creator-tour="add-music"]';
  if (pathname === '/creator/library') return ['#intake', '#catalog', '#organize > summary'][tour.step] ?? null;
  if (pathname === '/creator/projects') return tour.step === 3 ? '#create-project > summary' : tour.step === 4 || tour.step === 5 ? '.creator-projects-release-card-actions a' : null;
  if (/^\/releases\/[^/]+\/board$/.test(pathname)) return tour.step === 4 ? '[data-workspace-tour="tracks"]' : tour.step === 6 ? '[data-creator-tour="nexus-review"]' : null;
  if (/^\/creator\/releases\/[^/]+\/publish$/.test(pathname) && tour.step === 5) return '[data-creator-tour="publish-review"]';
  if (pathname === '/nexus' && tour.step === 6) return '.nexus-hero';
  return null;
}
