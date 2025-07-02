// models/Rituals.js
const mongoose = require("mongoose");

const ritualSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

// 🛠️ Ensure clean JSON transformation
ritualSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

// ✅ Reuse model if it already exists to prevent OverwriteModelError
module.exports = mongoose.models.Ritual || mongoose.model("Ritual", ritualSchema);