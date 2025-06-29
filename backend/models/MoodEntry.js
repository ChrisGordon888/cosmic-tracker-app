const mongoose = require("mongoose");

const moodEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },        // 🔥 Add user association
  mood: { type: Number, required: true },          // e.g., 1-10 scale
  note: { type: String },
  date: { type: String, required: true },
});

// Optional: create an index on userId + date for efficient lookups
moodEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("MoodEntry", moodEntrySchema);