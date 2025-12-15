import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export function VehicleForm({ onSubmit, onCancel, initialData = null, loading = false }) {
  const [formData, setFormData] = useState(initialData || {
    plateNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'active',
    fuelType: 'diesel',
    mileage: 0,
    lastServiceDate: '',
    nextServiceDate: '',
    latitude: '',
    longitude: '',
    address: '',
    vin: '',
    registrationNumber: '',
    insuranceExpiry: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mileage' || name === 'year' || name === 'latitude' || name === 'longitude' 
        ? value === '' ? '' : Number(value)
        : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.plateNumber?.trim()) newErrors.plateNumber = 'Plate number is required';
    if (!formData.make?.trim()) newErrors.make = 'Make is required';
    if (!formData.model?.trim()) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Year must be between 1990 and current year + 1';
    }
    if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 35 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plate Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Plate Number *
          </label>
          <input
            type="text"
            name="plateNumber"
            value={formData.plateNumber}
            onChange={handleChange}
            placeholder="ABC-1234"
            className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none ${
              errors.plateNumber
                ? 'border-red-500 bg-red-50 focus:border-red-600'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {errors.plateNumber && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.plateNumber}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">In Maintenance</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        {/* Make */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Make *
          </label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
            placeholder="Toyota"
            className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none ${
              errors.make
                ? 'border-red-500 bg-red-50 focus:border-red-600'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {errors.make && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.make}
            </p>
          )}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Model *
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Hiace"
            className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none ${
              errors.model
                ? 'border-red-500 bg-red-50 focus:border-red-600'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {errors.model && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.model}
            </p>
          )}
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Year *
          </label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none ${
              errors.year
                ? 'border-red-500 bg-red-50 focus:border-red-600'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.year && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.year}
            </p>
          )}
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fuel Type
          </label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="diesel">Diesel</option>
            <option value="petrol">Petrol</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Electric</option>
            <option value="cng">CNG</option>
          </select>
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Mileage (km)
          </label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* VIN */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            VIN (Vehicle Identification Number)
          </label>
          <input
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            placeholder="1G1FB1RX5DL109186"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Registration Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Registration Number
          </label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            placeholder="ABC123DEF456"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Last Service Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Last Service Date
          </label>
          <input
            type="date"
            name="lastServiceDate"
            value={formData.lastServiceDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Next Service Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Next Service Date
          </label>
          <input
            type="date"
            name="nextServiceDate"
            value={formData.nextServiceDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Insurance Expiry */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Insurance Expiry Date
          </label>
          <input
            type="date"
            name="insuranceExpiry"
            value={formData.insuranceExpiry}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-4">📍 Current Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Latitude */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Latitude
            </label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="40.7128"
              step="0.0001"
              min="-90"
              max="90"
              className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none ${
                errors.latitude
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-blue-300 focus:border-blue-600'
              }`}
            />
            {errors.latitude && (
              <p className="text-red-600 text-sm mt-1">{errors.latitude}</p>
            )}
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Longitude
            </label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="-74.0060"
              step="0.0001"
              min="-180"
              max="180"
              className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none ${
                errors.longitude
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-blue-300 focus:border-blue-600'
              }`}
            />
            {errors.longitude && (
              <p className="text-red-600 text-sm mt-1">{errors.longitude}</p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street, New York, NY"
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes about the vehicle..."
          rows="4"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || loading}
          className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
