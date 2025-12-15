import { useState } from 'react';
import { X } from 'lucide-react';

export function MaintenanceScheduler({ vehicles, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    vehicle: '',
    description: '',
    cost: '',
    scheduleType: 'one-time',
    frequency: 'monthly',
    scheduledDate: '',
    recurrenceEndDate: '',
    maintenanceType: 'routine',
    estimatedDuration: '',
    priority: 'medium',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicle) newErrors.vehicle = 'Vehicle is required';
    if (!formData.description || formData.description.length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }
    
    // Validate cost - must be a valid positive number
    const costValue = parseFloat(formData.cost);
    if (!formData.cost || isNaN(costValue) || costValue < 0) {
      newErrors.cost = 'Cost must be a valid positive number';
    }
    
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
    if (formData.scheduleType === 'recurring') {
      if (!formData.frequency) newErrors.frequency = 'Frequency is required';
      if (!formData.recurrenceEndDate) newErrors.recurrenceEndDate = 'End date is required for recurring maintenance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        vehicle: '',
        description: '',
        cost: '',
        scheduleType: 'one-time',
        frequency: 'monthly',
        scheduledDate: '',
        recurrenceEndDate: '',
        maintenanceType: 'routine',
        estimatedDuration: '',
        priority: 'medium',
        notes: ''
      });
      setErrors({});
    } catch (error) {
      // Error is handled by parent component
      console.error('Form submission error:', error);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Row 1: Vehicle and Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle <span className="text-red-500">*</span>
          </label>
          <select
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.vehicle ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={!vehicles || vehicles.length === 0}
          >
            <option value="">
              {!vehicles || vehicles.length === 0 ? 'No vehicles available' : 'Select a vehicle'}
            </option>
            {vehicles && vehicles.length > 0 && vehicles.map(v => (
              <option key={v._id} value={v._id}>
                {v.plateNumber} - {v.make} {v.model}
              </option>
            ))}
          </select>
          {errors.vehicle && <p className="text-red-500 text-sm mt-1">{errors.vehicle}</p>}
          {(!vehicles || vehicles.length === 0) && (
            <p className="text-amber-600 text-sm mt-1">
              ⚠️ Please add vehicles first before creating maintenance schedules
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Oil change, tire rotation, etc."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>

      {/* Row 2: Cost and Scheduled Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.cost ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scheduled Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            min={getMinDate()}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.scheduledDate && <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>}
        </div>
      </div>

      {/* Row 3: Schedule Type and Frequency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Schedule Type <span className="text-red-500">*</span>
          </label>
          <select
            name="scheduleType"
            value={formData.scheduleType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="one-time">One-Time</option>
            <option value="recurring">Recurring</option>
          </select>
        </div>

        {formData.scheduleType === 'recurring' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency <span className="text-red-500">*</span>
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.frequency ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semi-annual">Semi-Annual</option>
              <option value="annual">Annual</option>
            </select>
            {errors.frequency && <p className="text-red-500 text-sm mt-1">{errors.frequency}</p>}
          </div>
        )}
      </div>

      {/* Row 4: Maintenance Type and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
          <select
            name="maintenanceType"
            value={formData.maintenanceType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="routine">Routine</option>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
            <option value="predictive">Predictive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Row 5: Estimated Duration and Recurrence End Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Duration (hours)
          </label>
          <input
            type="number"
            name="estimatedDuration"
            value={formData.estimatedDuration}
            onChange={handleChange}
            placeholder="2"
            min="0"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {formData.scheduleType === 'recurring' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurrence End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="recurrenceEndDate"
              value={formData.recurrenceEndDate}
              onChange={handleChange}
              min={formData.scheduledDate}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.recurrenceEndDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.recurrenceEndDate && <p className="text-red-500 text-sm mt-1">{errors.recurrenceEndDate}</p>}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional maintenance notes..."
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
        >
          {loading ? 'Creating...' : 'Create Schedule'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
