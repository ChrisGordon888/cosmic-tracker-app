import {youtubeEmbed} from './worldProof';
export type CreativeMedia={_id?:string;revision?:number;slug:string;title:string;description:string;url:string;thumbnail:string;topic:string;order:number;status:string;worldId:string;trackId:string;offerSlug:string;service:string;links?:{label:string;href:string}[]};
export const blankMedia:CreativeMedia={slug:'',title:'',description:'',url:'',thumbnail:'',topic:'',order:0,status:'draft',worldId:'',trackId:'',offerSlug:'',service:''};
export function mediaSource(value:string){
 const video=youtubeEmbed(value);if(video)return {provider:'YouTube',embed:video};
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port)return null;
 if(['youtube.com','www.youtube.com'].includes(u.hostname)&&u.pathname==='/playlist'&&/^[\w-]{10,100}$/.test(u.searchParams.get('list')||''))return {provider:'YouTube',embed:`https://www.youtube-nocookie.com/embed/videoseries?list=${u.searchParams.get('list')}`};
 if(['instagram.com','www.instagram.com'].includes(u.hostname)&&/^\/(p|reel)\/[\w-]+\/?$/.test(u.pathname))return {provider:'Instagram',embed:null};
 }catch{}return null;
}
