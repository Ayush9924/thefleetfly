/**
 * LiveTrackingPage — Real-time GPS tracking
 * DRIVER: emits location via socket  |  ADMIN: receives and maps all drivers
 *
 * Map height fix: uses absolute inset-0 inside a relative container
 * whose height is set explicitly via calc(100vh - header).
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Users, Navigation, Wifi, WifiOff,
  MapPin, ZoomIn, ZoomOut, Crosshair,
  AlertCircle, Loader2, Play, Square, Activity
} from 'lucide-react';

// ─── Leaflet icon fix ────────────────────────────────────────────────────────
try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
} catch (_) {}

// ─── Pulse CSS (once) ────────────────────────────────────────────────────────
let _cssReady = false;
function ensureCSS() {
  if (_cssReady) return; _cssReady = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes lp-ping {
      0%   { transform:translate(-50%,-50%) scale(.8); opacity:1; }
      100% { transform:translate(-50%,-50%) scale(2.8); opacity:0; }
    }
    .lp-wrap { position:relative; width:44px; height:44px; }
    .lp-dot  { position:absolute; top:50%; left:50%; width:16px; height:16px;
               border-radius:50%; border:3px solid #fff;
               box-shadow:0 2px 8px rgba(0,0,0,.45);
               transform:translate(-50%,-50%); z-index:2; }
    .lp-ring { position:absolute; top:50%; left:50%; width:16px; height:16px;
               border-radius:50%; animation:lp-ping 1.6s ease-out infinite; }
    .lp-lbl  { position:absolute; bottom:-18px; left:50%; transform:translateX(-50%);
               background:rgba(0,0,0,.75); color:#fff; font-size:9px; font-weight:700;
               padding:1px 5px; border-radius:3px; white-space:nowrap;
               pointer-events:none; }
  `;
  document.head.appendChild(s);
}

function makeIcon(color, moving, label) {
  ensureCSS();
  return L.divIcon({
    html: `<div class="lp-wrap">
      ${moving ? `<div class="lp-ring" style="background:${color};opacity:.45;"></div>` : ''}
      <div class="lp-dot" style="background:${color};"></div>
      ${label ? `<div class="lp-lbl">${label}</div>` : ''}
    </div>`,
    className: '', iconSize:[44,44], iconAnchor:[22,22], popupAnchor:[0,-22],
  });
}

const COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899'];
const fmt = d => d ? new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '--';

function haversineM(lat1,lon1,lat2,lon2){
  const R=6371000,r=v=>v*Math.PI/180;
  const a=Math.sin(r(lat2-lat1)/2)**2+Math.cos(r(lat1))*Math.cos(r(lat2))*Math.sin(r(lon2-lon1)/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

const toId = (value) => {
  if (value == null) return '';
  return String(value);
};

// ════════════════════════════════════════════════════════════════════════════
// DRIVER VIEW
// ════════════════════════════════════════════════════════════════════════════
function DriverView() {
  const { socket } = useRealtime();
  const { currentUser } = useAuth();
  const [status, setStatus]     = useState('idle');
  const [error, setError]       = useState(null);
  const [position, setPosition] = useState(null);
  const [autoFollow, setAutoFollow] = useState(true);

  const mapRef = useRef(null); const containerRef = useRef(null);
  const markerRef = useRef(null); const trailRef = useRef(null);
  const watchRef   = useRef(null);  // watchPosition id
  const keepaliveRef = useRef(null); // 30s stopped keepalive

  // Smart-emit tracking
  const lastEmittedRef = useRef(null); // { lat, lng, ts } of last socket emit
  const lastPayloadRef = useRef(null); // last full payload (for keepalive)

  // Tuning constants (edit these to balance freshness vs cost)
  const MOVE_THRESHOLD_M   = 10;    // emit only if moved ≥10m from last emit
  const MOVING_MAX_MS      = 7000;  // max gap between emits when moving (7s)
  const STOPPED_KEEPALIVE  = 30000; // keepalive interval when not moving (30s)
  const STOPPED_KMH        = 2;     // below this speed = "stopped"

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    mapRef.current = L.map(containerRef.current, { center:[20.59,78.96], zoom:13, zoomControl:false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { attribution:'© CartoDB', subdomains:'abcd', maxZoom:20 }).addTo(mapRef.current);
    trailRef.current = L.polyline([], { color:'#60a5fa', weight:3, opacity:.7, dashArray:'6 4' }).addTo(mapRef.current);
    setTimeout(() => mapRef.current?.invalidateSize(), 200);
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!position || !mapRef.current) return;
    const { latitude:lat, longitude:lng } = position;
    const icon = makeIcon('#10b981', true, 'You');
    if (!markerRef.current) {
      markerRef.current = L.marker([lat,lng],{icon,zIndexOffset:1000}).addTo(mapRef.current);
    } else { markerRef.current.setLatLng([lat,lng]).setIcon(icon); }
    trailRef.current?.addLatLng([lat,lng]);
    if (autoFollow) mapRef.current.panTo([lat,lng],{animate:true,duration:1});
  }, [position, autoFollow]);

  // socketRef / currentUserRef — always hold latest values without stale closure
  const socketRef      = useRef(socket);
  useEffect(() => { socketRef.current = socket; }, [socket]);
  const currentUserRef = useRef(currentUser);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  /**
   * The single emit gate.
   * Guards:
   *  1. socket must be connected
   *  2. moved ≥ MOVE_THRESHOLD_M from last emit  OR  gap ≥ MOVING_MAX_MS
   */
  const emitLocation = useCallback((lat, lng, accuracy, speed, heading, force = false) => {
    const s    = socketRef.current;
    const user = currentUserRef.current;
    const driverId = toId(user?._id || user?.id);

    if (!s?.connected || !driverId) return;

    const now  = Date.now();
    const last = lastEmittedRef.current;
    const distMoved  = last ? haversineM(last.lat, last.lng, lat, lng) : Infinity;
    const timeSince  = last ? now - last.ts : Infinity;
    const isMoving   = ((speed || 0) * 3.6) >= STOPPED_KMH;

    if (!force && distMoved < MOVE_THRESHOLD_M && timeSince < (isMoving ? MOVING_MAX_MS : STOPPED_KEEPALIVE)) {
      return;
    }

    const payload = {
      driverId,
      latitude:  lat,
      longitude: lng,
      speed:     speed   || 0,
      heading:   heading || 0,
      accuracy:  accuracy || 0,
    };
    lastEmittedRef.current = { lat, lng, ts: now };
    lastPayloadRef.current  = payload;
    s.emit('driver:location_update', payload);
  }, []); // eslint-disable-line

  const handlePos = useCallback((pos) => {
    const { latitude: lat, longitude: lng, accuracy, speed, heading } = pos.coords;
    setStatus('sharing');
    setPosition({ latitude: lat, longitude: lng, accuracy, timestamp: Date.now() });
    emitLocation(lat, lng, accuracy, speed, heading);
  }, [emitLocation]);

  const handleErr = useCallback((err) => {
    const msg = { 1:'GPS denied — allow location in browser settings.', 2:'Location unavailable.', 3:'GPS timed out.' };
    setStatus(err.code === 1 ? 'denied' : 'error');
    setError(msg[err.code] || err.message);
    console.error('[DRIVER] ❌ Geo error:', err.code, err.message);
  }, []);

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) { setStatus('error'); setError('Geolocation not supported.'); return; }
    setStatus('requesting'); setError(null);
    lastEmittedRef.current  = null;
    lastPayloadRef.current  = null;

    const driverId = currentUserRef.current?._id || currentUserRef.current?.id;
    const normalizedDriverId = toId(driverId);
    if (socketRef.current?.connected && normalizedDriverId) {
      socketRef.current.emit('driver:join_tracking', { driverId: normalizedDriverId });
    }

    watchRef.current = navigator.geolocation.watchPosition(handlePos, handleErr, {
      enableHighAccuracy: true,
      maximumAge:         5_000,
      timeout:            20_000,
    });

    keepaliveRef.current = setInterval(() => {
      const p = lastPayloadRef.current;
      if (!p || !socketRef.current?.connected) return;
      socketRef.current.emit('driver:location_update', p);
    }, STOPPED_KEEPALIVE);
  }, [handlePos, handleErr]); // eslint-disable-line

  const stopSharing = useCallback(() => {
    if (watchRef.current    !== null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
    if (keepaliveRef.current !== null) { clearInterval(keepaliveRef.current); keepaliveRef.current = null; }
    const driverId = currentUserRef.current?._id || currentUserRef.current?.id;
    const normalizedDriverId = toId(driverId);
    if (socketRef.current?.connected && normalizedDriverId) {
      socketRef.current.emit('driver:stop_tracking', { driverId: normalizedDriverId });
    }
    setStatus('idle'); setPosition(null);
    lastEmittedRef.current = null;
    lastPayloadRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    if (watchRef.current    !== null) navigator.geolocation.clearWatch(watchRef.current);
    if (keepaliveRef.current !== null) clearInterval(keepaliveRef.current);
  }, []);

  const S = { idle:{ c:'text-gray-400', l:'Not sharing' }, requesting:{ c:'text-blue-400', l:'Getting GPS…' },
               sharing:{ c:'text-green-400', l:'Sharing live' }, denied:{ c:'text-red-400', l:'Permission denied' },
               error:{ c:'text-amber-400', l:'GPS error' } };
  const cfg = S[status] || S.idle;
  const btn = 'bg-gray-900/90 border border-gray-700 p-2.5 rounded-xl text-gray-400 hover:text-white transition shadow';

  return (
    <div className="flex flex-col lg:flex-row gap-4" style={{ height:'100%' }}>
      <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-900" style={{ minHeight:300 }}>
        <div ref={containerRef} style={{ position:'absolute', inset:0 }} />
        <div className="absolute top-3 right-3 z-40 flex flex-col gap-2">
          <button onClick={() => mapRef.current?.zoomIn()} className={btn}><ZoomIn className="w-4 h-4"/></button>
          <button onClick={() => mapRef.current?.zoomOut()} className={btn}><ZoomOut className="w-4 h-4"/></button>
          <button onClick={() => setAutoFollow(v=>!v)} className={`${btn} ${autoFollow?'text-blue-400 border-blue-600/50':''}`}><Navigation className="w-4 h-4"/></button>
          <button onClick={() => position && mapRef.current?.setView([position.latitude,position.longitude],17)} className={btn}><Crosshair className="w-4 h-4"/></button>
        </div>
        {position && (
          <div className="absolute bottom-3 left-3 z-40 bg-gray-900/90 border border-gray-700 rounded-xl p-3 text-xs shadow">
            <p className="text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3 text-green-400"/>Your Location</p>
            <p className="text-white font-mono">{position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}</p>
            {position.accuracy && <p className="text-gray-500 mt-1">±{Math.round(position.accuracy)}m accuracy</p>}
          </div>
        )}
        {!position && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-gray-900/75 rounded-2xl p-8 text-center border border-gray-700">
              <MapPin className="w-10 h-10 text-gray-600 mx-auto mb-3"/>
              <p className="text-white font-semibold">Start sharing to see your position</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        <div className="rounded-2xl border border-gray-700 bg-gray-900 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-bold text-base leading-none">Location Sharing</p>
              <p className={`text-sm mt-1 ${cfg.c}`}>{cfg.l}</p>
            </div>
            <AnimatePresence mode="wait">
              {status === 'sharing'
                ? <motion.div key="on" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"/><Wifi className="w-5 h-5 text-green-400"/>
                  </motion.div>
                : <motion.div key="off" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}>
                    <WifiOff className="w-5 h-5 text-gray-600"/>
                  </motion.div>
              }
            </AnimatePresence>
          </div>
          {position && (
            <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700 mb-4 text-xs">
              <p className="text-gray-400 mb-2 flex items-center gap-1.5"><Activity className="w-3 h-3"/>Current Position</p>
              <p className="text-white font-mono">{position.latitude.toFixed(6)}</p>
              <p className="text-white font-mono">{position.longitude.toFixed(6)}</p>
              {position.accuracy && <p className="text-gray-500 mt-1.5">±{Math.round(position.accuracy)}m</p>}
            </div>
          )}
          {error && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}
              className="text-xs text-amber-300 bg-amber-950/50 border border-amber-800/40 rounded-xl p-3 mb-4 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/><span>{error}</span>
            </motion.div>
          )}
          <button onClick={status==='sharing'?stopSharing:startSharing} disabled={status==='requesting'}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 ${
              status==='sharing' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            {status==='requesting' && <Loader2 className="w-4 h-4 animate-spin"/>}
            {status==='sharing' ? <><Square className="w-4 h-4"/>Stop Sharing</> : <><Play className="w-4 h-4"/>Start Sharing</>}
          </button>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-xs text-gray-400 space-y-1.5">
          <p className="text-white font-semibold text-sm mb-2">📍 How it works</p>
          <p>1. Click <strong className="text-white">Start Sharing</strong></p>
          <p>2. Allow GPS in browser popup</p>
          <p>3. Your dot appears on admin map instantly</p>
          <p>4. Updates every move &gt;2m</p>
          <p>5. Click <strong className="text-white">Stop Sharing</strong> to go offline</p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ADMIN VIEW
// ════════════════════════════════════════════════════════════════════════════
function AdminView() {
  const { socket } = useRealtime();

  const mapRef       = useRef(null);
  const containerRef = useRef(null);
  const markersRef   = useRef({});
  const colorMapRef  = useRef({});
  const colorIdxRef  = useRef(0);

  const [drivers,     setDrivers]     = useState({});
  const [focused,     setFocused]     = useState(null);
  const [sockStatus,  setSockStatus]  = useState('init');
  const [lastUpdate,  setLastUpdate]  = useState(null);

  // ── Init Leaflet map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    mapRef.current = L.map(containerRef.current, { center:[20.59,78.96], zoom:5, zoomControl:false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { attribution:'© CartoDB', subdomains:'abcd', maxZoom:20 }).addTo(mapRef.current);
    L.control.zoom({ position:'bottomright' }).addTo(mapRef.current);
    setTimeout(() => { mapRef.current?.invalidateSize(); }, 300);
    return () => {
      Object.values(markersRef.current).forEach(m => m.remove());
      markersRef.current = {};
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line

  // ── Place / update marker ───────────────────────────────────────────────────
  const applyLocation = useCallback((data) => {
    const lat = parseFloat(data?.latitude);
    const lng = parseFloat(data?.longitude);
    const did = toId(data?.driverId);

    if (!did || isNaN(lat) || isNaN(lng)) return;

    if (!colorMapRef.current[did]) {
      colorMapRef.current[did] = COLORS[colorIdxRef.current % COLORS.length];
      colorIdxRef.current++;
    }
    const color   = colorMapRef.current[did];
    const moving  = (parseFloat(data.speed)||0) > 0.3;
    const label   = did.slice(-5);

    setDrivers(prev => ({ ...prev, [did]: { ...data, latitude:lat, longitude:lng } }));
    setLastUpdate(new Date());

    if (!mapRef.current) return;

    const icon = makeIcon(color, moving, label);
    if (markersRef.current[did]) {
      markersRef.current[did].setLatLng([lat,lng]).setIcon(icon);
    } else {
      markersRef.current[did] = L.marker([lat,lng], { icon, zIndexOffset:1000 })
        .bindPopup(`<b>Driver: ${did.slice(-8)}</b>`)
        .addTo(mapRef.current);
      mapRef.current.setView([lat,lng], 14);
    }

    if (focused === did) mapRef.current.panTo([lat,lng], { animate:true, duration:0.8 });
  }, [focused]);

  // ── Socket subscription ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) { setSockStatus('no-socket'); return; }

    setSockStatus(socket.connected ? 'connected' : 'connecting');

    const onConnect = () => {
      setSockStatus('connected');
      socket.emit('map:get_all_locations');
    };
    const onDisconnect = () => setSockStatus('disconnected');
    const onError = (err) => console.error('[Tracking] Socket error:', err);

    const onLocation = (data) => applyLocation(data);

    const onStop = (data) => {
      if (!data?.driverId) return;
      setDrivers(prev => { const n={...prev}; delete n[data.driverId]; return n; });
      markersRef.current[data.driverId]?.remove();
      delete markersRef.current[data.driverId];
      if (focused === data.driverId) setFocused(null);
    };
    const onAllLocations = (locs) => {
      if (Array.isArray(locs)) locs.forEach(l => applyLocation(l));
    };

    socket.on('connect',                onConnect);
    socket.on('disconnect',             onDisconnect);
    socket.on('error',                  onError);
    socket.on('driver:location_update', onLocation);
    socket.on('driver:stop_tracking',   onStop);
    socket.on('map:all_locations',      onAllLocations);

    if (socket.connected) socket.emit('map:get_all_locations');

    return () => {
      socket.off('connect',                onConnect);
      socket.off('disconnect',             onDisconnect);
      socket.off('error',                  onError);
      socket.off('driver:location_update', onLocation);
      socket.off('driver:stop_tracking',   onStop);
      socket.off('map:all_locations',      onAllLocations);
    };
  }, [socket, applyLocation]);

  const driverList = Object.entries(drivers);
  const btn = 'bg-gray-900/90 border border-gray-700 p-2.5 rounded-xl text-gray-400 hover:text-white transition shadow';

  return (
    <div style={{ display:'flex', gap:'1rem', height:'100%' }}>
      {/* Map */}
      <div style={{ position:'relative', flex:1, borderRadius:'1rem', overflow:'hidden', background:'#111' }}>
        {/* Leaflet container — fills parent via absolute */}
        <div ref={containerRef} style={{ position:'absolute', top:0, left:0, right:0, bottom:0 }} />

        {/* Status bar */}
        <div className="absolute top-3 left-3 right-3 z-40 flex items-center gap-2" style={{ pointerEvents:'none' }}>
          <div className="bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow flex-1 overflow-hidden" style={{ pointerEvents:'auto' }}>
            <Users className="w-4 h-4 text-blue-400 shrink-0"/>
            <span className="text-white font-semibold text-sm">
              {driverList.length} Active Driver{driverList.length !== 1 ? 's' : ''}
            </span>
            {lastUpdate && <span className="ml-auto text-gray-500 text-xs shrink-0">{fmt(lastUpdate)}</span>}
          </div>
          <motion.div animate={{ opacity:[1,.5,1] }} transition={{ duration:2, repeat:Infinity }}
            style={{ pointerEvents:'auto' }}
            className={`flex items-center gap-1.5 bg-gray-900/90 border rounded-xl px-3 py-2.5 shadow shrink-0 ${
              sockStatus==='connected' ? 'border-green-500/40' : 'border-red-500/40'}`}>
            {sockStatus === 'connected'
              ? <><Wifi className="w-4 h-4 text-green-400"/><span className="text-green-400 text-xs font-bold">Live</span></>
              : <><WifiOff className="w-4 h-4 text-red-400"/><span className="text-red-400 text-xs font-bold capitalize">{sockStatus}</span></>
            }
          </motion.div>
        </div>

        {/* Zoom */}
        <div className="absolute top-16 right-3 z-40 flex flex-col gap-2">
          <button onClick={() => mapRef.current?.zoomIn()} className={btn}><ZoomIn className="w-4 h-4"/></button>
          <button onClick={() => mapRef.current?.zoomOut()} className={btn}><ZoomOut className="w-4 h-4"/></button>
        </div>

        {driverList.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-gray-900/75 rounded-2xl p-8 text-center border border-gray-700">
              <MapPin className="w-10 h-10 text-gray-600 mx-auto mb-3"/>
              <p className="text-white font-semibold">No active drivers</p>
              <p className="text-gray-500 text-sm mt-1">Drivers appear when they click "Start Sharing"</p>
            </div>
          </div>
        )}
      </div>

      {/* Driver sidebar */}
      {driverList.length > 0 && (
        <div className="shrink-0 flex flex-col gap-2 overflow-y-auto" style={{ width:200 }}>
          <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider px-1">Drivers Online</p>
          {driverList.map(([id, loc], i) => (
            <button key={id}
              onClick={() => {
                setFocused(id);
                if (mapRef.current && loc.latitude)
                  mapRef.current.setView([parseFloat(loc.latitude), parseFloat(loc.longitude)], 16);
              }}
              className={`border rounded-xl p-3 text-left transition hover:border-blue-500/50 ${
                focused===id ? 'border-blue-500 bg-blue-950/30' : 'border-gray-700 bg-gray-900'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: colorMapRef.current[id] || COLORS[i % COLORS.length] }}/>
                <span className="text-white text-xs font-bold truncate">{id.slice(-8)}</span>
              </div>
              <p className="text-gray-500 text-[10px] font-mono">
                {parseFloat(loc.latitude).toFixed(4)},{parseFloat(loc.longitude).toFixed(4)}
              </p>
              <span className={`text-[10px] font-semibold mt-1 block ${
                (parseFloat(loc.speed)||0)>0.3 ? 'text-green-400' : 'text-amber-400'}`}>
                {(parseFloat(loc.speed)||0)>0.3 ? '● Moving' : '● Stopped'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function LiveTrackingPage() {
  const { currentUser } = useAuth();
  const isDriver = currentUser?.role === 'driver';

  return (
    // Use inline style for height — avoids Tailwind's h-full chain issues
    <div style={{ height:'calc(100vh - 4rem)', display:'flex', flexDirection:'column', gap:'1rem', padding:'1rem', background:'#030712', overflow:'hidden' }}>
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <Map className="w-5 h-5 text-white"/>
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">Live Tracking</h1>
          <p className="text-gray-400 text-xs mt-0.5">
            {isDriver ? 'Share your GPS location with your fleet manager' : 'Real-time fleet GPS — all active drivers'}
          </p>
        </div>
      </div>

      {/* Content — flex-1 in a flex-col with explicit height = reliable height for children */}
      <div style={{ flex:1, minHeight:0, overflow:'hidden' }}>
        {isDriver ? <DriverView /> : <AdminView />}
      </div>
    </div>
  );
}
