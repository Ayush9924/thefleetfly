import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Inject keyframe CSS only once
let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  cssInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes driver-pulse {
      0%   { transform: translate(-50%,-50%) scale(1);   opacity: .8; }
      50%  { transform: translate(-50%,-50%) scale(1.6); opacity: .2; }
      100% { transform: translate(-50%,-50%) scale(1);   opacity: .8; }
    }
    @keyframes driver-ring {
      0%   { transform: translate(-50%,-50%) scale(.8); opacity: 1; }
      100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; }
    }
    .driver-dot {
      position: absolute; top: 50%; left: 50%;
      width: 18px; height: 18px; border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,.35);
      transform: translate(-50%,-50%);
      z-index: 2;
    }
    .driver-pulse-ring {
      position: absolute; top: 50%; left: 50%;
      width: 18px; height: 18px; border-radius: 50%;
      animation: driver-ring 1.8s ease-out infinite;
    }
    .driver-icon-wrap {
      position: relative; width: 44px; height: 44px;
    }
    .driver-label {
      position: absolute; bottom: -18px; left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,.65); color: #fff;
      font-size: 10px; font-weight: 600; white-space: nowrap;
      padding: 1px 5px; border-radius: 4px;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Renders/updates a Leaflet divIcon marker for a driver.
 * Pulsing ring when moving; static dot when stopped.
 *
 * Props are NOT React props — this is a hook-style helper that takes a map ref.
 *
 * @param {{ map, position, isMoving, label, color }} args
 * @returns ref to the Leaflet marker (can be used for popups etc.)
 */
export function useDriverMarker({ map, position, isMoving, label = '', color = '#2563eb' }) {
  const markerRef = useRef(null);

  useEffect(() => { injectCSS(); }, []);

  useEffect(() => {
    if (!map || !position?.latitude || !position?.longitude) return;

    const { latitude: lat, longitude: lng } = position;

    const html = `
      <div class="driver-icon-wrap">
        ${isMoving ? `<div class="driver-pulse-ring" style="background:${color};opacity:.45"></div>` : ''}
        <div class="driver-dot" style="background:${color}"></div>
        ${label ? `<div class="driver-label">${label}</div>` : ''}
      </div>`;

    const icon = L.divIcon({
      html,
      className: '',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(map);
    } else {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(icon);
    }
  }, [map, position, isMoving, label, color]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, []);

  return markerRef;
}
