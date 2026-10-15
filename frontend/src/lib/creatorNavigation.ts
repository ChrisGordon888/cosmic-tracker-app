export const CREATOR_LINKS = {
  home: '/creator',
  capture: '/creator/library#intake',
  catalog: '/creator/library#catalog',
  projects: '/creator/projects',
  profile: '/creator/onboarding/profile',
} as const;

export function creatorHomeTourKey(ownerId: string) {
  return `cosmic:creator-home-tour:v1:${encodeURIComponent(ownerId)}`;
}

/** Archive is explicit; do not infer test projects from their titles. */
export function activeCreatorProjects<T extends { status: string }>(projects: T[]): T[] {
  return projects.filter(project => project.status !== 'archived');
}
