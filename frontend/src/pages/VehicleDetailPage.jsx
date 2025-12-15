import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, MapPin, AlertCircle, Wrench, Fuel, Gauge, Calendar, Edit2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { vehicleService } from '../services/vehicleService';
import { VehicleForm } from '../components/VehicleForm';

export default function VehicleDetailPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch vehicle details
  useEffect(() => {
    fetchVehicleDetails();
    fetchLocationHistory();
  }, [vehicleId]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleService.getVehicle(vehicleId);
      setVehicle(data);
      console.log('Vehicle details loaded:', data);
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      setError(err.message || 'Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await vehicleService.getVehicleLocationHistory(vehicleId);
      setLocationHistory(Array.isArray(history) ? history : []);
      console.log('Location history loaded:', history);
    } catch (err) {
      console.error('Error fetching location history:', err);
      // Don't set error, just log it
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdateVehicle = async (formData) => {
    try {
      setError(null);
      const updated = await vehicleService.updateVehicle(vehicleId, formData);
      setVehicle(updated);
      setEditMode(false);
      alert('✅ Vehicle updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update vehicle');
      console.error('Error updating vehicle:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'from-green-500 to-emerald-500';
      case 'maintenance':
        return 'from-yellow-500 to-orange-500';
      case 'inactive':
        return 'from-gray-500 to-slate-500';
      case 'retired':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return '🟢';
      case 'maintenance':
        return '🟡';
      case 'inactive':
        return '⚫';
      case 'retired':
        return '🔴';
      default:
        return '⭕';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate('/dashboard/vehicles')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Vehicles
        </motion.button>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-pulse">
          <div className="h-12 bg-gray-300 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate('/dashboard/vehicles')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Vehicles
        </motion.button>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard/vehicles')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-8">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate('/dashboard/vehicles')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Vehicles
        </motion.button>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50/80 backdrop-blur-xl border border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-bold">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Edit Form */}
        {editMode ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Vehicle</h2>
              <button
                onClick={() => setEditMode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <VehicleForm
              initialData={vehicle}
              onSubmit={handleUpdateVehicle}
              onCancel={() => setEditMode(false)}
            />
          </motion.div>
        ) : (
          <>
            {/* Header with Status */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h1 className="text-4xl font-black text-gray-900">
                      {vehicle.plateNumber}
                    </h1>
                    <span className={`px-4 py-2 rounded-full font-bold text-white bg-gradient-to-r ${getStatusColor(vehicle.status)}`}>
                      {getStatusIcon(vehicle.status)} {vehicle.status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xl text-gray-600">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode(true)}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-indigo-700 flex items-center gap-2 font-semibold transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Vehicle
                </motion.button>
              </div>
            </motion.div>

            {/* Current Location */}
            {vehicle.latitude && vehicle.longitude && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-200/50 p-6 sm:p-8"
              >
                <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Current Location
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/80 rounded-xl p-6 border border-blue-100">
                    <p className="text-sm text-blue-600 font-semibold mb-2">Address</p>
                    <p className="text-lg font-bold text-blue-900">
                      {vehicle.address || 'Not set'}
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-6 border border-blue-100">
                    <p className="text-sm text-blue-600 font-semibold mb-2">GPS Coordinates</p>
                    <p className="text-lg font-bold text-blue-900">
                      {vehicle.latitude?.toFixed(4)}, {vehicle.longitude?.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="mt-6 bg-white/80 rounded-xl p-6 border border-blue-100">
                  <p className="text-sm text-blue-600 font-semibold mb-3">Map View</p>
                  <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                    <p className="text-gray-600">
                      📍 {vehicle.latitude?.toFixed(4)}, {vehicle.longitude?.toFixed(4)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Vehicle Details Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Mileage */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Gauge className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Current Mileage</h3>
                </div>
                <p className="text-4xl font-black text-blue-600">{vehicle.mileage?.toLocaleString()} km</p>
              </div>

              {/* Fuel Type */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Fuel className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Fuel Type</h3>
                </div>
                <p className="text-4xl font-black text-green-600 capitalize">{vehicle.fuelType}</p>
              </div>

              {/* Last Service */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Wrench className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Last Service</h3>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : 'Not recorded'}
                </p>
              </div>

              {/* Next Service */}
              <div className={`rounded-2xl shadow-xl border border-white/20 p-6 backdrop-blur-xl ${
                vehicle.nextServiceDate && new Date(vehicle.nextServiceDate) < new Date()
                  ? 'bg-red-50/80'
                  : 'bg-white/80'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${
                    vehicle.nextServiceDate && new Date(vehicle.nextServiceDate) < new Date()
                      ? 'bg-red-100'
                      : 'bg-orange-100'
                  }`}>
                    <Calendar className={`w-6 h-6 ${
                      vehicle.nextServiceDate && new Date(vehicle.nextServiceDate) < new Date()
                        ? 'text-red-600'
                        : 'text-orange-600'
                    }`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Next Service</h3>
                </div>
                <p className={`text-2xl font-bold ${
                  vehicle.nextServiceDate && new Date(vehicle.nextServiceDate) < new Date()
                    ? 'text-red-600'
                    : 'text-orange-600'
                }`}>
                  {vehicle.nextServiceDate ? new Date(vehicle.nextServiceDate).toLocaleDateString() : 'Not scheduled'}
                </p>
                {vehicle.nextServiceDate && new Date(vehicle.nextServiceDate) < new Date() && (
                  <p className="text-red-600 text-sm mt-2 font-semibold">⚠️ Service overdue!</p>
                )}
              </div>
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicle.vin && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">VIN</p>
                    <p className="text-lg font-bold text-gray-900 break-all">{vehicle.vin}</p>
                  </div>
                )}
                {vehicle.registrationNumber && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Registration Number</p>
                    <p className="text-lg font-bold text-gray-900">{vehicle.registrationNumber}</p>
                  </div>
                )}
                {vehicle.insuranceExpiry && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Insurance Expiry</p>
                    <p className={`text-lg font-bold ${
                      new Date(vehicle.insuranceExpiry) < new Date()
                        ? 'text-red-600'
                        : 'text-gray-900'
                    }`}>
                      {new Date(vehicle.insuranceExpiry).toLocaleDateString()}
                      {new Date(vehicle.insuranceExpiry) < new Date() && ' (⚠️ Expired)'}
                    </p>
                  </div>
                )}
              </div>
              {vehicle.notes && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 font-semibold mb-2">Notes</p>
                  <p className="text-gray-700 bg-gray-100 rounded-lg p-4 italic">"{vehicle.notes}"</p>
                </div>
              )}
            </motion.div>

            {/* Location History */}
            {locationHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Location History</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {locationHistory.map((location, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900">📍 {location.address || 'Location'}</p>
                          <p className="text-sm text-blue-700 mt-1">
                            {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                          </p>
                        </div>
                        <p className="text-xs text-blue-600 font-semibold whitespace-nowrap ml-4">
                          {location.timestamp ? new Date(location.timestamp).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

