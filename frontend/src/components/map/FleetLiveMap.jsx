import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRealtime } from '@/contexts/RealtimeContext';
import { getAllLocations } from '@/services/locationService';
import { useDriverMarker } from '@/components/map/DriverMarker';
import { motion } from 'framer-motion';
import { Users, Wifi, WifiOff, MapPin, RefreshCw } from 'lucide-react';

// ── CartoDB dark tile layer ───────────────────────────────────────────────────
const TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
} catch {}

// Colour palette per driver index
const COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#14b8a6'];

// ── Inner per-driver marker (uses the hook) ───────────────────────────────────
function SingleDriverMarker({ map, driverId, position, isMoving, label, colorIdx }) {
  useDriverMarker({ map, position, isMoving, label, color: COLORS[colorIdx % COLORS.length] });
  return null;
}

/**
 * Fleet-wide live map — shows all active drivers in real-time.
 * Subscribes to Socket.io `driver:location_update` events +
 * polls REST /api/location/all every 10s as fallback.
 */
export default function FleetLiveMap({ onDriverClick }) {
  const { socket } = useRealtime();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // drivers: { [driverId]: { latitude, longitude, speed, heading, timestamp, name? } }
  const [drivers, setDrivers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // ── Init Leaflet map ───────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
    });

    L.tileLayer(TILE, { attribution: '© CartoDB', subdomains: 'abcd', maxZoom: 20 }).addTo(mapRef.current);
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    setTimeout(() => mapRef.current?.invalidateSize(), 120);

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // ── Socket.io — receive live updates ─────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    setIsConnected(socket.connected);

    const handleUpdate = (data) => {
      if (!data?.driverId || !data?.latitude || !data?.longitude) return;
      setDrivers((prev) => ({
        ...prev,
        [data.driverId]: {
          ...prev[data.driverId],
          latitude:  parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          speed:     parseFloat(data.speed)   || 0,
          heading:   parseFloat(data.heading) || 0,
          timestamp: data.timestamp || Date.now(),
        },
      }));
      setLastSync(new Date());
    };

    const handleStop = (data) => {
      if (!data?.driverId) return;
      setDrivers((prev) => {
        const next = { ...prev };
        delete next[data.driverId];
        return next;
      });
    };

    socket.on('driver:location_update', handleUpdate);
    socket.on('driver:stop_tracking',   (d) => handleStop(d));
    socket.on('connect',    () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Request all active locations on mount
    socket.emit('map:get_all_locations');
    socket.on('map:all_locations', (locs) => {
      if (!Array.isArray(locs)) return;
      const obj = {};
      locs.forEach((l) => { if (l.driverId) obj[l.driverId] = l; });
      setDrivers(obj);
      setLastSync(new Date());
    });

    return () => {
      socket.off('driver:location_update', handleUpdate);
      socket.off('driver:stop_tracking');
      socket.off('map:all_locations');
    };
  }, [socket]);

  // ── REST fallback — poll every 10 seconds ─────────────────────────────────
  useEffect(() => {
    const poll = async () => {
      try {
        const locs = await getAllLocations();
        if (!locs?.length) return;
        setDrivers((prev) => {
          const next = { ...prev };
          locs.forEach((l) => {
            if (l.driverId) next[l.driverId] = { ...next[l.driverId], ...l };
          });
          return next;
        });
        setLastSync(new Date());
      } catch {}
    };
    poll();
    const id = setInterval(poll, 10_000);
    return () => clearInterval(id);
  }, []);

  // ── Fit bounds when drivers appear ────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    const pts = Object.values(drivers).filter((d) => d.latitude && d.longitude);
    if (pts.length === 1) {
      mapRef.current.setView([pts[0].latitude, pts[0].longitude], 14);
    } else if (pts.length > 1) {
      const bounds = L.latLngBounds(pts.map((d) => [d.latitude, d.longitude]));
      mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [Object.keys(drivers).length]);

  const driverList = Object.entries(drivers);
  const fmtTime = (d) => d?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-900">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Animated drivers */}
      {mapRef.current && driverList.map(([id, loc], i) => (
        <SingleDriverMarker
          key={id}
          map={mapRef.current}
          driverId={id}
          position={{ latitude: loc.latitude, longitude: loc.longitude }}
          isMoving={(loc.speed || 0) > 0.5}
          label={loc.name || id.slice(0, 6)}
          colorIdx={i}
        />
      ))}

      {/* Status bar */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center gap-3">
        <div className="bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-3 flex-1">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-white text-sm font-semibold">{driverList.length} Active Driver{driverList.length !== 1 ? 's' : ''}</span>
          <span className="ml-auto text-gray-500 text-xs">{lastSync ? `Synced ${fmtTime(lastSync)}` : 'Waiting...'}</span>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`flex items-center gap-1.5 bg-gray-900/90 border ${isConnected ? 'border-green-500/40' : 'border-red-500/40'} rounded-xl px-3 py-2.5 shadow-lg`}
        >
          {isConnected
            ? <><Wifi className="w-4 h-4 text-green-400" /><span className="text-green-400 text-xs font-medium">Live</span></>
            : <><WifiOff className="w-4 h-4 text-red-400" /><span className="text-red-400 text-xs font-medium">Offline</span></>
          }
        </motion.div>
      </div>

      {/* Driver list sidebar */}
      {driverList.length > 0 && (
        <div className="absolute top-20 right-4 z-40 flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {driverList.map(([id, loc], i) => (
            <button
              key={id}
              onClick={() => { onDriverClick?.(id, loc); if (mapRef.current && loc.latitude) mapRef.current.setView([loc.latitude, loc.longitude], 16); }}
              className="bg-gray-900/90 backdrop-blur border border-gray-700 hover:border-blue-500/50 rounded-xl px-3 py-2.5 text-left shadow-lg transition-all group w-44"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-white text-xs font-semibold truncate">{loc.name || id.slice(0, 8) + '…'}</span>
              </div>
              <p className="text-gray-500 text-[10px] mt-1 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
              </p>
              <span className={`text-[10px] font-medium ${loc.speed > 0.5 ? 'text-green-400' : 'text-amber-400'}`}>
                {loc.speed > 0.5 ? '● Moving' : '● Stopped'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {driverList.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-gray-900/80 backdrop-blur rounded-2xl p-8 text-center border border-gray-700">
            <MapPin className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold">No active drivers</p>
            <p className="text-gray-500 text-sm mt-1">Drivers will appear here when they start sharing location</p>
          </div>
        </div>
      )}
    </div>
  );
}
