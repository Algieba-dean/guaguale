import { useEffect, useRef, useState, useCallback } from 'react';

interface UseDeviceShakeOptions {
  onShake: () => void;
  threshold?: number;
  enabled?: boolean;
}

interface DeviceMotionEventConstructorWithPermission {
  new (type: string, eventInitDict?: DeviceMotionEventInit): DeviceMotionEvent;
  prototype: DeviceMotionEvent;
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export function isShakeAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                   ('ontouchstart' in window);
  return 'DeviceMotionEvent' in window && isMobile;
}

/**
 * Custom React hook that detects device shaking via the DeviceMotionEvent API.
 * Uses a velocity/speed-based calculation to cancel gravity and detect shake intent.
 */
export function useDeviceShake({
  onShake,
  threshold = 15, // standard shake.js threshold
  enabled = true,
}: UseDeviceShakeOptions) {
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Keep a stable ref to the latest onShake callback
  const onShakeRef = useRef(onShake);
  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  const lastTriggerRef = useRef<number>(0);

  // ---- iOS 13+ permission flow ----
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isShakeAvailable()) return false;

    const DME = DeviceMotionEvent as unknown as DeviceMotionEventConstructorWithPermission;

    if (typeof DME.requestPermission === 'function') {
      try {
        const result = await DME.requestPermission();
        const granted = result === 'granted';
        setPermissionGranted(granted);
        return granted;
      } catch {
        setPermissionGranted(false);
        return false;
      }
    }

    // Non-iOS: permission is implicitly granted
    setPermissionGranted(true);
    return true;
  }, []);

  // ---- Attach / detach the devicemotion listener ----
  useEffect(() => {
    if (!enabled || !isShakeAvailable()) return;

    const DME = DeviceMotionEvent as unknown as DeviceMotionEventConstructorWithPermission;
    const needsPermission = typeof DME.requestPermission === 'function';

    if (!needsPermission && !permissionGranted) {
      setPermissionGranted(true);
    }

    if (needsPermission && !permissionGranted) return;

    const COOLDOWN_MS = 1000;
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;
    let lastTime = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      // Prefer acceleration (which excludes gravity) if available
      const acc = event.acceleration || event.accelerationIncludingGravity;
      if (!acc) return;

      const { x, y, z } = acc;
      if (x === null || y === null || z === null) return;

      const currentTime = Date.now();
      if (lastTime === 0) {
        lastTime = currentTime;
        lastX = x;
        lastY = y;
        lastZ = z;
        return;
      }

      const diffTime = currentTime - lastTime;
      // Sampling rate limit (approx. every 80ms) to avoid noise
      if (diffTime > 80) {
        lastTime = currentTime;

        if (lastX !== null && lastY !== null && lastZ !== null) {
          // Standard shake velocity/speed calculation formula
          const speed = (Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime) * 10000;

          if (speed >= threshold) {
            const now = Date.now();
            if (now - lastTriggerRef.current >= COOLDOWN_MS) {
              lastTriggerRef.current = now;
              onShakeRef.current();
            }
          }
        }

        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };

    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [enabled, permissionGranted, threshold]);

  return { requestPermission, permissionGranted };
}
