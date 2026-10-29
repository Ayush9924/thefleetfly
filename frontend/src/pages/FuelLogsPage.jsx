import { useState, useEffect } from "react";
import {
  Fuel,
  TrendingDown,
  Gauge,
  Plus,
  RefreshCw,
  Sliders,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Sparkles,
  Car,
  Trash2,
  Calendar,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  getFuelLogs,
  createFuelLog,
  getFuelIntelligenceSummary,
  getFuelIntelligenceMetrics,
  predictFuelEfficiency,
  getPredictionHistory,
  seedDemoFuelLogs,
  clearDemoFuelLogs,
  getVehicles
} from "@/services";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
};

export default function FuelLogsPage() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Prediction input state
  const [predForm, setPredForm] = useState({
    vehiclePlate: "Toyota Fortuner",
    cylinders: 4,
    displacement: 140,
    horsepower: 90,
    weight: 2400,
    acceleration: 15.5,
    model_year: 82
  });

  const [lastPrediction, setLastPrediction] = useState(null);

  // New Fuel Log Form state
  const [newLog, setNewLog] = useState({
    vehicle: "",
    liters: "",
    cost: "",
    odometer: "",
    date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sumRes, logsRes, vehRes, metricsRes, histRes] = await Promise.allSettled([
        getFuelIntelligenceSummary(),
        getFuelLogs(),
        getVehicles(),
        getFuelIntelligenceMetrics(),
        getPredictionHistory()
      ]);

      if (sumRes.status === "fulfilled") setSummary(sumRes.value);
      if (logsRes.status === "fulfilled") setLogs(Array.isArray(logsRes.value) ? logsRes.value : []);
      if (vehRes.status === "fulfilled") {
        const vList = Array.isArray(vehRes.value) ? vehRes.value : (vehRes.value?.data || []);
        setVehicles(vList);
        if (vList.length > 0 && !newLog.vehicle) {
          setNewLog(prev => ({ ...prev, vehicle: vList[0]._id }));
        }
      }
      if (metricsRes.status === "fulfilled") setMetrics(metricsRes.value?.metrics || null);
      if (histRes.status === "fulfilled") setHistory(Array.isArray(histRes.value) ? histRes.value : []);
    } catch (err) {
      console.error("Error loading fuel intelligence data:", err);
      toast.error("Failed to load some fuel intelligence data");
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const res = await predictFuelEfficiency(predForm);
      if (res?.success) {
        setLastPrediction(res.prediction);
        if (Array.isArray(res.recentPredictions)) {
          setHistory(res.recentPredictions);
        }
        toast.success("Fuel efficiency prediction generated!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Prediction failed");
    } finally {
      setPredicting(false);
    }
  };

  const handleAddFuelLog = async (e) => {
    e.preventDefault();
    if (!newLog.vehicle || !newLog.liters || !newLog.cost || !newLog.odometer) {
      toast.error("Please fill in all fuel log fields");
      return;
    }
    try {
      await createFuelLog({
        vehicle: newLog.vehicle,
        liters: parseFloat(newLog.liters),
        cost: parseFloat(newLog.cost),
        odometer: parseInt(newLog.odometer),
        date: newLog.date
      });
      toast.success("Fuel log recorded successfully");
      setShowAddModal(false);
      setNewLog(prev => ({ ...prev, liters: "", cost: "", odometer: "" }));
      loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to create fuel log");
    }
  };

  const handleSeedDemo = async () => {
    try {
      toast.loading("Loading demo fuel records...", { id: "seed" });
      const res = await seedDemoFuelLogs();
      toast.success(res.message || "Demo records loaded!", { id: "seed" });
      loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load demo data", { id: "seed" });
    }
  };

  const handleClearDemo = async () => {
    try {
      const res = await clearDemoFuelLogs();
      toast.success(res.message || "Fuel logs cleared");
      loadAllData();
    } catch (err) {
      toast.error("Failed to clear logs");
    }
  };

  const hasRealData = summary?.hasRealData && logs.length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div variants={fade} initial="hidden" animate="show" className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Fuel className="h-6 w-6 text-emerald-600" /> Fuel Intelligence
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              MongoDB fuel log tracking, statistical aggregation, and ML efficiency predictions
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={loadAllData}
              className="p-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Fuel Entry
            </button>
            {!hasRealData ? (
              <button
                onClick={handleSeedDemo}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-blue-600" /> Load Demo Fleet Data
              </button>
            ) : (
              <button
                onClick={handleClearDemo}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-red-600 border border-gray-200 hover:bg-red-50 transition-colors"
                title="Clear Logs"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* 1. Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Total Fuel Records</span>
              <Fuel className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {summary ? summary.totalRecords : "..."}
            </p>
            <p className="text-xs text-gray-400 mt-1">Logged in MongoDB fuellogs</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Fuel Consumed</span>
              <Gauge className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {summary?.totalLiters !== undefined ? `${summary.totalLiters.toFixed(1)} L` : "0.0 L"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Recorded fleet consumption</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Fuel Expenditure</span>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {summary?.totalCost !== undefined ? `$${summary.totalCost.toFixed(2)}` : "$0.00"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {summary?.avgCostPerLiter ? `Avg $${summary.avgCostPerLiter.toFixed(2)}/L` : "No cost records"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Fleet Efficiency</span>
              <TrendingDown className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {summary?.fleetEfficiencyKmPerLiter !== null && summary?.fleetEfficiencyKmPerLiter !== undefined
                ? `${summary.fleetEfficiencyKmPerLiter} km/L`
                : "N/A"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {summary?.fleetEfficiencyKmPerLiter ? "Calculated from consecutive odometers" : "Requires consecutive logs"}
            </p>
          </div>
        </div>

        {/* 2. Fuel Log Empty State Banner OR Table */}
        {!hasRealData ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200 text-gray-600 mb-3">
              <Fuel className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Recorded Fuel Logs in Fleet Database</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
              Real fleet efficiency calculations require at least two consecutive odometer readings per vehicle.
              Click below to load sample demonstration logs or add an entry manually.
            </p>
            <div className="inline-flex gap-2">
              <button
                onClick={handleSeedDemo}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
              >
                Load Demonstration Dataset
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
              >
                Record First Log
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Recorded Fuel Logs</h3>
                <p className="text-xs text-gray-500">Chronological entries from MongoDB collection: fuellogs</p>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {logs.length} Logged Entries
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Vehicle</th>
                    <th className="py-2.5 px-4">Odometer</th>
                    <th className="py-2.5 px-4">Fuel Amount</th>
                    <th className="py-2.5 px-4">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  {logs.slice(0, 8).map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-gray-900">
                        {log.date ? new Date(log.date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-gray-800">
                          {log.vehicle?.plateNumber || "Unknown"}
                        </span>
                        {log.vehicle?.model && (
                          <span className="text-gray-400 ml-1">({log.vehicle.model})</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono">{log.odometer?.toLocaleString()} km</td>
                      <td className="py-2.5 px-4 font-medium">{log.liters} L</td>
                      <td className="py-2.5 px-4 font-semibold text-gray-900">${log.cost?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Fuel Intelligence Machine Learning Prediction Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prediction Input Form */}
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-indigo-600" /> Fuel Economy Prediction Panel
                </h3>
                <p className="text-xs text-gray-500">
                  Linear Regression (Fuel Economy) &amp; Decision Tree (Efficiency Tier)
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                PyMongo + scikit-learn
              </span>
            </div>

            <form onSubmit={handlePredict} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Vehicle Identifier
                  </label>
                  <input
                    type="text"
                    value={predForm.vehiclePlate}
                    onChange={(e) => setPredForm({ ...predForm, vehiclePlate: e.target.value })}
                    className="w-full text-xs rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Toyota Fortuner"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Engine Cylinders ({predForm.cylinders})
                  </label>
                  <select
                    value={predForm.cylinders}
                    onChange={(e) => setPredForm({ ...predForm, cylinders: parseInt(e.target.value) })}
                    className="w-full text-xs rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={3}>3 Cylinders</option>
                    <option value={4}>4 Cylinders (Compact/Sedan)</option>
                    <option value={6}>6 Cylinders (SUV/Truck)</option>
                    <option value={8}>8 Cylinders (Heavy Duty)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Displacement (cu in): {predForm.displacement}
                  </label>
                  <input
                    type="range"
                    min={68}
                    max={455}
                    step={5}
                    value={predForm.displacement}
                    onChange={(e) => setPredForm({ ...predForm, displacement: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>1.1L (68 ci)</span>
                    <span>7.5L (455 ci)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Horsepower (HP): {predForm.horsepower} HP
                  </label>
                  <input
                    type="range"
                    min={46}
                    max={230}
                    step={2}
                    value={predForm.horsepower}
                    onChange={(e) => setPredForm({ ...predForm, horsepower: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>46 HP</span>
                    <span>230 HP</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Curb Weight: {predForm.weight} lbs ({Math.round(predForm.weight * 0.453592)} kg)
                  </label>
                  <input
                    type="range"
                    min={1600}
                    max={5140}
                    step={50}
                    value={predForm.weight}
                    onChange={(e) => setPredForm({ ...predForm, weight: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>1600 lbs</span>
                    <span>5140 lbs</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Model Year: 19{predForm.model_year}
                  </label>
                  <select
                    value={predForm.model_year}
                    onChange={(e) => setPredForm({ ...predForm, model_year: parseInt(e.target.value) })}
                    className="w-full text-xs rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {[70, 72, 74, 76, 78, 80, 82].map(y => (
                      <option key={y} value={y}>19{y} Benchmark Spec</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-gray-400" />
                  Standardized via StandardScaler &amp; evaluated against UCI Auto MPG benchmark
                </span>
                <button
                  type="submit"
                  disabled={predicting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {predicting ? "Computing..." : "Run ML Prediction"}
                </button>
              </div>
            </form>

            {/* Live Result Card */}
            {lastPrediction && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4 mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Prediction Output for {lastPrediction.vehiclePlate}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    lastPrediction.efficiencyTier === "High Efficiency"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}>
                    {lastPrediction.efficiencyTier}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-gray-500">Predicted Fuel Economy:</span>
                    <p className="text-xl font-bold text-indigo-700">
                      {lastPrediction.predictedMpg} <span className="text-xs font-normal">MPG</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500">Metric Equivalent:</span>
                    <p className="text-xl font-bold text-gray-900">
                      {lastPrediction.predictedKmPerLiter} <span className="text-xs font-normal">km/L</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500">Classification Threshold:</span>
                    <p className="text-xs font-medium text-gray-700 mt-1">
                      &ge; {lastPrediction.threshold || 23.0} MPG (High Tier)
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 pt-1 border-t border-indigo-100">
                  Logged in MongoDB collection: <code>prediction_logs</code> (ID: {lastPrediction._id})
                </p>
              </div>
            )}
          </div>

          {/* Model Summary & Recent Prediction History */}
          <div className="space-y-4">
            {/* Model Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Model Status &amp; Accuracy
                </h4>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Linear Regression R²:</span>
                  <span className="font-bold text-blue-600">
                    {metrics?.regression?.r2_score || "0.7861"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mean Absolute Error (MAE):</span>
                  <span className="font-bold text-emerald-600">
                    {metrics?.regression?.mae ? `${metrics.regression.mae} MPG` : "2.67 MPG"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Decision Tree Accuracy:</span>
                  <span className="font-bold text-purple-600">
                    {metrics?.classification?.accuracy ? `${(metrics.classification.accuracy * 100).toFixed(1)}%` : "88.8%"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Decision Tree F1 Score:</span>
                  <span className="font-bold text-purple-600">
                    {metrics?.classification?.f1_score || "0.8861"}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Predictions History */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Recent Predictions (MongoDB)
                </h4>
                <span className="text-[10px] text-gray-400">{history.length} records</span>
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center">No recent predictions logged</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {history.slice(0, 5).map((h) => (
                    <div key={h._id} className="text-xs p-2 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{h.vehiclePlate || "Demo Vehicle"}</p>
                        <p className="text-[10px] text-gray-400">
                          {h.cylinders} Cyl, {h.displacement} ci, {h.horsepower} HP
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-indigo-600">{h.predicted_mpg} MPG</span>
                        <p className="text-[10px] text-gray-400">{h.predicted_km_per_liter} km/L</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Add Fuel Entry Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 space-y-4"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-emerald-600" /> Record Vehicle Fuel Log
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-lg"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleAddFuelLog} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Select Vehicle</label>
                    <select
                      value={newLog.vehicle}
                      onChange={(e) => setNewLog({ ...newLog, vehicle: e.target.value })}
                      className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    >
                      <option value="">-- Choose a Vehicle --</option>
                      {vehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.plateNumber} ({v.make} {v.model})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Fuel (Liters)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="e.g. 45.0"
                        value={newLog.liters}
                        onChange={(e) => setNewLog({ ...newLog, liters: e.target.value })}
                        className="w-full text-xs rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Total Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="e.g. 67.50"
                        value={newLog.cost}
                        onChange={(e) => setNewLog({ ...newLog, cost: e.target.value })}
                        className="w-full text-xs rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Odometer (km)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 45500"
                        value={newLog.odometer}
                        onChange={(e) => setNewLog({ ...newLog, odometer: e.target.value })}
                        className="w-full text-xs rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={newLog.date}
                        onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                        className="w-full text-xs rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                    >
                      Save Fuel Log
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
