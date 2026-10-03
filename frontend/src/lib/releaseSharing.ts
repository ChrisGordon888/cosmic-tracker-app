export type ReleaseShareData = { title: string; text?: string; url: string };
type ShareBrowser = {
  share?: (data: ReleaseShareData) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
};

export function releaseShareUrl(origin: string, slug: string) {
  return new URL(`/releases/${encodeURIComponent(slug)}`, origin).href;
}

export async function shareRelease(data: ReleaseShareData, browser: ShareBrowser): Promise<'shared' | 'copied' | 'cancelled' | 'manual'> {
  if (browser.share) {
    try { await browser.share(data); return 'shared'; }
    catch (error) { if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError') return 'cancelled'; }
  }
  try {
    if (!browser.clipboard) return 'manual';
    await browser.clipboard.writeText(data.url);
    return 'copied';
  } catch { return 'manual'; }
}
