const momentTypes = ['HOOK', 'VERSE', 'TURN', 'DROP', 'MOMENT', 'NOTE', 'LYRIC', 'ENERGY', 'CUSTOM'];
function momentInput(input) {
  if (!Number.isFinite(input.timeSeconds) || input.timeSeconds < 0 || input.timeSeconds > 86400) throw new Error('Moment time must be between 0 and 86400 seconds.');
  if (input.endTimeSeconds != null && (!Number.isFinite(input.endTimeSeconds) || input.endTimeSeconds <= input.timeSeconds || input.endTimeSeconds > 86400)) throw new Error('Moment end must follow its start and be within 86400 seconds.');
  if (!momentTypes.includes(input.type)) throw new Error('Invalid moment type.');
  for (const [key, max] of [['label', 200], ['note', 2000], ['lyricExcerpt', 1000]]) if (input[key] != null && (typeof input[key] !== 'string' || input[key].length > max)) throw new Error(`${key} exceeds its text limit.`);
  return { timeSeconds: input.timeSeconds, endTimeSeconds: input.endTimeSeconds ?? null, type: input.type, label: input.label?.trim() || '', note: input.note?.trim() || '', lyricExcerpt: input.lyricExcerpt ?? '' };
}
module.exports = { momentTypes, momentInput };
