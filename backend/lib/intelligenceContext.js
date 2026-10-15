const contextFields = ['meaning', 'emotionalStart', 'emotionalEnd', 'referenceNotes', 'creatorRole'];
function contextInput(input) {
  const result = {};
  for (const key of Object.keys(input || {})) {
    if (![...contextFields, 'hook'].includes(key)) throw new Error('Unknown context field.');
    const value = input[key] ?? '';
    const limit = ['emotionalStart', 'emotionalEnd', 'creatorRole'].includes(key) ? 500 : 4000;
    if (typeof value !== 'string' || value.length > limit) throw new Error(`${key} must be text of at most ${limit} characters.`);
    result[key === 'hook' ? 'hook' : `creatorContext.${key}`] = value.trim();
  }
  return result;
}
function feedbackIdentity(input) {
  if (!['track', 'world'].includes(input.subjectType) || !/^[a-f\d]{24}$/i.test(input.subjectId)) throw new Error('Invalid hypothesis subject.');
  if (!['bridge', 'cluster', 'anchor-role', 'bridge-role'].includes(input.hypothesisType)) throw new Error('Invalid hypothesis type.');
  if (!/^[a-zA-Z0-9:._-]{1,120}$/.test(input.engineVersion) || !/^[a-f0-9]{1,64}$/.test(input.evidenceHash)) throw new Error('Invalid hypothesis evidence identity.');
  return [input.subjectType, input.subjectId, input.hypothesisType, input.engineVersion, input.evidenceHash].join('|');
}
module.exports = { contextFields, contextInput, feedbackIdentity };
