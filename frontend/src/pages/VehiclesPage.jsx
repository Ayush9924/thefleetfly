import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Search, AlertCircle, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { vehicleService } from '../services/vehicleService';
import { VehicleForm } from '../components/VehicleForm';
import { VehicleCard } from '../components/VehicleCard';

export default function VehiclesPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching vehicles...');
      const data = await vehicleService.getAllVehicles();
      console.log('✅ Vehicles loaded:', data);
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching vehicles:', err);
      setError(err.message || 'Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (formData) => {
    try {
      setError(null);
      console.log('📤 Sending vehicle data:', formData);
      const newVehicle = await vehicleService.createVehicle(formData);
      console.log('✅ Vehicle created successfully:', newVehicle);
      
      // Handle both response formats (with or without data wrapper)
      const vehicleData = newVehicle.data || newVehicle;
      setVehicles(prev => [...prev, vehicleData]);
      setShowForm(false);
      alert('✅ Vehicle added successfully!');
    } catch (err) {
      console.error('❌ Error adding vehicle:', err);
      const errorMsg = typeof err === 'string' ? err : (err.message || 'Failed to add vehicle');
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleUpdateVehicle = async (formData) => {
    try {
      setError(null);
      const updated = await vehicleService.updateVehicle(editingVehicle._id, formData);
      setVehicles(prev =>
        prev.map(v => v._id === editingVehicle._id ? updated : v)
      );
      setEditingVehicle(null);
      setShowForm(false);
      alert('✅ Vehicle updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update vehicle');
      console.error('Error updating vehicle:', err);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      setError(null);
      await vehicleService.deleteVehicle(vehicleId);
      setVehicles(prev => prev.filter(v => v._id !== vehicleId));
      alert('✅ Vehicle deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete vehicle');
      console.error('Error deleting vehicle:', err);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  // Filter and search vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || vehicle.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading && vehicles.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">🚗 Vehicles</h1>
          <p className="text-gray-500 mt-1">Loading your fleet...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="bg-linear-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg"
              >
                <Truck className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Vehicles
                </h1>
                <p className="text-gray-600 mt-1">Manage and track your fleet vehicles</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingVehicle(null);
                setShowForm(true);
              }}
              className="bg-linear-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2 transition-all shadow-lg font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Vehicle
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-lg">
            <p className="text-gray-600 text-sm font-semibold">Total Vehicles</p>
            <p className="text-3xl font-bold text-blue-600">{vehicles.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-lg">
            <p className="text-gray-600 text-sm font-semibold">Active</p>
            <p className="text-3xl font-bold text-green-600">{vehicles.filter(v => v.status === 'active').length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-lg">
            <p className="text-gray-600 text-sm font-semibold">In Maintenance</p>
            <p className="text-3xl font-bold text-yellow-600">{vehicles.filter(v => v.status === 'maintenance').length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-lg">
            <p className="text-gray-600 text-sm font-semibold">With Location</p>
            <p className="text-3xl font-bold text-indigo-600">{vehicles.filter(v => v.latitude && v.longitude).length}</p>
          </div>
        </motion.div>

        {/* Add/Edit Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingVehicle ? '✏️ Edit Vehicle' : '➕ Add New Vehicle'}
            </h2>
            <VehicleForm
              initialData={editingVehicle}
              onSubmit={editingVehicle ? handleUpdateVehicle : handleAddVehicle}
              onCancel={handleCancel}
            />
          </motion.div>
        )}

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

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by plate, make, model, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-700"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">In Maintenance</option>
            <option value="inactive">Inactive</option>
            <option value="retired">Retired</option>
          </select>
        </motion.div>

        {/* Vehicle Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredVehicles.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Vehicles Found</h3>
              <p className="text-gray-600 mb-4">
                {vehicles.length === 0
                  ? 'Start by adding your first vehicle to the fleet'
                  : 'No vehicles match your search criteria'}
              </p>
              <button
                onClick={() => {
                  setEditingVehicle(null);
                  setShowForm(true);
                }}
                className="bg-linear-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold transition-all"
              >
                Add First Vehicle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <VehicleCard
                    vehicle={vehicle}
                    onClick={(id) => navigate(`/dashboard/vehicles/${id}`)}
                    onEdit={handleEditVehicle}
                    onDelete={handleDeleteVehicle}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

