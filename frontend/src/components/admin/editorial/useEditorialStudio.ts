'use client';
import { useQuery } from '@apollo/client';
import { NEXUS_REVIEW_ME_QUERY } from '@/graphql/nexusReview';
import { STUDIO_CONFIG, STUDIO_PROJECTS, STUDIO_SIGNALS, STUDIO_ASSESSMENT } from '@/graphql/editorialStudio';
import { readState, type Capability, type Config, type Project, type Signal, type Assessment } from '@/lib/editorialStudio';
export function useEditorialStudio() {
 const access = useQuery<{ nexusEditorialAccess: Capability }>(NEXUS_REVIEW_ME_QUERY, { fetchPolicy: 'network-only', notifyOnNetworkStatusChange: true });
 const capability = !access.error ? access.data?.nexusEditorialAccess : undefined;
 const review = capability?.canReview === true;
 const place = capability?.canPlace === true;
 const signals = useQuery<{ nexusReviewQueue: Signal[] }>(STUDIO_SIGNALS, { skip: !review, fetchPolicy: 'network-only', notifyOnNetworkStatusChange: true });
 const config = useQuery<{ editorialStudioConfig: Config | null }>(STUDIO_CONFIG, { skip: !review, fetchPolicy: 'network-only', notifyOnNetworkStatusChange: true });
 const projects = useQuery<{ publicProjects: Project[] }>(STUDIO_PROJECTS, { skip: !place, fetchPolicy: 'network-only', notifyOnNetworkStatusChange: true });
 const trackIds = Array.from(new Set([
  ...(signals.data?.nexusReviewQueue ?? []).map(s=>s.track.id),
  ...(place ? projects.data?.publicProjects ?? [] : []).flatMap(p=>p.tracks.map(t=>t.id)),
  ...(config.data?.editorialStudioConfig?.realmSoundtracks ?? []).map(s=>s.trackId),
  ...(config.data?.editorialStudioConfig?.nexusRealmSamplers ?? []).flatMap(s=>s.trackIds),
 ])).sort();
 const worldIds = place ? Array.from(new Set([
  ...(projects.data?.publicProjects ?? []).map(p=>p.world.id),
  ...(config.data?.editorialStudioConfig?.selectedWorldIds ?? []),
  ...(config.data?.editorialStudioConfig?.realmDiscovery ?? []).map(s=>s.worldId),
 ])).sort() : [];
 const assessment = useQuery<{editorialStudioAssessment:Assessment[]}>(STUDIO_ASSESSMENT,{
  variables:{trackIds,worldIds},skip:!review||signals.loading||config.loading||(place&&projects.loading),
  fetchPolicy:'network-only',notifyOnNetworkStatusChange:true,
 });
 const states = {
  signals: readState(review, signals.loading, signals.error, signals.data?.nexusReviewQueue),
  config: readState(review, config.loading, config.error, config.data?.editorialStudioConfig),
  projects: readState(place, projects.loading, projects.error, projects.data?.publicProjects),
  assessment: readState(review, assessment.loading, assessment.error, assessment.data?.editorialStudioAssessment),
 };
 async function refresh() {
  const result = await access.refetch().catch(() => null);
  const caps = result?.data?.nexusEditorialAccess;
  await Promise.allSettled([...(caps?.canReview ? [signals.refetch(), config.refetch(), assessment.refetch()] : []), ...(caps?.canPlace ? [projects.refetch()] : [])]);
 }
 return { access, capability, states, refresh,
  assessments: states.assessment === 'ready' ? assessment.data?.editorialStudioAssessment ?? [] : [],
  signals: review && !signals.error ? signals.data?.nexusReviewQueue ?? [] : [],
  config: review && !config.error ? config.data?.editorialStudioConfig : undefined,
  projects: place && !projects.error ? projects.data?.publicProjects ?? [] : [],
 };
}
