'use client';
import { useMemo, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { SONG_REASONING_SOURCES,SAVE_SONG_LYRICS,SONG_REFLECTION,REFLECT_ON_SONG } from '@/graphql/intelligence';
import { LyricsSchema,EvidenceItemSchema,songEvidence,songClaims,validateClaim,evidenceHash,type Lyrics,type IntelligenceClaim } from '@/lib/groundedReasoning';
import type { Workbench } from '@/lib/intelligenceWorkbench';
import { hypothesisIdentity,type Feedback } from '@/lib/creatorContext';
import HypothesisResponse,{type FeedbackSave} from './HypothesisResponse';
import { EvidenceClaims } from './EvidenceClaims';
function LyricsEditor({lyrics,onSave}:{lyrics:Lyrics;onSave:(lyrics:Lyrics)=>Promise<void>}){
 const [text,setText]=useState(lyrics.text),[status,setStatus]=useState(lyrics.status),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function save(clear=false){setBusy(true);setMessage('');try{await onSave({text:clear?'':text,status});if(clear)setText('');setMessage(clear?'Lyrics cleared.':'Lyrics saved verbatim.');}catch{setMessage('Lyrics could not be saved. Your draft remains here.');}finally{setBusy(false);}}
 return <details><summary>Lyrics · {lyrics.text?'creator supplied':'not supplied'}</summary><p>Your words, unchanged. No automatic completion or timing.</p><label>Lyric text<textarea rows={10} maxLength={30000} value={text} onChange={e=>setText(e.target.value)} style={{width:'100%'}}/></label><label>Status<select value={status} onChange={e=>setStatus(e.target.value as Lyrics['status'])}><option>DRAFT</option><option>PARTIAL</option><option>COMPLETE</option></select></label><p>{text.length}/30,000 characters</p><button disabled={busy} onClick={()=>void save()}>Save lyrics</button> <button disabled={busy||!lyrics.text} onClick={()=>void save(true)}>Clear saved lyrics</button><p role="status">{message}</p></details>;
}
export default function SongReasoningPanel({analysis,trackId,onChanged,feedback,onRespond,onMoment}:{analysis:Workbench;trackId:string;onChanged:()=>Promise<void>;feedback:Feedback[];onRespond?:FeedbackSave;onMoment:(time:number)=>void}){
 const source=useQuery(SONG_REASONING_SOURCES,{variables:{trackId},fetchPolicy:'no-cache'});
 const reflection=useQuery(SONG_REFLECTION,{variables:{trackId},fetchPolicy:'no-cache'});
 const [saveLyrics]=useMutation(SAVE_SONG_LYRICS),[reflect,{loading:reflecting}]=useMutation(REFLECT_ON_SONG);
 const [error,setError]=useState('');
 const refreshReflection=reflection.refetch;
 useEffect(()=>{void refreshReflection().catch(()=>{});},[analysis.inputHash,refreshReflection]);
 const parsed=LyricsSchema.safeParse(source.data?.songReasoningSources?.lyrics??{text:'',status:'DRAFT'});
 const lyrics=parsed.success?parsed.data:null;
 const ledger=useMemo(()=>songEvidence(analysis,trackId,lyrics),[analysis,trackId,lyrics]);
 const deterministic=songClaims(ledger,trackId),run=reflection.data?.songReflection;
 let modelClaims:IntelligenceClaim[]=[];
 const modelEvidence=EvidenceItemSchema.array().safeParse(run?.evidence??[]);
 let invalid=false;
 if(run?.status==='READY')try{if(!modelEvidence.success)throw Error();modelClaims=(run.claims as unknown[]).map(c=>validateClaim(c,modelEvidence.data));}catch{invalid=true;}
 async function save(value:Lyrics){await saveLyrics({variables:{trackId,input:{text:value.text,status:value.status}}});await source.refetch();await onChanged();await reflection.refetch();}
 async function request(){setError('');try{const fresh=await reflection.refetch();await reflect({variables:{trackId,expectedInputHash:fresh.data.songReflection.inputHash}});await reflection.refetch();}catch{setError('Reflection was unavailable or evidence changed. Refresh and try again.');}}
 return <section className="intelligence-reasoning"><h4>Lyrics & grounded reading</h4>{source.error?<p role="alert">Lyrics could not be loaded.</p>:source.loading?<p>Loading lyrics…</p>:lyrics?<LyricsEditor lyrics={lyrics} onSave={save}/>:<p>Lyrics could not be validated.</p>}<EvidenceClaims claims={deterministic} evidence={ledger} onMoment={onMoment}/><details><summary>Evidence COSMIC has ({ledger.length})</summary>{ledger.map(e=><p className="intelligence-preserve" key={e.id}><strong>{e.type.replaceAll('_',' ')} · {e.source}</strong><br/>{e.summary}</p>)}</details><h4>Reflect with COSMIC</h4><p>This explicit action sends this song’s saved, selected context, lyric excerpts, moments, project context and up to three related-song signal summaries to the configured OpenAI model. Audio is not sent. Readings are hypotheses you can reject.</p>{run&&!run.available&&<p>Model reflection is not configured. The evidence and rule-based reading remain available.</p>}<button disabled={!run?.available||reflecting||run?.status==='RUNNING'} onClick={()=>void request()}>{reflecting?'Reflecting…':run?.status==='READY'?'Load saved reflection':'Reflect with COSMIC'}</button> <button disabled={reflection.loading} onClick={()=>void reflection.refetch()}>Check freshness</button><p role="status">{reflecting?'RUNNING':run?.status??'NOT_RUN'}{run?.status==='STALE'?' · Evidence changed; the old reading is hidden.':''}</p>{(error||reflection.error||run?.errorMessage||invalid)&&<p role="alert">{error||run?.errorMessage||'Reflection could not be loaded or validated.'}</p>}{modelEvidence.success&&modelClaims.map(c=>{const identity={...hypothesisIdentity('track',trackId,'model-claim',c.engineVersion,evidenceHash([c.inputHash,c.id])),statement:c.statement};const response=feedback.find(f=>f.hypothesisKey===identity.hypothesisKey);return <div key={c.id}>{response?.response==='NOT_REALLY'?<details><summary>Set-aside reflection</summary><EvidenceClaims claims={[c]} evidence={modelEvidence.data} onMoment={onMoment}/></details>:<EvidenceClaims claims={[c]} evidence={modelEvidence.data} onMoment={onMoment}/>} {onRespond&&<HypothesisResponse identity={identity} feedback={response} onRespond={onRespond}/>}</div>;})}{run?.status==='READY'&&run.questions?.map((q:string)=><p key={q}>Open question: {q}</p>)}{run?.generatedAt&&<small>{run.provider} · {run.model} · {run.promptVersion} · {run.generatedAt}</small>}</section>;
}
