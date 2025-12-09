import { useEffect, useRef, useState } from 'react'
import { useRealtime } from '../contexts/RealtimeContext'
import { Loader } from 'lucide-react'

/**
 * Live Map Tracker Component
 * Displays real-time location of drivers on a map using Leaflet
 * Requires: leaflet, leaflet-routing-machine packages
 */
export default function LiveMapTracker({
  drivers = [],
  zoom = 13,
  center = null,
  onDriverClick = null,
  showRoutes = false,
  autoFitBounds = true,
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { locations } = useRealtime()

  // Initialize map
  useEffect(() => {
    // Check if Leaflet is available
    if (typeof window === 'undefined' || !window.L) {
      setError('Leaflet library not loaded. Please install: npm install leaflet')
      setIsLoading(false)
      return
    }

    try {
      const L = window.L

      if (!mapInstanceRef.current && mapRef.current) {
        // Initialize map centered on default location or first driver
        const initialCenter = center || [40.7128, -74.006] // Default: New York
        const mapInstance = L.map(mapRef.current).setView(initialCenter, zoom)

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstance)

        mapInstanceRef.current = mapInstance
        setIsLoading(false)
      }
    } catch (err) {
      setError(`Failed to initialize map: ${err.message}`)
      setIsLoading(false)
    }
  }, [])

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || !locations) return

    const L = window.L
    const bounds = L.latLngBounds()

    // Update or create markers
    locations.forEach((location) => {
      const key = location.driverId

      if (markersRef.current[key]) {
        // Update existing marker
        markersRef.current[key].setLatLng([
          location.latitude,
          location.longitude,
        ])
      } else {
        // Create new marker
        const marker = L.marker([location.latitude, location.longitude], {
          title: `Driver: ${location.driverId}`,
        })
          .bindPopup(
            `<strong>${location.driverId}</strong><br/>Speed: ${(
              location.speed || 0
            ).toFixed(2)} km/h<br/>Updated: ${new Date(
              location.timestamp
            ).toLocaleTimeString()}`
          )
          .addTo(mapInstanceRef.current)

        if (onDriverClick) {
          marker.on('click', () => onDriverClick(location.driverId))
        }

        markersRef.current[key] = marker
      }

      bounds.extend([location.latitude, location.longitude])
    })

    // Auto-fit bounds if enabled and we have locations
    if (autoFitBounds && locations.length > 0) {
      try {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
      } catch (err) {
        // Handle edge case where bounds are invalid
        console.warn('Could not fit bounds:', err)
      }
    }

    // Remove markers for drivers no longer in locations
    Object.keys(markersRef.current).forEach((driverId) => {
      if (!locations.some((loc) => loc.driverId === driverId)) {
        mapInstanceRef.current.removeLayer(markersRef.current[driverId])
        delete markersRef.current[driverId]
      }
    })
  }, [locations, onDriverClick, autoFitBounds])

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Loader className="animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-center p-6">
          <p className="text-blue-600 font-semibold mb-2">Map Unavailable</p>
          <p className="text-blue-500 text-sm mb-4">{error}</p>
          <p className="text-blue-500 text-xs">Install with: npm install leaflet</p>
          <div className="mt-4 p-4 bg-white rounded border border-blue-200">
            <p className="text-gray-600 text-sm">Showing driver list below instead</p>
          </div>
        </div>
      </div>
    )
  }

  if (drivers.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600 font-semibold">No drivers to display</p>
          <p className="text-gray-500 text-sm">Drivers will appear here when they share their location</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
      style={{ minHeight: '400px' }}
    />
  )
}
