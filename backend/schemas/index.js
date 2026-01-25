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

   # 👤 USER (NEW!)
  type User {
    id: ID!
    email: String!
    name: String
    image: String
    
    # Gamification
    level: Int!
    xp: Int!
    xpToNextLevel: Int!
    
    # Realm Progress
    currentRealm: Int!
    unlockedRealms: [Int!]!
    completedTrials: [CompletedTrial!]!
    visitedLocations: [VisitedLocation!]!
    
    # Music Stats
    musicStats: MusicStats!
    
    # Streaks
    streaks: Streaks!
    
    createdAt: String
    updatedAt: String
  }
  
  # 🎯 TRIAL (NEW!)
  type CompletedTrial {
    realmId: Int!
    trialId: String!
    trialName: String
    stepsCompleted: Int!
    totalSteps: Int!
    isComplete: Boolean!
    completedAt: String
    xpEarned: Int!
  }
  
  # 📍 LOCATION (NEW!)
  type VisitedLocation {
    realmId: Int!
    locationId: String!
    locationName: String
    visitedAt: String!
    xpEarned: Int!
  }
  
  # 🎵 MUSIC STATS (NEW!)
  type MusicStats {
    tracksListened: [TrackListen!]!
    totalListeningTime: Int!
    favoriteRealm: Int
    totalTracksUnlocked: Int!
  }
  
  type TrackListen {
    realmId: Int!
    trackTitle: String!
    artist: String!
    listenCount: Int!
    totalListenTime: Int!
    firstListenedAt: String
    lastListenedAt: String!
    xpEarned: Int!
  }
  
  # 🔥 STREAKS (NEW!)
  type Streaks {
    currentStreak: Int!
    longestStreak: Int!
    lastLoginDate: String
    totalLogins: Int!
  }
  
  # 🏆 LEADERBOARD (NEW!)
  type LeaderboardEntry {
    rank: Int!
    user: User!
  }
  
  # ⚡ XP RESPONSE (NEW!)
  type XPGainResponse {
    user: User!
    xpGained: Int!
    leveledUp: Boolean!
    newLevel: Int!
    message: String!
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
    
    # ========================================
    # 🆕 MUSIC MULTIVERSE QUERIES (ADD THESE!)
    # ========================================
    me: User
    getUserProgress: User
    getLeaderboard(limit: Int): [LeaderboardEntry!]!
    checkRealmUnlock(realmId: Int!): Boolean!
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
    
    # ========================================
    # 🆕 MUSIC MULTIVERSE MUTATIONS (NEW!)
    # ========================================
    
    # Trial System
    startTrial(realmId: Int!, trialId: String!, trialName: String!): User!
    completeTrialStep(realmId: Int!, trialId: String!): XPGainResponse!
    
    # Location Exploration
    visitLocation(realmId: Int!, locationId: String!, locationName: String!): XPGainResponse!
    
    # Music Tracking
    logMusicListen(realmId: Int!, trackTitle: String!, duration: Int!): XPGainResponse!
    
    # Realm Management
    unlockRealm(realmId: Int!): User!
    setCurrentRealm(realmId: Int!): User!
    
    # Streaks
    logDailyLogin: XPGainResponse!
  }
`;

module.exports = typeDefs;