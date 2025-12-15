import { useState, useEffect } from 'react';
import { AlertCircle, MapPin, Wrench, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function MaintenanceMap({ maintenanceData, locations }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Combine maintenance data with location data
  const vehiclesWithStatus = maintenanceData.map(item => {
    const location = locations?.[item.vehicle._id];
    const upcoming = maintenanceData.filter(m => 
      m.vehicle._id === item.vehicle._id && 
      m.status === 'scheduled'
    ).length;
    const overdue = maintenanceData.filter(m => 
      m.vehicle._id === item.vehicle._id && 
      m.status === 'overdue'
    ).length;

    return {
      ...item,
      location,
      upcoming,
      overdue
    };
  });

  // Remove duplicates (keep only one entry per vehicle)
  const uniqueVehicles = {};
  vehiclesWithStatus.forEach(v => {
    if (!uniqueVehicles[v.vehicle._id]) {
      uniqueVehicles[v.vehicle._id] = v;
    }
  });

  const vehiclesList = Object.values(uniqueVehicles);

  const getStatusColor = (item) => {
    if (item.overdue > 0) return 'from-red-500 to-pink-500';
    if (item.upcoming > 0) return 'from-amber-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const getStatusBg = (item) => {
    if (item.overdue > 0) return 'bg-red-50';
    if (item.upcoming > 0) return 'bg-amber-50';
    return 'bg-green-50';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Vehicle List */}
      <div className="lg:col-span-1 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 overflow-y-auto max-h-[600px]">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Fleet Status
        </h3>

        <div className="space-y-3">
          {vehiclesList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No vehicles with maintenance</p>
            </div>
          ) : (
            vehiclesList.map((item) => (
              <motion.button
                key={item.vehicle._id}
                onClick={() => setSelectedVehicle(selectedVehicle === item.vehicle._id ? null : item.vehicle._id)}
                whileHover={{ scale: 1.02 }}
                className={`w-full text-left p-3 rounded-xl transition-all border-2 ${
                  selectedVehicle === item.vehicle._id
                    ? `border-blue-400 bg-blue-50`
                    : `border-transparent ${getStatusBg(item)} hover:shadow-md`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {item.vehicle.plateNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.vehicle.make} {item.vehicle.model}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold text-white bg-linear-to-r ${getStatusColor(item)}`}>
                    {item.overdue > 0 ? (
                      <span>⚠️ {item.overdue} OVD</span>
                    ) : item.upcoming > 0 ? (
                      <span>📅 {item.upcoming} UP</span>
                    ) : (
                      <span>✅ OK</span>
                    )}
                  </div>
                </div>

                {/* Location Preview */}
                {item.location && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600 truncate">
                      📍 {item.location.address || 'Tracking active'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.location.speed > 0 ? `🟢 Moving ${item.location.speed.toFixed(1)} km/h` : '🟡 Parked'}
                    </p>
                  </div>
                )}
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Details Panel */}
      <div className="lg:col-span-2">
        {selectedVehicle ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6"
          >
            {vehiclesList.find(v => v.vehicle._id === selectedVehicle) && (
              <>
                {(() => {
                  const vehicle = vehiclesList.find(v => v.vehicle._id === selectedVehicle);
                  return (
                    <div className="space-y-6">
                      {/* Vehicle Header */}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {vehicle.vehicle.plateNumber}
                        </h3>
                        <p className="text-gray-600">
                          {vehicle.vehicle.make} {vehicle.vehicle.model} ({vehicle.vehicle.year})
                        </p>
                      </div>

                      {/* Location Information */}
                      {vehicle.location && (
                        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Current Location
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-gray-600">Address</p>
                              <p className="font-medium text-gray-900">
                                {vehicle.location.address || `${vehicle.location.latitude?.toFixed(4)}, ${vehicle.location.longitude?.toFixed(4)}`}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-200">
                              <div>
                                <p className="text-gray-600 text-xs">Speed</p>
                                <p className={`font-bold ${vehicle.location.speed > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                  {vehicle.location.speed?.toFixed(1) || 0} km/h
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-xs">Last Update</p>
                                <p className="font-bold text-gray-900">
                                  {vehicle.location.timestamp ? new Date(vehicle.location.timestamp).toLocaleTimeString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Maintenance Status */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Wrench className="w-4 h-4" />
                          Maintenance Status
                        </h4>

                        {/* Overdue */}
                        {vehicle.overdue > 0 && (
                          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                            <p className="font-semibold text-red-700 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              {vehicle.overdue} Overdue Maintenance
                            </p>
                            <p className="text-red-600 text-sm mt-1">
                              Action required immediately!
                            </p>
                          </div>
                        )}

                        {/* Upcoming */}
                        {vehicle.upcoming > 0 && (
                          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                            <p className="font-semibold text-amber-700 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {vehicle.upcoming} Upcoming Maintenance
                            </p>
                            <p className="text-amber-600 text-sm mt-1">
                              Scheduled within 30 days
                            </p>
                          </div>
                        )}

                        {vehicle.overdue === 0 && vehicle.upcoming === 0 && (
                          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                            <p className="font-semibold text-green-700">✅ All Maintenance Up to Date</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </motion.div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                Select a vehicle to view details
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Click on any vehicle in the list
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
