const Track = require('../models/ReleaseTrack');
const World = require('../models/ReleaseWorld');
const Feedback = require('../models/HypothesisFeedback');
const { momentInput } = require('./songMoments');
const { contextInput, feedbackIdentity } = require('./intelligenceContext');
module.exports = function intelligenceResolvers(requireCreator) {
  return {
    songLabTrack: async (_, { trackId }, { user }) => {
      requireCreator(user);
      if (!/^[a-f\d]{24}$/i.test(trackId)) throw new Error('Invalid song.');
      return Track.findOne({ _id: trackId, ownerId: user.id, catalogTreatment: { $nin: ['vault', 'test'] }, status: { $ne: 'archived' } });
    },
    saveSongMoment: async (_, { trackId, momentId, input }, { user }) => {
      requireCreator(user);
      if (!/^[a-f\d]{24}$/i.test(trackId) || (momentId && !/^[a-f\d]{24}$/i.test(momentId))) throw new Error('Invalid song or moment.');
      const moment = momentInput(input);
      const filter = { _id: trackId, ownerId: user.id };
      let update;
      if (momentId) {
        filter['songMoments._id'] = momentId;
        update = { $set: Object.fromEntries(Object.entries({ ...moment, updatedAt: new Date() }).map(([key, value]) => [`songMoments.$.${key}`, value])) };
      } else {
        filter.$expr = { $lt: [{ $size: { $ifNull: ['$songMoments', []] } }, 200] };
        update = { $push: { songMoments: moment } };
      }
      const track = await Track.findOneAndUpdate(filter, update, { new: true, runValidators: true });
      if (!track) throw new Error('Song/moment unavailable or 200-moment limit reached.');
      return track;
    },
    deleteSongMoment: async (_, { trackId, momentId }, { user }) => {
      requireCreator(user);
      if (!/^[a-f\d]{24}$/i.test(trackId) || !/^[a-f\d]{24}$/i.test(momentId)) throw new Error('Invalid song or moment.');
      const track = await Track.findOneAndUpdate({ _id: trackId, ownerId: user.id, 'songMoments._id': momentId }, { $pull: { songMoments: { _id: momentId } } }, { new: true });
      if (!track) throw new Error('Song/moment not found.');
      return track;
    },
    myHypothesisFeedback: async (_, args, { user }) => {
      requireCreator(user);
      return Feedback.find({ ownerId: user.id }).sort({ updatedAt: -1 });
    },
    saveSongContext: async (_, { trackId, input }, { user }) => {
      requireCreator(user);
      if (!/^[a-f\d]{24}$/i.test(trackId)) throw new Error('Invalid song.');
      const fields = contextInput(input);
      if (!Object.keys(fields).length) throw new Error('Supply a context field to save or clear.');
      const track = await Track.findOneAndUpdate({ _id: trackId, ownerId: user.id }, { $set: fields }, { new: true, runValidators: true });
      if (!track) throw new Error('Song not found.');
      return track;
    },
    respondToHypothesis: async (_, { input }, { user }) => {
      requireCreator(user);
      const hypothesisKey = feedbackIdentity(input);
      if (input.response != null && !['RESONATES', 'INTERESTING', 'NOT_REALLY'].includes(input.response)) throw new Error('Invalid response.');
      if (input.note != null && (typeof input.note !== 'string' || input.note.length > 2000)) throw new Error('Note must be at most 2000 characters.');
      const Model = input.subjectType === 'track' ? Track : World;
      if (!await Model.exists({ _id: input.subjectId, ownerId: user.id })) throw new Error('Subject not found.');
      const filter = { ownerId: user.id, hypothesisKey };
      if (input.response == null) { await Feedback.deleteOne(filter); return null; }
      const { subjectType, subjectId, hypothesisType, engineVersion, evidenceHash, response } = input;
      return Feedback.findOneAndUpdate(filter, { $set: { subjectType, subjectId, hypothesisType, engineVersion, evidenceHash, response, note: input.note?.trim() || '' } }, { new: true, upsert: true, runValidators: true });
    },
  };
};
