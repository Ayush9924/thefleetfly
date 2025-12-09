import { useState, useEffect } from 'react'
import { useSocketLocation } from '../hooks/useSocketLocation'
import { useRealtime } from '../contexts/AuthContext'
import LiveMapTracker from '../components/LiveMapTracker'
import { Card } from '../components/ui/card'
import { MapPin, Zap, Gauge } from 'lucide-react'

/**
 * Live Tracking Page
 * Real-time display of all active drivers on a map with their stats
 */
export default function LiveTrackingPage() {
  const { locations } = useRealtime()
  const { joinLocationRoom, leaveLocationRoom } = useSocketLocation()
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [filterSpeed, setFilterSpeed] = useState(0)
  const [filterStatus, setFilterStatus] = useState('all')

  // Join location room on mount
  useEffect(() => {
    const driverIds = locations.map((loc) => loc.driverId)
    if (driverIds.length > 0) {
      joinLocationRoom(driverIds)
    }

    return () => {
      if (driverIds.length > 0) {
        leaveLocationRoom(driverIds)
      }
    }
  }, [locations.length])

  // Filter locations based on criteria
  const filteredLocations = locations.filter((loc) => {
    const speedMatch = loc.speed >= filterSpeed
    const statusMatch = filterStatus === 'all' // Add status filtering logic as needed
    return speedMatch && statusMatch
  })

  const getSelectedDriverData = () => {
    return locations.find((loc) => loc.driverId === selectedDriver)
  }

  const selectedData = getSelectedDriverData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Live Fleet Tracking</h1>
        <div className="text-sm text-gray-600">
          Active Drivers: <span className="font-semibold text-green-600">{locations.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="h-[500px] overflow-hidden">
            <LiveMapTracker
              drivers={filteredLocations}
              onDriverClick={setSelectedDriver}
              autoFitBounds={true}
            />
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>

            <div className="space-y-4">
              {/* Speed Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Min Speed: {filterSpeed} km/h
                </label>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={filterSpeed}
                  onChange={(e) => setFilterSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Drivers</option>
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Driver Stats */}
          {selectedData ? (
            <Card className="p-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                {selectedData.driverId}
              </h2>

              <div className="space-y-3">
                {/* Speed */}
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Speed</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {(selectedData.speed || 0).toFixed(1)} km/h
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-start justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Location</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-900">
                      {selectedData.latitude.toFixed(4)}
                    </p>
                    <p className="text-xs font-mono text-gray-900">
                      {selectedData.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Heading */}
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-700">Heading</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {(selectedData.heading || 0).toFixed(0)}°
                  </span>
                </div>

                {/* Last Update */}
                <p className="text-xs text-gray-500 text-center pt-2">
                  Updated: {new Date(selectedData.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="p-4 text-center text-gray-500">
              <p className="text-sm">Select a driver on the map to view details</p>
            </Card>
          )}
        </div>
      </div>

      {/* Driver List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Drivers</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 font-semibold text-gray-700">
                  Driver ID
                </th>
                <th className="text-left py-2 px-4 font-semibold text-gray-700">
                  Speed
                </th>
                <th className="text-left py-2 px-4 font-semibold text-gray-700">
                  Location
                </th>
                <th className="text-left py-2 px-4 font-semibold text-gray-700">
                  Last Update
                </th>
                <th className="text-left py-2 px-4 font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((location) => (
                <tr
                  key={location.driverId}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedDriver(location.driverId)}
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {location.driverId}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1">
                      <Gauge className="w-3 h-3" />
                      {(location.speed || 0).toFixed(1)} km/h
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-gray-600">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLocations.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No drivers matching the selected filters
          </p>
        )}
      </Card>
    </div>
  )
}
