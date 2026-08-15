'use client';

import * as React from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';
import { getDeviceTier } from '@/hooks/useDeviceTier';

interface SpaceBackgroundProps {
  className?: string;
  particleCount?: number;
  enableParallax?: boolean;
}

interface Star {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  layer: 'far' | 'mid' | 'near';
  depth: number;
}

function SpaceBackground({ className = '', particleCount, enableParallax }: SpaceBackgroundProps) {
  const tier = React.useMemo(() => getDeviceTier(), []);
  const count = particleCount ?? tier.particleCount;
  const parallaxEnabled = enableParallax ?? tier.enableParallax;
  const { smoothX, smoothY } = useMousePosition({ smooth: true, smoothFactor: 0.04 });
  const [reducedMotion, setReducedMotion] = React.useState(tier.reducedMotion);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const stars = React.useMemo(() => {
    const result: Star[] = [];
    const layers: Array<'far' | 'mid' | 'near'> = ['far', 'mid', 'near'];
    const depthMap: Record<'far' | 'mid' | 'near', number> = { far: 0.15, mid: 0.4, near: 0.75 };
    const countPerLayer = Math.floor(count / 3);

    layers.forEach((layer) => {
      for (let i = 0; i < countPerLayer; i++) {
        result.push({
          id: Math.random(),
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: layer === 'far' ? Math.random() * 1.2 + 0.4 : layer === 'mid' ? Math.random() * 1.8 + 0.8 : Math.random() * 2.4 + 1.2,
          duration: Math.random() * 5 + 4,
          delay: Math.random() * 6,
          opacity: layer === 'far' ? Math.random() * 0.35 + 0.15 : layer === 'mid' ? Math.random() * 0.5 + 0.25 : Math.random() * 0.65 + 0.35,
          layer,
          depth: depthMap[layer],
        });
      }
    });

    return result.sort((a, b) => a.depth - b.depth);
  }, [count]);

  const cosmicDust = React.useMemo(() => {
    return Array.from({ length: tier.enableGlow ? 12 : 6 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      color: Math.random() > 0.5 ? '139, 92, 246' : '6, 182, 212',
      opacity: Math.random() * 0.15 + 0.05,
    }));
  }, [tier.enableGlow]);

  const parallaxX = parallaxEnabled && !reducedMotion ? smoothX * 18 : 0;
  const parallaxY = parallaxEnabled && !reducedMotion ? smoothY * 18 : 0;

  const getParallaxStyle = (depth: number) => {
    if (!parallaxEnabled || reducedMotion) return {};
    return {
      transform: `translate3d(${parallaxX * depth}px, ${parallaxY * depth}px, 0)`,
      willChange: 'transform',
    };
  };

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Deep space gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#03040a] via-[#070b18] to-[#0a0a1a]" />

      {/* Subtle nebula gradients */}
      <div className="absolute inset-0" style={getParallaxStyle(0.25)}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-900/8 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-cyan-900/6 via-transparent to-transparent" />
        {tier.enableGlow && (
          <>
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/4 rounded-full blur-[80px]" />
            <div className="absolute top-2/3 left-1/2 w-[300px] h-[300px] bg-cyan-500/3 rounded-full blur-[60px]" />
          </>
        )}
      </div>

      {/* Far stars */}
      <div className="absolute inset-0" style={getParallaxStyle(0.15)}>
        {stars.filter(s => s.layer === 'far').map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animation: reducedMotion ? 'none' : `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Mid stars */}
      <div className="absolute inset-0" style={getParallaxStyle(0.4)}>
        {stars.filter(s => s.layer === 'mid').map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animation: reducedMotion ? 'none' : `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Cosmic dust / floating particles */}
      <div className="absolute inset-0" style={getParallaxStyle(0.6)}>
        {cosmicDust.map((dust) => (
          <div
            key={dust.id}
            className="absolute rounded-full"
            style={{
              left: dust.left,
              top: dust.top,
              width: dust.size,
              height: dust.size,
              background: `rgba(${dust.color}, ${dust.opacity})`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* Near stars */}
      <div className="absolute inset-0" style={getParallaxStyle(0.75)}>
        {stars.filter(s => s.layer === 'near').map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animation: reducedMotion ? 'none' : `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Foreground particles */}
      {!reducedMotion && parallaxEnabled && (
        <div className="absolute inset-0" style={getParallaxStyle(1)}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/50 rounded-full"
              style={{
                left: `${10 + i * 15}%`,
                top: `${15 + (i % 3) * 25}%`,
                animation: `twinkle ${2 + i * 0.4}s ease-in-out infinite`,
                animationDelay: `${i * 0.25}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle radial glow */}
      {tier.enableGlow && (
        <div className="absolute inset-0" style={getParallaxStyle(0.3)}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/2 rounded-full blur-[100px]" />
        </div>
      )}
    </div>
  );
}

export { SpaceBackground };
