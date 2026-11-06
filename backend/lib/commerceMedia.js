const {https,fail,destination}=require('./commerceCatalog');
function source(value){
 const u=https(value);let id;
 if(['youtube.com','www.youtube.com','m.youtube.com','youtu.be'].includes(u.hostname)){
  const list=u.searchParams.get('list');
  id=u.hostname==='youtu.be'?u.pathname.slice(1):u.pathname==='/watch'?u.searchParams.get('v'):/^\/(shorts|embed)\/([\w-]+)$/.exec(u.pathname)?.[2];
  if(id&&/^[\w-]{11}$/.test(id))return {url:`https://www.youtube.com/watch?v=${id}`,provider:'YouTube',embed:`https://www.youtube-nocookie.com/embed/${id}`};
  if(list&&/^[\w-]{10,100}$/.test(list)&&u.pathname==='/playlist')return {url:`https://www.youtube.com/playlist?list=${list}`,provider:'YouTube',embed:`https://www.youtube-nocookie.com/embed/videoseries?list=${list}`};
 }
 if(['instagram.com','www.instagram.com'].includes(u.hostname)&&/^\/(p|reel)\/[\w-]+\/?$/.test(u.pathname))return {url:`https://www.instagram.com${u.pathname.replace(/\/$/,'')}/`,provider:'Instagram',embed:null};
 fail('Use a YouTube video/playlist or an Instagram post/Reel URL.');
}
function input(body){
 const out={};for(const [k,max] of Object.entries({slug:80,title:160,description:4000,url:2000,thumbnail:2000,topic:80,worldId:24,trackId:24,offerSlug:80,service:80})){
  const v=body[k]??'';if(typeof v!=='string'||v.length>max)fail(`Invalid ${k}.`);out[k]=v.trim();
 }
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(out.slug)||!out.title)fail('Add a title and lowercase hyphenated page address.');
 if(out.url)out.url=source(out.url).url;
 if(out.thumbnail)out.thumbnail=https(out.thumbnail).href;
 for(const k of ['worldId','trackId'])if(out[k]&&!/^[a-f\d]{24}$/.test(out[k]))fail('Choose a valid related item.');
 if(out.offerSlug&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(out.offerSlug))fail('Choose a valid offering.');
 if(out.service)destination('cosmic_service',`/services/inquire?offer=${out.service}`);
 out.order=Number(body.order??0);if(!Number.isInteger(out.order)||out.order<0||out.order>9999)fail('Order must be 0–9999.');
 if(!['draft','published'].includes(body.status))fail('Choose draft or published.');out.status=body.status;
 if(out.status==='published'&&(!out.url||!out.description))fail('A supported media URL and description are required to publish.');return out;
}
function presentation(row,links=[]){return {slug:row.slug,title:row.title,description:row.description,thumbnail:row.thumbnail,topic:row.topic,order:row.order,...(row.url?source(row.url):{url:'',provider:'Media',embed:null}),links};}
module.exports={source,input,presentation};
