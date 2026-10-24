const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),React=require('react');
const walk=n=>Array.isArray(n)?n.flatMap(walk):n&&typeof n==='object'?[n,...walk(n.props?.children)]:[];
function load(file,mocks={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:m.exports,URL,require:n=>n.endsWith('.css')?{}:mocks[n]??require(n)});return m.exports;}
const geometry=load('src/lib/orbitGeometry.ts');
test('One, two and eight song centers lie precisely on their declared concentric paths',()=>{for(const count of [1,2,8]){const points=geometry.orbitPositions(count);assert.equal(points.length,count);for(const p of points)assert.ok(Math.abs(Math.hypot(p.x-50,p.y-50)-p.radius)<.00001);assert.equal(new Set(points.map(p=>`${p.x},${p.y}`)).size,count);}});
const tracks=Array.from({length:12},(_,i)=>({id:String(i),trackTitle:`Signal ${i+1}`,trackUrl:`/fiction-${i}.wav`,realmId:0}));
function render(file,list=tracks,current=tracks[0]){const calls=[];const player={currentTrack:current,isPlaying:true,duration:60,currentTime:12,getAudioElement:()=>null,playOrToggleTrack:(...a)=>calls.push(a),seekTo:t=>calls.push(t)};const component=load(file,{'react':{...React,useState:v=>[v,()=>{}],useEffect:()=>{},useRef:()=>({current:null})},'next/link':{default:'a'},'@/lib/releaseSharing':{publicWorldHref:()=>'/world'},'@/lib/orbitGeometry':geometry,'@/lib/resonanceAnalysis':{},'@/hooks/useMusicPlayer':{useMusicPlayer:()=>player}}).default;
return {calls,nodes:walk(component({tracks:list,realmId:'0',realmName:'InterSiddhi',realmIcon:'✦',color:'#fff'}))};}
test('Full Realm pages the visual nodes but audition keeps all twelve tracks in shared queue',()=>{const {nodes,calls}=render('src/components/music/RealmResonance.tsx');assert.equal(nodes.filter(n=>n.props?.className?.startsWith('resonance-node ')).length,8);nodes.find(n=>n.props?.['aria-label']==='Play Signal 2').props.onClick();assert.equal(calls[0][0].id,'1');assert.equal(calls[0][1].length,12);assert.equal(calls[0][2].source,'realm');nodes.find(n=>n.type==='input'&&n.props.type==='range').props.onChange({target:{value:'31'}});assert.equal(calls[1],31);});
test('Sampler adapter preserves editorial sequence, shared state and progress',()=>{
 const Orbit=()=>null;const C=load('src/components/music/NexusRealmSampler.tsx',{'./RealmOrbitCard':{default:Orbit},'@/hooks/useMusicPlayer':{useMusicPlayer:()=>({currentTrack:tracks[8],isPlaying:true})}}).default;
 const list=[tracks[4],tracks[1],tracks[8]],n=C({tracks:list,realmId:'0',realmName:'InterSiddhi',realmIcon:'✦',color:'#fff',progress:40});
 assert.equal(n.type,Orbit);assert.equal(n.props.preserveOrder,true);assert.equal(n.props.flowTracks,list);assert.equal(n.props.currentTrackId,'8');assert.equal(n.props.flowSource,'nexus');assert.equal(n.props.realmRoute,'/realms/0');assert.equal(n.props.progress,40);assert.equal(n.props.isTrackLocked({trackUrl:''}),true);
});
function orbit(list){const calls=[];const C=load('src/components/music/RealmOrbitCard.tsx',{
 react:{...React,useState:v=>[v,()=>{}],useEffect:()=>{},useMemo:f=>f(),useCallback:f=>f},'next/link':{default:'a'},'@/hooks/useMusicPlayer':{useMusicPlayer:()=>({playOrToggleTrack:(...args)=>calls.push(args)})},'@/lib/realmTheme':{getRealmTheme:()=>({accent:'#fff',soft:'#333',border:'#555',glow:'#777'})}
}).default;return{calls,nodes:walk(C({tracks:list,preserveOrder:true,carouselMode:true,realmId:'0',realmName:'InterSiddhi',realmIcon:'✦',realmColor:'#fff',currentTrackId:list[0]?.id,isPlaying:true,onPlayTrack:()=>{},realmRoute:'/realms/0',flowTracks:list,flowSource:'nexus',progress:40}))};}
test('Zero/one/five/nine selections render real nodes, all ordered pills, correct queue and Enter',()=>{
 for(const count of [0,1,2,3,4,5,9]){const list=tracks.slice(0,count).reverse(),{nodes,calls}=orbit(list);
 const pills=nodes.filter(n=>n.type==='button'&&n.props.className?.startsWith('shrink-0'));
 const orbs=nodes.filter(n=>n.type==='button'&&n.props.className==='absolute rounded-full flex items-center justify-center text-[10px]');
 assert.equal(orbs.length,Math.min(5,count));assert.deepEqual(pills.map(n=>n.props.children),list.map(t=>t.trackTitle));
 assert.equal(nodes.find(n=>n.props?.role==='progressbar').props['aria-valuenow'],40);
 const link=nodes.find(n=>n.props?.href==='/realms/0');assert.ok(link);assert.ok(!walk(link.props.children).some(n=>n.type==='button'));
 if(count){pills[count-1].props.onClick();assert.equal(calls[0][0].id,list[count-1].id);assert.deepEqual(calls[0][1],list);assert.equal(calls[0][2].source,'nexus');orbs[0].props.onClick();assert.equal(calls[1][0].id,list[0].id);}
 else assert.ok(nodes.some(n=>n.type==='button'&&n.props.disabled===true));
 }
});
test('Sampler source and Worlds remain; console soundtrack precedes discovery',()=>{
 const page=fs.readFileSync('src/app/nexus/page.tsx','utf8');assert.match(page,/samplerOnly: true/);assert.match(page,/<PublicWorlds selectedOnly \/>/);
 const admin=fs.readFileSync('src/components/admin/EditorialPlacementControls.tsx','utf8');assert.ok(admin.indexOf('<div><p>Official soundtrack:')<admin.indexOf('<div><p>Realm discovery:'));
});

