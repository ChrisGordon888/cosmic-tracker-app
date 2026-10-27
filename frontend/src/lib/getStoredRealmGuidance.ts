import type { ExperienceMode, RealmId } from '@/lib/realmStateMap';
import { canExplorePublicRealm } from '@/lib/publicRealmNavigation';
export const GUIDANCE_KEY = 'cosmic:lastRealmAlignment';
export const GUIDANCE_EVENT = 'cosmic:realm-guidance-changed';
export interface StoredRealmGuidance {
  version?: 1; realmId: RealmId; mode: ExperienceMode; recommendedTrack: string;
  recommendedTrackId?: string; reflectionPrompt: string; savedAt?: string;
}
export function parseRealmGuidance(raw:string|null):StoredRealmGuidance|null {
  try {const p=JSON.parse(raw??'null');
    if(!p||!canExplorePublicRealm(p.realmId)||!['stay','move-through','shift'].includes(p.mode))return null;
    return {version:1,realmId:p.realmId,mode:p.mode,recommendedTrack:typeof p.recommendedTrack==='string'?p.recommendedTrack:'',reflectionPrompt:typeof p.reflectionPrompt==='string'?p.reflectionPrompt:'',...(typeof p.recommendedTrackId==='string'?{recommendedTrackId:p.recommendedTrackId}:{}),...(typeof p.savedAt==='string'?{savedAt:p.savedAt}:{})};
  }catch{return null;}
}
export function getStoredRealmGuidance():StoredRealmGuidance|null {
  if(typeof window==='undefined')return null;
  try{return parseRealmGuidance(window.localStorage.getItem(GUIDANCE_KEY));}catch{return null;}
}
export function saveRealmGuidance(value:StoredRealmGuidance):boolean {
  try {window.localStorage.setItem(GUIDANCE_KEY,JSON.stringify({...value,version:1,savedAt:new Date().toISOString()}));window.dispatchEvent(new Event(GUIDANCE_EVENT));return true;}catch{return false;}
}
