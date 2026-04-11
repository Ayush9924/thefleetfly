import { useState, useMemo } from 'react';
import { AlertCircle, MapPin, Wrench, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const cardVariants = { hover: { scale: 1.01 } };

const statusOf = (item) => {
  if (item.overdue > 0) return { bg: 'bg-red-50', badge: 'bg-red-500', label: `⚠ ${item.overdue} Overdue` };
  if (item.upcoming > 0) return { bg: 'bg-amber-50', badge: 'bg-amber-500', label: `📅 ${item.upcoming} Upcoming` };
  return { bg: 'bg-green-50', badge: 'bg-green-500', label: '✓ OK' };
};

export function MaintenanceMap({ maintenanceData = [], locations = {} }) {
  const [selectedId, setSelectedId] = useState(null);

  /** Deduplicate vehicles and attach counts */
  const vehicles = useMemo(() => {
    const map = {};
    maintenanceData.forEach(item => {
      const vid = item.vehicle?._id;
      if (!vid) return;
      if (!map[vid]) {
        map[vid] = { ...item, upcoming: 0, overdue: 0, location: locations[vid] };
      }
      if (item.status === 'scheduled') map[vid].upcoming++;
      if (item.status === 'overdue') map[vid].overdue++;
    });
    return Object.values(map);
  }, [maintenanceData, locations]);

  const selected = vehicles.find(v => v.vehicle._id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Sidebar list */}
      <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4 overflow-y-auto max-h-[600px]">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-blue-600" /> Fleet Status
        </h3>
        {vehicles.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No vehicles with maintenance</p>
          </div>
        ) : (
          <div className="space-y-2">
            {vehicles.map(item => {
              const st = statusOf(item);
              const isSelected = selectedId === item.vehicle._id;
              return (
                <motion.button key={item.vehicle._id} variants={cardVariants} whileHover="hover"
                  onClick={() => setSelectedId(isSelected ? null : item.vehicle._id)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-blue-400 bg-blue-50' : `border-transparent ${st.bg} hover:shadow-sm`}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.vehicle.plateNumber}</p>
                      <p className="text-xs text-gray-500">{item.vehicle.make} {item.vehicle.model}</p>
                    </div>
                    <span className={`${st.badge} text-white text-xs font-bold px-2 py-0.5 rounded-lg`}>{st.label}</span>
                  </div>
                  {item.location && (
                    <p className="text-xs text-gray-500 mt-1.5 pt-1.5 border-t border-gray-100 truncate">
                      📍 {item.location.address || 'Tracking active'} · {item.location.speed > 0 ? `${item.location.speed.toFixed(1)} km/h` : 'Parked'}
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail panel */}
      <div className="lg:col-span-2">
        {selected ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{selected.vehicle.plateNumber}</h3>
              <p className="text-sm text-gray-500">{selected.vehicle.make} {selected.vehicle.model} ({selected.vehicle.year})</p>
            </div>

            {selected.location && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" />Current Location</h4>
                <p className="text-sm text-gray-700">{selected.location.address || `${selected.location.latitude?.toFixed(4)}, ${selected.location.longitude?.toFixed(4)}`}</p>
                <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-blue-100 text-xs">
                  <div><p className="text-gray-500">Speed</p><p className={`font-bold ${selected.location.speed > 0 ? 'text-green-600' : 'text-gray-600'}`}>{(selected.location.speed || 0).toFixed(1)} km/h</p></div>
                  <div><p className="text-gray-500">Last Update</p><p className="font-bold text-gray-700">{selected.location.timestamp ? new Date(selected.location.timestamp).toLocaleTimeString() : 'N/A'}</p></div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Wrench className="w-4 h-4" />Maintenance</h4>
              {selected.overdue > 0 && <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg"><p className="text-sm font-semibold text-red-700 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{selected.overdue} Overdue — Action required!</p></div>}
              {selected.upcoming > 0 && <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg"><p className="text-sm font-semibold text-amber-700 flex items-center gap-1"><Clock className="w-4 h-4" />{selected.upcoming} Upcoming (next 30 days)</p></div>}
              {!selected.overdue && !selected.upcoming && <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg"><p className="text-sm font-semibold text-green-700">✅ All maintenance up to date</p></div>}
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full flex items-center justify-center min-h-48">
            <div className="text-center text-gray-400">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Select a vehicle to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



