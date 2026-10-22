import { createHash, randomUUID } from 'node:crypto';
import { SERVICE_OFFERS } from '../lib/serviceOffers';
const offers=SERVICE_OFFERS.map(offer=>offer.slug);
export function validateInquiry(value:unknown){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Enter your inquiry details.');
 const data=value as Record<string,unknown>;
 const field=(key:string,max:number,required=false)=>{const v=data[key]??'';if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw new Error(`Check ${key} (maximum ${max} characters).`);return v.trim();};
 if(field('website',200))throw new Error('Inquiry not sent. Please leave the website field empty.');
 const name=field('name',150,true),email=field('email',254,true),offer=field('offer',80,true),message=field('message',6000,true);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n]/.test(email))throw new Error('Enter a valid email address.');
 if(!offers.includes(offer))throw new Error('Choose an available service.');
 const inquiryId=field('inquiryId',36)||randomUUID();
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(inquiryId))throw new Error('Invalid inquiry reference. Reload the form.');
 return {inquiryId,name,email,offer,message,intent:field('intent',80),links:field('links',3000),timeline:field('timeline',300),contactPreference:field('contactPreference',150)};
}
export async function sendInquiry(data:ReturnType<typeof validateInquiry>,config:{key?:string;to?:string;from?:string},transport:typeof fetch=fetch){
 if(!config.key||!config.to||!config.from)return {ok:false,status:503,message:'Inquiry not sent. Email service is not configured yet. Your entries are still here.'};
 const offer=SERVICE_OFFERS.find(offer=>offer.slug===data.offer)!;
 const reference=`COS-${data.inquiryId}`;
 // Stable body and key allow provider-side deduplication on an unchanged retry.
 const text=Object.entries({...data,reference,service:offer.label,priceContext:offer.price}).map(([k,v])=>`${k}: ${v}`).join('\n\n')+
 '\n\nINQUIRY ONLY — no booking or payment confirmed.\nNext: reply to confirm fit, scope, timing and price. Then send the agreed scheduling details and invoice/payment link. Track the next action privately in Opportunities if useful.';
 const key='services/'+createHash('sha256').update(JSON.stringify(data)).digest('hex');
 try{
 const response=await transport('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${config.key}`,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({from:config.from,to:[config.to],reply_to:data.email,subject:`${reference} — ${offer.label}`,text}),signal:AbortSignal.timeout(12000)});
 const result=await response.json();
 if(!response.ok||!result.id)return {ok:false,status:502,message:'Inquiry not sent successfully. Please retry; your entries are still here.'};
 return {ok:true,status:200,reference,message:'Inquiry accepted for email delivery. This does not confirm a booking or payment.'};
 }catch{return {ok:false,status:502,message:'We could not confirm sending your inquiry. Your entries are still here; please try again later.'};}
}
