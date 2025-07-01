import { gql } from "@apollo/client";

// 🔮 Fetch all rituals for the current user (profile or rituals page)
export const ALL_RITUALS = gql`
  query AllRituals {
    allRituals {
      id
      userId
      title
      description
      createdAt
      updatedAt
    }
  }
`;

// 🛠️ Add a new ritual (description now required: String!)
export const ADD_RITUAL = gql`
  mutation AddRitual($title: String!, $description: String!) {
    addRitual(title: $title, description: $description) {
      id
      title
      description
      createdAt
      updatedAt
    }
  }
`;

// ✏️ Update an existing ritual (description also required: String!)
export const UPDATE_RITUAL = gql`
  mutation UpdateRitual($id: ID!, $title: String!, $description: String!) {
    updateRitual(id: $id, title: $title, description: $description) {
      id
      title
      description
      createdAt
      updatedAt
    }
  }
`;

// 🗑️ Delete a ritual
export const DELETE_RITUAL = gql`
  mutation DeleteRitual($id: ID!) {
    deleteRitual(id: $id) {
      id
    }
  }
`;