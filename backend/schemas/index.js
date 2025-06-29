const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type SacredYes {
    id: ID!
    userId: String!        # 🔥 Associate entry with authenticated user
    text: String!
    date: String!
  }

  type MoodEntry {
    id: ID!
    userId: String!        # 🔥 Associate entry with authenticated user
    mood: Int!
    note: String
    date: String!
  }

  type PracticeQuest {
    id: ID!
    userId: String!        # 🔥 Associate entry with authenticated user
    name: String!
    description: String
    repetitions: Int!
    completedReps: Int!
    completed: Boolean!
    date: String!
  }

  type Query {
    hello: String
    todayMoonPhase: String

    # Sacred Yes
    getSacredYes(date: String!): SacredYes
    allSacredYes: [SacredYes!]!

    # Mood Entries
    getMoodEntry(date: String!): MoodEntry
    allMoodEntries: [MoodEntry!]!

    # Practice Quests
    getDailyQuests(date: String!): [PracticeQuest!]!
  }

  type Mutation {
    # Sacred Yes
    addSacredYes(text: String!, date: String!): SacredYes
    updateSacredYes(id: ID!, text: String!): SacredYes
    deleteSacredYes(id: ID!): SacredYes

    # Mood Entries
    addMoodEntry(mood: Int!, note: String, date: String!): MoodEntry
    updateMoodEntry(id: ID!, mood: Int!, note: String): MoodEntry
    deleteMoodEntry(id: ID!): MoodEntry

    # Practice Quests
    addPracticeQuest(name: String!, description: String, repetitions: Int!, date: String!): PracticeQuest
    updatePracticeQuestProgress(id: ID!, completedReps: Int!): PracticeQuest
    markPracticeQuestComplete(id: ID!): PracticeQuest
    deletePracticeQuest(id: ID!): PracticeQuest
  }
`;

module.exports = typeDefs;