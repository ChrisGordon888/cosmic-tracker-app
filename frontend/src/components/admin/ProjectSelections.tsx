'use client';
import { gql,useQuery,useMutation } from '@apollo/client';
import { useState } from 'react';
import { PUBLIC_PROJECTS } from '@/graphql/publicProjects';
import type { PublicProject } from '@/lib/publicProjects';
const CONFIG=gql`query ProjectSelections{nexusEditorialConfig{ id selectedWorldIds }}`;
const SAVE=gql`mutation SetProjectSelection($worldId:ID!,$selected:Boolean!){setNexusProjectSelection(worldId:$worldId,selected:$selected){id selectedWorldIds}}`;
export default function ProjectSelections(){
 const {data}=useQuery(PUBLIC_PROJECTS);const {data:config,refetch}=useQuery(CONFIG);const [save,{loading}]=useMutation(SAVE);const [message,setMessage]=useState('');const selected:string[]=config?.nexusEditorialConfig.selectedWorldIds||[];
 return <section className="glass-card p-5"><h2>Selected Worlds</h2><p>Choose actual public Canon projects. This does not alter track Spotlight or approve individual tracks.</p><p role="status">{message}</p>{data?.publicProjects.map((p:PublicProject)=><label key={p.world.id} className="block py-3"><input type="checkbox" disabled={loading} checked={selected.includes(p.world.id)} onChange={async e=>{try{await save({variables:{worldId:p.world.id,selected:e.target.checked}});await refetch();setMessage('Project selection saved.');}catch(error){setMessage(error instanceof Error?error.message:'Could not save.');}}}/> {p.world.title}</label>)}{!data?.publicProjects.length&&<p>No public Canon worlds are available yet. Creators must explicitly select their projects first.</p>}</section>;
}
