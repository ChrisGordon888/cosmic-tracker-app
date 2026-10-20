'use client';
import { useMutation, useQuery } from '@apollo/client';
import { usePlatformAccess } from '@/context/PlatformAccessProvider';
import { SAVE_CREATIVE_EXPERIMENT, DELETE_CREATIVE_EXPERIMENT, SET_INTELLIGENCE_INCLUSION, SAVE_CREATIVE_PATH, REMOVE_CREATIVE_PATH, SAVE_CREATIVE_DIRECTION, RESET_CREATIVE_DIRECTIONS, INTELLIGENCE_SOURCES, SAVE_SONG_CONTEXT, RESPOND_TO_HYPOTHESIS } from '@/graphql/intelligence';
import IntelligenceWorkbench from '@/components/intelligence/IntelligenceWorkbench';
import '@/styles/intelligenceWorkbench.css';
export default function IntelligencePage(){
 const {user,canAccessCreatorOS,loading:accessLoading}=usePlatformAccess();
 if(accessLoading||!user||!canAccessCreatorOS)return <main className="intelligence-workbench"><p>Creator access is required.</p></main>;
 return <OwnedIntelligence key={user.id} ownerId={user.id}/>;
}
function OwnedIntelligence({ownerId}:{ownerId:string}){
 const [saveExperiment]=useMutation(SAVE_CREATIVE_EXPERIMENT),[deleteExperiment]=useMutation(DELETE_CREATIVE_EXPERIMENT);
 const [setInclusion]=useMutation(SET_INTELLIGENCE_INCLUSION);
 const [savePath]=useMutation(SAVE_CREATIVE_PATH),[removePath]=useMutation(REMOVE_CREATIVE_PATH);
 const [saveDirection]=useMutation(SAVE_CREATIVE_DIRECTION),[resetDirections]=useMutation(RESET_CREATIVE_DIRECTIONS);
 const [saveContext]=useMutation(SAVE_SONG_CONTEXT);
 const [respond]=useMutation(RESPOND_TO_HYPOTHESIS);
 const {data,loading,error,refetch}=useQuery(INTELLIGENCE_SOURCES,{fetchPolicy:'no-cache',notifyOnNetworkStatusChange:true});
 if(error)return <main className="intelligence-workbench"><h1>Intelligence is unavailable.</h1><p>Your sources could not be loaded. No analysis is shown from an earlier session.</p><button onClick={()=>void refetch()}>Retry</button></main>;
 if(!data)return <main className="intelligence-workbench"><p role="status">Reading your current signals…</p></main>;
 return <IntelligenceWorkbench experiments={data.myCreativeExperiments??[]} onSaveExperiment={async(input)=>{const result=await saveExperiment({variables:{input}});await refetch();return result.data.saveCreativeExperiment;}} onDeleteExperiment={async(id)=>{await deleteExperiment({variables:{id}});await refetch();}} hiddenTrackIds={data.myIntelligenceHiddenTrackIds??[]} onInclusion={async(trackId,included)=>{await setInclusion({variables:{trackId,included}});await refetch();}} paths={data.myCreativePaths??[]} onSavePath={async(input)=>{await savePath({variables:{input}});await refetch();}} onRemovePath={async(id)=>{await removePath({variables:{id}});await refetch();}} directions={data.myCreativeDirections??[]} onDirection={async(targetId,value)=>{await saveDirection({variables:{input:{targetId,value}}});await refetch();}} onResetDirections={async()=>{await resetDirections();await refetch();}} audioProfiles={data.myAudioProfiles??[]} onSourcesChanged={async()=>{await refetch();}} feedback={data.myHypothesisFeedback??[]} onSaveContext={async(trackId,input)=>{await saveContext({variables:{trackId,input}});await refetch();}} onRespond={async(identity,response,note)=>{const {hypothesisKey,...input}=identity;void hypothesisKey;await respond({variables:{input:{...input,response,note}}});await refetch();}} ownerId={ownerId} tracks={data.myCatalogTracks??[]} worlds={data.myReleaseWorlds??[]} onRefresh={()=>void refetch()} refreshing={loading}/>;
}
