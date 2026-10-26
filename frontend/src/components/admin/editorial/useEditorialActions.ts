'use client';
import {useApolloClient} from '@apollo/client';
import {useState} from 'react';
import {STUDIO_CONFIG,STUDIO_SIGNALS,STUDIO_ASSESSMENT,STUDIO_SOUNDTRACK,STUDIO_DISCOVERY,STUDIO_WORLD,STUDIO_SAMPLER} from '@/graphql/editorialStudio';
import {REVIEW_NEXUS_SUBMISSION_MUTATION,PUBLISH_TRACK_TO_NEXUS_MUTATION,UNPUBLISH_TRACK_FROM_NEXUS_MUTATION,NEXUS_REVIEW_ME_QUERY} from '@/graphql/nexusReview';
import {SET_NEXUS_FEATURED_SIGNAL_MUTATION,SET_NEXUS_REALM_ANCHOR_MUTATION,SET_NEXUS_REALM_ORDER_MUTATION} from '@/graphql/nexusEditorial';
import {actionAssessment,intentState,executeEditorialBatch,type Assessment,type Config,type Signal,type Intent,type ActionResult,type Capability} from '@/lib/editorialStudio';
const documents={approve:REVIEW_NEXUS_SUBMISSION_MUTATION,'needs-changes':REVIEW_NEXUS_SUBMISSION_MUTATION,publish:PUBLISH_TRACK_TO_NEXUS_MUTATION,unpublish:UNPUBLISH_TRACK_FROM_NEXUS_MUTATION,soundtrack:STUDIO_SOUNDTRACK,discovery:STUDIO_DISCOVERY,world:STUDIO_WORLD,sampler:STUDIO_SAMPLER,spotlight:SET_NEXUS_FEATURED_SIGNAL_MUTATION,anchor:SET_NEXUS_REALM_ANCHOR_MUTATION,order:SET_NEXUS_REALM_ORDER_MUTATION};
export function useEditorialActions(refresh:()=>Promise<void>) {
 const client=useApolloClient();
 const [plan,setPlan]=useState<Intent[]>([]),[results,setResults]=useState<ActionResult[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function snapshot(){
  const [c,s]=await Promise.all([client.query<{editorialStudioConfig:Config|null}>({query:STUDIO_CONFIG,fetchPolicy:'network-only'}),client.query<{nexusReviewQueue:Signal[]}>({query:STUDIO_SIGNALS,fetchPolicy:'network-only'})]);
  if(c.error||s.error)throw Error('Current state could not be read.');
  return {config:c.data.editorialStudioConfig,signals:s.data.nexusReviewQueue};
 }
 async function validate(intent:Intent){
  const access=await client.query<{nexusEditorialAccess:Capability}>({query:NEXUS_REVIEW_ME_QUERY,fetchPolicy:'network-only'});
  const cap=['approve','needs-changes'].includes(intent.action)?'canReview':['publish','unpublish'].includes(intent.action)?'canPublish':'canPlace';
  if(access.error||!access.data?.nexusEditorialAccess?.[cap])throw Error('Your current account lacks this action capability.');
  const state=await snapshot();
  const source=state.signals.find(s=>s.track.id===intent.id);
  if(intent.source&&JSON.stringify({worldId:source?.releaseWorld.id,realmId:source?.track.realmId})!==intent.source)throw Error('Source World or Realm changed. Prepare a new preview.');
  if(intentState(intent,state.config,state.signals)!==intent.before)throw Error(`${intent.label}: state changed. Refresh and prepare a new preview.`);
  if(intent.action==='needs-changes'&&!intent.notes?.trim())throw Error('Add a review note before requesting changes.');
  const world=['world','discovery'].includes(intent.action);
  const ids=intent.action==='sampler'||intent.action==='order'?intent.ids??[]:[intent.id];
  const {data,error}=await client.query<{editorialStudioAssessment:Assessment[]}>({query:STUDIO_ASSESSMENT,variables:{trackIds:world?[]:ids,worldIds:world?ids:[],...(intent.action==='approve'&&intent.realmId!=null?{proposedRealmId:intent.realmId}:{})},fetchPolicy:'network-only'});
  if(error)throw Error('Eligibility check failed. No mutation submitted.');
  for(const id of ids){
   const name=intent.selected===false?'withdraw':intent.action==='order'?'anchor':intent.action;
   const check=actionAssessment(data.editorialStudioAssessment,world?'world':'track',id,name);
   if(!check.allowed)throw Error(`${intent.label}: ${check.reasons.join(' ')}`);
  }
  // Empty ordered updates still require placement authority, enforced at mutation time.
 }
 async function prepare(intents:Intent[]){
  setBusy(true);setError('');setResults([]);setPlan([]);
  try{if(!intents.length)throw Error('Choose at least one item.');if(intents.length>1&&(!intents.every(i=>i.action===intents[0].action)||!['soundtrack','world','discovery'].includes(intents[0].action)))throw Error('Batch one placement destination at a time.');for(const intent of intents)await validate(intent);setPlan(intents);}
  catch(e){setError(e instanceof Error?e.message:'Validation failed.');}finally{setBusy(false);}
 }
 async function perform(intent:Intent){
  await validate(intent);
  const variables={trackId:intent.id,worldId:intent.id,realmId:intent.realmId,selected:intent.selected,trackIds:intent.ids,orderedTrackIds:intent.ids,expectedRevision:intent.revision,decision:intent.action,notes:intent.notes};
  try{await client.mutate({mutation:documents[intent.action],variables});}
  catch(e){
   // A transport failure can occur after a write; never invite blind replay.
   if(e && typeof e==='object' && 'networkError' in e && e.networkError)throw Error('UNVERIFIED: Response lost. Refresh and inspect server state before preparing another operation.');
   throw e;
  }
  try{const current=await snapshot();if(intentState(intent,current.config,current.signals)!==intent.after)throw Error('Stored state differs from the requested result.');}
  catch(e){throw Error(`UNVERIFIED: Mutation returned success, but verification failed. ${e instanceof Error?e.message:''}`);}
 }
 async function confirm(){setBusy(true);setError('');try{setResults(await executeEditorialBatch(plan,perform));setPlan([]);await refresh();}finally{setBusy(false);}}
 return {plan,results,busy,error,prepare,confirm,cancel:()=>setPlan([]),retryFailed:()=>prepare(results.filter(r=>r.status==='failed').map(r=>r.intent)),prepareUnattempted:()=>prepare(results.filter(r=>r.status==='unattempted').map(r=>r.intent))};
}
