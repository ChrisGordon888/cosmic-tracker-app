import { getMusicAvailability } from './musicAvailability';
import type { RuntimeMusicTrack } from './publicMusicCatalog';
import type { PublicProject } from './publicProjects';
export function listenerRealmPath(realmId:number,catalog:RuntimeMusicTrack[],projects:PublicProject[],signedIn:boolean,preferredId?:string){
 const destination=`/nexus#realm-${realmId}`;
 const candidates=catalog.filter(t=>t.realmId===realmId).sort((a,b)=>Number(b.id===preferredId)-Number(a.id===preferredId));
 const playable=candidates.find(t=>getMusicAvailability(t,{isCreatorView:false,isSignedIn:signedIn}).isPlayable);
 if(playable)return {href:playable.releaseSlug?`/releases/${playable.releaseSlug}`:destination,label:'Explore Realm music',state:'active'};
 const project=projects.find(p=>p.realmId===realmId&&p.tracks.some(t=>getMusicAvailability(t,{isCreatorView:false,isSignedIn:signedIn,releaseVisibility:'public'}).isPlayable));
 if(project)return {href:`/releases/${project.world.slug}`,label:'Explore World',state:'project'};
 const memberProject=projects.find(p=>p.realmId===realmId&&p.tracks.some(t=>t.accessTier==='signup'));
 if(!signedIn&&(candidates.some(t=>t.accessTier==='signup'||t.visibility==='signup')||memberProject))return {href:`/auth?callbackUrl=${encodeURIComponent(memberProject?`/releases/${memberProject.world.slug}`:destination)}`,label:'Sign in for member music',state:'member'};
 return {href:destination,label:'Explore Realm · no current playable signal',state:'quiet'};
}
