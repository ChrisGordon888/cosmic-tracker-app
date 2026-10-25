const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),React=require('react');
function load(file,mocks={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:m.exports,require:n=>n.endsWith('.css')?{}:mocks[n]??require(n)});return m.exports;}
const geom=load('src/lib/orbitStageGeometry.ts');
const walk=n=>Array.isArray(n)?n.flatMap(walk):n&&typeof n==='object'?[n,...walk(n.props?.children)]:[];
test('Projected centers stay bounded, unique and attached to the center through a full revolution',()=>{
 for(const count of [0,1,5,9,30,100])for(let phase=0;phase<7;phase+=.2){const points=geom.chamberPositions(count,phase);assert.equal(points.length,Math.min(count,8));assert.equal(new Set(points.map(p=>`${p.x},${p.y}`)).size,points.length);for(const p of points){assert.ok(p.x>=13&&p.x<=87&&p.y>=16&&p.y<=80);assert.match(geom.chamberConnection(p.x,p.y),/^M 50 48 Q /);assert.ok(p.scale>=.88&&p.scale<=1);}}
});
test('Stage exposes only real songs, forwards selection, preserves disabled controls and static mode',()=>{
 const C=load('src/components/music/OrbitStage.tsx',{react:{...React,useEffect:()=>{},useRef:v=>({current:v}),useState:v=>[v,()=>{}]},'@/lib/orbitStageGeometry':geom,'@/lib/realmHeartRenderer':{}}).default;
 for(const count of [0,1,5,9,30,100]){const calls=[],tracks=Array.from({length:count},(_,i)=>({id:String(i),trackTitle:`Song ${i}`,trackUrl:i===1?'':'/tone.wav'}));const tree=walk(C({tracks,selectedId:'0',playingId:'0',realmName:'Fixture',realmIcon:'✦',color:'#fff',reduced:true,measurement:{current:{energy:0,high:0}},onChoose:t=>calls.push(t),isTrackLocked:()=>false}));const buttons=tree.filter(n=>n.type==='button'&&n.props.className.startsWith('chamber-song '));assert.equal(buttons.length,Math.min(count,8));if(count){assert.equal(buttons[0].props['aria-label'],'Pause Song 0');buttons[0].props.onClick();assert.equal(calls[0],tracks[0]);}if(count>1)assert.equal(buttons[1].props.disabled,true);assert.equal(tree.find(n=>n.props?.className==='chamber-motion').props.disabled,true);}
});
test('GPU absence and shader failure return a CSS fallback and clean created resources',()=>{
 const {createRealmHeart}=load('src/lib/realmHeartRenderer.ts');assert.equal(createRealmHeart({getContext:()=>null},[1,0,0]),null);
 let removed=0;const gl={VERTEX_SHADER:1,createShader:()=>({}),shaderSource(){},compileShader(){},getShaderParameter:()=>false,deleteShader:()=>removed++};assert.equal(createRealmHeart({getContext:()=>gl},[1,0,0]),null);assert.equal(removed,1);
});
test('Stage teardown cancels animation, disconnects observer and removes listeners',()=>{
 const effects=[],callbacks=new Map(),cancelled=[];let disconnected=0;
 const root={dataset:{},style:{setProperty(){}},contains:()=>false};
 const canvas={getContext:()=>null,addEventListener:(k,v)=>callbacks.set(k,v),removeEventListener:k=>callbacks.delete(k)};
 const m={exports:{}};
 const imports={react:{...React,useEffect:f=>effects.push(f),useRef:v=>({current:v}),useState:v=>[v,()=>{}]},'@/lib/orbitStageGeometry':geom,'@/lib/realmHeartRenderer':{createRealmHeart:()=>null},'./orbitStage.css':{}};
 const doc={hidden:false,addEventListener:(k,v)=>callbacks.set(k,v),removeEventListener:k=>callbacks.delete(k)};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/music/OrbitStage.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:m.exports,require:n=>imports[n]??require(n),window:{innerWidth:390},document:doc,getComputedStyle:()=>({color:'rgb(255,0,0)'}),performance:{now:()=>1},requestAnimationFrame:()=>9,cancelAnimationFrame:id=>cancelled.push(id),IntersectionObserver:class{observe(){}disconnect(){disconnected++}}});
 const tree=walk(m.exports.default({tracks:[],realmName:'Fixture',realmIcon:'✦',color:'#fff',reduced:false,measurement:{current:{energy:0,high:0}},onChoose(){},isTrackLocked:()=>false}));
 tree.find(n=>n.props?.className==='orbit-chamber').props.ref.current=root;
 tree.find(n=>n.type==='canvas').props.ref.current=canvas;
 effects[0]();const cleanup=effects[1]();assert.equal(root.dataset.renderer,'css');assert.equal(callbacks.size,3);cleanup();assert.equal(callbacks.size,0);assert.equal(disconnected,1);assert.ok(cancelled.includes(9));
});
