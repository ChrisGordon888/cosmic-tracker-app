import {getToken} from 'next-auth/jwt';
import type {NextRequest} from 'next/server';

export class UploadPolicyError extends Error {
 constructor(public status:number,message:string){super(message);}
}
const image=['image/jpeg','image/png','image/webp','image/gif'];
const audio=['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/mp4','audio/aac','audio/flac'];
const extensions:Record<string,string[]>={jpg:['image/jpeg'],jpeg:['image/jpeg'],png:['image/png'],webp:['image/webp'],gif:['image/gif'],mp3:['audio/mpeg','audio/mp3'],wav:['audio/wav','audio/x-wav'],m4a:['audio/mp4'],aac:['audio/aac'],flac:['audio/flac'],mp4:['video/mp4'],pdf:['application/pdf']};
const folders:Record<string,{types:string[];bytes:number;segments:number}>={
 'catalog-audio':{types:audio,bytes:100*1024*1024,segments:2},
 'release-audio':{types:audio,bytes:100*1024*1024,segments:3},
 'release-covers':{types:image,bytes:20*1024*1024,segments:3},
 'release-images':{types:image,bytes:20*1024*1024,segments:3},
 'release-videos':{types:['video/mp4'],bytes:100*1024*1024,segments:3},
 'release-documents':{types:['application/pdf'],bytes:20*1024*1024,segments:3},
 'release-assets':{types:[...image,...audio,'video/mp4','application/pdf'],bytes:100*1024*1024,segments:3},
};
export function uploadConstraints(pathname:string){
 if(typeof pathname!=='string'||pathname.length>300||! /^[a-zA-Z0-9_./-]+$/.test(pathname))throw new UploadPolicyError(400,'Unsupported upload path.');
 const parts=pathname.split('/'),rule=folders[parts[0]];
 if(!rule||parts.length!==rule.segments||parts.some(p=>!p||p==='.'||p==='..'||p.startsWith('.')))throw new UploadPolicyError(400,'Unsupported upload path.');
 const ext=parts.at(-1)!.split('.').at(-1)!.toLowerCase();
 const types=(extensions[ext]??[]).filter(t=>rule.types.includes(t));
 if(!types.length)throw new UploadPolicyError(400,'Unsupported file type for this upload.');
 return {allowedContentTypes:types,maximumSizeInBytes:Math.min(rule.bytes,types.some(t=>image.includes(t)||t==='application/pdf')?20*1024*1024:rule.bytes),addRandomSuffix:true,allowOverwrite:false,validUntil:Date.now()+10*60*1000};
}
export async function authorizeCreatorUpload(request:NextRequest, pathname?:string){
 const session=await getToken({req:request,secret:process.env.NEXTAUTH_SECRET});
 if(!session||typeof session.accessToken!=='string')throw new UploadPolicyError(401,'Sign in to upload creator media.');
 let user:{id?:string;role?:string;creatorStatus?:string}|undefined;
 try{
  const response=await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL||'http://localhost:4000/graphql',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.accessToken}`},body:JSON.stringify({query:'query CreatorUploadAccess { me { id role creatorStatus } }'}),cache:'no-store',signal:AbortSignal.timeout(8000)});
  const result=await response.json();if(!response.ok||result.errors)throw Error('Permission lookup failed');user=result.data?.me;
 }catch{throw new UploadPolicyError(503,'Upload permissions could not be verified. Please retry.');}
 const onboardingArtwork=user?.role==='creator'&&user.creatorStatus==='invited'&&typeof pathname==='string'&&/^release-covers\/onboarding\/[^/]+$/.test(pathname);
 if(onboardingArtwork)uploadConstraints(pathname!);
 if(!user?.id||user.creatorStatus==='suspended'||!(['admin','owner'].includes(user.role??'')||(user.role==='creator'&&user.creatorStatus==='active')||onboardingArtwork))throw new UploadPolicyError(403,'Active creator access is required to upload.');
 return user.id;
}
