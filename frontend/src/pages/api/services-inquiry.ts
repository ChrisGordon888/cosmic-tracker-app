import type { NextApiRequest,NextApiResponse } from 'next';
import { validateInquiry,sendInquiry } from '@/server/servicesInquiry';
export const config={api:{bodyParser:{sizeLimit:'16kb'}}};
export default async function handler(req:NextApiRequest,res:NextApiResponse){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,message:'Use the inquiry form to send a message.'});}
 if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({ok:false,message:'Inquiry not sent from this origin.'});}catch{return res.status(403).json({ok:false,message:'Inquiry not sent.'});}}
 let inquiry;try{inquiry=validateInquiry(req.body);}catch(error){return res.status(400).json({ok:false,message:error instanceof Error?error.message:'Check your inquiry.'});}
 const result=await sendInquiry(inquiry,{key:process.env.RESEND_API_KEY,to:process.env.SERVICES_INQUIRY_TO,from:process.env.SERVICES_INQUIRY_FROM});
 return res.status(result.status).json({ok:result.ok,message:result.message});
}
