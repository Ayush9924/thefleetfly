import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  MapPin,
  Truck,
  User,
  Wrench,
  Fuel,
  Clock,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Bell,
  CheckCircle,
  Info,
  LogOut,
  Settings,
  User as UserIcon,
  MessageSquare,
  Sparkles,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

// Mock API services (replace with your real ones)
const getVehicles = () =>
  Promise.resolve([
    { _id: "1", plateNumber: "ABC-123", status: "active" },
    { _id: "2", plateTime: "XYZ-789", status: "maintenance" },
    { _id: "3", plateNumber: "DEF-456", status: "active" },
  ]);
const getDrivers = () =>
  Promise.resolve([
    { _id: "1", name: "John Smith", status: "available" },
    { _id: "2", name: "Maria Garcia", status: "on-duty" },
  ]);
const getAssignments = () =>
  Promise.resolve([
    { _id: "1", driver: "John Smith", isActive: true },
    { _id: "2", driver: "Maria Garcia", isActive: true },
  ]);
const getFuelLogs = ({ from, to }) =>
  Promise.resolve([
    { _id: "1", date: new Date(), cost: 120.5, vehicle: "ABC-123" },
    { _id: "2", date: subDays(new Date(), 1), cost: 98.75, vehicle: "DEF-456" },
  ]);
