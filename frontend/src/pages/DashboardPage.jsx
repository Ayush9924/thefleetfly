import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
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
} from 'recharts';
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
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { useAuth } from '../contexts/AuthContext'; // Assuming you have an AuthContext

// Mock API services (replace with your real ones)
const getVehicles = () => Promise.resolve([
  { _id: '1', plateNumber: 'ABC-123', status: 'active' },
  { _id: '2', plateTime: 'XYZ-789', status: 'maintenance' },
  { _id: '3', plateNumber: 'DEF-456', status: 'active' },
]);
const getDrivers = () => Promise.resolve([
  { _id: '1', name: 'John Smith', status: 'available' },
  { _id: '2', name: 'Maria Garcia', status: 'on-duty' },
]);
const getAssignments = () => Promise.resolve([
  { _id: '1', driver: 'John Smith', isActive: true },
  { _id: '2', driver: 'Maria Garcia', isActive: true },
]);
const getFuelLogs = ({ from, to }) => Promise.resolve([
  { _id: '1', date: new Date(), cost: 120.50, vehicle: 'ABC-123' },
  { _id: '2', date: subDays(new Date(), 1), cost: 98.75, vehicle: 'DEF-456' },
]);
const getMaintenance = ({ from, to }) => Promise.resolve([
  { _id: '1', description: 'Oil Change', cost: 75, dueDate: new Date(), status: 'pending', vehicle: { plateNumber: 'ABC-123' } },
  { _id: '2', description: 'Brake Service', cost: 220, dueDate: subDays(new Date(), 2), status: 'completed', vehicle: { plateNumber: 'XYZ-789' } },
]);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
  const [fuelData, setFuelData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [vehicleStatusData, setVehicleStatusData] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navigate = useNavigate();
  const { logout, user } = useAuth(); // Assuming your AuthContext provides these

  // Fetch data
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDrivers,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: getAssignments,
  });

  const { data: fuelLogs, isLoading: fuelLogsLoading } = useQuery({
    queryKey: [
      'fuel-logs',
      { from: startOfWeek(new Date()).toISOString(), to: endOfWeek(new Date()).toISOString() },
    ],
    queryFn: () =>
      getFuelLogs({
        from: startOfWeek(new Date()).toISOString(),
        to: endOfWeek(new Date()).toISOString(),
      }),
  });

  const { data: maintenanceRecords, isLoading: maintenanceLoading } = useQuery({
    queryKey: [
      'maintenance',
      { from: startOfWeek(new Date()).toISOString(), to: endOfWeek(new Date()).toISOString() },
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
        const date = format(new Date(log.date), 'MMM dd');
        if (!acc[date]) acc[date] = 0;
        acc[date] += log.cost;
        return acc;
      }, {});

      setFuelData(Object.entries(dailyTotals).map(([date, cost]) => ({ date, cost })));
    }
  }, [fuelLogs]);

  // Process maintenance chart data
  useEffect(() => {
    if (maintenanceRecords) {
      const byType = maintenanceRecords.reduce((acc, record) => {
        const type = record.description.split(' ')[0];
        if (!acc[type]) acc[type] = 0;
        acc[type] += record.cost;
        return acc;
      }, {});

      setMaintenanceData(Object.entries(byType).map(([type, cost]) => ({ type, cost })));
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
  const activeVehicles = vehicles?.filter((v) => v.status === 'active')?.length || 0;
  const availableDrivers = drivers?.filter((d) => d.status === 'available')?.length || 0;
  const activeAssignments = assignments?.filter((a) => a.isActive)?.length || 0;
  const vehiclesInMaintenance = vehicles?.filter((v) => v.status === 'maintenance')?.length || 0;
  const totalFuelCost = fuelLogs?.reduce((sum, log) => sum + log.cost, 0) || 0;
  const totalMaintenanceCost = maintenanceRecords?.reduce((sum, rec) => sum + rec.cost, 0) || 0;
  const upcomingMaintenance =
    maintenanceRecords?.filter((rec) => new Date(rec.dueDate) <= subDays(new Date(), 7) && rec.status === 'pending')
      .length || 0;

  const calculateTrend = (current, previous) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: change, isPositive: change >= 0 };
  };

  const vehicleTrend = calculateTrend(totalVehicles, totalVehicles - 1);
  const driverTrend = calculateTrend(availableDrivers, availableDrivers - 1);
  const assignmentTrend = calculateTrend(activeAssignments, activeAssignments - 1);
  const maintenanceTrend = calculateTrend(vehiclesInMaintenance, vehiclesInMaintenance + 1);
  const fuelCostTrend = calculateTrend(totalFuelCost, totalFuelCost - 50);
  const upcomingTrend = calculateTrend(upcomingMaintenance, upcomingMaintenance - 1);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with user menu */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        
        <div className="flex items-center gap-3">
          {/* Date Range */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-2 shadow-sm">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-700 font-medium">
              {format(startOfWeek(new Date()), 'MMM dd')} – {format(endOfWeek(new Date()), 'MMM dd, yyyy')}
            </span>
          </div>
          
          {/* User Menu */}
          <div className="relative user-menu">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-gray-50"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">
                {user?.name || 'User'}
              </span>
            </Button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden card-hover border border-gray-200/50 bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold">Fuel Cost Trend</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
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
                <BarChart data={fuelData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={60} />
                  <Tooltip
                    content={({ payload, label }) => (
                      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
                        <p className="text-sm font-medium mb-1">{label}</p>
                        <p className="text-sm text-blue-600 font-semibold">
                          ${payload?.[0]?.value?.toFixed(2) || '0'}
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

        <Card className="overflow-hidden card-hover border border-gray-200/50 bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold">Vehicle Status</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
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
                          entry.name === 'Active'
                            ? '#10b981'
                            : entry.name === 'Maintenance'
                            ? '#f59e0b'
                            : '#2563eb'
                        }
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ payload }) => (
                      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
                        <p className="text-sm font-medium">{payload?.[0]?.name}</p>
                        <p className="text-sm text-blue-600 font-semibold">
                          {payload?.[0]?.value} vehicles
                        </p>
                      </div>
                    )}
                  />
                  <Legend
                    formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden card-hover border border-gray-200/50 bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold">Maintenance This Week</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {maintenanceLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                          {record.vehicle?.plateNumber} • Due: {format(new Date(record.dueDate), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${record.cost.toFixed(2)}</p>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          record.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
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
                <p className="text-sm font-medium">No maintenance this week</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden card-hover border border-gray-200/50 bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold">Recent Alerts</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-red-700">Maintenance Due</h4>
                  <p className="text-sm text-gray-600">
                    Vehicle ABC-123 requires oil change. Due date passed 2 days ago.
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    Due: {format(subDays(new Date(), 2), 'MMM dd')}
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
                    Last refuel: {format(subDays(new Date(), 5), 'MMM dd')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-700">Route Completed</h4>
                  <p className="text-sm text-gray-600">
                    Driver John Smith completed delivery route with 100% efficiency.
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Completed: {format(new Date(), 'MMM dd, HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend, loading, warning, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card
      className={`overflow-hidden card-hover border border-gray-200/50 bg-white/70 backdrop-blur-sm ${
        warning ? 'border-l-4 border-l-red-500' : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {warning ? (
                <span className="text-red-600 flex items-center">
                  {value} <AlertTriangle className="h-4 w-4 ml-1" />
                </span>
              ) : (
                value
              )}
            </div>
            <div className="flex items-center mt-2">
              <div className={`flex items-center text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {Math.abs(trend.value).toFixed(1)}%
              </div>
              <span className="text-xs text-gray-500 ml-2">vs last week</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
