const { publicCatalogFilter } = require('./trackVault');
const publicWorldFilter = { visibility: 'public', publicCanon: true, status: { $ne: 'archived' } };
function projectTrackFilter(world) {
 return { ownerId: world.ownerId, releaseWorldId: world._id, ...publicCatalogFilter, status: { $ne:'archived' }, $or:[{visibility:{$in:['public','listed']}},{visibility:{$exists:false},isPublic:true}] };
}
function projectRealm(tracks) {
 const focus=tracks.find(t=>t.isFocusTrack&&t.realmId!=null);
 if(focus)return focus.realmId;
 const realms=[...new Set(tracks.map(t=>t.realmId).filter(r=>r!=null))];
 return realms.length===1?realms[0]:null;
}
module.exports={publicWorldFilter,projectTrackFilter,projectRealm};
