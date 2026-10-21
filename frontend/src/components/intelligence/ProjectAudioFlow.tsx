import type {Workbench} from '@/lib/intelligenceWorkbench';
import type {AudioSummary} from '@/lib/audioFeatures';
export function ProjectAudioFlow({project,profiles}:{project:Workbench['projects'][number];profiles:AudioSummary[]}){
 const ordered=project.members.map(s=>({song:s,audio:profiles.find(p=>p.trackId===s.trackId)}));
 if(ordered.filter(p=>p.audio).length<2)return null;
 return <details><summary>Measured recording levels</summary><p>Average resampled PCM level in project order. This can reflect mastering or silence; it is not an emotional arc or perceived loudness.</p><ol className="intelligence-audio-sequence">{ordered.map((p,i)=>{const before=ordered[i-1]?.audio;return <li key={p.song.trackId}><span>{p.song.sourceFacts.title}</span>{p.audio?<><meter min={-120} max={0} value={Math.min(0,p.audio.rmsDbfs)} aria-label={`${p.song.sourceFacts.title} average RMS level`}/><small>{p.audio.rmsDbfs.toFixed(1)} dBFS</small>{before&&Math.abs(p.audio.rmsDbfs-before.rmsDbfs)>=3&&<p>{Math.abs(p.audio.rmsDbfs-before.rmsDbfs).toFixed(1)} dB {p.audio.rmsDbfs>before.rmsDbfs?'higher':'lower'} average level than the previous recording. Why: comparison of cached whole-recording RMS measurements.</p>}</>:<small>Not measured · gap preserved</small>}</li>;})}</ol></details>;
}
