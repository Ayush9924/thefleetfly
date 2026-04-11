import { useState, useEffect, useRef, useCallback } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { getLocation } from '@/services/locationService';

// Stores last N positions for interpolation
const HISTORY = 3;

/**
 * Tracks a single driver's position — subscribes to Socket.io first,
 * polls REST every 2s as fallback/reconciliation.
 *
 * Swapping to pure WebSocket later = only change the internals of this hook.
 *
 * @param {string|null} driverId
 * @returns {{ position, previousPosition, interpolatedPosition, isMoving, lastUpdated, error }}
 */
export function useLocationTracker(driverId) {
  const { socket } = useRealtime();
  const [position, setPosition]         = useState(null);
  const [previousPosition, setPrev]     = useState(null);
  const [isMoving, setIsMoving]         = useState(false);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [error, setError]               = useState(null);
  const [interpolated, setInterpolated] = useState(null);

  const historyRef  = useRef([]); // ring buffer of last 3 positions
  const intervalRef = useRef(null);
  const animRef     = useRef(null);

  // ── Position update handler (shared by socket and REST) ───────────────────
  const applyPosition = useCallback((newPos) => {
    if (!newPos?.latitude || !newPos?.longitude) return;

    const pt = {
      latitude:  parseFloat(newPos.latitude),
      longitude: parseFloat(newPos.longitude),
      speed:     parseFloat(newPos.speed)   || 0,
      heading:   parseFloat(newPos.heading) || 0,
      accuracy:  newPos.accuracy            || null,
      timestamp: newPos.timestamp           || Date.now(),
    };

    setPosition((prev) => {
      setPrev(prev);
      return pt;
    });
    setIsMoving(pt.speed > 0.5 || (newPos.is_moving ?? true));
    setLastUpdated(new Date());
    setError(null);

    // Update history ring
    historyRef.current = [...historyRef.current, pt].slice(-HISTORY);

    // Smooth interpolation: animate linearly toward new position over 1.8s
    const startPos = historyRef.current[historyRef.current.length - 2] || pt;
    const endPos = pt;
    const duration = 1800;
    const startTime = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      setInterpolated({
        latitude:  startPos.latitude  + (endPos.latitude  - startPos.latitude)  * t,
        longitude: startPos.longitude + (endPos.longitude - startPos.longitude) * t,
      });
      if (t < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  }, []);

  // ── Socket.io subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !driverId) return;

    const handler = (data) => {
      if (data.driverId === driverId) applyPosition(data);
    };

    socket.on('driver:location_update', handler);
    // Ask server for latest immediately
    socket.emit('map:request_location', { driverId });

    return () => socket.off('driver:location_update', handler);
  }, [socket, driverId, applyPosition]);

  // ── REST polling (every 2s as reconciliation) ────────────────────────────
  useEffect(() => {
    if (!driverId) return;

    const poll = async () => {
      try {
        const loc = await getLocation(driverId);
        if (loc) applyPosition(loc);
      } catch {}
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      clearInterval(intervalRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [driverId, applyPosition]);

  return {
    position,
    previousPosition,
    interpolatedPosition: interpolated || position,
    isMoving,
    lastUpdated,
    error,
  };
}
