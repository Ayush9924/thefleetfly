import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Target, ZoomIn, ZoomOut, AlertCircle, RefreshCw } from 'lucide-react';

// Fix Leaflet default icons once
try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
} catch {}

const TILE_URLS = {
  dark:   'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light:  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

const STATUS_COLORS = { active: '#10b981', idle: '#f59e0b', stopped: '#6b7280' };

const makeIcon = (status, speed) => {
  const color = STATUS_COLORS[status] || STATUS_COLORS.stopped;
  const pulse = status === 'active'
    ? `<div style="position:absolute;top:50%;left:50%;width:50px;height:50px;border:2px solid ${color};border-radius:50%;transform:translate(-50%,-50%);opacity:.3;animation:pulse 2s infinite"></div><style>@keyframes pulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.3}50%{transform:translate(-50%,-50%) scale(1.2);opacity:.1}}</style>`
    : '';
  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `<div style="position:relative;width:40px;height:40px">${pulse}<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:32px;background:${color};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 8px rgba(0,0,0,.3);cursor:pointer;z-index:2"><span style="color:white;font-size:11px;font-weight:bold">${Math.round(speed)}</span></div></div>`,
    iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -20],
  });
};

const geocode = async (query) => {
  if (!query?.trim()) return null;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
    const json = await res.json();
    if (!json?.length) return null;
    return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon), display_name: json[0].display_name };
  } catch { return null; }
};

