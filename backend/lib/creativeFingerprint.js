const signals = ['powerful','defiant','hazy','nostalgic','romantic','reflective','playful','peaceful','driving','floating','groovy','still','dark','dreamy','raw','bright','intimate','breakthrough','memory','love','escape','ambition','loyalty','exchange','authenticity','awareness'];
const realms=[303,202,101,55,44,0];
function realmDecision(input, realmId, track) {
  if(!realms.includes(realmId) || !['accepted','overridden','manual'].includes(input.action) || (input.suggestedRealmId!=null&&!realms.includes(input.suggestedRealmId))) throw new Error('Invalid creative Realm decision.');
  if(input.action==='accepted' && input.suggestedRealmId!==realmId) throw new Error('Accepted Realm must match the suggestion.');
  if(input.action==='overridden' && (input.suggestedRealmId==null||input.suggestedRealmId===realmId)) throw new Error('Override must choose a different Realm.');
  return {realmId,suggestedRealmId:input.suggestedRealmId??null,action:input.action,engineVersion:'fingerprint-v2.1',signals:[...(track.creativeSignals||[])],at:new Date()};
}
module.exports={signals,realmDecision};
