const LEGACY_UNLOCK_DATES: Record<string, string> = {
    'sin-do-over': '2026-06-29T00:00:00',
    'sin-running-from-the-plug': '2026-07-14T00:00:00',
    '101-hold-my-hand': '2026-07-29T00:00:00',
    '303-in-the-deep': '2026-07-29T00:00:00',
    '202-her-fantasy': '2026-07-29T00:00:00',
    '202-siren': '2026-07-29T00:00:00',
};

export type MusicAvailabilityState =
  | 'full'
  | 'preview'
  | 'creator-review'
  | 'locked'
  | 'coming-soon'
  | 'private'
  | 'unavailable';

export interface AvailabilityTrack {
  id?: string | null;
  trackUrl?: string | null;
  audioUrl?: string | null;
  fullAudioUrl?: string | null;
  previewAudioUrl?: string | null;
  visibility?: string | null;
  accessTier?: string | null;
  playbackStatus?: string | null;
  unlockDate?: string | null;
  dropDate?: string | null;
  isPublic?: boolean | null;
  source?: string | null;
}

export interface MusicAvailabilityOptions {
  isCreatorView: boolean;
  isSignedIn: boolean;
  releaseVisibility?: string | null;
  fallbackUnlockDate?: string | null;
  now?: Date;
}

export interface MusicAvailability {
  state: MusicAvailabilityState;
  isVisible: boolean;
  isPlayable: boolean;
  resolvedAudioUrl: string | null;
  label: string;
  unlockDate: Date | null;
}

function clean(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(/^\d{10,}$/.test(value) ? Number(value) : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatAvailabilityDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getMusicAvailability(
  track: AvailabilityTrack,
  options: MusicAvailabilityOptions,
): MusicAvailability {
  const now = options.now ?? new Date();
  const visibility = track.visibility ?? 'public';
  const accessTier = track.accessTier ?? (visibility === 'signup' || visibility === 'premium' ? visibility : 'public');
  const playbackStatus = track.playbackStatus ?? 'playable';
  const fullAudio = clean(track.fullAudioUrl) ?? clean(track.audioUrl) ?? clean(track.trackUrl);
  const previewAudio = clean(track.previewAudioUrl);
  const unlockDate = parseDate(
    clean(track.unlockDate) ?? clean(track.dropDate) ?? clean(options.fallbackUnlockDate) ?? (track.id ? LEGACY_UNLOCK_DATES[track.id] : null),
  );

  if (options.isCreatorView) {
    const resolvedAudioUrl = fullAudio ?? previewAudio;
    return {
      state: resolvedAudioUrl ? 'creator-review' : 'unavailable',
      isVisible: true,
      isPlayable: Boolean(resolvedAudioUrl),
      resolvedAudioUrl,
      label: resolvedAudioUrl ? 'Creator Review' : 'Audio Missing',
      unlockDate,
    };
  }

  if (options.releaseVisibility && options.releaseVisibility !== 'public') {
    return {
      state: 'private',
      isVisible: false,
      isPlayable: false,
      resolvedAudioUrl: null,
      label: 'Private',
      unlockDate,
    };
  }

  if (visibility === 'private' || (track.visibility == null && track.isPublic === false)) {
    return {
      state: 'private',
      isVisible: false,
      isPlayable: false,
      resolvedAudioUrl: null,
      label: 'Private',
      unlockDate,
    };
  }

  if (accessTier === 'premium') {
    return {
      state: 'locked',
      isVisible: true,
      isPlayable: false,
      resolvedAudioUrl: null,
      label: 'Premium',
      unlockDate,
    };
  }

  if (accessTier === 'signup' && !options.isSignedIn) {
    return {
      state: 'locked',
      isVisible: true,
      isPlayable: false,
      resolvedAudioUrl: null,
      label: 'Join to Unlock',
      unlockDate,
    };
  }

  if (unlockDate && now < unlockDate) {
    const dateLabel = formatAvailabilityDate(unlockDate);
    return {
      state: 'coming-soon',
      isVisible: true,
      isPlayable: false,
      resolvedAudioUrl: null,
      label: dateLabel ? `Opens ${dateLabel}` : 'Coming Soon',
      unlockDate,
    };
  }

  if (playbackStatus === 'coming-soon') {
    return {
      state: 'coming-soon',
      isVisible: true,
      isPlayable: false,
      resolvedAudioUrl: null,
      label: 'Coming Soon',
      unlockDate,
    };
  }

  if (playbackStatus === 'locked') {
    return {
      state: 'locked',
      isVisible: true,
      isPlayable: false,
      resolvedAudioUrl: null,
      label: 'Locked',
      unlockDate,
    };
  }

  if (playbackStatus === 'preview') {
    return {
      state: previewAudio ? 'preview' : 'unavailable',
      isVisible: true,
      isPlayable: Boolean(previewAudio),
      resolvedAudioUrl: previewAudio,
      label: previewAudio ? 'Preview' : 'Preview Pending',
      unlockDate,
    };
  }

  return {
    state: fullAudio ? 'full' : 'unavailable',
    isVisible: true,
    isPlayable: Boolean(fullAudio),
    resolvedAudioUrl: fullAudio,
    label: fullAudio ? 'Play' : 'Audio Unavailable',
    unlockDate,
  };
}

export function withResolvedMusicTrack<T extends AvailabilityTrack>(
  track: T,
  options: MusicAvailabilityOptions,
): (T & { trackUrl: string; availability: MusicAvailability }) | null {
  const availability = getMusicAvailability(track, options);
  if (!availability.isVisible || !availability.isPlayable || !availability.resolvedAudioUrl) {
    return null;
  }

  return {
    ...track,
    trackUrl: availability.resolvedAudioUrl,
    availability,
  };
}

export function playableMusicTracks<T extends AvailabilityTrack>(tracks: T[], options: MusicAvailabilityOptions): T[] {
  return tracks.filter(track => getMusicAvailability(track, options).isPlayable);
}

export function listenerCatalogCounts(tracks: AvailabilityTrack[], isSignedIn: boolean) {
  const options = { isCreatorView: false, isSignedIn };
  const visible = tracks.filter(t => getMusicAvailability(t, options).isVisible);
  return {
    catalogued: visible.length,
    playable: playableMusicTracks(visible, options).length,
    memberGated: visible.filter(t => (t.accessTier ?? t.visibility) === 'signup').length,
  };
}
