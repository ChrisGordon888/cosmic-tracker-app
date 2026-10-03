const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const r=require('../resolvers'),T=require('../models/ReleaseTrack'),W=require('../models/ReleaseWorld'),P=require('../models/CreativeProfile'),A=require('../models/ReleaseAsset');
for (const ownerId of ['creator-a','creator-b']) {
const user={id:ownerId,role:'creator',creatorStatus:'active'};
test(`${ownerId}: Single preparation, save, public filtering and publication leave featured/editorial selections intact`,async()=>{
 const orig=[T.find,T.findOne,T.findOneAndUpdate,W.findOne,W.findOneAndUpdate,P.findOne,A.findOne,A.findOneAndUpdate];
 const w=new W({ownerId:user.id,creativeProfileId:new T()._id,title:'Fictional Single',slug:'fictional-single',coverArtUrl:'/cover.png',visibility:'private',isFeatured:false});
 const track=new T({ownerId:user.id,releaseWorldId:w._id,title:'Song',slug:'song',audioUrl:'/song.wav',playbackStatus:'playable',visibility:'private',isPublic:false,realmId:0});
 const featuredId=new T()._id;const profile={_id:w.creativeProfileId,isPublic:false,isFeatured:true,featuredReleaseWorldId:featuredId,save:async()=>{}};
 w.save=async()=>w;track.save=async()=>{await track.validate();return track;};
 try {
  W.findOne=async q=>q.visibility==='public'&&w.visibility!=='public'?null:w;
  W.findOneAndUpdate=async()=>w;
  P.findOne=async()=>profile;
  A.findOne=()=>({sort:async()=>null});A.findOneAndUpdate=async()=>null;
  T.findOne=async()=>track;
  T.findOneAndUpdate=async(q,update)=>{assert.equal(q.ownerId,user.id);Object.assign(track,update);return track;};
  T.find=q=>({sort:async()=>q.$or ? (q.$or.some(clause=>clause.visibility?.$in?.includes(track.visibility) || (clause.visibility?.$exists===false && track.visibility===undefined && track.isPublic))?[track]:[]) : [track]});
  let readiness=await r.Query.getReleasePublishingReadiness(null,{releaseWorldId:w.id},{user});
  assert.equal(readiness.ready,true);assert.ok(readiness.warnings.some(i=>i.code==='TRACK_PRIVATE'));
  for(const issue of [...readiness.warnings,...readiness.blockingIssues])checkRoute(issue.href);
  const saved=await r.Mutation.updateReleaseTrack(null,{id:track.id,input:{visibility:'public',isPublic:false,playbackStatus:'playable'}},{user});
  assert.equal(saved.visibility,'public');assert.equal(saved.isPublic,true);assert.equal(saved.playbackStatus,'playable');
  readiness=await r.Query.getReleasePublishingReadiness(null,{releaseWorldId:w.id},{user});assert.ok(!readiness.warnings.some(i=>i.code==='TRACK_PRIVATE'));
  assert.deepEqual(await r.Query.getPublicReleaseTracks(null,{releaseWorldId:w.id}),[]);
  const before={showInNexus:track.showInNexus,nexusReviewStatus:track.nexusReviewStatus,nexusRole:track.nexusRole};
  await r.Mutation.publishReleaseWorld(null,{releaseWorldId:w.id},{user});
  assert.equal(w.visibility,'public');assert.equal(w.isFeatured,false);assert.equal(profile.featuredReleaseWorldId,featuredId);
  assert.equal((await r.Query.getPublicReleaseTracks(null,{releaseWorldId:w.id}))[0],track);
  assert.equal(r.ReleaseTrack.audioUrl(track,null,{}),'/song.wav');
  track.visibility='private';track.isPublic=true;
  assert.deepEqual(await r.Query.getPublicReleaseTracks(null,{releaseWorldId:w.id}),[]);
  assert.equal((await r.Query.getReleaseTracks(null,{releaseWorldId:w.id},{user}))[0],track);
  await r.Mutation.dropReleaseWorld(null,{releaseWorldId:w.id},{user});
  assert.equal(w.isFeatured,false);assert.equal(profile.featuredReleaseWorldId,featuredId);assert.equal(profile.isFeatured,true);
  for(const [key,value]of Object.entries(before))assert.equal(track[key],value);
 }finally{[T.find,T.findOne,T.findOneAndUpdate,W.findOne,W.findOneAndUpdate,P.findOne,A.findOne,A.findOneAndUpdate]=orig;}
});
}
function checkRoute(href){if(!href)return;const [route,section]=href.split('#');const normalized=route.replace('/fictional-single/','/[slug]/');assert.ok(fs.existsSync(path.join(__dirname,'../../frontend/src/app',normalized,'page.tsx')),href);if(section)assert.ok(['tracks','assets','portal'].includes(section));}
test('Every readiness destination uses a current route and a supported workspace panel',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../resolvers/index.js'),'utf8').split('async function evaluateReleasePublishingReadiness')[1].split('async function applyPublishedReleaseState')[0];
 for(const match of source.matchAll(/["`]((?:\/creator|\/releases)\/[^"`]+)["`]/g))checkRoute(match[1].replace('${releaseWorld.slug}','fictional-single'));
 assert.ok(!source.includes('/creator/releases/'));
});
