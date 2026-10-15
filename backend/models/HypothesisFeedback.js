const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  ownerId: { type: String, required: true },
  hypothesisKey: { type: String, required: true, maxlength: 300 },
  subjectType: { type: String, enum: ['track', 'world'], required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  hypothesisType: { type: String, required: true },
  engineVersion: { type: String, required: true, maxlength: 120 },
  evidenceHash: { type: String, required: true, maxlength: 64 },
  response: { type: String, enum: ['RESONATES', 'INTERESTING', 'NOT_REALLY'], required: true },
  note: { type: String, default: '', maxlength: 2000 },
}, { timestamps: true });
schema.index({ ownerId: 1, hypothesisKey: 1 }, { unique: true });
module.exports = mongoose.model('HypothesisFeedback', schema);
