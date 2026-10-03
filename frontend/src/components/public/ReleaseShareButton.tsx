'use client';

import { useEffect, useState } from 'react';
import { releaseShareUrl, shareRelease } from '@/lib/releaseSharing';

export default function ReleaseShareButton({ title, description, slug }: { title: string; description?: string; slug: string }) {
  const [supportsShare, setSupportsShare] = useState(true);
  useEffect(() => { setSupportsShare(typeof navigator.share === 'function'); }, []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  async function handleShare() {
    setBusy(true);
    setMessage('');
    setManualUrl('');
    try {
      const url = releaseShareUrl(window.location.origin, slug);
      const result = await shareRelease({ title, text: description, url }, navigator);
      if (result === 'copied') setMessage('Link copied');
      if (result === 'manual') { setManualUrl(url); setMessage('Copy this release link:'); }
    } finally { setBusy(false); }
  }
  return <span className="release-share">
    <button type="button" disabled={busy} onClick={() => void handleShare()}>{supportsShare ? 'Share Release' : 'Copy link'}</button>
    <span role="status">{message}</span>
    {manualUrl && <input aria-label="Release link" readOnly value={manualUrl} onFocus={event => event.currentTarget.select()} />}
  </span>;
}
