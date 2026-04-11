import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, AlertCircle, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { vehicleService } from "@/services/vehicleService";
import { VehicleForm }    from "@/components/vehicles/VehicleForm";
import { VehicleCard }    from "@/components/vehicles/VehicleCard";
import { toast }          from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
};

const STATUSES = ["all", "active", "maintenance", "inactive", "retired"];

function StatBadge({ label, value, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function VehiclesPage() {
  const navigate = useNavigate();
  const [vehicles,        setVehicles]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]            = useState(null);
  const [showForm,        setShowForm]        = useState(false);
  const [editingVehicle,  setEditingVehicle]  = useState(null);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [filterStatus,    setFilterStatus]    = useState("all");

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.getAllVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditingVehicle(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingVehicle(null); };

  const handleAdd = async (formData) => {
    try {
      const vehicle = await vehicleService.createVehicle(formData);
      setVehicles(prev => [...prev, vehicle.data || vehicle]);
      closeForm();
      toast.success("Vehicle added");
    } catch (err) {
      toast.error(err.message || "Failed to add vehicle");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const updated = await vehicleService.updateVehicle(editingVehicle._id, formData);
      setVehicles(prev => prev.map(v => v._id === editingVehicle._id ? updated : v));
      closeForm();
      toast.success("Vehicle updated");
    } catch (err) {
      toast.error(err.message || "Failed to update vehicle");
    }
  };

  const handleDelete = async (id) => {
    try {
      await vehicleService.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v._id !== id));
      toast.success("Vehicle removed");
    } catch (err) {
      toast.error(err.message || "Failed to delete vehicle");
    }
  };

  const filtered = vehicles.filter(v => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || [v.plateNumber, v.make, v.model, v.address].some(f => f?.toLowerCase().includes(q));
    const matchStatus = filterStatus === "all" || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading && vehicles.length === 0) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" /> Vehicles
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track your fleet</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Vehicle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBadge label="Total"          value={vehicles.length}                                       color="text-gray-900" />
        <StatBadge label="Active"         value={vehicles.filter(v => v.status === "active").length}     color="text-green-600" />
        <StatBadge label="In Maintenance" value={vehicles.filter(v => v.status === "maintenance").length} color="text-yellow-600" />
        <StatBadge label="With Location"  value={vehicles.filter(v => v.latitude && v.longitude).length} color="text-blue-600" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <VehicleForm
            initialData={editingVehicle}
            onSubmit={editingVehicle ? handleUpdate : handleAdd}
            onCancel={closeForm}
          />
        </motion.div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text" placeholder="Search by plate, make, model…" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">No vehicles found</h3>
          <p className="text-sm text-gray-500 mb-4">
            {vehicles.length === 0 ? "Add your first vehicle to get started" : "Try a different search or filter"}
          </p>
          {vehicles.length === 0 && (
            <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              Add Vehicle
            </button>
          )}
        </div>
      ) : (
        <motion.div
          variants={fade} initial="hidden" animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map(vehicle => (
            <motion.div key={vehicle._id} variants={fade}>
              <VehicleCard
                vehicle={vehicle}
                onClick={id => navigate(`/dashboard/vehicles/${id}`)}
                onEdit={v => { setEditingVehicle(v); setShowForm(true); }}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

