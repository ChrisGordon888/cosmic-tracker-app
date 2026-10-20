const { z } = require('zod');
const Experiment = require('../models/CreativeExperiment');
const Track = require('../models/ReleaseTrack');
const inclusion = require('./intelligenceCollection');
const id = z.string().regex(/^[a-f0-9]{24}$/i).transform(s => s.toLowerCase());
const inputSchema = z.object({ id: id.optional(), title: z.string().trim().max(120).default(''), note: z.string().trim().max(2000).default(''), trackIds: z.array(id).min(1).max(6).refine(ids => new Set(ids).size === ids.length) }).strict();
async function available(ownerId) {
 const hidden = await inclusion.listHidden(ownerId);
 const rows = await Track.find({ ownerId, status: { $ne: 'archived' }, catalogTreatment: { $nin: ['vault', 'test'] }, _id: { $nin: hidden } }).select('_id').lean();
 return new Set(rows.map(t => String(t._id)));
}
function present(row, allowed) {
 return { id: String(row._id), title: row.title, note: row.note, provenance: row.provenance, createdAt: new Date(row.createdAt).toISOString(), updatedAt: new Date(row.updatedAt).toISOString(), slots: row.trackIds.map((trackId, index) => ({ index, trackId: allowed.has(String(trackId)) ? String(trackId) : null, available: allowed.has(String(trackId)) })) };
}
async function list(ownerId) {
 const [rows, allowed] = await Promise.all([Experiment.find({ ownerId }).sort({ updatedAt: -1 }).lean(), available(ownerId)]);
 return rows.map(row => present(row, allowed));
}
async function save(ownerId, input) {
 const parsed = inputSchema.parse(input), allowed = await available(ownerId);
 if (parsed.trackIds.some(trackId => !allowed.has(trackId))) throw Error('Every song must be currently available in your Intelligence collection.');
 const values = { title: parsed.title, note: parsed.note, trackIds: parsed.trackIds, provenance: 'CREATOR_SAVED_SEQUENCE' };
 const row = parsed.id ? await Experiment.findOneAndUpdate({ _id: parsed.id, ownerId }, { $set: values }, { new: true, runValidators: true }).lean() : await Experiment.create({ ownerId, ...values });
 if (!row) throw Error('Owned experiment required.');
 return present(row, allowed);
}
async function remove(ownerId, experimentId) {
 const result = await Experiment.deleteOne({ _id: id.parse(experimentId), ownerId });
 if (!result.deletedCount) throw Error('Owned experiment required.');
 return true;
}
module.exports = { inputSchema, list, save, remove };
