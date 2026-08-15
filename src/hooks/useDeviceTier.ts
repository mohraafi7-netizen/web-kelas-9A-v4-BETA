'use client';

import * as React from 'react';

interface DeviceTier {
  particleCount: number;
  enableParallax: boolean;
  enableGlow: boolean;
  blackholeParallax: boolean;
  reducedMotion: boolean;
}

function getDeviceTier(): DeviceTier {
  if (typeof window === 'undefined') {
    return { particleCount: 60, enableParallax: true, enableGlow: true, blackholeParallax: true, reducedMotion: false };
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    return { particleCount: 30, enableParallax: false, enableGlow: false, blackholeParallax: false, reducedMotion: true };
  }

  const isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent) || window.innerWidth < 768;
  const isLowEnd = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  if (isLowEnd) {
    return { particleCount: 35, enableParallax: true, enableGlow: false, blackholeParallax: false, reducedMotion: false };
  }

  return { particleCount: 70, enableParallax: true, enableGlow: true, blackholeParallax: true, reducedMotion: false };
}

export { getDeviceTier };
