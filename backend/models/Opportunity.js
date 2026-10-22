const mongoose = require("mongoose");

const OpportunitySchema = new mongoose.Schema({
    engagement: { type: new mongoose.Schema({
        inquiryId: String, fingerprint: String, name: String, email: String, offer: String,
        context: String, links: String, timeline: String, notification: String,
        approval: String, scope: String, agreement: String, amountCents: Number, approvedAt: Date,
        attemptAt: { type: Date, default: null }, sessionId: { type: String, default: null }, checkoutUrl: String,
        revision: { type: Number, default: 0 }, paymentStatus: String, paymentIntentId: String, invoiceId: String, checkedAt: { type: Date, default: null },
        scheduling: String, delivery: String, followUpNote: String,
    }, { _id: false }), default: undefined },
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
OpportunitySchema.index({ ownerId: 1, 'engagement.inquiryId': 1 }, { unique: true, partialFilterExpression: { 'engagement.inquiryId': { $type: 'string' } } });
OpportunitySchema.index({ 'engagement.sessionId': 1 }, { unique: true, partialFilterExpression: { 'engagement.sessionId': { $type: 'string' } } });
module.exports = mongoose.model("Opportunity", OpportunitySchema);
