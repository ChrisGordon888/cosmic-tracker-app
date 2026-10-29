const {createHash}=require('node:crypto');
function isAttribution(a){return ['credit','process'].includes(String(a.eyebrow||'').trim().toLowerCase());}
function fingerprint(a){return createHash('sha256').update(JSON.stringify(['eyebrow','title','body','meta','href','connectedTrackSlug'].map(k=>k==='title'?String(a[k]||'').trim():String(a[k]||'')))).digest('hex');}
function consented(a){return Boolean(a.consentRecordedAt&&a.consentFingerprint===fingerprint(a));}
function publicArtifact(a){return a.isPublic&&(!isAttribution(a)||consented(a));}
function consentForSave(a,previous,now=new Date()){
 if(!isAttribution(a))return {consentFingerprint:'',consentRecordedAt:null};
 const retained=previous&&consented(previous)&&fingerprint(previous)===fingerprint(a);
 const confirmed=a.confirmConsent===true||(!a.withdrawConsent&&retained);
 if(a.isPublic&&!confirmed)throw Error('Record permission for this exact credit or process material before publishing.');
 return {consentFingerprint:confirmed?fingerprint(a):'',consentRecordedAt:confirmed?(retained?previous.consentRecordedAt:now):null};
}
module.exports={isAttribution,consented,publicArtifact,consentForSave};
