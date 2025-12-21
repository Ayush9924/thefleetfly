import { AlertCircle, CheckCircle, Clock, Trash2, Check, MapPin, Navigation } from 'lucide-react';

export function MaintenanceList({
  items = [],
  onComplete,
  onCancel,
  loading = false,
  type = 'all'
}) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-lg">No maintenance records found</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'scheduled':
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-200 text-red-900';
      case 'high':
        return 'bg-orange-200 text-orange-900';
      case 'medium':
        return 'bg-yellow-200 text-yellow-900';
      case 'low':
        return 'bg-green-200 text-green-900';
      default:
        return 'bg-gray-200 text-gray-900';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-200 text-green-900';
      case 'overdue':
        return 'bg-red-200 text-red-900';
      case 'scheduled':
        return 'bg-blue-200 text-blue-900';
      case 'pending':
        return 'bg-yellow-200 text-yellow-900';
      case 'cancelled':
        return 'bg-gray-200 text-gray-900';
      default:
        return 'bg-gray-200 text-gray-900';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysOverdue = (date) => {
    if (!date) return 0;
    const days = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-4">
      {items.map(item => {
        const daysOverdue = getDaysOverdue(item.dueDate);
        const isOverdue = item.status === 'overdue' || daysOverdue > 0;

        return (
          <div
            key={item._id}
            className={`p-4 rounded-lg border-l-4 transition ${
              isOverdue
                ? 'border-l-red-500 border border-red-200 bg-red-50'
                : 'border-l-blue-500 border border-gray-200 bg-white hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(item.status)}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">
                      {item.vehicle?.plateNumber || 'Unknown Vehicle'} - {item.description}
                    </h3>
                  </div>

                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    {item.maintenanceType && (
                      <div>
                        <span className="font-medium text-gray-700">Type:</span> {item.maintenanceType}
                      </div>
                    )}
                    {item.estimatedDuration && (
                      <div>
                        <span className="font-medium text-gray-700">Duration:</span> {item.estimatedDuration}h
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700">Cost:</span> ${item.cost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section: Actions */}
              <div className="flex items-center gap-2 whitespace-nowrap">
                {(type === 'upcoming' || type === 'overdue') && item.status !== 'completed' && (
                  <>
                    <button
                      onClick={() => onComplete(item._id)}
                      disabled={loading}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 transition flex items-center gap-1"
                      title="Mark as complete"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onCancel(item._id)}
                      disabled={loading}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 transition flex items-center gap-1"
                      title="Cancel maintenance"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
