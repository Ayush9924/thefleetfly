import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Target, ZoomIn, ZoomOut, AlertCircle, RefreshCw } from 'lucide-react';

// Fix Leaflet default icons
try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
} catch (err) {
  console.log('Leaflet icon fix:', err);
}

export default function LiveMapTracker({ drivers = [], vehicles = [], onDriverClick = null, onVehicleClick = null }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapStyle, setMapStyle] = useState('dark');

  // prevent automatic fitBounds after the user manually interacts (zoom/pan)
  const userInteracted = useRef(false);
  // track whether initial automatic fit was already applied
  const initialFitDone = useRef(false);

  // stable ref for the interaction handler so cleanup can access the same function
  const interactionHandlerRef = useRef(null);

  // prefer `vehicles` prop when parent passes it (LiveTrackingPage uses `vehicles`)
  const data = (Array.isArray(vehicles) && vehicles.length > 0) ? vehicles : drivers;

  // Create custom vehicle icon
  const createVehicleIcon = (status, speed) => {
    const colors = {
      active: '#10b981',
      idle: '#f59e0b',
      stopped: '#6b7280'
    };
    const color = colors[status] || colors.stopped;

    return L.divIcon({
      className: 'custom-vehicle-icon',
      html: `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 32px;
            height: 32px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            z-index: 2;
            cursor: pointer;
          ">
            <span style="
              color: white;
              font-size: 11px;
              font-weight: bold;
              font-family: system-ui, -apple-system, sans-serif;
            ">${Math.round(speed)}</span>
          </div>
          ${status === 'active' ? `
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              width: 50px;
              height: 50px;
              border: 2px solid ${color};
              border-radius: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.3;
              animation: pulse 2s infinite;
            "></div>
          ` : ''}
          <style>
            @keyframes pulse {
              0% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
              50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.1; }
              100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
            }
          </style>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  };

  // Initialize map - only once
  useEffect(() => {
    console.log('Initializing map...');

    if (map.current) {
      console.log('Map already initialized');
      return;
    }

    if (!mapContainer.current) {
      console.error('Map container not found!');
      setError('Map container not found');
      return;
    }

    try {
      // Create map
      map.current = L.map(mapContainer.current, {
        center: [40.7128, -74.0060],
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true
      });

      console.log('Map instance created:', map.current);

      // Add tile layer
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CartoDB',
        subdomains: 'abcd',
        maxZoom: 20
      });
      tileLayer.addTo(map.current);

      // Add scale
      L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map.current);

      // mark user interaction when user starts zooming/panning so we don't auto-fit afterwards
      interactionHandlerRef.current = () => { userInteracted.current = true; };
      map.current.on('movestart zoomstart dragstart', interactionHandlerRef.current);

      // Force resize
      setTimeout(() => {
        if (map.current) {
          map.current.invalidateSize();
          console.log('Map resized');
        }
      }, 100);

      // cleanup listeners on unmount (below in return)
      setIsLoading(false);
      setError(null);
      console.log('Map initialized successfully');

    } catch (err) {
      console.error('Error initializing map:', err);
      setError(`Failed to initialize map: ${err.message}`);
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      if (map.current) {
        console.log('Removing map');
        if (interactionHandlerRef.current) {
          try { map.current.off('movestart zoomstart dragstart', interactionHandlerRef.current); } catch(e) {}
        }
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update tile layer when map style changes
  useEffect(() => {
    if (!map.current) return;

    const tileLayer = (() => {
      switch(mapStyle) {
        case 'dark':
          return L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap, © CartoDB',
            subdomains: 'abcd',
            maxZoom: 20
          });
        case 'light':
          return L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap, © CartoDB',
            subdomains: 'abcd',
            maxZoom: 20
          });
        default:
          return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          });
      }
    })();

    // Remove old tile layers
    map.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.current.removeLayer(layer);
      }
    });

    tileLayer.addTo(map.current);
  }, [mapStyle]);

  // Update markers when drivers change
  useEffect(() => {
    if (!map.current || isLoading || !Array.isArray(data)) return;

    try {
      const bounds = L.latLngBounds();
      const presentIds = new Set();

      data.forEach(item => {
        const id = item.vehicleId || item.driverId || item.id;
        if (!id || !item.latitude || !item.longitude) return;
        presentIds.add(id);

        const popupHtml = `
          <div style="padding:10px; min-width:200px; font-family: system-ui, sans-serif;">
            <div style="display:flex; align-items:center; margin-bottom:8px;">
              <div style="width:8px; height:8px; background:${item.status === 'active' ? '#10b981' : item.status === 'idle' ? '#f59e0b' : '#6b7280'}; border-radius:50%; margin-right:8px;"></div>
              <strong style="font-size:14px;">${item.driverId || item.licensePlate || id}</strong>
            </div>
            <div style="margin-bottom:6px;">
              <div style="font-size:11px; color:#666;">Speed</div>
              <div style="font-size:16px; font-weight:bold; color:#2563eb;">${(item.speed || 0).toFixed(1)} km/h</div>
            </div>
            <div style="margin-bottom:6px;">
              <div style="font-size:11px; color:#666;">Location</div>
              <div style="font-size:12px; font-family:monospace;">${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}</div>
            </div>
          </div>
        `;

        // update existing marker
        if (markers.current[id]) {
          const m = markers.current[id];
          m.setLatLng([item.latitude, item.longitude]);
          m.setIcon(createVehicleIcon(item.status || 'stopped', item.speed || 0));
          const popup = m.getPopup();
          if (popup) popup.setContent(popupHtml);
        } else {
          // create marker
          const m = L.marker([item.latitude, item.longitude], {
            icon: createVehicleIcon(item.status || 'stopped', item.speed || 0),
            title: id
          });
          m.bindPopup(popupHtml);
          // support both callback names used in app
          const clickHandler = onVehicleClick || onDriverClick;
          if (clickHandler) m.on('click', () => clickHandler(item.driverId || item.vehicleId || id));
          m.addTo(map.current);
          markers.current[id] = m;
        }

        bounds.extend([item.latitude, item.longitude]);
      });

      // remove markers no longer present
      Object.keys(markers.current).forEach(existingId => {
        if (!presentIds.has(existingId)) {
          try { map.current.removeLayer(markers.current[existingId]); } catch(e){/*ignore*/ }
          delete markers.current[existingId];
        }
      });

      if (bounds.isValid()) {
        // Only auto-fit on first load (or if user has not interacted). Subsequent data updates won't yank the user's zoom.
        if (!userInteracted.current && !initialFitDone.current) {
          map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
          initialFitDone.current = true;
        }
      }

      // small resize to avoid rendering glitches
      setTimeout(() => { map.current?.invalidateSize(); }, 50);
    } catch (err) {
      console.error('Error updating markers:', err);
    }
  }, [drivers, vehicles, data, isLoading, onDriverClick, onVehicleClick]);

  // Handle controls
  const handleZoomIn = () => {
    if (map.current) map.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (map.current) map.current.zoomOut();
  };

  const handleCenter = () => {
    if (map.current && data.length > 0) {
      const bounds = L.latLngBounds();
      data.forEach(d => {
        if (d.latitude && d.longitude) bounds.extend([d.latitude, d.longitude]);
      });
      if (bounds.isValid()) map.current.fitBounds(bounds, { padding: [50, 50] });
      // user explicitly requested centering — consider it a user interaction to prevent auto-fit overrides
      userInteracted.current = true;
      initialFitDone.current = true;
    }
  };

  const handleRefresh = () => {
    if (map.current) {
      map.current.invalidateSize();
      console.log('Map refreshed');
    }
  };

  const handleStyleChange = () => {
    const styles = ['dark', 'light', 'street'];
    const idx = styles.indexOf(mapStyle);
    setMapStyle(styles[(idx + 1) % styles.length]);
  };

  // Loading state
  // NOTE: don't early-return here — always render the map container so the map can initialize.
  // Show loading / error / no-data as overlays on top of the map instead.
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {/* Map container */}
      <div
        ref={mapContainer}
        className="w-full h-full bg-gray-800"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px'
        }}
      />

      {/* OVERLAYS */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-50">
          <div className="relative mb-4">
            <div className="w-12 h-12 border-3 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            <Navigation className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
          </div>
          <p className="text-gray-200 text-sm font-medium">Loading Map...</p>
          <p className="text-gray-400 text-xs">Initializing OpenStreetMap</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="w-[420px] max-w-full bg-gray-900/95 rounded-lg border border-gray-800 p-6 shadow-xl">
            <div className="flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Map Error</h3>
              <p className="text-gray-400 text-center mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )}

      {(!data || data.length === 0) && !isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-40">
          <div className="w-16 h-16 bg-gray-800/60 rounded-2xl flex items-center justify-center mb-4">
            <Navigation className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Vehicles</h3>
          <p className="text-gray-300 text-center mb-4">Waiting for vehicle data...</p>
        </div>
      )}

      {/* Controls - Top Right */}
      <div className="absolute top-4 right-4 z-999 flex flex-col gap-2">
        <button
          onClick={handleCenter}
          className="bg-gray-900/90 hover:bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg transition-all"
          title="Center"
        >
          <Target className="h-5 w-5 text-gray-300" />
        </button>
        <button
          onClick={handleZoomIn}
          className="bg-gray-900/90 hover:bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg transition-all"
          title="Zoom In"
        >
          <ZoomIn className="h-5 w-5 text-gray-300" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-gray-900/90 hover:bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="h-5 w-5 text-gray-300" />
        </button>
        <button
          onClick={handleStyleChange}
          className="bg-gray-900/90 hover:bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg transition-all text-sm font-medium text-gray-300"
          title="Style"
        >
          {mapStyle === 'dark' ? '🌙' : mapStyle === 'light' ? '☀️' : '🗺️'}
        </button>
        <button
          onClick={handleRefresh}
          className="bg-gray-900/90 hover:bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg transition-all"
          title="Refresh"
        >
          <RefreshCw className="h-5 w-5 text-gray-300" />
        </button>
      </div>

      {/* Status - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-999 bg-gray-900/90 backdrop-blur rounded-lg border border-gray-700 p-4 shadow-lg">
        <h4 className="text-sm font-semibold text-white mb-3">Vehicle Status</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-300">Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Idle</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Stopped</span>
          </div>
        </div>
      </div>

      {/* Live Badge - Top Left */}
      <div className="absolute top-4 left-4 z-999 bg-gray-900/90 backdrop-blur rounded-lg border border-gray-700 p-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Live</span>
          </div>
          <div className="h-4 w-px bg-gray-700"></div>
          <span className="text-sm font-medium text-gray-300">{data.length} vehicles</span>
        </div>
      </div>
    </div>
  );
}
