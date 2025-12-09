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
  TrendingUp,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Circle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🚀 2025 Professional Live Fleet Tracking Dashboard
 * Modern, responsive, glassmorphic UI with real-time monitoring
 */
export default function LiveTrackingPage() {
  const { locations = [] } = useRealtime();
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filterSpeed, setFilterSpeed] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [showMap, setShowMap] = useState(true);

  // Enhanced driver data with calculated status
  const enhancedLocations = useMemo(() => {
    if (!Array.isArray(locations)) return [];
    return locations.map(loc => ({
      ...loc,
      status: loc.speed > 5 ? 'active' : loc.speed > 0 ? 'idle' : 'stopped',
      lastUpdate: new Date(loc.timestamp).toLocaleTimeString(),
      coordinates: `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
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
      active: 'bg-green-100 text-green-800 border-green-200',
      idle: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      stopped: 'bg-gray-100 text-gray-800 border-gray-200'
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

  // Calculate stats
  const stats = {
    active: filteredLocations.filter(l => l.status === 'active').length,
    idle: filteredLocations.filter(l => l.status === 'idle').length,
    stopped: filteredLocations.filter(l => l.status === 'stopped').length
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🚀 Live Fleet Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor your fleet in real-time with live location updates</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Active Drivers Counter */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl shadow-sm border border-green-100">
            <Activity className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-700">
              {filteredLocations.length} Active
            </span>
          </div>
          
          {/* Toggle Map/No Map */}
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 border-gray-200"
          >
            {showMap ? (
              <>
                <Target className="h-4 w-4" />
                Hide Map
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                Show Map
              </>
            )}
          </Button>
          
          {/* Filters Toggle */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 border-gray-200"
          >
            <Filter className="h-4 w-4" />
            {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Section */}
        {showMap && (
          <div className="lg:col-span-3">
            <Card className="h-[500px] overflow-hidden border border-gray-200/30 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
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
                    className="bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg border border-gray-200 rounded-lg"
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Center All
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg border border-gray-200 rounded-lg"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Traffic
                  </Button>
                </div>
                
                {/* Map Info Overlay */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-gray-200 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Active</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Idle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Stopped</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Sidebar - Filters & Driver Details */}
        <div className="space-y-4">
          {/* Filters Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="card-hover"
              >
                <Card className="border border-gray-200/30 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl">
                  <CardHeader className="p-4 pb-2 border-b border-gray-200/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                      </CardTitle>
                      <button 
                        onClick={() => setIsFilterOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ChevronUp className="h-5 w-5" />
                      </button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 space-y-4">
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
                          className="pl-10 w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Speed Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Min Speed: <span className="font-semibold text-blue-600">{filterSpeed} km/h</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="150"
                          value={filterSpeed}
                          onChange={(e) => setFilterSpeed(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider accent-blue-500"
                        />
                        <span className="text-xs text-gray-500 min-w-12">0</span>
                      </div>
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
                    
                    {/* Quick Stats */}
                    <div className="pt-4 border-t border-gray-200/30">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h3>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-green-50/50 p-2 rounded-lg border border-green-200">
                          <div className="text-xs text-green-700">Active</div>
                          <div className="text-lg font-bold text-green-800">{stats.active}</div>
                        </div>
                        <div className="bg-yellow-50/50 p-2 rounded-lg border border-yellow-200">
                          <div className="text-xs text-yellow-700">Idle</div>
                          <div className="text-lg font-bold text-yellow-800">{stats.idle}</div>
                        </div>
                        <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-200">
                          <div className="text-xs text-gray-700">Stopped</div>
                          <div className="text-lg font-bold text-gray-800">{stats.stopped}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Driver Details Panel */}
          {selectedData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-hover"
            >
              <Card className="border border-gray-200/30 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl">
                <CardHeader className="p-4 pb-2 border-b border-gray-200/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {selectedData.driverId}
                    </CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedData.status)}`}>
                      {selectedData.status.charAt(0).toUpperCase() + selectedData.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 space-y-3">
                  {/* Speed */}
                  <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Gauge className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Speed</p>
                        <p className="text-xl font-bold text-gray-900">
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
                          {selectedData.coordinates}
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
                        <p className="text-xl font-bold text-gray-900">
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
              <Card className="border border-gray-200/30 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl">
                <CardHeader className="p-4 pb-2 border-b border-gray-200/30">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Driver Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Select a driver on the map or from the list to view real-time details
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Driver List Section */}
      <Card className="border border-gray-200/30 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl">
        <CardHeader className="p-4 pb-2 border-b border-gray-200/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              🚗 Active Drivers ({filteredLocations.length})
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Active: {stats.active}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Idle: {stats.idle}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-600">Stopped: {stats.stopped}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {filteredLocations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/30">
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
                      transition={{ delay: 0.05 }}
                      className={`border-b border-gray-100/30 hover:bg-blue-50/20 cursor-pointer transition-colors duration-200 ${
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
                        {location.coordinates}
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        {location.lastUpdate}
                      </td>
                      <td className="py-4 px-6">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
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
              <div className="bg-gray-50/50 p-6 rounded-xl max-w-md mx-auto">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No drivers found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterSpeed > 0 || filterStatus !== 'all' 
                    ? 'Try adjusting your filters or search terms' 
                    : 'No drivers are currently active in your fleet'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterSpeed(0);
                    setFilterStatus('all');
                  }}
                  className="rounded-lg"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
