import { gql } from "@apollo/client";

export const GET_DAILY_QUESTS = gql`
  query GetDailyQuests($date: String!) {
    getDailyQuests(date: $date) {
      id
      name
      description
      repetitions
      completedReps
      completed
      date
      ritualId
    }
  }
`;

export const UPDATE_PRACTICE_QUEST_PROGRESS = gql`
  mutation UpdatePracticeQuestProgress($id: ID!, $completedReps: Int!) {
    updatePracticeQuestProgress(id: $id, completedReps: $completedReps) {
      id
      name
      completedReps
      completed
    }
  }
`;

export const ALL_PRACTICE_QUESTS = gql`
  query AllPracticeQuests {
    allPracticeQuests {
      id
      userId
      name
      description
      repetitions
      completedReps
      completed
      date
      ritualId
    }
  }
`;

export const DELETE_PRACTICE_QUEST = gql`
  mutation DeletePracticeQuest($id: ID!) {
    deletePracticeQuest(id: $id) {
      id
    }
  }
`;

export const ADD_PRACTICE_QUEST = gql`
  mutation AddPracticeQuest(
    $name: String!,
    $description: String,
    $repetitions: Int!,
    $date: String!,
    $ritualId: ID
  ) {
    addPracticeQuest(
      name: $name,
      description: $description,
      repetitions: $repetitions,
      date: $date,
      ritualId: $ritualId
    ) {
      id
      name
      description
      repetitions
      completedReps
      completed
      date
      ritualId
    }
  }
`;