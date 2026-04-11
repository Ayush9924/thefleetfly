import { useState, useEffect, useRef, useCallback } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useAuth } from '@/contexts/AuthContext';

/** Haversine distance in metres */
function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6_371_000;
  const r = (v) => (v * Math.PI) / 180;
  const dLat = r(lat2 - lat1);
  const dLon = r(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Manages browser navigator.geolocation.watchPosition.
 * Emits location updates via Socket.io on every significant move (> 2m).
 *
 * Returns: { isSharing, status, error, currentPosition, startSharing, stopSharing }
 */
export function useLocationSharing() {
  const { socket } = useRealtime();
  const { currentUser } = useAuth();

  const [status, setStatus]             = useState('idle'); // idle|requesting|sharing|denied|error
  const [error, setError]               = useState(null);
  const [currentPosition, setPosition]  = useState(null);

  const watchIdRef  = useRef(null);
  const lastPosRef  = useRef(null);
  const driverIdRef = useRef(null);

  // Keep driverId in sync with auth
  useEffect(() => {
    driverIdRef.current = currentUser?._id || currentUser?.id || null;
  }, [currentUser]);

  const emitLocation = useCallback((latitude, longitude, speed, heading, accuracy) => {
    if (!socket) return;

    const payload = {
      driverId: driverIdRef.current,
      latitude,
      longitude,
      speed:    speed    || 0,
      heading:  heading  || 0,
      accuracy: accuracy || 0,
    };

    if (socket.connected) {
      socket.emit('driver:location_update', payload);
    }
  }, [socket]);

  const handlePosition = useCallback((pos) => {
    const { latitude, longitude, accuracy, speed, heading } = pos.coords;

    // Deduplicate: ignore if < 2m from last known position
    if (lastPosRef.current) {
      const dist = haversineM(lastPosRef.current.lat, lastPosRef.current.lng, latitude, longitude);
      if (dist < 2) return;
    }

    lastPosRef.current = { lat: latitude, lng: longitude };
    setStatus('sharing');
    setPosition({ latitude, longitude, accuracy, timestamp: Date.now() });
    emitLocation(latitude, longitude, speed, heading, accuracy);
  }, [emitLocation]);

  const handleError = useCallback((err) => {
    if (err.code === 1) { // PERMISSION_DENIED
      setStatus('denied');
      setError('GPS access denied. Please allow location in your browser settings.');
    } else {
      setStatus('error');
      setError(err.message || 'Failed to get location');
    }
  }, []);

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setStatus('requesting');
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15_000 },
    );

    // Tell the server this driver started tracking
    if (socket?.connected && driverIdRef.current) {
      socket.emit('driver:join_tracking', { driverId: driverIdRef.current });
    }
  }, [handlePosition, handleError, socket]);

  const stopSharing = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (socket?.connected && driverIdRef.current) {
      socket.emit('driver:stop_tracking', { driverId: driverIdRef.current });
    }
    setStatus('idle');
    setPosition(null);
    lastPosRef.current = null;
  }, [socket]);

  // Stop watching on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    isSharing: status === 'sharing',
    status,
    error,
    currentPosition,
    startSharing,
    stopSharing,
  };
}
