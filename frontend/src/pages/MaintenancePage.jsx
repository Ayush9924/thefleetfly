import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, AlertCircle, Wrench, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import useMaintenanceScheduler from '../hooks/useMaintenanceScheduler';
import { MaintenanceStats } from '../components/MaintenanceStats';
import { MaintenanceScheduler } from '../components/MaintenanceScheduler';
import { MaintenanceList } from '../components/MaintenanceList';
import { MaintenanceMap } from '../components/MaintenanceMap';
import { getVehicleLocation, getAllVehiclesLocations } from '../services/locationService';

export default function MaintenancePage() {
  const [vehicles, setVehicles] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formError, setFormError] = useState(null);
  const [locations, setLocations] = useState({});
  const [loadingLocations, setLoadingLocations] = useState(false);

  const {
    data,
    loading,
    error,
    fetchAllData,
    createScheduled,
    complete,
    cancel
  } = useMaintenanceScheduler();

  // Fetch vehicles and maintenance data
  useEffect(() => {
    fetchVehicles();
    fetchAllData();
    fetchLocations();

    // Auto-refetch maintenance data every 10 seconds
    const refetchInterval = setInterval(() => {
      fetchAllData();
    }, 10000);

    return () => clearInterval(refetchInterval);
  }, []);

  // Refetch locations when map tab is active
  useEffect(() => {
    if (activeTab === 'map') {
      fetchLocations();
      const interval = setInterval(fetchLocations, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Refetch data when switching to upcoming/overdue tabs
  useEffect(() => {
    if (activeTab === 'upcoming' || activeTab === 'overdue') {
      fetchAllData();
    }
  }, [activeTab]);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const vehiclesData = await response.json();
        console.log('Vehicles fetched:', vehiclesData);
        setVehicles(vehiclesData);
      } else {
        console.error('Failed to fetch vehicles, status:', response.status);
        // Set empty array to avoid undefined errors
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const locationsData = await getAllVehiclesLocations();
      // Convert array to object keyed by vehicleId
      const locationsMap = {};
      if (Array.isArray(locationsData)) {
        locationsData.forEach(loc => {
          if (loc.vehicleId) {
            locationsMap[loc.vehicleId] = loc;
          }
        });
      }
      setLocations(locationsMap);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleScheduleSubmit = async (formData) => {
    try {
      setFormError(null);
      await createScheduled(formData);
      setShowScheduleForm(false);
      // Refresh all data
      await fetchAllData();
    } catch (error) {
      setFormError(error.message || 'Failed to create scheduled maintenance');
    }
  };

  const handleCompleteSchedule = async (maintenanceId) => {
    try {
      setFormError(null);
      await complete(maintenanceId);
      await fetchAllData();
    } catch (error) {
      setFormError(error.message || 'Failed to complete maintenance');
    }
  };

  const handleCancelSchedule = async (maintenanceId) => {
    if (confirm('Are you sure you want to cancel this maintenance?')) {
      try {
        setFormError(null);
        await cancel(maintenanceId, 'Cancelled by user');
        await fetchAllData();
      } catch (error) {
        setFormError(error.message || 'Failed to cancel maintenance');
      }
    }
  };

  if (loading && data.all.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-orange-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-linear-to-br from-orange-600 to-red-600 p-4 rounded-2xl shadow-lg"
              >
                <Wrench className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
                <p className="text-gray-500">Loading maintenance data...</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative background blur effects */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-orange-400/30 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 left-20 w-96 h-96 bg-red-400/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="bg-linear-to-br from-orange-500 to-red-600 p-4 rounded-2xl shadow-lg"
              >
                <Wrench className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-linear-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                  Maintenance
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Schedule and track vehicle maintenance
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="bg-linear-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 flex items-center gap-2 transition-all shadow-lg font-semibold"
            >
              <Plus className="w-5 h-5" />
              Schedule Maintenance
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics */}
        {data.stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <MaintenanceStats stats={data.stats} />
          </motion.div>
        )}

        {/* Schedule Form */}
        {showScheduleForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-linear-to-br from-orange-50/80 to-red-50/80 backdrop-blur-xl border-orange-200/50 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-white/50">
                <CardTitle className="text-xl font-bold text-gray-900">
                  Create Scheduled Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <MaintenanceScheduler
                  vehicles={vehicles}
                  onSubmit={handleScheduleSubmit}
                  onCancel={() => setShowScheduleForm(false)}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-2"
        >
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'upcoming', label: `Upcoming (${data.upcoming?.length || 0})` },
              { id: 'overdue', label: `Overdue (${data.overdue?.length || 0})` },
              { id: 'map', label: 'Fleet Map' },
              { id: 'history', label: 'History' }
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-6 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-linear-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'bg-white/50 text-gray-600 hover:bg-white/80 hover:text-gray-900'
                }`}
              >
                {tab.id === 'map' && <Map className="w-4 h-4" />}
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Error Alert */}
        {(error || formError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50/80 backdrop-blur-xl border border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-bold">Error</p>
              <p className="text-red-700 text-sm">{error || formError}</p>
            </div>
          </motion.div>
        )}

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overdue Section */}
              {data.overdue && data.overdue.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-red-200/50 bg-linear-to-br from-red-50/80 to-pink-50/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white/50 border-b border-red-200/50">
                      <CardTitle className="text-red-800 flex items-center gap-2 font-bold">
                        <AlertCircle className="w-5 h-5" />
                        Overdue Maintenance ({data.overdue.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <MaintenanceList
                        items={data.overdue}
                        onComplete={handleCompleteSchedule}
                        onCancel={handleCancelSchedule}
                        loading={loading}
                        type="overdue"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Recent Maintenance */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-200/50">
                    <CardTitle className="font-bold text-gray-900">Recent Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <MaintenanceList
                      items={data.all.slice(0, 5)}
                      loading={loading}
                      type="history"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Upcoming Tab */}
          {activeTab === 'upcoming' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-200/50">
                  <CardTitle className="font-bold text-gray-900">
                    Upcoming Scheduled Maintenance (Next 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <MaintenanceList
                    items={data.upcoming}
                    onComplete={handleCompleteSchedule}
                    onCancel={handleCancelSchedule}
                    loading={loading}
                    type="upcoming"
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Overdue Tab */}
          {activeTab === 'overdue' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-red-200/50 bg-linear-to-br from-red-50/80 to-pink-50/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-white/50 border-b border-red-200/50">
                  <CardTitle className="text-red-800 font-bold">Overdue Maintenance</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <MaintenanceList
                    items={data.overdue}
                    onComplete={handleCompleteSchedule}
                    onCancel={handleCancelSchedule}
                    loading={loading}
                    type="overdue"
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-200/50">
                  <CardTitle className="font-bold text-gray-900">Maintenance History</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <MaintenanceList
                    items={data.all}
                    loading={loading}
                    type="history"
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Fleet Map Tab */}
          {activeTab === 'map' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-200/50 flex flex-row items-center justify-between">
                  <CardTitle className="font-bold text-gray-900 flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    Fleet Location Map
                  </CardTitle>
                  {loadingLocations && (
                    <span className="text-xs text-blue-600 font-semibold">
                      🔄 Updating locations...
                    </span>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  <MaintenanceMap
                    maintenanceData={data.all}
                    locations={locations}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