const getMaintenance = ({ from, to }) =>
  Promise.resolve([
    {
      _id: "1",
      description: "Oil Change",
      cost: 75,
      dueDate: new Date(),
      status: "pending",
      vehicle: { plateNumber: "ABC-123" },
    },
    {
      _id: "2",
      description: "Brake Service",
      cost: 220,
      dueDate: subDays(new Date(), 2),
      status: "completed",
      vehicle: { plateNumber: "XYZ-789" },
    },
  ]);

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const [fuelData, setFuelData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [vehicleStatusData, setVehicleStatusData] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Fetch data
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: getDrivers,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: getAssignments,
  });

  const { data: fuelLogs, isLoading: fuelLogsLoading } = useQuery({
    queryKey: [
      "fuel-logs",
      {
        from: startOfWeek(new Date()).toISOString(),
        to: endOfWeek(new Date()).toISOString(),
      },
    ],
    queryFn: () =>
      getFuelLogs({
        from: startOfWeek(new Date()).toISOString(),
        to: endOfWeek(new Date()).toISOString(),
      }),
  });

  const { data: maintenanceRecords, isLoading: maintenanceLoading } = useQuery({
    queryKey: [
      "maintenance",
      {
        from: startOfWeek(new Date()).toISOString(),
        to: endOfWeek(new Date()).toISOString(),
      },
    ],
    queryFn: () =>
      getMaintenance({
        from: startOfWeek(new Date()).toISOString(),
        to: endOfWeek(new Date()).toISOString(),
      }),
  });

  // Process fuel chart data
  useEffect(() => {
    if (fuelLogs) {
      const dailyTotals = fuelLogs.reduce((acc, log) => {
        const date = format(new Date(log.date), "MMM dd");
        if (!acc[date]) acc[date] = 0;
        acc[date] += log.cost;
        return acc;
      }, {});

      setFuelData(
        Object.entries(dailyTotals).map(([date, cost]) => ({ date, cost }))
      );
    }
  }, [fuelLogs]);

  // Process maintenance chart data
  useEffect(() => {
    if (maintenanceRecords) {
      const byType = maintenanceRecords.reduce((acc, record) => {
        const type = record.description.split(" ")[0];
        if (!acc[type]) acc[type] = 0;
        acc[type] += record.cost;
        return acc;
      }, {});

      setMaintenanceData(
        Object.entries(byType).map(([type, cost]) => ({ type, cost }))
      );
    }
  }, [maintenanceRecords]);

  // Process vehicle status data
  useEffect(() => {
    if (vehicles) {
      const statusCounts = vehicles.reduce((acc, vehicle) => {
        acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
        return acc;
      }, {});

      setVehicleStatusData(
        Object.entries(statusCounts).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
        }))
      );
    }
  }, [vehicles]);

  // Calculate KPIs
  const totalVehicles = vehicles?.length || 0;
  const activeVehicles =
    vehicles?.filter((v) => v.status === "active")?.length || 0;
  const availableDrivers =
    drivers?.filter((d) => d.status === "available")?.length || 0;
  const activeAssignments = assignments?.filter((a) => a.isActive)?.length || 0;
  const vehiclesInMaintenance =
    vehicles?.filter((v) => v.status === "maintenance")?.length || 0;
  const totalFuelCost = fuelLogs?.reduce((sum, log) => sum + log.cost, 0) || 0;
  const totalMaintenanceCost =
    maintenanceRecords?.reduce((sum, rec) => sum + rec.cost, 0) || 0;
  const upcomingMaintenance =
    maintenanceRecords?.filter(
      (rec) =>
        new Date(rec.dueDate) <= subDays(new Date(), 7) &&
        rec.status === "pending"
    ).length || 0;

  const calculateTrend = (current, previous) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: change, isPositive: change >= 0 };
  };

  const vehicleTrend = calculateTrend(totalVehicles, totalVehicles - 1);
  const driverTrend = calculateTrend(availableDrivers, availableDrivers - 1);
  const assignmentTrend = calculateTrend(
    activeAssignments,
    activeAssignments - 1
  );
  const maintenanceTrend = calculateTrend(
    vehiclesInMaintenance,
    vehiclesInMaintenance + 1
  );
  const fuelCostTrend = calculateTrend(totalFuelCost, totalFuelCost - 50);
  const upcomingTrend = calculateTrend(
    upcomingMaintenance,
    upcomingMaintenance - 1
  );

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu")) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative background blur effects */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 space-y-8">
        {/* Header with animated icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-40 overflow-visible bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Animated Dashboard Icon */}
              <motion.div
                animate={{
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="bg-linear-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg"
              >
                <LayoutDashboard className="h-8 w-8 text-white" />
              </motion.div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome back, {user?.name || "User"}!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Date Range */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl px-4 py-2.5 shadow-sm"
              >
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700 font-semibold">
                  {format(startOfWeek(new Date()), "MMM dd")} –{" "}
                  {format(endOfWeek(new Date()), "MMM dd, yyyy")}
                </span>
              </motion.div>

              {/* User Menu */}
              <div className="relative user-menu z-50">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/50 hover:bg-blue-100 rounded-xl px-4 py-2.5 shadow-sm font-semibold"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <UserIcon className="h-5 w-5 text-blue-600" />
                    <span className="hidden sm:inline text-sm">
                      {user?.name || "User"}
                    </span>
                  </Button>
                </motion.div>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 mt-3 w-56 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 py-2 z-100"
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 flex items-center gap-3 font-medium transition-all"
                    >
                      <Settings className="h-4 w-4 text-blue-600" />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium transition-all rounded-b-2xl"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <KpiCard
            title="Total Vehicles"
            value={totalVehicles}
            icon={Truck}
            trend={vehicleTrend}
            loading={vehiclesLoading}
            color="blue"
          />
          <KpiCard
            title="Available Drivers"
            value={availableDrivers}
            icon={User}
            trend={driverTrend}
            loading={driversLoading}
            color="green"
          />
          <KpiCard
            title="Active Assignments"
            value={activeAssignments}
            icon={MapPin}
            trend={assignmentTrend}
            loading={assignmentsLoading}
            color="indigo"
          />
          <KpiCard
            title="In Maintenance"
            value={vehiclesInMaintenance}
            icon={Wrench}
            trend={maintenanceTrend}
            loading={vehiclesLoading}
            warning={vehiclesInMaintenance > 0}
            color="amber"
          />
          <KpiCard
            title="Fuel Cost This Week"
            value={`$${totalFuelCost.toFixed(2)}`}
            icon={Fuel}
            trend={fuelCostTrend}
            loading={fuelLogsLoading}
            color="red"
          />
          <KpiCard
            title="Upcoming Maintenance"
            value={upcomingMaintenance}
            icon={Clock}
            trend={upcomingTrend}
            loading={maintenanceLoading}
            warning={upcomingMaintenance > 0}
            color="purple"
          />
        </div>

        {/* Quick Access Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 10, 0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-linear-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg"
            >
              <Sparkles className="h-6 w-6 text-white" />
            </motion.div>
            <h2 className="text-2xl font-black text-gray-900">
              Real-Time Features
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Live Tracking */}
            <Link to="/dashboard/tracking" className="no-underline">
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="pb-3 relative z-10">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold">
                      <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      Live Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Real-time vehicle locations and driver tracking with live
                      updates
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:gap-3 gap-2 transition-all">
                      View Tracking <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            {/* Card 2: Messages */}
            <Link to="/dashboard/messages" className="no-underline">
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="pb-3 relative z-10">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold">
                      <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Real-time chat with drivers, managers, and team members
                    </p>
                    <div className="flex items-center text-emerald-600 text-sm font-semibold group-hover:gap-3 gap-2 transition-all">
                      Open Chat <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            {/* Card 3: Notifications */}
            <Link to="/dashboard/notifications" className="no-underline">
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="pb-3 relative z-10">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold">
                      <div className="bg-linear-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl">
                        <Bell className="h-5 w-5 text-white" />
                      </div>
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Real-time alerts for vehicle alerts, maintenance, and
                      assignments
                    </p>
                    <div className="flex items-center text-amber-600 text-sm font-semibold group-hover:gap-3 gap-2 transition-all">
                      View Alerts <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Charts Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="overflow-hidden border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl">
            <CardHeader className="pb-4 bg-linear-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Fuel Cost Trend
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-600 hover:text-blue-600 font-semibold hover:bg-blue-50 rounded-lg"
                >
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              {fuelLogsLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="animate-pulse bg-gray-200 rounded-full h-8 w-24 mb-4"></div>
                    <div className="animate-pulse bg-gray-200 rounded h-2 w-48"></div>
                  </div>
                </div>
              ) : fuelData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-500">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Fuel className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">No fuel data this week</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={fuelData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      content={({ payload, label }) => (
                        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
                          <p className="text-sm font-medium mb-1">{label}</p>
                          <p className="text-sm text-blue-600 font-semibold">
                            ${payload?.[0]?.value?.toFixed(2) || "0"}
                          </p>
                        </div>
                      )}
                    />
                    <Bar dataKey="cost" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl">
            <CardHeader className="pb-4 bg-linear-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Vehicle Status
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-600 hover:text-blue-600 font-semibold hover:bg-blue-50 rounded-lg"
                >
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              {vehiclesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="animate-pulse bg-gray-200 rounded-full h-8 w-24 mb-4"></div>
                    <div className="animate-pulse bg-gray-200 rounded h-2 w-48"></div>
                  </div>
                </div>
              ) : vehicleStatusData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-500">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">No vehicles added</p>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <PieChart width={250} height={250}>
                    <Pie
                      data={vehicleStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={60}
                      dataKey="value"
                      cornerRadius={10}
                    >
                      {vehicleStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === "Active"
                              ? "#10b981"
                              : entry.name === "Maintenance"
                              ? "#f59e0b"
                              : "#2563eb"
                          }
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ payload }) => (
                        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
                          <p className="text-sm font-medium">
                            {payload?.[0]?.name}
                          </p>
                          <p className="text-sm text-blue-600 font-semibold">
                            {payload?.[0]?.value} vehicles
                          </p>
                        </div>
                      )}
                    />
                    <Legend
                      formatter={(value) => (
                        <span className="text-sm text-gray-700">{value}</span>
                      )}
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="overflow-hidden border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl">
            <CardHeader className="pb-4 bg-linear-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                    <Wrench className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Maintenance This Week
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-600 hover:text-blue-600 font-semibold hover:bg-blue-50 rounded-lg"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {maintenanceLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : maintenanceRecords && maintenanceRecords.length > 0 ? (
                <div className="space-y-4">
                  {maintenanceRecords.slice(0, 3).map((record) => (
                    <div
                      key={record._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <Wrench className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium hover:text-blue-600 transition-colors">
                            {record.description}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {record.vehicle?.plateNumber} • Due:{" "}
                            {format(new Date(record.dueDate), "MMM dd")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${record.cost.toFixed(2)}
                        </p>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            record.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {record.status.charAt(0).toUpperCase() +
                            record.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center text-gray-500">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Wrench className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">
                    No maintenance this week
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl">
            <CardHeader className="pb-4 bg-linear-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Recent Alerts
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-600 hover:text-blue-600 font-semibold hover:bg-blue-50 rounded-lg"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-700">
                      Maintenance Due
                    </h4>
                    <p className="text-sm text-gray-600">
                      Vehicle ABC-123 requires oil change. Due date passed 2
                      days ago.
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      Due: {format(subDays(new Date(), 2), "MMM dd")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-700">Low Fuel</h4>
                    <p className="text-sm text-gray-600">
                      Vehicle XYZ-789 has low fuel level after long trip.
                    </p>
                    <p className="text-xs text-yellow-500 mt-1">
                      Last refuel: {format(subDays(new Date(), 5), "MMM dd")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-700">
                      Route Completed
                    </h4>
                    <p className="text-sm text-gray-600">
                      Driver John Smith completed delivery route with 100%
                      efficiency.
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Completed: {format(new Date(), "MMM dd, HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend, loading, warning, color }) {
  const colorMap = {
    blue: "bg-linear-to-br from-blue-500 to-indigo-600",
    green: "bg-linear-to-br from-emerald-500 to-teal-600",
    indigo: "bg-linear-to-br from-indigo-500 to-purple-600",
    amber: "bg-linear-to-br from-amber-500 to-orange-600",
    red: "bg-linear-to-br from-red-500 to-rose-600",
    purple: "bg-linear-to-br from-purple-500 to-pink-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card
        className={`overflow-hidden border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl relative min-h-[170px] ${
          warning ? "ring-2 ring-red-400/50 ring-offset-2" : ""
        }`}
      >
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        {/* Icon positioned absolutely to avoid overlap */}
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className={`absolute top-4 right-4 h-10 w-10 rounded-xl flex items-center justify-center ${colorMap[color]} shadow-lg z-10 cursor-pointer`}
        >
          <Icon className="h-5 w-5 text-white" />
        </motion.div>

        <CardHeader className="pb-2 relative z-10 pr-16">
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10 pt-1 space-y-2">
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 w-24 bg-linear-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-4 w-20 bg-linear-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-black text-gray-900 leading-none">
                {warning ? (
                  <span className="text-red-600 flex items-center gap-2">
                    {value}{" "}
                    <AlertTriangle className="h-4 w-4 animate-pulse shrink-0" />
                  </span>
                ) : (
                  value
                )}
              </div>
              <div className="flex items-center gap-1 pt-1">
                <div
                  className={`flex items-center text-xs font-bold ${
                    trend.isPositive ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? (
                    <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                  )}
                  {Math.abs(trend.value).toFixed(1)}%
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  vs last week
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
