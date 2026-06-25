const User = require("../models/User");
const SacredYes = require("../models/SacredYes");
const MoodEntry = require("../models/MoodEntry");
const PracticeQuest = require("../models/PracticeQuest");
const Ritual = require("../models/Rituals");

// 🌌 Creator World Models
const CreativeProfile = require("../models/CreativeProfile");
const ReleaseWorld = require("../models/ReleaseWorld");
const BoardArtifact = require("../models/BoardArtifact");
const ReleaseTrack = require("../models/ReleaseTrack");
const ReleaseAsset = require("../models/ReleaseAsset");

function normalizeSlug(slug) {
    return String(slug || "")
        .trim()
        .toLowerCase();
}

function slugifyTitle(title) {
    return String(title || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function normalizeTrackSlug(inputSlug, title) {
    const fallback = slugifyTitle(title);
    return normalizeSlug(inputSlug || fallback);
}

function normalizeOptionalId(value) {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const cleanValue = String(value).trim();
    return cleanValue ? cleanValue : null;
}

async function getOwnedReleaseWorld(releaseWorldId, userId) {
    return await ReleaseWorld.findOne({
        _id: releaseWorldId,
        ownerId: userId,
    });
}

async function getOwnedReleaseTrack(trackId, userId, releaseWorldId) {
    if (!trackId) return null;

    const query = {
        _id: trackId,
        ownerId: userId,
    };

    if (releaseWorldId) {
        query.releaseWorldId = releaseWorldId;
    }

    return await ReleaseTrack.findOne(query);
}

async function getOwnedBoardArtifact(boardArtifactId, userId, releaseWorldId) {
    if (!boardArtifactId) return null;

    const query = {
        _id: boardArtifactId,
        ownerId: userId,
    };

    if (releaseWorldId) {
        query.releaseWorldId = releaseWorldId;
    }

    return await BoardArtifact.findOne(query);
}

async function getPrimaryCreativeProfile(userId) {
    const profiles = await CreativeProfile.find({ ownerId: userId }).sort({
        isFeatured: -1,
        updatedAt: -1,
        createdAt: -1,
    });

    return profiles.find((profile) => profile.isFeatured) || profiles[0] || null;
}

async function getFeaturedReleaseWorldForUser(userId) {
    const primaryProfile = await getPrimaryCreativeProfile(userId);

    if (primaryProfile?.featuredReleaseWorldId) {
        const profileFeaturedRelease = await ReleaseWorld.findOne({
            _id: primaryProfile.featuredReleaseWorldId,
            ownerId: userId,
        });

        if (profileFeaturedRelease) return profileFeaturedRelease;
    }

    const flaggedFeaturedRelease = await ReleaseWorld.findOne({
        ownerId: userId,
        isFeatured: true,
    }).sort({
        lastOpenedAt: -1,
        updatedAt: -1,
        createdAt: -1,
    });

    if (flaggedFeaturedRelease) return flaggedFeaturedRelease;

    return await ReleaseWorld.findOne({ ownerId: userId }).sort({
        lastOpenedAt: -1,
        updatedAt: -1,
        createdAt: -1,
    });
}

async function getPublicFeaturedReleaseWorld() {
    const featuredProfile = await CreativeProfile.findOne({
        isFeatured: true,
        isPublic: true,
        featuredReleaseWorldId: { $ne: null },
    }).sort({
        updatedAt: -1,
        createdAt: -1,
    });

    if (featuredProfile?.featuredReleaseWorldId) {
        const profileFeaturedRelease = await ReleaseWorld.findOne({
            _id: featuredProfile.featuredReleaseWorldId,
            visibility: "public",
            status: { $ne: "archived" },
        });

        if (profileFeaturedRelease) return profileFeaturedRelease;
    }

    return await ReleaseWorld.findOne({
        isFeatured: true,
        visibility: "public",
        status: { $ne: "archived" },
    }).sort({
        lastOpenedAt: -1,
        updatedAt: -1,
        createdAt: -1,
    });
}

async function syncReleaseWorldFocusFromTrack(track, userId) {
    if (!track) return;

    const update = {
        lastOpenedAt: new Date(),
    };

    if (track.isFocusTrack) {
        update.currentFocus = track.title;

        await ReleaseTrack.updateMany(
            {
                ownerId: userId,
                releaseWorldId: track.releaseWorldId,
                _id: { $ne: track._id },
            },
            { isFocusTrack: false }
        );
    }

    if (track.isSecondFocus) {
        update.secondFocus = track.title;

        await ReleaseTrack.updateMany(
            {
                ownerId: userId,
                releaseWorldId: track.releaseWorldId,
                _id: { $ne: track._id },
            },
            { isSecondFocus: false }
        );
    }

    if (track.isFocusTrack || track.isSecondFocus) {
        await ReleaseWorld.findOneAndUpdate(
            {
                _id: track.releaseWorldId,
                ownerId: userId,
            },
            update,
            { new: true }
        );
    }
}

async function syncReleaseAssetTargets(asset, userId) {
    if (!asset) return;

    const isCoverAsset = asset.usage === "cover" || asset.kind === "cover";
    const isTrackAudioAsset =
        asset.usage === "track-audio" || asset.kind === "audio";

    if (isCoverAsset) {
        await ReleaseWorld.findOneAndUpdate(
            {
                _id: asset.releaseWorldId,
                ownerId: userId,
            },
            {
                coverArtUrl: asset.url || "",
                coverAssetId: asset._id,
                lastOpenedAt: new Date(),
            },
            { new: true }
        );
    }

    if (isTrackAudioAsset && asset.trackId) {
        await ReleaseTrack.findOneAndUpdate(
            {
                _id: asset.trackId,
                ownerId: userId,
                releaseWorldId: asset.releaseWorldId,
            },
            {
                audioUrl: asset.url || "",
                lastOpenedAt: new Date(),
            },
            { new: true }
        );
    }
}

async function clearReleaseAssetTargets(asset, userId) {
    if (!asset) return;

    const isCoverAsset = asset.usage === "cover" || asset.kind === "cover";
    const isTrackAudioAsset =
        asset.usage === "track-audio" || asset.kind === "audio";

    if (isCoverAsset) {
        await ReleaseWorld.findOneAndUpdate(
            {
                _id: asset.releaseWorldId,
                ownerId: userId,
                coverAssetId: asset._id,
            },
            {
                coverArtUrl: "",
                coverAssetId: null,
                lastOpenedAt: new Date(),
            },
            { new: true }
        );
    }

    if (isTrackAudioAsset && asset.trackId) {
        await ReleaseTrack.findOneAndUpdate(
            {
                _id: asset.trackId,
                ownerId: userId,
                releaseWorldId: asset.releaseWorldId,
                audioUrl: asset.url,
            },
            {
                audioUrl: "",
                lastOpenedAt: new Date(),
            },
            { new: true }
        );
    }
}


function isImageAssetLike({ kind, usage, mimeType = "", fileName = "", url = "" }) {
    const normalizedKind = String(kind || "").toLowerCase();
    const normalizedUsage = String(usage || "").toLowerCase();
    const normalizedMime = String(mimeType || "").toLowerCase();
    const normalizedFile = String(fileName || url || "").toLowerCase();

    const wantsCover = normalizedUsage === "cover" || normalizedKind === "cover";
    if (!wantsCover) return true;

    return (
        normalizedMime.startsWith("image/") ||
        /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/.test(normalizedFile)
    );
}

function isAudioAssetLike({ kind, usage, mimeType = "", fileName = "", url = "" }) {
    const normalizedKind = String(kind || "").toLowerCase();
    const normalizedUsage = String(usage || "").toLowerCase();
    const normalizedMime = String(mimeType || "").toLowerCase();
    const normalizedFile = String(fileName || url || "").toLowerCase();

    const wantsAudio = normalizedUsage === "track-audio" || normalizedKind === "audio";
    if (!wantsAudio) return true;

    return (
        normalizedMime.startsWith("audio/") ||
        /\.(mp3|wav|m4a|aac|flac|ogg|oga|aiff|aif)(\?.*)?$/.test(normalizedFile)
    );
}

function validateReleaseAssetShape(input) {
    if (!isImageAssetLike(input)) {
        throw new Error("Cover assets must be image files. Change Usage/Kind or upload an image.");
    }

    if (!isAudioAssetLike(input)) {
        throw new Error("Track audio assets must be audio files. Change Usage/Kind or upload an audio file.");
    }
}

function isVercelBlobUrl(value) {
    if (!value) return false;

    try {
        const hostname = new URL(value).hostname;
        return (
            hostname.endsWith(".blob.vercel-storage.com") ||
            hostname.endsWith(".public.blob.vercel-storage.com")
        );
    } catch {
        return false;
    }
}

async function tryDeleteBlobForAsset(asset) {
    if (!asset?.url) {
        return { deleted: false, reason: "No asset URL." };
    }

    if (!isVercelBlobUrl(asset.url)) {
        return { deleted: false, reason: "Asset URL is not a Vercel Blob URL." };
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
        console.warn(
            "[deleteReleaseAsset] BLOB_READ_WRITE_TOKEN is not configured on the backend. Mongo asset will be deleted, but Blob cleanup was skipped."
        );
        return { deleted: false, reason: "Missing BLOB_READ_WRITE_TOKEN." };
    }

    try {
        const { del } = await import("@vercel/blob");
        await del(asset.url, { token });
        return { deleted: true, reason: "Deleted from Vercel Blob." };
    } catch (error) {
        console.warn("[deleteReleaseAsset] Blob cleanup failed:", {
            assetId: String(asset._id),
            url: asset.url,
            message: error instanceof Error ? error.message : String(error),
        });

        return { deleted: false, reason: "Blob cleanup failed." };
    }
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

        getMyFeaturedReleaseWorld: async (_, __, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            return await getFeaturedReleaseWorldForUser(user.id);
        },

        getPublicFeaturedReleaseWorld: async () => {
            return await getPublicFeaturedReleaseWorld();
        },

        getReleaseTracks: async (_, { releaseWorldId }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const releaseWorld = await getOwnedReleaseWorld(releaseWorldId, user.id);

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            return await ReleaseTrack.find({
                ownerId: user.id,
                releaseWorldId,
            }).sort({
                trackNumber: 1,
                createdAt: 1,
            });
        },

        getReleaseTrack: async (_, { id }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const track = await ReleaseTrack.findOne({
                _id: id,
                ownerId: user.id,
            });

            if (track) {
                track.lastOpenedAt = new Date();
                await track.save();
            }

            return track;
        },

        getReleaseAssets: async (_, { releaseWorldId }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const releaseWorld = await getOwnedReleaseWorld(releaseWorldId, user.id);

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            return await ReleaseAsset.find({
                ownerId: user.id,
                releaseWorldId,
            }).sort({
                usage: 1,
                createdAt: -1,
            });
        },

        getReleaseAsset: async (_, { id }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const asset = await ReleaseAsset.findOne({
                _id: id,
                ownerId: user.id,
            });

            if (asset) {
                asset.lastOpenedAt = new Date();
                await asset.save();
            }

            return asset;
        },

        getBoardArtifacts: async (_, { releaseWorldId }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const releaseWorld = await getOwnedReleaseWorld(releaseWorldId, user.id);

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            return await BoardArtifact.find({
                ownerId: user.id,
                releaseWorldId,
            }).sort({
                pageOrder: 1,
                createdAt: 1,
            });
        },

        getPublicBoardArtifacts: async (_, { releaseWorldId }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const releaseWorld = await getOwnedReleaseWorld(releaseWorldId, user.id);

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            return await BoardArtifact.find({
                ownerId: user.id,
                releaseWorldId,
                isPublic: true,
            }).sort({
                pageSection: 1,
                pageOrder: 1,
                createdAt: 1,
            });
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
                coverAssetId: normalizeOptionalId(input.coverAssetId),
                coverArtUrl: input.coverArtUrl || "",
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

            if (input.coverAssetId !== undefined) {
                update.coverAssetId = normalizeOptionalId(input.coverAssetId);
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

        setFeaturedReleaseWorld: async (_, { releaseWorldId }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const releaseWorld = await getOwnedReleaseWorld(releaseWorldId, user.id);

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            const creativeProfile = await CreativeProfile.findOne({
                _id: releaseWorld.creativeProfileId,
                ownerId: user.id,
            });

            if (!creativeProfile) {
                throw new Error("Creative profile not found for this release world.");
            }

            await ReleaseWorld.updateMany(
                {
                    ownerId: user.id,
                    _id: { $ne: releaseWorld._id },
                },
                { isFeatured: false }
            );

            await CreativeProfile.updateMany(
                {
                    ownerId: user.id,
                    _id: { $ne: creativeProfile._id },
                },
                { isFeatured: false }
            );

            releaseWorld.isFeatured = true;
            releaseWorld.lastOpenedAt = new Date();
            await releaseWorld.save();

            creativeProfile.isFeatured = true;
            creativeProfile.featuredReleaseWorldId = releaseWorld._id;
            await creativeProfile.save();

            return releaseWorld;
        },

        createReleaseTrack: async (_, { input }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const releaseWorld = await getOwnedReleaseWorld(input.releaseWorldId, user.id);

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            const existingTracksCount = await ReleaseTrack.countDocuments({
                ownerId: user.id,
                releaseWorldId: input.releaseWorldId,
            });

            const trackNumber = input.trackNumber || existingTracksCount + 1;
            const slug = normalizeTrackSlug(input.slug, input.title);

            const track = await ReleaseTrack.create({
                ownerId: user.id,
                releaseWorldId: releaseWorld._id,
                title: input.title,
                slug,
                trackNumber,
                role: input.role || "unknown",
                status: input.status || "idea",
                bpm: input.bpm || null,
                keySignature: input.keySignature || "",
                mood: input.mood || "",
                hook: input.hook || "",
                notes: input.notes || "",
                audioUrl: input.audioUrl || "",
                isFocusTrack: input.isFocusTrack || false,
                isSecondFocus: input.isSecondFocus || false,
                isPublic: input.isPublic || false,
                lastOpenedAt: new Date(),
            });

            await syncReleaseWorldFocusFromTrack(track, user.id);

            releaseWorld.lastOpenedAt = new Date();
            await releaseWorld.save();

            return track;
        },

        updateReleaseTrack: async (_, { id, input }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const existingTrack = await ReleaseTrack.findOne({
                _id: id,
                ownerId: user.id,
            });

            if (!existingTrack) {
                throw new Error("Release track not found.");
            }

            const releaseWorld = await getOwnedReleaseWorld(existingTrack.releaseWorldId, user.id);

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            const update = {
                ...input,
                lastOpenedAt: new Date(),
            };

            if (input.slug !== undefined || input.title !== undefined) {
                update.slug = normalizeTrackSlug(
                    input.slug,
                    input.title || existingTrack.title
                );
            }

            if (input.bpm === undefined) {
                delete update.bpm;
            }

            const updatedTrack = await ReleaseTrack.findOneAndUpdate(
                {
                    _id: id,
                    ownerId: user.id,
                },
                update,
                { new: true }
            );

            await syncReleaseWorldFocusFromTrack(updatedTrack, user.id);

            releaseWorld.lastOpenedAt = new Date();
            await releaseWorld.save();

            return updatedTrack;
        },

        deleteReleaseTrack: async (_, { id }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const track = await ReleaseTrack.findOne({
                _id: id,
                ownerId: user.id,
            });

            if (!track) {
                throw new Error("Release track not found.");
            }

            const releaseWorld = await getOwnedReleaseWorld(track.releaseWorldId, user.id);

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            const deletedTrack = await ReleaseTrack.findOneAndDelete({
                _id: id,
                ownerId: user.id,
            });

            if (deletedTrack?.isFocusTrack) {
                releaseWorld.currentFocus = "";
            }

            if (deletedTrack?.isSecondFocus) {
                releaseWorld.secondFocus = "";
            }

            releaseWorld.lastOpenedAt = new Date();
            await releaseWorld.save();

            return deletedTrack;
        },

        reorderReleaseTracks: async (_, { releaseWorldId, orderedTrackIds }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const releaseWorld = await getOwnedReleaseWorld(releaseWorldId, user.id);

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            const tracks = await ReleaseTrack.find({
                ownerId: user.id,
                releaseWorldId,
                _id: { $in: orderedTrackIds },
            });

            if (tracks.length !== orderedTrackIds.length) {
                throw new Error("One or more tracks could not be found.");
            }

            await Promise.all(
                orderedTrackIds.map((trackId, index) =>
                    ReleaseTrack.findOneAndUpdate(
                        {
                            _id: trackId,
                            ownerId: user.id,
                            releaseWorldId,
                        },
                        {
                            trackNumber: index + 1,
                            lastOpenedAt: new Date(),
                        },
                        { new: true }
                    )
                )
            );

            releaseWorld.lastOpenedAt = new Date();
            await releaseWorld.save();

            return await ReleaseTrack.find({
                ownerId: user.id,
                releaseWorldId,
            }).sort({
                trackNumber: 1,
                createdAt: 1,
            });
        },

        createReleaseAsset: async (_, { input }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const releaseWorld = await getOwnedReleaseWorld(input.releaseWorldId, user.id);

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            const normalizedTrackId = normalizeOptionalId(input.trackId);
            const normalizedBoardArtifactId = normalizeOptionalId(input.boardArtifactId);

            if (normalizedTrackId) {
                const track = await getOwnedReleaseTrack(
                    normalizedTrackId,
                    user.id,
                    releaseWorld._id
                );

                if (!track) {
                    throw new Error("Track not found for this release world.");
                }
            }

            if (normalizedBoardArtifactId) {
                const artifact = await getOwnedBoardArtifact(
                    normalizedBoardArtifactId,
                    user.id,
                    releaseWorld._id
                );

                if (!artifact) {
                    throw new Error("Board artifact not found for this release world.");
                }
            }

            const assetShape = {
                kind: input.kind || "image",
                usage: input.usage || "other",
                mimeType: input.mimeType || "",
                fileName: input.fileName || "",
                url: input.url || "",
            };

            validateReleaseAssetShape(assetShape);

            const asset = await ReleaseAsset.create({
                ownerId: user.id,
                releaseWorldId: releaseWorld._id,
                trackId: normalizedTrackId,
                boardArtifactId: normalizedBoardArtifactId,
                kind: assetShape.kind,
                usage: assetShape.usage,
                title: input.title,
                description: input.description || "",
                url: input.url,
                fileName: input.fileName || "",
                mimeType: input.mimeType || "",
                size: input.size === undefined || input.size === null ? null : input.size,
                isPublic: input.isPublic || false,
                lastOpenedAt: new Date(),
            });

            await syncReleaseAssetTargets(asset, user.id);

            releaseWorld.lastOpenedAt = new Date();
            await releaseWorld.save();

            return asset;
        },

        updateReleaseAsset: async (_, { id, input }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const existingAsset = await ReleaseAsset.findOne({
                _id: id,
                ownerId: user.id,
            });

            if (!existingAsset) {
                throw new Error("Release asset not found.");
            }

            const releaseWorld = await getOwnedReleaseWorld(
                existingAsset.releaseWorldId,
                user.id
            );

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            const update = {
                lastOpenedAt: new Date(),
            };

            if (input.trackId !== undefined) {
                const normalizedTrackId = normalizeOptionalId(input.trackId);

                if (normalizedTrackId) {
                    const track = await getOwnedReleaseTrack(
                        normalizedTrackId,
                        user.id,
                        releaseWorld._id
                    );

                    if (!track) {
                        throw new Error("Track not found for this release world.");
                    }
                }

                update.trackId = normalizedTrackId;
            }

            if (input.boardArtifactId !== undefined) {
                const normalizedBoardArtifactId = normalizeOptionalId(
                    input.boardArtifactId
                );

                if (normalizedBoardArtifactId) {
                    const artifact = await getOwnedBoardArtifact(
                        normalizedBoardArtifactId,
                        user.id,
                        releaseWorld._id
                    );

                    if (!artifact) {
                        throw new Error("Board artifact not found for this release world.");
                    }
                }

                update.boardArtifactId = normalizedBoardArtifactId;
            }

            if (input.kind !== undefined) update.kind = input.kind || "image";
            if (input.usage !== undefined) update.usage = input.usage || "other";
            if (input.title !== undefined) update.title = input.title;
            if (input.description !== undefined) update.description = input.description || "";
            if (input.url !== undefined) update.url = input.url;
            if (input.fileName !== undefined) update.fileName = input.fileName || "";
            if (input.mimeType !== undefined) update.mimeType = input.mimeType || "";
            if (input.size !== undefined) {
                update.size = input.size === null ? null : input.size;
            }
            if (input.isPublic !== undefined) update.isPublic = input.isPublic;

            const nextAssetShape = {
                kind: update.kind !== undefined ? update.kind : existingAsset.kind,
                usage: update.usage !== undefined ? update.usage : existingAsset.usage,
                mimeType:
                    update.mimeType !== undefined ? update.mimeType : existingAsset.mimeType,
                fileName:
                    update.fileName !== undefined ? update.fileName : existingAsset.fileName,
                url: update.url !== undefined ? update.url : existingAsset.url,
            };

            validateReleaseAssetShape(nextAssetShape);

            await clearReleaseAssetTargets(existingAsset, user.id);

            const updatedAsset = await ReleaseAsset.findOneAndUpdate(
                {
                    _id: id,
                    ownerId: user.id,
                },
                update,
                { new: true }
            );

            await syncReleaseAssetTargets(updatedAsset, user.id);

            releaseWorld.lastOpenedAt = new Date();
            await releaseWorld.save();

            return updatedAsset;
        },

        deleteReleaseAsset: async (_, { id, deleteBlob = true }, { user }) => {
            if (!user) throw new Error("Unauthorized: Please sign in.");

            const asset = await ReleaseAsset.findOne({
                _id: id,
                ownerId: user.id,
            });

            if (!asset) {
                throw new Error("Release asset not found.");
            }

            const releaseWorld = await getOwnedReleaseWorld(asset.releaseWorldId, user.id);

            if (!releaseWorld) {
                throw new Error("Release world not found.");
            }

            await clearReleaseAssetTargets(asset, user.id);

            const deletedAsset = await ReleaseAsset.findOneAndDelete({
                _id: id,
                ownerId: user.id,
            });

            if (deleteBlob) {
                await tryDeleteBlobForAsset(asset);
            }

            releaseWorld.lastOpenedAt = new Date();
            await releaseWorld.save();

            return deletedAsset;
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

                    isPublic: artifact.isPublic || false,
                    pageSection: artifact.pageSection || "story",
                    pageOrder:
                        artifact.pageOrder === undefined || artifact.pageOrder === null
                            ? 1
                            : artifact.pageOrder,
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