export type CommercialAccessState = {
  status: 'loading' | 'authorized' | 'signed-out' | 'denied' | 'unavailable';
  attention: number | null;
};

export const pendingCommercialAccess: CommercialAccessState = { status: 'loading', attention: null };

/** Never infer permission from a network error or an invalid success payload. */
export async function requestCommercialAccess(signal: AbortSignal, request: typeof fetch = fetch): Promise<CommercialAccessState> {
  try {
    const response = await request('/api/engagements/summary', { signal, cache: 'no-store' });
    if (response.status === 401) return { status: 'signed-out', attention: null };
    if (response.status === 403) return { status: 'denied', attention: null };
    if (!response.ok) return { status: 'unavailable', attention: null };
    const data = await response.json();
    if (!Number.isSafeInteger(data?.attention) || data.attention < 0) return { status: 'unavailable', attention: null };
    return { status: 'authorized', attention: data.attention };
  } catch {
    return { status: 'unavailable', attention: null };
  }
}
