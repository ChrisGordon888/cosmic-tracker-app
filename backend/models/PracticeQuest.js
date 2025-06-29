const mongoose = require("mongoose");

const practiceQuestSchema = new mongoose.Schema({
  userId: { type: String, required: true },        // 🔥 Add user association
  name: { type: String, required: true },
  description: String,
  repetitions: { type: Number, required: true },
  completedReps: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  date: { type: String, required: true },
});

// Optional: unique index for one quest with same name/date/user (if you want strict uniqueness)
practiceQuestSchema.index({ userId: 1, name: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("PracticeQuest", practiceQuestSchema);