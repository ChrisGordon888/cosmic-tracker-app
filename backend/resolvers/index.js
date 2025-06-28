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
    getSacredYes: async (_, { date }) => await SacredYes.findOne({ date }),
    allSacredYes: async () => await SacredYes.find().sort({ date: -1 }),

    // Mood Entries
    getMoodEntry: async (_, { date }) => await MoodEntry.findOne({ date }),
    allMoodEntries: async () => await MoodEntry.find().sort({ date: -1 }),

    // Practice Quests
    getDailyQuests: async (_, { date }) =>
      await PracticeQuest.find({ date }).sort({ name: 1 }),
  },

  Mutation: {
    // Sacred Yes
    addSacredYes: async (_, { text, date }) => await SacredYes.create({ text, date }),
    updateSacredYes: async (_, { id, text }) => await SacredYes.findByIdAndUpdate(id, { text }, { new: true }),
    deleteSacredYes: async (_, { id }) => await SacredYes.findByIdAndDelete(id),

    // Mood Entries
    addMoodEntry: async (_, { mood, note, date }) => await MoodEntry.create({ mood, note, date }),
    updateMoodEntry: async (_, { id, mood, note }) => await MoodEntry.findByIdAndUpdate(id, { mood, note }, { new: true }),
    deleteMoodEntry: async (_, { id }) => await MoodEntry.findByIdAndDelete(id),

    // Practice Quests
    addPracticeQuest: async (_, { name, description, repetitions, date }) =>
      await PracticeQuest.create({ name, description, repetitions, date }),

    updatePracticeQuestProgress: async (_, { id, completedReps }) => {
      const quest = await PracticeQuest.findByIdAndUpdate(
        id,
        { completedReps },
        { new: true }
      );
      // Auto-mark complete if reps met or exceeded
      if (quest && completedReps >= quest.repetitions) {
        quest.completed = true;
        await quest.save();
      }
      return quest;
    },

    markPracticeQuestComplete: async (_, { id }) =>
      await PracticeQuest.findByIdAndUpdate(id, { completed: true }, { new: true }),

    deletePracticeQuest: async (_, { id }) =>
      await PracticeQuest.findByIdAndDelete(id),
  },
};