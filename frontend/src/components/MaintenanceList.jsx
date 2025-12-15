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
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-3">
      {items.map(item => {
        const daysOverdue = getDaysOverdue(item.nextScheduledDate);
        const isOverdue = item.status === 'overdue' || daysOverdue > 0;

        return (
          <div
            key={item._id}
            className={`p-4 rounded-lg border-2 transition ${
              isOverdue
                ? 'border-red-200 bg-red-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left Section: Icon and Main Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {getStatusIcon(item.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.vehicle?.plateNumber || 'Unknown Vehicle'} - {item.description}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-4 flex-wrap text-sm text-gray-600">
                    {item.nextScheduledDate && (
                      <div>
                        <span className="font-medium">Scheduled:</span> {formatDate(item.nextScheduledDate)}
                        {isOverdue && <span className="text-red-600 font-medium ml-1">({daysOverdue}d overdue)</span>}
                      </div>
                    )}
                    {item.maintenanceType && (
                      <div>
                        <span className="font-medium">Type:</span> {item.maintenanceType}
                      </div>
                    )}
                    {item.estimatedDuration && (
                      <div>
                        <span className="font-medium">Duration:</span> {item.estimatedDuration}h
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.notes}</p>
                  )}

                  <div className="mt-2 text-sm">
                    <span className="font-medium text-gray-700">Cost: </span>
                    <span className="text-gray-900 font-semibold">${item.cost.toFixed(2)}</span>
                  </div>

                  {/* Location Status (if available) */}
                  {item.vehicle?.lastLocation && (
                    <div className="mt-3 bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                      <div className="flex items-center gap-2 mb-1.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-900">Location Status</span>
                      </div>
                      <div className="text-xs text-blue-800 space-y-0.5">
                        <p>📍 {item.vehicle.lastLocation.address || 'Location tracking active'}</p>
                        <div className="flex items-center justify-between">
                          <span>{item.vehicle.lastLocation.speed > 0 ? `🟢 Moving ${item.vehicle.lastLocation.speed.toFixed(1)} km/h` : '🟡 Parked'}</span>
                          <span className="text-blue-600">Last: {item.vehicle.lastLocation.timestamp ? new Date(item.vehicle.lastLocation.timestamp).toLocaleTimeString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
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
                      <span className="text-xs font-medium">Complete</span>
                    </button>
                    <button
                      onClick={() => onCancel(item._id)}
                      disabled={loading}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 transition flex items-center gap-1"
                      title="Cancel maintenance"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Cancel</span>
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
