const mongoose = require('mongoose');
const schema = new mongoose.Schema({
 ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
 title: { type: String, default: '', maxlength: 120 },
 note: { type: String, default: '', maxlength: 2000 },
 trackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReleaseTrack' }],
 // Explicit creator intent, never inferred from listening or a model suggestion.
 provenance: { type: String, enum: ['CREATOR_SAVED_SEQUENCE'], default: 'CREATOR_SAVED_SEQUENCE' },
}, { timestamps: true });
schema.index({ ownerId: 1, updatedAt: -1 });
module.exports = mongoose.models.CreativeExperiment || mongoose.model('CreativeExperiment', schema);
