import React from 'react';
import { getRealmTheme } from '@/lib/realmTheme';
import {MusicPlayerProvider,useMusicPlayerContext} from '@/context/MusicPlayerProvider';
import MiniPlayer from '@/components/music/MiniPlayer';
import NexusRealmSampler from '@/components/music/NexusRealmSampler';
import RealmResonance from '@/components/music/RealmResonance';
import RealmSelections from '@/components/admin/RealmSelections';
const params=new URLSearchParams(location.search);
const mode=params.get('mode')??'sampler';
const count=Math.max(0,Math.min(mode==='sampler'?9:100,Number(params.get('count')??5)));
const identities=[{id:303,name:'Fractured Frontier',icon:'∴',color:'#ff4169'},{id:202,name:'The Veil',icon:'◐',color:'#b47aff'},{id:0,name:'InterSiddhi',icon:'✦',color:'#f4ce75'}];
const identity=identities.find(r=>String(r.id)===params.get('realm'))??identities[0];
const realm={...identity,color:getRealmTheme(identity.id).accent};
const tracks=Array.from({length:count},(_,i)=>({id:`fiction-${realm.id}-${i}`,trackUrl:i%2?'/tone2.wav':'/tone.wav',trackTitle:i===2?'A deliberately long fictional song title — the space between everything we thought we knew':`Fictional Signal ${i+1}`,artworkUrl:i===3?undefined:'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="hsl(${i*47+210} 30% 13%)"/><circle cx="60" cy="42" r="25" fill="hsl(${i*47+20} 60% 70%)"/><path d="M0 100L40 50L80 100L105 60L120 95V120H0Z" fill="hsl(${i*47+200} 40% 40%)"/><path d="M0 105H120M0 112H120" stroke="white" opacity=".3"/></svg>`),artist:'Fictional artist',realmId:realm.id,realmName:realm.name,realmColor:realm.color,visibility:'public',accessTier:'public'}));
function Scene(){const p=useMusicPlayerContext();return <><nav style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
{['sampler','full','editorial'].map(m=><a key={m} href={`/?mode=${m}&count=${count}&realm=${realm.id}`}>{m}</a>)}
{(mode==='sampler'?[0,1,2,3,4,5,9]:[1,5,9,30,100]).map(n=><a key={n} href={`/?mode=${mode}&count=${n}&realm=${realm.id}`}>{n} songs</a>)}
{identities.map(r=><a key={r.id} href={`/?mode=${mode}&count=${count}&realm=${r.id}`}>{r.name}</a>)}
<a href={`/mobile?mode=${mode}&count=${count}&realm=${realm.id}`}>390px preview</a></nav>
{mode==='editorial'?<RealmSelections/>:mode==='sampler'?<div style={{maxWidth:500}}><NexusRealmSampler progress={40} tracks={tracks} realmId={String(realm.id)} realmName={realm.name} realmIcon={realm.icon} color={realm.color}/></div>:<section className="realm-soundstage-shell" style={{background:`radial-gradient(ellipse at 20% 40%, ${realm.color}, transparent 70%),linear-gradient(130deg,#15243b,#523326)`}}><RealmResonance tracks={tracks} color={realm.color} realmName={realm.name} realmIcon={realm.icon}/></section>}
<aside>Shared provider: {p.currentTrack?.trackTitle??'No song'} · {p.isPlaying?'Playing':'Paused'}</aside><MiniPlayer/></>}
export default function Fixture(){return <MusicPlayerProvider><Scene/></MusicPlayerProvider>}
