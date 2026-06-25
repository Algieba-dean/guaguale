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

/**
 * Check if the DeviceMotion API is available in the current environment.
 */
export function isShakeAvailable(): boolean {
  return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
}

/**
 * Custom React hook that detects device shaking via the DeviceMotionEvent API.
 *
 * Handles:
 * - iOS 13+ permission model (DeviceMotionEvent.requestPermission)
 * - Android (no permission needed, auto-attaches listener)
 * - Desktop browsers (graceful no-op)
 * - Cooldown period to prevent rapid-fire triggers
 * - Cleanup on unmount
 */
export function useDeviceShake({
  onShake,
  threshold = 25,
  enabled = true,
}: UseDeviceShakeOptions) {
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Keep a stable ref to the latest onShake callback so the motion handler
  // never closes over a stale version.
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

    // On platforms that don't require an explicit permission request we can
    // treat motion as implicitly permitted.
    if (!needsPermission && !permissionGranted) {
      setPermissionGranted(true);
    }

    // If explicit permission is required but hasn't been granted yet, bail out
    // and wait for the user to call `requestPermission`.
    if (needsPermission && !permissionGranted) return;

    const COOLDOWN_MS = 800;

    const handleMotion = (event: DeviceMotionEvent) => {
      const { accelerationIncludingGravity } = event;
      if (!accelerationIncludingGravity) return;

      const { x, y, z } = accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;

      // Compute the total acceleration force across all three axes.
      const force = Math.sqrt(x * x + y * y + z * z);

      if (force >= threshold) {
        const now = Date.now();
        if (now - lastTriggerRef.current >= COOLDOWN_MS) {
          lastTriggerRef.current = now;
          onShakeRef.current();
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [enabled, permissionGranted, threshold]);

  return { requestPermission, permissionGranted };
}
