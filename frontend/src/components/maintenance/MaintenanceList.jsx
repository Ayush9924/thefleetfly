import { AlertCircle, CheckCircle, Clock, Check, Trash2 } from 'lucide-react';

const PRIORITY = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

const STATUS_ICON = {
  completed: <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />,
  overdue: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
  scheduled: <Clock className="w-5 h-5 text-blue-500 shrink-0" />,
  pending: <Clock className="w-5 h-5 text-yellow-500 shrink-0" />,
};

const STATUS_COLOR = {
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  scheduled: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-gray-100 text-gray-700',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
const daysOverdue = (d) => d ? Math.max(0, Math.floor((Date.now() - new Date(d)) / 86400000)) : 0;

export function MaintenanceList({ items = [], onComplete, onCancel, loading = false, type = 'all' }) {
  if (!items.length) return (
    <div className="py-12 text-center">
      <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <p className="text-gray-500 text-sm">No maintenance records found</p>
    </div>
  );

  const showActions = type === 'upcoming' || type === 'overdue';

  return (
    <div className="space-y-3">
      {items.map(item => {
        const overdue = item.status === 'overdue' || daysOverdue(item.dueDate) > 0;
        return (
          <div key={item._id} className={`p-4 rounded-xl border-l-4 border border-gray-100 transition-shadow hover:shadow-sm ${overdue ? 'border-l-red-500 bg-red-50/50' : 'border-l-blue-400 bg-white'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {STATUS_ICON[item.status] || <Clock className="w-5 h-5 text-gray-400 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {item.vehicle?.plateNumber || 'Unknown'} — {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY[item.priority] || 'bg-gray-100 text-gray-700'}`}>{item.priority}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[item.status] || 'bg-gray-100 text-gray-700'}`}>{item.status}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    {item.maintenanceType && <p>Type: <span className="text-gray-700 font-medium">{item.maintenanceType}</span></p>}
                    {item.estimatedDuration && <p>Duration: <span className="text-gray-700 font-medium">{item.estimatedDuration}h</span></p>}
                    <p>Cost: <span className="text-gray-700 font-medium">${(item.cost || 0).toFixed(2)}</span></p>
                    <p>Due: <span className="text-gray-700 font-medium">{fmtDate(item.dueDate)}</span></p>
                  </div>
                </div>
              </div>
              {showActions && item.status !== 'completed' && (
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => onComplete(item._id)} disabled={loading} title="Mark complete"
                    className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg disabled:opacity-40 transition">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => onCancel(item._id)} disabled={loading} title="Cancel"
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg disabled:opacity-40 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}



