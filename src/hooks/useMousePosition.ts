'use client';

import * as React from 'react';

interface UseMousePositionOptions {
  smooth?: boolean;
  smoothFactor?: number;
  enabled?: boolean;
}

interface UseMousePositionReturn {
  x: number;
  y: number;
  smoothX: number;
  smoothY: number;
}

function useMousePosition(options: UseMousePositionOptions = {}): UseMousePositionReturn {
  const { smooth = true, smoothFactor = 0.08, enabled = true } = options;
  const [smoothMouse, setSmoothMouse] = React.useState({ x: 0, y: 0 });
  const rafRef = React.useRef<number | null>(null);
  const targetRef = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRef.current = { x, y };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled]);

  React.useEffect(() => {
    if (!smooth || !enabled) return;

    let frameCount = 0;
    const animate = () => {
      frameCount++;
      if (frameCount % 2 !== 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      setSmoothMouse((prev) => ({
        x: prev.x + (targetRef.current.x - prev.x) * smoothFactor,
        y: prev.y + (targetRef.current.y - prev.y) * smoothFactor,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [smooth, smoothFactor, enabled]);

  return { x: smoothMouse.x, y: smoothMouse.y, smoothX: smoothMouse.x, smoothY: smoothMouse.y };
}

export { useMousePosition };
