const mongoose = require("mongoose");

const OpportunitySchema = new mongoose.Schema({
    ownerId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    desiredOutcome: { type: String, required: true, trim: true, maxlength: 500 },
    context: { type: String, default: "", maxlength: 5000 },
    traction: { type: String, enum: ["exploring", "interest-expressed", "next-step-agreed"], default: "exploring" },
    status: { type: String, enum: ["open", "achieved", "closed"], default: "open" },
    releaseWorldId: { type: mongoose.Schema.Types.ObjectId, ref: "ReleaseWorld", default: null },
    nextAction: { type: String, default: "", maxlength: 500 },
    followUpOn: { type: String, default: null },
    results: { type: [new mongoose.Schema({
        action: { type: String, required: true },
        note: { type: String, required: true, maxlength: 5000 },
        classification: { type: String, enum: ["action-completed", "outcome-achieved", "closed-without-outcome"], required: true },
        recordedAt: { type: Date, required: true },
    })], default: [] },
}, { timestamps: true });

OpportunitySchema.index({ ownerId: 1, status: 1, followUpOn: 1 });
module.exports = mongoose.model("Opportunity", OpportunitySchema);
