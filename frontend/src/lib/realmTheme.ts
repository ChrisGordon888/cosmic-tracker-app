import type { RealmId } from '@/lib/realmStateMap';

export interface RealmTheme {
  realmId: RealmId;
  name: string;
  shortName: string;
  accent: string;
  soft: string;
  border: string;
  glow: string;
  textShadow: string;
  gradient: string;
}

export const REALM_THEMES: Record<RealmId, RealmTheme> = {
  303: {
    realmId: 303,
    name: 'Fractured Frontier',
    shortName: 'Frontier',
    accent: 'rgba(255, 93, 122, 0.92)',
    soft: 'rgba(255, 93, 122, 0.16)',
    border: 'rgba(255, 93, 122, 0.34)',
    glow: 'rgba(255, 93, 122, 0.12)',
    textShadow: '0 0 12px rgba(255, 93, 122, 0.20), 0 0 24px rgba(255, 93, 122, 0.10)',
    gradient:
      'radial-gradient(circle at top left, rgba(255, 93, 122, 0.16), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))',
  },
  202: {
    realmId: 202,
    name: 'The Veil',
    shortName: 'Veil',
    accent: 'rgba(168, 132, 255, 0.94)',
    soft: 'rgba(168, 132, 255, 0.16)',
    border: 'rgba(168, 132, 255, 0.34)',
    glow: 'rgba(168, 132, 255, 0.12)',
    textShadow: '0 0 12px rgba(168, 132, 255, 0.22), 0 0 24px rgba(168, 132, 255, 0.10)',
    gradient:
      'radial-gradient(circle at top left, rgba(168, 132, 255, 0.16), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))',
  },
  101: {
    realmId: 101,
    name: 'Moonlit Roads',
    shortName: 'Moonlit',
    accent: 'rgba(126, 211, 255, 0.94)',
    soft: 'rgba(126, 211, 255, 0.16)',
    border: 'rgba(126, 211, 255, 0.34)',
    glow: 'rgba(126, 211, 255, 0.12)',
    textShadow: '0 0 12px rgba(126, 211, 255, 0.22), 0 0 24px rgba(126, 211, 255, 0.10)',
    gradient:
      'radial-gradient(circle at top left, rgba(126, 211, 255, 0.16), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))',
  },
  55: {
    realmId: 55,
    name: 'Skybound City',
    shortName: 'Skybound',
    accent: 'rgba(236, 201, 115, 0.94)',
    soft: 'rgba(236, 201, 115, 0.16)',
    border: 'rgba(236, 201, 115, 0.34)',
    glow: 'rgba(236, 201, 115, 0.12)',
    textShadow: '0 0 12px rgba(236, 201, 115, 0.20), 0 0 24px rgba(236, 201, 115, 0.10)',
    gradient:
      'radial-gradient(circle at top left, rgba(236, 201, 115, 0.16), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))',
  },
  44: {
    realmId: 44,
    name: 'Astral Bazaar',
    shortName: 'Bazaar',
    accent: 'rgba(244, 171, 99, 0.94)',
    soft: 'rgba(244, 171, 99, 0.16)',
    border: 'rgba(244, 171, 99, 0.34)',
    glow: 'rgba(244, 171, 99, 0.12)',
    textShadow: '0 0 12px rgba(244, 171, 99, 0.20), 0 0 24px rgba(244, 171, 99, 0.10)',
    gradient:
      'radial-gradient(circle at top left, rgba(244, 171, 99, 0.16), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))',
  },
  0: {
    realmId: 0,
    name: 'InterSiddhi',
    shortName: 'Source',
    accent: 'rgba(238, 243, 250, 0.94)',
    soft: 'rgba(238, 243, 250, 0.12)',
    border: 'rgba(238, 243, 250, 0.30)',
    glow: 'rgba(238, 243, 250, 0.10)',
    textShadow: '0 0 12px rgba(238, 243, 250, 0.18), 0 0 24px rgba(188, 224, 255, 0.08)',
    gradient:
      'radial-gradient(circle at top left, rgba(238, 243, 250, 0.12), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))',
  },
};

export const DEFAULT_REALM_THEME: RealmTheme = {
  realmId: 0,
  name: 'Cosmic Nexus',
  shortName: 'Nexus',
  accent: 'rgba(188, 224, 255, 0.92)',
  soft: 'rgba(188, 224, 255, 0.14)',
  border: 'rgba(188, 224, 255, 0.30)',
  glow: 'rgba(188, 224, 255, 0.10)',
  textShadow: '0 0 12px rgba(188, 224, 255, 0.18), 0 0 24px rgba(188, 224, 255, 0.08)',
  gradient:
    'radial-gradient(circle at top left, rgba(188, 224, 255, 0.14), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))',
};

export function getRealmTheme(realmId?: number | string | null): RealmTheme {
  const numericRealmId = Number(realmId);

  if (
    numericRealmId === 303 ||
    numericRealmId === 202 ||
    numericRealmId === 101 ||
    numericRealmId === 55 ||
    numericRealmId === 44 ||
    numericRealmId === 0
  ) {
    return REALM_THEMES[numericRealmId];
  }

  return DEFAULT_REALM_THEME;
}

export function getRealmAccent(realmId?: number | string | null) {
  return getRealmTheme(realmId).accent;
}
