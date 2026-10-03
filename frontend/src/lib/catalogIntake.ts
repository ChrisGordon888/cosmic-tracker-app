export type IntakeIdentity = {id:string;title:string;audioContentHash?:string|null;fileName?:string|null;audioUrl?:string|null};
export const fileIdentity = (file: Pick<File,'name'|'size'|'lastModified'>) => `${file.name}:${file.size}:${file.lastModified}`;
export const intakeSignature = (files: File[]) => files.map(fileIdentity).join('|');
export async function contentHash(bytes:ArrayBuffer) {
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
export function versionStem(value:string) {
 return value.toLowerCase().replace(/\.(mp3|wav|flac|m4a|aac|mp4)$/,'').replace(/\([a-g][#b]?(min|maj)\s+\d{2,3}\)$/,'').replace(/(?:[\s_\-]+(?:v\d+|version\s*\d+|mix\s*\d*|master\s*\d*|demo|final))+$/,'').replace(/[_\-]+/g,' ').replace(/\s+/g,' ').trim();
}
export function compareIntake(a:IntakeIdentity,b:IntakeIdentity): 'exact'|'possible'|null {
 if(a.id===b.id)return null;
 if(a.audioContentHash && b.audioContentHash && a.audioContentHash===b.audioContentHash)return 'exact';
 const stem=versionStem(a.fileName||a.title), other=versionStem(b.fileName||b.title);
 return stem.length>=3 && stem===other?'possible':null;
}
export type IntakeDecision='keep-a'|'keep-b'|'both';
export function excludedIncoming(pairs:{id:string;a:IntakeIdentity;b:IntakeIdentity}[], decisions:Record<string,IntakeDecision>, incomingIds:Set<string>) {
 const excluded=new Set<string>();
 for(const pair of pairs){const drop=decisions[pair.id]==='keep-a'?pair.b.id:decisions[pair.id]==='keep-b'?pair.a.id:null;if(drop&&incomingIds.has(drop))excluded.add(drop);}
 return [...excluded];
}
export type IntakeApproval={signature:string;hashes:Record<string,string>;excluded:string[];ready:boolean};
