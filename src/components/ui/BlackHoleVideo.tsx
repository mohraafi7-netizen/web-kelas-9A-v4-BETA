'use client';

import * as React from 'react';

interface BlackHoleVideoProps {
  src?: string;
  className?: string;
}

function BlackHoleVideo({ src = '/videos/blackhole.webm', className = '' }: BlackHoleVideoProps) {
  const [videoError, setVideoError] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {!videoError ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          preload="metadata"
          className="block w-full h-full object-contain"
          onError={() => setVideoError(true)}
          aria-hidden="true"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <div className="flex items-center justify-center py-12 text-center">
          <div>
            <div className="text-4xl mb-2">🌌</div>
            <div className="text-xs text-slate-500">Galaxy Class</div>
          </div>
        </div>
      )}
    </div>
  );
}

export { BlackHoleVideo };
