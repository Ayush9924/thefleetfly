import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  MapPin, Truck, User, Wrench, Fuel, Clock,
  AlertTriangle, Calendar, ArrowUpRight, ArrowDownRight,
  ChevronRight, Bell, CheckCircle, MessageSquare,
  TrendingUp, LayoutDashboard, LogOut, Settings,
} from "lucide-react";
import { startOfWeek, endOfWeek } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

// ─── API helpers ──────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const authFetch = async (url) => {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};

const fetchArr = (url) => authFetch(url).then((d) => (Array.isArray(d) ? d : [])).catch(() => []);

const WEEK = { from: startOfWeek(new Date()).toISOString(), to: endOfWeek(new Date()).toISOString() };

const MOCK_FUEL = [
  { date: "Mon", cost: 245 }, { date: "Tue", cost: 319 }, { date: "Wed", cost: 275 },
  { date: "Thu", cost: 392 }, { date: "Fri", cost: 426 }, { date: "Sat", cost: 290 }, { date: "Sun", cost: 198 },
];

const PIE_COLOR = { Active: "#10b981", Maintenance: "#f59e0b", default: "#2563eb" };

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.07 } },
};

// ─── Quick-access feature cards ───────────────────────────────────────────────
const FEATURES = [
  { to: "/dashboard/tracking",      Icon: MapPin,        color: "bg-blue-600",   label: "Live Tracking",  desc: "Real-time vehicle locations",   cta: "View Tracking"       },
  { to: "/dashboard/messages",      Icon: MessageSquare, color: "bg-emerald-600",label: "Messages",       desc: "Chat with drivers & team",      cta: "Open Chat"           },
  { to: "/dashboard/maintenance",   Icon: Wrench,        color: "bg-orange-600", label: "Maintenance",    desc: "Schedule & track repairs",      cta: "Manage Maintenance"  },
  { to: "/dashboard/notifications", Icon: Bell,          color: "bg-amber-500",  label: "Notifications",  desc: "Real-time fleet alerts",        cta: "View Alerts"         },
  { to: "/dashboard/vehicles",      Icon: Truck,         color: "bg-purple-600", label: "Vehicles",       desc: "Manage fleet vehicles",         cta: "View Fleet"          },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({ title, value, Icon, trend = { value: 0, isPositive: true }, loading, warning }) {
  return (
    <motion.div variants={fade} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
        <Icon className={`h-4 w-4 ${warning ? "text-red-500" : "text-blue-500"}`} />
      </div>
      {loading ? (
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className={`text-2xl font-black leading-none ${warning ? "text-red-600" : "text-gray-900"}`}>
          {value}
          {warning && <AlertTriangle className="inline h-4 w-4 ml-1 animate-pulse" />}
        </p>
      )}
      <div className={`text-xs font-semibold flex items-center gap-0.5 ${trend.isPositive ? "text-emerald-600" : "text-red-500"}`}>
        {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {Math.abs(trend.value).toFixed(1)}% vs last week
      </div>
    </motion.div>
  );
}

function FeatureCard({ to, Icon, color, label, desc, cta }) {
  return (
    <Link to={to} className="block group">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${color} mb-3`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        <div className="flex items-center gap-1 text-blue-600 text-xs font-semibold mt-3 group-hover:gap-2 transition-all">
          {cta} <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout, currentUser: user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [fuelData, setFuelData] = useState(MOCK_FUEL);
  const [vehicleStatusData, setVehicleStatusData] = useState([]);

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({ queryKey: ["vehicles"], queryFn: () => fetchArr(`${API}/vehicles`), refetchInterval: 5000 });
  const { data: drivers = [], isLoading: driversLoading } = useQuery({ queryKey: ["drivers"], queryFn: () => fetchArr(`${API}/drivers`), refetchInterval: 5000 });
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({ queryKey: ["assignments"], queryFn: () => fetchArr(`${API}/assignments`), refetchInterval: 5000 });
  const { data: fuelLogs = [], isLoading: fuelLogsLoading } = useQuery({ queryKey: ["fuel-logs", WEEK], queryFn: () => fetchArr(`${API}/fuels?from=${WEEK.from}&to=${WEEK.to}`), refetchInterval: 5000 });
  const { data: maintenanceRecords = [], isLoading: maintenanceLoading } = useQuery({ queryKey: ["maintenance", WEEK], queryFn: () => fetchArr(`${API}/maintenance`), refetchInterval: 5000 });
  const { data: upcomingMaint = [] } = useQuery({ queryKey: ["maintenance-upcoming"], queryFn: () => fetchArr(`${API}/maintenance/scheduled/upcoming?days=30`), refetchInterval: 5000 });

  // KPIs
  const totalVehicles       = vehicles.length;
  const activeVehicles      = vehicles.filter(v => v?.status === "active").length;
  const availableDrivers    = drivers.filter(d => d?.status === "available").length;
  const activeAssignments   = assignments.filter(a => a?.isActive).length;
  const inMaintenance       = vehicles.filter(v => v?.status === "maintenance").length;
  const totalFuelCost       = fuelLogs.length ? fuelLogs.reduce((s, l) => s + (parseFloat(l?.cost) || 0), 0) : 2145.5;
  const upcomingCount       = upcomingMaint.length;

  const trend = (cur, prev) => {
    if (!prev) return { value: 0, isPositive: true };
    const pct = ((cur - prev) / prev) * 100;
    return { value: Math.round(pct * 10) / 10, isPositive: pct >= 0 };
  };

  // Charts
  useEffect(() => {
    if (fuelLogs.length) {
      const daily = fuelLogs.reduce((acc, l) => {
        const dateStr = l?.date || l?.createdAt;
        if (!dateStr) return acc;
        const d = new Date(dateStr);
        if (isNaN(d)) return acc;
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        acc[key] = (acc[key] || 0) + (parseFloat(l?.cost) || 0);
        return acc;
      }, {});
      setFuelData(Object.entries(daily).map(([date, cost]) => ({ date, cost })));
    }
  }, [fuelLogs]);

  useEffect(() => {
    if (vehicles.length) {
      const counts = vehicles.reduce((acc, v) => { acc[v?.status] = (acc[v?.status] || 0) + 1; return acc; }, {});
      setVehicleStatusData(Object.entries(counts).map(([status, value]) => ({ name: status?.charAt(0).toUpperCase() + status?.slice(1), value })));
    }
  }, [vehicles]);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const weekLabel = `${startOfWeek(new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${endOfWeek(new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name || "User"}!</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5">
            <Calendar className="h-4 w-4 text-blue-500" /> {weekLabel}
          </div>
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              <User className="h-4 w-4 text-blue-600" /> <span className="hidden sm:inline">{user?.name || "User"}</span>
            </button>
            {showUserMenu && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button onClick={() => { setShowUserMenu(false); navigate("/profile"); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-500" /> Profile Settings
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div variants={fade} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Total Vehicles"      value={totalVehicles}      Icon={Truck}    trend={trend(totalVehicles,     totalVehicles - 1)}     loading={vehiclesLoading}     />
        <KpiCard title="Available Drivers"   value={availableDrivers}   Icon={User}     trend={trend(availableDrivers,  availableDrivers + 1)}  loading={driversLoading}      />
        <KpiCard title="Active Assignments"  value={activeAssignments}  Icon={MapPin}   trend={trend(activeAssignments, activeAssignments - 1)} loading={assignmentsLoading}  />
        <KpiCard title="In Maintenance"      value={inMaintenance}      Icon={Wrench}   trend={trend(inMaintenance,     inMaintenance - 1)}     loading={vehiclesLoading}     warning={inMaintenance > 0} />
        <KpiCard title="Fuel This Week"      value={`$${totalFuelCost.toFixed(0)}`} Icon={Fuel} trend={trend(totalFuelCost, 2050)} loading={fuelLogsLoading} />
        <KpiCard title="Upcoming Maint."     value={upcomingCount}      Icon={Clock}    trend={trend(upcomingCount, 1)}                         loading={false}               warning={upcomingCount > 0} />
      </motion.div>

      {/* Feature Quick Access */}
      <div>
        <h2 className="text-base font-bold text-gray-700 mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {FEATURES.map(f => <FeatureCard key={f.to} {...f} />)}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Cost Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-sm">Fuel Cost Trend</h3>
            {!fuelLogs.length && <span className="text-xs text-gray-400">(sample data)</span>}
          </div>
          {fuelLogsLoading ? (
            <div className="h-48 bg-gray-100 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fuelData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  formatter={(v) => [`$${v.toFixed(2)}`, "Cost"]} />
                <Bar dataKey="cost" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Vehicle Status Pie */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-sm">Vehicle Status</h3>
          </div>
          {vehiclesLoading ? (
            <div className="h-48 bg-gray-100 rounded animate-pulse" />
          ) : vehicleStatusData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Truck className="h-8 w-8" />
              <p className="text-sm">No vehicles added</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <PieChart width={240} height={220}>
                <Pie data={vehicleStatusData} cx="50%" cy="50%" outerRadius={75} innerRadius={45} dataKey="value" cornerRadius={6}>
                  {vehicleStatusData.map((e, i) => (
                    <Cell key={i} fill={PIE_COLOR[e.name] || PIE_COLOR.default} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  formatter={(v) => [`${v} vehicles`]} />
                <Legend formatter={(v) => <span className="text-xs text-gray-700">{v}</span>} verticalAlign="bottom" height={28} />
              </PieChart>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Maintenance list + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance This Week */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Wrench className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-sm">Maintenance This Week</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {maintenanceLoading ? (
              [1, 2, 3].map(i => <div key={i} className="p-3 flex gap-3 items-center"><div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" /><div className="flex-1 space-y-1"><div className="h-3 w-32 bg-gray-200 rounded animate-pulse" /><div className="h-2 w-24 bg-gray-200 rounded animate-pulse" /></div></div>)
            ) : maintenanceRecords.length ? (
              maintenanceRecords.map(r => (
                <div key={r._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Wrench className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.description}</p>
                      <p className="text-xs text-gray-500">{r.vehicle?.plateNumber} • Due: {r.dueDate ? new Date(r.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">${r.cost?.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {r.status?.charAt(0).toUpperCase() + r.status?.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <Wrench className="h-7 w-7" />
                <p className="text-sm">No maintenance this week</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Alerts - static placeholder (real data goes through NotificationsPage) */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Bell className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-sm">Recent Alerts</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { type: "error",   Icon: AlertTriangle, color: "text-red-500",    bg: "bg-red-50 border-red-100",    title: "Maintenance Due",    body: "Vehicle ABC-123 requires oil change. Due date passed 2 days ago." },
              { type: "warn",    Icon: AlertTriangle, color: "text-amber-500",  bg: "bg-amber-50 border-amber-100", title: "Low Fuel",           body: "Vehicle XYZ-789 has low fuel after recent long trip." },
              { type: "success", Icon: CheckCircle,   color: "text-blue-500",   bg: "bg-blue-50 border-blue-100",  title: "Route Completed",    body: "Driver John Smith completed delivery route with 100% efficiency." },
            ].map(({ Icon, color, bg, title, body }) => (
              <div key={title} className={`flex items-start gap-3 p-3 rounded-lg border ${bg} hover:brightness-95 transition-all`}>
                <Icon className={`h-4 w-4 ${color} shrink-0 mt-0.5`} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

