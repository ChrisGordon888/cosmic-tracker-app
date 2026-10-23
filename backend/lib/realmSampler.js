const {REALMS}=require('./realmEditorial');
function validateSampler(realmId, ids, eligible) {
 if(!REALMS.includes(realmId))throw new Error('Choose a valid Realm.');
 if(!Array.isArray(ids)||ids.length>9)throw new Error('A Nexus Realm sampler holds at most nine tracks.');
 const ordered=ids.map(String);
 if(new Set(ordered).size!==ordered.length)throw new Error('Sampler tracks must be unique.');
 const allowed=new Set(eligible.filter(t=>t.realmId===realmId).map(t=>String(t._id)));
 if(ordered.some(id=>!allowed.has(id)))throw new Error('Select only eligible main soundtrack tracks in this Realm.');
 return ordered;
}
function samplerIds(config,realmId) {
 return (config?.nexusRealmSamplers||[]).filter(s=>realmId==null||s.realmId===realmId).flatMap(s=>s.trackIds.map(String));
}
module.exports={validateSampler,samplerIds};
