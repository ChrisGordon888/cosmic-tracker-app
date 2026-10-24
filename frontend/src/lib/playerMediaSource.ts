/** Public Blob responses permit anonymous CORS. Request it before assigning src so
 * captured audio remains origin-clean. Do not change delivery for other hosts. */
export function setPlayerMediaSource(audio: HTMLAudioElement, source: string) {
    let publicBlob = false;
    try {
        const url = new URL(source);
        publicBlob = url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com');
    } catch { /* Relative/same-origin sources need no cross-origin request. */ }
    if (publicBlob) audio.crossOrigin = 'anonymous';
    else audio.removeAttribute('crossorigin');
    audio.src = source;
}
