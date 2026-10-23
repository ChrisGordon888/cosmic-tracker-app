import {handleUpload,type HandleUploadBody} from '@vercel/blob/client';
import {NextResponse,type NextRequest} from 'next/server';
import {authorizeCreatorUpload,uploadConstraints,UploadPolicyError} from '@/server/creatorUpload';
export const runtime='nodejs';

// The callback is authenticated by Blob's SDK signature, not by a browser cookie.
export async function POST(request:NextRequest):Promise<NextResponse>{
 try{
  const reader=request.body?.getReader();if(!reader)throw new UploadPolicyError(400,'Missing upload request.');
  const chunks:Uint8Array[]=[];let bytes=0;
  while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>16384){await reader.cancel();throw new UploadPolicyError(413,'Upload request is too large.');}chunks.push(value);}
  const body=JSON.parse(Buffer.concat(chunks).toString('utf8')) as HandleUploadBody;
  if(!body||!['blob.generate-client-token','blob.upload-completed'].includes(body.type))throw new UploadPolicyError(400,'Invalid upload request.');
  let ownerId:string|undefined;
  if(body.type==='blob.generate-client-token'){
   const origin=request.headers.get('origin');
   if(origin&&origin!==new URL(request.url).origin)throw new UploadPolicyError(403,'Upload origin is not allowed.');
   ownerId=await authorizeCreatorUpload(request,body.payload?.pathname);
   uploadConstraints(body.payload?.pathname);
   // Do not let clients redirect signed completion metadata to another destination.
   if(body.payload.callbackUrl!==new URL('/api/upload',request.url).href)throw new UploadPolicyError(400,'Invalid upload callback.');
  }
  if(!process.env.BLOB_READ_WRITE_TOKEN)throw new UploadPolicyError(503,'Media uploads are not configured.');
  const result=await handleUpload({body,request,
   onBeforeGenerateToken:async pathname=>{
    if(!ownerId)throw new UploadPolicyError(401,'Creator authorization required.');
    return {...uploadConstraints(pathname),tokenPayload:JSON.stringify({ownerId,purpose:'creator-media'})};
   },
   // SDK verifies x-vercel-signature first. No catalog writes or sensitive logging.
   onUploadCompleted:async()=>{},
  });
  return NextResponse.json(result);
 }catch(error){
  return NextResponse.json({error:error instanceof UploadPolicyError?error.message:'Upload request could not be verified.'},{status:error instanceof UploadPolicyError?error.status:400});
 }
}
