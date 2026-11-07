export const CREATOR_LINKS = {
  home: '/creator',
  capture: '/creator/library#intake',
  catalog: '/creator/library#catalog',
  projects: '/creator/projects',
  profile: '/creator/onboarding/profile',
  intelligence: '/creator/intelligence',
} as const;

export function creatorHomeTourKey(ownerId: string) {
  return `cosmic:creator-home-tour:v1:${encodeURIComponent(ownerId)}`;
}

/** Archive is explicit; do not infer test projects from their titles. */
export function activeCreatorProjects<T extends { status: string }>(projects: T[]): T[] {
  return projects.filter(project => project.status !== 'archived');
}

export const creatorSections = [
 {label:'Overview',items:[{label:'Creator Home',href:'/creator',mark:'⌂'}]},
 {label:'Create & Publish',items:[{label:'Library',href:'/creator/library',mark:'♫'},{label:'Projects',href:'/creator/projects',mark:'▤'},{label:'Media Studio',href:'/creator/media',mark:'▷',operator:true}]},
 {label:'Business',items:[{label:'Marketplace',href:'/creator/marketplace',mark:'◇',operator:true},{label:'Engagements',href:'/creator/engagements',mark:'↗',operator:true}]},
 {label:'Workspace',items:[{label:'Intelligence',href:'/creator/intelligence',mark:'✦'},{label:'Profile',href:'/creator/onboarding/profile',mark:'○'}]},
];
export function visibleCreatorSections(operator:boolean){return creatorSections.map(s=>({...s,items:s.items.filter(i=>!('operator' in i&&i.operator)||operator)})).filter(s=>s.items.length);}
export function creatorRouteActive(path:string|null,href:string){return href==='/creator'?path===href:path===href||!!path?.startsWith(href+'/');}

export function hasWorkshopProject(project: { id?: string | null; slug?: string | null; status?: string | null } | null | undefined) {
  return Boolean(project?.id && project.slug?.trim() && project.status !== 'archived');
}

/** Receives the current project from the owner-scoped Creator Home query. */
export function creatorWorkshopAction(project: { id: string; slug: string; status: string } | null) {
  const ready = hasWorkshopProject(project);
  return {
    label: ready ? 'Open Workshop' : 'Choose or create a project',
    href: ready ? `/releases/${encodeURIComponent(project!.slug.trim())}/board` : CREATOR_LINKS.projects,
    meta: ready ? 'Develop project' : 'Choose or create a project',
    priority: 'secondary',
  };
}
