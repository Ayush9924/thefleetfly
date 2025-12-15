import { MapPin, Clock, Navigation } from 'lucide-react';
import { formatTimeAgo } from '../services/locationService';

export function VehicleLocationStatus({ vehicleId, location }) {
  if (!location) {
    return (
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Location unavailable
      </div>
    );
  }

  const { latitude, longitude, speed, timestamp, address } = location;

  return (
    <div className="space-y-2 text-sm">
      {/* Location Address */}
      <div className="flex items-start gap-2">
        <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-gray-700 font-medium">
            {address || `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`}
          </p>
        </div>
      </div>

      {/* Speed & Last Seen */}
      <div className="flex items-center gap-4 text-gray-600 ml-6">
        {speed !== undefined && speed > 0 ? (
          <div className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-green-600" />
            <span className="text-green-600 font-medium">{speed.toFixed(1)} km/h</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-gray-400 rotate-180" />
            <span className="text-gray-500">Parked</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTimeAgo(timestamp)}</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex gap-2 ml-6 flex-wrap">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          speed > 0 
            ? 'bg-green-100 text-green-700' 
            : 'bg-amber-100 text-amber-700'
        }`}>
          {speed > 0 ? '🟢 Active' : '🟡 Parked'}
        </span>
      </div>
    </div>
  );
}
