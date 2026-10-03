"""Reproduce the original Low Tide demo sound studies. Python stdlib only.
No samples, artist recordings, external services or model calls.
"""
import math
from pathlib import Path
import struct
import wave

RATE = 22050
DURATION = 24
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "demo-world"


def study(name, progression, melody):
    samples = [0.0] * (RATE * DURATION)

    def note(midi, start, length, gain, pluck=False):
        freq = 440 * 2 ** ((midi - 69) / 12)
        for i in range(min(int(length * RATE), len(samples) - int(start * RATE))):
            t = i / RATE
            envelope = min(1, t / .035) * min(1, (length - t) / .6)
            envelope *= math.exp(-t * (1.15 if pluck else .24))
            tone = math.sin(2 * math.pi * freq * t)
            tone += .16 * math.sin(2 * math.pi * freq * 2 * t)
            tone += .06 * math.sin(2 * math.pi * freq * 3 * t)
            samples[int(start * RATE) + i] += gain * envelope * tone

    for bar, chord in enumerate(progression):
        for offset, pitch in enumerate(chord):
            note(pitch, bar * 6 + offset * .045, 5.9, .045)
        note(chord[0] - 12, bar * 6, 5.8, .055)
    for index, pitch in enumerate(melody):
        start = .75 + index * 1.5
        note(pitch, start, 3.2, .12, True)
        note(pitch, start + .375, 2.7, .024, True)

    peak = max(abs(value) for value in samples) or 1
    # Gentle fixed level with a fade at both edges; no abrupt end or looping.
    pcm = bytearray()
    for i, value in enumerate(samples):
        t = i / RATE
        fade = min(1, t / .2, (DURATION - t) / 1.5)
        pcm.extend(struct.pack('<h', round(value / peak * .48 * fade * 32767)))
    with wave.open(str(OUTPUT / name), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(pcm)


study('threshold.wav', [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 60]],
      [76, 74, 71, 67, 72, 71, 67, 64, 69, 72, 76, 72, 74, 72, 67, 64])
study('return-path.wav', [[41, 48, 52, 57], [48, 55, 59, 64], [45, 52, 55, 60], [43, 50, 55, 59]],
      [69, 67, 64, 60, 67, 71, 74, 76, 72, 71, 67, 64, 62, 67, 71, 67])
