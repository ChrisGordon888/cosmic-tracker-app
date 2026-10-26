export const STUDIO_REALMS = [303, 202, 101, 55, 44, 0] as const;
export type RealmKey = typeof STUDIO_REALMS[number];
export type Capability = { canReview: boolean; canPublish: boolean; canPlace: boolean };
export type Track = { id: string; title: string; realmId: number | null; visibility: string; status: string; catalogTreatment?: string; playbackStatus: string; accessTier: string; canAccessAudio?: boolean; accessGate?: string; nexusReviewStatus?: string; showInNexus?: boolean; nexusSubmittedAt?: string; nexusReviewedAt?: string; nexusReviewNotes?: string; nexusPublishedAt?: string; nexusUnpublishedAt?: string };
export type World = { id: string; title: string; slug: string; visibility: string; status: string; publicCanon?: boolean | null; coverArtUrl?: string | null };
export type Signal = { track: Track; releaseWorld: World; creativeProfile?: { artistName?: string; displayName?: string } };
export type Project = { world: World; tracks: Track[]; creatorName: string; realmId: number | null; isSelected: boolean };
export type Config = { id: string; samplerRevision?: number; placementHistory?: { action: string; destination: string; sourceId: string; selected: boolean; realmId?: number; at: string }[]; selectedWorldIds?: string[]; featuredTrackId?: string; realmAnchors: { realmId: number; trackId?: string }[]; realmOrders: { realmId: number; trackIds: string[] }[]; realmDiscovery?: { realmId: number; worldId: string }[]; realmSoundtracks?: { realmId: number; worldId: string; trackId: string }[]; nexusRealmSamplers: { realmId: number; trackIds: string[] }[] };
export type ReadState = 'ready' | 'loading' | 'error' | 'denied' | 'unconfigured';
export function readState(allowed: boolean, loading: boolean, error: unknown, data: unknown): ReadState {
 if (!allowed) return 'denied';
 if (error) return 'error';
 if (loading) return 'loading';
 if (data === undefined) return 'error';
 return data === null ? 'unconfigured' : 'ready';
}
export function realmMatches(value: number | null | undefined, selected: string) {
 return selected === 'unassigned' ? value == null : STUDIO_REALMS.includes(Number(selected) as RealmKey) && value === Number(selected);
}
export function studioCounts(signals: Signal[], config: Config | null | undefined, signalsReady: boolean, configReady: boolean) {
 return {
  pending: signalsReady ? signals.filter(s => s.track.nexusReviewStatus === 'in-review').length : null,
  published: signalsReady ? signals.filter(s => s.track.showInNexus && s.track.nexusReviewStatus === 'published').length : null,
  worlds: configReady ? (config?.selectedWorldIds ?? []).length : null,
  soundtrack: configReady ? (config?.realmSoundtracks ?? []).length : null,
  discovery: configReady ? (config?.realmDiscovery ?? []).length : null,
 };
}
export function placementLabels(track: Track, world: World, config: Config | null | undefined) {
 if (!config) return ['Placement state unavailable'];
 const labels = [];
 if (config.realmSoundtracks?.some(s => s.trackId === track.id && s.worldId === world.id && s.realmId === track.realmId)) labels.push('Soundtrack · stored');
 if (config.nexusRealmSamplers.some(s => s.trackIds.includes(track.id))) labels.push('Sampler · stored');
 if (config.realmDiscovery?.some(s => s.worldId === world.id)) labels.push('Discovery · stored');
 if (config.selectedWorldIds?.includes(world.id)) labels.push('Nexus World · stored');
 if (config.featuredTrackId === track.id) labels.push('Spotlight · stored');
 if (config.realmAnchors.some(s => s.trackId === track.id)) labels.push('Anchor · stored');
 return labels.length ? labels : ['No stored placement'];
}
export function prerequisites(track: Track, world: World) {
 const reasons = [];
 if (!['public','listed'].includes(track.visibility) || ['vault','test'].includes(track.catalogTreatment ?? '') || track.status === 'archived') reasons.push('Track is not eligible public music.');
 if (world.visibility !== 'public' || world.status === 'archived') reasons.push('A public, nonarchived World is required for placement.');
 if (track.realmId == null) reasons.push('Assign a Realm before soundtrack placement.');
 if (!['approved','published'].includes(track.nexusReviewStatus ?? '')) reasons.push('Soundtrack placement requires an approved submission.');
 if (track.accessTier !== 'public' || ['locked','coming-soon'].includes(track.playbackStatus)) reasons.push('Sampler requires anonymous playback eligibility.');
 return [...reasons, 'Eligibility needs verification: owner status, media readiness and current public delivery are not verified here.'];
}

