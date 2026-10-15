// One-time historical migration plan. Never imported by public discovery.
const candidates = require('../migrations/curatedWorlds.v1.json');
const { projectRealm } = require('./publicProjects');
const PUBLIC_RESTORATION_IDS = [candidates[0].id,candidates[3].id,candidates[4].id,candidates[5].id];
const identity = value => String(value || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]/g, '');
function planMigration({ownerId,profileId,profiles,worlds,tracks,artworkExists,publicRestoration=false}) {
  if (!ownerId) throw new Error('Explicit ownerId required.');
  const profile = profiles.find(p=>String(p._id)===String(profileId)&&p.ownerId===ownerId);
  return candidates.map(candidate=>{
    const issues=[];
    if(publicRestoration&&!PUBLIC_RESTORATION_IDS.includes(candidate.id))issues.push("Not authorized for public restoration.");
    const ownedWorlds=worlds.filter(w=>w.ownerId===ownerId);
    const existing=ownedWorlds.filter(w=>identity(w.title)===identity(candidate.title)||w.slug===candidate.id);
    if(existing.length) return {candidate,status:existing.length===1?'exists':'skip',worldId:existing.length===1?String(existing[0]._id):null,issues:existing.length===1?['Existing intentional identity; left unchanged.']:['Multiple matching Worlds; resolve manually.']};
    if(!profile) issues.push('An explicit owned creative profile is required.');
    const matched=candidate.trackIds.map(id=>{
      const matches=tracks.filter(t=>t.ownerId===ownerId&&t.legacyRegistryId===id);
      if(matches.length!==1){issues.push(`${id}: ${matches.length} exact owner matches; no title/file guessing.`);return null;}
      const track=matches[0];
      if(track.releaseWorldId)issues.push(`${id}: already linked to World ${track.releaseWorldId}; will not detach or duplicate.`);
      // Restored Worlds are private. A public child acquires its parent's
      // visibility gate when attached, even if none of its own flags change.
      if(!publicRestoration&&(['public','listed'].includes(track.visibility)||track.isPublic===true))
        issues.push(`${id}: private restoration would restrict public track availability; publication decision required.`);
      else if(!['private','public','listed'].includes(track.visibility))
        issues.push(`${id}: unknown visibility; cannot prove private restoration preserves access.`);
      return track;
    });
    if(!artworkExists(candidate.artworkUrl))issues.push(`Artwork unavailable: ${candidate.artworkUrl}`);
    const resolved=matched.filter(Boolean);
    if(resolved.length===candidate.trackIds.length&&projectRealm(resolved)!==candidate.realmId)issues.push('Current canonical track Realm/focus does not derive the historical Realm.');
    return {candidate,status:issues.length?'skip':'ready',issues,trackIds:resolved.map(t=>String(t._id)),tracks:resolved,publicRestoration};
  });
}
function worldDocument(plan,ownerId,profileId,now) {
  if(plan.status!=='ready')throw new Error('Only a safe ready plan can create a World.');
  return {ownerId,creativeProfileId:profileId,title:plan.candidate.title,slug:plan.candidate.id,releaseType:'ep',status:'draft',visibility:plan.publicRestoration?'public':'private',publicCanon:false,isFeatured:false,oneLineSummary:plan.candidate.description,story:plan.candidate.story,coverArtUrl:plan.candidate.artworkUrl,coverAssetId:null,currentFocus:'',secondFocus:'',fullDropDate:null,lastOpenedAt:now,createdAt:now,updatedAt:now,theme:{primaryColor:'#7ed3ff',accentColor:'#f3e7d1',boardDefaultColor:'cream',backgroundMode:'cosmic-dark',typographyMode:'editorial'}};
}
function assertLocalApply(uri,database) {
  const local=/^mongodb:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?\//.test(uri||'');
  if(!local||!/(?:^|[_-])(dev|development|local|test)(?:$|[_-])/i.test(database||''))throw new Error('Apply is restricted to loopback MongoDB and an explicitly named dev/local/test database. Remote/production writes are prohibited.');
}
module.exports={planMigration,worldDocument,assertLocalApply,PUBLIC_RESTORATION_IDS};
