const { gql } = require("apollo-server-express");

const typeDefs = gql`
  # 🌟 Sacred Yes
  type SacredYes {
    id: ID!
    userId: String!
    text: String!
    date: String!
  }

  # 🪷 Mood Entry
  type MoodEntry {
    id: ID!
    userId: String!
    mood: Int!
    note: String
    date: String!
  }

  # 🧘 Practice Quest
  type PracticeQuest {
    id: ID!
    userId: String!
    name: String!
    description: String
    repetitions: Int!
    completedReps: Int!
    completed: Boolean!
    date: String!
    ritualId: ID                # stores linked ritual's ID
    ritual: Ritual              # dynamically resolved ritual object
  }

  # 🔮 Ritual
  type Ritual {
    id: ID!
    userId: String!
    title: String!
    description: String!
    createdAt: String
    updatedAt: String
  }

  # 📖 Queries
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
    allPracticeQuests: [PracticeQuest!]!

    # Rituals
    allRituals: [Ritual!]!
    getRitual(id: ID!): Ritual
  }

  # 🛠️ Mutations
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
    addPracticeQuest(
      name: String!,
      description: String,
      repetitions: Int!,
      date: String!,
      ritualId: ID
    ): PracticeQuest

    updatePracticeQuest(
      id: ID!,
      name: String,
      description: String,
      repetitions: Int,
      ritualId: ID
    ): PracticeQuest

    updatePracticeQuestProgress(id: ID!, completedReps: Int!): PracticeQuest
    markPracticeQuestComplete(id: ID!): PracticeQuest
    deletePracticeQuest(id: ID!): PracticeQuest

    # Rituals
    addRitual(title: String!, description: String!): Ritual
    updateRitual(id: ID!, title: String!, description: String!): Ritual
    deleteRitual(id: ID!): Ritual
  }
`;

module.exports = typeDefs;