'use client';
import {useState} from 'react';
import {upload} from '@vercel/blob/client';
export default function ArtworkPicker({value,onChange,choices=[],label='Cover artwork',disabled=false,onBusy}:{value:string;onChange:(url:string)=>void;choices?:string[];label?:string;disabled?:boolean;onBusy?:(busy:boolean)=>void}){
 const [uploading,setUploading]=useState(false),[error,setError]=useState('');
 async function send(file:File){
  setError('');
  if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)||file.size>20*1024*1024){setError('Choose a JPG, PNG, WebP or GIF up to 20 MB.');return;}
  setUploading(true);onBusy?.(true);
  try{const ext=({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'} as Record<string,string>)[file.type];const result=await upload(`commerce-images/${crypto.randomUUID()}.${ext}`,file,{access:'public',handleUploadUrl:'/api/upload',contentType:file.type});onChange(result.url);}
  catch{setError('Upload could not be completed. Your existing image is unchanged. Check operator access and staging Blob configuration before retrying.');}
  finally{setUploading(false);onBusy?.(false);}
 }
 return <div className="studio-artwork"><h3>{label}</h3>{value?<img src={value} alt={label+' preview'} referrerPolicy="no-referrer"/>:<div className="offer-art-placeholder">A visual invitation to the work</div>}<p>Upload only approved promotional images. Blob artwork is publicly accessible by URL, including for drafts. Never upload confidential client material.</p><label>Upload image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={disabled||uploading} onChange={e=>{const file=e.target.files?.[0];if(file)void send(file);e.target.value='';}}/></label>{uploading&&<p role="status">Uploading… Save your offering when the image is ready.</p>}{error&&<p role="alert">{error}</p>}{choices.length>0&&<label>Choose existing catalog artwork<select disabled={disabled||uploading} value="" onChange={e=>onChange(e.target.value)}><option value="">Choose an approved catalog image…</option>{[...new Set(choices)].map((url,i)=><option key={url} value={url}>Catalog image {i+1}</option>)}</select></label>}<details><summary>Use an existing public image URL</summary><label>Approved HTTPS image<input type="url" value={value} disabled={disabled||uploading} onChange={e=>onChange(e.target.value)}/></label></details>{value&&<button type="button" disabled={disabled||uploading} onClick={()=>onChange('')}>Remove from offering</button>}</div>;
}
