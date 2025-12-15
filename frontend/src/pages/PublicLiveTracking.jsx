import { useState, useEffect } from 'react';
import LiveMapTracker from '../components/LiveMapTracker';
import { mockFleetData } from '../services/mockApi';
import { vehicleService } from '../services/vehicleService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MapPin, Truck, Users, Zap, Battery, Gauge, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicLiveTracking() {
  const [vehicles, setVehicles] = useState([]);
  const [databaseVehicles, setDatabaseVehicles] = useState([]);
  const [mockVehicles, setMockVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshingDb, setRefreshingDb] = useState(false);

  // Function to fetch database vehicles
  const fetchDatabaseVehicles = async () => {
    try {
      setRefreshingDb(true);
      console.log('📦 Fetching database vehicles...');
      const dbVehicles = await vehicleService.getAllVehicles();
      if (Array.isArray(dbVehicles)) {
        const formattedDbVehicles = dbVehicles.map(vehicle => ({
          driverId: vehicle._id,
          vehicleId: vehicle._id,
          licensePlate: vehicle.plateNumber,
          vehicleType: vehicle.make,
          driverName: vehicle.make + ' ' + vehicle.model,
          latitude: vehicle.latitude || 40.7128,
          longitude: vehicle.longitude || -74.0060,
          speed: 0,
          heading: 0,
          status: 'stopped',
          timestamp: Date.now(),
          battery: vehicle.battery || 85,
          fuel: vehicle.fuel || 75,
          temperature: vehicle.temperature || 22,
          phone: vehicle.phone || 'N/A',
          source: 'database'
        }));
        setDatabaseVehicles(formattedDbVehicles);
        console.log('✅ Database vehicles loaded:', formattedDbVehicles.length);
      }
    } catch (error) {
      console.error('❌ Error fetching database vehicles:', error);
      setDatabaseVehicles([]);
    } finally {
      setRefreshingDb(false);
    }
  };

  // Fetch database vehicles on mount and auto-refresh every 10 seconds
  useEffect(() => {
    fetchDatabaseVehicles();
    
    // Auto-refresh database vehicles every 10 seconds
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing database vehicles...');
      fetchDatabaseVehicles();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Initialize with mock API data
  useEffect(() => {
    const initializeMockData = async () => {
      try {
        console.log('📡 Loading mock API vehicles...');
        // Load initial mock API data
        const initialMockVehicles = await mockFleetData.getVehicles(15);
        setMockVehicles(initialMockVehicles);
        setLoading(false);
        console.log('✅ Mock API vehicles loaded:', initialMockVehicles?.length || 0);

        if (!autoRefresh) return;

        // Subscribe to real-time updates from mock API
        const subscriber = mockFleetData.subscribeToUpdates((updatedVehicles) => {
          console.log('🔄 Mock API update received:', updatedVehicles?.length || 0);
          setMockVehicles(updatedVehicles);
        }, 3000);

        // Start the updates
        subscriber.start();

        return () => {
          subscriber.stop();
        };
      } catch (error) {
        console.error('❌ Error initializing mock data:', error);
        setLoading(false);
      }
    };

    initializeMockData();
  }, [autoRefresh]);

  // Merge database and mock vehicles
  useEffect(() => {
    const allVehicles = [...databaseVehicles, ...mockVehicles];
    console.log('🔀 Combined vehicles count:', allVehicles.length, '(DB:', databaseVehicles.length, '+ Mock:', mockVehicles.length + ')');
    setVehicles(allVehicles);
  }, [databaseVehicles, mockVehicles]);

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
      idle: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
      stopped: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
    };
    return styles[status] || styles.stopped;
  };

  // Get vehicle type icon
  const getVehicleIcon = (type) => {
    return <Truck className="h-4 w-4" />;
  };

  // Stats
  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.speed > 15).length,
    idle: vehicles.filter(v => v.speed > 0 && v.speed <= 15).length,
    stopped: vehicles.filter(v => v.speed === 0).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Fleet Tracking</h1>
              <p className="text-gray-600 mt-2">Real-time vehicle location and status monitoring</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={fetchDatabaseVehicles}
                disabled={refreshingDb}
                variant="outline"
                className="gap-2"
              >
                {refreshingDb ? '🔄 Refreshing...' : '🔄 Refresh DB'}
              </Button>
              <Button
                onClick={() => setShowMap(!showMap)}
                variant={showMap ? 'default' : 'outline'}
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? 'default' : 'outline'}
              >
                {autoRefresh ? '🔴 Live' : '⏸ Paused'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading fleet data...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            {showMap && (
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Live Map ({vehicles.length} vehicles)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 rounded-lg overflow-hidden">
                      <LiveMapTracker vehicles={vehicles} onVehicleClick={(vehicleId) => setSelectedVehicle(vehicleId)} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Stats & List Section */}
            <div className={showMap ? '' : 'lg:col-span-3'}>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                      <div className="text-sm text-gray-600">Total Vehicles</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                      <div className="text-sm text-gray-600">Active</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{stats.idle}</div>
                      <div className="text-sm text-gray-600">Idle</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{stats.stopped}</div>
                      <div className="text-sm text-gray-600">Stopped</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Vehicles Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Connected Vehicles ({vehicles.length})
                    </div>
                    <div className="text-xs font-normal text-gray-500">
                      DB: {databaseVehicles.length} | Mock: {mockVehicles.length}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Driver</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Vehicle</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Speed</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Location</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Fuel</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Battery</th>
                        </tr>
                      </thead>
                      <tbody className="max-h-96 overflow-y-auto block divide-y">
                        {vehicles.map((vehicle, index) => (
                          <tr 
                            key={vehicle.driverId}
                            onClick={() => setSelectedVehicle(vehicle.driverId)}
                            className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                              selectedVehicle === vehicle.driverId ? 'bg-blue-100' : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${
                                  vehicle.speed > 15 ? 'bg-green-500' : vehicle.speed > 0 ? 'bg-amber-500' : 'bg-gray-500'
                                }`}></div>
                                <div>
                                  <div className="font-semibold text-gray-900">{vehicle.driverId}</div>
                                  <div className="text-xs text-gray-500">{vehicle.driverName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-semibold text-gray-900">{vehicle.vehicleType}</div>
                                <div className="text-xs text-gray-500">{vehicle.licensePlate}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                vehicle.speed > 15 ? 'bg-green-100 text-green-800' : 
                                vehicle.speed > 0 ? 'bg-amber-100 text-amber-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {vehicle.speed > 15 ? 'Active' : vehicle.speed > 0 ? 'Idle' : 'Stopped'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Gauge className="h-4 w-4" />
                                <span>{vehicle.speed.toFixed(1)} km/h</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700 text-xs font-mono">
                              {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${vehicle.fuel}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{vehicle.fuel}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${vehicle.battery}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{vehicle.battery}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
