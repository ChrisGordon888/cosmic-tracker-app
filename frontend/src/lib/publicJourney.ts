/** Public navigation only; access gates remain authoritative at each destination. */
export const publicDestinations = [
  { href: '/', label: 'Home', description: 'Start with the music', icon: '○' },
  { href: '/nexus', label: 'Nexus', description: 'Discover music and release worlds', icon: '∿' },
  { href: '/services', label: 'Services', description: 'Develop a song with Christopher', icon: '◇' },
  { href: '/creator', label: 'Creator', description: 'Build your own · sign-in and access required', icon: '⌑' },
];
export function isPublicWorld(path: string | null) {
  return path === '/demo/world' || /^\/releases\/[^/]+\/?$/.test(path ?? '');
}
export function isPublicJourney(path: string | null) {
  return path === '/' || path === '/nexus' || path === '/services' || isPublicWorld(path);
}
