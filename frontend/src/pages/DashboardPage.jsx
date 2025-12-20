import { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

// API services for real-time data
const API_BASE_URL = "http://localhost:5001/api";

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const fetchWithAuth = async (url) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to fetch from ${url}`);
  }
  return await response.json();
};

const getVehicles = async () => {
  try {
    console.log("📍 Fetching vehicles...");
    const data = await fetchWithAuth(`${API_BASE_URL}/vehicles`);
    console.log("✅ Vehicles fetched:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Error fetching vehicles:", error);
    return [];
  }
};

const getDrivers = async () => {
  try {
    console.log("👥 Fetching drivers...");
    const data = await fetchWithAuth(`${API_BASE_URL}/drivers`);
    console.log("✅ Drivers fetched:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Error fetching drivers:", error);
    return [];
  }
};

const getAssignments = async () => {
  try {
    console.log("📋 Fetching assignments...");
    const data = await fetchWithAuth(`${API_BASE_URL}/assignments`);
    console.log("✅ Assignments fetched:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Error fetching assignments:", error);
    return [];
  }
};

const getFuelLogs = async ({ from, to }) => {
  try {
    console.log("⛽ Fetching fuel logs...");
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const data = await fetchWithAuth(
      `${API_BASE_URL}/fuels?${params.toString()}`
    );
    console.log("✅ Fuel logs fetched:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Error fetching fuel logs:", error);
    return [];
  }
};

const getMaintenance = async ({ from, to }) => {
  try {
    console.log("🔧 Fetching maintenance records...");
    const data = await fetchWithAuth(`${API_BASE_URL}/maintenance`);
    console.log("✅ Maintenance records fetched:", data);

    if (!Array.isArray(data)) {
      console.warn("Maintenance data is not an array:", data);
      return [];
    }

    // Filter by date range if provided
    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      return data.filter((record) => {
        try {
          const dateValue =
            record?.date || record?.dueDate || record?.createdAt;
          if (!dateValue) return false;
          const recordDate = new Date(dateValue);
          if (isNaN(recordDate.getTime())) return false;
          if (fromDate && recordDate < fromDate) return false;
          if (toDate && recordDate > toDate) return false;
          return true;
        } catch (error) {
          console.warn("Error filtering maintenance record:", error);
          return false;
        }
      });
    }
    return data;
  } catch (error) {
    console.error("❌ Error fetching maintenance:", error);
    return [];
  }
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const [fuelData, setFuelData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [vehicleStatusData, setVehicleStatusData] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [renderError, setRenderError] = useState(false);
  const scrollContainerRef = useRef(null);

  const navigate = useNavigate();
  const { logout, currentUser: user } = useAuth();

  // Scroll handler for Real-Time Features
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Width of card + gap
      const newPosition =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;
      scrollContainerRef.current.scrollLeft = newPosition;
      setScrollPosition(newPosition);
    }
  };

  // Fetch data with real-time updates
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 2000,
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: getDrivers,
    refetchInterval: 5000,
    staleTime: 2000,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: getAssignments,
    refetchInterval: 5000,
    staleTime: 2000,
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
    refetchInterval: 5000,
    staleTime: 2000,
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
    refetchInterval: 5000,
    staleTime: 2000,
  });

  // Fetch upcoming scheduled maintenance for KPI card
  const {
    data: upcomingScheduledMaintenance = [],
    isLoading: upcomingMaintenanceLoading,
  } = useQuery({
    queryKey: ["maintenance-scheduled-upcoming"],
    queryFn: async () => {
      try {
        const data = await fetchWithAuth(
          `${API_BASE_URL}/maintenance/scheduled/upcoming?days=30`
        );
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching upcoming maintenance:", error);
        return [];
      }
    },
    refetchInterval: 5000,
    staleTime: 2000,
  });

  // Process fuel chart data
  useEffect(() => {
    if (fuelLogs && fuelLogs.length > 0) {
      try {
        const dailyTotals = fuelLogs.reduce((acc, log) => {
          try {
            const dateValue = log?.date || log?.createdAt;
            if (!dateValue) return acc;

            const dateObj = new Date(dateValue);
            if (isNaN(dateObj.getTime())) return acc;

            // Use toLocaleDateString instead of date-fns format
            const date = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            if (!acc[date]) acc[date] = 0;
            const cost = parseFloat(log?.cost) || 0;
            if (!isNaN(cost)) acc[date] += cost;
          } catch (error) {
            console.warn("Invalid date in fuel log:", error);
          }
          return acc;
        }, {});

        setFuelData(
          Object.entries(dailyTotals).map(([date, cost]) => ({ date, cost }))
        );
      } catch (error) {
        console.error("Error processing fuel data:", error);
        setFuelData([]);
      }
    }
  }, [fuelLogs]);

  // Process maintenance chart data
  useEffect(() => {
    if (Array.isArray(maintenanceRecords) && maintenanceRecords.length > 0) {
      try {
        const byType = maintenanceRecords.reduce((acc, record) => {
          try {
            const type = record?.description?.split(" ")[0] || "Other";
            const cost = parseFloat(record?.cost) || 0;
            if (!isNaN(cost)) {
              if (!acc[type]) acc[type] = 0;
              acc[type] += cost;
            }
          } catch (error) {
            console.warn("Error processing maintenance record:", error);
          }
          return acc;
        }, {});

        setMaintenanceData(
          Object.entries(byType).map(([type, cost]) => ({ type, cost }))
        );
      } catch (error) {
        console.error("Error processing maintenance data:", error);
        setMaintenanceData([]);
      }
    }
  }, [maintenanceRecords]);

  // Process vehicle status data
  useEffect(() => {
    if (Array.isArray(vehicles) && vehicles.length > 0) {
      try {
        const statusCounts = vehicles.reduce((acc, vehicle) => {
          acc[vehicle?.status] = (acc[vehicle?.status] || 0) + 1;
          return acc;
        }, {});

        setVehicleStatusData(
          Object.entries(statusCounts).map(([status, count]) => ({
            name: status?.charAt(0).toUpperCase() + status?.slice(1),
            value: count,
          }))
        );
      } catch (error) {
        console.error("Error processing vehicle status data:", error);
        setVehicleStatusData([]);
      }
    }
  }, [vehicles]);

  // Calculate KPIs with real data
  const totalVehicles = Array.isArray(vehicles) ? vehicles.length : 0;
  const activeVehicles = Array.isArray(vehicles)
    ? vehicles.filter((v) => v?.status === "active")?.length || 0
    : 0;
  const availableDrivers = Array.isArray(drivers)
    ? drivers.filter((d) => d?.status === "available")?.length || 0
    : 0;
  const activeAssignments = Array.isArray(assignments)
    ? assignments.filter((a) => a?.isActive)?.length || 0
    : 0;
  const vehiclesInMaintenance = Array.isArray(vehicles)
    ? vehicles.filter((v) => v?.status === "maintenance")?.length || 0
    : 0;

  const totalFuelCost = Array.isArray(fuelLogs)
    ? fuelLogs.reduce((sum, log) => {
        const cost = parseFloat(log?.cost) || 0;
        return !isNaN(cost) ? sum + cost : sum;
      }, 0)
    : 0;

  const totalMaintenanceCost = Array.isArray(maintenanceRecords)
    ? maintenanceRecords.reduce((sum, rec) => {
        const cost = parseFloat(rec?.cost) || 0;
        return !isNaN(cost) ? sum + cost : sum;
      }, 0)
    : 0;

  // Get upcoming maintenance count from scheduled maintenance data
  const upcomingMaintenance = Array.isArray(upcomingScheduledMaintenance)
    ? upcomingScheduledMaintenance.length
    : 0;

  // Calculate trends (using percentage change calculation)
  const calculateTrend = (current, previous) => {
    try {
      if (!Number.isFinite(current) || !Number.isFinite(previous)) {
        return { value: 0, isPositive: true };
      }
      if (previous === 0) return { value: 0, isPositive: current >= 0 };
      const change = ((current - previous) / previous) * 100;
      const value = Math.round(change * 10) / 10;
      if (!Number.isFinite(value)) return { value: 0, isPositive: true };
      return { value, isPositive: change >= 0 };
    } catch (error) {
      console.warn("Error calculating trend:", error);
      return { value: 0, isPositive: true };
    }
  };

  // Placeholder previous values for trend - in production, fetch from backend
  const vehicleTrend = calculateTrend(
    totalVehicles,
    totalVehicles > 0 ? totalVehicles - 1 : 3
  );
  const driverTrend = calculateTrend(
    availableDrivers,
    availableDrivers > 0 ? availableDrivers + 1 : 1
  );
  const assignmentTrend = calculateTrend(
    activeAssignments,
    activeAssignments > 0 ? activeAssignments - 1 : 2
  );
  const maintenanceTrend = calculateTrend(
    vehiclesInMaintenance,
    vehiclesInMaintenance > 0 ? vehiclesInMaintenance - 1 : 1
  );
  const fuelCostTrend = calculateTrend(
    totalFuelCost,
    totalFuelCost > 0 ? totalFuelCost - 50 : 169.25
  );
  const upcomingTrend = calculateTrend(upcomingMaintenance, 1);

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

  try {
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
                    {startOfWeek(new Date()).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    –{" "}
                    {endOfWeek(new Date()).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
              loading={upcomingMaintenanceLoading}
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

            {/* Scrollable Container with Controls */}
            <div className="relative group">
              {/* Left Scroll Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleScroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-xl hover:bg-white shadow-xl rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20"
              >
                <ChevronLeft className="h-5 w-5 text-blue-600" />
              </motion.button>

              {/* Right Scroll Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleScroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-xl hover:bg-white shadow-xl rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20"
              >
                <ChevronRight className="h-5 w-5 text-blue-600" />
              </motion.button>

              {/* Scrollable Cards Container */}
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-hidden scroll-smooth pb-2"
              >
                {/* Card 1: Live Tracking */}
                <Link
                  to="/dashboard/tracking"
                  className="no-underline min-w-max"
                >
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="w-80 h-full border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden group cursor-pointer">
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
                          Real-time vehicle locations and driver tracking with
                          live updates
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:gap-3 gap-2 transition-all">
                          View Tracking <ChevronRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>

                {/* Card 2: Messages */}
                <Link
                  to="/dashboard/messages"
                  className="no-underline min-w-max"
                >
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="w-80 h-full border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden group cursor-pointer">
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
                          Real-time chat with drivers, managers, and team
                          members
                        </p>
                        <div className="flex items-center text-emerald-600 text-sm font-semibold group-hover:gap-3 gap-2 transition-all">
                          Open Chat <ChevronRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>

                {/* Card 3: Maintenance */}
                <Link
                  to="/dashboard/maintenance"
                  className="no-underline min-w-max"
                >
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="w-80 h-full border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden group cursor-pointer">
                      <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardHeader className="pb-3 relative z-10">
                        <CardTitle className="flex items-center gap-3 text-lg font-bold">
                          <div className="bg-linear-to-br from-orange-500 to-red-600 p-2.5 rounded-xl">
                            <Wrench className="h-5 w-5 text-white" />
                          </div>
                          Maintenance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          Schedule and track vehicle maintenance tasks and
                          repairs
                        </p>
                        <div className="flex items-center text-orange-600 text-sm font-semibold group-hover:gap-3 gap-2 transition-all">
                          Manage Maintenance{" "}
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>

                {/* Card 4: Notifications */}
                <Link
                  to="/dashboard/notifications"
                  className="no-underline min-w-max"
                >
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="w-80 h-full border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden group cursor-pointer">
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

                {/* Card 5: Vehicles */}
                <Link
                  to="/dashboard/vehicles"
                  className="no-underline min-w-max"
                >
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="w-80 h-full border border-white/20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden group cursor-pointer">
                      <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardHeader className="pb-3 relative z-10">
                        <CardTitle className="flex items-center gap-3 text-lg font-bold">
                          <div className="bg-linear-to-br from-purple-500 to-pink-600 p-2.5 rounded-xl">
                            <Truck className="h-5 w-5 text-white" />
                          </div>
                          Vehicles
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          Manage fleet vehicles with location tracking and
                          details
                        </p>
                        <div className="flex items-center text-purple-600 text-sm font-semibold group-hover:gap-3 gap-2 transition-all">
                          View Fleet <ChevronRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </div>
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
                    <p className="text-sm font-medium">
                      No fuel data this week
                    </p>
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
                      <Bar
                        dataKey="cost"
                        fill="#1d4ed8"
                        radius={[4, 4, 0, 0]}
                      />
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
                </div>
              </CardHeader>
              <CardContent>
                {maintenanceLoading ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
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
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {maintenanceRecords.map((record) => (
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
                              {record.dueDate
                                ? new Date(record.dueDate).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric" }
                                  )
                                : "N/A"}
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
                        Due:{" "}
                        {new Date(
                          new Date().getTime() - 2 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
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
                        Last refuel:{" "}
                        {new Date(
                          new Date().getTime() - 5 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
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
                        Completed:{" "}
                        {new Date().toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
  } catch (error) {
    console.error("Dashboard render error:", error);
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <Card className="bg-red-50 border-2 border-red-300 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-800">Dashboard Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              An error occurred while loading the dashboard.
            </p>
            <details className="text-sm text-red-600 font-mono bg-red-100 p-3 rounded overflow-auto max-h-40">
              <summary>Error details</summary>
              <pre>{error?.toString()}</pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

function KpiCard({
  title,
  value,
  icon: Icon,
  trend = { value: 0, isPositive: true },
  loading,
  warning,
  color,
}) {
  const colorMap = {
    blue: "bg-linear-to-br from-blue-500 to-indigo-600",
    green: "bg-linear-to-br from-emerald-500 to-teal-600",
    indigo: "bg-linear-to-br from-indigo-500 to-purple-600",
    amber: "bg-linear-to-br from-amber-500 to-orange-600",
    red: "bg-linear-to-br from-red-500 to-rose-600",
    purple: "bg-linear-to-br from-purple-500 to-pink-600",
  };

  try {
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
  } catch (error) {
    console.error("Error rendering KPI card:", error);
    return (
      <Card className="bg-red-50 border border-red-200 rounded-2xl shadow-xl relative min-h-[170px]">
        <CardContent className="pt-8">
          <div className="text-center">
            <p className="text-sm text-red-600 font-semibold">
              Error loading {title}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
}
