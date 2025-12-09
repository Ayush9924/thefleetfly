/**
 * Simple Map Diagnostic Tool
 * Test if map is loading and rendering properly
 */

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapDiagnostic() {
  const mapRef = useRef(null)
  const [status, setStatus] = useState('Initializing...')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!mapRef.current) {
      setError('Map container not found')
      return
    }

    try {
      setStatus('Creating map instance...')
      
      const map = L.map(mapRef.current).setView([40.7128, -74.006], 13)
      
      setStatus('Adding tile layer...')
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      setStatus('Adding test marker...')
      L.marker([40.7128, -74.006]).addTo(map).bindPopup('Test Marker: New York')

      setStatus('✅ Map loaded successfully!')
    } catch (err) {
      setError(`Error: ${err.message}`)
      setStatus('Failed')
    }
  }, [])

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold mb-2">Map Diagnostic</h1>
        <p className="text-lg">{status}</p>
        {error && <p className="text-red-200 mt-2">{error}</p>}
      </div>
      <div 
        ref={mapRef} 
        className="flex-1"
        style={{ minHeight: '100vh', backgroundColor: '#e5e3df' }}
      />
    </div>
  )
}
