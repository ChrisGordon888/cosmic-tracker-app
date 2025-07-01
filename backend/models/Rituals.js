// models/Ritual.js
const mongoose = require("mongoose");

const ritualSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Ritual", ritualSchema);