'use client';

import { useMusicPlayerContext } from '@/context/MusicPlayerProvider';

export function useMusicPlayer() {
  return useMusicPlayerContext();
}