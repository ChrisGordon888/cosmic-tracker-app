'use client';
import { useMemo, useState } from 'react';
import { analyzeCatalog, type IntelligenceTrack } from '@/lib/catalogIntelligence';
import { realmName } from '@/lib/creativeFingerprint';
import '@/styles/catalogIntelligence.css';
export default function CatalogIntelligencePanel({tracks,ownerId,onInspect}:{tracks:IntelligenceTrack[];ownerId:string;onInspect:(id:string)=>void}) {
 const [open,setOpen]=useState(false);
 const report=useMemo(()=>open?analyzeCatalog(tracks,ownerId):null,[open,tracks,ownerId]);
 const name=(id:string)=>tracks.find(t=>t.id===id&&t.ownerId===ownerId)?.title||'Untitled track';
 const song=(id:string)=><button type="button" onClick={()=>onInspect(id)}>{name(id)} · View signals →</button>;
 return <details className="catalog-intelligence" onToggle={event=>setOpen(event.currentTarget.open)}>
 <summary>Catalog Intelligence · what is forming?</summary>
 {report&&<>
 <p className="creator-library-kicker">COSMIC noticed</p>
 <p>{report.tagged} tagged songs · {report.eligible.length} with enough context to compare · {report.excluded} Vault, Sandbox or archived tracks excluded.</p>
 <p>Creative fingerprint relationships, not audio analysis. These observations never move music or create projects.</p>
 <h3>Possible project shapes</h3>
 {!report.hypotheses.length&&<p>No sufficiently supported project shape yet. A few more signals may reveal connections.</p>}
 {report.clusters.map(cluster=><details key={cluster.id}>
 <summary>{cluster.possibleProject?'Possible world':'Exploratory pair'} · {cluster.trackIds.length} songs · {cluster.realm===null?'Mixed creator Realms':`${realmName(cluster.realm)} leaning`} · {cluster.cohesion}</summary>
 <p>{cluster.why} These are recurring signals, not necessarily present on every song.</p>
 <h4>Core</h4><ul>{cluster.trackIds.map(id=><li key={id}>{song(id)}</li>)}</ul>
 {report.bridges.filter(b=>b.connections.some(c=>c.clusterId===cluster.id)).map(bridge=><div key={bridge.trackId}><h4>Bridge · {name(bridge.trackId)}</h4>{bridge.connections.map(c=><p key={c.clusterId}>Shared with {c.clusterId}: {[...new Set(c.links.flatMap(e=>e.shared))].join(' · ')}</p>)}</div>)}
 </details>)}
 <details><summary>Own orbits · {report.ownOrbits.length}</summary>
 {!report.outlierComparisonAvailable?<p>At least four sufficiently described tracks are needed before identifying own orbits.</p>:report.ownOrbits.length===0?<p>No clearly isolated fingerprint in this sample.</p>:<><p>These described tracks share little overlap with this catalog. They may represent a new direction or need more precise signals—not a problem to fix.</p><ul>{report.ownOrbits.map(id=><li key={id}>{song(id)}</li>)}</ul></>}
 </details>
 <details><summary>Needs more signals · {report.needsSignals.length}</summary><p>Fewer than three recognized concepts across two categories. These are not classified as outliers.</p><ul>{report.needsSignals.map(id=><li key={id}>{song(id)}</li>)}</ul></details>
 <details><summary>Signal health · {report.tagged} tagged songs</summary>
 <p>Usage describes your current sample. Broad and overlapping signals are review prompts, not instructions to remove them. Rare does not mean unhelpful.</p>
 {report.quality.map(q=><details key={q.signal}><summary>{q.signal} · {q.count}/{q.tagged} · {q.finding}</summary><p>{q.percentage}% of tagged songs. {q.note}</p><p>Assigned Realms: {Object.entries(q.realms).map(([r,n])=>`${r} ${n}`).join(' · ')||'No usage yet'}</p><p>Often with: {q.cooccurrence.slice(0,3).map(p=>`${p.signal} (${p.count})`).join(' · ')||'No pairs yet'}</p></details>)}
 </details>
 <details><summary>Creator-assigned Realm presence</summary><p>{Object.entries(report.realmDistribution).map(([r,n])=>`${r}: ${n}`).join(' · ')}</p></details>
 </>}
 </details>;
}
