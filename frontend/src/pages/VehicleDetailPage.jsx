import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, AlertCircle, Wrench, Fuel, Gauge, Calendar, Edit2, X } from "lucide-react";
import { motion } from "framer-motion";
import { vehicleService } from "@/services/vehicleService";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import toast from "react-hot-toast";

const fade = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const STATUS_CONFIG = {
  active:      { dot: "bg-green-500",  badge: "bg-green-100 text-green-800"  },
  maintenance: { dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-800"  },
  inactive:    { dot: "bg-gray-400",   badge: "bg-gray-100  text-gray-700"   },
  retired:     { dot: "bg-red-500",    badge: "bg-red-100   text-red-800"    },
};

function InfoCard({ icon: Icon, iconColor = "text-blue-600", iconBg = "bg-blue-100", label, value, valueColor = "text-gray-900", note }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      {note && <p className="text-xs text-red-600 font-semibold mt-1">{note}</p>}
    </div>
  );
}

export default function VehicleDetailPage() {
  const { vehicleId } = useParams();
  const navigate      = useNavigate();

  const [vehicle, setVehicle]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [editMode, setEditMode]           = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      vehicleService.getVehicle(vehicleId),
      vehicleService.getVehicleLocationHistory(vehicleId).catch(() => []),
    ]).then(([v, hist]) => {
      if (!active) return;
      setVehicle(v);
      setLocationHistory(Array.isArray(hist) ? hist : []);
    }).catch(err => {
      if (active) setError(err.message || "Failed to load vehicle details");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [vehicleId]);

  const handleUpdate = async (formData) => {
    try {
      const updated = await vehicleService.updateVehicle(vehicleId, formData);
      setVehicle(updated);
      setEditMode(false);
      toast.success("Vehicle updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update vehicle");
    }
  };

  const BackButton = () => (
    <button onClick={() => navigate("/dashboard/vehicles")}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mb-5">
      <ArrowLeft className="h-4 w-4" /> Back to Vehicles
    </button>
  );

  if (loading) return (
    <div className="p-6 max-w-4xl mx-auto">
      <BackButton />
      <div className="rounded-xl border border-gray-200 bg-white p-8 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}</div>
      </div>
    </div>
  );

  if (!vehicle) return (
    <div className="p-6 max-w-4xl mx-auto">
      <BackButton />
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Vehicle Not Found</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">The vehicle you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/dashboard/vehicles")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Go Back
        </button>
      </div>
    </div>
  );

  const cfg = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.inactive;
  const overdue = (date) => date && new Date(date) < new Date();

  return (
    <motion.div variants={fade} initial="hidden" animate="show" className="p-6 max-w-4xl mx-auto space-y-5">
      <BackButton />

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {editMode ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Edit Vehicle</h2>
            <button onClick={() => setEditMode(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <VehicleForm initialData={vehicle} onSubmit={handleUpdate} onCancel={() => setEditMode(false)} />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-gray-900">{vehicle.plateNumber}</h1>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {vehicle.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{vehicle.year} {vehicle.make} {vehicle.model}</p>
            </div>
            <button onClick={() => setEditMode(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors">
              <Edit2 className="h-4 w-4" /> Edit Vehicle
            </button>
          </div>

          {/* Location */}
          {vehicle.latitude && vehicle.longitude && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h2 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" /> Current Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold mb-1">Address</p>
                  <p className="text-sm font-bold text-blue-900">{vehicle.address || "Not set"}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold mb-1">GPS Coordinates</p>
                  <p className="text-sm font-bold text-blue-900 font-mono">{vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}</p>
                </div>
              </div>
              <div className="mt-3 bg-gray-200 rounded-lg h-40 flex items-center justify-center">
                <p className="text-xs text-gray-500">📍 {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}</p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoCard icon={Gauge}    iconColor="text-blue-600"   iconBg="bg-blue-100"   label="Mileage"      value={`${vehicle.mileage?.toLocaleString() || 0} km`} />
            <InfoCard icon={Fuel}     iconColor="text-green-600"  iconBg="bg-green-100"  label="Fuel Type"    value={vehicle.fuelType || "—"} valueColor="text-green-600 capitalize" />
            <InfoCard icon={Wrench}   iconColor="text-amber-600"  iconBg="bg-amber-100"  label="Last Service"
              value={vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : "Not recorded"} />
            <InfoCard icon={Calendar}
              iconColor={overdue(vehicle.nextServiceDate) ? "text-red-600" : "text-orange-600"}
              iconBg={overdue(vehicle.nextServiceDate)   ? "bg-red-100"   : "bg-orange-100"}
              label="Next Service"
              value={vehicle.nextServiceDate ? new Date(vehicle.nextServiceDate).toLocaleDateString() : "Not scheduled"}
              valueColor={overdue(vehicle.nextServiceDate) ? "text-red-600" : "text-orange-600"}
              note={overdue(vehicle.nextServiceDate) ? "⚠️ Service overdue!" : undefined} />
          </div>

          {/* Additional Info */}
          {(vehicle.vin || vehicle.registrationNumber || vehicle.insuranceExpiry || vehicle.notes) && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicle.vin && <div><p className="text-xs text-gray-500 font-semibold mb-1">VIN</p><p className="text-sm font-bold text-gray-900 break-all">{vehicle.vin}</p></div>}
                {vehicle.registrationNumber && <div><p className="text-xs text-gray-500 font-semibold mb-1">Registration</p><p className="text-sm font-bold text-gray-900">{vehicle.registrationNumber}</p></div>}
                {vehicle.insuranceExpiry && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Insurance Expiry</p>
                    <p className={`text-sm font-bold ${overdue(vehicle.insuranceExpiry) ? "text-red-600" : "text-gray-900"}`}>
                      {new Date(vehicle.insuranceExpiry).toLocaleDateString()}
                      {overdue(vehicle.insuranceExpiry) && " (⚠️ Expired)"}
                    </p>
                  </div>
                )}
              </div>
              {vehicle.notes && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 italic">"{vehicle.notes}"</p>
                </div>
              )}
            </div>
          )}

          {/* Location History */}
          {locationHistory.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Location History</h2>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {locationHistory.map((loc, i) => (
                  <div key={i} className="flex items-start justify-between rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-blue-900">📍 {loc.address || "Location"}</p>
                      <p className="text-xs text-blue-700 mt-0.5 font-mono">{loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}</p>
                    </div>
                    <p className="text-xs text-blue-500 font-semibold whitespace-nowrap ml-3">
                      {loc.timestamp ? new Date(loc.timestamp).toLocaleString() : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

