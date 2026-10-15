// Read-only: no model imports, writes, migrations, or full document export.
const path=require('node:path'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'../..');
require(path.join(root,'backend/node_modules/dotenv')).config({path:path.join(root,'backend/.env')});
const mongoose=require(path.join(root,'backend/node_modules/mongoose'));
function load(name){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(path.join(root,'frontend/src/lib',name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(`(function(require,module,exports){${code}})`)(n=>load(n.replace('./','')),m,m.exports);return m.exports;}
(async()=>{
 try{
  await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:7000,autoIndex:false,autoCreate:false});
  const records=await mongoose.connection.db.collection('releasetracks').find({}, {projection:{ownerId:1,realmId:1,creativeSignals:1,creativeDecisions:1,mood:1,hook:1,notes:1,bpm:1,keySignature:1,releaseWorldId:1,realmFinderSignals:1,status:1}}).toArray();
  const {fingerprint,scanCatalog}=load('creativeFingerprint');
  const reports=[...new Set(records.map(r=>r.ownerId))].map((owner,index)=>{
   const tracks=records.filter(r=>r.ownerId===owner).map(r=>({...r,id:String(r._id)}));const scan=scanCatalog(tracks);
   const distribution={},tags={};for(const t of tracks){distribution[t.realmId??'undecided']=(distribution[t.realmId??'undecided']||0)+1;for(const e of fingerprint(t).evidence)tags[e.signal]=(tags[e.signal]||0)+1;}
   const bands=['Strong fit','Good fit','Mixed','Low evidence','Insufficient evidence'];
   const strong=row=>['Strong fit','Good fit'].includes(row.result.strength);
   const withoutTags=scanCatalog(tracks.map(t=>({...t,creativeSignals:[],creativeDecisions:[]})));
   const usefulSignalCount=scan.filter(r=>r.result.fingerprint.evidence.length>=2).length;
   const paired=tracks.filter(t=>{
     const own=fingerprint(t).evidence.map(e=>e.signal);
     return own.length>=2&&tracks.some(other=>other.id!==t.id&&other.status!=='archived'&&fingerprint(other).evidence.filter(e=>own.includes(e.signal)).length>=2);
   }).length;
   return {
     scope:`local-owner-${index+1}`,total:tracks.length,
     withRealm:tracks.filter(t=>t.realmId!=null).length,withoutRealm:tracks.filter(t=>t.realmId==null).length,
     withExplicitCreatorTags:tracks.filter(t=>t.creativeSignals?.length).length,
     withUsefulSignals:usefulSignalCount,lackingUsefulSignals:tracks.length-usefulSignalCount,
     noSignals:scan.filter(r=>r.result.fingerprint.evidence.length===0).length,
     usefulRealmSuggestions:scan.filter(strong).length,
     confidenceBands:Object.fromEntries(bands.map(b=>[b,scan.filter(r=>r.result.strength===b).length])),
     creatorReviewOpportunities:scan.filter(r=>r.track.realmId!=null&&r.result.home!==null&&r.track.realmId!==r.result.home).length,
     supportedCreatorReviewOpportunities:scan.filter(r=>strong(r)&&r.track.realmId!=null&&r.track.realmId!==r.result.home).length,
     realmDistribution:distribution,signalDistribution:tags,
     enoughForMultiSignalSimilarity:usefulSignalCount,withActualMultiSignalPartner:paired,
     quickTaggingRecommended:scan.filter(r=>['Low evidence','Insufficient evidence'].includes(r.result.strength)).length,
     bpmKeyOnly:scan.filter(r=>r.result.fingerprint.evidence.length===0&&(r.track.bpm||r.track.keySignature?.trim())).length,
     explicitTagsImproveConfidence:scan.filter((r,i)=>strong(r)&&!strong(withoutTags[i])).length,
     explicitTagsChangeInterpretation:scan.filter((r,i)=>r.result.home!==withoutTags[i].result.home).length
   };
  });console.log(JSON.stringify({readOnly:true,totalTracks:records.length,ownerCount:reports.length,scope:'Configured database; owners separated; no titles or raw private text exported',reports},null,2));
 }catch(error){console.error('Read-only catalog audit unavailable:',error.code||error.name);process.exitCode=1;}finally{await mongoose.disconnect();}
})();
