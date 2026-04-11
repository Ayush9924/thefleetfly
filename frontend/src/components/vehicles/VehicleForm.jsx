import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const FIELDS = [
  { name: 'plateNumber', label: 'Plate Number *', placeholder: 'ABC-1234' },
  { name: 'make', label: 'Make *', placeholder: 'Toyota' },
  { name: 'model', label: 'Model *', placeholder: 'Hiace' },
  { name: 'vin', label: 'VIN', placeholder: '1G1FB1RX5DL...' },
  { name: 'registrationNumber', label: 'Registration No. (Optional)', placeholder: 'ABC123DEF' },
];

const SELECTS = [
  { name: 'status', label: 'Status', opts: ['active', 'inactive', 'maintenance', 'retired'] },
  { name: 'fuelType', label: 'Fuel Type', opts: ['diesel', 'petrol', 'hybrid', 'electric', 'cng'] },
];

const DATES = [
  { name: 'lastServiceDate', label: 'Last Service Date' },
  { name: 'nextServiceDate', label: 'Next Service Date' },
  { name: 'insuranceExpiry', label: 'Insurance Expiry' }
];

export function VehicleForm({ onSubmit, onCancel, initialData = {}, loading = false }) {
  const [formData, setFormData] = useState({
    plateNumber: '', make: '', model: '', year: new Date().getFullYear(),
    status: 'active', fuelType: 'diesel', mileage: 0,
    lastServiceDate: '', nextServiceDate: '', insuranceExpiry: '',
    latitude: '', longitude: '', address: '', vin: '', registrationNumber: '', notes: '',
    ...initialData
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numFields = ['mileage', 'year', 'latitude', 'longitude'];
    setFormData(p => ({ ...p, [name]: numFields.includes(name) ? (value === '' ? '' : Number(value)) : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.plateNumber) e.plateNumber = 'Required';
    if (!formData.make) e.make = 'Required';
    if (!formData.model) e.model = 'Required';
    if (!formData.year || formData.year < 1990 || formData.year > new Date().getFullYear() + 1) e.year = 'Invalid year';
    if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) e.latitude = 'Invalid (-90 to 90)';
    if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) e.longitude = 'Invalid (-180 to 180)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => { e.preventDefault(); if (validate()) onSubmit(formData); };
  const inputClass = (err) => `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition ${err ? 'border-red-500 bg-red-50' : 'border-gray-200'}`;

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map(f => (
          <div key={f.name}>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</label>
            <input name={f.name} value={formData[f.name]} onChange={handleChange} placeholder={f.placeholder} className={inputClass(errors[f.name])} />
            {errors[f.name] && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors[f.name]}</p>}
          </div>
        ))}
        {SELECTS.map(s => (
          <div key={s.name}>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{s.label}</label>
            <select name={s.name} value={formData[s.name]} onChange={handleChange} className={inputClass()}>
              {s.opts.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Year *</label>
          <input type="number" name="year" value={formData.year} onChange={handleChange} className={inputClass(errors.year)} />
          {errors.year && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.year}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Mileage (km)</label>
          <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} className={inputClass()} />
        </div>
        {DATES.map(d => (
          <div key={d.name}>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{d.label}</label>
            <input type="date" name={d.name} value={formData[d.name]} onChange={handleChange} className={inputClass()} />
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-3">📍 Location Override (Optional)</h3>
        <div className="grid grid-cols-2 gap-4">
          {['latitude', 'longitude'].map(l => (
            <div key={l}>
              <label className="block text-xs font-semibold text-gray-700 mb-1 capitalize">{l}</label>
              <input type="number" step="0.0001" name={l} value={formData[l]} onChange={handleChange} className={inputClass(errors[l])} />
              {errors[l] && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors[l]}</p>}
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
            <input name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St..." className={inputClass()} />
          </div>
        </div>
      </div>

      <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional notes about the vehicle..." rows="2" className={inputClass()} />

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
          {loading ? 'Saving...' : 'Save Vehicle'}
        </button>
        <button type="button" onClick={onCancel} disabled={loading} className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">
          Cancel
        </button>
      </div>
    </form>
  );
}



