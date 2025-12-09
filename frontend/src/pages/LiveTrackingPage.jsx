import { useState, useEffect, useMemo } from 'react';
import { useRealtime } from '../contexts/RealtimeContext';
import LiveMapTracker from '../components/LiveMapTracker';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  MapPin, 
  Gauge, 
  Zap, 
  Filter, 
  Search, 
  Users, 
  Clock,
  Activity,
  Target,
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Enhanced Live Tracking Page
 * Real-time display of all active drivers with modern UI/UX
 */
export default function LiveTrackingPage() {
  const { locations = [] } = useRealtime();
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filterSpeed, setFilterSpeed] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Enhanced driver data with calculated status
  const enhancedLocations = useMemo(() => {
    if (!Array.isArray(locations)) return [];
    return locations.map(loc => ({
      ...loc,
      status: loc.speed > 5 ? 'active' : loc.speed > 0 ? 'idle' : 'stopped',
      lastUpdate: new Date(loc.timestamp).toLocaleTimeString()
    }));
  }, [locations]);

  // Filter and search logic
  const filteredLocations = useMemo(() => {
    return enhancedLocations.filter(loc => {
      const matchesSpeed = loc.speed >= filterSpeed;
      const matchesStatus = filterStatus === 'all' || loc.status === filterStatus;
      const matchesSearch = loc.driverId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSpeed && matchesStatus && matchesSearch;
    });
  }, [enhancedLocations, filterSpeed, filterStatus, searchTerm]);

  const selectedData = filteredLocations.find(loc => loc.driverId === selectedDriver);

  // Status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      idle: 'bg-yellow-100 text-yellow-800',
      stopped: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || styles.stopped;
  };

  // Status color coding
  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      idle: '#f59e0b',
      stopped: '#6b7280'
    };
    return colors[status] || colors.stopped;
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Fleet Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor your fleet in real-time with live location updates</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
            <Activity className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {locations.length} Active
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-3">
          <Card className="h-[500px] overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="h-full w-full relative">
              <LiveMapTracker
                drivers={filteredLocations}
                onDriverClick={setSelectedDriver}
                autoFitBounds={true}
              />
              
              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg"
                >
                  <Target className="h-4 w-4 mr-1" />
                  Center All
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Traffic
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Enhanced Filters */}
          <AnimatePresence>
            {(isFilterOpen || filteredLocations.length === 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-4 border border-gray-200/50 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-0 space-y-4">
                    {/* Search */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Search Driver
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Driver ID or name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-full"
                        />
                      </div>
                    </div>

                    {/* Speed Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Min Speed: <span className="font-semibold text-blue-600">{filterSpeed} km/h</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="150"
                        value={filterSpeed}
                        onChange={(e) => setFilterSpeed(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0 km/h</span>
                        <span>150 km/h</span>
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Status
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active (Moving)</option>
                        <option value="idle">Idle (Stopped &lt; 5 min)</option>
                        <option value="stopped">Stopped (&gt; 5 min)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Driver Details */}
          {selectedData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-hover"
            >
              <Card className="p-4 border border-gray-200/50 bg-white/70 backdrop-blur-sm">
                <CardHeader className="p-0 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {selectedData.driverId}
                    </CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedData.status)}`}>
                      {selectedData.status.charAt(0).toUpperCase() + selectedData.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 space-y-3">
                  {/* Speed */}
                  <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Gauge className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Speed</p>
                        <p className="text-lg font-bold text-gray-900">
                          {selectedData.speed.toFixed(1)} <span className="text-sm">km/h</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Coordinates</p>
                        <p className="text-sm font-mono text-gray-900">
                          {selectedData.latitude.toFixed(4)}, {selectedData.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Heading */}
                  <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Heading</p>
                        <p className="text-lg font-bold text-gray-900">
                          {selectedData.heading.toFixed(0)}°
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Last Update */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-200">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Updated: {selectedData.lastUpdate}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-hover"
            >
              <Card className="p-6 text-center border border-gray-200/50 bg-white/70 backdrop-blur-sm">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  Select a driver on the map or from the list to view real-time details
                </p>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Enhanced Driver List */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="px-6 py-4 border-b border-gray-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Active Drivers ({filteredLocations.length})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Active: {filteredLocations.filter(l => l.status === 'active').length}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Idle: {filteredLocations.filter(l => l.status === 'idle').length}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Stopped: {filteredLocations.filter(l => l.status === 'stopped').length}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {filteredLocations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/50">
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Driver</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Speed</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Location</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Last Update</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((location) => (
                    <motion.tr
                      key={location.driverId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b border-gray-100/50 hover:bg-gray-50/50 cursor-pointer transition-colors duration-200 ${
                        selectedDriver === location.driverId ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => setSelectedDriver(location.driverId)}
                    >
                      <td className="py-4 px-6 font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getStatusColor(location.status) }}
                          ></div>
                          {location.driverId}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(location.status)}`}>
                          {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{location.speed.toFixed(1)} km/h</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-gray-600">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        {location.lastUpdate}
                      </td>
                      <td className="py-4 px-6">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDriver(location.driverId);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No drivers found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm || filterSpeed > 0 || filterStatus !== 'all' 
                  ? 'Try adjusting your filters or search terms' 
                  : 'No drivers are currently active in your fleet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Add this CSS to your global styles for the slider
// In your index.css or App.css file:
