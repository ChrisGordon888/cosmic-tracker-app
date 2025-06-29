const SacredYes = require("../models/SacredYes");
const MoodEntry = require("../models/MoodEntry");
const PracticeQuest = require("../models/PracticeQuest");

module.exports = {
  Query: {
    hello: () => "Hello Cosmic Tracker 🌙",
    todayMoonPhase: () => {
      const phases = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"];
      return phases[Math.floor(Math.random() * phases.length)];
    },

    // Sacred Yes
    getSacredYes: async (_, { date }, { user }) =>
      await SacredYes.findOne({ userId: user.id, date }),
    allSacredYes: async (_, __, { user }) =>
      await SacredYes.find({ userId: user.id }).sort({ date: -1 }),

    // Mood Entries
    getMoodEntry: async (_, { date }, { user }) =>
      await MoodEntry.findOne({ userId: user.id, date }),
    allMoodEntries: async (_, __, { user }) =>
      await MoodEntry.find({ userId: user.id }).sort({ date: -1 }),

    // Practice Quests
    getDailyQuests: async (_, { date }, { user }) =>
      await PracticeQuest.find({ userId: user.id, date }).sort({ name: 1 }),
  },

  Mutation: {
    // Sacred Yes
    addSacredYes: async (_, { text, date }, { user }) =>
      await SacredYes.create({ userId: user.id, text, date }),
    updateSacredYes: async (_, { id, text }, { user }) => {
      const entry = await SacredYes.findOneAndUpdate(
        { _id: id, userId: user.id },
        { text },
        { new: true }
      );
      return entry;
    },
    deleteSacredYes: async (_, { id }, { user }) =>
      await SacredYes.findOneAndDelete({ _id: id, userId: user.id }),

    // Mood Entries
    addMoodEntry: async (_, { mood, note, date }, { user }) =>
      await MoodEntry.create({ userId: user.id, mood, note, date }),
    updateMoodEntry: async (_, { id, mood, note }, { user }) => {
      const entry = await MoodEntry.findOneAndUpdate(
        { _id: id, userId: user.id },
        { mood, note },
        { new: true }
      );
      return entry;
    },
    deleteMoodEntry: async (_, { id }, { user }) =>
      await MoodEntry.findOneAndDelete({ _id: id, userId: user.id }),

    // Practice Quests
    addPracticeQuest: async (_, { name, description, repetitions, date }, { user }) =>
      await PracticeQuest.create({ userId: user.id, name, description, repetitions, date }),

    updatePracticeQuestProgress: async (_, { id, completedReps }, { user }) => {
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

    markPracticeQuestComplete: async (_, { id }, { user }) =>
      await PracticeQuest.findOneAndUpdate(
        { _id: id, userId: user.id },
        { completed: true },
        { new: true }
      ),

    deletePracticeQuest: async (_, { id }, { user }) =>
      await PracticeQuest.findOneAndDelete({ _id: id, userId: user.id }),
  },
};