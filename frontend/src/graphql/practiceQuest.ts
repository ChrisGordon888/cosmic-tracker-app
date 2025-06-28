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