const mongoose = require("mongoose");

const sacredYesSchema = new mongoose.Schema({
  userId: { type: String, required: true },        // 🔥 Add user association
  text: { type: String, required: true },
  date: { type: String, required: true },
});

// Optional: unique index ensures one entry per user per day
sacredYesSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("SacredYes", sacredYesSchema);