import { useCallback, useMemo, useRef, useState } from 'react';
import { clamp } from '../utils/digitalIdUtils';

const MAX_TILT_DEG = 10;

/**
 * Subtle pointer-driven tilt for the card. Tracks its own small
 * rotateX/rotateY state, independent of the flip transform so the two
 * can be composed on separate DOM layers without fighting each other.
 */
export function useCardTilt() {
  const stageRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const updateFromPoint = useCallback((clientX, clientY) => {
    const node = stageRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width; // 0..1
    const py = (clientY - rect.top) / rect.height; // 0..1
    const rotateY = clamp((px - 0.5) * 2 * MAX_TILT_DEG, -MAX_TILT_DEG, MAX_TILT_DEG);
    const rotateX = clamp((0.5 - py) * 2 * MAX_TILT_DEG, -MAX_TILT_DEG, MAX_TILT_DEG);
    setTilt({ x: rotateX, y: rotateY });
  }, []);

  const onPointerMove = useCallback(
    (event) => {
      if (prefersReducedMotion) return;
      updateFromPoint(event.clientX, event.clientY);
    },
    [prefersReducedMotion, updateFromPoint],
  );

  const onTouchMove = useCallback(
    (event) => {
      if (prefersReducedMotion) return;
      const touch = event.touches[0];
      if (touch) updateFromPoint(touch.clientX, touch.clientY);
    },
    [prefersReducedMotion, updateFromPoint],
  );

  const reset = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return { stageRef, tilt, onPointerMove, onPointerLeave: reset, onTouchMove, onTouchEnd: reset, reset };
}
