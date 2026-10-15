'use client';
import { useQuery } from '@apollo/client';
import { usePlatformAccess } from '@/context/PlatformAccessProvider';
import { INTELLIGENCE_SOURCES } from '@/graphql/intelligence';
import IntelligenceWorkbench from '@/components/intelligence/IntelligenceWorkbench';
import '@/styles/intelligenceWorkbench.css';
export default function IntelligencePage(){
 const {user,canAccessCreatorOS,loading:accessLoading}=usePlatformAccess();
 if(accessLoading||!user||!canAccessCreatorOS)return <main className="intelligence-workbench"><p>Creator access is required.</p></main>;
 return <OwnedIntelligence key={user.id} ownerId={user.id}/>;
}
function OwnedIntelligence({ownerId}:{ownerId:string}){
 const {data,loading,error,refetch}=useQuery(INTELLIGENCE_SOURCES,{fetchPolicy:'no-cache',notifyOnNetworkStatusChange:true});
 if(error)return <main className="intelligence-workbench"><h1>Intelligence is unavailable.</h1><p>Your sources could not be loaded. No analysis is shown from an earlier session.</p><button onClick={()=>void refetch()}>Retry</button></main>;
 if(loading||!data)return <main className="intelligence-workbench"><p role="status">Reading your current signals…</p></main>;
 return <IntelligenceWorkbench ownerId={ownerId} tracks={data.myCatalogTracks??[]} worlds={data.myReleaseWorlds??[]} onRefresh={()=>void refetch()} refreshing={loading}/>;
}
