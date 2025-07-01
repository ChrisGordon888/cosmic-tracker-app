const SacredYes = require("../models/SacredYes");
const MoodEntry = require("../models/MoodEntry");
const PracticeQuest = require("../models/PracticeQuest");
const Ritual = require("../models/Rituals"); // 🔮 Rituals model

module.exports = {
  Query: {
    // 🌌 Basic API hello + moon phase
    hello: () => "Hello Cosmic Tracker 🌙",
    todayMoonPhase: () => {
      const phases = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"];
      return phases[Math.floor(Math.random() * phases.length)];
    },

    // 🌟 Sacred Yes Queries
    getSacredYes: async (_, { date }, { user }) => {
      if (!user) throw new Error("Unauthorized: Please sign in.");
      return await SacredYes.findOne({ userId: user.id, date });
    },
    allSacredYes: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized: Please sign in.");
      return await SacredYes.find({ userId: user.id }).sort({ date: -1 });
    },

    // 🪷 Mood Entries Queries
    getMoodEntry: async (_, { date }, { user }) => {
      if (!user) throw new Error("Unauthorized: Please sign in.");
      return await MoodEntry.findOne({ userId: user.id, date });
    },
    allMoodEntries: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized: Please sign in.");
      return await MoodEntry.find({ userId: user.id }).sort({ date: -1 });
    },

    // 🧘 Practice Quests Queries
    getDailyQuests: async (_, { date }, { user }) => {
      if (!user) throw new Error("Unauthorized: Please sign in.");
      return await PracticeQuest.find({ userId: user.id, date }).sort({ name: 1 });
    },
    allPracticeQuests: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized: Please sign in.");
      return await PracticeQuest.find({ userId: user.id }).sort({ date: -1 });
    },

    // 🔮 Rituals Queries
    allRituals: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized: Please sign in.");
      return await Ritual.find({ userId: user.id }).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    // 🌟 Sacred Yes Mutations
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

    // 🪷 Mood Entry Mutations
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

    // 🧘 Practice Quest Mutations
    addPracticeQuest: async (_, { name, description, repetitions, date }, { user }) => {
      if (!user) throw new Error("Unauthorized: Please sign in.");
      return await PracticeQuest.create({ userId: user.id, name, description, repetitions, date });
    },
    updatePracticeQuestProgress: async (_, { id, completedReps }, { user }) => {
      if (!user) throw new Error("Unauthorized: Please sign in.");
      const quest = await PracticeQuest.findOneAndUpdate(
        { _id: id, userId: user.id },
        { completedReps },
        { new: true }
      );
      if (quest && completedReps >= quest.repetitions) {
        quest.completed = true;
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
      return await Ritual.create({ userId: user.id, title, description });
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
      return await Ritual.findOneAndDelete({ _id: id, userId: user.id });
    },
  },
};