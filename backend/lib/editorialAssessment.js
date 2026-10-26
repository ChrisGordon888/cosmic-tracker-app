// Metadata only: no media URLs, owner details, writes, or publication side effects.
async function assessEditorial({ track, world, known, capabilities, sourceProblem, publicationProblem, anonymousPlayable, publicSource, config }) {
 const result = { id: String(track?._id || world?._id || known), actions: [] };
 const add = (name, permission, problems) => {
  const reasons = [...(!permission ? ['Your account lacks this capability.'] : []), ...problems.filter(Boolean)];
  result.actions.push({ name, allowed: reasons.length === 0, reasons });
 };
 const missing = !track && !world ? 'Reference unavailable; eligibility requires verification.' : null;
 if (track) {
  const inReview = track.nexusReviewStatus === 'in-review';
  const approved = ['approved','published'].includes(track.nexusReviewStatus);
  const published = track.showInNexus && track.nexusReviewStatus === 'published';
  add('approve', capabilities.canReview, [!inReview && 'Only in-review submissions can be approved.', sourceProblem, publicationProblem]);
  add('needs-changes', capabilities.canReview, [!inReview && 'Only in-review submissions can be returned.']);
  add('publish', capabilities.canPublish, [!approved && 'Needs Nexus approval.', sourceProblem, publicationProblem]);
  add('unpublish', capabilities.canPublish, [!published && 'Signal is not Nexus-published.']);
  add('soundtrack', capabilities.canPlace, [!approved && 'Needs Nexus approval.', sourceProblem, publicationProblem]);
  add('sampler', capabilities.canPlace, [!publicSource && 'Not an effective official soundtrack selection.', !anonymousPlayable && 'Track has restricted or unavailable anonymous playback.']);
  add('anchor', capabilities.canPlace, [!published && 'Signal is not Nexus-published.', sourceProblem, publicationProblem]);
  add('spotlight', capabilities.canPlace, [!published && 'Signal is not Nexus-published.', sourceProblem, publicationProblem, world?.publicCanon === false && 'Parent World must be creator Canon for Spotlight.']);
 }
 if (world) {
  add('discovery', capabilities.canPlace, [sourceProblem]);
  add('world', capabilities.canPlace, [sourceProblem, world.publicCanon !== true && 'Creator Canon is required for Nexus World selection.']);
 }
 if (missing) for (const name of ['approve','needs-changes','publish','unpublish','soundtrack','sampler','anchor','spotlight','discovery','world']) add(name, false, [missing]);
 // Withdrawal deliberately does not require the source to remain eligible.
 add('withdraw', capabilities.canPlace, [!config && 'No stored configuration exists.']);
 return result;
}
module.exports = { assessEditorial };
