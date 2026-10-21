export type ReleaseShareData = { title: string; text?: string; url: string };
type ShareBrowser = {
  share?: (data: ReleaseShareData) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
};

export function publicWorldHref(slug: string, worldId?: string) {
  return `/releases/${encodeURIComponent(slug)}${worldId ? `?world=${encodeURIComponent(worldId)}` : ''}`;
}

export function releaseShareUrl(origin: string, slug: string, worldId?: string) {
  return new URL(publicWorldHref(slug, worldId), origin).href;
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
