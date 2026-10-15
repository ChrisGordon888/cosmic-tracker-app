'use client';

import { useCreatorTour } from './CreatorTourProvider';

/** The Home invitation launches the same journey that follows supported routes. */
export default function CreatorHomeTour({ ready, projectSlug }: { ready: boolean; projectSlug?: string }) {
  const journey = useCreatorTour();
  if (!ready || !journey?.ready) return null;
  return <div className="creator-home-tour">
    <button type="button" onClick={() => journey.begin(journey.tour?.step ?? 0, journey.tour?.projectSlug ?? projectSlug)}>
      {journey.tour ? 'Continue Creator tour' : 'Tour Creator Home'}
    </button>
    {!journey.seen && !journey.tour && <div className="creator-tour-invitation">
      <span>Welcome to Creator OS. Take a short walk from Capture to Nexus.</span>
      <button type="button" onClick={() => journey.begin(0, projectSlug)}>Show me around</button>
      <button type="button" onClick={journey.finish}>Skip</button>
    </div>}
  </div>;
}
