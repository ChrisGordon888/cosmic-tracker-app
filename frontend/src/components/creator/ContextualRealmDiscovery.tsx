'use client';
import {useMutation} from '@apollo/client';
import {gql} from '@apollo/client';
import SmartSortPanel from './SmartSortPanel';
import {suggestCatalogRealm,type CatalogTrack} from '@/lib/catalogSorting';
const ASSIGN=gql`mutation DiscoverTrackRealm($id:ID!,$input:UpdateReleaseTrackInput!){updateReleaseTrack(id:$id,input:$input){id realmId}}`;
// Same suggestion component and authoritative write path used by Library Smart Sort.
export default function ContextualRealmDiscovery({track,catalog,releases,onClose,onChanged}:{track:CatalogTrack;catalog:CatalogTrack[];releases:ReadonlyMap<string,unknown>;onClose:()=>void;onChanged:()=>Promise<void>}){
 const [save]=useMutation(ASSIGN);
 return <SmartSortPanel track={track} catalog={catalog} releases={releases} position={1} total={1} onClose={onClose} onNext={onClose} onSave={async realmId=>{const suggested=suggestCatalogRealm(track,catalog).home;await save({variables:{id:track.id,input:{realmId,creativeDecision:{suggestedRealmId:suggested,action:suggested===null?'manual':suggested===realmId?'accepted':'overridden'}}}});await onChanged();}}/>;
}
