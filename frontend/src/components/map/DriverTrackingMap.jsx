import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { useDriverMarker } from '@/components/map/DriverMarker';
import { MapPin, Navigation, ZoomIn, ZoomOut, Crosshair, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

// Fix Leaflet default icon once
try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
} catch {}

const fmtTime = (d) => d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--';

/**
 * Single-driver live tracking map — Uber-style smooth marker,
 * auto-follow toggle, breadcrumb trail.
 *
 * @param {{ driverId, driverName, onBack }} props
 */
export default function DriverTrackingMap({ driverId, driverName = 'Driver', onBack }) {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const trailRef        = useRef(null);
  const [autoFollow, setAutoFollow] = useState(true);

  const {
    interpolatedPosition: position,
    isMoving,
    lastUpdated,
    error,
  } = useLocationTracker(driverId);

  // ── Init map ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(mapRef.current);

    // Breadcrumb trail polyline
    trailRef.current = L.polyline([], {
      color: '#3b82f6',
      weight: 3,
      opacity: 0.7,
      dashArray: '6 4',
    }).addTo(mapRef.current);

    setTimeout(() => mapRef.current?.invalidateSize(), 100);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Driver marker (animated) ───────────────────────────────────────────────
  useDriverMarker({
    map: mapRef.current,
    position,
    isMoving,
    label: driverName,
    color: isMoving ? '#10b981' : '#f59e0b',
  });

  // ── Pan map + extend trail when position updates ───────────────────────────
  useEffect(() => {
    if (!position || !mapRef.current) return;

    const latlng = L.latLng(position.latitude, position.longitude);

    // Extend trail
    if (trailRef.current) trailRef.current.addLatLng(latlng);

    // Auto-follow
    if (autoFollow) mapRef.current.panTo(latlng, { animate: true, duration: 1.2 });
  }, [position, autoFollow]);

  const ctrlBtn = 'bg-gray-900/90 p-2.5 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition shadow-lg';

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-900">
      {/* Map */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Header overlay */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack}
            className="bg-gray-900/90 border border-gray-700 p-2.5 rounded-xl text-gray-300 hover:text-white transition shadow-lg">
            ←
          </button>
        )}
        <div className="bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isMoving ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
          <div>
            <p className="text-white text-sm font-semibold leading-none">{driverName}</p>
            <p className="text-gray-400 text-xs mt-0.5">{isMoving ? 'Moving' : 'Stopped'} · {fmtTime(lastUpdated)}</p>
          </div>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`flex items-center gap-1.5 bg-gray-900/90 border ${error ? 'border-red-500/40' : 'border-green-500/40'} rounded-xl px-3 py-2 text-xs font-medium shadow-lg`}
        >
          {error ? <WifiOff className="w-3.5 h-3.5 text-red-400" /> : <Wifi className="w-3.5 h-3.5 text-green-400" />}
          <span className={error ? 'text-red-400' : 'text-green-400'}>{error ? 'No signal' : 'Live'}</span>
        </motion.div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
        <button onClick={() => mapRef.current?.zoomIn()} className={ctrlBtn} title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
        <button onClick={() => mapRef.current?.zoomOut()} className={ctrlBtn} title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
        <button
          onClick={() => setAutoFollow(v => !v)}
          className={`${ctrlBtn} ${autoFollow ? 'text-blue-400 border-blue-500/40 bg-blue-900/30' : ''}`}
          title="Auto-Follow"
        >
          <Navigation className="w-4 h-4" />
        </button>
        <button onClick={() => { if (position && mapRef.current) mapRef.current.setView([position.latitude, position.longitude], 16); }} className={ctrlBtn} title="Center"><Crosshair className="w-4 h-4" /></button>
      </div>

      {/* Position info overlay */}
      {position && (
        <div className="absolute bottom-4 left-4 z-40 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl px-4 py-3 shadow-lg text-xs">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Current Position</span>
          </div>
          <p className="text-white font-mono">{position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}</p>
          {position.accuracy && <p className="text-gray-500 mt-0.5">Accuracy: ±{Math.round(position.accuracy)}m</p>}
        </div>
      )}

      {/* Error overlay */}
      {error && !position && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-gray-900/80">
          <div className="text-center p-6">
            <MapPin className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold text-sm">Waiting for location...</p>
            <p className="text-gray-400 text-xs mt-1">Driver hasn't shared location yet</p>
          </div>
        </div>
      )}
    </div>
  );
}
