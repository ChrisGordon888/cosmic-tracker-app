'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {useSession} from 'next-auth/react';
import {pendingCommercialAccess,requestCommercialAccess,type CommercialAccessState} from '@/lib/commercialAccess';

const Context=createContext<CommercialAccessState & {allowed:boolean;retry:()=>void}>({
 ...pendingCommercialAccess,allowed:false,retry:()=>{},
});
export const useCommercialAccess=()=>useContext(Context);
export default function CommercialAccess({children}:{children:ReactNode}){
 const {data:session,status}=useSession();
 const identity=status==='authenticated'?session?.user?.email ?? '':status;
 const [attempt,setAttempt]=useState(0);
 const [result,setResult]=useState<{identity:string;attempt:number;access:CommercialAccessState}|null>(null);
 useEffect(()=>{
  if(status!=='authenticated')return;
  const controller=new AbortController();let disposed=false;
  const timeout=setTimeout(()=>controller.abort(),10000);
  void requestCommercialAccess(controller.signal).then(access=>{
   if(!disposed)setResult({identity,attempt,access});
  }).finally(()=>clearTimeout(timeout));
  return()=>{disposed=true;clearTimeout(timeout);controller.abort();};
 },[status,identity,attempt]);
 const access:CommercialAccessState=status==='unauthenticated'?{status:'signed-out',attention:null}:
  result?.identity===identity&&result.attempt===attempt?result.access:pendingCommercialAccess;
 return <Context.Provider value={{...access,allowed:access.status==='authorized',retry:()=>setAttempt(n=>n+1)}}>{children}</Context.Provider>;
}
