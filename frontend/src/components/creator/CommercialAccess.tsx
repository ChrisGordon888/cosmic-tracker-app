'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
const Context=createContext<{allowed:boolean;attention:number|null}>({allowed:false,attention:null});
export const useCommercialAccess=()=>useContext(Context);
export default function CommercialAccess({children}:{children:ReactNode}){
 const [access,setAccess]=useState({allowed:false,attention:null as number|null});
 useEffect(()=>{const controller=new AbortController();fetch('/api/engagements/summary',{signal:controller.signal,cache:'no-store'}).then(async r=>{if(!r.ok)return;const d=await r.json();setAccess({allowed:true,attention:Number.isSafeInteger(d.attention)?d.attention:null});}).catch(()=>{});return()=>controller.abort();},[]);
 return <Context.Provider value={access}>{children}</Context.Provider>;
}
