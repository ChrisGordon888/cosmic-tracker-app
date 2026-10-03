export type AudioEnvelope = { step: number; duration: number; energy: number[]; texture: number[] };

/** Sample actual PCM-derived data at the authoritative player's time, including seeks. */
export function sampleEnvelope(envelope: AudioEnvelope | undefined, time: number, active: boolean) {
  if (!active || !envelope || !Number.isFinite(time) || time < 0 || time >= envelope.duration) return { energy: 0, texture: 0 };
  const position = time / envelope.step;
  const index = Math.floor(position);
  const mix = position - index;
  const sample = (values: number[]) => {
    const a = values[index] ?? 0;
    const b = values[index + 1] ?? a;
    return Math.max(0, Math.min(1, a + (b - a) * mix));
  };
  return { energy: sample(envelope.energy), texture: sample(envelope.texture) };
}