export type Assessment = {id:string;kind:'track'|'world';publicSoundtrack?:boolean;publicNexus?:boolean;anonymousPlayable?:boolean;actions:{name:string;allowed:boolean;reasons:string[]}[]};
export type Delivery = {checkedAt:string;soundtrackIds:string[];samplerIds:string[];nexusIds:string[];discoveryIds:string[];worldIds:string[];spotlightId?:string};
export function actionAssessment(assessments:Assessment[],kind:'track'|'world',id:string,name:string) {
 return assessments.find(a=>a.kind===kind&&a.id===id)?.actions.find(a=>a.name===name) ?? {name,allowed:false,reasons:['Eligibility needs verification. Refresh assessment.']};
}
export type StudioAction = 'approve'|'needs-changes'|'publish'|'unpublish'|'soundtrack'|'discovery'|'world'|'sampler'|'spotlight'|'anchor'|'order';
export type Intent = {key:string;action:StudioAction;id:string;label:string;realmId?:number;selected?:boolean;ids?:string[];notes?:string;source?:string;before:string;after:string;revision?:number};
export function intentState(intent:Pick<Intent,'action'|'id'|'realmId'>,config:Config|null|undefined,signals:Signal[]) {
 const track=signals.find(s=>s.track.id===intent.id)?.track;
 switch(intent.action){
 case 'approve':case 'needs-changes':return JSON.stringify({review:track?.nexusReviewStatus,realm:track?.realmId});
 case 'publish':case 'unpublish':return String(track?.showInNexus===true&&track.nexusReviewStatus==='published');
 case 'soundtrack':return String(config?.realmSoundtracks?.some(s=>s.trackId===intent.id&&s.realmId===intent.realmId)??false);
 case 'discovery':return String(config?.realmDiscovery?.some(s=>s.worldId===intent.id&&s.realmId===intent.realmId)??false);
 case 'world':return String(config?.selectedWorldIds?.includes(intent.id)??false);
 case 'sampler':return JSON.stringify({ids:config?.nexusRealmSamplers.find(s=>s.realmId===intent.realmId)?.trackIds??[],revision:config?.samplerRevision??0});
 case 'spotlight':return config?.featuredTrackId??'';
 case 'anchor':return config?.realmAnchors.find(a=>a.realmId===intent.realmId)?.trackId??'';
 case 'order':return JSON.stringify(config?.realmOrders.find(a=>a.realmId===intent.realmId)?.trackIds??[]);
 }
}
export type ActionResult = {intent:Intent;status:'succeeded'|'failed'|'unattempted'|'unverified';message:string};
export async function executeEditorialBatch(intents:Intent[],perform:(intent:Intent)=>Promise<void>):Promise<ActionResult[]> {
 const results:ActionResult[]=[];let stopped=false;
 for(const intent of intents){
  if(stopped){results.push({intent,status:'unattempted',message:'Stopped after the preceding failure.'});continue;}
  try{await perform(intent);results.push({intent,status:'succeeded',message:'Saved and verified against fresh server state.'});}
  catch(error){const message=error && typeof error==='object' && 'message' in error ? String(error.message) : 'Operation failed';const unverified=message.startsWith('UNVERIFIED:');results.push({intent,status:unverified?'unverified':'failed',message});stopped=true;}
 }
 return results;
}
