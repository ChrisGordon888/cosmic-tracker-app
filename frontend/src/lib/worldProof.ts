import type { WorldFragmentData } from './worldExperience';
export type WorldProofItem = WorldFragmentData & { meta?: string | null; pageOrder?: number | null };
export function isWorldProof(item: WorldProofItem) {
  return ['credit', 'process'].includes((item.eyebrow || '').trim().toLowerCase());
}
export function publicWorldProof(items: WorldProofItem[]) {
  return items.filter(item => item.isPublic && isWorldProof(item)).sort((a,b)=>(a.pageOrder??1)-(b.pageOrder??1));
}
export function proofLink(value?: string | null) {
  try { const url = new URL(value || ''); return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined; } catch { return undefined; }
}
export function youtubeEmbed(value?: string | null) {
  const href = proofLink(value); if (!href) return undefined;
  const url = new URL(href);
  const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : ['youtube.com','www.youtube.com','m.youtube.com'].includes(url.hostname) ? (url.pathname === '/watch' ? url.searchParams.get('v') : /^\/(shorts|embed)\/([\w-]+)$/.exec(url.pathname)?.[2]) : undefined;
  return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : undefined;
}
