import { AlertCircle, CheckCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';

export function MaintenanceStats({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'Scheduled', value: stats.totalScheduled || 0, icon: Clock, bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Completed', value: stats.totalCompleted || 0, icon: CheckCircle, bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Pending', value: stats.totalPending || 0, icon: AlertCircle, bg: 'bg-yellow-50', text: 'text-yellow-600' },
    { label: 'Upcoming (30d)', value: stats.upcomingCount || 0, icon: TrendingUp, bg: 'bg-indigo-50', text: 'text-indigo-600' }
  ];

  if (stats.averageCost !== undefined) {
    cards.push({
      label: 'Average Cost',
      value: `$${Math.round(stats.averageCost).toLocaleString()}`,
      icon: DollarSign,
      bg: 'bg-rose-50',
      text: 'text-rose-600'
    });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`${c.bg} rounded-xl p-5 border border-white/60 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1`}>
          <div>
            <p className="text-sm font-medium text-gray-600">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
          </div>
          <c.icon className={`w-8 h-8 ${c.text} opacity-80`} />
        </div>
      ))}
    </div>
  );
}




