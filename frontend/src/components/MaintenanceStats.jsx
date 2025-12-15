import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export function MaintenanceStats({ stats }) {
  if (!stats) return null;

  const statCards = [
    {
      label: 'Scheduled',
      value: stats.totalScheduled || 0,
      icon: Clock,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Completed',
      value: stats.totalCompleted || 0,
      icon: CheckCircle,
      color: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      label: 'Pending',
      value: stats.totalPending || 0,
      icon: AlertCircle,
      color: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'Upcoming (30d)',
      value: stats.upcomingCount || 0,
      icon: TrendingUp,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.label} className={`${stat.color} rounded-lg p-6 border border-gray-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
          </div>
        </div>
      ))}
      {stats.averageCost && (
        <div className="bg-orange-50 rounded-lg p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Average Cost</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${Math.round(stats.averageCost).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
