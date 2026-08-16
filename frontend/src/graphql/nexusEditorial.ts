"use client";

import { gql } from "@apollo/client";

export const NEXUS_EDITORIAL_QUERY = gql`
  query NexusEditorial {
    nexusEditorialConfig {
      id
      key
      featuredTrackId
      realmAnchors { realmId trackId }
      realmOrders { realmId trackIds }
      updatedBy
      updatedAt
    }
    nexusPublishedSignals {
      track {
        id title slug realmId nexusRole isRealmAnchor nexusSortOrder
        artworkUrl releaseCoverArtUrl audioUrl previewAudioUrl
        accessTier canAccessAudio accessGate nexusReviewStatus showInNexus
      }
      releaseWorld { id title slug releaseType coverArtUrl }
      creativeProfile { id artistName displayName slug }
    }
  }
`;

export const SET_NEXUS_FEATURED_SIGNAL_MUTATION = gql`
  mutation SetNexusFeaturedSignal($trackId: ID!) {
    setNexusFeaturedSignal(trackId: $trackId) {
      id featuredTrackId updatedBy updatedAt
      realmAnchors { realmId trackId }
      realmOrders { realmId trackIds }
    }
  }
`;

export const SET_NEXUS_REALM_ANCHOR_MUTATION = gql`
  mutation SetNexusRealmAnchor($realmId: Int!, $trackId: ID!) {
    setNexusRealmAnchor(realmId: $realmId, trackId: $trackId) {
      id featuredTrackId updatedBy updatedAt
      realmAnchors { realmId trackId }
      realmOrders { realmId trackIds }
    }
  }
`;

export const SET_NEXUS_REALM_ORDER_MUTATION = gql`
  mutation SetNexusRealmOrder($realmId: Int!, $orderedTrackIds: [ID!]!) {
    setNexusRealmOrder(realmId: $realmId, orderedTrackIds: $orderedTrackIds) {
      id featuredTrackId updatedBy updatedAt
      realmAnchors { realmId trackId }
      realmOrders { realmId trackIds }
    }
  }
`;
