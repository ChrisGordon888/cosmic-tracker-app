const mongoose = require("mongoose");

const sacredYesSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("SacredYes", sacredYesSchema);
