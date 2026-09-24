import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clamp } from '../utils/digitalIdUtils';

const MAX_TILT_DEG = 10;
/** Device tilt (degrees away from the resting pose) that maps to a full card tilt. */
const DEVICE_RANGE_DEG = 25;
/** How fast the resting pose follows the phone, so holding it at an angle settles back to neutral. */
const BASELINE_DRIFT = 0.02;
/** Ignore device motion this long after the finger/mouse last moved over the card. */
const POINTER_PRIORITY_MS = 400;

/**
 * Tilt for the card, driven by the pointer (mouse / touch) and by the
 * device's motion sensors (phone or tablet gyroscope). Tracks its own
 * rotateX/rotateY state, independent of the flip transform so the two
 * can be composed on separate DOM layers without fighting each other.
 *
 * `glare` is the same tilt normalised to -1..1 (x: right, y: down); the
 * card exposes it as CSS variables that steer the light sheen and the
 * parallax of the artwork.
 *
 * iOS only delivers motion events after the user grants permission from
 * a tap, so `enableMotion()` must be called from a user gesture. Other
 * browsers need no permission and start listening straight away.
 */
export function useCardTilt() {
  const stageRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [motionActive, setMotionActive] = useState(false);
  const lastPointerRef = useRef(0);
  const baselineRef = useRef(null);
  const listeningRef = useRef(false);
  const deniedRef = useRef(false);

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const updateFromPoint = useCallback((clientX, clientY) => {
    const node = stageRef.current;
    if (!node) return;
    lastPointerRef.current = performance.now();
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

  const handleOrientation = useCallback((event) => {
    const { beta, gamma } = event;
    // Desktop browsers fire one event with null values; ignore it.
    if (beta == null || gamma == null) return;
    if (performance.now() - lastPointerRef.current < POINTER_PRIORITY_MS) return;

    const base = baselineRef.current;
    if (!base) {
      baselineRef.current = { beta, gamma };
      return;
    }
    base.beta += (beta - base.beta) * BASELINE_DRIFT;
    base.gamma += (gamma - base.gamma) * BASELINE_DRIFT;

    const dx = clamp((gamma - base.gamma) / DEVICE_RANGE_DEG, -1, 1);
    const dy = clamp((beta - base.beta) / DEVICE_RANGE_DEG, -1, 1);
    setMotionActive(true);
    setTilt({ x: -dy * MAX_TILT_DEG, y: dx * MAX_TILT_DEG });
  }, []);

  const startListening = useCallback(() => {
    if (listeningRef.current) return;
    listeningRef.current = true;
    window.addEventListener('deviceorientation', handleOrientation);
  }, [handleOrientation]);

  const enableMotion = useCallback(async () => {
    if (prefersReducedMotion || listeningRef.current || deniedRef.current) return;
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return;

    const request = window.DeviceOrientationEvent.requestPermission;
    if (typeof request === 'function') {
      try {
        const result = await request.call(window.DeviceOrientationEvent);
        if (result !== 'granted') {
          deniedRef.current = true;
          return;
        }
      } catch {
        deniedRef.current = true;
        return;
      }
    }
    startListening();
  }, [prefersReducedMotion, startListening]);

  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') return undefined;
    // Everything except iOS can listen without a permission prompt.
    if (
      'DeviceOrientationEvent' in window &&
      typeof window.DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      startListening();
    }
    const resetBaseline = () => {
      baselineRef.current = null;
    };
    window.addEventListener('orientationchange', resetBaseline);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('orientationchange', resetBaseline);
      listeningRef.current = false;
    };
  }, [prefersReducedMotion, startListening, handleOrientation]);

  const glare = { x: tilt.y / MAX_TILT_DEG, y: -tilt.x / MAX_TILT_DEG };

  return {
    stageRef,
    tilt,
    glare,
    motionActive,
    enableMotion,
    onPointerMove,
    onPointerLeave: reset,
    onTouchMove,
    onTouchEnd: reset,
    reset,
  };
}