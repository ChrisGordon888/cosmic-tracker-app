const MAX_LYRICS_LENGTH = 30000;
function lyricsInput(input) {
  if (typeof input.text !== 'string' || input.text.length > MAX_LYRICS_LENGTH) throw new Error('Lyrics must be text of at most 30000 characters.');
  if (!['DRAFT', 'PARTIAL', 'COMPLETE'].includes(input.status)) throw new Error('Invalid lyrics status.');
  // Never trim, normalize, rewrite or infer missing lyrics.
  return { text: input.text, status: input.status, updatedAt: new Date() };
}
module.exports = { MAX_LYRICS_LENGTH, lyricsInput };
