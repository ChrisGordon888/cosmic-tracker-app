import type { CSSProperties } from 'react';
import type { CleanupTrack } from '@/lib/libraryCleanup';
const realms: Record<number, [string,string]> = {303:['#ee8899','∴'],202:['#b694e8','◐'],101:['#91c9e0','☾'],55:['#eed08c','△'],44:['#b5d59c','◇'],0:['#ded7c1','∞']};
export default function WorkingCover({track, releaseArtwork}: {track: CleanupTrack; releaseArtwork?: string | null}) {
  const image = track.artworkUrl?.trim() || track.releaseCoverArtUrl?.trim() || releaseArtwork?.trim();
  if (image) return <img src={image} alt={`${track.title} artwork`} className="library-cover-image" />;
  const style = track.workingCoverStyle ?? 'minimal';
  const [color,sigil] = realms[track.realmId ?? -1] ?? ['#adb5bf','—'];
  return <div className={`library-working-cover cover-${style}`} style={{'--cover-accent':color} as CSSProperties} aria-label={style === 'none' ? 'No artwork' : `${track.title} — Working cover`}>
    {style === 'none' ? <span>♪</span> : <><small>Working cover</small><span aria-hidden="true">{sigil}</span><strong>{track.title}</strong><small>{[track.bpm ? `${track.bpm} BPM` : '',track.keySignature].filter(Boolean).join(' · ')}</small></>}
  </div>;
}
