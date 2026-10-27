'use client';
import {useEffect,useState} from 'react';
import {getStoredRealmGuidance,GUIDANCE_EVENT,GUIDANCE_KEY,type StoredRealmGuidance} from '@/lib/getStoredRealmGuidance';
export function useRealmGuidance(){
 const [value,setValue]=useState<StoredRealmGuidance|null>(null);
 useEffect(()=>{const read=()=>setValue(getStoredRealmGuidance());const storage=(e:StorageEvent)=>{if(e.key===GUIDANCE_KEY||e.key===null)read();};
  window.addEventListener(GUIDANCE_EVENT,read);window.addEventListener('storage',storage);window.addEventListener('pageshow',read);read();
  return()=>{window.removeEventListener(GUIDANCE_EVENT,read);window.removeEventListener('storage',storage);window.removeEventListener('pageshow',read);};
 },[]);return value;
}
