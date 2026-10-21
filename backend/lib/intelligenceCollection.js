const { z } = require('zod');
const Preference = require('../models/CreativeDirection');
const Track = require('../models/ReleaseTrack');
const PREFIX = 'inclusion:';
const inputSchema = z.object({ trackId: z.string().regex(/^[a-f0-9]{24}$/i).transform(id => id.toLowerCase()), included: z.boolean() }).strict();
async function listHidden(ownerId) {
 const rows = await Preference.find({ ownerId, targetId: /^inclusion:/, value: 'HIDDEN' }).select('targetId').lean();
 return rows.map(row => row.targetId.slice(PREFIX.length)).filter(id => /^[a-f0-9]{24}$/.test(id));
}
async function setIncluded(ownerId, input) {
 const { trackId, included } = inputSchema.parse(input);
 // Both hide and restore must prove ownership. Never touch the catalog record.
 if (!await Track.exists({ _id: trackId, ownerId })) throw Error('Owned song required.');
 const key = { ownerId, targetId: PREFIX + trackId };
 if (included) await Preference.deleteOne(key);
 else {
  try { await Preference.findOneAndUpdate(key, { $set: { value: 'HIDDEN' } }, { upsert: true, new: true, runValidators: true }); }
  catch (error) { if (error.code !== 11000) throw error; await Preference.findOneAndUpdate(key, { $set: { value: 'HIDDEN' } }, { new: true, runValidators: true }); }
 }
 return listHidden(ownerId);
}
module.exports = { inputSchema, listHidden, setIncluded };
