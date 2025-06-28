const mongoose = require("mongoose");

const practiceQuestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  repetitions: { type: Number, required: true },
  completedReps: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  date: { type: String, required: true },
});

module.exports = mongoose.model("PracticeQuest", practiceQuestSchema);