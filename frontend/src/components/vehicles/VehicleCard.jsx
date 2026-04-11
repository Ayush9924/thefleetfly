import { MapPin, AlertCircle, Wrench, Fuel, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_MAP = {
  active:      { color: 'bg-green-100 text-green-800 border-green-300', icon: '🟢' },
  maintenance: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '🟡' },
  inactive:    { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: '⚫' },
  retired:     { color: 'bg-red-100 text-red-800 border-red-300', icon: '🔴' }
};

const cardVariants = { hover: { y: -4 } };

export function VehicleCard({ vehicle, onClick, onEdit, onDelete }) {
  const st = STATUS_MAP[vehicle.status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '⭕' };
  const locStr = vehicle.address || (vehicle.latitude && `${vehicle.latitude.toFixed(4)}, ${vehicle.longitude.toFixed(4)}`);
  const nextSrv = vehicle.nextServiceDate ? new Date(vehicle.nextServiceDate) : null;
  const isOverdue = nextSrv && nextSrv < new Date();

  return (
    <motion.div variants={cardVariants} whileHover="hover" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-gray-900">{vehicle.plateNumber}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${st.color}`}>
              {st.icon} {vehicle.status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <p className="text-sm text-gray-500">{vehicle.year} {vehicle.make} {vehicle.model}</p>
        </div>
      </div>

      {locStr && (
        <div className="flex gap-2 items-center bg-blue-50/50 px-3 py-2 rounded-lg mb-4 border border-blue-100">
          <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-xs font-medium text-blue-800 truncate">{locStr}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="bg-gray-50 p-2.5 rounded-lg flex items-center gap-2"><Gauge className="w-4 h-4 text-gray-400 shrink-0"/> <span className="font-semibold text-gray-700">{vehicle.mileage?.toLocaleString() || 0} km</span></div>
        <div className="bg-gray-50 p-2.5 rounded-lg flex items-center gap-2"><Fuel className="w-4 h-4 text-gray-400 shrink-0"/> <span className="font-semibold text-gray-700 capitalize">{vehicle.fuelType || 'N/A'}</span></div>
        {vehicle.lastServiceDate && <div className="bg-gray-50 p-2.5 rounded-lg flex items-center gap-2"><Wrench className="w-4 h-4 text-gray-400 shrink-0"/> <span className="font-semibold text-gray-700">{new Date(vehicle.lastServiceDate).toLocaleDateString()}</span></div>}
        {nextSrv && <div className={`p-2.5 rounded-lg flex items-center gap-2 border ${isOverdue ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-50 border-transparent text-gray-700'}`}><AlertCircle className={`w-4 h-4 shrink-0 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}/> <span className="font-semibold">{nextSrv.toLocaleDateString()}</span></div>}
      </div>

      {vehicle.vin && <p className="text-xs text-gray-400 mb-3 truncate">VIN: {vehicle.vin}</p>}

      <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
        <button onClick={() => onClick(vehicle._id)} className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-semibold rounded-lg transition-colors">Details</button>
        <button onClick={() => onEdit(vehicle)} className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-semibold rounded-lg transition-colors">Edit</button>
        <button onClick={() => { if (confirm(`Delete ${vehicle.plateNumber}?`)) onDelete(vehicle._id); }} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors">Delete</button>
      </div>
    </motion.div>
  );
}




