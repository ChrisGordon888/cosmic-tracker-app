const test = require('node:test');
const assert = require('node:assert/strict');
const resolvers = require('../resolvers');
const ReleaseWorld = require('../models/ReleaseWorld');
const CreativeProfile = require('../models/CreativeProfile');
const user = { id: 'creator-a', role: 'creator', creatorStatus: 'active' };

test('Archived projects cannot be featured; active projects keep the existing owner-scoped feature flow', async () => {
  const original = [ReleaseWorld.findOne, ReleaseWorld.updateMany, CreativeProfile.findOne, CreativeProfile.updateMany];
  let writes = 0;
  const release = { _id: 'world-a', creativeProfileId: 'profile-a', status: 'archived', save: async () => { writes++; } };
  const profile = { _id: 'profile-a', save: async () => { writes++; } };
  try {
    ReleaseWorld.findOne = async query => { assert.equal(query.ownerId, user.id); return release; };
    CreativeProfile.findOne = async query => { assert.equal(query.ownerId, user.id); return profile; };
    ReleaseWorld.updateMany = CreativeProfile.updateMany = async query => { assert.equal(query.ownerId, user.id); writes++; };
    await assert.rejects(resolvers.Mutation.setFeaturedReleaseWorld(null, { releaseWorldId: 'world-a' }, { user }), /Restore this release world/);
    assert.equal(writes, 0);
    for (const status of ['draft', 'active', 'released']) {
      release.status = status;
      assert.equal(await resolvers.Mutation.setFeaturedReleaseWorld(null, { releaseWorldId: 'world-a' }, { user }), release);
      assert.equal(release.isFeatured, true);
      assert.equal(profile.featuredReleaseWorldId, 'world-a');
    }
    assert.equal(writes, 12);
  } finally {
    [ReleaseWorld.findOne, ReleaseWorld.updateMany, CreativeProfile.findOne, CreativeProfile.updateMany] = original;
  }
});
