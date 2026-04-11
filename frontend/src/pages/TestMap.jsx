import { useState, useEffect } from "react";
import LiveMapTracker from "@/components/map/LiveMapTracker";
import { Map, Gauge, Activity } from "lucide-react";

const INITIAL_DRIVERS = [
  { driverId: "DRV-001", latitude: 40.7128, longitude: -74.006,  speed: 45.5, status: "active",  vehicleType: "Truck", fuel: 85, battery: 92, timestamp: Date.now() },
  { driverId: "DRV-002", latitude: 40.758,  longitude: -73.9855, speed: 32.1, status: "idle",    vehicleType: "Van",   fuel: 45, battery: 78, timestamp: Date.now() },
  { driverId: "DRV-003", latitude: 40.7505, longitude: -74.006,  speed: 0,    status: "stopped", vehicleType: "Car",   fuel: 65, battery: 88, timestamp: Date.now() },
];

const STATUS_COLOR = { active: "text-green-600 bg-green-100", idle: "text-amber-600 bg-amber-100", stopped: "text-gray-600 bg-gray-100" };

export default function TestMap() {
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);

  useEffect(() => {
    const t = setInterval(() => {
      setDrivers(prev => prev.map(d => ({
        ...d,
        latitude:  d.latitude  + (Math.random() - 0.5) * 0.001,
        longitude: d.longitude + (Math.random() - 0.5) * 0.001,
        speed:     Math.max(0, d.speed + (Math.random() - 0.5) * 5),
        timestamp: Date.now(),
      })));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
          <Map className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Map Test</h1>
          <p className="text-sm text-gray-500">Verifying live map renderer — positions update every 5 s</p>
        </div>
      </div>

      {/* Map */}
      <div className="h-[480px] rounded-xl border border-gray-200 bg-gray-100 overflow-hidden shadow-sm">
        <LiveMapTracker drivers={drivers} onDriverClick={id => {}} />
      </div>

      {/* Test driver cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {drivers.map(d => (
          <div key={d.driverId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900 text-sm">{d.driverId}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[d.status]}`}>{d.status}</span>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <p className="flex items-center gap-1.5"><Activity className="h-3 w-3" /> Type: {d.vehicleType}</p>
              <p className="flex items-center gap-1.5"><Gauge className="h-3 w-3" /> Speed: {d.speed.toFixed(1)} km/h</p>
              <p className="font-mono text-gray-400">{d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Troubleshooting */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-bold text-blue-900 mb-2">Troubleshooting</h3>
        <ul className="space-y-1 text-xs text-blue-700">
          {["Check console for errors (F12)", "Verify Leaflet is installed: npm list leaflet", "Ensure map container has a fixed height", "Try disabling browser extensions", "Test in incognito / private mode"].map(t => (
            <li key={t} className="flex items-start gap-1.5">✓ {t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

