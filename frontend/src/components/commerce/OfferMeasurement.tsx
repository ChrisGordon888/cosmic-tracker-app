'use client';
import {useState} from 'react';
export function useOfferMeasurement(slug:string,campaigns:string[],preview:boolean){
 const [enabled,setEnabled]=useState(false);
 function record(kind:'visit'|'cta'){if(preview)return;const supplied=new URLSearchParams(window.location.search).get('utm_source')||'';const campaign=campaigns.includes(supplied)?supplied:'direct';void fetch('/api/commerce/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug,kind,campaign,consent:true,eventId:crypto.randomUUID()}),keepalive:true}).catch(()=>{});}
 return {enabled,toggle:(value:boolean)=>{setEnabled(value);if(value)record('visit');},click:()=>{if(enabled)record('cta');}};
}
