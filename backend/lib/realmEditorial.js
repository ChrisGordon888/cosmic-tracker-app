const REALMS = [303,202,101,55,44,0];
const ownerEligibility = { creatorStatus: { $ne: 'suspended' }, $or: [{role:{$in:['owner','admin']}},{role:'creator',creatorStatus:'active'}] };
const publicWorld = {visibility:'public',status:{$ne:'archived'}};
const publicTrack = {status:{$ne:'archived'},catalogTreatment:{$nin:['vault','test']},visibility:{$in:['public','listed']}};
function soundtrackMatches(track, selections) {
 return selections.some(s=>String(s.trackId)===String(track._id)&&String(s.worldId)===String(track.releaseWorldId)&&s.realmId===track.realmId);
}
module.exports={REALMS,ownerEligibility,publicWorld,publicTrack,soundtrackMatches};
