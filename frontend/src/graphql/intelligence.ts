import { gql } from '@apollo/client';
// Existing authenticated owner queries only. No audio or rights documents are fetched.
export const INTELLIGENCE_SOURCES=gql`
 query IntelligenceSources {
  myCatalogTracks { id ownerId title releaseWorldId trackNumber realmId creativeSignals realmFinderSignals mood hook notes bpm keySignature role isFocusTrack visibility publicCanon status catalogTreatment updatedAt }
  myReleaseWorlds { id ownerId title slug story oneLineSummary status updatedAt }
 }
`;
