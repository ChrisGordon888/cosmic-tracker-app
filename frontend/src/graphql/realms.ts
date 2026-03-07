// frontend/src/graphql/realms.ts
import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      level
      xp
      xpToNextLevel
      currentRealm
      unlockedRealms
      completedTrials {
        realmId
        trialId
        trialName
        stepsCompleted
        totalSteps
        isComplete
        completedAt
        xpEarned
      }
      visitedLocations {
        realmId
        locationId
        locationName
        visitedAt
        xpEarned
      }
      musicStats {
        tracksListened {
          realmId
          trackTitle
          artist
          listenCount
          totalListenTime
          firstListenedAt
          lastListenedAt
          xpEarned
        }
        totalListeningTime
        favoriteRealm
        totalTracksUnlocked
      }
      streaks {
        currentStreak
        longestStreak
        lastLoginDate
        totalLogins
      }
    }
  }
`;

export const COMPLETE_TRIAL_STEP = gql`
  mutation CompleteTrialStep($realmId: Int!, $trialId: String!) {
    completeTrialStep(realmId: $realmId, trialId: $trialId) {
      user {
        level
        xp
        xpToNextLevel
      }
      xpGained
      leveledUp
      newLevel
      message
    }
  }
`;

export const START_TRIAL = gql`
  mutation StartTrial($realmId: Int!, $trialId: String!, $trialName: String!) {
    startTrial(realmId: $realmId, trialId: $trialId, trialName: $trialName) {
      id
      completedTrials {
        realmId
        trialId
        stepsCompleted
      }
    }
  }
`;

export const LOG_MUSIC_LISTEN = gql`
  mutation LogMusicListen($realmId: Int!, $trackTitle: String!, $duration: Int!) {
    logMusicListen(realmId: $realmId, trackTitle: $trackTitle, duration: $duration) {
      user {
        level
        xp
      }
      xpGained
      leveledUp
      newLevel
      message
    }
  }
`;

export const GET_LEADERBOARD = gql`
  query GetLeaderboard($limit: Int) {
    getLeaderboard(limit: $limit) {
      rank
      user {
        id
        name
        image
        level
        xp
      }
    }
  }
`;

export const VISIT_LOCATION = gql`
  mutation VisitLocation($realmId: Int!, $locationId: String!, $locationName: String!) {
    visitLocation(realmId: $realmId, locationId: $locationId, locationName: $locationName) {
      user {
        level
        xp
        xpToNextLevel
        visitedLocations {
          realmId
          locationId
          locationName
          visitedAt
          xpEarned
        }
      }
      xpGained
      leveledUp
      newLevel
      message
    }
  }
`;

export const UNLOCK_REALM = gql`
  mutation UnlockRealm($realmId: Int!) {
    unlockRealm(realmId: $realmId) {
      id
      unlockedRealms
    }
  }
`;