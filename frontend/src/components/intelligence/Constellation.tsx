'use client';
import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, type NodeProps } from '@xyflow/react';
import { constellationGraph, type Workbench } from '@/lib/intelligenceWorkbench';
import { realmName } from '@/lib/creativeFingerprint';
function SongNode({data}:NodeProps){return <div className="intelligence-star"><Handle type="target" position={Position.Left}/><span aria-hidden="true">✦</span><strong>{String(data.label)}</strong><small>{String(data.realm)}</small><Handle type="source" position={Position.Right}/></div>;}
const nodeTypes={song:SongNode};
export default function Constellation({analysis,selectedId,worldId,onSelect}:{analysis:Workbench;selectedId:string;worldId:string;onSelect:(id:string)=>void}){
 const [wide,setWide]=useState(false);
 useEffect(()=>{const query=window.matchMedia('(min-width: 641px)');const update=()=>setWide(query.matches);update();query.addEventListener('change',update);return ()=>query.removeEventListener('change',update);},[]);
 const [realm,setRealm]=useState('all'),[onlyWorld,setOnlyWorld]=useState(false),[canonOnly,setCanonOnly]=useState(false),[edgeId,setEdgeId]=useState('');
 const graph=useMemo(()=>constellationGraph(analysis,{realm,worldId:onlyWorld?worldId:undefined,canonOnly}),[analysis,realm,worldId,onlyWorld,canonOnly]);
 const neighbors=new Set(graph.edges.filter(e=>e.a===selectedId||e.b===selectedId).flatMap(e=>[e.a,e.b]));
 const worldMembers=new Set(analysis.projects.find(p=>p.world.id===worldId)?.members.map(s=>s.trackId)??[]);
 const nodes=graph.nodes.map(n=>({id:n.id,type:'song',position:{x:n.x,y:n.y},data:{label:n.title,realm:n.realmId==null?'Undecided':realmName(n.realmId)},selected:n.id===selectedId,className:`${neighbors.has(n.id)?'is-neighbor':''} ${worldMembers.has(n.id)?'in-project':''}`}));
 const edges=graph.edges.map(e=>({id:`${e.a}|${e.b}`,source:e.a,target:e.b,style:{stroke:neighbors.has(e.a)&&neighbors.has(e.b)?'#dcba5c':'#71849a',strokeWidth:e.strong?2.5:1,strokeDasharray:e.strong?undefined:'5 5',opacity:.65},ariaLabel:`Relationship: ${graph.nodes.find(n=>n.id===e.a)?.title} and ${graph.nodes.find(n=>n.id===e.b)?.title}`}));
 const selectedEdge=graph.edges.find(e=>`${e.a}|${e.b}`===edgeId);
 return <section className="intelligence-panel" aria-label="Constellation"><div className="intelligence-section-title"><div><p className="intelligence-eyebrow">Constellation</p><h2>Connections, not conclusions.</h2></div><span>{graph.nodes.length} of {graph.total} songs</span></div>
 <p>Each neighborhood follows your assigned Realm. Lines show shared signals, not sound similarity. Solid lines have stronger evidence. Outlined songs belong to the selected project.</p>
 <div className="intelligence-controls"><label>Realm<select value={realm} onChange={e=>setRealm(e.target.value)}><option value="all">All Realms</option>{[303,202,101,55,44,0].map(r=><option key={r} value={r}>{realmName(r)}</option>)}<option value="unknown">Undecided</option></select></label><label><input type="checkbox" checked={onlyWorld} disabled={!worldId} onChange={e=>setOnlyWorld(e.target.checked)}/>Selected project only</label><label><input type="checkbox" checked={canonOnly} onChange={e=>setCanonOnly(e.target.checked)}/>Public Canon songs only</label></div>
 {graph.nodes.length?<>{wide&&<div className="intelligence-graph"><ReactFlow key={`${realm}:${onlyWorld}:${worldId}:${canonOnly}`} nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={.2} maxZoom={2} nodesDraggable={false} nodesConnectable={false} edgesReconnectable={false} deleteKeyCode={null} onNodeClick={(_,n)=>onSelect(n.id)} onEdgeClick={(_,e)=>setEdgeId(e.id)}><Background color="#253247" gap={28}/><Controls showInteractive={false}/></ReactFlow></div>}<details className="intelligence-graph-list"><summary>Song list · accessible map alternative</summary><div className="intelligence-song-list">{graph.nodes.map(n=><button key={n.id} onClick={()=>onSelect(n.id)} aria-pressed={n.id===selectedId}>{n.title}</button>)}</div></details><div className="intelligence-mobile-map"><p>Choose a song to inspect its neighbors.</p><div className="intelligence-song-list">{graph.nodes.map(n=><button key={n.id} onClick={()=>onSelect(n.id)} aria-pressed={n.id===selectedId}>{n.title}</button>)}</div></div></>:<p>No songs match these filters.</p>}
 <p>Selected: {analysis.songs.find(s=>s.trackId===selectedId)?.sourceFacts.title??'None'} · <a href="#song-intelligence">Inspect song ↓</a></p>
 {graph.hidden>0&&<p>The map shows the first 80 matching songs. Narrow by Realm or project; the song inspector retains the full catalog.</p>}
 {selectedEdge&&<aside className="intelligence-evidence"><strong>Why these songs connect</strong><p>{analysis.songs.find(s=>s.trackId===selectedEdge.a)?.sourceFacts.title} ↔ {analysis.songs.find(s=>s.trackId===selectedEdge.b)?.sourceFacts.title}</p><p>Shared signals: {selectedEdge.shared.join(' · ')}</p><p>{selectedEdge.support.join(' · ')}</p><button onClick={()=>onSelect(selectedEdge.a)}>Inspect first song</button><button onClick={()=>onSelect(selectedEdge.b)}>Inspect second song</button></aside>}
 </section>;
}
