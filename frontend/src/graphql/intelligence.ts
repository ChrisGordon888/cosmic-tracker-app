import { gql } from '@apollo/client';
// Existing authenticated owner queries only. No audio or rights documents are fetched.
export const INTELLIGENCE_SOURCES=gql`
 query IntelligenceSources {
  myHypothesisFeedback { hypothesisKey response note statement engineVersion evidenceHash updatedAt history { response note at } }
  myCatalogTracks { lyricsUpdatedAt songMoments { id timeSeconds endTimeSeconds type label note lyricExcerpt createdAt updatedAt } creatorContext { meaning emotionalStart emotionalEnd referenceNotes creatorRole } id ownerId title releaseWorldId trackNumber realmId creativeSignals realmFinderSignals mood hook notes bpm keySignature role isFocusTrack visibility publicCanon status catalogTreatment updatedAt }
  myReleaseWorlds { id ownerId title slug story oneLineSummary status updatedAt }
 }
`;

export const SAVE_SONG_CONTEXT=gql`
 mutation SaveSongContext($trackId:ID!,$input:SongCreatorContextInput!){saveSongContext(trackId:$trackId,input:$input){id creatorContext { meaning emotionalStart emotionalEnd referenceNotes creatorRole } hook}}
`;
export const RESPOND_TO_HYPOTHESIS=gql`
 mutation RespondToHypothesis($input:HypothesisFeedbackInput!){respondToHypothesis(input:$input){hypothesisKey response note}}
`;

export const SONG_LAB_SOURCE=gql`
 query SongLabSource($trackId:ID!){songLabTrack(trackId:$trackId){id ownerId title realmId audioUrl previewAudioUrl canAccessAudio playbackStatus accessTier visibility unlockDate dropDate sourceFileSize}}
`;
export const SAVE_SONG_MOMENT=gql`
 mutation SaveSongMoment($trackId:ID!,$momentId:ID,$input:SongMomentInput!){saveSongMoment(trackId:$trackId,momentId:$momentId,input:$input){id songMoments { id timeSeconds endTimeSeconds type label note lyricExcerpt createdAt updatedAt }}}
`;
export const DELETE_SONG_MOMENT=gql`
 mutation DeleteSongMoment($trackId:ID!,$momentId:ID!){deleteSongMoment(trackId:$trackId,momentId:$momentId){id songMoments { id timeSeconds endTimeSeconds type label note lyricExcerpt createdAt updatedAt }}}
`;

export const SONG_REASONING_SOURCES=gql`
 query SongReasoningSources($trackId:ID!){songReasoningSources(trackId:$trackId){id ownerId lyrics { text status updatedAt }}}
`;
export const SAVE_SONG_LYRICS=gql`
 mutation SaveSongLyrics($trackId:ID!,$input:SongLyricsInput!){saveSongLyrics(trackId:$trackId,input:$input){id lyrics { text status updatedAt } lyricsUpdatedAt}}
`;

export const SONG_REFLECTION=gql`
 query SongReflection($trackId:ID!){songReflection(trackId:$trackId){available provider model status inputHash engineVersion promptVersion generatedAt errorMessage questions claims { id subjectType subjectId claimType statement confidence evidenceIds unknowns sourceMode engineVersion inputHash generatedAt } evidence { id type subjectId source summary sourcePath timeSeconds line provenance { engineVersion inputHash } }}}
`;
export const REFLECT_ON_SONG=gql`
 mutation ReflectOnSong($trackId:ID!,$expectedInputHash:String!){reflectOnSong(trackId:$trackId,expectedInputHash:$expectedInputHash){available provider model status inputHash engineVersion promptVersion generatedAt errorMessage questions claims { id subjectType subjectId claimType statement confidence evidenceIds unknowns sourceMode engineVersion inputHash generatedAt } evidence { id type subjectId source summary sourcePath timeSeconds line provenance { engineVersion inputHash } }}}
`;
