import { MapPin, AlertCircle, Wrench, Fuel, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

export function VehicleCard({ vehicle, onClick, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'retired':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-shadow"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {vehicle.plateNumber}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(vehicle.status)}`}>
                {getStatusIcon(vehicle.status)} {vehicle.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
        </div>

        {/* Location Info */}
        {vehicle.latitude && vehicle.longitude && (
          <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900">Current Location</p>
                <p className="text-sm text-blue-700 truncate">
                  {vehicle.address || `${vehicle.latitude.toFixed(4)}, ${vehicle.longitude.toFixed(4)}`}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  📍 Lat: {vehicle.latitude.toFixed(4)} | Long: {vehicle.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Mileage */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600 font-semibold">Mileage</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{vehicle.mileage?.toLocaleString()} km</p>
          </div>

          {/* Fuel Type */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Fuel className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600 font-semibold">Fuel</span>
            </div>
            <p className="text-lg font-bold text-gray-900 capitalize">{vehicle.fuelType}</p>
          </div>

          {/* Last Service */}
          {vehicle.lastServiceDate && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-600 font-semibold">Last Service</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {new Date(vehicle.lastServiceDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Next Service */}
          {vehicle.nextServiceDate && (
            <div className={`rounded-lg p-3 ${
              new Date(vehicle.nextServiceDate) < new Date()
                ? 'bg-red-50'
                : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className={`w-4 h-4 ${
                  new Date(vehicle.nextServiceDate) < new Date()
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`} />
                <span className={`text-xs font-semibold ${
                  new Date(vehicle.nextServiceDate) < new Date()
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}>
                  Next Service
                </span>
              </div>
              <p className={`text-sm font-bold ${
                new Date(vehicle.nextServiceDate) < new Date()
                  ? 'text-red-900'
                  : 'text-gray-900'
              }`}>
                {new Date(vehicle.nextServiceDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {vehicle.vin && (
          <div className="mb-3 text-xs text-gray-600">
            <span className="font-semibold">VIN:</span> {vehicle.vin}
          </div>
        )}

        {vehicle.notes && (
          <div className="mb-3 bg-gray-100 rounded p-2 text-sm text-gray-700 italic line-clamp-2">
            "{vehicle.notes}"
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={() => onClick(vehicle._id)}
            className="flex-1 bg-blue-100 text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-200 transition"
          >
            View Details
          </button>
          <button
            onClick={() => onEdit(vehicle)}
            className="flex-1 bg-indigo-100 text-indigo-700 font-semibold py-2 rounded-lg hover:bg-indigo-200 transition"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete ${vehicle.plateNumber}? This cannot be undone.`)) {
                onDelete(vehicle._id);
              }
            }}
            className="flex-1 bg-red-100 text-red-700 font-semibold py-2 rounded-lg hover:bg-red-200 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}
