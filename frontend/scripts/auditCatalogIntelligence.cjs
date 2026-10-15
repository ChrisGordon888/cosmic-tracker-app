// Read-only: no model imports, writes, migrations, or full document export.
const path=require('node:path'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'../..');
require(path.join(root,'backend/node_modules/dotenv')).config({path:path.join(root,'backend/.env')});
const mongoose=require(path.join(root,'backend/node_modules/mongoose'));
function load(name){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(path.join(root,'frontend/src/lib',name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(`(function(require,module,exports){${code}})`)(n=>load(n.replace('./','')),m,m.exports);return m.exports;}
(async()=>{
 try{
  await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:7000,autoIndex:false,autoCreate:false});
  const records=await mongoose.connection.db.collection('releasetracks').find({}, {projection:{ownerId:1,realmId:1,creativeSignals:1,creativeDecisions:1,mood:1,hook:1,notes:1,bpm:1,keySignature:1,releaseWorldId:1,realmFinderSignals:1,status:1,catalogTreatment:1}}).toArray();
  const {analyzeCatalog}=load('catalogIntelligence');
  const reports=[...new Set(records.map(r=>r.ownerId))].map((owner,index)=>{
    const tracks=records.filter(r=>r.ownerId===owner).sort((a,b)=>String(a._id).localeCompare(String(b._id))).map((r,i)=>({...r,id:`song-${String(i+1).padStart(4,'0')}`}));
    const result=analyzeCatalog(tracks,owner);
    const {ownerId,edges,...safe}=result;
    return {scope:`owner-${index+1}`,...safe,edgeCount:edges.length,examples:edges.slice(0,8).map(({score,...edge})=>edge)};
  });
  console.log(JSON.stringify({readOnly:true,totalRecords:records.length,ownerCount:reports.length,reports},null,2));
 }catch(error){console.error('Read-only Catalog Intelligence audit unavailable:',error.code||error.name);process.exitCode=1;}finally{await mongoose.disconnect();}
})();