const haversineKm = (a, b) => {
  const R = 6371, toRad = v => v * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export default function LiveMapTracker({ drivers = [], vehicles = [], onDriverClick = null, onVehicleClick = null }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const tileRef = useRef(null);
  const userMoved = useRef(false);
  const fitDone = useRef(false);
  const planLayerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapStyle, setMapStyle] = useState('dark');
  const [routeOpen, setRouteOpen] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [fuel, setFuel] = useState(8);
  const [fuelPrice, setFuelPrice] = useState(1.2);
  const [routeInfo, setRouteInfo] = useState(null);

  const data = vehicles.length ? vehicles : drivers;

  // Init map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    try {
      mapRef.current = L.map(containerRef.current, { center: [40.7128, -74.006], zoom: 12, preferCanvas: true });
      tileRef.current = L.tileLayer(TILE_URLS.dark, { attribution: '© CartoDB', subdomains: 'abcd', maxZoom: 20 }).addTo(mapRef.current);
      L.control.scale({ imperial: false, position: 'bottomright' }).addTo(mapRef.current);
      mapRef.current.on('movestart zoomstart dragstart', () => { userMoved.current = true; });
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
      setIsLoading(false);
    } catch (e) {
      setError(e.message);
      setIsLoading(false);
    }
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Swap tile layer on style change
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.eachLayer(l => { if (l instanceof L.TileLayer) mapRef.current.removeLayer(l); });
    L.tileLayer(TILE_URLS[mapStyle] || TILE_URLS.dark, { attribution: '© CartoDB/OSM', subdomains: 'abcd', maxZoom: 20 }).addTo(mapRef.current);
  }, [mapStyle]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || isLoading || !data.length) return;
    const bounds = L.latLngBounds();
    const present = new Set();

    data.forEach(item => {
      const id = item.vehicleId || item.driverId || item.id;
      if (!id || !item.latitude || !item.longitude) return;
      present.add(id);

      const popup = `<div style="padding:8px;min-width:160px;font-family:system-ui"><b>${item.driverId || item.licensePlate || id}</b><br/><span style="color:#6b7280;font-size:12px">${(item.speed || 0).toFixed(1)} km/h · ${item.status}</span></div>`;
      if (markersRef.current[id]) {
        markersRef.current[id].setLatLng([item.latitude, item.longitude]);
        markersRef.current[id].setIcon(makeIcon(item.status || 'stopped', item.speed || 0));
        markersRef.current[id].getPopup()?.setContent(popup);
      } else {
        const m = L.marker([item.latitude, item.longitude], { icon: makeIcon(item.status || 'stopped', item.speed || 0), title: id }).bindPopup(popup);
        const cb = onVehicleClick || onDriverClick;
        if (cb) m.on('click', () => cb(item.vehicleId || item.driverId || id));
        m.addTo(mapRef.current);
        markersRef.current[id] = m;
      }
      bounds.extend([item.latitude, item.longitude]);
    });

    Object.keys(markersRef.current).forEach(id => {
      if (!present.has(id)) {
        try { mapRef.current.removeLayer(markersRef.current[id]); } catch {}
        delete markersRef.current[id];
      }
    });

    if (bounds.isValid() && !userMoved.current && !fitDone.current) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      fitDone.current = true;
    }
    setTimeout(() => mapRef.current?.invalidateSize(), 50);
  }, [data, isLoading, onDriverClick, onVehicleClick]);

  const clearPlan = () => {
    try { if (planLayerRef.current && mapRef.current) mapRef.current.removeLayer(planLayerRef.current); } catch {}
    planLayerRef.current = null;
    setRouteInfo(null);
  };

  const computeRoute = async () => {
    clearPlan();
    setRouteInfo({ loading: true });
    if (!mapRef.current) { setRouteInfo({ error: 'Map not ready' }); return; }
    const [oGeo, dGeo] = await Promise.all([geocode(origin), geocode(destination)]);
    if (!oGeo || !dGeo) { setRouteInfo({ error: 'Could not geocode places. Try a different name.' }); return; }
    const distanceKm = haversineKm(oGeo, dGeo);
    const fuelNeeded = distanceKm * (fuel / 100);
    const cost = fuelNeeded * fuelPrice;
    const line = L.polyline([[oGeo.lat, oGeo.lng], [dGeo.lat, dGeo.lng]], { color: '#2563eb', weight: 4 });
    const mo = L.marker([oGeo.lat, oGeo.lng]).bindPopup(`Origin: ${oGeo.display_name}`);
    const md = L.marker([dGeo.lat, dGeo.lng]).bindPopup(`Dest: ${dGeo.display_name}`);
    planLayerRef.current = L.layerGroup([line, mo, md]).addTo(mapRef.current);
    mapRef.current.fitBounds(line.getBounds(), { padding: [40, 40] });
    userMoved.current = true;
    setRouteInfo({ distanceKm, fuelNeeded, cost, originName: oGeo.display_name, destinationName: dGeo.display_name });
  };

  const ctrlBtn = 'bg-gray-900/90 hover:bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg transition-all';

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full bg-gray-800 min-h-96" />

      {/* Overlays */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-50">
          <div className="w-10 h-10 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-3" />
          <p className="text-white text-sm">Loading map…</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-900/95 rounded-xl p-6 text-center border border-gray-800 max-w-sm w-full">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Map Error</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">Reload</button>
          </div>
        </div>
      )}
      {!data.length && !isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-40">
          <Navigation className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-white text-sm font-medium">Waiting for vehicle data…</p>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
        <button onClick={() => { const b = L.latLngBounds(); data.forEach(d => d.latitude && b.extend([d.latitude, d.longitude])); if (b.isValid()) { mapRef.current?.fitBounds(b, { padding: [50, 50] }); userMoved.current = true; } }} className={ctrlBtn} title="Center"><Target className="w-5 h-5 text-gray-300" /></button>
        <button onClick={() => mapRef.current?.zoomIn()} className={ctrlBtn} title="Zoom In"><ZoomIn className="w-5 h-5 text-gray-300" /></button>
        <button onClick={() => mapRef.current?.zoomOut()} className={ctrlBtn} title="Zoom Out"><ZoomOut className="w-5 h-5 text-gray-300" /></button>
        <button onClick={() => setMapStyle(s => ({ dark: 'light', light: 'street', street: 'dark' })[s])} className={`${ctrlBtn} text-sm text-gray-300`} title="Style">
          {mapStyle === 'dark' ? '🌙' : mapStyle === 'light' ? '☀️' : '🗺️'}
        </button>
        <button onClick={() => mapRef.current?.invalidateSize()} className={ctrlBtn} title="Refresh"><RefreshCw className="w-5 h-5 text-gray-300" /></button>
      </div>

      {/* Status badge */}
      <div className="absolute top-4 left-4 z-40 bg-gray-900/90 backdrop-blur rounded-lg border border-gray-700 px-3 py-2 flex items-center gap-3">
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-gray-300 text-sm">Live</span></div>
        <div className="w-px h-4 bg-gray-700" />
        <span className="text-gray-300 text-sm">{data.length} vehicles</span>
        <button onClick={() => setRouteOpen(v => !v)} className="ml-2 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition">Route</button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-40 bg-gray-900/90 backdrop-blur rounded-lg border border-gray-700 p-3">
        <p className="text-xs font-semibold text-white mb-2">Status</p>
        {[['active','#10b981','Active'],['idle','#f59e0b','Idle'],['stopped','#6b7280','Stopped']].map(([,c,l]) => (
          <div key={l} className="flex items-center gap-2 mb-1"><div style={{background:c}} className="w-2.5 h-2.5 rounded-full" /><span className="text-xs text-gray-300">{l}</span></div>
        ))}
      </div>

      {/* Route planner */}
      {routeOpen && (
        <div className="absolute top-20 left-4 z-40 w-80 bg-gray-900/95 rounded-xl border border-gray-700 p-4 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-white">Route Planner</p>
            <button onClick={() => { setRouteOpen(false); clearPlan(); }} className="text-gray-400 hover:text-white text-xs transition">Close</button>
          </div>
          <div className="space-y-2 text-xs text-gray-300">
            <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Origin (city name)" className="w-full px-2 py-1.5 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Destination (city name)" className="w-full px-2 py-1.5 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block mb-0.5 text-gray-400">Fuel (L/100km)</label><input type="number" value={fuel} onChange={e => setFuel(+e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none" /></div>
              <div><label className="block mb-0.5 text-gray-400">Price/L</label><input type="number" value={fuelPrice} onChange={e => setFuelPrice(+e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none" /></div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={computeRoute} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-xs font-medium">Calculate</button>
              <button onClick={() => { setOrigin(''); setDestination(''); clearPlan(); }} className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition text-xs">Clear</button>
            </div>
            {routeInfo && (
              <div className="pt-2 border-t border-gray-700 space-y-0.5">
                {routeInfo.loading && <p className="text-gray-400">Calculating…</p>}
                {routeInfo.error && <p className="text-red-400">{routeInfo.error}</p>}
                {routeInfo.distanceKm !== undefined && <>
                  <p>From: <b>{routeInfo.originName}</b></p>
                  <p>To: <b>{routeInfo.destinationName}</b></p>
                  <p>Distance: <b>{routeInfo.distanceKm.toFixed(2)} km</b></p>
                  <p>Fuel: <b>{routeInfo.fuelNeeded.toFixed(2)} L</b></p>
                  <p>Cost: <b>₹{routeInfo.cost.toFixed(2)}</b></p>
                </>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



