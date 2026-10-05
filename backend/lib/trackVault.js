const catalogTreatments = ['current', 'vault', 'test'];
const sourceTypes = ['unknown', 'selfProduced', 'freeNonProfit', 'freeForProfit', 'purchased', 'commissioned', 'exclusiveRecorded', 'other'];
const reviewStatuses = ['unknown', 'needsReview', 'recorded'];
const publicCatalogFilter = { catalogTreatment: { $nin: ['vault', 'test'] } };
const isProtectedTrack = track => ['vault', 'test'].includes(track?.catalogTreatment);
function rightsInput(input) {
  if (!input || !sourceTypes.includes(input.sourceType) || !reviewStatuses.includes(input.reviewStatus)) throw new Error('Choose a supported source and rights-information status.');
  const result = { sourceType: input.sourceType, reviewStatus: input.reviewStatus, documentationRecorded: Boolean(input.documentationRecorded), commercialIntent: input.commercialIntent ?? null };
  for (const [key, max] of [['producerName', 200], ['sourceUrl', 1000], ['notes', 4000]]) {
    const value = input[key] ?? '';
    if (typeof value !== 'string' || value.length > max) throw new Error(`${key} must be at most ${max} characters.`);
    result[key] = value.trim();
  }
  if (result.sourceUrl) {
    try { if (!['http:', 'https:'].includes(new URL(result.sourceUrl).protocol)) throw new Error(); }
    catch { throw new Error('Source URL must be an HTTP or HTTPS link.'); }
  }
  return result;
}
module.exports = { catalogTreatments, sourceTypes, reviewStatuses, publicCatalogFilter, isProtectedTrack, rightsInput };
