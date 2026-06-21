const User = require("../models/User");
const SacredYes = require("../models/SacredYes");
const MoodEntry = require("../models/MoodEntry");
const PracticeQuest = require("../models/PracticeQuest");
const Ritual = require("../models/Rituals");

// 🌌 Creator World Models
const CreativeProfile = require("../models/CreativeProfile");
const ReleaseWorld = require("../models/ReleaseWorld");
const BoardArtifact = require("../models/BoardArtifact");

function normalizeSlug(slug) {
    return String(slug || "")
        .trim()
        .toLowerCase();
}

module.exports = {
    Query: {
        hello: () => "Hello Cosmic Tracker 🌙",
        todayMoonPhase: () => {
            const phases = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"];
            return phases[Math.floor(Math.random() * phases.length)];
        },

        // 🌟 Sacred Yes
        getSacredYes: async (_, { date }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await SacredYes.findOne({ userId: user.id, date });
        },

        allSacredYes: async (_, __, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await SacredYes.find({ userId: user.id }).sort({ date: -1 });
        },

        // 🪷 Mood Entries
        getMoodEntry: async (_, { date }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await MoodEntry.findOne({ userId: user.id, date });
        },

        allMoodEntries: async (_, __, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await MoodEntry.find({ userId: user.id }).sort({ date: -1 });
        },

        // 🧘 Practice Quests
        getDailyQuests: async (_, { date }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await PracticeQuest.find({ userId: user.id, date }).sort({ name: 1 });
        },

        allPracticeQuests: async (_, __, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await PracticeQuest.find({ userId: user.id }).sort({ date: -1 });
        },

        // 🔮 Rituals
        allRituals: async (_, __, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await Ritual.find({ userId: user.id }).sort({ createdAt: -1 });
        },

        getRitual: async (_, { id }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await Ritual.findOne({ _id: id, userId: user.id });
        },

        // ========================================
        // 🎵 MUSIC MULTIVERSE QUERIES
        // ========================================

        me: async (_, __, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await User.findOne({ email: user.email });
        },

        getUserProgress: async (_, __, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await User.findOne({ email: user.email });
        },

        getLeaderboard: async (_, { limit = 50 }) => {
            const users = await User.find()
                .sort({ level: -1, xp: -1 })
                .limit(limit);

            return users.map((user, index) => ({
                rank: index + 1,
                user,
            }));
        },

        checkRealmUnlock: async (_, { realmId }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            const userData = await User.findOne({ email: user.email });
            return userData ? userData.isRealmUnlocked(realmId) : false;
        },

        // ========================================
        // 🌌 CREATOR WORLD QUERIES
        // ========================================

        myCreativeProfiles: async (_, __, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            return await CreativeProfile.find({ ownerId: user.id }).sort({
                updatedAt: -1,
            });
        },

        myReleaseWorlds: async (_, __, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            return await ReleaseWorld.find({ ownerId: user.id }).sort({
                lastOpenedAt: -1,
                updatedAt: -1,
            });
        },

        getMyReleaseWorld: async (_, { id }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const releaseWorld = await ReleaseWorld.findOne({
                _id: id,
                ownerId: user.id,
            });

            if (releaseWorld) {
                releaseWorld.lastOpenedAt = new Date();
                await releaseWorld.save();
            }

            return releaseWorld;
        },

        getMyReleaseWorldBySlug: async (_, { slug }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const releaseWorld = await ReleaseWorld.findOne({
                slug: normalizeSlug(slug),
                ownerId: user.id,
            });

            if (releaseWorld) {
                releaseWorld.lastOpenedAt = new Date();
                await releaseWorld.save();
            }

            return releaseWorld;
        },

        getBoardArtifacts: async (_, { releaseWorldId }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            return await BoardArtifact.find({
                ownerId: user.id,
                releaseWorldId,
            }).sort({ createdAt: 1 });
        },
    },

    Mutation: {
        // 🌟 Sacred Yes
        addSacredYes: async (_, { text, date }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await SacredYes.create({ userId: user.id, text, date });
        },

        updateSacredYes: async (_, { id, text }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await SacredYes.findOneAndUpdate(
                { _id: id, userId: user.id },
                { text },
                { new: true }
            );
        },

        deleteSacredYes: async (_, { id }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await SacredYes.findOneAndDelete({ _id: id, userId: user.id });
        },

        // 🪷 Mood Entries
        addMoodEntry: async (_, { mood, note, date }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await MoodEntry.create({ userId: user.id, mood, note, date });
        },

        updateMoodEntry: async (_, { id, mood, note }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await MoodEntry.findOneAndUpdate(
                { _id: id, userId: user.id },
                { mood, note },
                { new: true }
            );
        },

        deleteMoodEntry: async (_, { id }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await MoodEntry.findOneAndDelete({ _id: id, userId: user.id });
        },

        // 🧘 Practice Quests
        addPracticeQuest: async (_, { name, description, repetitions, date, ritualId }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            return await PracticeQuest.create({
                userId: user.id,
                name,
                description,
                repetitions,
                date,
                ritualId: ritualId || null,
            });
        },

        updatePracticeQuest: async (_, { id, name, description, repetitions, ritualId }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const update = {};
            if (name !== undefined) update.name = name;
            if (description !== undefined) update.description = description;
            if (repetitions !== undefined) update.repetitions = repetitions;
            if (ritualId !== undefined) update.ritualId = ritualId;

            return await PracticeQuest.findOneAndUpdate(
                { _id: id, userId: user.id },
                update,
                { new: true }
            );
        },

        updatePracticeQuestProgress: async (_, { id, completedReps }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const quest = await PracticeQuest.findOneAndUpdate(
                { _id: id, userId: user.id },
                { completedReps },
                { new: true }
            );

            if (quest) {
                quest.completed = completedReps >= quest.repetitions;
                await quest.save();
            }

            return quest;
        },

        markPracticeQuestComplete: async (_, { id }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            return await PracticeQuest.findOneAndUpdate(
                { _id: id, userId: user.id },
                { completed: true },
                { new: true }
            );
        },

        deletePracticeQuest: async (_, { id }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");
            return await PracticeQuest.findOneAndDelete({ _id: id, userId: user.id });
        },

        // 🔮 Ritual Mutations
        addRitual: async (_, { title, description }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in to add a ritual.");

            return await Ritual.create({
                userId: user.id,
                title,
                description,
            });
        },

        updateRitual: async (_, { id, title, description }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in to update a ritual.");

            return await Ritual.findOneAndUpdate(
                { _id: id, userId: user.id },
                { title, description },
                { new: true }
            );
        },

        deleteRitual: async (_, { id }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in to delete a ritual.");

            return await Ritual.findOneAndDelete({
                _id: id,
                userId: user.id,
            });
        },

        // ========================================
        // 🎵 MUSIC MULTIVERSE MUTATIONS
        // ========================================

        startTrial: async (_, { realmId, trialId, trialName }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const userData = await User.findOne({ email: user.email });
            if (!userData) throw new Error("User not found.");

            const existingTrial = userData.completedTrials.find(
                (t) => t.realmId === realmId && t.trialId === trialId
            );

            if (existingTrial) return userData;

            userData.completedTrials.push({
                realmId,
                trialId,
                trialName,
                stepsCompleted: 0,
                totalSteps: 3,
                isComplete: false,
            });

            await userData.save();
            return userData;
        },

        completeTrialStep: async (_, { realmId, trialId }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const userData = await User.findOne({ email: user.email });
            if (!userData) throw new Error("User not found.");

            const trial = userData.completedTrials.find(
                (t) => t.realmId === realmId && t.trialId === trialId
            );

            if (!trial) throw new Error("Trial not found. Start it first.");

            if (trial.isComplete) {
                return {
                    user: userData,
                    xpGained: 0,
                    leveledUp: false,
                    newLevel: userData.level,
                    message: "Trial already completed!",
                };
            }

            trial.stepsCompleted += 1;

            let xpGained = 50;
            let message = `+${xpGained} XP! Step ${trial.stepsCompleted}/${trial.totalSteps} complete!`;

            if (trial.stepsCompleted >= trial.totalSteps) {
                trial.isComplete = true;
                trial.completedAt = new Date();
                xpGained += 100;
                message = `🎉 Trial complete! +${xpGained} XP!`;
            }

            trial.xpEarned = (trial.xpEarned || 0) + xpGained;

            const { leveledUp, newLevel } = userData.awardXP(xpGained);

            await userData.save();

            if (leveledUp) {
                message += ` 🔥 LEVEL UP! You're now Level ${newLevel}!`;
            }

            return {
                user: userData,
                xpGained,
                leveledUp,
                newLevel,
                message,
            };
        },

        visitLocation: async (_, { realmId, locationId, locationName }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const userData = await User.findOne({ email: user.email });
            if (!userData) throw new Error("User not found.");

            const alreadyVisited = userData.visitedLocations.find(
                (loc) => loc.realmId === realmId && loc.locationId === locationId
            );

            if (alreadyVisited) {
                return {
                    user: userData,
                    xpGained: 0,
                    leveledUp: false,
                    newLevel: userData.level,
                    message: "Already explored this location!",
                };
            }

            const xpGained = 25;

            userData.visitedLocations.push({
                realmId,
                locationId,
                locationName,
                visitedAt: new Date(),
                xpEarned: xpGained,
            });

            const { leveledUp, newLevel } = userData.awardXP(xpGained);

            await userData.save();

            let message = `Explored ${locationName}! +${xpGained} XP`;
            if (leveledUp) message += ` 🔥 LEVEL UP to ${newLevel}!`;

            return {
                user: userData,
                xpGained,
                leveledUp,
                newLevel,
                message,
            };
        },

        logMusicListen: async (_, { realmId, trackTitle, duration }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const userData = await User.findOne({ email: user.email });
            if (!userData) throw new Error("User not found.");

            let trackRecord = userData.musicStats.tracksListened.find(
                (t) => t.realmId === realmId && t.trackTitle === trackTitle
            );

            let xpGained = 0;
            let isFirstListen = false;

            if (!trackRecord) {
                isFirstListen = true;
                xpGained = 50;

                userData.musicStats.tracksListened.push({
                    realmId,
                    trackTitle,
                    artist: "Cosmic 888",
                    listenCount: 1,
                    totalListenTime: duration,
                    firstListenedAt: new Date(),
                    lastListenedAt: new Date(),
                    xpEarned: xpGained,
                });
            } else {
                xpGained = 30;
                trackRecord.listenCount += 1;
                trackRecord.totalListenTime += duration;
                trackRecord.lastListenedAt = new Date();
                trackRecord.xpEarned += xpGained;
            }

            userData.musicStats.totalListeningTime += duration;

            const { leveledUp, newLevel } = userData.awardXP(xpGained);

            await userData.save();

            let message = isFirstListen
                ? `🎵 First listen to "${trackTitle}"! +${xpGained} XP!`
                : `🎵 +${xpGained} XP for vibing to "${trackTitle}"!`;

            if (leveledUp) message += ` 🔥 LEVEL UP to ${newLevel}!`;

            return {
                user: userData,
                xpGained,
                leveledUp,
                newLevel,
                message,
            };
        },

        unlockRealm: async (_, { realmId }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const userData = await User.findOne({ email: user.email });
            if (!userData) throw new Error("User not found.");

            const wasUnlocked = userData.unlockRealm(realmId);

            if (wasUnlocked) {
                userData.awardXP(200);
                await userData.save();
            }

            return userData;
        },

        setCurrentRealm: async (_, { realmId }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const userData = await User.findOne({ email: user.email });
            if (!userData) throw new Error("User not found.");

            if (!userData.isRealmUnlocked(realmId)) {
                throw new Error("Realm not unlocked yet!");
            }

            userData.currentRealm = realmId;

            await userData.save();
            return userData;
        },

        logDailyLogin: async (_, __, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const userData = await User.findOne({ email: user.email });
            if (!userData) throw new Error("User not found.");

            const today = new Date().toDateString();
            const lastLogin = userData.streaks.lastLoginDate
                ? new Date(userData.streaks.lastLoginDate).toDateString()
                : null;

            if (lastLogin === today) {
                return {
                    user: userData,
                    xpGained: 0,
                    leveledUp: false,
                    newLevel: userData.level,
                    message: "Already logged in today!",
                };
            }

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (lastLogin === yesterdayStr) {
                userData.streaks.currentStreak += 1;
            } else {
                userData.streaks.currentStreak = 1;
            }

            if (userData.streaks.currentStreak > userData.streaks.longestStreak) {
                userData.streaks.longestStreak = userData.streaks.currentStreak;
            }

            userData.streaks.lastLoginDate = new Date();
            userData.streaks.totalLogins += 1;

            const bonusXP = Math.min(userData.streaks.currentStreak * 5, 50);
            const xpGained = 10 + bonusXP;

            const { leveledUp, newLevel } = userData.awardXP(xpGained);

            await userData.save();

            let message = `Daily login! +${xpGained} XP! 🔥 ${userData.streaks.currentStreak} day streak!`;
            if (leveledUp) message += ` 🎉 LEVEL UP to ${newLevel}!`;

            return {
                user: userData,
                xpGained,
                leveledUp,
                newLevel,
                message,
            };
        },

        // ========================================
        // 🌌 CREATOR WORLD MUTATIONS
        // ========================================

        createCreativeProfile: async (_, { input }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            return await CreativeProfile.create({
                ...input,
                slug: normalizeSlug(input.slug),
                ownerId: user.id,
            });
        },

        createReleaseWorld: async (_, { input }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const profile = await CreativeProfile.findOne({
                _id: input.creativeProfileId,
                ownerId: user.id,
            });

            if (!profile) {
                throw new Error("Creative profile not found.");
            }

            return await ReleaseWorld.create({
                ...input,
                slug: normalizeSlug(input.slug),
                ownerId: user.id,
                creativeProfileId: profile._id,
                fullDropDate: input.fullDropDate ? new Date(input.fullDropDate) : null,
                lastOpenedAt: new Date(),
            });
        },

        updateReleaseWorld: async (_, { id, input }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const update = {
                ...input,
                lastOpenedAt: new Date(),
            };

            if (input.slug !== undefined) {
                update.slug = normalizeSlug(input.slug);
            }

            if (input.fullDropDate !== undefined) {
                update.fullDropDate = input.fullDropDate
                    ? new Date(input.fullDropDate)
                    : null;
            }

            return await ReleaseWorld.findOneAndUpdate(
                { _id: id, ownerId: user.id },
                update,
                { new: true }
            );
        },

        archiveReleaseWorld: async (_, { id }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            return await ReleaseWorld.findOneAndUpdate(
                { _id: id, ownerId: user.id },
                { status: "archived" },
                { new: true }
            );
        },

        saveBoardArtifacts: async (_, { releaseWorldId, artifacts }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const releaseWorld = await ReleaseWorld.findOne({
                _id: releaseWorldId,
                ownerId: user.id,
            });

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            await BoardArtifact.deleteMany({
                ownerId: user.id,
                releaseWorldId,
            });

            if (!artifacts.length) {
                releaseWorld.lastOpenedAt = new Date();
                await releaseWorld.save();
                return [];
            }

            const docs = await BoardArtifact.insertMany(
                artifacts.map((artifact) => ({
                    ownerId: user.id,
                    releaseWorldId,
                    kind: artifact.kind,
                    eyebrow: artifact.eyebrow || "",
                    title: artifact.title,
                    body: artifact.body || "",
                    meta: artifact.meta || "",
                    href: artifact.href || "",
                    connectedTrackSlug: artifact.connectedTrackSlug || "",
                    position: {
                        x: artifact.x,
                        y: artifact.y,
                        rotate: artifact.rotate || 0,
                    },
                    style: {
                        color: artifact.color || "cream",
                        size: artifact.size || "md",
                        layer: artifact.layer || 4,
                    },
                    isGenerated: artifact.isGenerated || false,
                    isUserCreated:
                        artifact.isUserCreated === undefined
                            ? true
                            : artifact.isUserCreated,
                }))
            );

            releaseWorld.lastOpenedAt = new Date();
            await releaseWorld.save();

            return docs;
        },
    },

    PracticeQuest: {
        ritual: async (parent, _, { user }) => {
            if (!parent.ritualId) return null;
            return await Ritual.findOne({ _id: parent.ritualId, userId: user.id });
        },
    },
};