import { gql } from "@apollo/client";

export const GET_SACRED_YES = gql`
  query GetSacredYes($date: String!) {
    getSacredYes(date: $date) {
      id
      text
      date
    }
  }
`;

export const ADD_SACRED_YES = gql`
  mutation AddSacredYes($text: String!, $date: String!) {
    addSacredYes(text: $text, date: $date) {
      id
      text
      date
    }
  }
`;

export const UPDATE_SACRED_YES = gql`
  mutation UpdateSacredYes($id: ID!, $text: String!) {
    updateSacredYes(id: $id, text: $text) {
      id
      text
      date
    }
  }
`;

export const ALL_SACRED_YES = gql`
  query AllSacredYes {
    allSacredYes {
      id
      userId
      text
      date
    }
  }
`;

export const DELETE_SACRED_YES = gql`
  mutation DeleteSacredYes($id: ID!) {
    deleteSacredYes(id: $id) {
      id
    }
  }
`;