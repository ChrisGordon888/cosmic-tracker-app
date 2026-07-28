import { gql } from '@apollo/client';

export const GET_MY_NEXUS_TRACKS = gql`
  query GetMyNexusTracks {
    myReleaseTracks {
      id
      ownerId
      releaseWorldId
      title
      slug
      trackNumber
      role
      status
      bpm
      keySignature
      mood
      hook
      notes
      audioUrl
      previewAudioUrl
      platformUrl
      visibility
      playbackStatus
      dropDate
      unlockDate
      isFocusTrack
      isSecondFocus
      isPublic
      realmId
      showInNexus
      nexusRole
      isRealmAnchor
      isPublicPick
      nexusSortOrder
      createdAt
      updatedAt
      lastOpenedAt
    }
  }
`;
