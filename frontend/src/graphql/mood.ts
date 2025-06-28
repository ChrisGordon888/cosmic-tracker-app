import { gql } from "@apollo/client";

export const GET_MOOD_ENTRY = gql`
  query GetMoodEntry($date: String!) {
    getMoodEntry(date: $date) {
      id
      mood
      note
      date
    }
  }
`;

export const ADD_MOOD_ENTRY = gql`
  mutation AddMoodEntry($mood: Int!, $note: String, $date: String!) {
    addMoodEntry(mood: $mood, note: $note, date: $date) {
      id
      mood
      note
      date
    }
  }
`;

export const UPDATE_MOOD_ENTRY = gql`
  mutation UpdateMoodEntry($id: ID!, $mood: Int!, $note: String) {
    updateMoodEntry(id: $id, mood: $mood, note: $note) {
      id
      mood
      note
      date
    }
  }
`;