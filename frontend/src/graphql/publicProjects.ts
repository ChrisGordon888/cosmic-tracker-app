import { gql } from '@apollo/client';
export const PUBLIC_PROJECTS=gql`query PublicProjects($selectedOnly:Boolean=false){publicProjects(selectedOnly:$selectedOnly){realmId world{id title slug coverArtUrl oneLineSummary story releaseType} tracks{id title trackNumber realmId isFocusTrack visibility playbackStatus accessTier accessGate audioUrl previewAudioUrl unlockDate dropDate}}}`;
