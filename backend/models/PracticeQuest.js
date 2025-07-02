// models/PracticeQuest.js
const mongoose = require("mongoose");

const practiceQuestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  repetitions: { type: Number, required: true },
  completedReps: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  date: { type: String, required: true },
  ritualId: { type: mongoose.Schema.Types.ObjectId, ref: "Ritual", default: null }, // 🔥 correct reference
});

practiceQuestSchema.index({ userId: 1, name: 1, date: 1 }, { unique: true });

practiceQuestSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model("PracticeQuest", practiceQuestSchema);
