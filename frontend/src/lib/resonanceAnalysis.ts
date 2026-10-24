/** Analyse a capture of the shared element without rerouting its audible output.
 * Unlike MediaElementSource, a failed/CORS-blocked tap cannot silence playback.
 */
export async function openResonanceAnalysis(audio: HTMLAudioElement) {
    const capturable = audio as HTMLAudioElement & { captureStream?: () => MediaStream };
    if (!capturable.captureStream || !window.AudioContext) throw new Error('capture-unsupported');
    const stream = capturable.captureStream();
    let context: AudioContext | undefined;
    try {
        if (!stream.getAudioTracks().length && stream.addEventListener) {
            // A new src may be playing before capture has attached its audio track.
            await new Promise<void>((resolve, reject) => {
                const ready = () => {
                    if (!stream.getAudioTracks().length) return;
                    clearTimeout(timeout); stream.removeEventListener('addtrack', ready); resolve();
                };
                const timeout = setTimeout(() => {
                    stream.removeEventListener('addtrack', ready); reject(new Error('capture-track-unavailable'));
                }, 1500);
                stream.addEventListener('addtrack', ready);
                ready();
            });
        }
        if (!stream.getAudioTracks().length) throw new Error('capture-track-unavailable');
        context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.78;
        const silent = context.createGain();
        silent.gain.value = 0;
        source.connect(analyser);
        analyser.connect(silent);
        silent.connect(context.destination);
        await context.resume();
        if (context.state !== 'running') throw new Error('capture-permission');
        let closed = false;
        return {
            analyser,
            close() {
                if (closed) return;
                closed = true;
                source.disconnect();
                analyser.disconnect();
                silent.disconnect();
                stream.getTracks().forEach(track => track.stop());
                void context?.close();
            },
        };
    } catch (error) {
        stream.getTracks().forEach(track => track.stop());
        if (context) void context.close();
        throw error;
    }
}

export function measuredEnergy(samples: Uint8Array) {
    let sum = 0;
    for (const sample of samples) sum += ((sample - 128) / 128) ** 2;
    return Math.sqrt(sum / Math.max(1, samples.length));
}

/** Safe diagnostic categories only; never echo media URLs or browser exception details. */
export function analysisFailureMessage(error: unknown) {
    const reason = error instanceof Error ? error.message : '';
    const name = error && typeof error === 'object' && 'name' in error ? error.name : '';
    if (reason === 'capture-unsupported') return 'This browser does not support element audio capture. Playback is unchanged.';
    if (name === 'SecurityError') return 'This media response restricts audio capture (origin/CORS). Playback is unchanged.';
    if (reason === 'capture-permission') return 'The browser did not allow audio analysis to start. Playback is unchanged.';
    if (reason === 'capture-track-unavailable') return 'No capturable audio track became available. Playback is unchanged.';
    return 'Audio capture could not start. Playback is unchanged.';
}