test('Uncapped ordered pills survive missing measurements and bounded orbit at 1/5/9/30/100',()=>{
 for(const count of [1,5,9,30,100]){
  const list=Array.from({length:count},(_,i)=>({...tracks[0],id:String(i),trackTitle:`Signal ${i+1}`}));
  const {nodes,calls}=render('src/components/music/RealmResonance.tsx',list,list[0]);
  const path=nodes.find(n=>n.props?.['aria-label']==='Ordered soundtrack songs');
  const pills=walk(path).filter(n=>n.type==='button');assert.equal(pills.length,count);
  assert.equal(nodes.filter(n=>n.props?.className?.startsWith('resonance-node ')).length,Math.min(count,8));
  pills.at(-1).props.onClick();assert.equal(calls[0][0].id,String(count-1));assert.equal(calls[0][1].length,count);
  assert.ok(nodes.some(n=>n.type==='details'&&!n.props.open));
 }
});
test('Actual editorial console component orders both selection and stored soundtrack first',()=>{
 const s=fs.readFileSync('src/components/admin/RealmSelections.tsx','utf8');
 assert.ok(s.indexOf('Select official soundtrack')<s.indexOf('Discovery Realm'));
 assert.ok(s.indexOf('Stored soundtrack placements')<s.indexOf('Stored discovery placements'));
});
test('Only known public Blob delivery requests anonymous CORS, before src assignment',()=>{
 const {setPlayerMediaSource}=load('src/lib/playerMediaSource.ts');
 const calls=[];const audio={set crossOrigin(v){calls.push(v)},removeAttribute:n=>calls.push(n),set src(v){calls.push(v)}};
 setPlayerMediaSource(audio,'https://fixture.public.blob.vercel-storage.com/song.mp3');
 assert.equal(calls[0],'anonymous');
 for(const url of ['/song.wav','https://elsewhere.example/song.mp3','https://fixture.private.blob.vercel-storage.com/song.mp3']){calls.length=0;setPlayerMediaSource(audio,url);assert.deepEqual(calls,['crossorigin',url]);}
});
