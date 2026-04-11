import { useState, useEffect, useMemo } from "react";
import LiveMapTracker from "@/components/map/LiveMapTracker";
import { mockFleetData } from "@/services/mockApi";
import { vehicleService } from "@/services/vehicleService";
import { MapPin, Truck, Gauge, RefreshCw } from "lucide-react";

const STATUS_CLASS = { active: "bg-green-100 text-green-800", idle: "bg-amber-100 text-amber-800", stopped: "bg-gray-100 text-gray-700" };

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm text-center">
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function PublicLiveTracking() {
  const [dbVehicles, setDbVehicles]   = useState([]);
  const [mockVehicles, setMockVehicles] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showMap, setShowMap]         = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const fetchDb = async () => {
    setRefreshing(true);
    try {
      const d = await vehicleService.getAllVehicles();
      if (Array.isArray(d)) {
        setDbVehicles(d.map(v => ({
          driverId: v._id, vehicleId: v._id,
          licensePlate: v.plateNumber, vehicleType: v.make,
          driverName: `${v.make} ${v.model}`,
          latitude: v.latitude || 40.7128, longitude: v.longitude || -74.006,
          speed: 0, heading: 0, status: "stopped", timestamp: Date.now(),
          battery: v.battery || 85, fuel: v.fuel || 75, temperature: v.temperature || 22,
        })));
      }
    } catch {}
    finally { setRefreshing(false); }
  };

  useEffect(() => {
    fetchDb();
    const t = setInterval(fetchDb, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let sub;
    const init = async () => {
      try {
        const initial = await mockFleetData.getVehicles(15);
        setMockVehicles(initial);
        setLoading(false);
        if (!autoRefresh) return;
        sub = mockFleetData.subscribeToUpdates(v => setMockVehicles(v), 3000);
        sub.start();
      } catch { setLoading(false); }
    };
    init();
    return () => sub?.stop();
  }, [autoRefresh]);

  const vehicles = useMemo(() => [...dbVehicles, ...mockVehicles], [dbVehicles, mockVehicles]);

  const stats = useMemo(() => ({
    total:   vehicles.length,
    active:  vehicles.filter(v => v.speed > 15).length,
    idle:    vehicles.filter(v => v.speed > 0 && v.speed <= 15).length,
    stopped: vehicles.filter(v => v.speed === 0).length,
  }), [vehicles]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" /> Live Fleet Tracking
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Real-time vehicle location and status monitoring</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchDb} disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={() => setShowMap(!showMap)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showMap ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {showMap ? "Hide Map" : "Show Map"}
            </button>
            <button onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${autoRefresh ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {autoRefresh ? "🔴 Live" : "⏸ Paused"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600">Loading fleet data…</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Map */}
            {showMap && (
              <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-900">Live Map ({vehicles.length} vehicles)</p>
                </div>
                <div className="h-96">
                  <LiveMapTracker vehicles={vehicles} onVehicleClick={setSelectedVehicle} />
                </div>
              </div>
            )}

            {/* Sidebar */}
            <div className={showMap ? "" : "lg:col-span-3"}>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard label="Total"   value={stats.total}   color="text-blue-600"  />
                <StatCard label="Active"  value={stats.active}  color="text-green-600" />
                <StatCard label="Idle"    value={stats.idle}    color="text-amber-600" />
                <StatCard label="Stopped" value={stats.stopped} color="text-gray-600"  />
              </div>

              {/* Vehicle list */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-900">Connected Vehicles ({vehicles.length})</p>
                  <span className="text-xs text-gray-400 ml-auto">DB:{dbVehicles.length} Mock:{mockVehicles.length}</span>
                </div>
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                      <tr>
                        {["Driver", "Vehicle", "Status", "Speed", "Fuel"].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {vehicles.map(v => (
                        <tr key={v.driverId} onClick={() => setSelectedVehicle(v.driverId)}
                          className={`hover:bg-blue-50 cursor-pointer transition-colors ${selectedVehicle === v.driverId ? "bg-blue-50" : ""}`}>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${v.speed > 15 ? "bg-green-500" : v.speed > 0 ? "bg-amber-500" : "bg-gray-400"}`} />
                              <span className="font-medium text-gray-900 text-xs">{v.driverId}</span>
                            </div>
                            <p className="text-xs text-gray-500 ml-3">{v.driverName}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="text-xs font-medium text-gray-900">{v.vehicleType}</p>
                            <p className="text-xs text-gray-500">{v.licensePlate}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${v.speed > 15 ? STATUS_CLASS.active : v.speed > 0 ? STATUS_CLASS.idle : STATUS_CLASS.stopped}`}>
                              {v.speed > 15 ? "Active" : v.speed > 0 ? "Idle" : "Stopped"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1 text-xs text-gray-700">
                              <Gauge className="h-3 w-3" /> {v.speed.toFixed(1)}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${v.fuel}%` }} />
                              </div>
                              <span className="text-xs text-gray-700">{v.fuel}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

