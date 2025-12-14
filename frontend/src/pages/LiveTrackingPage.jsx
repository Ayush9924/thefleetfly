import { useState, useEffect, useMemo } from 'react';
import { useRealtime } from '../contexts/RealtimeContext';
import LiveMapTracker from '../components/LiveMapTracker';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  MapPin, Gauge, Zap, Filter, Search, Users, Clock,
  Activity, Target, TrendingUp, ChevronUp, PlusCircle,
  AlertTriangle, Navigation, Battery, Thermometer, Truck,
  Eye, EyeOff, Download, RefreshCw, Layers,
  Route, BarChart3, Smartphone, Signal, Wifi, Shield,
  CheckCircle, MoreVertical
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveTrackingPage() {
  const { locations = [], loading } = useRealtime();
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filterSpeed, setFilterSpeed] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedVehicleType, setSelectedVehicleType] = useState('all');

  // Enhanced vehicle data
  const enhancedLocations = useMemo(() => {
    if (!Array.isArray(locations)) return [];
    return locations.map(loc => ({
      ...loc,
      status: loc.speed > 15 ? 'active' : loc.speed > 0 ? 'idle' : 'stopped',
      lastUpdate: new Date(loc.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }),
      coordinates: `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`,
      signal: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)],
    }));
  }, [locations]);

  // Filter logic
  const filteredLocations = useMemo(() => {
    return enhancedLocations.filter(loc => {
      const matchesSpeed = loc.speed >= filterSpeed;
      const matchesStatus = filterStatus === 'all' || loc.status === filterStatus;
      const matchesSearch = 
        loc.driverId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.driverName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVehicleType = selectedVehicleType === 'all' || loc.vehicleType === selectedVehicleType;
      
      return matchesSpeed && matchesStatus && matchesSearch && matchesVehicleType;
    });
  }, [enhancedLocations, filterSpeed, filterStatus, searchTerm, selectedVehicleType]);

  const selectedData = filteredLocations.find(loc => loc.driverId === selectedDriver);

  // Stats calculation
  const stats = useMemo(() => {
    const active = filteredLocations.filter(l => l.status === 'active').length;
    const idle = filteredLocations.filter(l => l.status === 'idle').length;
    const stopped = filteredLocations.filter(l => l.status === 'stopped').length;
    const total = filteredLocations.length;
    const averageSpeed = total > 0 
      ? filteredLocations.reduce((sum, loc) => sum + loc.speed, 0) / total 
      : 0;
    
    return { active, idle, stopped, total, averageSpeed };
  }, [filteredLocations]);

  // Status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
      idle: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
      stopped: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
    };
    return styles[status] || styles.stopped;
  };

  // Status color
  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      idle: '#f59e0b',
      stopped: '#6b7280'
    };
    return colors[status] || colors.stopped;
  };

  // Signal color
  const getSignalColor = (signal) => {
    const colors = {
      excellent: 'text-green-500',
      good: 'text-lime-500',
      fair: 'text-yellow-500',
      poor: 'text-red-500'
    };
    return colors[signal] || colors.fair;
  };

  // Vehicle types
  const vehicleTypes = ['all', 'Truck', 'Van', 'Car'];

  // detect whether user has any filters/search active
  const filtersActive = useMemo(() => {
    return filterSpeed > 0 || filterStatus !== 'all' || searchTerm.trim() !== '' || selectedVehicleType !== 'all';
  }, [filterSpeed, filterStatus, searchTerm, selectedVehicleType]);
  
  // Auto-select first vehicle only when a filter/search is active
  useEffect(() => {
    if (filtersActive && filteredLocations.length > 0 && !selectedDriver) {
      setSelectedDriver(filteredLocations[0].driverId);
    }
  }, [filteredLocations, selectedDriver, filtersActive]);

  if (loading && enhancedLocations.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
            <Navigation className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-400" />
          </div>
          <p className="mt-4 text-gray-300 text-lg font-medium">Initializing Fleet System</p>
          <p className="mt-2 text-gray-500 text-sm">Loading real-time vehicle data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur-xl">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                    <Navigation className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    FleetPulse Pro
                  </h1>
                  <p className="text-xs text-gray-400">Live Tracking Dashboard</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6 ml-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className="h-8 w-px bg-gray-800"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                  <div className="text-xs text-gray-400">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{stats.idle}</div>
                  <div className="text-xs text-gray-400">Idle</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">{stats.stopped}</div>
                  <div className="text-xs text-gray-400">Stopped</div>
                </div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`rounded-lg ${autoRefresh ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto ON' : 'Auto OFF'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="rounded-lg text-gray-400 hover:text-white"
              >
                {showMap ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Map
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Map
                  </>
                )}
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`rounded-lg ${isFilterOpen ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                {filterStatus !== 'all' || filterSpeed > 0 || searchTerm || selectedVehicleType !== 'all' ? (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Section - 3/4 width */}
          {showMap && (
            <div className="lg:col-span-3">
              <div className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Map Header */}
                <div className="px-6 py-4 border-b border-gray-800 bg-linear-to-r from-gray-900/50 to-gray-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h2 className="text-lg font-semibold text-white">Live Fleet Map</h2>
                        <p className="text-sm text-gray-400">Real-time vehicle tracking • Powered by OpenStreetMap</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded-full text-xs font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2 animate-pulse"></div>
                          Live
                        </span>
                        <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800 rounded-full text-xs font-medium">
                          {stats.total} Vehicles
                        </span>
                      </div>
                    </div>
                    
                    {/* Map Info */}
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Avg Speed</div>
                        <div className="text-lg font-bold text-white">{stats.averageSpeed.toFixed(1)} km/h</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Container */}
                <div className="h-[600px]">
                  <LiveMapTracker
                    vehicles={filteredLocations}
                    onVehicleClick={setSelectedDriver}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Right Sidebar - 1/4 width */}
          <div className="space-y-6">
            {/* Filters Panel */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Card className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                    <CardHeader className="p-4 border-b border-gray-800">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                          <Filter className="h-5 w-5 text-blue-400" />
                          Filters
                        </CardTitle>
                        <button 
                          onClick={() => setIsFilterOpen(false)}
                          className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-lg"
                        >
                          <ChevronUp className="h-5 w-5" />
                        </button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 space-y-4">
                      {/* Search */}
                      <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">
                          Search Vehicles
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            type="text"
                            placeholder="Search by ID, plate..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Vehicle Type Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">
                          Vehicle Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {vehicleTypes.map(type => (
                            <button
                              key={type}
                              onClick={() => setSelectedVehicleType(type)}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                                selectedVehicleType === type
                                  ? 'bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              {type === 'all' ? 'All' : type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Speed Filter */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-300">
                            Min Speed
                          </label>
                          <span className="text-sm font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            {filterSpeed} km/h
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="range"
                            min="0"
                            max="150"
                            value={filterSpeed}
                            onChange={(e) => setFilterSpeed(Number(e.target.value))}
                            className="w-full h-2 bg-linear-to-r from-gray-800 to-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(filterSpeed/150)*100}%, #374151 ${(filterSpeed/150)*100}%, #374151 100%)`
                            }}
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span>75</span>
                            <span>150</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">
                          Status Filter
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {['all', 'active', 'idle', 'stopped'].map(status => (
                            <button
                              key={status}
                              onClick={() => setFilterStatus(status)}
                              className={`px-2 py-2 text-xs rounded-lg transition-all ${
                                filterStatus === status
                                  ? status === 'active' ? 'bg-green-900/30 text-green-400 border border-green-800' :
                                    status === 'idle' ? 'bg-amber-900/30 text-amber-400 border border-amber-800' :
                                    status === 'stopped' ? 'bg-gray-800 text-gray-400 border border-gray-700' :
                                    'bg-blue-900/30 text-blue-400 border border-blue-800'
                                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                              }`}
                            >
                              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="pt-4 border-t border-gray-800/50">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Quick Stats</h3>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-green-900/20 p-2 rounded-lg border border-green-800/30">
                            <div className="text-xs text-green-400">Active</div>
                            <div className="text-lg font-bold text-green-300">{stats.active}</div>
                          </div>
                          <div className="bg-amber-900/20 p-2 rounded-lg border border-amber-800/30">
                            <div className="text-xs text-amber-400">Idle</div>
                            <div className="text-lg font-bold text-amber-300">{stats.idle}</div>
                          </div>
                          <div className="bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                            <div className="text-xs text-gray-400">Stopped</div>
                            <div className="text-lg font-bold text-gray-300">{stats.stopped}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Vehicle Details */}
            {selectedData ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                  <CardHeader className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          selectedData.status === 'active' ? 'bg-green-900/30' :
                          selectedData.status === 'idle' ? 'bg-amber-900/30' :
                          'bg-gray-800'
                        }`}>
                          <Truck className={`h-5 w-5 ${
                            selectedData.status === 'active' ? 'text-green-400' :
                            selectedData.status === 'idle' ? 'text-amber-400' :
                            'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-white">
                            {selectedData.driverId}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(selectedData.status)}`}>
                              {selectedData.status.charAt(0).toUpperCase() + selectedData.status.slice(1)}
                            </span>
                            <span className="text-xs text-gray-400">{selectedData.vehicleType}</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-white">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 space-y-4">
                    {/* Speed */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Gauge className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-gray-300">Speed</span>
                        </div>
                        <span className="text-lg font-bold text-white">
                          {selectedData.speed.toFixed(1)} <span className="text-sm text-gray-400">km/h</span>
                        </span>
                      </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-blue-500 to-cyan-400 rounded-full"
                          style={{ width: `${Math.min((selectedData.speed / 120) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-900/30 rounded-lg">
                          <MapPin className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-400 mb-1">Current Location</div>
                          <div className="text-sm font-mono text-white">{selectedData.coordinates}</div>
                          <div className="text-xs text-gray-500 mt-1">{selectedData.currentCity}</div>
                          <div className="text-xs text-gray-500">Updated {selectedData.lastUpdate}</div>
                        </div>
                      </div>
                    </div>

                    {/* Health Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Battery className="h-4 w-4 text-green-400" />
                          <span className={`text-xs ${selectedData.battery < 30 ? 'text-red-400' : 'text-green-400'}`}>
                            {selectedData.battery}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${selectedData.battery < 30 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${selectedData.battery}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Thermometer className="h-4 w-4 text-amber-400" />
                          <span className="text-xs text-amber-400">{selectedData.temperature}°C</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-linear-to-r from-amber-500 to-orange-400"
                            style={{ width: `${(selectedData.temperature / 50) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="h-4 w-4 text-purple-400" />
                          <span className="text-sm text-gray-300">Fuel</span>
                        </div>
                        <div className="text-xs text-gray-400">{selectedData.fuel}%</div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Route className="h-4 w-4 text-cyan-400" />
                          <span className="text-sm text-gray-300">ETA</span>
                        </div>
                        <div className="text-xs text-gray-400">{selectedData.eta} min</div>
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div className="pt-3 border-t border-gray-800">
                      <div className="text-xs text-gray-400 mb-1">Driver</div>
                      <div className="text-sm text-white">{selectedData.driverName}</div>
                      <div className="text-xs text-gray-500">{selectedData.licensePlate}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-linear-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Select a Vehicle</h3>
                  <p className="text-sm text-gray-400">
                    Click on any vehicle on the map or from the list below to view detailed information
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="mt-6">
          <Card className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <CardHeader className="p-4 border-b border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-linear-to-br from-blue-900/30 to-cyan-900/30 rounded-lg">
                    <Smartphone className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-white">
                      Connected Vehicles ({filteredLocations.length})
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Active: {stats.active}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Idle: {stats.idle}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span>Stopped: {stats.stopped}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterSpeed(0);
                      setFilterStatus('all');
                      setSelectedVehicleType('all');
                      setSelectedDriver(null);
                    }}
                    className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {filteredLocations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-4 px-6 font-semibold text-gray-400 text-sm">Driver</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-400 text-sm">Vehicle</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-400 text-sm">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-400 text-sm">Speed</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-400 text-sm">Location</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-400 text-sm">Fuel</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-400 text-sm">Battery</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-400 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLocations.map((vehicle) => (
                        <tr
                          key={vehicle.driverId}
                          className={`border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors duration-200 ${
                            selectedDriver === vehicle.driverId ? 'bg-blue-900/20' : ''
                          }`}
                          onClick={() => setSelectedDriver(vehicle.driverId)}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: getStatusColor(vehicle.status) }}
                              ></div>
                              <div>
                                <div className="font-medium text-white">{vehicle.driverId}</div>
                                <div className="text-xs text-gray-400">{vehicle.driverName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-medium text-white">{vehicle.vehicleType}</div>
                              <div className="text-xs text-gray-400">{vehicle.licensePlate}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(vehicle.status)}`}>
                              {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Gauge className="h-4 w-4 text-blue-400" />
                              <span className="font-medium text-white">{vehicle.speed.toFixed(1)} km/h</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-300">{vehicle.currentCity}</div>
                            <div className="text-xs text-gray-500">{vehicle.coordinates}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-800 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${
                                      vehicle.fuel < 20 ? 'bg-linear-to-r from-red-500 to-pink-400' :
                                      'bg-linear-to-r from-green-500 to-emerald-400'
                                    }`}
                                    style={{ width: `${vehicle.fuel}%` }}
                                  ></div>
                              </div>
                              <span className={`text-sm ${
                                vehicle.fuel < 20 ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {vehicle.fuel}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-800 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${
                                      vehicle.battery < 30 ? 'bg-linear-to-r from-red-500 to-pink-400' :
                                      'bg-linear-to-r from-green-500 to-emerald-400'
                                    }`}
                                    style={{ width: `${vehicle.battery}%` }}
                                  ></div>
                              </div>
                              <span className={`text-sm ${
                                vehicle.battery < 30 ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {vehicle.battery}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-400 hover:text-white hover:bg-blue-900/30 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDriver(vehicle.driverId);
                              }}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-linear-to-br from-gray-900/50 to-gray-900/30 p-8 rounded-2xl max-w-md mx-auto border border-gray-800">
                  <div className="w-16 h-16 bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="h-8 w-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No vehicles found</h3>
                    <p className="text-gray-400 mb-4">
                      {searchTerm || filterSpeed > 0 || filterStatus !== 'all' || selectedVehicleType !== 'all'
                        ? 'Try adjusting your search criteria or filters' 
                        : 'No vehicles are currently available'}
                    </p>
                    <Button 
                      className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterSpeed(0);
                        setFilterStatus('all');
                        setSelectedVehicleType('all');
                        setSelectedDriver(null);
                      }}
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Total Vehicles</div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </div>
              <Truck className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Average Speed</div>
                <div className="text-2xl font-bold text-white">
                  {stats.averageSpeed.toFixed(1)} <span className="text-sm text-gray-400">km/h</span>
                </div>
              </div>
              <Gauge className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Active Drivers</div>
                <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              </div>
              <Activity className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          <div className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">System Status</div>
                <div className="text-2xl font-bold text-green-400">Operational</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
