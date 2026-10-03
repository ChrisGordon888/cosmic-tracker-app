"""Derive demo-only 8 Hz RMS/texture envelopes from the actual original PCM files.
No runtime decoding, second player, network service or analysis dependency.
"""
import hashlib
import json
import math
from pathlib import Path
import struct
import wave

root = Path(__file__).resolve().parents[1]
result = {}
for name in ('threshold', 'return-path'):
    source = root / 'public' / 'demo-world' / (name + '.wav')
    with wave.open(str(source), 'rb') as audio:
        assert audio.getnchannels() == 1 and audio.getsampwidth() == 2
        rate = audio.getframerate()
        raw = audio.readframes(audio.getnframes())
    samples = struct.unpack('<' + 'h' * (len(raw) // 2), raw)
    step = rate // 8
    energy, texture = [], []
    for start in range(0, len(samples), step):
        frame = samples[start:start + step]
        energy.append(math.sqrt(sum(x*x for x in frame) / len(frame)))
        texture.append(math.sqrt(sum((b-a)**2 for a,b in zip(frame, frame[1:])) / len(frame)))
    result[name] = {'step': step / rate, 'duration': len(samples) / rate,
                    'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                    'energy': [round(v / max(energy), 4) for v in energy],
                    'texture': [round(v / max(texture), 4) for v in texture]}
(root / 'src/lib/demo/audioEnvelopes.json').write_text(json.dumps(result, separators=(',', ':')) + '\n')
