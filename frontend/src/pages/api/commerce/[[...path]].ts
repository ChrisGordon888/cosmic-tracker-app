import type {NextApiRequest,NextApiResponse} from 'next';
import {getToken} from 'next-auth/jwt';
export const config={api:{bodyParser:{sizeLimit:'32kb'}}};
export default async function handler(req:NextApiRequest,res:NextApiResponse){
 res.setHeader('Cache-Control','no-store');const path=Array.isArray(req.query.path)?req.query.path.join('/'):'';
 const publicRead=req.method==='GET'&&(/^(?:public(?:\/[a-z0-9-]{1,80})?|media\/public)$/.test(path));
 const allowed=publicRead||req.method==='GET'&&(/^(operator|report|media\/operator)$/.test(path)||/^preview\/[a-f\d]{24}$/.test(path))||req.method==='POST'&&['offerings','providers','events','media/save','originals/vocal-studio'].includes(path);
 if(!allowed)return res.status(404).json({error:'Unknown commerce operation.'});
 if(req.method==='POST'&&req.headers.origin!==`${req.headers['x-forwarded-proto']||'http'}://${req.headers.host}`)return res.status(403).json({error:'Invalid request origin.'});
 const headers:Record<string,string>={'Content-Type':'application/json'};
 if(!publicRead&&path!=='events'){const session=await getToken({req,secret:process.env.NEXTAUTH_SECRET});if(typeof session?.accessToken!=='string')return res.status(401).json({error:'Sign in required.'});headers.Authorization=`Bearer ${session.accessToken}`;}
 const base=process.env.SERVICES_BACKEND_URL;if(!base)return res.status(503).json({error:'Commerce is not configured.'});
 try{const r=await fetch(`${base.replace(/\/$/,'')}/commerce/${path}`,{method:req.method,headers,...(req.method==='POST'?{body:JSON.stringify(req.body)}:{}),signal:AbortSignal.timeout(15000),cache:'no-store'});res.status(r.status).json(await r.json());}catch{res.status(503).json({error:'Commerce unavailable. Refresh before retrying.'});}
}
