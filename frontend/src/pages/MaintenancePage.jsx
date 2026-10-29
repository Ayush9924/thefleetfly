import { useState, useEffect, useCallback } from "react";
import { Plus, AlertCircle, Wrench, MapPin, Fuel } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useMaintenanceScheduler from "@/hooks/useMaintenanceScheduler";
import { MaintenanceStats }     from "@/components/maintenance/MaintenanceStats";
import { MaintenanceScheduler } from "@/components/maintenance/MaintenanceScheduler";
import { MaintenanceList }       from "@/components/maintenance/MaintenanceList";
import { MaintenanceMap }        from "@/components/maintenance/MaintenanceMap";
import { getAllVehiclesLocations } from "@/services/locationService";
import api from "@/services/api";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.3 } },
};

const TABS = [
  { id: "overview",  label: "Overview" },
  { id: "upcoming",  label: "Upcoming",    badge: true },
  { id: "overdue",   label: "Overdue",     badge: true, danger: true },
  { id: "map",       label: "Fleet Map",   Icon: MapPin },
  { id: "history",   label: "History" },
];

function TabButton({ tab, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {tab.Icon && <tab.Icon className="h-3.5 w-3.5" />}
      {tab.label}
      {tab.badge && count !== undefined && (
        <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs font-bold leading-none ${
          active ? "bg-white/20 text-white" : tab.danger ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-700"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function MaintenancePage() {
  const [vehicles,        setVehicles]       = useState([]);
  const [showForm,        setShowForm]       = useState(false);
  const [activeTab,       setActiveTab]      = useState("overview");
  const [formError,       setFormError]      = useState(null);
  const [locations,       setLocations]      = useState({});
  const [loadingLocs,     setLoadingLocs]    = useState(false);

  const { data, loading, error, fetchAllData, createScheduled, complete, cancel } = useMaintenanceScheduler();

  const fetchVehicles = useCallback(async () => {
    try {
      const resp = await api.get("/vehicles");
      setVehicles(Array.isArray(resp.data) ? resp.data : []);
    } catch { setVehicles([]); }
  }, []);

  const fetchLocations = useCallback(async () => {
    setLoadingLocs(true);
    try {
      const raw = await getAllVehiclesLocations();
      const map = {};
      if (Array.isArray(raw)) raw.forEach(l => l.vehicleId && (map[l.vehicleId] = l));
      setLocations(map);
    } catch { /* silent */ }
    finally { setLoadingLocs(false); }
  }, []);

  useEffect(() => {
    fetchVehicles();
    fetchAllData();
    fetchLocations();
    const t = setInterval(fetchAllData, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (activeTab === "map") {
      fetchLocations();
      const t = setInterval(fetchLocations, 30000);
      return () => clearInterval(t);
    }
    if (activeTab === "upcoming" || activeTab === "overdue") fetchAllData();
  }, [activeTab]);

  const handleSchedule = async (formData) => {
    setFormError(null);
    try { await createScheduled(formData); setShowForm(false); await fetchAllData(); }
    catch (e) { setFormError(e.message || "Failed to schedule maintenance"); }
  };

  const handleComplete = async (id) => {
    setFormError(null);
    try { await complete(id); await fetchAllData(); }
    catch (e) { setFormError(e.message || "Failed to complete"); }
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this maintenance?")) return;
    setFormError(null);
    try { await cancel(id, "Cancelled by user"); await fetchAllData(); }
    catch (e) { setFormError(e.message || "Failed to cancel"); }
  };

  const globalError = error || formError;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="h-6 w-6 text-orange-500" /> Maintenance
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule and track vehicle maintenance</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Schedule Maintenance
        </button>
      </div>

      {/* Stats */}
      {data.stats && <MaintenanceStats stats={data.stats} />}

      {/* Fuel Intelligence Link */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <Fuel className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Looking for vehicle fuel consumption patterns or efficiency predictions?</span>
        </div>
        <Link to="/dashboard/fuels" className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 shrink-0 ml-2">
          Fuel Intelligence &rarr;
        </Link>
      </div>

      {/* Error */}
      {globalError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{globalError}</p>
        </div>
      )}

      {/* Schedule Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="form" variants={fade} initial="hidden" animate="show" exit="hidden"
            className="rounded-xl border border-orange-200 bg-orange-50 p-6"
          >
            <h2 className="text-base font-semibold text-gray-900 mb-4">Create Scheduled Maintenance</h2>
            <MaintenanceScheduler
              vehicles={vehicles}
              onSubmit={handleSchedule}
              onCancel={() => setShowForm(false)}
              loading={loading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap border-b border-gray-200 pb-0">
        {TABS.map(tab => (
          <TabButton
            key={tab.id} tab={tab} active={activeTab === tab.id}
            count={tab.id === "upcoming" ? data.upcoming?.length : tab.id === "overdue" ? data.overdue?.length : undefined}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} variants={fade} initial="hidden" animate="show">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.overdue?.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-4">
                    <AlertCircle className="h-4 w-4" /> Overdue ({data.overdue.length})
                  </h3>
                  <MaintenanceList items={data.overdue} onComplete={handleComplete} onCancel={handleCancel} loading={loading} type="overdue" />
                </div>
              )}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Maintenance</h3>
                <MaintenanceList items={data.all.slice(0, 5)} loading={loading} type="history" />
              </div>
            </div>
          )}

          {activeTab === "upcoming" && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Upcoming — Next 30 Days</h3>
              <MaintenanceList items={data.upcoming} onComplete={handleComplete} onCancel={handleCancel} loading={loading} type="upcoming" />
            </div>
          )}

          {activeTab === "overdue" && (
            <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-red-700 mb-4">Overdue Maintenance</h3>
              <MaintenanceList items={data.overdue} onComplete={handleComplete} onCancel={handleCancel} loading={loading} type="overdue" />
            </div>
          )}

          {activeTab === "history" && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Maintenance History</h3>
              <MaintenanceList items={data.all} loading={loading} type="history" />
            </div>
          )}

          {activeTab === "map" && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Fleet Location Map
                </h3>
                {loadingLocs && <span className="text-xs text-blue-600">Updating…</span>}
              </div>
              <MaintenanceMap maintenanceData={data.all} locations={locations} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

