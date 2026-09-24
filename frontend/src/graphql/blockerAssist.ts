import { gql } from '@apollo/client';

// List queries do not update lastOpenedAt or trigger scheduled publication.
export const BLOCKER_ASSIST_WORKSPACE = gql`
  query BlockerAssistWorkspace {
    myCreativeProfiles { id featuredReleaseWorldId }
    myReleaseWorlds { id title slug isFeatured status }
  }
`;
