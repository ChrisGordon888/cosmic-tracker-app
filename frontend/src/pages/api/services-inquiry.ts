import type { NextApiRequest,NextApiResponse } from 'next';
import { persistEngagement } from '@/server/engagementIntake';
import { validateInquiry,sendInquiry } from '@/server/servicesInquiry';
export const config={api:{bodyParser:{sizeLimit:'16kb'}}};
export default async function handler(req:NextApiRequest,res:NextApiResponse){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,message:'Use the inquiry form to send a message.'});}
 if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({ok:false,message:'Inquiry not sent from this origin.'});}catch{return res.status(403).json({ok:false,message:'Inquiry not sent.'});}}
 let inquiry;try{inquiry=validateInquiry(req.body);}catch(error){return res.status(400).json({ok:false,message:error instanceof Error?error.message:'Check your inquiry.'});}
 let stored=false;
 try { stored=await persistEngagement(inquiry); } catch { return res.status(503).json({ok:false,message:'Could not confirm your inquiry record. Retry unchanged; your entries are still here.'}); }
 const result=await sendInquiry(inquiry,{key:process.env.RESEND_API_KEY,to:process.env.SERVICES_INQUIRY_TO,from:process.env.SERVICES_INQUIRY_FROM});
 if(result.ok) { try { await persistEngagement(inquiry,'accepted'); } catch { /* Record already saved; notification reconciliation stays pending. */ } }
 return res.status(result.status).json({ok:result.ok,message:stored&&!result.ok?'Your inquiry is saved for review, but email notification could not be confirmed. Retry unchanged; your entries are still here.':result.message,...(result.ok ? {reference:result.reference} : {})});
}
