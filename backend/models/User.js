const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // ==========================================
  // AUTHENTICATION (NextAuth/GitHub)
  // ==========================================
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  image: String, // GitHub avatar
  
  // OAuth provider data
  accounts: [{
    provider: String,      // 'github'
    providerAccountId: String,
    type: String,
    access_token: String
  }],
  
  // ==========================================
  // GAMIFICATION (NEW!)
  // ==========================================
  level: { 
    type: Number, 
    default: 1 
  },
  
  xp: { 
    type: Number, 
    default: 0 
  },
  
  xpToNextLevel: { 
    type: Number, 
    default: 100 
  },
  
  // ==========================================
  // REALM PROGRESS (NEW!)
  // ==========================================
  currentRealm: { 
    type: Number, 
    default: 303 // Starting realm: Fractured Frontier
  },
  
  unlockedRealms: { 
    type: [Number], 
    default: [303, 202] // Start with 2 realms unlocked
  },
  
  // ==========================================
  // TRIAL COMPLETION (NEW!)
  // ==========================================
  completedTrials: [{
    realmId: { type: Number, required: true },
    trialId: { type: String, required: true },
    trialName: String,
    stepsCompleted: { type: Number, default: 0 },
    totalSteps: { type: Number, default: 3 },
    isComplete: { type: Boolean, default: false },
    completedAt: Date,
    xpEarned: { type: Number, default: 0 }
  }],
  
  // ==========================================
  // LOCATION VISITS (NEW!)
  // ==========================================
  visitedLocations: [{
    realmId: { type: Number, required: true },
    locationId: { type: String, required: true },
    locationName: String,
    visitedAt: Date,
    xpEarned: { type: Number, default: 25 }
  }],
  
  // ==========================================
  // MUSIC TRACKING (NEW!)
  // ==========================================
  musicStats: {
    tracksListened: [{
      realmId: Number,
      trackTitle: String,
      artist: { type: String, default: 'Cosmic 888' },
      listenCount: { type: Number, default: 0 },
      totalListenTime: { type: Number, default: 0 }, // seconds
      firstListenedAt: Date,
      lastListenedAt: Date,
      xpEarned: { type: Number, default: 0 }
    }],
    totalListeningTime: { type: Number, default: 0 },
    favoriteRealm: Number,
    totalTracksUnlocked: { type: Number, default: 6 }
  },
  
  // ==========================================
  // STREAKS (NEW!)
  // ==========================================
  streaks: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastLoginDate: Date,
    totalLogins: { type: Number, default: 0 }
  },
  
  // ==========================================
  // EXISTING RITUAL DATA (KEEP THESE!)
  // ==========================================
  // You can keep references to your existing models if needed
  moodEntries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MoodEntry' }],
  practiceQuests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PracticeQuest' }],
  rituals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rituals' }],
  sacredYes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SacredYes' }]
  
}, {
  timestamps: true // adds createdAt, updatedAt
});

// ==========================================
// HELPER METHODS
// ==========================================

// Calculate XP for next level (exponential curve)
UserSchema.methods.calculateXPForNextLevel = function() {
  return Math.floor(100 * Math.pow(1.5, this.level - 1));
};

// Check if user leveled up
UserSchema.methods.checkLevelUp = function() {
  const xpNeeded = this.calculateXPForNextLevel();
  if (this.xp >= xpNeeded) {
    this.level += 1;
    this.xp -= xpNeeded; // Carry over excess XP
    this.xpToNextLevel = this.calculateXPForNextLevel();
    return true;
  }
  return false;
};

// Award XP
UserSchema.methods.awardXP = function(amount) {
  this.xp += amount;
  const leveledUp = this.checkLevelUp();
  return { 
    leveledUp, 
    newLevel: this.level, 
    totalXP: this.xp 
  };
};

// Check if realm is unlocked
UserSchema.methods.isRealmUnlocked = function(realmId) {
  return this.unlockedRealms.includes(realmId);
};

// Unlock realm
UserSchema.methods.unlockRealm = function(realmId) {
  if (!this.isRealmUnlocked(realmId)) {
    this.unlockedRealms.push(realmId);
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', UserSchema);