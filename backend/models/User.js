const mongoose = require('mongoose');

const PLATFORM_PERMISSION_VALUES = [
    'creator.support',
    'nexus.publish',
    'nexus.editorial'
];

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
    image: String,

    accounts: [{
        provider: String,
        providerAccountId: String,
        type: String,
        access_token: String
    }],

    // ==========================================
    // PLATFORM ACCESS
    // ==========================================
    role: {
        type: String,
        enum: ['listener', 'creator', 'admin', 'owner'],
        default: 'listener',
        index: true
    },

    creatorStatus: {
        type: String,
        enum: ['none', 'invited', 'active', 'suspended'],
        default: 'none',
        index: true
    },

    // Fine-grained elevation for trusted admins. Owners implicitly have all
    // platform permissions and do not need entries here.
    platformPermissions: {
        type: [{
            type: String,
            enum: PLATFORM_PERMISSION_VALUES
        }],
        default: []
    },

    // Creator ownerIds this admin is explicitly allowed to assist.
    // This does not grant Nexus publishing/editorial authority by itself.
    creatorAccessOwnerIds: {
        type: [String],
        default: [],
        index: true
    },

    // ==========================================
    // GAMIFICATION
    // ==========================================
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    xpToNextLevel: { type: Number, default: 100 },

    // ==========================================
    // REALM PROGRESS
    // ==========================================
    currentRealm: { type: Number, default: 303 },
    unlockedRealms: { type: [Number], default: [303, 202] },

    // ==========================================
    // TRIAL COMPLETION
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
    // LOCATION VISITS
    // ==========================================
    visitedLocations: [{
        realmId: { type: Number, required: true },
        locationId: { type: String, required: true },
        locationName: String,
        visitedAt: Date,
        xpEarned: { type: Number, default: 25 }
    }],

    // ==========================================
    // MUSIC TRACKING
    // ==========================================
    musicStats: {
        tracksListened: [{
            realmId: Number,
            trackTitle: String,
            artist: { type: String, default: 'Cosmic 888' },
            listenCount: { type: Number, default: 0 },
            totalListenTime: { type: Number, default: 0 },
            firstListenedAt: Date,
            lastListenedAt: Date,
            xpEarned: { type: Number, default: 0 }
        }],
        totalListeningTime: { type: Number, default: 0 },
        favoriteRealm: Number,
        totalTracksUnlocked: { type: Number, default: 6 }
    },

    // ==========================================
    // STREAKS
    // ==========================================
    streaks: {
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastLoginDate: Date,
        totalLogins: { type: Number, default: 0 }
    },

    // ==========================================
    // EXISTING RITUAL DATA
    // ==========================================
    moodEntries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MoodEntry' }],
    practiceQuests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PracticeQuest' }],
    rituals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rituals' }],
    sacredYes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SacredYes' }]

}, {
    timestamps: true
});

UserSchema.methods.calculateXPForNextLevel = function () {
    return Math.floor(100 * Math.pow(1.5, this.level - 1));
};

UserSchema.methods.checkLevelUp = function () {
    const xpNeeded = this.calculateXPForNextLevel();
    if (this.xp >= xpNeeded) {
        this.level += 1;
        this.xp -= xpNeeded;
        this.xpToNextLevel = this.calculateXPForNextLevel();
        return true;
    }
    return false;
};

UserSchema.methods.awardXP = function (amount) {
    this.xp += amount;
    const leveledUp = this.checkLevelUp();
    return {
        leveledUp,
        newLevel: this.level,
        totalXP: this.xp
    };
};

UserSchema.methods.isRealmUnlocked = function (realmId) {
    return this.unlockedRealms.includes(realmId);
};

UserSchema.methods.unlockRealm = function (realmId) {
    if (!this.isRealmUnlocked(realmId)) {
        this.unlockedRealms.push(realmId);
        return true;
    }
    return false;
};

module.exports = mongoose.model('User', UserSchema);
