const W=require('../models/ReleaseWorld'),T=require('../models/ReleaseTrack');
const {publicWorld,publicTrack}=require('./realmEditorial');
// Read-only predicates; never invoke a public resolver or scheduled publication.
async function candidates(ownerId){
 const worlds=await W.find({ownerId,...publicWorld}).select('_id title slug').lean();
 const tracks=await T.find({ownerId,...publicTrack}).select('_id title releaseWorldId').lean();
 const validTracks=tracks.filter(t=>!t.releaseWorldId||worlds.some(w=>String(w._id)===String(t.releaseWorldId)));
 return {worlds:worlds.map(w=>({id:String(w._id),title:w.title,href:`/releases/${encodeURIComponent(w.slug)}?world=${w._id}`})),tracks:validTracks.map(t=>({id:String(t._id),title:t.title,href:`/listen/${t._id}`}))};
}
function links(row,available,offers){
 const result=[];
 for(const [key,list] of [['worldId',available.worlds],['trackId',available.tracks]]){const found=list.find(x=>x.id===row[key]);if(found)result.push({label:found.title,href:found.href});}
 const offer=offers.find(o=>o.slug===row.offerSlug);if(offer)result.push({label:offer.title,href:`/shop/${offer.slug}`});
 if(row.service)result.push({label:'Discuss this creative work',href:`/services/inquire?offer=${encodeURIComponent(row.service)}`});
 return result;
}
module.exports={candidates,links};
