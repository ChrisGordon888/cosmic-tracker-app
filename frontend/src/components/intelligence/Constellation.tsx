'use client';
import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { constellationGraph, type Workbench } from '@/lib/intelligenceWorkbench';
import {RelationshipEvidence} from './EvidenceClaims';
import { realmName } from '@/lib/creativeFingerprint';
function SongNode({data}:NodeProps){return <div className="intelligence-star"><Handle type="target" position={Position.Left}/>{data.artwork?<img src={String(data.artwork)} alt="" loading="lazy"/>:<span className="track-monogram" aria-hidden="true">{String(data.label).slice(0,1)}</span>}<strong>{String(data.label)}</strong><small>{String(data.realm)}</small>{Boolean(data.project)&&<small>{String(data.project)}</small>}<Handle type="source" position={Position.Right}/></div>;}
function FocusSong({id}:{id:string}){
 const flow=useReactFlow();const previous=useState(()=>({id}))[0];
 useEffect(()=>{if(previous.id===id)return;previous.id=id;const node=flow.getNode(id);if(node){const linked=flow.getEdges().filter(e=>e.source===id||e.target===id).flatMap(e=>[e.source,e.target]);void flow.fitView({nodes:[...new Set([id,...linked])].map(id=>({id})),padding:.25,maxZoom:1,duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:350});}},[id,flow,previous]);
 return null;
}
const nodeTypes={song:SongNode};
export default function Constellation({analysis,selectedId,worldId,onSelect,onInspectRelationship,onAudition,auditionBusy=false,auditionError=''}:{analysis:Workbench;selectedId:string;worldId:string;onSelect:(id:string)=>void;onAudition?:(id:string)=>void;auditionBusy?:boolean;auditionError?:string;onInspectRelationship?:(a:string,b:string)=>void}){
 const [wide,setWide]=useState(false);
 useEffect(()=>{const query=window.matchMedia('(min-width: 641px)');const update=()=>setWide(query.matches);update();query.addEventListener('change',update);return ()=>query.removeEventListener('change',update);},[]);
 const [realm,setRealm]=useState('all'),[onlyWorld,setOnlyWorld]=useState(false),[canonOnly,setCanonOnly]=useState(false),[edgeId,setEdgeId]=useState('');
 const graph=useMemo(()=>constellationGraph(analysis,{realm,worldId:onlyWorld?worldId:undefined,canonOnly}),[analysis,realm,worldId,onlyWorld,canonOnly]);
 const neighbors=new Set(graph.edges.filter(e=>e.a===selectedId||e.b===selectedId).flatMap(e=>[e.a,e.b]));
 const worldMembers=new Set(analysis.projects.find(p=>p.world.id===worldId)?.members.map(s=>s.trackId)??[]);
 const nodes=graph.nodes.map(n=>({id:n.id,type:'song',position:{x:n.x,y:n.y},data:{label:n.title,artwork:analysis.songs.find(s=>s.trackId===n.id)?.sourceFacts.artworkUrl,project:analysis.projects.find(p=>p.members.some(s=>s.trackId===n.id))?.world.title,realm:n.realmId==null?'Undecided':realmName(n.realmId)},selected:n.id===selectedId,className:`${neighbors.has(n.id)?'is-neighbor':''} ${worldMembers.has(n.id)?'in-project':''}`}));
 const edges=graph.edges.map(e=>({id:`${e.a}|${e.b}`,source:e.a,target:e.b,style:{stroke:neighbors.has(e.a)&&neighbors.has(e.b)?'#dcba5c':'#71849a',strokeWidth:e.strong?2.5:1,strokeDasharray:e.strong?undefined:'5 5',opacity:.65},ariaLabel:`Relationship: ${graph.nodes.find(n=>n.id===e.a)?.title} and ${graph.nodes.find(n=>n.id===e.b)?.title}`}));
 const selectedEdge=graph.edges.find(e=>`${e.a}|${e.b}`===edgeId);
 return <section className="intelligence-panel" aria-label="Constellation"><div className="intelligence-section-title"><div><p className="intelligence-eyebrow">Constellation</p><h2>Follow a thread. Hear a world.</h2></div><span>{graph.nodes.length} of {graph.total} songs</span></div>
 <p>Neighborhoods follow your assigned Realm, with project companions grouped together. Position is categorical, not a measured acoustic distance. Lines show shared signals, not sound similarity. Solid lines have stronger evidence. Outlined songs belong to the selected project.</p>
 <div className="intelligence-controls"><label>Realm<select value={realm} onChange={e=>setRealm(e.target.value)}><option value="all">All Realms</option>{[303,202,101,55,44,0].map(r=><option key={r} value={r}>{realmName(r)}</option>)}<option value="unknown">Undecided</option></select></label><label><input type="checkbox" checked={onlyWorld} disabled={!worldId} onChange={e=>setOnlyWorld(e.target.checked)}/>Selected project only</label><label><input type="checkbox" checked={canonOnly} onChange={e=>setCanonOnly(e.target.checked)}/>Public Canon songs only</label></div>
 {graph.nodes.length?<>{wide&&<div className="intelligence-graph"><ReactFlow key={`${realm}:${onlyWorld}:${worldId}:${canonOnly}`} nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={.2} maxZoom={2} nodesDraggable={false} nodesConnectable={false} edgesReconnectable={false} deleteKeyCode={null} onNodeClick={(_,n)=>onSelect(n.id)} onEdgeClick={(_,e)=>{setEdgeId(e.id);onInspectRelationship?.(e.source,e.target);}}><FocusSong id={selectedId}/><Background color="#253247" gap={28}/><Controls showInteractive={false}/></ReactFlow></div>}<details className="intelligence-graph-list"><summary>Song list · accessible map alternative</summary><div className="intelligence-song-list">{graph.nodes.map(n=><button key={n.id} onClick={()=>onSelect(n.id)} aria-pressed={n.id===selectedId}>{n.title}</button>)}</div></details><div className="intelligence-mobile-map"><p>Choose a song to inspect its neighbors.</p><div className="intelligence-song-list">{graph.nodes.map(n=><button key={n.id} onClick={()=>onSelect(n.id)} aria-pressed={n.id===selectedId}>{n.title}</button>)}</div></div></>:<p>No songs match these filters.</p>}
 {onAudition&&selectedId&&<button disabled={auditionBusy} onClick={()=>onAudition(selectedId)}>{auditionBusy?'Opening song…':'Hear selected song'}</button>}{auditionError&&<p role="alert">{auditionError}</p>}
 <p>Selected: {analysis.songs.find(s=>s.trackId===selectedId)?.sourceFacts.title??'None'} · <a href="#creative-compass">Pair / shape this song ↑</a> · <a href="#song-intelligence">Inspect evidence ↓</a></p>
 {analysis.songs.find(s=>s.trackId===selectedId)?.creatorContext.deep.meaning&&<p className="intelligence-preserve">You said: {analysis.songs.find(s=>s.trackId===selectedId)?.creatorContext.deep.meaning}</p>}
 {graph.hidden>0&&<p>The map shows the first 80 matching songs. Narrow by Realm or project; the song inspector retains the full catalog.</p>}
 {selectedEdge&&!onInspectRelationship&&<RelationshipEvidence edge={selectedEdge} title={id=>analysis.songs.find(s=>s.trackId===id)?.sourceFacts.title??'Song'} onSelect={onSelect}/>}
 </section>;
}
