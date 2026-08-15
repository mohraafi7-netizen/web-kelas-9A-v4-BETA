'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useMousePosition } from '@/hooks/useMousePosition';
import { getDeviceTier } from '@/hooks/useDeviceTier';

interface BlackholeProps {
  className?: string;
}

function Blackhole({ className = '' }: BlackholeProps) {
  const tier = React.useMemo(() => getDeviceTier(), []);
  const { smoothX, smoothY } = useMousePosition({ smooth: true, smoothFactor: 0.04 });
  const [videoError, setVideoError] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(tier.reducedMotion);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const parallaxX = tier.blackholeParallax && !reducedMotion ? smoothX * 8 : 0;
  const parallaxY = tier.blackholeParallax && !reducedMotion ? smoothY * 8 : 0;

  return (
    <motion.div
      className={`relative w-full max-w-2xl mx-auto ${className}`}
      style={{
        transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
        willChange: 'transform',
      }}
    >
      {/* Background cosmic glow - behind video */}
      {tier.enableGlow && (
        <div className="absolute -inset-8 sm:-inset-12 flex items-center justify-center pointer-events-none z-0">
          <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-transparent blur-3xl" />
        </div>
      )}

      {/* Black hole video - full frame, no circular crop */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {!videoError ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            className="w-full h-auto object-contain"
            onError={() => setVideoError(true)}
          >
            <source src="/videos/blackhole.webm" type="video/webm" />
          </video>
        ) : (
          <div className="text-center text-slate-400 py-12">
            <p className="text-sm">Black hole video could not be loaded.</p>
            <p className="text-xs mt-2 text-slate-500">Check /videos/blackhole.webm</p>
          </div>
        )}
      </div>

      {/* Subtle cosmic particles around the black hole */}
      {!reducedMotion && !videoError && tier.enableGlow && [...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 30 + Math.sin(i * 1.5) * 10;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.5;

        return (
          <motion.div
            key={i}
            animate={{
              x: [0, x],
              y: [0, y],
              opacity: [0, 0.5, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
            className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full pointer-events-none z-20"
            style={{
              boxShadow: '0 0 6px rgba(139, 92, 246, 0.8), 0 0 12px rgba(6, 182, 212, 0.4)',
            }}
          />
        );
      })}

      {/* Light bloom overlay */}
      {tier.enableGlow && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 blur-xl" />
        </div>
      )}
    </motion.div>
  );
}

export { Blackhole };
