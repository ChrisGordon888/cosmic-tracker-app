const mongoose = require("mongoose");

const moodEntrySchema = new mongoose.Schema({
  mood: { type: Number, required: true }, // e.g., 1-10 scale
  note: { type: String },
  date: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("MoodEntry", moodEntrySchema);