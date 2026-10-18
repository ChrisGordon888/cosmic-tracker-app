import {labPlayerTrack,type LabSource} from './songLab';
import {safeSeed} from './creativeCompass';
import type {Workbench} from './intelligenceWorkbench';
// Resolve every member before replacing the shared queue: never silently audition a partial seed.
export async function resolveAudition(analysis:Workbench,ids:string[],load:(id:string)=>Promise<LabSource>){
 const safe=safeSeed(ids,analysis);
 if(safe.length!==ids.length||!safe.length)throw Error('One of these songs is no longer available. Refresh sources.');
 return Promise.all(safe.map(async id=>{
  const source=await load(id);
  if(!source||source.id!==id)throw Error('Song source changed.');
  const track=labPlayerTrack(source,analysis.ownerId);
  if(!track)throw Error('A song is unavailable to this account. No partial queue was started.');
  return track;
 }));
}
