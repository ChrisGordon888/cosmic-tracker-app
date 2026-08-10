"use client";

import { gql } from "@apollo/client";

export const NEXUS_REVIEW_QUEUE_QUERY = gql`
  query NexusReviewQueue($status: String) {
    nexusReviewQueue(status: $status) {
      track {
        id title slug ownerId realmId nexusReviewStatus nexusSubmittedAt
        nexusReviewedAt nexusReviewNotes showInNexus status visibility playbackStatus
      }
      releaseWorld { id title slug visibility status }
      creativeProfile { id artistName slug displayName }
    }
  }
`;

export const NEXUS_REVIEW_ME_QUERY = gql`
  query NexusReviewMe {
    me { id role platformPermissions }
  }
`;

export const REVIEW_NEXUS_SUBMISSION_MUTATION = gql`
  mutation ReviewNexusSubmission($trackId: ID!, $decision: String!, $realmId: Int, $notes: String) {
    reviewNexusSubmission(trackId: $trackId, decision: $decision, realmId: $realmId, notes: $notes) {
      id realmId nexusReviewStatus nexusReviewedAt nexusReviewNotes showInNexus
    }
  }
`;

export const PUBLISH_TRACK_TO_NEXUS_MUTATION = gql`
  mutation PublishTrackToNexus($trackId: ID!) {
    publishTrackToNexus(trackId: $trackId) {
      id nexusReviewStatus showInNexus nexusReviewedAt
    }
  }
`;
