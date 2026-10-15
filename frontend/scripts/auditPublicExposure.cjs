// Read-only aggregate audit; no models, writes, private titles or media URLs exported.
const path=require('node:path');const root=path.resolve(__dirname,'../..');
require(path.join(root,'backend/node_modules/dotenv')).config({path:path.join(root,'backend/.env')});
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const registryModule={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'frontend/src/lib/musicRegistry.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:registryModule.exports});
const registryIds=new Set(registryModule.exports.MUSIC_REGISTRY.map(t=>t.id));
const mongoose=require(path.join(root,'backend/node_modules/mongoose'));
(async()=>{try{await mongoose.connect(process.env.MONGODB_URI,{autoIndex:false,autoCreate:false,serverSelectionTimeoutMS:7000});
const db=mongoose.connection.db;
const tracks=await db.collection('releasetracks').find({},{projection:{ownerId:1,visibility:1,isPublic:1,publicCanon:1,showInNexus:1,nexusReviewStatus:1,releaseWorldId:1,status:1,catalogTreatment:1,legacyRegistryId:1,realmId:1,playbackStatus:1,audioUrl:1,previewAudioUrl:1,accessTier:1}}).toArray();
const worlds=await db.collection('releaseworlds').find({},{projection:{ownerId:1,visibility:1,status:1}}).toArray();
console.log(JSON.stringify([...new Set(tracks.map(t=>t.ownerId))].map((owner,i)=>{const rows=tracks.filter(t=>t.ownerId===owner),count=f=>rows.filter(f).length;
const protectedTrack=t=>['vault','test'].includes(t.catalogTreatment)||t.status==='archived';
const shareable=t=>!protectedTrack(t)&&(['public','listed'].includes(t.visibility)||(t.visibility==null&&t.isPublic===true));
const world=t=>worlds.some(w=>String(w._id)===String(t.releaseWorldId)&&w.ownerId===owner&&w.visibility==='public'&&w.status!=='archived');
const nexus=t=>shareable(t)&&world(t)&&t.showInNexus&&t.realmId!=null&&['preview','playable','coming-soon'].includes(t.playbackStatus)&&Boolean(t.audioUrl||t.previewAudioUrl||t.playbackStatus==='coming-soon');
return {owner:`owner-${i+1}`,total:rows.length,public:count(t=>t.visibility==='public'),listed:count(t=>t.visibility==='listed'),private:count(t=>t.visibility==='private'),legacy:count(t=>t.visibility==null),canon:count(t=>t.publicCanon===true),nexusPublished:count(t=>t.nexusReviewStatus==='published'),nexusSubmitted:count(t=>t.nexusReviewStatus==='in-review'),associated:count(t=>Boolean(t.releaseWorldId)),standalone:count(t=>!t.releaseWorldId),publicProjectExposure:count(t=>shareable(t)&&world(t)),nexusDiscoveryEligible:count(nexus),legacyRegistryLinked:count(t=>registryIds.has(t.legacyRegistryId)&&!protectedTrack(t)),publicRepresentationUnion:count(t=>(shareable(t)&&world(t))||(!protectedTrack(t)&&registryIds.has(t.legacyRegistryId))),directLinkOnly:count(t=>shareable(t)&&world(t)&&!nexus(t)&&!t.legacyRegistryId),listedInPublicWorld:count(t=>shareable(t)&&world(t)&&t.visibility==='listed'),sandbox:count(t=>t.catalogTreatment==='test'),archived:count(t=>t.status==='archived'),worlds:worlds.filter(w=>w.ownerId===owner).map(w=>({visibility:w.visibility,status:w.status}))};}),null,2));
}catch(e){console.error(e.code||e.name);process.exitCode=1;}finally{await mongoose.disconnect();}})();
