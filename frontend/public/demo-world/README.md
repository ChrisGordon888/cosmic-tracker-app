# Low Tide — fictional COSMIC reference world

Original geometric SVG artwork and synthesized sound studies made for this demo.
These are not artist recordings, client deliverables or evidence of a real release.
No stock media, samples or third-party IP are included.

Regenerate the two 24-second mono PCM WAV files with:

    python3 frontend/scripts/generate-demo-audio.py

The files load only when selected through the existing music player. Both clips
are deliberately short illustrative studies, not finished music. The two notches
mentioned in the discoverable fragment are drawn on each window frame.

Content lives in `src/lib/demo/lowTide.ts`. No database records or reset service
are involved. Demo playback is excluded from real listen logging.

The authored interactive room lives only in `components/demo/LowTideScene.tsx`.
It is an original SVG composition with three fixed views, not a general scene engine.
Amplitude (RMS) controls light/water; first-difference RMS (a texture proxy, not
pitch detection) controls the curtain. Envelopes are sampled from the existing
player's current time. No second audio element, autoplay or AudioContext is created.
After changing either WAV, regenerate its derived timeline with:

    python3 frontend/scripts/analyze-demo-audio.py

The generated JSON contains SHA-256 hashes, checked by the frontend tests. Pause
Motion, reduced motion and hidden-page state disable reactive/ambient motion.
The read-only process example is descriptive, never a computed readiness result.
