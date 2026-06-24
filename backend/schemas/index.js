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
    ritualId: ID
    ritual: Ritual
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

  # 👤 USER
  type User {
    id: ID!
    email: String!
    name: String
    image: String

    level: Int!
    xp: Int!
    xpToNextLevel: Int!

    currentRealm: Int!
    unlockedRealms: [Int!]!
    completedTrials: [CompletedTrial!]!
    visitedLocations: [VisitedLocation!]!

    musicStats: MusicStats!
    streaks: Streaks!

    createdAt: String
    updatedAt: String
  }

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

  type VisitedLocation {
    realmId: Int!
    locationId: String!
    locationName: String!
    visitedAt: String!
    xpEarned: Int!
  }

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

  type Streaks {
    currentStreak: Int!
    longestStreak: Int!
    lastLoginDate: String
    totalLogins: Int!
  }

  type LeaderboardEntry {
    rank: Int!
    user: User!
  }

  type XPGainResponse {
    user: User!
    xpGained: Int!
    leveledUp: Boolean!
    newLevel: Int!
    message: String!
  }

  # ========================================
  # 🌌 CREATOR WORLD TYPES
  # ========================================

  type CreativeProfile {
    id: ID!
    ownerId: String!
    artistName: String!
    slug: String!
    displayName: String
    tagline: String
    bio: String
    isPublic: Boolean!
    isFeatured: Boolean!
    featuredReleaseWorldId: ID
    createdAt: String
    updatedAt: String
  }

  type ReleaseWorld {
    id: ID!
    ownerId: String!
    creativeProfileId: ID!
    title: String!
    slug: String!
    releaseType: String!
    status: String!
    visibility: String!
    isFeatured: Boolean!
    oneLineSummary: String
    story: String
    currentFocus: String
    secondFocus: String
    fullDropDate: String
    coverArtUrl: String
    coverAssetId: ID
    createdAt: String
    updatedAt: String
    lastOpenedAt: String
  }

  type ReleaseTrack {
    id: ID!
    ownerId: String!
    releaseWorldId: ID!
    title: String!
    slug: String!
    trackNumber: Int!
    role: String!
    status: String!
    bpm: Int
    keySignature: String
    mood: String
    hook: String
    notes: String
    audioUrl: String
    isFocusTrack: Boolean!
    isSecondFocus: Boolean!
    isPublic: Boolean!
    createdAt: String
    updatedAt: String
    lastOpenedAt: String
  }

  type ReleaseAsset {
    id: ID!
    ownerId: String!
    releaseWorldId: ID!
    trackId: ID
    boardArtifactId: ID
    kind: String!
    usage: String!
    title: String!
    description: String
    url: String!
    fileName: String
    mimeType: String
    size: Int
    isPublic: Boolean!
    createdAt: String
    updatedAt: String
    lastOpenedAt: String
  }

  type BoardArtifact {
    id: ID!
    ownerId: String!
    releaseWorldId: ID!
    kind: String!
    eyebrow: String
    title: String!
    body: String
    meta: String
    href: String
    connectedTrackSlug: String
    position: BoardArtifactPosition!
    style: BoardArtifactStyle!
    isGenerated: Boolean!
    isUserCreated: Boolean!
    isPublic: Boolean!
    pageSection: String
    pageOrder: Int
    createdAt: String
    updatedAt: String
  }

  type BoardArtifactPosition {
    x: Float!
    y: Float!
    rotate: Float!
  }

  type BoardArtifactStyle {
    color: String!
    size: String!
    layer: Int!
  }

  input CreativeProfileInput {
    artistName: String!
    slug: String!
    displayName: String
    tagline: String
    bio: String
    isPublic: Boolean
    isFeatured: Boolean
  }

  input ReleaseWorldInput {
    creativeProfileId: ID!
    title: String!
    slug: String!
    releaseType: String
    status: String
    visibility: String
    isFeatured: Boolean
    oneLineSummary: String
    story: String
    currentFocus: String
    secondFocus: String
    fullDropDate: String
    coverArtUrl: String
    coverAssetId: ID
  }

  input UpdateReleaseWorldInput {
    title: String
    slug: String
    releaseType: String
    status: String
    visibility: String
    isFeatured: Boolean
    oneLineSummary: String
    story: String
    currentFocus: String
    secondFocus: String
    fullDropDate: String
    coverArtUrl: String
    coverAssetId: ID
  }

  input ReleaseTrackInput {
    releaseWorldId: ID!
    title: String!
    slug: String
    trackNumber: Int
    role: String
    status: String
    bpm: Int
    keySignature: String
    mood: String
    hook: String
    notes: String
    audioUrl: String
    isFocusTrack: Boolean
    isSecondFocus: Boolean
    isPublic: Boolean
  }

  input UpdateReleaseTrackInput {
    title: String
    slug: String
    trackNumber: Int
    role: String
    status: String
    bpm: Int
    keySignature: String
    mood: String
    hook: String
    notes: String
    audioUrl: String
    isFocusTrack: Boolean
    isSecondFocus: Boolean
    isPublic: Boolean
  }

  input ReleaseAssetInput {
    releaseWorldId: ID!
    trackId: ID
    boardArtifactId: ID
    kind: String
    usage: String
    title: String!
    description: String
    url: String!
    fileName: String
    mimeType: String
    size: Int
    isPublic: Boolean
  }

  input UpdateReleaseAssetInput {
    trackId: ID
    boardArtifactId: ID
    kind: String
    usage: String
    title: String
    description: String
    url: String
    fileName: String
    mimeType: String
    size: Int
    isPublic: Boolean
  }

  input BoardArtifactInput {
    id: ID
    kind: String!
    eyebrow: String
    title: String!
    body: String
    meta: String
    href: String
    connectedTrackSlug: String
    x: Float!
    y: Float!
    rotate: Float
    color: String
    size: String
    layer: Int
    isGenerated: Boolean
    isUserCreated: Boolean
    isPublic: Boolean
    pageSection: String
    pageOrder: Int
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

    # Music Multiverse
    me: User
    getUserProgress: User
    getLeaderboard(limit: Int): [LeaderboardEntry!]!
    checkRealmUnlock(realmId: Int!): Boolean!

    # Creator Worlds
    myCreativeProfiles: [CreativeProfile!]!
    myReleaseWorlds: [ReleaseWorld!]!
    getMyReleaseWorld(id: ID!): ReleaseWorld
    getMyReleaseWorldBySlug(slug: String!): ReleaseWorld

    getReleaseTracks(releaseWorldId: ID!): [ReleaseTrack!]!
    getReleaseTrack(id: ID!): ReleaseTrack

    getReleaseAssets(releaseWorldId: ID!): [ReleaseAsset!]!
    getReleaseAsset(id: ID!): ReleaseAsset

    getBoardArtifacts(releaseWorldId: ID!): [BoardArtifact!]!
    getPublicBoardArtifacts(releaseWorldId: ID!): [BoardArtifact!]!
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
      name: String!
      description: String
      repetitions: Int!
      date: String!
      ritualId: ID
    ): PracticeQuest

    updatePracticeQuest(
      id: ID!
      name: String
      description: String
      repetitions: Int
      ritualId: ID
    ): PracticeQuest

    updatePracticeQuestProgress(id: ID!, completedReps: Int!): PracticeQuest
    markPracticeQuestComplete(id: ID!): PracticeQuest
    deletePracticeQuest(id: ID!): PracticeQuest

    # Rituals
    addRitual(title: String!, description: String!): Ritual
    updateRitual(id: ID!, title: String!, description: String!): Ritual
    deleteRitual(id: ID!): Ritual

    # Music Multiverse
    startTrial(realmId: Int!, trialId: String!, trialName: String!): User!
    completeTrialStep(realmId: Int!, trialId: String!): XPGainResponse!

    visitLocation(
      realmId: Int!
      locationId: String!
      locationName: String!
    ): XPGainResponse!

    logMusicListen(
      realmId: Int!
      trackTitle: String!
      duration: Int!
    ): XPGainResponse!

    unlockRealm(realmId: Int!): User!
    setCurrentRealm(realmId: Int!): User!
    logDailyLogin: XPGainResponse!

    # Creator Worlds
    createCreativeProfile(input: CreativeProfileInput!): CreativeProfile!
    createReleaseWorld(input: ReleaseWorldInput!): ReleaseWorld!
    updateReleaseWorld(id: ID!, input: UpdateReleaseWorldInput!): ReleaseWorld!
    archiveReleaseWorld(id: ID!): ReleaseWorld!

    createReleaseTrack(input: ReleaseTrackInput!): ReleaseTrack!
    updateReleaseTrack(id: ID!, input: UpdateReleaseTrackInput!): ReleaseTrack!
    deleteReleaseTrack(id: ID!): ReleaseTrack
    reorderReleaseTracks(
      releaseWorldId: ID!
      orderedTrackIds: [ID!]!
    ): [ReleaseTrack!]!

    createReleaseAsset(input: ReleaseAssetInput!): ReleaseAsset!
    updateReleaseAsset(id: ID!, input: UpdateReleaseAssetInput!): ReleaseAsset!
    deleteReleaseAsset(id: ID!): ReleaseAsset

    saveBoardArtifacts(
      releaseWorldId: ID!
      artifacts: [BoardArtifactInput!]!
    ): [BoardArtifact!]!
  }
`;

module.exports = typeDefs;